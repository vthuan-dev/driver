const config = require('../config/config');
const { detectRegionFromPlace } = require('../utils/geoUtils');

// Danh sách các model Groq hỗ trợ suy luận văn bản & JSON
const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b'
];

// Kho 63 tỉnh thành Việt Nam phục vụ sinh ngẫu nhiên và kích thích sự sáng tạo của AI
const PROVINCES_POOL = [
  'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Bắc Giang', 'Lạng Sơn', 'Thái Nguyên', 'Phú Thọ',
  'Vĩnh Phúc', 'Hải Dương', 'Hưng Yên', 'Thái Bình', 'Nam Định', 'Hà Nam', 'Ninh Bình', 'Hòa Bình',
  'Sơn La', 'Điện Biên', 'Lai Châu', 'Lào Cai', 'Yên Bái', 'Hà Giang', 'Tuyên Quang', 'Cao Bằng', 'Bắc Kạn',
  'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam',
  'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai',
  'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng', 'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu',
  'Tây Ninh', 'Bình Phước', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp',
  'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
];

// Các kịch bản đời thực đa dạng kích thích AI tạo cuốc xe mới lạ, không bị đơn điệu
const CONTEXT_THEMES = [
  'Đưa đón bệnh nhân và người nhà đi khám/tái khám ở các bệnh viện tuyến Trung ương (lái xe êm, không giằng xóc)',
  'Chuyên gia, kỹ sư và đoàn công tác di chuyển tới các Khu công nghiệp, nhà máy, công trường liên tỉnh (cần hóa đơn VAT)',
  'Khách đi chơi golf cuối tuần, mang theo 2-3 bộ gậy golf cồng kềnh, cần xe cốp rộng rãi',
  'Gia đình về quê ăn cưới, đám giỗ, thăm thân có người lớn tuổi và trẻ nhỏ mang nhiều hành lý',
  'Chuyến bay sáng sớm hoặc đêm muộn đưa đón Sân bay Quốc tế, khách có nhiều vali to',
  'Khách đi du lịch trải nghiệm, khám phá danh lam thắng cảnh, săn mây, nghỉ dưỡng resort biển hoặc vùng cao',
  'Khách đi tour tâm linh, lễ chùa đầu năm/cuối năm, viếng đền đài di tích lịch sử',
  'Bao xe công tác 2 chiều trong ngày hoặc đón khẩn cấp trong 30-45 phút đi làm việc gấp'
];

// Danh mục địa danh phong phú toàn diện theo 3 miền cho Fallback Engine nội bộ (120+ địa danh)
const DETAILED_PLACES_BY_REGION = {
  north: [
    'Sân bay Nội Bài, Hà Nội',
    'Cảng tàu Tuần Châu, Hạ Long, Quảng Ninh',
    'Bãi Cháy, Hạ Long, Quảng Ninh',
    'Đảo Cát Bà, Hải Phòng',
    'Sân bay Cát Bi, Hải Phòng',
    'KCN VSIP, Bắc Ninh',
    'KCN Quế Võ, Bắc Ninh',
    'KCN Yên Phong, Bắc Ninh',
    'KCN Đình Trám, Việt Yên, Bắc Giang',
    'KCN Điềm Thụy, Thái Nguyên',
    'KCN Phố Nối A, Hưng Yên',
    'KCN Tràng Duệ, Hải Phòng',
    'Thị xã Sa Pa, Lào Cai',
    'Cáp treo Fansipan, Sa Pa',
    'Đèo Ô Quy Hồ, Lai Châu',
    'Bản Lác, Mai Châu, Hòa Bình',
    'Rừng thông Bản Áng, Mộc Châu, Sơn La',
    'Thị trấn Tà Xùa, Bắc Yên, Sơn La',
    'Khu du lịch Tràng An, Ninh Bình',
    'Chùa Bái Đính, Gia Viễn, Ninh Bình',
    'Chùa Tam Chúc, Kim Bảng, Hà Nam',
    'Thị trấn Tam Đảo, Vĩnh Phúc',
    'Đền Hùng, TP. Việt Trì, Phú Thọ',
    'Thác Bản Giốc, Trùng Khánh, Cao Bằng',
    'Hồ Ba Bể, Bắc Kạn',
    'Cửa khẩu Hữu Nghị, Lạng Sơn',
    'Thung lũng Mù Cang Chải, Yên Bái',
    'Phố cổ Đồng Văn, Hà Giang',
    'Bệnh viện Bạch Mai, Giải Phóng, Hà Nội',
    'Bệnh viện Hữu nghị Việt Đức, Hoàn Kiếm, Hà Nội',
    'Bệnh viện K Tân Triều, Thanh Trì, Hà Nội',
    'KĐT Ocean Park, Gia Lâm, Hà Nội',
    'KĐT Ecopark, Văn Giang, Hưng Yên',
    'Bến xe Mỹ Đình, Nam Từ Liêm, Hà Nội',
    'Bến xe Giáp Bát, Hoàng Mai, Hà Nội',
    'TP. Bắc Giang, Tỉnh Bắc Giang',
    'TP. Lạng Sơn, Tỉnh Lạng Sơn',
    'TP. Thái Bình, Tỉnh Thái Bình',
    'TP. Nam Định, Tỉnh Nam Định',
    'TP. Hải Dương, Tỉnh Hải Dương',
    'Sân bay Vân Đồn, Quảng Ninh'
  ],
  central: [
    'Sân bay Quốc tế Đà Nẵng',
    'Bà Nà Hills, Hòa Vang, Đà Nẵng',
    'Bán đảo Sơn Trà, Đà Nẵng',
    'Bãi biển Mỹ Khê, Ngũ Hành Sơn, Đà Nẵng',
    'Phố cổ Hội An, Quảng Nam',
    'Sân bay Chu Lai, Núi Thành, Quảng Nam',
    'Đại Nội Huế, TP. Huế',
    'Lăng Cô, Phú Lộc, Thừa Thiên Huế',
    'Đèo Hải Vân, Đà Nẵng - Huế',
    'Vườn quốc gia Phong Nha - Kẻ Bàng, Quảng Bình',
    'Động Thiên Đường, Bố Trạch, Quảng Bình',
    'Ga Đồng Hới, Quảng Bình',
    'Cửa khẩu Lao Bảo, Quảng Trị',
    'Bãi biển Cửa Lò, Nghệ An',
    'Quảng trường Hồ Chí Minh, TP. Vinh, Nghệ An',
    'TP. Hà Tĩnh, Tỉnh Hà Tĩnh',
    'KCN Formosa, Kỳ Anh, Hà Tĩnh',
    'Bãi biển Sầm Sơn, Thanh Hóa',
    'KCN Nghi Sơn, Tĩnh Gia, Thanh Hóa',
    'KCN Dung Quất, Bình Sơn, Quảng Ngãi',
    'Eo Gió - Kỳ Co, Nhơn Lý, Quy Nhơn, Bình Định',
    'Sân bay Phù Cát, An Nhơn, Bình Định',
    'Tháp Nghinh Phong, TP. Tuy Hòa, Phú Yên',
    'Gành Đá Đĩa, An Ninh Đông, Tuy An, Phú Yên',
    'Sân bay Cam Ranh, Khánh Hòa',
    'Đường Trần Phú, TP. Nha Trang, Khánh Hòa',
    'Vinpearl Harbour, Đảo Hòn Tre, Nha Trang',
    'Vịnh Vĩnh Hy, Ninh Hải, Ninh Thuận',
    'Tháp Chàm Po Klong Garai, Phan Rang, Ninh Thuận',
    'Bãi biển Mũi Né, Phan Thiết, Bình Thuận',
    'Đồi cát Bàu Trắng, Bắc Bình, Bình Thuận',
    'Hồ Xuân Hương, TP. Đà Lạt, Lâm Đồng',
    'Hồ Tuyền Lâm, Đà Lạt, Lâm Đồng',
    'Sân bay Liên Khương, Đức Trọng, Lâm Đồng',
    'Thác Dambri, TP. Bảo Lộc, Lâm Đồng',
    'Thị trấn Măng Đen, Kon Plông, Kon Tum',
    'Biển Hồ T\'Nưng, TP. Pleiku, Gia Lai',
    'Thác Dray Nur, Krông Ana, Đắk Lắk',
    'Buôn Đôn, Buôn Ma Thuột, Đắk Lắk',
    'Hồ Tà Đùng, Đắk Glong, Đắk Nông'
  ],
  south: [
    'Sân bay Tân Sơn Nhất, TP. Hồ Chí Minh',
    'Bến xe Miền Tây, Bình Tân, TP. Hồ Chí Minh',
    'Bến xe Miền Đông mới, TP. Thủ Đức, TP.HCM',
    'Quận 1 (Chợ Bến Thành), TP. Hồ Chí Minh',
    'KĐT Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh',
    'KĐT Vinhomes Grand Park, TP. Thủ Đức, TP.HCM',
    'Bệnh viện Chợ Rẫy, Quận 5, TP. Hồ Chí Minh',
    'Bệnh viện Từ Dũ, Quận 1, TP. Hồ Chí Minh',
    'Bệnh viện ĐH Y Dược, Quận 5, TP. Hồ Chí Minh',
    'Bệnh viện Ung Bướu CS2, TP. Thủ Đức, TP.HCM',
    'KCN VSIP 1, Thuận An, Bình Dương',
    'KCN VSIP 2, Thủ Dầu Một, Bình Dương',
    'KCN Sóng Thần, Dĩ An, Bình Dương',
    'KCN Bàu Bàng, Bến Cát, Bình Dương',
    'KCN Amata, TP. Biên Hòa, Đồng Nai',
    'KCN Nhơn Trạch, Đồng Nai',
    'Khu vực Sân bay Long Thành, Đồng Nai',
    'Bãi Sau, TP. Vũng Tàu, BR-VT',
    'Hồ Tràm, Xuyên Mộc, BR-VT',
    'Long Hải, Long Điền, BR-VT',
    'Cảng tàu Côn Đảo, BR-VT',
    'KDL Núi Bà Đen, TP. Tây Ninh',
    'Tòa Thánh Tây Ninh, Hòa Thành, Tây Ninh',
    'Cửa khẩu Mộc Bài, Bến Cầu, Tây Ninh',
    'Bến Ninh Kiều, Ninh Kiều, Cần Thơ',
    'Chợ nổi Cái Răng, Cần Thơ',
    'Sân bay Quốc tế Cần Thơ',
    'Bến tàu Rạch Giá, Kiên Giang',
    'Sân bay Quốc tế Phú Quốc, Kiên Giang',
    'Grand World Phú Quốc, Kiên Giang',
    'Thị trấn Hoàng Hôn Sunset Town, An Thới, Phú Quốc',
    'Hà Tiên, Kiên Giang',
    'Rừng tràm Trà Sư, Tịnh Biên, An Giang',
    'Miếu Bà Chúa Xứ Núi Sam, Châu Đốc, An Giang',
    'TP. Long Xuyên, Tỉnh An Giang',
    'Cồn Thới Sơn, TP. Mỹ Tho, Tiền Giang',
    'Chợ nổi Cái Bè, Tiền Giang',
    'Làng hoa Sa Đéc, Đồng Tháp',
    'Vườn quốc gia Tràm Chim, Tam Nông, Đồng Tháp',
    'KCN Đức Hòa, Bến Lức, Long An',
    'TP. Tân An, Long An',
    'TP. Bến Tre (Khu du lịch sinh thái dừa), Bến Tre',
    'TP. Trà Vinh, Tỉnh Trà Vinh',
    'Chùa Dơi, TP. Sóc Trăng',
    'Nhà thờ Tắc Sậy (Cha Diệp), Giá Rai, Bạc Liêu',
    'Cánh đồng quạt gió Bạc Liêu',
    'Đất Mũi, Ngọc Hiển, Cà Mau',
    'KCN Trà Nóc, Bình Thủy, Cần Thơ'
  ]
};

// Kho họ tên và danh xưng khách hàng Việt Nam đa dạng (80+ tên)
const FALLBACK_NAMES = [
  'Anh Quốc Tuấn', 'Chị Minh Thư', 'Bác sĩ Hoàng Nam', 'Kỹ sư Trọng Dũng', 'Chị Thu Trang',
  'Cô Bích Liên', 'Đoàn anh Phong (4 người)', 'Chú Năm Cần Thơ', 'Anh Hải Đăng', 'Gia đình chị Hạnh',
  'Cty TNHH Tiến Phát', 'Anh Đình Trọng', 'Chị Ngọc Mai', 'Bác Hùng Việt Trì', 'Anh Minh Quân',
  'Chị Phương Thảo', 'Anh Quang Huy', 'Chị Diệu Linh', 'Anh Tấn Phát', 'Chị Kim Ngân',
  'Đoàn anh Long đi golf', 'Cô Thu Hà', 'Anh Bảo Duy', 'Chị Khánh Huyền', 'Chú Sáu Sài Gòn',
  'Bác sĩ Thanh Hải', 'Chị Quỳnh Nga', 'Anh Hữu Nghĩa', 'Chị Yến Nhi', 'Anh Hoàng Bách',
  'Chị Mỹ Duyên', 'Anh Văn Lâm', 'Chị Ánh Tuyết', 'Anh Đăng Khoa', 'Chị Tuyết Mai',
  'Anh Thành Đạt', 'Chị Hoài An', 'Chú Ba Bình Dương', 'Anh Trí Dũng', 'Chị Cẩm Vân',
  'Anh Tuấn Kiệt', 'Chị Bích Trâm', 'Anh Duy Mạnh', 'Chị Thùy Dung', 'Bác Đức Minh',
  'Anh Thái Sơn', 'Chị Kim Oanh', 'Anh Hoàng Long', 'Chị Ngọc Ánh', 'Anh Gia Huy',
  'Chị Diễm My', 'Anh Tiến Đạt', 'Chị Thanh Trúc', 'Anh Trung Kiên', 'Chị Kiều Oanh',
  'Anh Hữu Thắng', 'Chị Minh Châu', 'Anh Khắc Tiệp', 'Chị Hồng Nhung', 'Anh Nhật Minh',
  'Chị Lan Hương', 'Anh Phúc Hưng', 'Chị Bích Hợp', 'Chú Bảy Vũng Tàu', 'Anh Xuân Trường',
  'Chị Mai Phương', 'Anh Công Phượng', 'Chị Cát Tường', 'Anh Đức Phúc', 'Chị Bảo Ngọc',
  'Anh Duy Tân', 'Chị Ngọc Trâm', 'Bác Vĩnh Phú', 'Anh Hạo Nam', 'Chị Thục Quyên',
  'Đoàn cty Hanwha', 'Chị Quế Chi', 'Anh Thanh Tùng', 'Chị Ngọc Diệp', 'Anh Anh Khoa'
];

const FALLBACK_CAR_TYPES = ['4 chỗ', '7 chỗ', '16 chỗ'];

// Kho ghi chú đời thực đa dạng bối cảnh (40+ ghi chú thực tế)
const FALLBACK_NOTES = [
  'Đón đúng giờ sảnh A, khách có 2 vali to và 1 xe đẩy em bé',
  'Cần xe sạch sẽ không mùi máy lạnh, phụ nữ mang thai dễ say xe',
  'Khách đi công tác KCN, yêu cầu xuất hóa đơn VAT điện tử sau chuyến đi',
  'Đón sáng sớm 4h30 về quê ăn cưới, tài xế lái cẩn thận an toàn',
  'Khách đi đánh golf, mang theo 2 bộ gậy cồng kềnh cần cốp xe rộng',
  'Đưa đón người lớn tuổi đi khám bệnh ở bệnh viện TW, lái xe êm ái',
  'Đón sân bay chuyến bay đêm hạ cánh lúc 23h30, hỗ trợ bê hành lý',
  'Bao xe 2 chiều trong ngày, đón 7h sáng và đợi chiều về lại',
  'Khách gia đình có 4 người lớn và 2 trẻ em, cần xe 7 chỗ rộng rãi',
  'Đón khẩn cấp trong vòng 30 phút, đi công việc gấp',
  'Khách có mang theo 1 bé cún nhỏ đã để trong lồng chuyên dụng sạch sẽ',
  'Chuyến du lịch gia đình cuối tuần, tài xế thân thiện vui vẻ nhiệt tình',
  'Khách đi lễ chùa đầu tháng, cần dừng 2 điểm trên cung đường',
  'Khách chuyên gia nước ngoài, tài xế lịch sự, xe đời mới sạch đẹp',
  'Đón tại chung cư sảnh tòa S2, khi đến gọi trước 10 phút để khách xuống',
  'Chuyến công tác các tỉnh Đông Bắc, đường đèo dốc cần lái xe kinh nghiệm',
  'Khách đón người nhà mới xuất viện, cần xe êm, không phanh gấp',
  'Xe phục vụ đám hỏi, yêu cầu xe màu trắng hoặc bạc sạch bóng',
  'Khách mang theo thùng hải sản ướp lạnh đóng xốp kín không rỉ nước',
  'Đi sân bay đúng giờ check-in quốc tế, không được trễ giờ',
  'Đón khách VIP đối tác tập đoàn, tài xế ăn mặc chỉn chu gọn gàng',
  'Chuyến nghỉ dưỡng resort biển, tài xế biết đường tắt tránh kẹt xe',
  'Khách thanh toán chuyển khoản ngân hàng ngay khi kết thúc hành trình',
  'Cần tài xế không hút thuốc lá, xe thơm tho tinh dầu tự nhiên',
  'Xe 16 chỗ đón đoàn đi teambuilding công ty, cốp để nhiều đồ',
  'Đón lúc 5h sáng để kịp ngắm bình minh và săn mây',
  'Khách đi viếng đám tang người thân ở quê, tài xế điềm đạm chu đáo',
  'Bao xe đi tour miền Tây sông nước 2 ngày 1 đêm, phụ cấp ăn ngủ tài xế riêng',
  'Đón khách tại cổng ga tàu hỏa, có biển đón tên khách',
  'Cần xe gầm cao máy khỏe đi cung đường đồi núi',
  'Khách đi ký hợp đồng kinh tế quan trọng, cần đến trước 9h sáng',
  'Khách mang theo 4 kiện hành lý to du học, cần xe 7 chỗ cốp phẳng',
  'Đón tại bến phà, khi đến nơi tài xế bấm còi hoặc gọi điện thoại',
  'Chuyến về thăm quê cha mẹ già, có ghé mua quà dọc đường 15 phút',
  'Khách quen thường xuyên đi tuyến này, chạy đúng tốc độ quy định',
  'Cần xe có cổng sạc điện thoại và kết nối bluetooth nghe nhạc nhẹ',
  'Đưa đón sếp tổng đi họp chi nhánh tỉnh, xe chạy êm ru không giằng xóc',
  'Khách đi ăn cưới nhà trai, xe hoa chạy trước xe này chạy sau hộ tống',
  'Khách du lịch tự túc, nhờ tài xế tư vấn quán ăn ngon đặc sản địa phương',
  'Chuyến bay bị delay 40 phút, tài xế theo dõi lịch trình máy bay để đón'
];

function parsePromptCountAndPrice(prompt = '', fallbackCount = 10) {
  const text = String(prompt).toLowerCase();

  let count = fallbackCount;
  const countActionMatch = text.match(/(?:tạo|sinh|làm|thêm|đăng|bắn)\s*(\d+)\b/i);
  const countNounMatch = text.match(/(\d+)\s*(?:thông báo|cuốc|chuyến|lệnh|đơn|tin|bản tin|item)\b/i);

  if (countActionMatch) {
    count = parseInt(countActionMatch[1]);
  } else if (countNounMatch) {
    count = parseInt(countNounMatch[1]);
  }

  if (count < 1) count = 1;
  if (count > 50) count = 50;

  let targetPrice = null;
  const singlePriceMatch = text.match(/giá\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)\b/);
  if (singlePriceMatch) {
    targetPrice = parseFloat(singlePriceMatch[1].replace(',', '.')) * 1000000;
  }

  return { count, targetPrice };
}

// Hàm xáo trộn ngẫu nhiên Fisher-Yates
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fallback generator đa dạng, chống trùng lặp tuyệt đối
function generateFallbackRides(count = 10, prompt = '') {
  const rides = [];
  const usedRoutes = new Set();
  const { targetPrice } = parsePromptCountAndPrice(prompt, count);
  const text = String(prompt).toLowerCase();

  // Xác định vùng miền ưu tiên nếu prompt có nhắc tới
  let targetRegions = ['north', 'central', 'south'];
  if (text.includes('miền bắc') || text.includes('bắc bộ')) {
    targetRegions = ['north'];
  } else if (text.includes('miền trung') || text.includes('trung bộ')) {
    targetRegions = ['central'];
  } else if (text.includes('miền nam') || text.includes('nam bộ') || text.includes('miền tây')) {
    targetRegions = ['south'];
  }

  // Chuẩn bị danh sách xáo trộn để không bị lặp tên, ghi chú
  const shuffledNames = shuffleArray(FALLBACK_NAMES);
  const shuffledNotes = shuffleArray(FALLBACK_NOTES);

  for (let i = 0; i < count; i++) {
    const region = targetRegions[i % targetRegions.length];
    const places = DETAILED_PLACES_BY_REGION[region] || DETAILED_PLACES_BY_REGION.north;

    let startPoint = places[Math.floor(Math.random() * places.length)];
    let endPoint = places[Math.floor(Math.random() * places.length)];
    let attempts = 0;

    while (attempts < 30 && (endPoint === startPoint || usedRoutes.has(`${startPoint}__${endPoint}`))) {
      attempts++;
      endPoint = places[Math.floor(Math.random() * places.length)];
    }

    if (startPoint === endPoint) {
      endPoint = places[(places.indexOf(startPoint) + 1) % places.length];
    }
    usedRoutes.add(`${startPoint}__${endPoint}`);

    const randomPhone = '09' + Math.floor(10000000 + Math.random() * 90000000);
    const finalPrice = targetPrice 
      ? Math.round(targetPrice) 
      : (Math.floor(Math.random() * 30 + 8) * 100000);

    const detectedRegion = detectRegionFromPlace(startPoint, endPoint);
    const name = shuffledNames[i % shuffledNames.length];
    const note = shuffledNotes[i % shuffledNotes.length];

    let carType = FALLBACK_CAR_TYPES[Math.floor(Math.random() * FALLBACK_CAR_TYPES.length)];
    if (text.includes('7 chỗ') || text.includes('5-7 chỗ')) carType = '7 chỗ';
    else if (text.includes('16 chỗ')) carType = '16 chỗ';
    else if (text.includes('4 chỗ')) carType = '4 chỗ';

    rides.push({
      name,
      phone: randomPhone,
      startPoint,
      endPoint,
      carType,
      price: finalPrice,
      region: detectedRegion,
      note,
    });
  }
  return rides;
}

exports.generateRides = async (req, res) => {
  try {
    const { prompt = '', count = 10, customApiKey } = req.body;
    const apiKey = customApiKey?.trim() || config.GROQ_API_KEY;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu lệnh yêu cầu' });
    }

    // Trích xuất số lượng và giá mục tiêu từ prompt nếu có
    const parsedParams = parsePromptCountAndPrice(prompt, parseInt(count) || 10);
    const requestedCount = parsedParams.count;
    const targetPrice = parsedParams.targetPrice;

    // Thử gọi qua Groq API
    let groqSuccess = false;
    let generatedRides = [];
    let usedModel = '';
    let errorMessage = '';

    if (apiKey) {
      // 1. Dynamic Randomized Context Injection: Bốc ngẫu nhiên tỉnh thành và bối cảnh
      const randomProvinces = shuffleArray(PROVINCES_POOL).slice(0, 8);
      const randomThemes = shuffleArray(CONTEXT_THEMES).slice(0, 3);

      const dynamicUserPrompt = `Yêu cầu từ người dùng: "${prompt}".
Nhiệm vụ: Hãy tạo đúng ${requestedCount} chuyến xe THỰC TẾ, ĐỘC ĐÁO, MỚI LẠ khắp Việt Nam.
Gợi ý bối cảnh mở rộng (để cuốc xe lạ lẫm, phong phú, tuyệt đối không bị lặp lại):
- Các tỉnh thành / địa phương nên ưu tiên xuất hiện: ${randomProvinces.join(', ')}.
- Các tình huống đời thực tham khảo: ${randomThemes.join('; ')}.
LƯU Ý CỐT LÕI:
- TUYỆT ĐỐI KHÔNG lặp lại các tuyến quen thuộc (như chỉ chạy Hà Nội - Quảng Ninh, Sài Gòn - Vũng Tàu).
- Khai thác sâu các quận/huyện, thị xã, khu công nghiệp, bệnh viện, sân bay, bến xe, khu du lịch, đền chùa tâm linh.
- Tên khách hàng, số điện thoại, tuyến đường đón - đến và ghi chú phải hoàn toàn KHÁC NHAU.`;

      const systemInstruction = `Bạn là chuyên gia điều phối cuốc xe cho ứng dụng tài xế tại Việt Nam.
Nhiệm vụ của bạn là đọc yêu cầu người dùng và tạo danh sách ĐÚNG ${requestedCount} chuyến xe thực tế, đa dạng và độc đáo tại Việt Nam (không tạo thừa, không tạo thiếu).
BẮT BUỘC trả về duy nhất định dạng JSON object theo schema:
{
  "rides": [
    {
      "name": "Tên khách Việt Nam phong phú kèm danh xưng (VD: Anh/Chị/Bác sĩ/KTS/Cô/Chú/Đoàn/Cty...)",
      "phone": "Số điện thoại di động VN 10 số (bắt đầu bằng 09, 08, 07, 03)",
      "startPoint": "Điểm đón cụ thể (quận/huyện, KCN, bệnh viện, sân bay, khách sạn, KĐT hoặc tỉnh thành)",
      "endPoint": "Điểm đến cụ thể (quận/huyện, thị xã, danh lam thắng cảnh, resort, bến tàu hoặc tỉnh thành)",
      "carType": "Loại xe (4 chỗ, 7 chỗ hoặc 16 chỗ)",
      "price": Số nguyên VNĐ,
      "region": "Vùng miền của điểm đón: 'north' (Miền Bắc), 'central' (Miền Trung/Tây Nguyên), hoặc 'south' (Miền Nam/Miền Tây)",
      "note": "Ghi chú chuyến đi thực tế, chi tiết phản ánh nhu cầu đời thực"
    }
  ]
}
YÊU CẦU QUAN TRỌNG:
1. Số lượng: Tạo CHÍNH XÁC ${requestedCount} chuyến xe trong mảng "rides". Tuyệt đối không tạo nhiều hơn hoặc ít hơn.
2. Vùng miền ("region"): Xác định chuẩn xác:
   - "north": Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, Lào Cai, Cao Bằng, Lạng Sơn, Ninh Bình...
   - "central": Đà Nẵng, Huế, Nha Trang, Cam Ranh, Đà Lạt, Quy Nhơn, Vinh, Quảng Bình, Gia Lai, Đắk Lắk...
   - "south": TP.HCM, Sài Gòn, Bình Dương, Đồng Nai, Vũng Tàu, Cần Thơ, Tây Ninh, An Giang, Phú Quốc, Cà Mau...
3. Tính Đa Dạng & Chống Lặp Lại Tuyệt Đối:
   - Nghiêm cấm sinh ra các tuyến đường trùng lặp hoặc rập khuôn một vài thành phố lớn. Hãy mở rộng sang các tỉnh thành, huyện thị, KCN, bệnh viện, bến xe, khu nghỉ dưỡng.
   - Tên khách hàng (phải khác nhau), số điện thoại (phải khác nhau), điểm đón, điểm đến và nội dung ghi chú giữa các cuốc xe phải độc nhất.
4. Giá tiền: ${targetPrice ? `Người dùng yêu cầu giá khoảng ${targetPrice} VNĐ, hãy sinh giá tiền đúng khoảng này.` : 'Giá tiền phải phù hợp với cự ly chuyến đi và câu lệnh.'}
5. Loại xe: Tuân thủ yêu cầu người dùng nếu có đề cập (4 chỗ, 7 chỗ hoặc 16 chỗ).`;

      for (const model of GROQ_MODELS) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: dynamicUserPrompt }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.88,
              seed: Math.floor(Math.random() * 10000000),
              max_tokens: 3500
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            errorMessage = errData.error?.message || `HTTP ${response.status}`;
            continue; // Thử model kế tiếp
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const rawRides = parsed.rides || parsed.trips || parsed.data || [];
            if (Array.isArray(rawRides) && rawRides.length > 0) {
              // Làm sạch dữ liệu và lọc trùng tuyến, giới hạn đúng requestedCount
              const cleanRides = [];
              const seenRoutes = new Set();
              const seenNames = new Set();

              for (const r of rawRides) {
                if (cleanRides.length >= requestedCount) break;

                const startPoint = (r.startPoint || r.start_location || r.start || '').trim();
                const endPoint = (r.endPoint || r.end_location || r.end || '').trim();
                if (!startPoint || !endPoint) continue;

                const routeKey = `${startPoint.toLowerCase()}__${endPoint.toLowerCase()}`;
                if (seenRoutes.has(routeKey)) continue;
                seenRoutes.add(routeKey);

                let price = parseInt(r.price || r.price_vnd || r.cost) || (targetPrice ? Math.round(targetPrice) : 500000);
                let phone = (r.phone || '').trim();
                if (!phone || phone.length < 9) {
                  phone = '09' + Math.floor(10000000 + Math.random() * 90000000);
                }

                let customerName = (r.name || r.customer_name || '').trim();
                if (!customerName || seenNames.has(customerName)) {
                  customerName = FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];
                }
                seenNames.add(customerName);

                // Nhận diện vùng miền chuẩn xác qua geoUtils
                const detectedRegion = detectRegionFromPlace(startPoint, endPoint);

                cleanRides.push({
                  name: customerName,
                  phone,
                  startPoint,
                  endPoint,
                  carType: (r.carType || r.vehicle_type || '7 chỗ').trim(),
                  price,
                  region: detectedRegion, // Luôn ưu tiên bộ nhận diện chuẩn xác theo địa lý thực tế
                  note: (r.note || r.notes || 'Xe sạch sẽ, đón đúng giờ').trim(),
                });
              }

              if (cleanRides.length > 0) {
                generatedRides = cleanRides;
                usedModel = model;
                groqSuccess = true;
                break; // Thành công
              }
            }
          }
        } catch (callErr) {
          errorMessage = callErr.message;
        }
      }
    }

    // Nếu Groq thành công
    if (groqSuccess && generatedRides.length > 0) {
      return res.json({
        success: true,
        source: 'groq',
        model: usedModel,
        count: generatedRides.length,
        rides: generatedRides
      });
    }

    // Fallback nếu Groq không khả dụng
    const fallbackData = generateFallbackRides(requestedCount, prompt);
    return res.json({
      success: true,
      source: 'fallback',
      model: 'internal-nlp-engine',
      count: fallbackData.length,
      rides: fallbackData,
      warning: errorMessage ? `Groq: ${errorMessage}. Hệ thống tự động chuyển sang Engine nội bộ.` : undefined
    });

  } catch (error) {
    console.error('Error generating AI rides:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi sinh cuốc xe AI: ' + error.message });
  }
};
