/**
 * Script seed 100 cuốc xe chất lượng cao cho mỗi miền (Bắc, Trung, Nam) = 300 cuốc tổng cộng.
 * Dữ liệu đầy đủ mọi loại xe: 4 chỗ, 7 chỗ, 16 chỗ, Limousine 9c, xe tiện chuyến, bao xe, cuốc gấp.
 * Chạy trên VPS:
 *   cd /var/www/driver-ui && node seed-300-waiting-requests.js
 */

const { Sequelize, DataTypes } = require('./backend/node_modules/sequelize');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'driver_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '1001',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false,
  }
);

const WaitingRequest = require('./backend/src/models/WaitingRequest')(sequelize, DataTypes);

// Danh sách họ và tên tiếng Việt phong phú
const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đoàn', 'Lâm', 'Mai', 'Trịnh', 'Đinh', 'Chu', 'Hà', 'Tạ'];
const middleNames = ['Văn', 'Thị', 'Đình', 'Hải', 'Minh', 'Thanh', 'Quốc', 'Đức', 'Anh', 'Hoàng', 'Quang', 'Ngọc', 'Hữu', 'Gia', 'Xuân', 'Kim'];
const lastNames = ['Huy', 'Dũng', 'Được', 'Tuấn', 'Long', 'Bình', 'Thịnh', 'Nam', 'Khoa', 'Nhật', 'Cường', 'Đạt', 'Sơn', 'Tùng', 'Hùng', 'Trọng', 'Bảo', 'Phát', 'Hà', 'Linh', 'Thảo', 'Phương', 'Mai', 'Yến', 'Trang', 'Hương', 'Nhi', 'Hạnh', 'Vinh', 'Toàn', 'Khánh', 'An', 'Kiên', 'Việt', 'Tâm'];

function randomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const m = middleNames[Math.floor(Math.random() * middleNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${m} ${l}`;
}

const phonePrefixes = ['090', '091', '093', '094', '096', '097', '098', '086', '088', '089', '070', '079', '077', '076', '078', '032', '033', '034', '035', '036', '037', '038', '039'];
function randomPhone() {
  const p = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
  const rest = Math.floor(1000000 + Math.random() * 9000000).toString().slice(0, 7);
  return p + rest;
}

// ─────────────────────────────────────────────────────────────
// Tuyến đường Miền Trung (100 cuốc)
// ─────────────────────────────────────────────────────────────
const centralRoutes = [
  // Huế - Đà Nẵng - Quảng Nam
  { from: 'Thừa Thiên - Huế', to: 'Đà Nẵng', dist: 'mid', type: 'bao', car: '7', note: 'Giá bao xe Limousine 9c ghế VIP' },
  { from: 'Huế', to: 'Đà Nẵng', dist: 'mid', type: 'ghep', car: '4', note: 'Tiện chuyến xe 4 chỗ, đón tận nhà sảnh A' },
  { from: 'Đà Nẵng', to: 'Huế', dist: 'mid', type: 'round', car: '7', note: 'Bao xe 7 chỗ 2 chiều đi khám bệnh về trong ngày' },
  { from: 'Đà Nẵng', to: 'Hội An', dist: 'short', type: 'bao', car: '4', note: 'Xe 4 chỗ đón sân bay Đà Nẵng về Phố Cổ Hội An' },
  { from: 'Hội An', to: 'Đà Nẵng', dist: 'short', type: 'urgent', car: '7', note: 'Cuốc gấp cần xe 7 chỗ ra sân bay gấp kịp giờ bay' },
  { from: 'Đà Nẵng', to: 'Tam Kỳ (Quảng Nam)', dist: 'mid', type: 'ghep', car: '4', note: 'Xe 4 chỗ ghép 1 khách, xe sạch sẽ không mùi thuốc' },
  { from: 'Tam Kỳ', to: 'Đà Nẵng', dist: 'mid', type: 'bao', car: '7', note: 'Xe 7 chỗ đón gia đình đi mua sắm tại Đà Nẵng' },
  { from: 'Đà Nẵng', to: 'Bà Nà Hills', dist: 'short', type: 'round', car: '7', note: 'Bao xe 7 chỗ khứ hồi đi Bà Nà, đợi khách đến 17h' },
  { from: 'Đà Nẵng', to: 'Quảng Ngãi', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ chạy cao tốc Đà Nẵng - Quảng Ngãi' },
  { from: 'Quảng Ngãi', to: 'Đà Nẵng', dist: 'long', type: 'ghep', car: '4', note: 'Xe 4 chỗ tiện chuyến đi công tác, có hóa đơn điện tử' },
  { from: 'Chu Lai', to: 'Đà Nẵng', dist: 'mid', type: 'urgent', car: '4', note: 'Cần xe 4 chỗ đón gấp sân bay Chu Lai về Hải Châu' },

  // Huế - Quảng Trị - Quảng Bình
  { from: 'Huế', to: 'Đông Hà (Quảng Trị)', dist: 'mid', type: 'bao', car: '4', note: 'Xe 4 chỗ đi công việc Đông Hà trong buổi sáng' },
  { from: 'Quảng Trị', to: 'Huế', dist: 'mid', type: 'round', car: '7', note: 'Xe 7 chỗ 2 chiều đi Bệnh viện TW Huế khám bệnh' },
  { from: 'Đông Hà', to: 'Đồng Hới (Quảng Bình)', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ Xpander xe mới máy lạnh mát' },
  { from: 'Đồng Hới', to: 'Phong Nha Kẻ Bàng', dist: 'short', type: 'round', car: '16', note: 'Xe 16 chỗ Ford Transit chở đoàn tham quan động Phong Nha' },
  { from: 'Đồng Hới', to: 'Huế', dist: 'long', type: 'bao', car: '7', note: 'Xe 7 chỗ gia đình về quê thăm người thân' },
  { from: 'Quảng Bình', to: 'Đà Nẵng', dist: 'long', type: 'bao', car: '16', note: 'Bao xe 16 chỗ Solati đi dự hội nghị khách hàng' },

  // Nghệ An - Hà Tĩnh
  { from: 'Vinh (Nghệ An)', to: 'Hà Tĩnh', dist: 'short', type: 'ghep', car: '4', note: 'Xe 4 chỗ tiện chuyến đi cầu Bến Thủy' },
  { from: 'Hà Tĩnh', to: 'Vinh', dist: 'short', type: 'urgent', car: '4', note: 'Cuốc gấp xe 4 chỗ ra ga Vinh kịp chuyến tàu 14h' },
  { from: 'Vinh', to: 'Cửa Lò', dist: 'short', type: 'round', car: '7', note: 'Xe 7 chỗ chở gia đình đi tắm biển Cửa Lò' },
  { from: 'Hà Tĩnh', to: 'Đồng Hới', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ chạy êm tài xế nhiệt tình' },
  { from: 'Vinh', to: 'Kỳ Anh (Hà Tĩnh)', dist: 'mid', type: 'bao', car: '4', note: 'Xe 4 chỗ đi thị xã Kỳ Anh công tác' },

  // Bình Định (Quy Nhơn) - Phú Yên (Tuy Hòa) - Khánh Hòa (Nha Trang)
  { from: 'Quy Nhơn', to: 'Tuy Hòa (Phú Yên)', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ du lịch Quy Nhơn - Tuy Hòa' },
  { from: 'Tuy Hòa', to: 'Quy Nhơn', dist: 'mid', type: 'ghep', car: '4', note: 'Xe 4 chỗ tiện chuyến đón tận nơi lúc 9h' },
  { from: 'Nha Trang', to: 'Sân bay Cam Ranh', dist: 'short', type: 'bao', car: '4', note: 'Xe 4 chỗ sedan đưa khách ra Cam Ranh chuyến 16h' },
  { from: 'Cam Ranh', to: 'Nha Trang', dist: 'short', type: 'urgent', car: '7', note: 'Cuốc gấp đón sân bay Cam Ranh về khách sạn Trần Phú' },
  { from: 'Nha Trang', to: 'Đà Lạt', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đi đèo Khánh Lê sang Đà Lạt mát mẻ' },
  { from: 'Đà Lạt', to: 'Nha Trang', dist: 'long', type: 'round', car: '16', note: 'Xe 16 chỗ đưa đoàn du lịch Đà Lạt xuống biển Nha Trang' },
  { from: 'Nha Trang', to: 'Phan Rang (Ninh Thuận)', dist: 'mid', type: 'bao', car: '4', note: 'Xe 4 chỗ đi Phan Rang ngắm vườn nho tháp Chàm' },
  { from: 'Tuy Hòa', to: 'Nha Trang', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ Veloz đời mới đón tận nhà' },
  { from: 'Quy Nhơn', to: 'Sân bay Phù Cát', dist: 'short', type: 'urgent', car: '4', note: 'Cần xe 4 chỗ ra sân bay Phù Cát gấp đón khách' },

  // Tây Nguyên: Gia Lai, Kon Tum, Đắk Lắk, Lâm Đồng
  { from: 'Pleiku (Gia Lai)', to: 'Quy Nhơn', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đổ đèo An Khê về Quy Nhơn' },
  { from: 'Pleiku', to: 'Kon Tum', dist: 'short', type: 'ghep', car: '4', note: 'Xe 4 chỗ ghép đi lại trong ngày' },
  { from: 'Buôn Ma Thuột', to: 'Gia Lai', dist: 'long', type: 'bao', car: '7', note: 'Xe 7 chỗ chạy QL14 êm ái tài xế cẩn thận' },
  { from: 'Buôn Ma Thuột', to: 'Nha Trang', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ qua đèo Phượng Hoàng' },
  { from: 'Đà Lạt', to: 'Bảo Lộc', dist: 'mid', type: 'bao', car: '4', note: 'Xe 4 chỗ đón tại Đà Lạt về Bảo Lộc' },
  { from: 'Phan Thiết (Bình Thuận)', to: 'Nha Trang', dist: 'long', type: 'bao', car: '16', note: 'Xe 16 chỗ du lịch cung đường biển tuyệt đẹp' },
  { from: 'Phan Thiết', to: 'Mũi Né', dist: 'short', type: 'round', car: '7', note: 'Bao xe 7 chỗ tham quan đồi cát Bàu Trắng' },
  { from: 'Quảng Ngãi', to: 'Cảng Sa Kỳ', dist: 'short', type: 'urgent', car: '4', note: 'Xe 4 chỗ đi gấp kịp chuyến tàu ra đảo Lý Sơn' }
];

// ─────────────────────────────────────────────────────────────
// Tuyến đường Miền Bắc (100 cuốc)
// ─────────────────────────────────────────────────────────────
const northRoutes = [
  { from: 'Hà Nội', to: 'Hà Nam', dist: 'short', type: 'round', car: '4', note: 'Đi 2 chiều, Hà Nội - Hà Nam, Toyota altis' },
  { from: 'Bắc Ninh', to: 'Sơn La', dist: 'long', type: 'bao', car: '7', note: 'xe innova cross 2026 8 chỗ' },
  { from: 'Hà Nội', to: 'Nam Định', dist: 'mid', type: 'ghep', car: '4', note: 'Khách 1 người ít đồ, xe sạch sẽ không khói thuốc' },
  { from: 'Hà Nội', to: 'Quảng Ninh (Hạ Long)', dist: 'long', type: 'bao', car: '7', note: 'Đi đường cao tốc, cần xe cốp rộng chở hành lý' },
  { from: 'Hải Phòng', to: 'Hà Nội', dist: 'mid', type: 'bao', car: '4', note: 'Khách đi công tác trong ngày, xuất vé hoặc hóa đơn VAT' },
  { from: 'Hà Nội', to: 'Ninh Bình (Tràng An)', dist: 'mid', type: 'round', car: '7', note: 'Gia đình 5 người tham quan Tràng An Bái Đính về trong ngày' },
  { from: 'Hà Nội', to: 'Sân bay Nội Bài', dist: 'short', type: 'urgent', car: '4', note: 'Cuốc gấp đón sảnh T1 Nội Bài về Cầu Giấy lúc 15h' },
  { from: 'Nội Bài', to: 'Thái Nguyên', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đón chuyên gia Hàn Quốc về KCN Yên Bình' },
  { from: 'Hà Nội', to: 'Bắc Giang', dist: 'short', type: 'ghep', car: '4', note: 'Xe 4 chỗ tiện chuyến đi KCN Đình Trám' },
  { from: 'Hà Nội', to: 'Hải Dương', dist: 'short', type: 'bao', car: '4', note: 'Xe 4 chỗ sedan đưa đón đám cưới sạch đẹp' },
  { from: 'Hà Nội', to: 'Hưng Yên', dist: 'short', type: 'ghep', car: '4', note: 'Tiện chuyến xe ghép 4 chỗ về Ecopark / Văn Giang' },
  { from: 'Hà Nội', to: 'Vĩnh Phúc (Tam Đảo)', dist: 'mid', type: 'round', car: '7', note: 'Bao xe 7 chỗ lên Tam Đảo nghỉ dưỡng cuối tuần' },
  { from: 'Hà Nội', to: 'Phú Thọ (Việt Trì)', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đi thăm người thân đền Hùng' },
  { from: 'Hà Nội', to: 'Thái Bình', dist: 'mid', type: 'bao', car: '4', note: 'Xe 4 chỗ về Tiền Hải Thái Bình êm ái' },
  { from: 'Hà Nội', to: 'Hòa Bình', dist: 'mid', type: 'round', car: '7', note: 'Xe 7 chỗ đi Serena Kim Bôi tắm khoáng nóng 2 ngày 1 đêm' },
  { from: 'Hà Nội', to: 'Sa Pa (Lào Cai)', dist: 'long', type: 'bao', car: '16', note: 'Xe 16 chỗ Solati chở đoàn tham quan Sa Pa Fansipan' },
  { from: 'Hà Nội', to: 'Mộc Châu (Sơn La)', dist: 'long', type: 'round', car: '7', note: 'Xe 7 chỗ Fortuner leo đèo an toàn đi đồi chè Mộc Châu' },
  { from: 'Hà Nội', to: 'Lạng Sơn', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đi cửa khẩu Hữu Nghị lấy hàng' },
  { from: 'Hải Phòng', to: 'Quảng Ninh', dist: 'short', type: 'ghep', car: '4', note: 'Tiện chuyến Hải Phòng sang Bãi Cháy' },
  { from: 'Quảng Ninh (Cẩm Phả)', to: 'Hà Nội', dist: 'long', type: 'urgent', car: '7', note: 'Cuốc gấp 7 chỗ cao tốc Cẩm Phả về Hà Nội khám bệnh' }
];

// ─────────────────────────────────────────────────────────────
// Tuyến đường Miền Nam (100 cuốc)
// ─────────────────────────────────────────────────────────────
const southRoutes = [
  { from: 'TP. Hồ Chí Minh', to: 'Vũng Tàu', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ Xpander đi du lịch biển cuối tuần' },
  { from: 'Vũng Tàu', to: 'TP. Hồ Chí Minh', dist: 'mid', type: 'ghep', car: '4', note: 'Tiện chuyến xe 4 chỗ đón Bãi Sau về Quận 1' },
  { from: 'TP. Hồ Chí Minh', to: 'Biên Hòa (Đồng Nai)', dist: 'short', type: 'ghep', car: '4', note: 'Xe ghép 4 chỗ đi làm hàng ngày đón ngã 4 Thủ Đức' },
  { from: 'TP. Hồ Chí Minh', to: 'Thủ Dầu Một (Bình Dương)', dist: 'short', type: 'bao', car: '4', note: 'Xe 4 chỗ đi TTTM Becamex công tác' },
  { from: 'TP. Hồ Chí Minh', to: 'Bến Cát (Bình Dương)', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đi KCN Mỹ Phước 3' },
  { from: 'TP. Hồ Chí Minh', to: 'Sân bay Tân Sơn Nhất', dist: 'short', type: 'urgent', car: '4', note: 'Cuốc gấp xe 4 chỗ ra sân bay Tân Sơn Nhất chuyến quốc nội' },
  { from: 'Tân Sơn Nhất', to: 'Long An (Tân An)', dist: 'mid', type: 'bao', car: '7', note: 'Bao xe 7 chỗ đón sảnh quốc tế về Tân An' },
  { from: 'TP. Hồ Chí Minh', to: 'Tây Ninh', dist: 'mid', type: 'round', car: '7', note: 'Xe 7 chỗ khứ hồi đi Núi Bà Đen viếng chùa' },
  { from: 'TP. Hồ Chí Minh', to: 'Mỹ Tho (Tiền Giang)', dist: 'mid', type: 'ghep', car: '4', note: 'Xe tiện chuyến 4 chỗ đón tại Quận 5' },
  { from: 'TP. Hồ Chí Minh', to: 'Bến Tre', dist: 'mid', type: 'round', car: '7', note: 'Bao xe 7 chỗ về quê Bến Tre ăn giỗ trong ngày' },
  { from: 'TP. Hồ Chí Minh', to: 'Cần Thơ', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ chạy cao tốc Mỹ Thuận - Cần Thơ êm ái' },
  { from: 'Cần Thơ', to: 'TP. Hồ Chí Minh', dist: 'long', type: 'urgent', car: '7', note: 'Cuốc gấp 7 chỗ đưa khách lên Sài Gòn nhập viện' },
  { from: 'TP. Hồ Chí Minh', to: 'Phan Thiết (Mũi Né)', dist: 'long', type: 'bao', car: '16', note: 'Bao xe 16 chỗ Solati đi resort Mũi Né 3 ngày 2 đêm' },
  { from: 'TP. Hồ Chí Minh', to: 'Đà Lạt', dist: 'long', type: 'bao', car: '7', note: 'Bao xe Limousine 9c lên Đà Lạt đón tận nhà' },
  { from: 'TP. Hồ Chí Minh', to: 'Hồ Tràm (Bà Rịa)', dist: 'mid', type: 'round', car: '7', note: 'Bao xe 7 chỗ nghỉ dưỡng Melia Hồ Tràm 2 chiều' },
  { from: 'Cần Thơ', to: 'Cà Mau', dist: 'long', type: 'bao', car: '7', note: 'Xe 7 chỗ về đất mũi Cà Mau tham quan' },
  { from: 'Cần Thơ', to: 'Rạch Giá (Kiên Giang)', dist: 'mid', type: 'urgent', car: '4', note: 'Cần xe 4 chỗ gấp đi bến tàu Rạch Giá ra đảo Phú Quốc' },
  { from: 'TP. Hồ Chí Minh', to: 'Vĩnh Long', dist: 'mid', type: 'ghep', car: '4', note: 'Tiện chuyến xe 4 chỗ sedan sạch sẽ' },
  { from: 'TP. Hồ Chí Minh', to: 'Đồng Tháp (Cao Lãnh)', dist: 'long', type: 'bao', car: '7', note: 'Bao xe 7 chỗ về thăm làng hoa Sa Đéc' },
  { from: 'TP. Hồ Chí Minh', to: 'Bình Phước (Đồng Xoài)', dist: 'mid', type: 'bao', car: '7', note: 'Xe 7 chỗ đi thăm vườn cao su công tác' }
];

function getPrice(dist, carType, isRound) {
  let base = 350000;
  if (dist === 'short') base = Math.floor(250000 + Math.random() * 200000);
  else if (dist === 'mid') base = Math.floor(650000 + Math.random() * 450000);
  else base = Math.floor(1200000 + Math.random() * 1200000);

  if (carType === '7') base = Math.round(base * 1.35);
  else if (carType === '16') base = Math.round(base * 1.85);

  if (isRound) base = Math.round(base * 1.7);

  // Làm tròn tới 50.000đ
  return Math.round(base / 50000) * 50000;
}

function generateRegionRides(region, templates, count = 100) {
  const rides = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const tmpl = templates[i % templates.length];
    const isRound = tmpl.type === 'round';
    const price = getPrice(tmpl.dist, tmpl.car, isRound);
    
    // createdAt trải dài từ vừa xong (1 phút trước) đến vài tiếng trước
    // Cứ mỗi cuốc cách nhau khoảng 30s - 90s để tạo độ tự nhiên
    const timeOffsetMs = (i * 45 * 1000) + Math.floor(Math.random() * 20000);
    const createdAt = new Date(now - timeOffsetMs);

    rides.push({
      userId: 1, // Reference admin/driver
      name: randomName(),
      phone: randomPhone(),
      startPoint: tmpl.from,
      endPoint: tmpl.to,
      price: price,
      note: tmpl.note,
      status: 'waiting',
      region: region,
      createdAt: createdAt,
      updatedAt: createdAt,
      driverPostId: null,
      isReadByDriver: 0
    });
  }

  return rides;
}

async function runSeed() {
  try {
    console.log('🔗 Đang kết nối MySQL database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');

    console.log('\n📦 Đang tạo 100 cuốc xe Miền Bắc...');
    const northRides = generateRegionRides('north', northRoutes, 100);

    console.log('📦 Đang tạo 100 cuốc xe Miền Trung...');
    const centralRides = generateRegionRides('central', centralRoutes, 100);

    console.log('📦 Đang tạo 100 cuốc xe Miền Nam...');
    const southRides = generateRegionRides('south', southRoutes, 100);

    const allRides = [...northRides, ...centralRides, ...southRides];

    console.log(`\n🚀 Đang nạp ${allRides.length} cuốc xe vào bảng waiting_requests...`);
    await WaitingRequest.bulkCreate(allRides);

    console.log('✅ Nạp dữ liệu hoàn tất!');

    const [counts] = await sequelize.query(`
      SELECT region, count(*) as count 
      FROM waiting_requests 
      WHERE status = 'waiting' 
      GROUP BY region
    `);

    console.log('\n📊 Thống kê cuốc xe đang chờ (waiting) trong hệ thống:');
    counts.forEach(row => {
      console.log(` - Miền ${row.region === 'north' ? 'Bắc (north)' : row.region === 'central' ? 'Trung (central)' : 'Nam (south)'}: ${row.count} cuốc`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi seed dữ liệu:', err);
    process.exit(1);
  }
}

runSeed();
