/**
 * Từ điển địa lý toàn diện 63 tỉnh thành & địa danh Việt Nam
 * Phục vụ phân loại vùng miền chuẩn xác 100% (Bắc - Trung - Nam)
 */

const REGION_KEYWORDS = {
  north: [
    'hà nội', 'ha noi', 'nội bài', 'noi bai', 'hải phòng', 'hai phong', 'cát bi', 'cat bi',
    'đồ sơn', 'do son', 'quảng ninh', 'quang ninh', 'hạ long', 'ha long', 'bãi cháy', 'bai chay',
    'cẩm phả', 'cam pha', 'uông bí', 'uong bi', 'móng cái', 'mong cai', 'vân đồn', 'van don',
    'bắc ninh', 'bac ninh', 'từ sơn', 'bắc giang', 'bac giang', 'hải dương', 'hai duong',
    'hưng yên', 'hung yen', 'thái bình', 'thai binh', 'hà nam', 'ha nam', 'phủ lý', 'phu ly',
    'nam định', 'nam dinh', 'ninh bình', 'ninh binh', 'tràng an', 'tam chúc', 'vĩnh phúc', 'vinh phuc',
    'tam đảo', 'tam dao', 'phú thọ', 'phu tho', 'việt trì', 'viet tri', 'hòa bình', 'hoa binh',
    'mai châu', 'mai chau', 'sơn la', 'son la', 'mộc châu', 'moc chau', 'điện biên', 'dien bien',
    'lai châu', 'lai chau', 'lào cai', 'lao cai', 'sa pa', 'sapa', 'fansipan', 'yên bái', 'yen bai',
    'mù cang chải', 'hà giang', 'ha giang', 'đồng văn', 'mã pí lèng', 'tuyên quang', 'tuyen quang',
    'cao bằng', 'cao bang', 'thác bản giốc', 'bắc kạn', 'bac kan', 'ba bể', 'lạng sơn', 'lang son',
    'đồng đăng', 'thái nguyên', 'thai nguyen'
  ],
  central: [
    'đà nẵng', 'da nang', 'ngũ hành sơn', 'sơn trà', 'bà nà', 'ba na',
    'thừa thiên', 'thua thien', 'huế', 'hue', 'phú bài', 'phu bai', 'lăng cô', 'lang co',
    'quảng nam', 'quang nam', 'hội an', 'hoi an', 'tam kỳ', 'tam ky', 'chu lai',
    'quảng ngãi', 'quang ngai', 'lý sơn', 'dung quất', 'dung quat',
    'bình định', 'binh dinh', 'quy nhơn', 'quy nhon', 'phù cát', 'phu cat',
    'phú yên', 'phu yen', 'tuy hòa', 'tuy hoa', 'gành đá đĩa',
    'khánh hòa', 'khanh hoa', 'nha trang', 'cam ranh', 'vân phong', 'dốc lết',
    'ninh thuận', 'ninh thuan', 'phan rang', 'tháp chàm', 'vĩnh hy',
    'bình thuận', 'binh thuan', 'phan thiết', 'phan thiet', 'mũi né', 'mui ne', 'la gi',
    'thanh hóa', 'thanh hoa', 'sầm sơn', 'sam son', 'bỉm sơn', 'nghi sơn',
    'nghệ an', 'nghe an', 'vinh', 'cửa lò', 'cua lo',
    'hà tĩnh', 'ha tinh', 'hồng lĩnh', 'kỳ anh',
    'quảng bình', 'quang binh', 'đồng hới', 'dong hoi', 'phong nha',
    'quảng trị', 'quang tri', 'đông hà', 'dong ha', 'lao bảo',
    'kon tum', 'măng đen', 'mang den',
    'gia lai', 'pleiku',
    'đắk lắk', 'dak lak', 'đắc lắc', 'buôn ma thuột', 'buon ma thuot', 'bmt',
    'đắk nông', 'dak nong', 'gia nghĩa',
    'lâm đồng', 'lam dong', 'đà lạt', 'da lat', 'liên khương', 'lien khuong', 'bảo lộc', 'bao loc'
  ],
  south: [
    'hồ chí minh', 'ho chi minh', 'tp.hcm', 'tphcm', 'tp hcm', 'hcm', 'sài gòn', 'sai gon',
    'tân sơn nhất', 'tan son nhat', 'thủ đức', 'thu duc', 'bình chánh', 'hóc môn', 'hoc mon',
    'củ chi', 'cu chi', 'nhà bè', 'nha be', 'cần giờ', 'can gio',
    'bình dương', 'binh duong', 'thủ dầu một', 'thu dau mot', 'dĩ an', 'di an', 'thuận an', 'thuan an', 'bến cát', 'tân uyên',
    'đồng nai', 'dong nai', 'biên hòa', 'bien hoa', 'long khánh', 'long thanh', 'long thành', 'nhơn trạch',
    'bà rịa', 'ba ria', 'vũng tàu', 'vung tau', 'br-vt', 'brvt', 'phú mỹ', 'phu my', 'côn đảo', 'con dao',
    'tây ninh', 'tay ninh', 'trảng bàng', 'mộc bài', 'bà đen',
    'bình phước', 'binh phuoc', 'đồng xoài', 'chơn thành',
    'long an', 'long an', 'tân an', 'tan an', 'bến lức', 'ben luc', 'đức hòa', 'duc hoa', 'cần giuộc',
    'tiền giang', 'tien giang', 'mỹ tho', 'my tho', 'cái bè', 'gò công',
    'bến tre', 'ben tre', 'mỏ cày', 'châu thành',
    'trà vinh', 'tra vinh', 'duyên hải',
    'vĩnh long', 'vinh long', 'bình minh',
    'đồng tháp', 'dong thap', 'cao lãnh', 'cao lanh', 'sa đéc', 'sa dec',
    'an giang', 'long xuyên', 'long xuyen', 'châu đốc', 'chau doc', 'tri tôn',
    'kiên giang', 'kien giang', 'rạch giá', 'rach gia', 'hà tiên', 'ha tien', 'phú quốc', 'phu quoc',
    'cần thơ', 'can tho', 'ninh kiều', 'ninh kieu', 'cái răng', 'phong điền',
    'hậu giang', 'hau giang', 'vị thanh', 'ngã bảy',
    'sóc trăng', 'soc trang',
    'bạc liêu', 'bac lieu',
    'cà mau', 'ca mau', 'năm căn', 'đất mũi'
  ]
};

/**
 * Nhận diện vùng miền từ chuỗi địa danh
 * @param {string} startPoint 
 * @param {string} endPoint 
 * @returns {'north' | 'central' | 'south'}
 */
function detectRegionFromPlace(startPoint = '', endPoint = '') {
  const startStr = String(startPoint || '').toLowerCase();
  const endStr = String(endPoint || '').toLowerCase();

  // 1. Kiểm tra điểm đón (Ưu tiên số 1)
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const kw of keywords) {
      if (startStr.includes(kw)) {
        return region;
      }
    }
  }

  // 2. Nếu điểm đón không có từ khóa vùng miền, kiểm tra điểm đến
  for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
    for (const kw of keywords) {
      if (endStr.includes(kw)) {
        return region;
      }
    }
  }

  // 3. Mặc định fallback nếu hoàn toàn không có thông tin
  return 'north';
}

module.exports = {
  REGION_KEYWORDS,
  detectRegionFromPlace
};
