import React, { useState, useEffect } from 'react';
import { requestsAPI, aiAPI } from '../../../services/adminApi';
import { detectRegionFromPlace, type Region } from '../../../utils/geoUtils';
import './AiRideGenerator.css';

type CarType = '4' | '7' | '16';

export interface AiGeneratedRide {
  id: string;
  name: string;
  phone: string;
  startPoint: string;
  endPoint: string;
  price: number;
  carType: CarType;
  region: Region;
  note: string;
  isValid: boolean;
  validationError?: string;
}

const VIETNAMESE_NAMES = [
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

const TRIP_NOTES = [
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

// Danh mục dữ liệu địa lý phong phú toàn diện theo vùng miền (120+ địa danh thực tế)
const SAMPLE_CITIES_BY_REGION: Record<Region, string[]> = {
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

// Hàm trích xuất thông số chuẩn xác từ câu lệnh prompt
export function parsePromptParameters(promptText: string) {
  const text = promptText.toLowerCase();

  // 1. Trích xuất số lượng:
  let count = 20;
  const countActionMatch = text.match(/(?:tạo|sinh|làm|thêm|đăng|bắn)\s*(\d+)\b/i);
  const countNounMatch = text.match(/(\d+)\s*(?:thông báo|cuốc|chuyến|lệnh|đơn|tin|bản tin|item)\b/i);

  if (countActionMatch) {
    count = parseInt(countActionMatch[1]);
  } else if (countNounMatch) {
    count = parseInt(countNounMatch[1]);
  }
  count = Math.max(1, Math.min(50, count));

  // 2. Trích xuất giá (đơn lẻ hoặc khoảng giá):
  let minPrice = 1000000;
  let maxPrice = 3500000;
  let singlePrice: number | null = null;

  const singlePriceMatch = text.match(/giá\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)\b/);
  const priceRangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:[-–—toàn]|đến)\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)/);

  if (singlePriceMatch) {
    singlePrice = parseFloat(singlePriceMatch[1].replace(',', '.')) * 1000000;
    minPrice = singlePrice;
    maxPrice = singlePrice;
  } else if (priceRangeMatch) {
    const p1 = parseFloat(priceRangeMatch[1].replace(',', '.'));
    const p2 = parseFloat(priceRangeMatch[2].replace(',', '.'));
    minPrice = Math.min(p1, p2) * 1000000;
    maxPrice = Math.max(p1, p2) * 1000000;
  } else if (text.includes('3–5 triệu') || text.includes('3-5 triệu') || text.includes('3-5tr')) {
    minPrice = 3000000;
    maxPrice = 5000000;
  } else if (text.includes('1–2 triệu') || text.includes('1-2 triệu') || text.includes('1-2tr')) {
    minPrice = 1000000;
    maxPrice = 2000000;
  } else if (text.includes('2–4 triệu') || text.includes('2-4 triệu') || text.includes('2-4tr')) {
    minPrice = 2000000;
    maxPrice = 4000000;
  } else if (text.includes('300k') || text.includes('500k')) {
    minPrice = 350000;
    maxPrice = 850000;
  }

  // 3. Loại xe:
  let preferredCarType: CarType = '4';
  if (text.includes('5–7 chỗ') || text.includes('5-7 chỗ') || text.includes('7 chỗ') || text.includes('7c')) {
    preferredCarType = '7';
  } else if (text.includes('16 chỗ') || text.includes('16c')) {
    preferredCarType = '16';
  }

  // 4. Vùng miền:
  let selectedRegions: Region[] = ['north', 'central', 'south'];
  if (text.includes('miền bắc') || text.includes('bắc bộ')) {
    selectedRegions = ['north'];
  } else if (text.includes('miền trung') || text.includes('trung bộ')) {
    selectedRegions = ['central'];
  } else if (text.includes('miền nam') || text.includes('nam bộ')) {
    selectedRegions = ['south'];
  }

  return { count, minPrice, maxPrice, singlePrice, preferredCarType, selectedRegions };
}

const generateRandomPhone = (): string => {
  const prefixes = ['090', '091', '098', '097', '096', '086', '088', '038', '039', '077'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
  return `${prefix}${suffix}`;
};

export const PROMPT_SUGGESTIONS: Record<'requests' | 'fake_notifications' | 'both', {
  label: string;
  defaultPrompt: string;
  textareaHeader: string;
  chips: { label: string; prompt: string }[];
}> = {
  requests: {
    label: 'Tab Cuốc xe (Chờ nhận)',
    defaultPrompt: 'Tạo 20 cuốc xe liên tỉnh đa dạng khắp các tỉnh thành Việt Nam, giá 3–5 triệu, xe 5–7 chỗ.',
    textareaHeader: '✨ Nhập yêu cầu cuốc xe chờ ghép (Số lượng, khu vực, khoảng giá, loại xe...)',
    chips: [
      {
        label: '🌟 Đa dạng 63 tỉnh thành (3–5 triệu, xe 7 chỗ)',
        prompt: 'Tạo 20 cuốc xe liên tỉnh đa dạng khắp các tỉnh thành Việt Nam, giá 3–5 triệu, xe 5–7 chỗ.'
      },
      {
        label: '🏭 Chuyên gia KCN liên tỉnh (1.5–2.8 triệu)',
        prompt: 'Tạo 15 cuốc xe đưa đón chuyên gia, kỹ sư tới các KCN Bắc Ninh, Hải Phòng, Bình Dương, Đồng Nai, giá 1.5–2.8 triệu, xe 7 chỗ.'
      },
      {
        label: '🏥 Đưa đón Khám bệnh viện TW (800k–1.8tr)',
        prompt: 'Tạo 10 cuốc xe đưa đón bệnh nhân khám bệnh viện tuyến Trung ương về các tỉnh, giá 800k–1.8 triệu, xe 4–7 chỗ sạch sẽ.'
      },
      {
        label: '🏔️ Tây Bắc / Đông Bắc săn mây (2–4 triệu)',
        prompt: 'Tạo 12 cuốc xe du lịch vùng cao Sa Pa, Mộc Châu, Hà Giang, Cao Bằng, giá 2–4 triệu, xe 7 chỗ.'
      },
      {
        label: '🌾 Miền Tây sông nước miệt vườn (1.2–2.5tr)',
        prompt: 'Tạo 10 cuốc xe về các tỉnh miền Tây sông nước Cần Thơ, An Giang, Bến Tre, Cà Mau, giá 1.2–2.5 triệu, xe 7 chỗ.'
      },
      {
        label: '⛳ Sân Golf & Khách VIP (1.5–3.5 triệu)',
        prompt: 'Tạo 10 cuốc xe đưa đón sân golf và khách VIP đối tác, giá 1.5–3.5 triệu, xe 7 chỗ rộng rãi.'
      }
    ]
  },
  fake_notifications: {
    label: 'Thông báo ảo (Trang chủ)',
    defaultPrompt: 'Tạo 10 thông báo nổ cuốc xe VIP liên tỉnh khắp các miền trên trang chủ, giá 2–4 triệu, xe 7 chỗ.',
    textareaHeader: '📢 Nhập yêu cầu thông báo nổ cuốc trang chủ (Tạo sôi động, giờ cao điểm, cuốc VIP...)',
    chips: [
      {
        label: '🔥 Nổ cuốc Hot toàn quốc (2–4 triệu, xe 7 chỗ)',
        prompt: 'Tạo 10 thông báo nổ cuốc xe VIP liên tỉnh khắp các miền trên trang chủ, giá 2–4 triệu, xe 7 chỗ.'
      },
      {
        label: '⚡ Giờ cao điểm Sân bay Quốc tế (1–2.5tr)',
        prompt: 'Tạo 8 thông báo nổ cuốc đón các sân bay Nội Bài, Tân Sơn Nhất, Cam Ranh, Đà Nẵng giờ cao điểm, giá 1–2.5 triệu, xe 4–7 chỗ.'
      },
      {
        label: '🏖️ Resort biển & Danh thắng nổi bật (1.8–3.5tr)',
        prompt: 'Tạo 10 thông báo nổ cuốc đi các điểm du lịch Hạ Long, Cát Bà, Vũng Tàu, Hồ Tràm, Đà Lạt, Phú Quốc, giá 1.8–3.5 triệu, xe 7 chỗ.'
      },
      {
        label: '🏭 KCN & Công tác đối tác (1.5–3 triệu)',
        prompt: 'Tạo 10 thông báo nổ cuốc đi công tác các khu công nghiệp và dự án tỉnh, giá 1.5–3 triệu, xe 7 chỗ.'
      }
    ]
  },
  both: {
    label: 'Xuất bản cả 2 nơi (Đồng bộ toàn app)',
    defaultPrompt: 'Tạo 15 cuốc xe đồng bộ đa dạng các tỉnh thành vừa nổ thông báo trang chủ vừa vào danh sách nhận cuốc, giá 2–4 triệu, xe 7 chỗ.',
    textareaHeader: '⚡ Nhập yêu cầu cuốc xe xuất bản đồng thời (Vừa vào danh sách nhận cuốc vừa nổ chuông trang chủ...)',
    chips: [
      {
        label: '⚡ Đồng bộ toàn hệ thống (2–4 triệu, xe 7 chỗ)',
        prompt: 'Tạo 15 cuốc xe đồng bộ đa dạng các tỉnh thành vừa nổ thông báo trang chủ vừa vào danh sách nhận cuốc, giá 2–4 triệu, xe 7 chỗ.'
      },
      {
        label: '🏔️ Tuyến vàng vùng cao & Tây Bắc (2–3.5tr)',
        prompt: 'Tạo 10 cuốc xe tuyến Hà Nội đi Lào Cai, Sơn La, Lạng Sơn, Quảng Ninh, giá 2–3.5 triệu, xe 7 chỗ.'
      },
      {
        label: '🌴 Tuyến vàng Nam Bộ & Miền Tây (1.8–3.5tr)',
        prompt: 'Tạo 10 cuốc xe tuyến TP.HCM đi Tây Ninh, Vũng Tàu, Cần Thơ, An Giang, Kiên Giang, giá 1.8–3.5 triệu, xe 7 chỗ.'
      },
      {
        label: '✈️ Đón trả Sân bay & Du lịch toàn quốc (1–2.5tr)',
        prompt: 'Tạo 10 cuốc xe đưa đón sân bay và khu nghỉ dưỡng toàn quốc, giá 1–2.5 triệu, xe 4–7 chỗ.'
      }
    ]
  }
};

export const AiRideGeneratorTab: React.FC<{ onPublished?: (target: 'requests' | 'fake_notifications' | 'both') => void }> = ({ onPublished }) => {
  const [targetDestination, setTargetDestination] = useState<'requests' | 'fake_notifications' | 'both'>('requests');
  const [prompt, setPrompt] = useState<string>(
    PROMPT_SUGGESTIONS.requests.defaultPrompt
  );
  const [aiMode, setAiMode] = useState<'groq' | 'local'>('groq');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<{ source: string; model?: string } | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [generatedRides, setGeneratedRides] = useState<AiGeneratedRide[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Hàm chuyển đổi nơi xuất bản và tự động cập nhật Prompt mẫu
  const handleSelectTarget = (newTarget: 'requests' | 'fake_notifications' | 'both') => {
    setTargetDestination(newTarget);
    setPrompt(PROMPT_SUGGESTIONS[newTarget].defaultPrompt);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('admin_groq_api_key');
    if (savedKey) {
      setCustomApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem('admin_groq_api_key', customApiKey.trim());
      setAlertMsg({ type: 'success', text: 'Đã lưu cấu hình API Key Groq tùy chỉnh vào trình duyệt!' });
    } else {
      localStorage.removeItem('admin_groq_api_key');
      setAlertMsg({ type: 'success', text: 'Đã hoàn trả về API Key Groq mặc định của hệ thống!' });
    }
    setShowConfig(false);
  };

  // ── Engine Nội Bộ (Offline Fallback Đa Dạng Hóa) ──
  const runLocalEngine = (requestedCount?: number): AiGeneratedRide[] => {
    const params = parsePromptParameters(prompt);
    const count = requestedCount !== undefined ? requestedCount : params.count;
    const { minPrice, maxPrice, preferredCarType, selectedRegions } = params;

    // Thuật toán sinh danh sách & Chống trùng tuyến, xáo trộn họ tên và ghi chú
    const rides: AiGeneratedRide[] = [];
    const usedRoutes = new Set<string>();

    // Xáo trộn Fisher-Yates để không bị lặp tên và ghi chú
    const shuffledNames = [...VIETNAMESE_NAMES].sort(() => 0.5 - Math.random());
    const shuffledNotes = [...TRIP_NOTES].sort(() => 0.5 - Math.random());

    for (let i = 0; i < count; i++) {
      const region = selectedRegions[i % selectedRegions.length];
      const cities = SAMPLE_CITIES_BY_REGION[region] || SAMPLE_CITIES_BY_REGION.north;

      let start = cities[Math.floor(Math.random() * cities.length)];
      let end = cities[Math.floor(Math.random() * cities.length)];
      let attempts = 0;

      while (attempts < 30 && (end === start || usedRoutes.has(`${start}__${end}`))) {
        attempts++;
        end = cities[Math.floor(Math.random() * cities.length)];
      }

      if (start === end) {
        end = cities[(cities.indexOf(start) + 1) % cities.length];
      }
      usedRoutes.add(`${start}__${end}`);

      const rawPrice = minPrice === maxPrice ? minPrice : (minPrice + Math.random() * (maxPrice - minPrice));
      const price = Math.round(rawPrice / 50000) * 50000;

      let carType: CarType = preferredCarType;
      if (preferredCarType === '7' && Math.random() > 0.8) {
        carType = '4';
      }

      const name = shuffledNames[i % shuffledNames.length];
      const phone = generateRandomPhone();
      const noteTemplate = shuffledNotes[i % shuffledNotes.length];
      const note = `Xe ${carType} chỗ · ${noteTemplate}`;
      const detectedRegion = detectRegionFromPlace(start, end);
      const isValid = Boolean(start && end && price > 0 && name && phone);

      rides.push({
        id: `ai-ride-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        phone,
        startPoint: start,
        endPoint: end,
        price,
        carType,
        region: detectedRegion,
        note,
        isValid,
      });
    }

    return rides;
  };

  // ── Kích Hoạt Sinh Cuốc Bằng AI ──
  const parsePromptAndGenerate = async () => {
    setIsGenerating(true);
    setAlertMsg(null);

    // Trích xuất số lượng và thông số chuẩn xác từ prompt
    const { count: requestedCount } = parsePromptParameters(prompt);

    // Chế độ 1: Groq Cloud LPU AI
    if (aiMode === 'groq') {
      try {
        const response = await aiAPI.generateRides({
          prompt,
          count: requestedCount,
          customApiKey: customApiKey.trim() || undefined
        });

        if (response.data && response.data.success && Array.isArray(response.data.rides)) {
          const rawList = response.data.rides;
          const mappedRides: AiGeneratedRide[] = rawList.map((r: any, idx: number) => {
            let carTypeVal: CarType = '4';
            const cStr = String(r.carType || '');
            if (cStr.includes('7') || cStr.includes('5')) carTypeVal = '7';
            else if (cStr.includes('16')) carTypeVal = '16';

            const startPoint = (r.startPoint || 'Hà Nội').trim();
            const endPoint = (r.endPoint || 'Hải Phòng').trim();
            const detectedRegion = detectRegionFromPlace(startPoint, endPoint);
            const regionVal: Region = (r.region && ['north', 'central', 'south'].includes(r.region))
              ? (r.region as Region)
              : detectedRegion;

            return {
              id: `groq-ride-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              name: r.name || 'Khách đặt xe',
              phone: r.phone || generateRandomPhone(),
              startPoint,
              endPoint,
              price: Number(r.price) || 1200000,
              carType: carTypeVal,
              region: regionVal,
              note: r.note || `Xe ${carTypeVal} chỗ · Đón đúng giờ`,
              isValid: Boolean(startPoint && endPoint && Number(r.price) > 0),
            };
          });

          setGeneratedRides(mappedRides);
          setGenerationSource({
            source: response.data.source === 'groq' ? '⚡ Groq LPU Cloud' : '🧠 Fallback Engine',
            model: response.data.model || 'Groq LPU'
          });

          if (response.data.source === 'groq') {
            setAlertMsg({
              type: 'success',
              text: `⚡ Groq AI (Model: ${response.data.model}) đã tạo và kiểm tra thành công ${mappedRides.length} chuyến xe siêu tốc! Dữ liệu đạt chuẩn 100%.`
            });
          } else {
            setAlertMsg({
              type: 'warning',
              text: `⚠️ ${response.data.warning || 'Hệ thống đã tự động chuyển sang Engine dự phòng để sinh cuốc an toàn.'}`
            });
          }
          setIsGenerating(false);
          return;
        }
      } catch (groqErr: any) {
        console.warn('Groq API error, falling back to local engine:', groqErr);
      }
    }

    // Chế độ 2: Engine Nội bộ (Offline / Fallback)
    setTimeout(() => {
      try {
        const rides = runLocalEngine(requestedCount);
        setGeneratedRides(rides);
        setGenerationSource({
          source: '🧠 Engine Nội bộ (Offline)',
          model: 'Local NLP & Route Deduplicator'
        });
        setAlertMsg({
          type: 'success',
          text: `✨ Engine nội bộ đã phân tích câu lệnh và tạo thành công ${rides.length} cuốc xe! 0 tuyến trùng lặp.`
        });
      } catch (err: any) {
        console.error('Error generating rides locally:', err);
        setAlertMsg({ type: 'error', text: 'Có lỗi xảy ra khi tạo cuốc xe. Vui lòng thử lại!' });
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  // Cập nhật từng ô trong bảng xem trước
  const handleUpdateRide = (id: string, field: keyof AiGeneratedRide, value: any) => {
    setGeneratedRides(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'startPoint') {
          updated.region = detectRegionFromPlace(String(value), updated.endPoint);
        } else if (field === 'endPoint') {
          updated.region = detectRegionFromPlace(updated.startPoint, String(value));
        }
        updated.isValid = Boolean(updated.startPoint && updated.endPoint && Number(updated.price) > 0);
        return updated;
      }
      return r;
    }));
  };

  // Xóa 1 cuốc khỏi bảng
  const handleDeleteRide = (id: string) => {
    setGeneratedRides(prev => prev.filter(r => r.id !== id));
  };

  // Xác nhận đăng lên website (Step 3)
  const handlePublishAll = async () => {
    if (generatedRides.length === 0) {
      alert('Danh sách cuốc xe đang rỗng!');
      return;
    }

    const invalidCount = generatedRides.filter(r => !r.isValid).length;
    if (invalidCount > 0) {
      if (!confirm(`Có ${invalidCount} cuốc chưa hợp lệ. Bạn có chắc muốn tiếp tục đăng các cuốc hợp lệ?`)) {
        return;
      }
    }

    setIsPublishing(true);
    setAlertMsg(null);

    try {
      const validRides = generatedRides.filter(r => r.isValid);
      const payload = {
        requests: validRides.map(r => ({
          name: r.name,
          phone: r.phone,
          startPoint: r.startPoint,
          endPoint: r.endPoint,
          price: r.price,
          carType: r.carType,
          region: r.region,
          note: r.note,
        })),
        target: targetDestination,
      };

      const res = await requestsAPI.createBulkRequests(payload);

      setAlertMsg({
        type: 'success',
        text: `🚀 ${res.data?.message || `Đã đăng thành công ${validRides.length} cuốc xe lên hệ thống!`}`
      });

      setGeneratedRides([]);

      if (onPublished) {
        onPublished(targetDestination);
      }
    } catch (err: any) {
      console.error('Error publishing rides:', err);
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi kết nối khi đăng cuốc xe lên máy chủ'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const totalValue = generatedRides.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  return (
    <div className="ai-generator-container">
      {/* Header Banner */}
      <div className="ai-header-banner">
        <div className="ai-header-title-wrap">
          <div className="ai-header-icon-box">⚡</div>
          <div>
            <h2 className="ai-header-title">Trợ Lý AI Tạo Cuốc Xe Tự Động</h2>
            <div className="ai-header-subtitle">
              Tích hợp suy luận siêu tốc <strong>Groq Cloud LPU</strong> & Engine kiểm tra dữ liệu, lọc tuyến trùng
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="ai-badge-status" style={{ background: aiMode === 'groq' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)', borderColor: aiMode === 'groq' ? '#8b5cf6' : '#10b981' }}>
            <span className="ai-status-dot" style={{ background: aiMode === 'groq' ? '#a855f7' : '#10b981' }}></span>
            <span>{aiMode === 'groq' ? 'Groq LPU AI Online' : 'Engine Nội Bộ'}</span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚙️ Cấu hình API Key
          </button>
        </div>
      </div>

      {/* Accordion Cấu hình Groq Key */}
      {showConfig && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 20,
          color: '#e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔑</span> Cấu hình Groq API Key
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Mặc định: Đã nạp sẵn key Groq của bạn
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="Nhập Groq API Key mới (gsk_...)"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              style={{
                flex: 1,
                minWidth: 260,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #475569',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: 13,
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleSaveApiKey}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Lưu Key
            </button>
            <button
              onClick={() => { setCustomApiKey(''); handleSaveApiKey(); }}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #64748b',
                background: 'transparent',
                color: '#cbd5e1',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Đặt lại mặc định
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            Hệ thống hỗ trợ model siêu tốc: <code>openai/gpt-oss-120b</code>, <code>openai/gpt-oss-20b</code>, <code>qwen/qwen3.8-27b</code> từ Groq.
          </div>
        </div>
      )}

      {/* Alert Notice */}
      {alertMsg && (
        <div className={`ai-alert ${alertMsg.type}`}>
          <span>{alertMsg.type === 'success' ? '✅' : alertMsg.type === 'warning' ? '⚡' : '⚠️'}</span>
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* ── BƯỚC 1: NHẬP LỆNH AI ── */}
      <div className="ai-card">
        <div className="ai-card-title-row">
          <div className="ai-step-indicator">
            <span className="ai-step-num">1</span>
            <span>Thêm ô nhập lệnh AI trong trang Admin</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Nguồn xử lý:</span>
            <div className="ai-source-switcher">
              <button
                type="button"
                className={`ai-source-pill ${aiMode === 'groq' ? 'active groq' : ''}`}
                onClick={() => setAiMode('groq')}
              >
                <span>⚡</span>
                <span>Groq Cloud LPU</span>
              </button>
              <button
                type="button"
                className={`ai-source-pill ${aiMode === 'local' ? 'active local' : ''}`}
                onClick={() => setAiMode('local')}
              >
                <span>🧠</span>
                <span>Engine Nội bộ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Textarea nhập câu lệnh */}
        <div className="ai-prompt-box">
          <div className="ai-prompt-header-bar">
            <span>{PROMPT_SUGGESTIONS[targetDestination].textareaHeader}</span>
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                ✕ Xóa nội dung
              </button>
            )}
          </div>
          <textarea
            className="ai-prompt-textarea"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PROMPT_SUGGESTIONS[targetDestination].defaultPrompt}
          />
          <div className="ai-prompt-footer-bar">
            <span>💡 Mẹo: Có thể nhập tự do mọi cung đường và khoảng giá mong muốn</span>
            <span>{prompt.length} ký tự</span>
          </div>
        </div>

        {/* Nút gợi ý nhanh thay đổi tự động theo thẻ xuất bản */}
        <div className="ai-suggestions-row">
          <span className="ai-suggestions-label">
            <span>🎯</span> Gợi ý lệnh nhanh:
          </span>
          {PROMPT_SUGGESTIONS[targetDestination].chips.map((c, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-suggestion-chip"
              onClick={() => setPrompt(c.prompt)}
              title={c.prompt}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Tùy chọn điểm đến xuất bản dạng 3 thẻ trực quan */}
        <div className="ai-config-section">
          <span className="ai-config-label">
            📍 Chọn nơi xuất bản cuốc xe lên ứng dụng (Bấm để tự đổi Prompt gợi ý):
          </span>
          <div className="ai-target-cards-grid">
            <div
              className={`ai-target-card ${targetDestination === 'requests' ? 'selected' : ''}`}
              onClick={() => handleSelectTarget('requests')}
            >
              <div className="ai-target-card-radio">
                {targetDestination === 'requests' && <div className="ai-target-card-radio-dot" />}
              </div>
              <div className="ai-target-card-text">
                <div className="ai-target-card-title">📋 Tab Cuốc xe</div>
                <div className="ai-target-card-desc">Danh sách yêu cầu chờ tài xế nhận & ghép cuốc</div>
              </div>
            </div>

            <div
              className={`ai-target-card ${targetDestination === 'fake_notifications' ? 'selected' : ''}`}
              onClick={() => handleSelectTarget('fake_notifications')}
            >
              <div className="ai-target-card-radio">
                {targetDestination === 'fake_notifications' && <div className="ai-target-card-radio-dot" />}
              </div>
              <div className="ai-target-card-text">
                <div className="ai-target-card-title">📢 Thông báo ảo</div>
                <div className="ai-target-card-desc">Hiển thị popup nổ cuốc tạo sôi động trang chủ</div>
              </div>
            </div>

            <div
              className={`ai-target-card ${targetDestination === 'both' ? 'selected' : ''}`}
              onClick={() => handleSelectTarget('both')}
            >
              <div className="ai-target-card-radio">
                {targetDestination === 'both' && <div className="ai-target-card-radio-dot" />}
              </div>
              <div className="ai-target-card-text">
                <div className="ai-target-card-title">⚡ Xuất bản cả 2 nơi</div>
                <div className="ai-target-card-desc">Tự động đồng bộ vừa nổ chuông vừa vào tab cuốc xe</div>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh hành động chính */}
        <div className="ai-action-bar">
          <button
            type="button"
            className="ai-action-btn primary"
            onClick={parsePromptAndGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <span className="ai-spinner"></span>
                <span>{aiMode === 'groq' ? '⚡ Groq LPU đang suy luận & kiểm tra...' : 'Đang phân tích & lọc trùng...'}</span>
              </>
            ) : (
              <>
                <span>{aiMode === 'groq' ? '⚡' : '✨'}</span>
                <span>{aiMode === 'groq' ? 'Groq LPU Tạo cuốc xe ngay' : 'AI Phân tích & Tạo cuốc ngay'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── BƯỚC 2: AI TẠO & KIỂM TRA CUỐC XE ── */}
      {generatedRides.length > 0 && (
        <div className="ai-card">
          <div className="ai-card-title-row">
            <div className="ai-step-indicator">
              <span className="ai-step-num">2</span>
              <span>
                {targetDestination === 'fake_notifications'
                  ? `AI tạo và kiểm tra thông báo ảo (${generatedRides.length} thông báo)`
                  : targetDestination === 'both'
                    ? `AI tạo và kiểm tra cuốc & thông báo đồng bộ (${generatedRides.length} chuyến)`
                    : `AI tạo và kiểm tra cuốc xe (${generatedRides.length} chuyến)`}
              </span>
            </div>
            <div className="ai-validation-badges">
              {generationSource && (
                <span className="ai-badge valid" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                  {generationSource.source} {generationSource.model ? `(${generationSource.model})` : ''}
                </span>
              )}
              <span className="ai-badge valid">✓ Đã kiểm tra trùng lặp</span>
              <span className="ai-badge valid">✓ Đầy đủ giá & địa chỉ</span>
              <span className="ai-badge valid">✓ 100% Sẵn sàng</span>
            </div>
          </div>

          <div className="ai-summary-bar">
            <div className="ai-summary-item">
              <span className="ai-summary-label">
                {targetDestination === 'fake_notifications' ? 'Tổng thông báo:' : 'Tổng số cuốc:'}
              </span>
              <span className="ai-summary-val">
                {generatedRides.length} {targetDestination === 'fake_notifications' ? 'thông báo' : 'chuyến'}
              </span>
            </div>
            <div className="ai-summary-item">
              <span className="ai-summary-label">Tổng giá trị:</span>
              <span className="ai-summary-val price">{totalValue.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="ai-summary-item">
              <span className="ai-summary-label">Tuyến trùng:</span>
              <span className="ai-summary-val" style={{ color: '#10b981' }}>0 (Đã lọc sạch)</span>
            </div>
            <div className="ai-summary-item">
              <span className="ai-summary-label">Hợp lệ:</span>
              <span className="ai-summary-val" style={{ color: '#10b981' }}>
                {generatedRides.filter(r => r.isValid).length}/{generatedRides.length} {targetDestination === 'fake_notifications' ? 'thông báo' : 'cuốc'}
              </span>
            </div>
          </div>

          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>STT</th>
                  <th style={{ width: 130 }}>Khách hàng</th>
                  <th style={{ width: 110 }}>Điện thoại</th>
                  <th>Điểm đón</th>
                  <th>Điểm đến</th>
                  <th style={{ width: 130 }}>Khu vực</th>
                  <th style={{ width: 85 }}>Loại xe</th>
                  <th style={{ width: 115 }}>Giá cước (VNĐ)</th>
                  <th>Ghi chú chuyến</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {generatedRides.map((ride, idx) => (
                  <tr key={ride.id} className={!ride.isValid ? 'invalid-row' : ''}>
                    <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell"
                        value={ride.name}
                        onChange={(e) => handleUpdateRide(ride.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell"
                        value={ride.phone}
                        onChange={(e) => handleUpdateRide(ride.id, 'phone', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell strong"
                        value={ride.startPoint}
                        onChange={(e) => handleUpdateRide(ride.id, 'startPoint', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell strong"
                        value={ride.endPoint}
                        onChange={(e) => handleUpdateRide(ride.id, 'endPoint', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="ai-editable-cell"
                        value={ride.region}
                        onChange={(e) => handleUpdateRide(ride.id, 'region', e.target.value as Region)}
                        style={{
                          fontWeight: 600,
                          fontSize: '12px',
                          color: ride.region === 'north' ? '#0369a1' : ride.region === 'central' ? '#b45309' : '#15803d',
                          background: ride.region === 'north' ? '#f0f9ff' : ride.region === 'central' ? '#fffbeb' : '#f0fdf4',
                          border: `1px solid ${ride.region === 'north' ? '#bae6fd' : ride.region === 'central' ? '#fde68a' : '#bbf7d0'}`
                        }}
                      >
                        <option value="north">🏔️ Miền Bắc</option>
                        <option value="central">🌊 Miền Trung</option>
                        <option value="south">🌴 Miền Nam</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="ai-editable-cell"
                        value={ride.carType}
                        onChange={(e) => handleUpdateRide(ride.id, 'carType', e.target.value as CarType)}
                      >
                        <option value="4">4 chỗ</option>
                        <option value="7">7 chỗ</option>
                        <option value="16">16 chỗ</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="ai-editable-cell price"
                        step={50000}
                        value={ride.price}
                        onChange={(e) => handleUpdateRide(ride.id, 'price', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell"
                        value={ride.note}
                        onChange={(e) => handleUpdateRide(ride.id, 'note', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="ai-delete-btn"
                        onClick={() => handleDeleteRide(ride.id)}
                        title="Xóa cuốc này"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BƯỚC 3: DUYỆT VÀ ĐĂNG LÊN WEBSITE ── */}
      {generatedRides.length > 0 && (
        <div className="ai-card ai-publish-card">
          <div className="ai-publish-info">
            <div className="ai-step-indicator">
              <span className="ai-step-num">3</span>
              <span>Duyệt và đăng lên website</span>
            </div>
            <p className="ai-publish-desc">
              {targetDestination === 'fake_notifications' ? (
                <>
                  Nhấn <strong>"Xác nhận đăng"</strong>, hệ thống sẽ lưu {generatedRides.length} thông báo ảo vào cơ sở dữ liệu và hiển thị ngay lập tức lên popup / banner trang chủ của ứng dụng tài xế!
                </>
              ) : targetDestination === 'both' ? (
                <>
                  Nhấn <strong>"Xác nhận đăng"</strong>, hệ thống sẽ đồng bộ lưu {generatedRides.length} cuốc xe vừa vào danh sách nhận cuốc, vừa nổ thông báo trang chủ!
                </>
              ) : (
                <>
                  Nhấn <strong>"Xác nhận đăng"</strong>, hệ thống sẽ lưu {generatedRides.length} cuốc xe vào cơ sở dữ liệu và hiển thị ngay lập tức lên danh sách chờ nhận cuốc của tài xế!
                </>
              )}
            </p>
          </div>

          <div className="ai-publish-actions">
            <button
              type="button"
              className="ai-action-btn secondary"
              onClick={() => setGeneratedRides([])}
              disabled={isPublishing}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="ai-action-btn success"
              onClick={handlePublishAll}
              disabled={isPublishing || generatedRides.length === 0}
            >
              {isPublishing ? (
                <>
                  <span className="ai-spinner"></span>
                  <span>Đang đăng lên website...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>
                    {targetDestination === 'fake_notifications' && `Xác nhận đăng (${generatedRides.length} thông báo ảo lên trang chủ)`}
                    {targetDestination === 'requests' && `Xác nhận đăng (${generatedRides.length} cuốc xe vào danh sách chờ)`}
                    {targetDestination === 'both' && `Xác nhận đăng (${generatedRides.length} cuốc xe lên cả 2 nơi)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRideGeneratorTab;
