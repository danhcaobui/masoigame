const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// ═══════════════════════════════════════════════════════
// CẤU HÌNH THỜI GIAN (ms)
// ═══════════════════════════════════════════════════════
const TG_DEM = 60000;       // Đêm: 60s, hết giờ tự sang ngày
const TG_THAO_LUAN = 40000; // Ngày thảo luận: 40s
const TG_VOTE = 20000;      // Vote: 20s rồi khóa

// ═══════════════════════════════════════════════════════
// VAI TRÒ
// ═══════════════════════════════════════════════════════
const VAI_TRO = {
  // PHE DÂN
  'Dân làng':          { phe: 'dan', icon: '🧑', mo_ta: 'Tìm và tiêu diệt ma sói vào ban ngày.' },
  'Tiên tri':          { phe: 'dan', icon: '🔮', mo_ta: 'Mỗi đêm soi danh tính (Sói/Dân) của một người.' },
  'Phù thủy':          { phe: 'dan', icon: '🧙', mo_ta: 'Một bình cứu, một bình độc, mỗi loại dùng một lần. Cứu: chọn người để bảo hộ — nếu họ bị sói cắn đêm đó thì sống.' },
  'Vệ sĩ':             { phe: 'dan', icon: '🛡️', mo_ta: 'Bảo vệ một người khỏi bị giết mỗi đêm.' },
  'Thợ săn':           { phe: 'dan', icon: '🏹', mo_ta: 'Mỗi đêm ngắm sẵn một mục tiêu; nếu bạn chết (đêm đó hoặc bị treo cổ hôm sau), mục tiêu chết theo.' },
  'Thần tình yêu':     { phe: 'dan', icon: '💘', mo_ta: 'Đêm đầu ghép hai người thành tình nhân; một chết thì người kia chết theo.' },
  'Tiên tri tập sự':   { phe: 'dan', icon: '🌙', mo_ta: 'Trở thành Tiên tri mới nếu Tiên tri bị giết.' },
  'Tiên tri hào quang':{ phe: 'dan', icon: '✨', mo_ta: 'Mỗi đêm xem phe (Dân/Sói) của một người.' },
  'Beholder':          { phe: 'dan', icon: '👁️', mo_ta: 'Đêm đầu được biết ai là Tiên tri.' },
  'Hoàng tử':          { phe: 'dan', icon: '👑', mo_ta: 'Thoát chết lần đầu bị treo cổ (lộ vai).' },
  'Thị trưởng':        { phe: 'dan', icon: '🎖️', mo_ta: 'Có thể tự tiết lộ ban ngày để phiếu tính gấp đôi.' },
  'Thám tử':           { phe: 'dan', icon: '🔍', mo_ta: 'Kiểm tra một người: biết nhóm 3 người (họ + 2 bên cạnh) có sói không.' },
  'Thầy bói':          { phe: 'dan', icon: '🎴', mo_ta: 'Biết chính xác vai trò của người được kiểm tra.' },
  'Sinh đôi':          { phe: 'dan', icon: '👯', mo_ta: 'Đêm đầu nhận diện người sinh đôi còn lại.' },
  'Người hoá sói':     { phe: 'dan', icon: '🐺', mo_ta: 'Là dân nhưng bị soi sẽ ra kết quả Ma Sói.' },
  'Mất ngủ':           { phe: 'dan', icon: '😴', mo_ta: 'Sáng ra biết người bên cạnh có hành động trong đêm không.' },
  'Người bệnh':        { phe: 'dan', icon: '🤒', mo_ta: 'Nếu bị sói ăn, sói không thể giết đêm tiếp theo.' },
  'Tough Guy':         { phe: 'dan', icon: '💪', mo_ta: 'Sống sót thêm sau lần đầu bị sói tấn công.' },
  'Cô bé':             { phe: 'dan', icon: '👧', mo_ta: 'Lén nhìn bầy sói; 30% bị phát hiện và chết thay nạn nhân.' },
  'Người phù phép':    { phe: 'dan', icon: '🪄', mo_ta: 'Cấm một người nói chuyện vào ngày hôm sau.' },
  'Phù thuỷ già':      { phe: 'dan', icon: '🧓', mo_ta: 'Buộc một người không được bỏ phiếu ngày hôm sau.' },
  'Bá tước':           { phe: 'dan', icon: '🧛', mo_ta: 'Đêm đầu biết số sói ở mỗi nửa làng.' },
  'Doppelgänger':      { phe: 'dan', icon: '🪞', mo_ta: 'Chọn một người đêm đầu; nhận vai họ khi họ chết.' },
  'Kẻ say rượu':       { phe: 'dan', icon: '🍺', mo_ta: 'Là dân đến ngày 3, sau đó nhận một vai thật ngẫu nhiên.' },
  'Nostradamus':       { phe: 'dan', icon: '🌠', mo_ta: 'Đêm đầu dự đoán phe thắng; nếu đúng và còn sống, thắng cùng.' },
  'Chupacabra':        { phe: 'dan', icon: '👾', mo_ta: 'Mỗi đêm chọn một người: nếu là sói thì sói chết. Hết sói thì hóa sát thủ.' },
  'Con ma':            { phe: 'dan', icon: '👻', mo_ta: 'Chết đêm đầu, từ kênh ma vẫn quan sát và gợi ý.' },
  'Đứa con hoang':     { phe: 'dan', icon: '🌀', mo_ta: 'Đêm đầu chọn hình mẫu; nếu hình mẫu chết, bạn hóa Ma Sói.' },
  'Sasquatch':         { phe: 'dan', icon: '🦶', mo_ta: 'Nếu có một đêm không ai chết, bạn hóa Ma Sói.' },
  'Bloody Mary':       { phe: 'dan', icon: '🩸', mo_ta: 'Bị sói giết thì đêm sau một con sói ngẫu nhiên chết theo.' },
  // PHE SÓI
  'Ma sói':            { phe: 'soi', icon: '🐺', mo_ta: 'Mỗi đêm cùng bầy bình chọn một nạn nhân.' },
  'Pháp sư':           { phe: 'soi', icon: '🔯', mo_ta: 'Phe sói; mỗi đêm soi vai trò một người như Tiên tri.' },
  'Kẻ phản bội':       { phe: 'soi', icon: '🗡️', mo_ta: 'Biết bầy sói, hỗ trợ chúng; bị soi vẫn ra Dân.' },
  'Sói con':           { phe: 'soi', icon: '🐾', mo_ta: 'Nếu chết, đêm sau bầy sói giết được hai người.' },
  'White Wolf':        { phe: 'soi', icon: '🤍', mo_ta: 'Đêm chẵn giết riêng thêm một người. Thắng nếu sống sót duy nhất.' },
  'Ma sói trong mơ':   { phe: 'soi', icon: '💤', mo_ta: 'Chỉ tham gia cắn sau khi một sói khác chết.' },
  'Kẻ bị nguyền rủa':  { phe: 'soi', icon: '😈', mo_ta: 'Là dân; nếu bị sói cắn thì không chết mà hóa Ma Sói.' },
  'Lone Wolf':         { phe: 'soi', icon: '🌕', mo_ta: 'Chỉ thắng nếu là con sói cuối cùng còn sống.' },
  'Dire Wolf':         { phe: 'soi', icon: '🦴', mo_ta: 'Đêm đầu chọn bạn đồng hành; người đó chết thì bạn chết theo.' },
  'Black Wolf':        { phe: 'soi', icon: '🖤', mo_ta: 'Phe sói; mỗi đêm cấm một người nói chuyện hôm sau.' },
  'Sói ăn chay':       { phe: 'soi', icon: '🥦', mo_ta: 'Sói bình thường nhưng nếu là con cuối, vote cùng làng thay vì cắn.' },
  // PHE 3
  'Tanner':            { phe: 'khac', icon: '🪢', mo_ta: 'Chỉ thắng nếu bị dân làng treo cổ.' },
  'Ma cà rồng':        { phe: 'khac', icon: '🧛', mo_ta: 'Mỗi đêm hút máu một người (chết nếu không được bảo vệ).' },
  'Trưởng giáo phái':  { phe: 'khac', icon: '📿', mo_ta: 'Mỗi đêm kết nạp một người; thắng khi mọi người sống đều thuộc giáo phái.' },
  'Hoodlum':           { phe: 'khac', icon: '🎯', mo_ta: 'Đêm đầu chọn 2 mục tiêu; thắng nếu cả hai chết và bạn còn sống.' },
};

// ═══════════════════════════════════════════════════════
// PHÂN VAI
// ═══════════════════════════════════════════════════════
function tinhSoVai(soNguoi) {
  let soSoi, soPhe3, soDanThuong;
  if (soNguoi === 5)       { soSoi = 1; soPhe3 = 0; soDanThuong = 2; }
  else if (soNguoi <= 8)   { soSoi = 2; soPhe3 = 1; soDanThuong = 1; }
  else if (soNguoi <= 10)  { soSoi = 3; soPhe3 = 1; soDanThuong = 1; }
  else if (soNguoi <= 13)  { soSoi = 4; soPhe3 = 2; soDanThuong = 1; }
  else if (soNguoi <= 16)  { soSoi = 5; soPhe3 = 2; soDanThuong = 2; }
  else if (soNguoi <= 20)  { soSoi = 6; soPhe3 = 2; soDanThuong = 2; }
  else if (soNguoi <= 25)  { soSoi = 7; soPhe3 = 3; soDanThuong = 3; }
  else if (soNguoi <= 30)  { soSoi = 9; soPhe3 = 3; soDanThuong = 4; }
  else if (soNguoi <= 40)  { soSoi = 11; soPhe3 = 4; soDanThuong = 5; }
  else                     { soSoi = 13; soPhe3 = 4; soDanThuong = 6; }
  return { soSoi, soPhe3, soDanThuong };
}

function phatVaiNgauNhien(soNguoi) {
  const { soSoi, soPhe3, soDanThuong } = tinhSoVai(soNguoi);
  const soDanDacBiet = soNguoi - soSoi - soPhe3 - soDanThuong;

  const dsSoi  = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'soi');
  const dsPhe3 = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'khac');
  const dsDan  = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'dan' && v !== 'Dân làng');
  const tron = a => [...a].sort(() => Math.random() - 0.5);

  const soiChon  = ['Ma sói', ...tron(dsSoi.filter(v => v !== 'Ma sói')).slice(0, soSoi - 1)];
  const phe3Chon = tron(dsPhe3).slice(0, soPhe3);
  const uuTien   = ['Tiên tri', 'Phù thủy', 'Vệ sĩ'];
  const soUu     = Math.min(soDanDacBiet, uuTien.length);
  const danChon  = [
    ...uuTien.slice(0, soUu),
    ...tron(dsDan.filter(v => !uuTien.includes(v))).slice(0, Math.max(0, soDanDacBiet - soUu)),
  ];
  const danThuong = Array(soDanThuong).fill('Dân làng');

  return tron([...soiChon, ...phe3Chon, ...danChon, ...danThuong]).slice(0, soNguoi);
}

// ═══════════════════════════════════════════════════════
// PHÒNG
// ═══════════════════════════════════════════════════════
const rooms = {};

function taoMaPhong() {
  const ky = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ma = '';
  for (let i = 0; i < 4; i++) ma += ky[Math.floor(Math.random() * ky.length)];
  return ma;
}
const layPhong = ma => rooms[ma];
const nguoiSong = p => p.players.filter(x => x.song);
const laSoiPhe = p => VAI_TRO[p.vai]?.phe === 'soi';

function heThong(ma, msg, loai = 'info') {
  io.to(ma).emit('tin_nhan_he_thong', { msg, loai });
}
function rieng(id, ev, data) { io.to(id).emit(ev, data); }

function thongBaoPhong(ma) {
  const phong = layPhong(ma);
  if (!phong) return;
  io.to(ma).emit('cap_nhat_phong', {
    players: phong.players.map(p => ({
      id: p.id, ten: p.ten, isHost: p.isHost, ready: p.ready,
      song: p.song, lienLac: p.lienLac !== false,
    })),
    trangThai: phong.trangThai,
    ngay: phong.ngay,
  });
}

function clearTimers(phong) {
  ['demTimer', 'ngayTimer', 'voteTimer'].forEach(t => {
    if (phong[t]) { clearTimeout(phong[t]); phong[t] = null; }
  });
}

// ═══════════════════════════════════════════════════════
// VÒNG ĐÊM — TẤT CẢ VAI HÀNH ĐỘNG ĐỒNG THỜI, 60s
// ═══════════════════════════════════════════════════════
function batDauDem(ma) {
  const phong = layPhong(ma);
  if (!phong || phong.trangThai === 'ket_thuc') return;
  clearTimers(phong);

  phong.trangThai = 'dem';
  phong.hanhDong = {};      // socketId -> { loai, chon }
  phong.phieuSoi = {};      // socketId -> targetId
  phong.expectedActors = new Set();

  heThong(ma, `🌙 Đêm thứ ${phong.ngay} bắt đầu. Cả làng chìm vào giấc ngủ...`, 'dem');
  io.to(ma).emit('doi_phase', { phase: 'dem', ngay: phong.ngay, thoiGian: TG_DEM / 1000 });
  thongBaoPhong(ma);

  guiPromptDem(ma);

  phong.demTimer = setTimeout(() => ketQuaDem(ma), TG_DEM);
}

// Gửi prompt cho TẤT CẢ vai có kỹ năng cùng lúc
function guiPromptDem(ma) {
  const phong = layPhong(ma);
  const song = nguoiSong(phong);
  const dsKhac = me => song.filter(p => p.id !== me.id).map(p => ({ id: p.id, ten: p.ten }));
  const dsTatCa = () => song.map(p => ({ id: p.id, ten: p.ten }));

  // ── Thông tin tự động đêm 1 ──
  if (phong.ngay === 1) {
    const sinhDoi = song.filter(p => p.vai === 'Sinh đôi');
    if (sinhDoi.length >= 2) sinhDoi.forEach(p => rieng(p.id, 'thong_tin_rieng', {
      tieuDe: '👯 Sinh Đôi',
      noidung: `Người sinh đôi của bạn: ${sinhDoi.filter(x => x.id !== p.id).map(x => x.ten).join(', ')}`,
    }));

    const beholder = song.find(p => p.vai === 'Beholder');
    const tienTri = song.find(p => p.vai === 'Tiên tri');
    if (beholder && tienTri) rieng(beholder.id, 'thong_tin_rieng', {
      tieuDe: '👁️ Beholder', noidung: `Tiên tri của làng là: ${tienTri.ten}`,
    });

    const baTuoc = song.find(p => p.vai === 'Bá tước');
    if (baTuoc) {
      const nua = Math.floor(song.length / 2);
      const n1 = song.slice(0, nua).filter(laSoiPhe).length;
      const n2 = song.slice(nua).filter(laSoiPhe).length;
      rieng(baTuoc.id, 'thong_tin_rieng', {
        tieuDe: '🧛 Bá Tước', noidung: `Nửa đầu làng: ${n1} sói. Nửa sau: ${n2} sói.`,
      });
    }

    const keBanBoi = song.find(p => p.vai === 'Kẻ phản bội');
    if (keBanBoi) rieng(keBanBoi.id, 'thong_tin_rieng', {
      tieuDe: '🗡️ Kẻ Phản Bội',
      noidung: `Bầy sói: ${song.filter(laSoiPhe).filter(x => x.id !== keBanBoi.id).map(x => x.ten).join(', ') || 'không có'}`,
    });
  }

  // ── Bầy sói chọn nạn nhân ──
  const boiSoi = song.filter(p =>
    laSoiPhe(p) &&
    p.vai !== 'Kẻ phản bội' &&
    p.vai !== 'Kẻ bị nguyền rủa' &&
    !(p.vai === 'Ma sói trong mơ' && !phong.soiDaChet)
  );
  if (boiSoi.length > 0 && !phong.soiKhongGiet) {
    const soChon = phong.soiGietHai ? 2 : 1;
    const mucTieu = song.filter(p => !laSoiPhe(p)).map(p => ({ id: p.id, ten: p.ten }));
    boiSoi.forEach(p => {
      rieng(p.id, 'thong_tin_soi', { boiSoi: boiSoi.map(x => x.ten) });
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: p.vai, icon: VAI_TRO[p.vai]?.icon, loai: 'soi_giet',
        huongDan: soChon === 2 ? 'Sói Con đã chết — bầy sói chọn HAI nạn nhân đêm nay!' : 'Bầy sói: chọn nạn nhân đêm nay.',
        danhSach: mucTieu, soChon, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
  }

  // ── White Wolf (đêm chẵn) ──
  const ww = song.find(p => p.vai === 'White Wolf');
  if (ww && phong.ngay % 2 === 0) {
    rieng(ww.id, 'yeu_cau_hanh_dong', {
      vai: 'White Wolf', icon: '🤍', loai: 'white_wolf',
      huongDan: 'Đêm nay bạn được giết riêng thêm một người.',
      danhSach: song.filter(p => p.id !== ww.id && !laSoiPhe(p)).map(p => ({ id: p.id, ten: p.ten })),
      soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(ww.id);
  }

  // ── Các vai soi (kết quả trả ngay khi gửi) ──
  const promptSoi = (p, loai, hd) => {
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: p.vai, icon: VAI_TRO[p.vai]?.icon, loai, huongDan: hd,
      danhSach: dsKhac(p), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  };
  song.filter(p => p.vai === 'Tiên tri').forEach(p => promptSoi(p, 'tien_tri_soi', 'Chọn một người để soi (Sói hay Dân).'));
  song.filter(p => p.vai === 'Tiên tri hào quang').forEach(p => promptSoi(p, 'tien_tri_hq', 'Chọn một người để xem phe.'));
  song.filter(p => p.vai === 'Thầy bói').forEach(p => promptSoi(p, 'thay_boi', 'Chọn một người để biết chính xác vai trò.'));
  song.filter(p => p.vai === 'Pháp sư').forEach(p => promptSoi(p, 'phap_su', 'Chọn một người để soi (kết quả như Tiên tri).'));
  song.filter(p => p.vai === 'Thám tử').forEach(p => promptSoi(p, 'tham_tu', 'Chọn một người: kiểm tra nhóm 3 người quanh họ có sói không.'));

  // ── Vệ sĩ ──
  song.filter(p => p.vai === 'Vệ sĩ').forEach(p => {
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: 'Vệ sĩ', icon: '🛡️', loai: 've_si',
      huongDan: 'Chọn một người để bảo vệ đêm nay.',
      danhSach: dsTatCa(), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });

  // ── Thợ săn (ngắm sẵn) ──
  song.filter(p => p.vai === 'Thợ săn').forEach(p => {
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: 'Thợ săn', icon: '🏹', loai: 'tho_san',
      huongDan: 'Ngắm sẵn một mục tiêu — nếu bạn chết, họ chết theo.',
      danhSach: dsKhac(p), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });

  // ── Phù thủy ──
  song.filter(p => p.vai === 'Phù thủy' && (p.thuocCuu || p.thuocGiet)).forEach(p => {
    rieng(p.id, 'yeu_cau_phu_thuy', {
      coThuocCuu: p.thuocCuu !== false,
      coThuocGiet: p.thuocGiet !== false,
      danhSach: dsTatCa(), maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });

  // ── Ma cà rồng ──
  song.filter(p => p.vai === 'Ma cà rồng').forEach(p => {
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: 'Ma cà rồng', icon: '🧛', loai: 'macarong',
      huongDan: 'Chọn một người để hút máu đêm nay.',
      danhSach: dsKhac(p), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });

  // ── Chupacabra ──
  song.filter(p => p.vai === 'Chupacabra').forEach(p => {
    const conSoi = song.some(laSoiPhe);
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: 'Chupacabra', icon: '👾', loai: 'chupa',
      huongDan: conSoi ? 'Chọn một người: nếu là sói, sói sẽ chết!' : 'Hết sói! Chọn một người để giết.',
      danhSach: dsKhac(p), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });

  // ── Trưởng giáo phái ──
  song.filter(p => p.vai === 'Trưởng giáo phái').forEach(p => {
    if (!phong.giaoPhaiIds) phong.giaoPhaiIds = [p.id];
    const chua = song.filter(x => !phong.giaoPhaiIds.includes(x.id));
    if (chua.length > 0) {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Trưởng giáo phái', icon: '📿', loai: 'giao_phai',
        huongDan: 'Chọn một người để kết nạp vào giáo phái.',
        danhSach: chua.map(x => ({ id: x.id, ten: x.ten })), soChon: 1, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    }
  });

  // ── Cấm nói / cấm vote ──
  song.filter(p => p.vai === 'Người phù phép' || p.vai === 'Black Wolf').forEach(p => {
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: p.vai, icon: VAI_TRO[p.vai]?.icon, loai: 'cam_noi',
      huongDan: 'Chọn một người bị cấm nói chuyện ngày mai.',
      danhSach: dsKhac(p), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });
  song.filter(p => p.vai === 'Phù thuỷ già').forEach(p => {
    rieng(p.id, 'yeu_cau_hanh_dong', {
      vai: 'Phù thuỷ già', icon: '🧓', loai: 'cam_vote',
      huongDan: 'Chọn một người không được bỏ phiếu ngày mai.',
      danhSach: dsKhac(p), soChon: 1, maPhong: ma,
    });
    phong.expectedActors.add(p.id);
  });

  // ── Các vai chỉ đêm 1 ──
  if (phong.ngay === 1) {
    song.filter(p => p.vai === 'Thần tình yêu').forEach(p => {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Thần tình yêu', icon: '💘', loai: 'cupid',
        huongDan: 'Chọn HAI người làm tình nhân.',
        danhSach: dsTatCa(), soChon: 2, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
    song.filter(p => p.vai === 'Hoodlum').forEach(p => {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Hoodlum', icon: '🎯', loai: 'hoodlum',
        huongDan: 'Chọn HAI mục tiêu. Bạn thắng nếu cả hai chết và bạn sống.',
        danhSach: dsKhac(p), soChon: 2, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
    song.filter(p => p.vai === 'Doppelgänger').forEach(p => {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Doppelgänger', icon: '🪞', loai: 'doppel',
        huongDan: 'Chọn một người — bạn sẽ nhận vai họ khi họ chết.',
        danhSach: dsKhac(p), soChon: 1, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
    song.filter(p => p.vai === 'Dire Wolf').forEach(p => {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Dire Wolf', icon: '🦴', loai: 'dire_wolf',
        huongDan: 'Chọn bạn đồng hành — họ chết thì bạn chết theo.',
        danhSach: dsKhac(p), soChon: 1, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
    song.filter(p => p.vai === 'Đứa con hoang').forEach(p => {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Đứa con hoang', icon: '🌀', loai: 'con_hoang',
        huongDan: 'Chọn hình mẫu — nếu họ chết, bạn hóa Ma Sói.',
        danhSach: dsKhac(p), soChon: 1, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
    song.filter(p => p.vai === 'Nostradamus').forEach(p => {
      rieng(p.id, 'yeu_cau_hanh_dong', {
        vai: 'Nostradamus', icon: '🌠', loai: 'nostra',
        huongDan: 'Dự đoán phe sẽ thắng ván này.',
        danhSach: [{ id: 'dan', ten: '🧑 Phe Dân Làng' }, { id: 'soi', ten: '🐺 Phe Ma Sói' }],
        soChon: 1, maPhong: ma,
      });
      phong.expectedActors.add(p.id);
    });
  }
}

// Nếu mọi vai đã hành động → kết thúc đêm sớm
function kiemTraDemSom(ma) {
  const phong = layPhong(ma);
  if (!phong || phong.trangThai !== 'dem') return;
  const daXong = [...phong.expectedActors].every(id => phong.hanhDong[id]);
  if (daXong && phong.expectedActors.size > 0) {
    clearTimers(phong);
    heThong(ma, '🌙 Mọi linh hồn đã hành động xong, bình minh đến sớm...', 'dem');
    setTimeout(() => ketQuaDem(ma), 2000);
  }
}

// ═══════════════════════════════════════════════════════
// XỬ LÝ KẾT QUẢ ĐÊM
// ═══════════════════════════════════════════════════════
function ketQuaDem(ma) {
  const phong = layPhong(ma);
  if (!phong || phong.trangThai !== 'dem') return;
  clearTimers(phong);

  const song = nguoiSong(phong);
  const hd = phong.hanhDong;
  const tim = id => phong.players.find(p => p.id === id);
  const nhatKy = [];
  const tuVong = [];

  // 1. Đêm 1: lưu các lựa chọn dài hạn
  for (const [actorId, act] of Object.entries(hd)) {
    if (act.loai === 'cupid' && act.chon?.length === 2) phong.tinhNhan = act.chon;
    if (act.loai === 'hoodlum' && act.chon?.length === 2) phong.hoodlumMucTieu = act.chon;
    if (act.loai === 'doppel' && act.chon?.[0]) phong.doppelTarget = { doi: actorId, muc: act.chon[0] };
    if (act.loai === 'dire_wolf' && act.chon?.[0]) phong.direWolfBan = { soi: actorId, ban: act.chon[0] };
    if (act.loai === 'con_hoang' && act.chon?.[0]) phong.conHoangMau = { con: actorId, mau: act.chon[0] };
    if (act.loai === 'nostra' && act.chon?.[0]) phong.nostraDoan = { id: actorId, phe: act.chon[0] };
    if (act.loai === 'tho_san' && act.chon?.[0]) {
      const ts = tim(actorId);
      if (ts) ts.thoSanNgam = act.chon[0];
    }
  }

  // 2. Vệ sĩ
  let duocBaoVe = null;
  for (const [actorId, act] of Object.entries(hd)) {
    if (act.loai === 've_si' && act.chon?.[0]) duocBaoVe = act.chon[0];
  }

  // 3. Phiếu sói → nạn nhân
  const demPhieu = {};
  Object.values(phong.phieuSoi).forEach(arr => {
    (Array.isArray(arr) ? arr : [arr]).forEach(id => { demPhieu[id] = (demPhieu[id] || 0) + 1; });
  });
  const sapXep = Object.entries(demPhieu).sort((a, b) => b[1] - a[1]);
  const soNanNhan = phong.soiGietHai ? 2 : 1;
  let nanNhanIds = sapXep.slice(0, soNanNhan).map(e => e[0]);
  phong.soiGietHai = false;

  // Cô bé 30% bị phát hiện thay nạn nhân
  const coBe = song.find(p => p.vai === 'Cô bé');
  if (coBe && nanNhanIds.length > 0 && Math.random() < 0.3) {
    nanNhanIds = [coBe.id];
    nhatKy.push({ icon: '👧', msg: 'Có tiếng động lạ trong đêm — ai đó đã bị bắt gặp...' });
  }

  // Phù thủy
  let phuThuyCuu = null;
  for (const [actorId, act] of Object.entries(hd)) {
    const pt = tim(actorId);
    if (!pt || pt.vai !== 'Phù thủy') continue;
    if (act.loai === 'phu_thuy_cuu' && act.chon?.[0] && pt.thuocCuu) {
      phuThuyCuu = act.chon[0]; pt.thuocCuu = false;
    }
    if (act.loai === 'phu_thuy_doc' && act.chon?.[0] && pt.thuocGiet) {
      pt.thuocGiet = false;
      const muc = tim(act.chon[0]);
      if (muc?.song) { muc.song = false; tuVong.push(muc); }
    }
  }

  // 4. Xử lý nạn nhân sói
  let soiCoGiet = false;
  nanNhanIds.forEach(nid => {
    const nn = tim(nid);
    if (!nn || !nn.song) return;
    if (nid === duocBaoVe || nid === phuThuyCuu) {
      nhatKy.push({ icon: '💊', msg: 'Một người đã được cứu sống trong đêm.' });
      return;
    }
    if (nn.vai === 'Kẻ bị nguyền rủa') {
      nn.vai = 'Ma sói';
      rieng(nn.id, 'thong_tin_rieng', { tieuDe: '😈 Lời Nguyền', noidung: 'Bạn bị sói cắn... và thức tỉnh thành MA SÓI!' });
      rieng(nn.id, 'nhan_vai', { vai: 'Ma sói', icon: '🐺', mo_ta: VAI_TRO['Ma sói'].mo_ta, phe: 'soi' });
      nhatKy.push({ icon: '🌑', msg: 'Đêm nay có điều gì đó kỳ lạ đã xảy ra...' });
      soiCoGiet = true;
      return;
    }
    if (nn.vai === 'Tough Guy' && !nn.toughGuyDaCanh) {
      nn.toughGuyDaCanh = true;
      nhatKy.push({ icon: '💪', msg: 'Một người bị tấn công nhưng vẫn gượng dậy được.' });
      soiCoGiet = true;
      return;
    }
    nn.song = false;
    tuVong.push(nn);
    soiCoGiet = true;
    if (nn.vai === 'Người bệnh') {
      phong.soiKhongGietDemSau = true;
      nhatKy.push({ icon: '🤒', msg: 'Kẻ săn mồi dường như đã nhiễm bệnh...' });
    }
    if (nn.vai === 'Bloody Mary') phong.bloodyMaryKichHoat = true;
  });

  // soiKhongGiet cho đêm sau
  phong.soiKhongGiet = !!phong.soiKhongGietDemSau;
  phong.soiKhongGietDemSau = false;

  // 5. White Wolf
  for (const [, act] of Object.entries(hd)) {
    if (act.loai === 'white_wolf' && act.chon?.[0]) {
      const muc = tim(act.chon[0]);
      if (muc?.song && muc.id !== duocBaoVe) { muc.song = false; tuVong.push(muc); }
    }
  }

  // 6. Ma cà rồng
  for (const [, act] of Object.entries(hd)) {
    if (act.loai === 'macarong' && act.chon?.[0]) {
      const muc = tim(act.chon[0]);
      if (muc?.song && muc.id !== duocBaoVe && muc.id !== phuThuyCuu) {
        muc.song = false; tuVong.push(muc);
        nhatKy.push({ icon: '🧛', msg: 'Có vết răng kỳ lạ trên cổ một nạn nhân...' });
      }
    }
  }

  // 7. Chupacabra
  for (const [actorId, act] of Object.entries(hd)) {
    if (act.loai !== 'chupa' || !act.chon?.[0]) continue;
    const muc = tim(act.chon[0]);
    if (!muc?.song) continue;
    const conSoi = nguoiSong(phong).some(laSoiPhe);
    if (conSoi) {
      if (laSoiPhe(muc)) {
        muc.song = false; tuVong.push(muc);
        rieng(actorId, 'thong_tin_rieng', { tieuDe: '👾 Chupacabra', noidung: `${muc.ten} là SÓI — đã bị tiêu diệt!` });
      } else {
        rieng(actorId, 'thong_tin_rieng', { tieuDe: '👾 Chupacabra', noidung: `${muc.ten} không phải sói.` });
      }
    } else {
      muc.song = false; tuVong.push(muc);
    }
  }

  // 8. Giáo phái
  for (const [, act] of Object.entries(hd)) {
    if (act.loai === 'giao_phai' && act.chon?.[0]) {
      if (!phong.giaoPhaiIds) phong.giaoPhaiIds = [];
      if (!phong.giaoPhaiIds.includes(act.chon[0])) phong.giaoPhaiIds.push(act.chon[0]);
    }
  }

  // 9. Cấm nói / cấm vote ngày mai
  phong.nguoiBiCamNoi = null; phong.nguoiBiCamVote = null;
  for (const [, act] of Object.entries(hd)) {
    if (act.loai === 'cam_noi' && act.chon?.[0]) phong.nguoiBiCamNoi = act.chon[0];
    if (act.loai === 'cam_vote' && act.chon?.[0]) phong.nguoiBiCamVote = act.chon[0];
  }

  // 10. Con ma chết đêm 1
  if (phong.ngay === 1) {
    const conMa = nguoiSong(phong).find(p => p.vai === 'Con ma');
    if (conMa) { conMa.song = false; tuVong.push(conMa); }
  }

  // 11. Bloody Mary trả thù (từ đêm trước)
  if (phong.bloodyMaryTraThu) {
    const soiSong = nguoiSong(phong).filter(laSoiPhe);
    if (soiSong.length > 0) {
      const xui = soiSong[Math.floor(Math.random() * soiSong.length)];
      xui.song = false; tuVong.push(xui);
      nhatKy.push({ icon: '🩸', msg: 'Một bóng ma đẫm máu đã đòi nợ trong đêm...' });
    }
    phong.bloodyMaryTraThu = false;
  }
  if (phong.bloodyMaryKichHoat) { phong.bloodyMaryTraThu = true; phong.bloodyMaryKichHoat = false; }

  // 12. Hiệu ứng dây chuyền sau khi có người chết
  xuLyDayChuyen(phong, tuVong, nhatKy);

  // 13. Sasquatch: đêm không ai chết → hóa sói
  if (tuVong.length === 0) {
    const sas = nguoiSong(phong).find(p => p.vai === 'Sasquatch');
    if (sas) {
      sas.vai = 'Ma sói';
      rieng(sas.id, 'nhan_vai', { vai: 'Ma sói', icon: '🐺', mo_ta: VAI_TRO['Ma sói'].mo_ta, phe: 'soi' });
      rieng(sas.id, 'thong_tin_rieng', { tieuDe: '🦶 Sasquatch', noidung: 'Đêm không máu... Bản năng hoang dã trỗi dậy — bạn hóa MA SÓI!' });
    }
  }

  // 14. Mất ngủ
  nguoiSong(phong).filter(p => p.vai === 'Mất ngủ').forEach(p => {
    const idx = phong.players.indexOf(p);
    const hangXom = [phong.players[idx - 1], phong.players[idx + 1]].filter(x => x && x.song);
    const coAi = hangXom.some(x => hd[x.id]);
    rieng(p.id, 'thong_tin_rieng', {
      tieuDe: '😴 Mất Ngủ',
      noidung: coAi ? 'Bạn nghe thấy hàng xóm trở mình trong đêm...' : 'Hàng xóm ngủ rất say, không động tĩnh gì.',
    });
  });

  // Tổng hợp nhật ký
  if (tuVong.length === 0) {
    nhatKy.unshift({ icon: '🌙', msg: 'Đêm yên bình, không ai thiệt mạng.' });
  } else {
    tuVong.forEach(p => {
      heThong(ma, `💀 ${p.ten} đã chết trong đêm.`, 'nguy');
      nhatKy.unshift({ icon: '💀', msg: `${p.ten} đã qua đời trong đêm tối.` });
    });
  }
  phong.nhatKyDem = { ngay: phong.ngay, suKien: nhatKy };

  thongBaoPhong(ma);
  if (!kiemTraThang(ma)) {
    setTimeout(() => batDauNgay(ma), 2500);
  }
}

// Hiệu ứng dây chuyền: tình nhân, thợ săn ngắm sẵn, doppel, dire wolf, con hoang, sói con, tiên tri tập sự
function xuLyDayChuyen(phong, tuVong, nhatKy) {
  let thayDoi = true;
  const daXuLy = new Set();
  while (thayDoi) {
    thayDoi = false;
    for (const nguoiChet of [...tuVong]) {
      if (daXuLy.has(nguoiChet.id)) continue;
      daXuLy.add(nguoiChet.id);

      // Tình nhân
      if (phong.tinhNhan?.includes(nguoiChet.id)) {
        const kiaId = phong.tinhNhan.find(id => id !== nguoiChet.id);
        const kia = phong.players.find(p => p.id === kiaId);
        if (kia?.song) {
          kia.song = false; tuVong.push(kia); thayDoi = true;
          nhatKy.push({ icon: '💔', msg: `${kia.ten} chết theo người mình yêu.` });
        }
      }
      // Thợ săn ngắm sẵn
      if (nguoiChet.vai === 'Thợ săn' && nguoiChet.thoSanNgam) {
        const muc = phong.players.find(p => p.id === nguoiChet.thoSanNgam);
        if (muc?.song) {
          muc.song = false; tuVong.push(muc); thayDoi = true;
          nhatKy.push({ icon: '🏹', msg: `${nguoiChet.ten} kéo theo ${muc.ten} trước khi chết.` });
        }
      }
      // Doppelganger
      if (phong.doppelTarget?.muc === nguoiChet.id) {
        const doppel = phong.players.find(p => p.id === phong.doppelTarget.doi);
        if (doppel?.song) {
          doppel.vai = nguoiChet.vai;
          rieng(doppel.id, 'nhan_vai', {
            vai: nguoiChet.vai, icon: VAI_TRO[nguoiChet.vai]?.icon,
            mo_ta: VAI_TRO[nguoiChet.vai]?.mo_ta, phe: VAI_TRO[nguoiChet.vai]?.phe,
          });
          rieng(doppel.id, 'thong_tin_rieng', { tieuDe: '🪞 Doppelgänger', noidung: `Bạn tiếp nhận vai: ${nguoiChet.vai}` });
        }
      }
      // Dire Wolf
      if (phong.direWolfBan?.ban === nguoiChet.id) {
        const dire = phong.players.find(p => p.id === phong.direWolfBan.soi);
        if (dire?.song) {
          dire.song = false; tuVong.push(dire); thayDoi = true;
          nhatKy.push({ icon: '🦴', msg: `${dire.ten} gục ngã theo người đồng hành.` });
        }
      }
      // Đứa con hoang
      if (phong.conHoangMau?.mau === nguoiChet.id) {
        const con = phong.players.find(p => p.id === phong.conHoangMau.con);
        if (con?.song && !laSoiPhe(con)) {
          con.vai = 'Ma sói';
          rieng(con.id, 'nhan_vai', { vai: 'Ma sói', icon: '🐺', mo_ta: VAI_TRO['Ma sói'].mo_ta, phe: 'soi' });
          rieng(con.id, 'thong_tin_rieng', { tieuDe: '🌀 Đứa Con Hoang', noidung: 'Hình mẫu đã chết... Bạn hóa MA SÓI!' });
        }
      }
      // Sói con
      if (nguoiChet.vai === 'Sói con') {
        phong.soiGietHai = true;
        heThong(getRoomCode(phong), '🐾 Có tiếng sói tru thảm thiết — đêm sau bầy sói sẽ giết HAI người!', 'canh_bao');
      }
      // Tiên tri chết → tập sự lên
      if (nguoiChet.vai === 'Tiên tri') {
        const ts = nguoiSong(phong).find(p => p.vai === 'Tiên tri tập sự');
        if (ts) {
          ts.vai = 'Tiên tri';
          rieng(ts.id, 'nhan_vai', { vai: 'Tiên tri', icon: '🔮', mo_ta: VAI_TRO['Tiên tri'].mo_ta, phe: 'dan' });
          rieng(ts.id, 'thong_tin_rieng', { tieuDe: '🌙 Kế Nhiệm', noidung: 'Tiên tri đã mất — bạn trở thành Tiên Tri mới!' });
        }
      }
      // Đánh dấu sói chết
      if (laSoiPhe(nguoiChet)) phong.soiDaChet = true;
    }
  }
}

function getRoomCode(phong) {
  return Object.keys(rooms).find(k => rooms[k] === phong);
}

// ═══════════════════════════════════════════════════════
// VÒNG NGÀY: 40s thảo luận → 20s vote → xử lý
// ═══════════════════════════════════════════════════════
function batDauNgay(ma) {
  const phong = layPhong(ma);
  if (!phong || phong.trangThai === 'ket_thuc') return;
  clearTimers(phong);

  phong.trangThai = 'ngay';
  heThong(ma, `☀️ Bình minh ló dạng. Ngày thứ ${phong.ngay}: thảo luận 40 giây!`, 'ngay');
  io.to(ma).emit('doi_phase', { phase: 'ngay', ngay: phong.ngay, thoiGian: TG_THAO_LUAN / 1000 });

  if (phong.nhatKyDem) {
    io.to(ma).emit('nhat_ky_dem', phong.nhatKyDem);
    phong.nhatKyDem = null;
  }

  if (phong.nguoiBiCamNoi) {
    const p = phong.players.find(x => x.id === phong.nguoiBiCamNoi);
    if (p) heThong(ma, `🤫 ${p.ten} bị nguyền không thể nói chuyện hôm nay!`, 'canh_bao');
  }
  if (phong.nguoiBiCamVote) {
    const p = phong.players.find(x => x.id === phong.nguoiBiCamVote);
    if (p) heThong(ma, `🚫 ${p.ten} không được bỏ phiếu hôm nay!`, 'canh_bao');
  }

  // Kẻ say rượu ngày 3
  if (phong.ngay === 3) {
    const sr = nguoiSong(phong).find(p => p.vai === 'Kẻ say rượu');
    if (sr) {
      const dsDan = Object.keys(VAI_TRO).filter(v => VAI_TRO[v].phe === 'dan' && v !== 'Kẻ say rượu');
      const vaiMoi = dsDan[Math.floor(Math.random() * dsDan.length)];
      sr.vai = vaiMoi;
      rieng(sr.id, 'nhan_vai', { vai: vaiMoi, icon: VAI_TRO[vaiMoi]?.icon, mo_ta: VAI_TRO[vaiMoi]?.mo_ta, phe: 'dan' });
      rieng(sr.id, 'thong_tin_rieng', { tieuDe: '🍺 Tỉnh Rượu', noidung: `Vai thật của bạn: ${VAI_TRO[vaiMoi]?.icon} ${vaiMoi}` });
    }
  }

  thongBaoPhong(ma);
  phong.ngayTimer = setTimeout(() => batDauVote(ma), TG_THAO_LUAN);
}

function batDauVote(ma) {
  const phong = layPhong(ma);
  if (!phong || phong.trangThai !== 'ngay') return;
  clearTimers(phong);

  phong.trangThai = 'vote';
  phong.phieuBau = {};

  heThong(ma, '⚖️ Bắt đầu bỏ phiếu! Bạn có 20 giây.', 'ngay');
  io.to(ma).emit('bat_dau_bau_phieu', {
    danhSach: nguoiSong(phong).map(p => ({ id: p.id, ten: p.ten })),
    thoiGian: TG_VOTE / 1000,
    ngay: phong.ngay,
  });

  phong.voteTimer = setTimeout(() => xuLyBauPhieu(ma), TG_VOTE);
}

function xuLyBauPhieu(ma) {
  const phong = layPhong(ma);
  if (!phong || phong.trangThai !== 'vote') return;
  clearTimers(phong);

  const demPhieu = {};
  Object.entries(phong.phieuBau || {}).forEach(([voterId, mucId]) => {
    if (!mucId) return;
    let trongSo = 1;
    const voter = phong.players.find(p => p.id === voterId);
    if (voter?.vai === 'Thị trưởng' && voter.tietLo) trongSo = 2;
    demPhieu[mucId] = (demPhieu[mucId] || 0) + trongSo;
  });

  const sapXep = Object.entries(demPhieu).sort((a, b) => b[1] - a[1]);

  // Không ai vote
  if (sapXep.length === 0) {
    heThong(ma, '🤷 Không có phiếu nào. Không ai bị treo cổ hôm nay.', 'ngay');
    sangDemMoi(ma);
    return;
  }

  // Cơ chế HÒA: 2 người cao nhất bằng phiếu → không ai chết
  if (sapXep.length >= 2 && sapXep[0][1] === sapXep[1][1]) {
    heThong(ma, `⚖️ Hòa phiếu (${sapXep[0][1]} - ${sapXep[1][1]})! Không ai bị treo cổ hôm nay.`, 'ngay');
    sangDemMoi(ma);
    return;
  }

  const [mucId, soPhieu] = sapXep[0];
  const biTreo = phong.players.find(p => p.id === mucId);
  if (!biTreo || !biTreo.song) { sangDemMoi(ma); return; }

  // Hoàng tử thoát lần đầu
  if (biTreo.vai === 'Hoàng tử' && !biTreo.hoangTuDaCanh) {
    biTreo.hoangTuDaCanh = true;
    heThong(ma, `👑 ${biTreo.ten} là Hoàng Tử! Thoát án treo cổ lần đầu!`, 'canh_bao');
    sangDemMoi(ma);
    return;
  }

  if (biTreo.vai === 'Tanner') phong.tannerThang = biTreo.ten;

  biTreo.song = false;
  heThong(ma, `⚖️ ${biTreo.ten} (${VAI_TRO[biTreo.vai]?.icon} ${biTreo.vai}) bị treo cổ với ${soPhieu} phiếu!`, 'nguy');

  // Dây chuyền sau treo cổ
  const tuVong = [biTreo];
  const nhatKy = [];
  xuLyDayChuyen(phong, tuVong, nhatKy);
  nhatKy.forEach(nk => heThong(ma, `${nk.icon} ${nk.msg}`, 'nguy'));

  thongBaoPhong(ma);
  if (!kiemTraThang(ma)) sangDemMoi(ma);
}

function sangDemMoi(ma) {
  const phong = layPhong(ma);
  if (!phong) return;
  phong.ngay++;
  setTimeout(() => batDauDem(ma), 3000);
}

// ═══════════════════════════════════════════════════════
// THẮNG / THUA
// ═══════════════════════════════════════════════════════
function kiemTraThang(ma) {
  const phong = layPhong(ma);
  if (!phong) return false;

  const song = nguoiSong(phong);
  const soiSong = song.filter(laSoiPhe);
  const khacSong = song.filter(p => !laSoiPhe(p));

  if (phong.tannerThang) { ketThuc(ma, 'Tanner', [phong.tannerThang]); return true; }

  const lone = song.find(p => p.vai === 'Lone Wolf');
  if (lone && soiSong.length === 1 && soiSong[0].id === lone.id && soiSong.length >= khacSong.length) {
    ketThuc(ma, 'Lone Wolf', [lone.ten]); return true;
  }
  const ww = song.find(p => p.vai === 'White Wolf');
  if (ww && song.length === 1) { ketThuc(ma, 'White Wolf', [ww.ten]); return true; }

  const truongGP = song.find(p => p.vai === 'Trưởng giáo phái');
  if (truongGP && song.length > 1 && song.every(p => phong.giaoPhaiIds?.includes(p.id))) {
    ketThuc(ma, 'Trưởng giáo phái', [truongGP.ten]); return true;
  }

  if (soiSong.length >= khacSong.length && soiSong.length > 0) {
    ketThuc(ma, 'soi', soiSong.map(p => p.ten)); return true;
  }
  if (soiSong.length === 0 && song.length > 0) {
    const hood = song.find(p => p.vai === 'Hoodlum');
    if (hood && phong.hoodlumMucTieu?.every(id => !phong.players.find(p => p.id === id)?.song)) {
      ketThuc(ma, 'Hoodlum', [hood.ten]); return true;
    }
    ketThuc(ma, 'dan', song.filter(p => VAI_TRO[p.vai]?.phe === 'dan').map(p => p.ten));
    return true;
  }
  return false;
}

function ketThuc(ma, pheThang, nguoiThang) {
  const phong = layPhong(ma);
  if (!phong) return;
  clearTimers(phong);
  phong.trangThai = 'ket_thuc';

  // Nostradamus thắng cùng
  if (phong.nostraDoan && (pheThang === 'dan' || pheThang === 'soi')) {
    const nostra = phong.players.find(p => p.id === phong.nostraDoan.id);
    if (nostra?.song && phong.nostraDoan.phe === pheThang && !nguoiThang.includes(nostra.ten)) {
      nguoiThang.push(nostra.ten + ' 🌠');
    }
  }

  const tenPhe = {
    dan: '🧑 Phe Dân Làng', soi: '🐺 Phe Ma Sói',
    'Tanner': '🪢 Tanner', 'Lone Wolf': '🌕 Lone Wolf', 'White Wolf': '🤍 White Wolf',
    'Hoodlum': '🎯 Hoodlum', 'Trưởng giáo phái': '📿 Giáo Phái',
  };

  io.to(ma).emit('game_ket_thuc', {
    pheThang, tenPhe: tenPhe[pheThang] || pheThang, nguoiThang,
    tatCaVai: phong.players.map(p => ({ ten: p.ten, vai: p.vai, icon: VAI_TRO[p.vai]?.icon || '❓' })),
  });
}

// ═══════════════════════════════════════════════════════
// SOCKET
// ═══════════════════════════════════════════════════════
io.on('connection', (socket) => {

  socket.on('tao_phong', ({ ten }) => {
    if (!ten?.trim()) return;
    let ma;
    do { ma = taoMaPhong(); } while (rooms[ma]);
    rooms[ma] = {
      players: [{ id: socket.id, ten: ten.trim(), isHost: true, ready: false, song: true, vai: null, lienLac: true }],
      trangThai: 'cho', ngay: 1,
      phieuBau: {}, phieuSoi: {}, hanhDong: {},
    };
    socket.join(ma);
    socket.maPhong = ma; socket.ten = ten.trim();
    socket.emit('vao_phong_thanh_cong', { maPhong: ma, isHost: true });
    thongBaoPhong(ma);
  });

  socket.on('vao_phong', ({ ten, maPhong }) => {
    const phong = layPhong(maPhong);
    if (!phong) return socket.emit('loi', 'Phòng không tồn tại!');
    const tenSach = ten?.trim();
    if (!tenSach) return;

    // ── RECONNECT: game đang chạy + trùng tên người mất kết nối ──
    if (phong.trangThai !== 'cho') {
      const cu = phong.players.find(p => p.ten === tenSach && p.lienLac === false);
      if (!cu) return socket.emit('loi', 'Ván đã bắt đầu hoặc tên không khớp người mất kết nối!');
      // Khôi phục
      cu.id = socket.id;
      cu.lienLac = true;
      socket.join(maPhong);
      socket.maPhong = maPhong; socket.ten = tenSach;
      socket.emit('khoi_phuc', {
        maPhong, isHost: cu.isHost,
        vai: cu.vai, icon: VAI_TRO[cu.vai]?.icon, mo_ta: VAI_TRO[cu.vai]?.mo_ta, phe: VAI_TRO[cu.vai]?.phe,
        song: cu.song,
        phase: phong.trangThai, ngay: phong.ngay,
      });
      if (VAI_TRO[cu.vai]?.phe === 'soi' && cu.song) {
        const boiSoi = nguoiSong(phong).filter(laSoiPhe).map(x => x.ten);
        rieng(cu.id, 'thong_tin_soi', { boiSoi });
      }
      heThong(maPhong, `🔌 ${tenSach} đã kết nối lại.`, 'info');
      thongBaoPhong(maPhong);
      return;
    }

    // Vào phòng chờ bình thường
    if (phong.players.length >= 50) return socket.emit('loi', 'Phòng đã đầy (tối đa 50)!');
    if (phong.players.find(p => p.ten === tenSach)) return socket.emit('loi', 'Tên đã có người dùng!');

    phong.players.push({ id: socket.id, ten: tenSach, isHost: false, ready: false, song: true, vai: null, lienLac: true });
    socket.join(maPhong);
    socket.maPhong = maPhong; socket.ten = tenSach;
    socket.emit('vao_phong_thanh_cong', { maPhong, isHost: false });
    thongBaoPhong(maPhong);
    heThong(maPhong, `👋 ${tenSach} đã vào phòng.`, 'info');
  });

  socket.on('doi_ready', () => {
    const phong = layPhong(socket.maPhong);
    if (!phong || phong.trangThai !== 'cho') return;
    const p = phong.players.find(x => x.id === socket.id);
    if (p) { p.ready = !p.ready; thongBaoPhong(socket.maPhong); }
  });

  socket.on('bat_dau_game', () => {
    const ma = socket.maPhong;
    const phong = layPhong(ma);
    if (!phong || phong.trangThai !== 'cho') return;
    const host = phong.players.find(p => p.id === socket.id);
    if (!host?.isHost) return socket.emit('loi', 'Chỉ chủ phòng mới bắt đầu được!');
    if (phong.players.length < 5) return socket.emit('loi', 'Cần ít nhất 5 người!');
    if (!phong.players.every(p => p.ready || p.isHost)) return socket.emit('loi', 'Tất cả phải sẵn sàng!');

    phong.trangThai = 'phan_vai';
    const dsVai = phatVaiNgauNhien(phong.players.length);
    phong.players.forEach((p, i) => {
      p.vai = dsVai[i]; p.song = true; p.ready = false;
      if (p.vai === 'Phù thủy') { p.thuocCuu = true; p.thuocGiet = true; }
      rieng(p.id, 'nhan_vai', {
        vai: p.vai, icon: VAI_TRO[p.vai]?.icon || '❓',
        mo_ta: VAI_TRO[p.vai]?.mo_ta || '', phe: VAI_TRO[p.vai]?.phe,
      });
    });

    io.to(ma).emit('game_bat_dau', {
      soNguoi: phong.players.length,
      phanBo: {
        soi: phong.players.filter(laSoiPhe).length,
        dan: phong.players.filter(p => VAI_TRO[p.vai]?.phe === 'dan').length,
        khac: phong.players.filter(p => VAI_TRO[p.vai]?.phe === 'khac').length,
      },
    });

    // 8s = 5s hiệu ứng chấm xoay + 3s đọc vai
    setTimeout(() => batDauDem(ma), 8000);
  });

  // ── Hành động đêm (đồng thời) ──
  socket.on('gui_hanh_dong', ({ loai, chon }) => {
    const phong = layPhong(socket.maPhong);
    if (!phong || phong.trangThai !== 'dem') return;
    const p = phong.players.find(x => x.id === socket.id);
    if (!p || !p.song) return;

    phong.hanhDong[socket.id] = { loai, chon };

    // Phiếu sói riêng
    if (loai === 'soi_giet' && chon?.length) phong.phieuSoi[socket.id] = chon;

    // Kết quả soi trả NGAY
    const tim = id => phong.players.find(x => x.id === id);
    if (loai === 'tien_tri_soi' && chon?.[0]) {
      const m = tim(chon[0]);
      if (m) {
        const laSoi = m.vai === 'Người hoá sói' ? true : (m.vai === 'Kẻ phản bội' ? false : laSoiPhe(m));
        rieng(socket.id, 'ket_qua_soi', { ten: m.ten, laSoi, vai: laSoi ? 'Ma Sói' : 'Dân Làng' });
      }
    }
    if (loai === 'phap_su' && chon?.[0]) {
      const m = tim(chon[0]);
      if (m) {
        const laSoi = m.vai === 'Người hoá sói' ? true : (m.vai === 'Kẻ phản bội' ? false : laSoiPhe(m));
        rieng(socket.id, 'ket_qua_soi', { ten: m.ten, laSoi, vai: laSoi ? 'Ma Sói' : 'Dân Làng' });
      }
    }
    if (loai === 'tien_tri_hq' && chon?.[0]) {
      const m = tim(chon[0]);
      if (m) rieng(socket.id, 'ket_qua_soi', { ten: m.ten, laSoi: laSoiPhe(m), vai: laSoiPhe(m) ? 'Phe Sói' : 'Phe Dân' });
    }
    if (loai === 'thay_boi' && chon?.[0]) {
      const m = tim(chon[0]);
      if (m) rieng(socket.id, 'ket_qua_soi', { ten: m.ten, laSoi: laSoiPhe(m), vai: m.vai });
    }
    if (loai === 'tham_tu' && chon?.[0]) {
      const song = nguoiSong(phong);
      const idx = song.findIndex(x => x.id === chon[0]);
      if (idx >= 0) {
        const nhom = [song[idx - 1], song[idx], song[idx + 1]].filter(Boolean);
        const coSoi = nhom.some(laSoiPhe);
        rieng(socket.id, 'ket_qua_soi', { ten: song[idx].ten, laSoi: coSoi, vai: coSoi ? 'Nhóm CÓ sói!' : 'Nhóm không có sói' });
      }
    }

    kiemTraDemSom(socket.maPhong);
  });

  // ── Vote (chỉ trong pha vote, người sống, mục tiêu sống) ──
  socket.on('bo_phieu', ({ mucTieuId }) => {
    const phong = layPhong(socket.maPhong);
    if (!phong || phong.trangThai !== 'vote') return;
    const voter = phong.players.find(p => p.id === socket.id);
    if (!voter || !voter.song) return;
    if (phong.nguoiBiCamVote === socket.id) return socket.emit('loi', 'Bạn bị cấm bỏ phiếu hôm nay!');
    const muc = phong.players.find(p => p.id === mucTieuId);
    if (!muc || !muc.song) return;

    phong.phieuBau[socket.id] = mucTieuId;

    // Tất cả người sống (trừ bị cấm) đã vote → chốt sớm
    const canVote = nguoiSong(phong).filter(p => p.id !== phong.nguoiBiCamVote);
    if (canVote.every(p => phong.phieuBau[p.id])) xuLyBauPhieu(socket.maPhong);
  });

  // ── Host bỏ qua thảo luận ──
  socket.on('ket_thuc_thao_luan', () => {
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const host = phong.players.find(p => p.id === socket.id);
    if (host?.isHost && phong.trangThai === 'ngay') batDauVote(socket.maPhong);
  });

  // ── Thị trưởng tiết lộ ──
  socket.on('thi_truong_tiet_lo', () => {
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const p = phong.players.find(x => x.id === socket.id);
    if (p?.vai === 'Thị trưởng' && p.song && !p.tietLo) {
      p.tietLo = true;
      heThong(socket.maPhong, `🎖️ ${p.ten} tiết lộ là THỊ TRƯỞNG! Phiếu tính gấp đôi.`, 'ngay');
    }
  });

  // ── Chat ──
  socket.on('gui_tin_nhan', ({ noiDung, kenh }) => {
    if (!noiDung?.trim() || !socket.maPhong) return;
    const phong = layPhong(socket.maPhong);
    if (!phong) return;
    const p = phong.players.find(x => x.id === socket.id);
    if (!p) return;
    const gio = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (phong.nguoiBiCamNoi === socket.id) {
      return socket.emit('loi', 'Bạn đang bị nguyền không thể nói chuyện!');
    }

    // Người chết → kênh ma
    if (!p.song) {
      io.to(socket.maPhong).emit('tin_nhan_ma', { ten: p.ten, noiDung: noiDung.trim(), thoiGian: gio });
      return;
    }

    // Ban đêm: chỉ sói chat riêng
    if (phong.trangThai === 'dem') {
      if (laSoiPhe(p)) {
        phong.players.filter(x => x.song && laSoiPhe(x)).forEach(x => {
          io.to(x.id).emit('tin_nhan_soi', { ten: p.ten, noiDung: noiDung.trim(), thoiGian: gio });
        });
      } else {
        socket.emit('loi', 'Ban đêm cả làng đang ngủ, không thể nói chuyện!');
      }
      return;
    }

    // Ban ngày: sói chọn kênh riêng
    if (kenh === 'rieng' && laSoiPhe(p)) {
      phong.players.filter(x => x.song && laSoiPhe(x)).forEach(x => {
        io.to(x.id).emit('tin_nhan_soi', { ten: p.ten, noiDung: noiDung.trim(), thoiGian: gio });
      });
      return;
    }

    io.to(socket.maPhong).emit('tin_nhan_moi', { ten: p.ten, noiDung: noiDung.trim(), thoiGian: gio });
  });

  // ── Disconnect: giữ chỗ nếu game đang chạy ──
  socket.on('disconnect', () => {
    const ma = socket.maPhong;
    if (!ma || !rooms[ma]) return;
    const phong = rooms[ma];
    const idx = phong.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;
    const p = phong.players[idx];

    if (phong.trangThai === 'cho') {
      // Phòng chờ: xóa luôn
      phong.players.splice(idx, 1);
      if (phong.players.length === 0) { delete rooms[ma]; return; }
      if (p.isHost) {
        phong.players[0].isHost = true;
        rieng(phong.players[0].id, 'tro_thanh_host', {});
      }
      heThong(ma, `👋 ${p.ten} đã rời phòng.`, 'info');
      thongBaoPhong(ma);
    } else {
      // Đang chơi: giữ chỗ cho reconnect
      p.lienLac = false;
      heThong(ma, `🔌 ${p.ten} mất kết nối — có thể vào lại bằng cùng tên + mã phòng.`, 'canh_bao');
      // Host mất kết nối → chuyển cho người đang online
      if (p.isHost) {
        const moi = phong.players.find(x => x.lienLac !== false && x.id !== p.id);
        if (moi) {
          p.isHost = false; moi.isHost = true;
          rieng(moi.id, 'tro_thanh_host', {});
        }
      }
      thongBaoPhong(ma);
      // Cả phòng offline → xóa sau 5 phút
      if (phong.players.every(x => x.lienLac === false)) {
        setTimeout(() => {
          const ph = rooms[ma];
          if (ph && ph.players.every(x => x.lienLac === false)) {
            clearTimers(ph);
            delete rooms[ma];
          }
        }, 300000);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Ma Sói server: http://localhost:${PORT}`));