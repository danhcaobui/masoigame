const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// ═══════════════════════════════════════════════════════
// ĐỊNH NGHĨA TẤT CẢ VAI TRÒ
// ═══════════════════════════════════════════════════════
const VAI_TRO = {
  // ── PHE DÂN LÀNG ──────────────────────────────────
  'Dân làng':          { phe: 'dan', icon: '🧑', mo_ta: 'Tìm và tiêu diệt ma sói vào ban ngày.' },
  'Tiên tri':          { phe: 'dan', icon: '🔮', mo_ta: 'Mỗi đêm được biết danh tính thực sự của một người.' },
  'Phù thủy':          { phe: 'dan', icon: '🧙', mo_ta: 'Có một bình thuốc cứu và một bình thuốc giết, mỗi loại dùng một lần.' },
  'Vệ sĩ':             { phe: 'dan', icon: '🛡️', mo_ta: 'Bảo vệ một người khỏi bị giết mỗi đêm.' },
  'Thợ săn':           { phe: 'dan', icon: '🏹', mo_ta: 'Khi chết có thể kéo theo một người khác chết cùng.' },
  'Thần tình yêu':     { phe: 'dan', icon: '💘', mo_ta: 'Đêm đầu chọn hai người làm tình nhân; nếu một chết, người kia chết theo.' },
  'Tiên tri tập sự':   { phe: 'dan', icon: '🌙', mo_ta: 'Trở thành Tiên tri mới nếu Tiên tri bị giết.' },
  'Tiên tri hào quang':{ phe: 'dan', icon: '✨', mo_ta: 'Đêm tìm kiếm người thuộc phe dân làng hoặc phe sói.' },
  'Beholder':          { phe: 'dan', icon: '👁️', mo_ta: 'Được biết ai là Tiên tri vào đêm đầu tiên.' },
  'Vệ sĩ thân cận':   { phe: 'dan', icon: '⚔️', mo_ta: 'Bảo vệ một người trở nên bất tử vào ban đêm (Linh mục).' },
  'Hoàng tử':          { phe: 'dan', icon: '👑', mo_ta: 'Không thể bị giết vào ban ngày.' },
  'Thị trưởng':        { phe: 'dan', icon: '🎖️', mo_ta: 'Phiếu bầu tính gấp đôi nếu tự tiết lộ bản thân.' },
  'Thám tử':           { phe: 'dan', icon: '🔍', mo_ta: 'Kiểm tra một người: biết người đó hoặc hai người bên cạnh có phải sói không.' },
  'Thầy bói':          { phe: 'dan', icon: '🎴', mo_ta: 'Biết chính xác vai trò của người được kiểm tra.' },
  'Sinh đôi':          { phe: 'dan', icon: '👯', mo_ta: 'Thức dậy cùng nhau đêm đầu để nhận diện đồng đội (2 người).' },
  'Người hoá sói':     { phe: 'dan', icon: '🐺', mo_ta: 'Là dân làng nhưng khi bị soi ra kết quả là ma sói.' },
  'Mất ngủ':           { phe: 'dan', icon: '😴', mo_ta: 'Biết ít nhất một hàng xóm có thức dậy trong đêm không.' },
  'Người bệnh':        { phe: 'dan', icon: '🤒', mo_ta: 'Nếu bị sói tấn công, sói không thể ăn thịt đêm tiếp theo.' },
  'Tough Guy':         { phe: 'dan', icon: '💪', mo_ta: 'Sống sót thêm một ngày sau khi bị sói tấn công.' },
  'Cô bé':             { phe: 'dan', icon: '👧', mo_ta: 'Có thể lén nhìn khi sói thức dậy, nhưng chết nếu bị phát hiện.' },
  'Kẻ gây rối':        { phe: 'dan', icon: '🎭', mo_ta: 'Có hai lần bỏ phiếu treo cổ trong một ngày (dùng một lần duy nhất).' },
  'Người phù phép':    { phe: 'dan', icon: '🪄', mo_ta: 'Cấm một người không được nói chuyện vào ngày hôm sau.' },
  'Phù thuỷ già':      { phe: 'dan', icon: '🧓', mo_ta: 'Chọn một người phải rời làng (không tham gia thảo luận/biểu quyết) ngày hôm sau.' },
  'Bá tước':           { phe: 'dan', icon: '🧛', mo_ta: 'Biết số lượng ma sói ở mỗi nửa ngôi làng vào đêm đầu.' },
  'Doppelgänger':      { phe: 'dan', icon: '🪞', mo_ta: 'Chọn một người và đảm nhận vai trò của họ nếu họ chết.' },
  'Kẻ say rượu':       { phe: 'dan', icon: '🍺', mo_ta: 'Là dân làng đến đêm thứ ba, sau đó rút thăm nhận vai thực sự.' },
  'Nostradamus':       { phe: 'dan', icon: '🌠', mo_ta: 'Dự đoán đội thắng đêm đầu; thắng một mình nếu đoán đúng và còn sống.' },
  'Chupacabra':        { phe: 'dan', icon: '👾', mo_ta: 'Mỗi đêm chọn một người; nếu là sói thì sói chết. Khi sói hết, giết một người mỗi đêm.' },
  'Yêu tinh':          { phe: 'dan', icon: '🍀', mo_ta: 'Chuyển hướng cuộc tấn công của sói sang người ngồi gần nạn nhân.' },
  'Con ma':            { phe: 'dan', icon: '👻', mo_ta: 'Chết đêm đầu và để lại thông điệp gợi ý mỗi đêm.' },
  'Đứa con hoang':     { phe: 'dan', icon: '🌀', mo_ta: 'Chọn một "hình mẫu"; nếu hình mẫu chết, trở thành ma sói.' },
  'Sasquatch':         { phe: 'dan', icon: '🦶', mo_ta: 'Trở thành ma sói nếu có một đêm sói không giết ai.' },
  'Bloody Mary':       { phe: 'dan', icon: '🩸', mo_ta: 'Nếu chết sẽ giết một người trong đội đã giết mình mỗi đêm.' },
  'Liệt sĩ':          { phe: 'dan', icon: '🎗️', mo_ta: 'Thế chỗ của một người bị giết trước khi vai trò được tiết lộ.' },

  // ── PHE SÓI ───────────────────────────────────────
  'Ma sói':            { phe: 'soi', icon: '🐺', mo_ta: 'Thức dậy mỗi đêm cùng thống nhất giết một nạn nhân.' },
  'Pháp sư':           { phe: 'soi', icon: '🔯', mo_ta: 'Thuộc phe sói, có năng lực soi vai trò như Tiên tri.' },
  'Kẻ phản bội':       { phe: 'soi', icon: '🗡️', mo_ta: 'Biết ai là sói và hỗ trợ chúng, nhưng khi bị soi vẫn hiện là dân làng.' },
  'Sói con':           { phe: 'soi', icon: '🐾', mo_ta: 'Nếu sói con chết, đêm sau bầy sói được giết hai người.' },
  'White Wolf':        { phe: 'soi', icon: '🤍', mo_ta: 'Thức dậy cùng sói, cách một đêm có thể thức dậy riêng giết dân làng. Thắng nếu là người sống sót duy nhất.' },
  'Ma sói trong mơ':   { phe: 'soi', icon: '💤', mo_ta: 'Chỉ thức dậy hoạt động sau khi có một con ma sói khác chết.' },
  'Kẻ bị nguyền rủa':  { phe: 'soi', icon: '😈', mo_ta: 'Ban đầu là dân làng, hóa sói nếu bị ma sói tấn công.' },
  'Lone Wolf':         { phe: 'soi', icon: '🌕', mo_ta: 'Chỉ thắng nếu là thành viên cuối cùng của đội sói còn sống.' },
  'Dire Wolf':         { phe: 'soi', icon: '🦴', mo_ta: 'Chọn một người bạn đồng hành; nếu người đó chết, Dire Wolf chết theo.' },
  'Black Wolf':        { phe: 'soi', icon: '🖤', mo_ta: 'Có năng lực của người phù phép nhưng thuộc phe sói.' },
  'Sói ăn chay':       { phe: 'soi', icon: '🥦', mo_ta: 'Nếu là con sói cuối cùng, không ăn thịt dân làng mà loại bỏ họ theo cách khác.' },

  // ── PHE THỨ 3 ─────────────────────────────────────
  'Tanner':            { phe: 'khac', icon: '🪢', mo_ta: 'Chỉ thắng nếu bị dân làng treo cổ.' },
  'Ma cà rồng':        { phe: 'khac', icon: '🧛', mo_ta: 'Tấn công người chơi mỗi đêm và chết nếu bị đề cử ngày hôm sau.' },
  'Trưởng giáo phái':  { phe: 'khac', icon: '📿', mo_ta: 'Thêm một người vào giáo phái mỗi đêm; thắng khi tất cả thuộc giáo phái.' },
  'Hoodlum':           { phe: 'khac', icon: '🎯', mo_ta: 'Chọn hai người đêm đầu; thắng nếu hai người đó chết và mình còn sống.' },
};

// Thứ tự gọi ban đêm
const THU_TU_DEM = [
  'Thần tình yêu', 'Beholder', 'Sinh đôi', 'Nostradamus', 'Bá tước',
  'Doppelgänger', 'Con ma', 'Hoodlum', 'Trưởng giáo phái',
  'Cô bé',
  'Ma sói', 'White Wolf', 'Ma sói trong mơ', 'Sói ăn chay',
  'Pháp sư', 'Black Wolf',
  'Ma cà rồng',
  'Chupacabra', 'Yêu tinh',
  'Phù thủy', 'Vệ sĩ', 'Linh mục', 'Tiên tri', 'Tiên tri hào quang',
  'Tiên tri tập sự', 'Thám tử', 'Thầy bói', 'Mất ngủ',
  'Phù thuỷ già', 'Người phù phép', 'Kẻ gây rối',
  'Kẻ say rượu',
];

// ═══════════════════════════════════════════════════════
// PHÂN VAI THEO SỐ NGƯỜI
// ═══════════════════════════════════════════════════════
function tinhSoVai(soNguoi) {
  let soSoi, soPhe3;
  if (soNguoi <= 6)       { soSoi = 1; soPhe3 = 0; }
  else if (soNguoi <= 9)  { soSoi = 2; soPhe3 = 1; }
  else if (soNguoi <= 12) { soSoi = 3; soPhe3 = 1; }
  else if (soNguoi <= 16) { soSoi = 4; soPhe3 = 1; }
  else if (soNguoi <= 22) { soSoi = 5; soPhe3 = 2; }
  else if (soNguoi <= 30) { soSoi = 7; soPhe3 = 2; }
  else if (soNguoi <= 40) { soSoi = 9; soPhe3 = 3; }
  else                    { soSoi = 11; soPhe3 = 3; }
  return { soSoi, soPhe3, soDan: soNguoi - soSoi - soPhe3 };
}

function phatVaiNgauNhien(soNguoi) {
  const { soSoi, soPhe3, soDan } = tinhSoVai(soNguoi);

  const danhSachSoi  = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'soi');
  const danhSachPhe3 = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'khac');
  const danhSachDan  = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'dan' && v !== 'Dân làng');

  const tron = arr => arr.sort(() => Math.random() - 0.5);

  // Luôn có Ma sói, còn lại random trong phe sói
  const soiChon = ['Ma sói', ...tron(danhSachSoi.filter(v => v !== 'Ma sói')).slice(0, soSoi - 1)];
  const phe3Chon = tron(danhSachPhe3).slice(0, soPhe3);

  // Dân đặc biệt: ưu tiên Tiên tri, Phù thủy, Vệ sĩ
  const danUuTien = ['Tiên tri', 'Phù thủy', 'Vệ sĩ'];
  const danCon = tron(danhSachDan.filter(v => !danUuTien.includes(v)));
  const soDanDacBiet = Math.min(soDan - 1, danUuTien.length);
  const danChon = [
    ...danUuTien.slice(0, soDanDacBiet),
    ...danCon.slice(0, soDan - soDanDacBiet - 1),
    'Dân làng', // luôn có ít nhất 1 dân thường
  ];

  return tron([...soiChon, ...phe3Chon, ...danChon]).slice(0, soNguoi);
}

// ═══════════════════════════════════════════════════════
// QUẢN LÝ PHÒNG
// ═══════════════════════════════════════════════════════
const rooms = {};

function taoMaPhong() {
  const ky = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ma = '';
  for (let i = 0; i < 4; i++) ma += ky[Math.floor(Math.random() * ky.length)];
  return ma;
}

function layPhong(maPhong) { return rooms[maPhong]; }

function thongBaoPhong(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;
  io.to(maPhong).emit('cap_nhat_phong', {
    players: phong.players.map(p => ({
      id: p.id, ten: p.ten, isHost: p.isHost,
      ready: p.ready, song: p.song,
    })),
    soNguoi: phong.players.length,
    trangThai: phong.trangThai,
    vong: phong.vong,
    ngay: phong.ngay,
  });
}

// ═══════════════════════════════════════════════════════
// LOGIC GAME
// ═══════════════════════════════════════════════════════

// Gửi thông báo hệ thống đến phòng
function heThong(maPhong, msg, loai = 'info') {
  io.to(maPhong).emit('tin_nhan_he_thong', { msg, loai });
}

// Gửi thông báo riêng cho một socket
function riengTu(socketId, event, data) {
  io.to(socketId).emit(event, data);
}

// Lấy danh sách người còn sống
function nguoiSong(phong) {
  return phong.players.filter(p => p.song);
}

// Kiểm tra điều kiện thắng thua
function kiemTraThang(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;

  const song = nguoiSong(phong);
  const soiSong = song.filter(p => VAI_TRO[p.vai]?.phe === 'soi');
  const danSong  = song.filter(p => VAI_TRO[p.vai]?.phe === 'dan');
  const phe3Song = song.filter(p => VAI_TRO[p.vai]?.phe === 'khac');

  // Kiểm tra Tanner thắng (đã bị treo cổ)
  const tannerThang = phong.tannerThang;
  if (tannerThang) {
    ketThuc(maPhong, 'Tanner', [tannerThang]);
    return true;
  }

  // Lone Wolf thắng nếu là sói cuối cùng
  const loneWolf = song.find(p => p.vai === 'Lone Wolf');
  if (loneWolf && soiSong.length === 1) {
    ketThuc(maPhong, 'Lone Wolf', [loneWolf.ten]);
    return true;
  }

  // White Wolf thắng nếu là người sống sót duy nhất
  const whiteWolf = song.find(p => p.vai === 'White Wolf');
  if (whiteWolf && song.length === 1) {
    ketThuc(maPhong, 'White Wolf', [whiteWolf.ten]);
    return true;
  }

  // Phe sói thắng khi >= dân
  if (soiSong.length >= danSong.length + phe3Song.length && soiSong.length > 0) {
    const nguoiThang = soiSong.map(p => p.ten);
    ketThuc(maPhong, 'soi', nguoiThang);
    return true;
  }

  // Dân thắng khi hết sói
  if (soiSong.length === 0 && song.length > 0) {
    // Kiểm tra Hoodlum
    const hoodlum = phong.players.find(p => p.vai === 'Hoodlum' && p.song);
    if (hoodlum && phong.hoodlumMucTieu?.every(id => {
      const p = phong.players.find(x => x.id === id);
      return p && !p.song;
    })) {
      ketThuc(maPhong, 'Hoodlum', [hoodlum.ten]);
      return true;
    }
    const nguoiThang = danSong.map(p => p.ten);
    ketThuc(maPhong, 'dan', nguoiThang);
    return true;
  }

  // Trưởng giáo phái thắng khi tất cả thuộc giáo phái
  const truongGP = phong.players.find(p => p.vai === 'Trưởng giáo phái' && p.song);
  if (truongGP && song.every(p => phong.giaoPhaiIds?.includes(p.id))) {
    ketThuc(maPhong, 'Trưởng giáo phái', [truongGP.ten]);
    return true;
  }

  return false;
}

function ketThuc(maPhong, pheThang, nguoiThang) {
  const phong = layPhong(maPhong);
  if (!phong) return;
  phong.trangThai = 'ket_thuc';

  const tenPhe = {
    'dan': '🧑 Phe Dân Làng',
    'soi': '🐺 Phe Ma Sói',
    'Tanner': '🪢 Tanner',
    'Lone Wolf': '🌕 Lone Wolf',
    'White Wolf': '🤍 White Wolf',
    'Hoodlum': '🎯 Hoodlum',
    'Trưởng giáo phái': '📿 Giáo Phái',
    'Nostradamus': '🌠 Nostradamus',
  };

  io.to(maPhong).emit('game_ket_thuc', {
    pheThang,
    tenPhe: tenPhe[pheThang] || pheThang,
    nguoiThang,
    tatCaVai: phong.players.map(p => ({ ten: p.ten, vai: p.vai, icon: VAI_TRO[p.vai]?.icon || '❓' })),
  });
}

// ── Bắt đầu vòng đêm ──────────────────────────────────
async function batDauDem(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;

  phong.trangThai = 'dem';
  phong.hanhDongDem = {};
  phong.nguoiBiGiet = null;
  phong.nguoiDuocCuu = null;
  phong.nguoiBiDoc = null;
  phong.soiKhongGiet = false;

  heThong(maPhong, `🌙 Đêm thứ ${phong.ngay} bắt đầu. Cả làng chìm vào giấc ngủ...`, 'dem');
  thongBaoPhong(maPhong);

  // Gọi từng vai theo thứ tự
  await xuLyDem(maPhong);
}

async function xuLyDem(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;

  const song = nguoiSong(phong);

  // --- Thần tình yêu (chỉ đêm 1) ---
  if (phong.ngay === 1) {
    const cupid = song.find(p => p.vai === 'Thần tình yêu');
    if (cupid) {
      riengTu(cupid.id, 'yeu_cau_hanh_dong', {
        vai: 'Thần tình yêu', icon: '💘',
        huongDan: 'Chọn hai người làm tình nhân. Nếu một người chết, người kia sẽ chết theo.',
        danhSach: song.filter(p => p.id !== cupid.id).map(p => ({ id: p.id, ten: p.ten })),
        soChon: 2, maPhong,
      });
      await doiHanhDong(maPhong, cupid.id, 30000);
    }

    // --- Sinh đôi ---
    const sinhDoi = song.filter(p => p.vai === 'Sinh đôi');
    if (sinhDoi.length >= 2) {
      sinhDoi.forEach(p => {
        riengTu(p.id, 'thong_tin_rieng', {
          tieuDe: '👯 Sinh Đôi',
          noidung: `Người sinh đôi của bạn là: ${sinhDoi.filter(x => x.id !== p.id).map(x => x.ten).join(', ')}`,
        });
      });
    }

    // --- Beholder ---
    const beholder = song.find(p => p.vai === 'Beholder');
    const tienTri = song.find(p => p.vai === 'Tiên tri');
    if (beholder && tienTri) {
      riengTu(beholder.id, 'thong_tin_rieng', {
        tieuDe: '👁️ Beholder',
        noidung: `Tiên tri của làng là: ${tienTri.ten}`,
      });
    }

    // --- Bá tước ---
    const baTuoc = song.find(p => p.vai === 'Bá tước');
    if (baTuoc) {
      const nua = Math.floor(song.length / 2);
      const nua1 = song.slice(0, nua).filter(p => VAI_TRO[p.vai]?.phe === 'soi').length;
      const nua2 = song.slice(nua).filter(p => VAI_TRO[p.vai]?.phe === 'soi').length;
      riengTu(baTuoc.id, 'thong_tin_rieng', {
        tieuDe: '🧛 Bá Tước',
        noidung: `Nửa đầu làng có ${nua1} ma sói. Nửa sau có ${nua2} ma sói.`,
      });
    }

    // --- Hoodlum ---
    const hoodlum = song.find(p => p.vai === 'Hoodlum');
    if (hoodlum) {
      riengTu(hoodlum.id, 'yeu_cau_hanh_dong', {
        vai: 'Hoodlum', icon: '🎯',
        huongDan: 'Chọn hai người mục tiêu. Bạn thắng nếu cả hai chết và bạn còn sống.',
        danhSach: song.filter(p => p.id !== hoodlum.id).map(p => ({ id: p.id, ten: p.ten })),
        soChon: 2, maPhong,
      });
      const kq = await doiHanhDong(maPhong, hoodlum.id, 30000);
      if (kq) phong.hoodlumMucTieu = kq;
    }

    // --- Doppelganger ---
    const doppel = song.find(p => p.vai === 'Doppelgänger');
    if (doppel) {
      riengTu(doppel.id, 'yeu_cau_hanh_dong', {
        vai: 'Doppelgänger', icon: '🪞',
        huongDan: 'Chọn một người. Bạn sẽ đảm nhận vai trò của họ nếu họ chết.',
        danhSach: song.filter(p => p.id !== doppel.id).map(p => ({ id: p.id, ten: p.ten })),
        soChon: 1, maPhong,
      });
      const kq = await doiHanhDong(maPhong, doppel.id, 30000);
      if (kq) phong.doppelTarget = kq[0];
    }

    // --- Con ma (chết đêm đầu) ---
    const conMa = song.find(p => p.vai === 'Con ma');
    if (conMa) {
      conMa.song = false;
      heThong(maPhong, `👻 Con ma đã hiện hồn trong đêm đầu tiên...`, 'dem');
    }

    // --- Trưởng giáo phái khởi tạo ---
    const truongGP = song.find(p => p.vai === 'Trưởng giáo phái');
    if (truongGP) phong.giaoPhaiIds = [truongGP.id];
  }

  // --- Cô bé theo dõi ---
  const coBe = song.find(p => p.vai === 'Cô bé');
  if (coBe) {
    riengTu(coBe.id, 'thong_tin_rieng', {
      tieuDe: '👧 Cô Bé',
      noidung: 'Bạn đang lén nhìn... Chú ý không bị phát hiện!',
    });
  }

  // --- Ma sói chọn nạn nhân ---
  const boiSoi = song.filter(p => ['Ma sói', 'Sói con', 'Lone Wolf', 'Dire Wolf', 'Kẻ bị nguyền rủa', 'Sasquatch', 'Đứa con hoang'].includes(p.vai) ||
    (p.vai === 'Ma sói trong mơ' && phong.soiDaChet) ||
    (p.vai === 'White Wolf'));

  if (boiSoi.length > 0 && !phong.soiKhongGiet) {
    const mucTieuHopLe = song.filter(p => VAI_TRO[p.vai]?.phe !== 'soi').map(p => ({ id: p.id, ten: p.ten }));
    // Thông báo cho bầy sói biết nhau
    boiSoi.forEach(p => {
      riengTu(p.id, 'thong_tin_soi', {
        boiSoi: boiSoi.map(x => x.ten),
      });
      riengTu(p.id, 'yeu_cau_hanh_dong', {
        vai: p.vai, icon: VAI_TRO[p.vai]?.icon,
        huongDan: 'Bầy sói: Chọn nạn nhân đêm nay. Bình chọn sẽ được tổng hợp.',
        danhSach: mucTieuHopLe,
        soChon: 1, maPhong, loai: 'soi_giet',
      });
    });
    // Đợi bình chọn sói (30s)
    await new Promise(r => setTimeout(r, 30000));
    // Chọn nạn nhân được nhiều phiếu nhất
    const phieu = phong.phieuSoi || {};
    const demPhieu = {};
    Object.values(phieu).forEach(id => { demPhieu[id] = (demPhieu[id] || 0) + 1; });
    const nanNhan = Object.entries(demPhieu).sort((a, b) => b[1] - a[1])[0];
    if (nanNhan) {
      phong.nguoiBiGiet = nanNhan[0];
      // Cô bé có thể bị phát hiện
      if (coBe && Math.random() < 0.3) {
        phong.nguoiBiGiet = coBe.id;
        heThong(maPhong, '👧 Sói đã phát hiện Cô Bé đang nhìn trộm!', 'nguy');
      }
    }
    phong.phieuSoi = {};
  }

  // --- White Wolf giết riêng (cách đêm) ---
  const whiteWolf = song.find(p => p.vai === 'White Wolf');
  if (whiteWolf && phong.ngay % 2 === 0) {
    riengTu(whiteWolf.id, 'yeu_cau_hanh_dong', {
      vai: 'White Wolf', icon: '🤍',
      huongDan: 'Đêm này bạn có thể giết thêm một dân làng.',
      danhSach: song.filter(p => p.id !== whiteWolf.id && VAI_TRO[p.vai]?.phe !== 'soi').map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'white_wolf',
    });
    await doiHanhDong(maPhong, whiteWolf.id, 20000);
  }

  // --- Pháp sư / Black Wolf soi ---
  const phapSu = song.find(p => p.vai === 'Pháp sư' || p.vai === 'Black Wolf');
  if (phapSu) {
    riengTu(phapSu.id, 'yeu_cau_hanh_dong', {
      vai: phapSu.vai, icon: VAI_TRO[phapSu.vai]?.icon,
      huongDan: 'Chọn một người để soi vai trò.',
      danhSach: song.filter(p => p.id !== phapSu.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'soi_vai',
    });
    const kq = await doiHanhDong(maPhong, phapSu.id, 25000);
    if (kq) {
      const nguoiSoi = phong.players.find(p => p.id === kq[0]);
      if (nguoiSoi) {
        riengTu(phapSu.id, 'ket_qua_soi', {
          ten: nguoiSoi.ten,
          laSoi: VAI_TRO[nguoiSoi.vai]?.phe === 'soi',
          vai: nguoiSoi.vai,
        });
      }
    }
  }

  // --- Ma cà rồng ---
  const maCaRong = song.find(p => p.vai === 'Ma cà rồng');
  if (maCaRong) {
    riengTu(maCaRong.id, 'yeu_cau_hanh_dong', {
      vai: 'Ma cà rồng', icon: '🧛',
      huongDan: 'Chọn một người để tấn công đêm nay.',
      danhSach: song.filter(p => p.id !== maCaRong.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'macaRong_tan_cong',
    });
    await doiHanhDong(maPhong, maCaRong.id, 25000);
  }

  // --- Chupacabra ---
  const chupa = song.find(p => p.vai === 'Chupacabra');
  if (chupa) {
    const soiConLai = song.filter(p => VAI_TRO[p.vai]?.phe === 'soi');
    if (soiConLai.length === 0) {
      riengTu(chupa.id, 'yeu_cau_hanh_dong', {
        vai: 'Chupacabra', icon: '👾',
        huongDan: 'Sói đã bị diệt hết! Chọn một người để giết.',
        danhSach: song.filter(p => p.id !== chupa.id).map(p => ({ id: p.id, ten: p.ten })),
        soChon: 1, maPhong, loai: 'chupa_giet',
      });
      await doiHanhDong(maPhong, chupa.id, 25000);
    } else {
      riengTu(chupa.id, 'yeu_cau_hanh_dong', {
        vai: 'Chupacabra', icon: '👾',
        huongDan: 'Chọn một người. Nếu là sói, sói sẽ chết!',
        danhSach: song.filter(p => p.id !== chupa.id).map(p => ({ id: p.id, ten: p.ten })),
        soChon: 1, maPhong, loai: 'chupa_kiem_tra',
      });
      const kq = await doiHanhDong(maPhong, chupa.id, 25000);
      if (kq) {
        const target = phong.players.find(p => p.id === kq[0]);
        if (target && VAI_TRO[target.vai]?.phe === 'soi') {
          target.song = false;
          heThong(maPhong, `👾 Chupacabra phát hiện và tiêu diệt ${target.ten} (${target.vai})!`, 'nguy');
        }
      }
    }
  }

  // --- Phù thủy ---
  const phuThuy = song.find(p => p.vai === 'Phù thủy');
  if (phuThuy && (phuThuy.thuocCuu || phuThuy.thuocGiet)) {
    riengTu(phuThuy.id, 'yeu_cau_phu_thuy', {
      nguoiBiGiet: phong.nguoiBiGiet ? phong.players.find(p => p.id === phong.nguoiBiGiet)?.ten : null,
      coThuocCuu: phuThuy.thuocCuu !== false,
      coThuocGiet: phuThuy.thuocGiet !== false,
      danhSach: song.map(p => ({ id: p.id, ten: p.ten })),
      maPhong,
    });
    await doiHanhDong(maPhong, phuThuy.id, 30000);
  }

  // --- Vệ sĩ ---
  const veSi = song.find(p => p.vai === 'Vệ sĩ');
  if (veSi) {
    riengTu(veSi.id, 'yeu_cau_hanh_dong', {
      vai: 'Vệ sĩ', icon: '🛡️',
      huongDan: 'Chọn một người để bảo vệ đêm nay.',
      danhSach: song.map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 've_si_bao_ve',
    });
    const kq = await doiHanhDong(maPhong, veSi.id, 25000);
    if (kq) phong.nguoiDuocBaoVe = kq[0];
  }

  // --- Tiên tri ---
  const tienTri = song.find(p => p.vai === 'Tiên tri');
  if (tienTri) {
    riengTu(tienTri.id, 'yeu_cau_hanh_dong', {
      vai: 'Tiên tri', icon: '🔮',
      huongDan: 'Chọn một người để soi danh tính.',
      danhSach: song.filter(p => p.id !== tienTri.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'tien_tri_soi',
    });
    const kq = await doiHanhDong(maPhong, tienTri.id, 25000);
    if (kq) {
      const nguoiSoiKq = phong.players.find(p => p.id === kq[0]);
      if (nguoiSoiKq) {
        const laSoi = nguoiSoiKq.vai === 'Người hoá sói' ? true : VAI_TRO[nguoiSoiKq.vai]?.phe === 'soi';
        riengTu(tienTri.id, 'ket_qua_soi', {
          ten: nguoiSoiKq.ten,
          laSoi,
          vai: laSoi ? 'Ma Sói' : 'Dân Làng',
        });
      }
    }
  }

  // --- Tiên tri hào quang ---
  const tienTriHQ = song.find(p => p.vai === 'Tiên tri hào quang');
  if (tienTriHQ) {
    riengTu(tienTriHQ.id, 'yeu_cau_hanh_dong', {
      vai: 'Tiên tri hào quang', icon: '✨',
      huongDan: 'Chọn một người để xem hào quang (Dân làng hay Ma sói?).',
      danhSach: song.filter(p => p.id !== tienTriHQ.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'tien_tri_hq',
    });
    const kq = await doiHanhDong(maPhong, tienTriHQ.id, 25000);
    if (kq) {
      const target = phong.players.find(p => p.id === kq[0]);
      if (target) {
        riengTu(tienTriHQ.id, 'ket_qua_soi', {
          ten: target.ten,
          laSoi: VAI_TRO[target.vai]?.phe === 'soi',
          vai: VAI_TRO[target.vai]?.phe === 'soi' ? 'Phe Sói' : 'Phe Dân',
        });
      }
    }
  }

  // --- Thám tử ---
  const thamTu = song.find(p => p.vai === 'Thám tử');
  if (thamTu) {
    riengTu(thamTu.id, 'yeu_cau_hanh_dong', {
      vai: 'Thám tử', icon: '🔍',
      huongDan: 'Chọn một người để điều tra (bản thân hoặc 2 người bên cạnh có sói không?).',
      danhSach: song.filter(p => p.id !== thamTu.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'tham_tu',
    });
    const kq = await doiHanhDong(maPhong, thamTu.id, 25000);
    if (kq) {
      const idx = song.findIndex(p => p.id === kq[0]);
      const nhom = [song[idx - 1], song[idx], song[idx + 1]].filter(Boolean);
      const coSoi = nhom.some(p => VAI_TRO[p.vai]?.phe === 'soi');
      riengTu(thamTu.id, 'ket_qua_soi', {
        ten: song[idx]?.ten,
        laSoi: coSoi,
        vai: coSoi ? 'Có sói trong nhóm!' : 'Không có sói',
      });
    }
  }

  // --- Thầy bói ---
  const thayBoi = song.find(p => p.vai === 'Thầy bói');
  if (thayBoi) {
    riengTu(thayBoi.id, 'yeu_cau_hanh_dong', {
      vai: 'Thầy bói', icon: '🎴',
      huongDan: 'Chọn một người để biết chính xác vai trò.',
      danhSach: song.filter(p => p.id !== thayBoi.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'thay_boi',
    });
    const kq = await doiHanhDong(maPhong, thayBoi.id, 25000);
    if (kq) {
      const target = phong.players.find(p => p.id === kq[0]);
      if (target) {
        riengTu(thayBoi.id, 'ket_qua_soi', {
          ten: target.ten,
          laSoi: VAI_TRO[target.vai]?.phe === 'soi',
          vai: target.vai,
        });
      }
    }
  }

  // --- Trưởng giáo phái ---
  const truongGP = song.find(p => p.vai === 'Trưởng giáo phái');
  if (truongGP) {
    const chuaVaoGP = song.filter(p => !phong.giaoPhaiIds?.includes(p.id) && p.id !== truongGP.id);
    if (chuaVaoGP.length > 0) {
      riengTu(truongGP.id, 'yeu_cau_hanh_dong', {
        vai: 'Trưởng giáo phái', icon: '📿',
        huongDan: 'Chọn một người để thêm vào giáo phái.',
        danhSach: chuaVaoGP.map(p => ({ id: p.id, ten: p.ten })),
        soChon: 1, maPhong, loai: 'giao_phai',
      });
      const kq = await doiHanhDong(maPhong, truongGP.id, 25000);
      if (kq) {
        if (!phong.giaoPhaiIds) phong.giaoPhaiIds = [truongGP.id];
        phong.giaoPhaiIds.push(kq[0]);
      }
    }
  }

  // --- Phù thuỷ già & Người phù phép ---
  const phuThuyGia = song.find(p => p.vai === 'Phù thuỷ già');
  if (phuThuyGia) {
    riengTu(phuThuyGia.id, 'yeu_cau_hanh_dong', {
      vai: 'Phù thuỷ già', icon: '🧓',
      huongDan: 'Chọn một người phải rời làng ngày mai (không được thảo luận/biểu quyết).',
      danhSach: song.filter(p => p.id !== phuThuyGia.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'roi_lang',
    });
    const kq = await doiHanhDong(maPhong, phuThuyGia.id, 25000);
    if (kq) phong.nguoiRoiLang = kq[0];
  }

  const nguoiPhuPhep = song.find(p => p.vai === 'Người phù phép');
  if (nguoiPhuPhep) {
    riengTu(nguoiPhuPhep.id, 'yeu_cau_hanh_dong', {
      vai: 'Người phù phép', icon: '🪄',
      huongDan: 'Chọn một người bị cấm nói chuyện ngày mai.',
      danhSach: song.filter(p => p.id !== nguoiPhuPhep.id).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'cam_noi',
    });
    const kq = await doiHanhDong(maPhong, nguoiPhuPhep.id, 25000);
    if (kq) phong.nguoiBiCamNoi = kq[0];
  }

  // --- Xử lý kết quả đêm ---
  await ketQuaDem(maPhong);
}

async function ketQuaDem(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;

  const nanNhanId = phong.nguoiBiGiet;
  const duocBaoVeId = phong.nguoiDuocBaoVe;
  const duocCuuId = phong.nguoiDuocCuu;
  const biDocId = phong.nguoiBiDoc;

  let tuVong = [];

  // Xử lý nạn nhân của sói
  if (nanNhanId && nanNhanId !== duocBaoVeId && nanNhanId !== duocCuuId) {
    const nanNhan = phong.players.find(p => p.id === nanNhanId);
    if (nanNhan && nanNhan.song) {
      // Tough Guy: sống thêm 1 ngày
      if (nanNhan.vai === 'Tough Guy' && !nanNhan.toughGuyDaCanh) {
        nanNhan.toughGuyDaCanh = true;
        heThong(maPhong, `💪 ${nanNhan.ten} bị tấn công nhưng chưa chết nhờ sức mạnh đặc biệt!`, 'canh_bao');
      }
      // Người bệnh: sói không giết được đêm sau
      else if (nanNhan.vai === 'Người bệnh') {
        nanNhan.song = false;
        phong.soiKhongGiet = true;
        tuVong.push(nanNhan);
        heThong(maPhong, `🤒 ${nanNhan.ten} bị giết nhưng truyền bệnh cho bầy sói — sói không thể giết đêm sau!`, 'dem');
      } else {
        nanNhan.song = false;
        tuVong.push(nanNhan);
      }
    }
  }

  // Bình thuốc độc phù thủy
  if (biDocId) {
    const nguoiBiDoc = phong.players.find(p => p.id === biDocId);
    if (nguoiBiDoc && nguoiBiDoc.song) {
      nguoiBiDoc.song = false;
      tuVong.push(nguoiBiDoc);
    }
  }

  // White Wolf nạn nhân
  if (phong.whiteWolfGiet) {
    const ww = phong.players.find(p => p.id === phong.whiteWolfGiet);
    if (ww && ww.song) { ww.song = false; tuVong.push(ww); }
    phong.whiteWolfGiet = null;
  }

  // Tình nhân chết theo
  if (phong.tinhNhan && tuVong.length > 0) {
    tuVong.forEach(nguoiChet => {
      const tinhNhanChet = phong.tinhNhan.find(id => id !== nguoiChet.id && nguoiChet.id === phong.tinhNhan[0] || nguoiChet.id === phong.tinhNhan[1]);
      if (tinhNhanChet) {
        const nguoiKia = phong.players.find(p => p.id === (phong.tinhNhan[0] === nguoiChet.id ? phong.tinhNhan[1] : phong.tinhNhan[0]));
        if (nguoiKia && nguoiKia.song) {
          nguoiKia.song = false;
          tuVong.push(nguoiKia);
          heThong(maPhong, `💔 ${nguoiKia.ten} chết vì tình nhân đã ra đi!`, 'dem');
        }
      }
    });
  }

  // Thợ săn kéo theo người khác
  tuVong.forEach(async nguoiChet => {
    if (nguoiChet.vai === 'Thợ săn') {
      riengTu(nguoiChet.id, 'yeu_cau_hanh_dong', {
        vai: 'Thợ săn', icon: '🏹',
        huongDan: 'Bạn đã chết! Hãy chọn một người để kéo theo.',
        danhSach: nguoiSong(phong).map(p => ({ id: p.id, ten: p.ten })),
        soChon: 1, maPhong, loai: 'tho_san',
      });
      const kq = await doiHanhDong(maPhong, nguoiChet.id, 20000);
      if (kq) {
        const target = phong.players.find(p => p.id === kq[0]);
        if (target && target.song) {
          target.song = false;
          heThong(maPhong, `🏹 ${nguoiChet.ten} (Thợ Săn) kéo theo ${target.ten} trước khi chết!`, 'nguy');
        }
      }
    }

    // Doppelganger nhận vai
    if (phong.doppelTarget === nguoiChet.id) {
      const doppel = phong.players.find(p => p.vai === 'Doppelgänger' && p.song);
      if (doppel) {
        doppel.vai = nguoiChet.vai;
        riengTu(doppel.id, 'thong_tin_rieng', {
          tieuDe: '🪞 Doppelgänger',
          noidung: `${nguoiChet.ten} đã chết! Bạn tiếp nhận vai: ${nguoiChet.vai}`,
        });
      }
    }

    // Bloody Mary trả thù
    if (nguoiChet.vai === 'Bloody Mary' && nanNhanId) {
      phong.bloodyMaryTarget = nanNhanId;
    }

    // Sói con chết → đêm sau sói giết 2
    if (nguoiChet.vai === 'Sói con') {
      phong.soiGietHai = true;
      heThong(maPhong, `🐾 Sói Con đã chết! Đêm sau bầy sói được giết hai người!`, 'canh_bao');
    }

    // Tiên tri chết → Tiên tri tập sự lên
    if (nguoiChet.vai === 'Tiên tri') {
      const tapSu = nguoiSong(phong).find(p => p.vai === 'Tiên tri tập sự');
      if (tapSu) {
        tapSu.vai = 'Tiên tri';
        riengTu(tapSu.id, 'thong_tin_rieng', {
          tieuDe: '🌙 Tiên Tri Tập Sự',
          noidung: 'Tiên tri đã mất! Bạn trở thành Tiên Tri mới của làng.',
        });
        heThong(maPhong, `🌙 Tiên tri mới đã được chọn!`, 'info');
      }
    }

    // Dire Wolf chết theo bạn đồng hành
    if (phong.direWolfBan === nguoiChet.id) {
      const dire = phong.players.find(p => p.vai === 'Dire Wolf' && p.song);
      if (dire) { dire.song = false; tuVong.push(dire); }
    }

    // Đánh dấu sói đã chết cho Ma Sói Trong Mơ
    if (VAI_TRO[nguoiChet.vai]?.phe === 'soi') phong.soiDaChet = true;
  });

  // Bloody Mary trả thù
  if (phong.bloodyMaryTarget) {
    const target = phong.players.find(p => p.id === phong.bloodyMaryTarget);
    if (target && target.song) {
      target.song = false;
      heThong(maPhong, `🩸 Bloody Mary từ cõi chết trả thù ${target.ten}!`, 'nguy');
    }
    phong.bloodyMaryTarget = null;
  }

  // Thông báo kết quả đêm
  if (tuVong.length === 0) {
    heThong(maPhong, `🌙 Đêm yên bình... Không ai chết đêm nay!`, 'dem');
    phong.soiKhongGiet = false;
  } else {
    tuVong.forEach(p => {
      heThong(maPhong, `💀 ${p.ten} (${VAI_TRO[p.vai]?.icon} ${p.vai}) đã chết trong đêm.`, 'nguy');
    });
  }

  // Cập nhật
  thongBaoPhong(maPhong);

  if (!kiemTraThang(maPhong)) {
    // Chuyển sang ban ngày
    setTimeout(() => batDauNgay(maPhong), 3000);
  }
}

// ── Bắt đầu vòng ngày ─────────────────────────────────
function batDauNgay(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;

  phong.trangThai = 'ngay';
  phong.phieuBau = {};
  phong.keTucNgay = null;

  const song = nguoiSong(phong);

  heThong(maPhong, `☀️ Bình minh ló dạng. Ngày thứ ${phong.ngay} bắt đầu. Hãy thảo luận và tìm ra ma sói!`, 'ngay');

  // Thị trưởng
  const thiTruong = song.find(p => p.vai === 'Thị trưởng');
  if (thiTruong && !thiTruong.tietLo) {
    riengTu(thiTruong.id, 'thong_tin_rieng', {
      tieuDe: '🎖️ Thị Trưởng',
      noidung: 'Bạn có thể tự tiết lộ là Thị Trưởng để phiếu của bạn tính gấp đôi.',
    });
  }

  // Người bị cấm nói / rời làng
  if (phong.nguoiBiCamNoi) {
    const p = phong.players.find(x => x.id === phong.nguoiBiCamNoi);
    if (p) heThong(maPhong, `🤫 ${p.ten} bị nguyền không thể nói chuyện hôm nay!`, 'canh_bao');
    phong.nguoiBiCamNoi = null;
  }
  if (phong.nguoiRoiLang) {
    const p = phong.players.find(x => x.id === phong.nguoiRoiLang);
    if (p) heThong(maPhong, `🚶 ${p.ten} phải rời làng hôm nay, không được tham gia biểu quyết!`, 'canh_bao');
    phong.nguoiRoiLang = null;
  }

  // Kẻ say rượu nhận vai thật sau đêm 3
  if (phong.ngay === 3) {
    const sayRuou = song.find(p => p.vai === 'Kẻ say rượu');
    if (sayRuou) {
      const vaiMoi = phatVaiNgauNhien(1)[0];
      sayRuou.vai = vaiMoi;
      riengTu(sayRuou.id, 'thong_tin_rieng', {
        tieuDe: '🍺 Kẻ Say Rượu',
        noidung: `Bạn tỉnh ra và nhận ra vai thật của mình: ${VAI_TRO[vaiMoi]?.icon} ${vaiMoi}`,
      });
    }
  }

  thongBaoPhong(maPhong);
  io.to(maPhong).emit('bat_dau_bau_phieu', {
    danhSach: song.map(p => ({ id: p.id, ten: p.ten })),
    thoiGianThaoLuan: 120, // 2 phút thảo luận
  });
}

// Xử lý bỏ phiếu ngày
function xuLyBauPhieu(maPhong) {
  const phong = layPhong(maPhong);
  if (!phong) return;

  const phieu = phong.phieuBau || {};
  const demPhieu = {};
  Object.entries(phieu).forEach(([, mucTieu]) => {
    if (mucTieu) demPhieu[mucTieu] = (demPhieu[mucTieu] || 0) + 1;
  });

  // Thị trưởng tính gấp đôi
  const thiTruong = nguoiSong(phong).find(p => p.vai === 'Thị trưởng' && p.tietLo);
  if (thiTruong && demPhieu[thiTruong.id]) demPhieu[thiTruong.id] *= 2;

  const sapXep = Object.entries(demPhieu).sort((a, b) => b[1] - a[1]);
  if (sapXep.length === 0) {
    heThong(maPhong, '🤷 Không ai bị treo cổ hôm nay.', 'ngay');
    phong.ngay++;
    batDauDem(maPhong);
    return;
  }

  const [mucTieuId, soPhieu] = sapXep[0];
  const biTreoId = mucTieuId;
  const biTreo = phong.players.find(p => p.id === biTreoId);

  if (!biTreo) return;

  // Hoàng tử không thể chết ban ngày
  if (biTreo.vai === 'Hoàng tử' && !biTreo.hoangTuDaCanh) {
    biTreo.hoangTuDaCanh = true;
    heThong(maPhong, `👑 ${biTreo.ten} là Hoàng Tử! Không thể bị treo cổ lần đầu!`, 'canh_bao');
    phong.ngay++;
    batDauDem(maPhong);
    return;
  }

  // Tanner thắng nếu bị treo cổ
  if (biTreo.vai === 'Tanner') {
    phong.tannerThang = biTreo.ten;
  }

  biTreo.song = false;
  heThong(maPhong, `⚖️ ${biTreo.ten} (${VAI_TRO[biTreo.vai]?.icon} ${biTreo.vai}) bị treo cổ với ${soPhieu} phiếu!`, 'nguy');

  // Thợ săn bị treo cổ
  if (biTreo.vai === 'Thợ săn') {
    riengTu(biTreo.id, 'yeu_cau_hanh_dong', {
      vai: 'Thợ săn', icon: '🏹',
      huongDan: 'Bạn bị treo cổ! Chọn một người để kéo theo.',
      danhSach: nguoiSong(phong).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong, loai: 'tho_san',
    });
  }

  // Ma cà rồng bị đề cử → chết
  const maCaRong = phong.players.find(p => p.vai === 'Ma cà rồng' && p.song);
  if (maCaRong && phong.phieuBau[maCaRong.id]) {
    maCaRong.song = false;
    heThong(maPhong, `🧛 ${maCaRong.ten} (Ma Cà Rồng) bị đề cử và đã chết!`, 'nguy');
  }

  thongBaoPhong(maPhong);

  if (!kiemTraThang(maPhong)) {
    phong.ngay++;
    setTimeout(() => batDauDem(maPhong), 4000);
  }
}

// Hàm chờ hành động từ người chơi
function doiHanhDong(maPhong, socketId, timeout) {
  return new Promise(resolve => {
    const phong = layPhong(maPhong);
    if (!phong) return resolve(null);
    if (!phong.pendingActions) phong.pendingActions = {};
    phong.pendingActions[socketId] = resolve;
    setTimeout(() => {
      if (phong.pendingActions?.[socketId]) {
        delete phong.pendingActions[socketId];
        resolve(null);
      }
    }, timeout);
  });
}

// ═══════════════════════════════════════════════════════
// SOCKET EVENTS
// ═══════════════════════════════════════════════════════
io.on('connection', (socket) => {

  // ── Tạo phòng ──
  socket.on('tao_phong', ({ ten }) => {
    if (!ten?.trim()) return;
    let ma;
    do { ma = taoMaPhong(); } while (rooms[ma]);
    rooms[ma] = {
      players: [{ id: socket.id, ten: ten.trim(), isHost: true, ready: false, song: true, vai: null }],
      trangThai: 'cho',
      ngay: 1,
      vong: 0,
      phieuBau: {},
      phieuSoi: {},
      pendingActions: {},
      tannerThang: null,
      tinhNhan: null,
    };
    socket.join(ma);
    socket.maPhong = ma;
    socket.ten = ten.trim();
    socket.emit('vao_phong_thanh_cong', { maPhong: ma, isHost: true });
    thongBaoPhong(ma);
  });

  // ── Vào phòng ──
  socket.on('vao_phong', ({ ten, maPhong }) => {
    const phong = layPhong(maPhong);
    if (!phong) return socket.emit('loi', 'Phòng không tồn tại!');
    if (phong.trangThai !== 'cho') return socket.emit('loi', 'Ván đấu đã bắt đầu!');
    if (phong.players.length >= 50) return socket.emit('loi', 'Phòng đã đầy (tối đa 50 người)!');
    if (phong.players.find(p => p.ten === ten?.trim())) return socket.emit('loi', 'Tên này đã có người dùng!');

    phong.players.push({ id: socket.id, ten: ten.trim(), isHost: false, ready: false, song: true, vai: null });
    socket.join(maPhong);
    socket.maPhong = maPhong;
    socket.ten = ten.trim();
    socket.emit('vao_phong_thanh_cong', { maPhong, isHost: false });
    thongBaoPhong(maPhong);
    heThong(maPhong, `👋 ${ten.trim()} đã vào phòng.`, 'info');
  });

  // ── Ready ──
  socket.on('doi_ready', () => {
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const p = phong.players.find(x => x.id === socket.id);
    if (p) {
      p.ready = !p.ready;
      thongBaoPhong(socket.maPhong);
    }
  });

  // ── Bắt đầu game ──
  socket.on('bat_dau_game', () => {
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const host = phong.players.find(p => p.id === socket.id);
    if (!host?.isHost) return socket.emit('loi', 'Chỉ chủ phòng mới có thể bắt đầu!');
    if (phong.players.length < 5) return socket.emit('loi', 'Cần ít nhất 5 người!');
    if (!phong.players.every(p => p.ready || p.isHost)) return socket.emit('loi', 'Tất cả phải bấm sẵn sàng!');

    phong.trangThai = 'choi';
    const danhSachVai = phatVaiNgauNhien(phong.players.length);
    phong.players.forEach((p, i) => {
      p.vai = danhSachVai[i];
      p.song = true;
      p.ready = false;
      if (p.vai === 'Phù thủy') { p.thuocCuu = true; p.thuocGiet = true; }
      riengTu(p.id, 'nhan_vai', {
        vai: p.vai,
        icon: VAI_TRO[p.vai]?.icon || '❓',
        mo_ta: VAI_TRO[p.vai]?.mo_ta || '',
        phe: VAI_TRO[p.vai]?.phe,
      });
    });

    io.to(socket.maPhong).emit('game_bat_dau', {
      soNguoi: phong.players.length,
      phanBo: {
        soi: phong.players.filter(p => VAI_TRO[p.vai]?.phe === 'soi').length,
        dan: phong.players.filter(p => VAI_TRO[p.vai]?.phe === 'dan').length,
        khac: phong.players.filter(p => VAI_TRO[p.vai]?.phe === 'khac').length,
      },
    });

    setTimeout(() => batDauDem(socket.maPhong), 3000);
  });

  // ── Hành động đêm ──
  socket.on('gui_hanh_dong', ({ loai, chon, maPhong }) => {
    const phong = layPhong(maPhong || socket.maPhong);
    if (!phong) return;

    // Resolve pending action
    if (phong.pendingActions?.[socket.id]) {
      const resolve = phong.pendingActions[socket.id];
      delete phong.pendingActions[socket.id];
      resolve(chon);
    }

    // Phiếu sói
    if (loai === 'soi_giet' && chon?.[0]) {
      if (!phong.phieuSoi) phong.phieuSoi = {};
      phong.phieuSoi[socket.id] = chon[0];
    }

    // Phù thủy
    if (loai === 'phu_thuy_cuu') {
      phong.nguoiDuocCuu = phong.nguoiBiGiet;
      const phuThuy = phong.players.find(p => p.id === socket.id);
      if (phuThuy) phuThuy.thuocCuu = false;
    }
    if (loai === 'phu_thuy_doc' && chon?.[0]) {
      phong.nguoiBiDoc = chon[0];
      const phuThuy = phong.players.find(p => p.id === socket.id);
      if (phuThuy) phuThuy.thuocGiet = false;
    }

    // White Wolf
    if (loai === 'white_wolf' && chon?.[0]) phong.whiteWolfGiet = chon[0];

    // Thần tình yêu
    if (loai === 'cupid' && chon?.length === 2) phong.tinhNhan = chon;

    // Dire Wolf chọn bạn đồng hành
    if (loai === 'dire_wolf' && chon?.[0]) phong.direWolfBan = chon[0];

    // Thị trưởng tự tiết lộ
    if (loai === 'thi_truong_tiet_lo') {
      const p = phong.players.find(x => x.id === socket.id);
      if (p && p.vai === 'Thị trưởng') {
        p.tietLo = true;
        heThong(socket.maPhong, `🎖️ ${p.ten} tự tiết lộ là Thị Trưởng! Phiếu của họ tính gấp đôi.`, 'ngay');
      }
    }
  });

  // ── Bỏ phiếu ngày ──
  socket.on('bo_phieu', ({ mucTieuId }) => {
    const phong = layPhong(socket.maPhong);
    if (!phong || phong.trangThai !== 'ngay') return;
    if (!phong.phieuBau) phong.phieuBau = {};
    phong.phieuBau[socket.id] = mucTieuId;

    // Đủ phiếu thì xử lý
    const soNguoiSong = nguoiSong(phong).length;
    const soPhieuDaGui = Object.keys(phong.phieuBau).length;
    if (soPhieuDaGui >= soNguoiSong) xuLyBauPhieu(socket.maPhong);
  });

  // ── Kết thúc thảo luận (host) ──
  socket.on('ket_thuc_thao_luan', () => {
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const host = phong.players.find(p => p.id === socket.id);
    if (host?.isHost && phong.trangThai === 'ngay') xuLyBauPhieu(socket.maPhong);
  });

  // ── Chat ──
  socket.on('gui_tin_nhan', ({ noiDung }) => {
    if (!noiDung?.trim() || !socket.maPhong) return;
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const p = phong.players.find(x => x.id === socket.id);
    if (!p) return;

    // Kiểm tra bị cấm nói
    if (phong.nguoiBiCamNoi === socket.id) {
      return socket.emit('loi', 'Bạn đang bị nguyền không thể nói chuyện!');
    }

    // Người chết chỉ chat kênh ma
    if (!p.song) {
      io.to(socket.maPhong).emit('tin_nhan_ma', {
        ten: p.ten, noiDung: noiDung.trim(),
        thoiGian: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
      return;
    }

    io.to(socket.maPhong).emit('tin_nhan_moi', {
      ten: p.ten, noiDung: noiDung.trim(),
      thoiGian: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
  });

  // ── Ngắt kết nối ──
  socket.on('disconnect', () => {
    const ma = socket.maPhong;
    if (!ma || !rooms[ma]) return;
    const phong = rooms[ma];
    const idx = phong.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;
    const { ten, isHost } = phong.players[idx];
    phong.players.splice(idx, 1);
    if (phong.players.length === 0) {
      delete rooms[ma];
    } else {
      if (isHost) phong.players[0].isHost = true;
      thongBaoPhong(ma);
      heThong(ma, `👋 ${ten} đã rời phòng.`, 'info');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Ma Sói server: http://localhost:${PORT}`));