const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Phục vụ file tĩnh từ thư mục public
app.use(express.static('public'));

// Lưu trữ các phòng đang hoạt động
// rooms = { "ABCD": { players: [{id, name, isHost}], started: false } }
const rooms = {};

// Tạo mã phòng ngẫu nhiên 4 chữ cái
function taoMaPhong() {
  const ky_tu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ma = '';
  for (let i = 0; i < 4; i++) {
    ma += ky_tu[Math.floor(Math.random() * ky_tu.length)];
  }
  return ma;
}

io.on('connection', (socket) => {
  console.log(`✅ Người chơi kết nối: ${socket.id}`);

  // ── TẠO PHÒNG ──────────────────────────────────────────
  socket.on('tao_phong', ({ ten }) => {
    let maPhong;
    // Đảm bảo mã phòng không trùng
    do { maPhong = taoMaPhong(); } while (rooms[maPhong]);

    rooms[maPhong] = {
      players: [{ id: socket.id, ten, isHost: true }],
      started: false,
    };

    socket.join(maPhong);
    socket.maPhong = maPhong;
    socket.ten = ten;

    socket.emit('vao_phong_thanh_cong', {
      maPhong,
      players: rooms[maPhong].players,
      isHost: true,
    });

    console.log(`🏠 Phòng ${maPhong} được tạo bởi ${ten}`);
  });

  // ── VÀO PHÒNG ──────────────────────────────────────────
  socket.on('vao_phong', ({ ten, maPhong }) => {
    const phong = rooms[maPhong];

    if (!phong) {
      return socket.emit('loi', 'Phòng không tồn tại!');
    }
    if (phong.started) {
      return socket.emit('loi', 'Ván đấu đã bắt đầu, không thể vào!');
    }
    if (phong.players.length >= 12) {
      return socket.emit('loi', 'Phòng đã đầy (tối đa 12 người)!');
    }
    if (phong.players.find(p => p.ten === ten)) {
      return socket.emit('loi', 'Tên này đã có người dùng trong phòng!');
    }

    phong.players.push({ id: socket.id, ten, isHost: false });
    socket.join(maPhong);
    socket.maPhong = maPhong;
    socket.ten = ten;

    // Báo người chơi mới về phòng thành công
    socket.emit('vao_phong_thanh_cong', {
      maPhong,
      players: phong.players,
      isHost: false,
    });

    // Báo tất cả người khác trong phòng
    socket.to(maPhong).emit('nguoi_choi_moi', {
      players: phong.players,
      ten,
    });

    console.log(`👤 ${ten} vào phòng ${maPhong} (${phong.players.length} người)`);
  });

  // ── BẮT ĐẦU GAME (chỉ host) ───────────────────────────
  socket.on('bat_dau_game', () => {
    const maPhong = socket.maPhong;
    const phong = rooms[maPhong];

    if (!phong) return;

    const player = phong.players.find(p => p.id === socket.id);
    if (!player?.isHost) {
      return socket.emit('loi', 'Chỉ chủ phòng mới có thể bắt đầu!');
    }
    if (phong.players.length < 4) {
      return socket.emit('loi', 'Cần ít nhất 4 người để bắt đầu!');
    }

    phong.started = true;

    // Phát vai ngẫu nhiên
    const vaiTro = phatVai(phong.players.length);
    const danhSachVai = [...vaiTro].sort(() => Math.random() - 0.5);

    phong.players.forEach((player, i) => {
      player.vai = danhSachVai[i];
    });

    // Gửi vai cho từng người riêng tư
    phong.players.forEach(player => {
      io.to(player.id).emit('nhan_vai', { vai: player.vai });
    });

    // Báo tất cả game bắt đầu
    io.to(maPhong).emit('game_bat_dau', {
      players: phong.players.map(p => ({ id: p.id, ten: p.ten })), // không kèm vai
    });

    console.log(`🎮 Game phòng ${maPhong} bắt đầu với ${phong.players.length} người`);
  });

  // ── CHAT ──────────────────────────────────────────────
  socket.on('gui_tin_nhan', ({ noiDung }) => {
    const maPhong = socket.maPhong;
    if (!maPhong || !noiDung.trim()) return;

    io.to(maPhong).emit('tin_nhan_moi', {
      ten: socket.ten,
      noiDung: noiDung.trim(),
      thoiGian: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
  });

  // ── NGẮT KẾT NỐI ──────────────────────────────────────
  socket.on('disconnect', () => {
    const maPhong = socket.maPhong;
    if (!maPhong || !rooms[maPhong]) return;

    const phong = rooms[maPhong];
    const vitri = phong.players.findIndex(p => p.id === socket.id);
    if (vitri === -1) return;

    const ten = phong.players[vitri].ten;
    const laHost = phong.players[vitri].isHost;
    phong.players.splice(vitri, 1);

    if (phong.players.length === 0) {
      // Xóa phòng nếu không còn ai
      delete rooms[maPhong];
      console.log(`🗑️  Phòng ${maPhong} đã bị xóa`);
    } else {
      // Nếu host rời, chuyển host cho người tiếp theo
      if (laHost) {
        phong.players[0].isHost = true;
        io.to(phong.players[0].id).emit('tro_thanh_host');
      }
      io.to(maPhong).emit('nguoi_choi_roi', { ten, players: phong.players });
    }

    console.log(`❌ ${ten} rời phòng ${maPhong}`);
  });
});

// Phân chia vai trò theo số người
function phatVai(soNguoi) {
  const soMaSoi = Math.max(1, Math.floor(soNguoi / 4));
  const vai = [];

  // Luôn có 1 Thầy Lang và 1 Tiên tri
  vai.push('🧙 Thầy Lang');
  vai.push('🔮 Tiên Tri');

  for (let i = 0; i < soMaSoi; i++) vai.push('🐺 Ma Sói');
  while (vai.length < soNguoi) vai.push('🧑 Dân Làng');

  return vai;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server Ma Sói đang chạy tại http://localhost:${PORT}\n`);
});