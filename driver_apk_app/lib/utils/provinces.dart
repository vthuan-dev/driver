/// Region enum for North, Central, South Vietnam
enum Region {
  north,
  central,
  south;

  String get label {
    switch (this) {
      case Region.north:
        return 'Miền Bắc';
      case Region.central:
        return 'Miền Trung';
      case Region.south:
        return 'Miền Nam';
    }
  }

  static Region fromString(String value) {
    switch (value.toLowerCase()) {
      case 'central':
        return Region.central;
      case 'south':
        return Region.south;
      default:
        return Region.north;
    }
  }
}

/// 63 Vietnamese provinces organized by region
const Map<Region, List<String>> provincesByRegion = {
  Region.north: [
    'Hà Nội',
    'Hải Phòng',
    'Hải Dương',
    'Hưng Yên',
    'Thái Bình',
    'Hà Nam',
    'Nam Định',
    'Ninh Bình',
    'Vĩnh Phúc',
    'Bắc Ninh',
    'Quảng Ninh',
    'Lạng Sơn',
    'Cao Bằng',
    'Bắc Kạn',
    'Thái Nguyên',
    'Tuyên Quang',
    'Hà Giang',
    'Lào Cai',
    'Yên Bái',
    'Lai Châu',
    'Điện Biên',
    'Sơn La',
    'Hòa Bình',
    'Phú Thọ',
    'Bắc Giang',
  ],
  Region.central: [
    'Thanh Hóa',
    'Nghệ An',
    'Hà Tĩnh',
    'Quảng Bình',
    'Quảng Trị',
    'Thừa Thiên - Huế',
    'Đà Nẵng',
    'Quảng Nam',
    'Quảng Ngãi',
    'Bình Định',
    'Phú Yên',
    'Khánh Hòa',
    'Ninh Thuận',
    'Bình Thuận',
    'Kon Tum',
    'Gia Lai',
    'Đắk Lắk',
    'Đắk Nông',
    'Lâm Đồng',
  ],
  Region.south: [
    'TP. Hồ Chí Minh',
    'Bình Dương',
    'Đồng Nai',
    'Bà Rịa-Vũng Tàu',
    'Tây Ninh',
    'Bình Phước',
    'Long An',
    'Tiền Giang',
    'Bến Tre',
    'Trà Vinh',
    'Vĩnh Long',
    'Đồng Tháp',
    'An Giang',
    'Kiên Giang',
    'Cần Thơ',
    'Hậu Giang',
    'Sóc Trăng',
    'Bạc Liêu',
    'Cà Mau',
  ],
};

/// Get all provinces for a region
List<String> getProvincesForRegion(Region region) {
  return provincesByRegion[region] ?? [];
}

/// Detect region from province name
Region? getRegionFromProvince(String province) {
  for (final entry in provincesByRegion.entries) {
    if (entry.value.contains(province)) {
      return entry.key;
    }
  }
  return null;
}
