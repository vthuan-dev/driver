import { motion, AnimatePresence } from 'framer-motion';

type Region = 'north' | 'central' | 'south';

type Props = {
  user?: {
    status: string;
    [key: string]: any;
  } | null;
  region?: Region;
  onRequireAuth?: () => void;
  onRegisterClick?: () => void;
  onViewAllClick?: () => void;
};

const getPlaceImage = (point: string = '', detail: string = '', customImage?: string) => {
  if (customImage) return customImage;
  const text = (point + ' ' + detail).toLowerCase();
  if (text.includes('bắc giang')) return '/images/landmark_bac_giang.jpg';
  if (text.includes('cao bằng') || text.includes('bản giốc')) return '/images/landmark_ban_gioc.jpg';
  if (text.includes('sa pa') || text.includes('lào cai') || text.includes('fansipan')) return 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=320&q=80';
  if (text.includes('vịnh hạ long') || text.includes('quảng ninh') || text.includes('hạ long') || text.includes('tuần châu')) return 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=320&q=80';
  if (text.includes('hà nội') || text.includes('nội bài') || text.includes('mỹ đình') || text.includes('times city') || text.includes('hoàn kiếm')) return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=320&q=80';
  if (text.includes('ninh bình') || text.includes('tràng an') || text.includes('bái đính')) return 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=320&q=80';
  if (text.includes('hải phòng')) return 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=320&q=80';
  if (text.includes('tam đảo') || text.includes('vĩnh phúc')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=320&q=80';
  if (text.includes('mộc châu') || text.includes('sơn la')) return 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=320&q=80';
  if (text.includes('lạng sơn') || text.includes('hữu nghị')) return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=320&q=80';
  if (text.includes('đà nẵng') || text.includes('mỹ khê') || text.includes('sơn trà') || text.includes('bà nà')) return 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=320&q=80';
  if (text.includes('hội an') || text.includes('quảng nam')) return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=320&q=80';
  if (text.includes('huế') || text.includes('thừa thiên')) return 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=320&q=80';
  if (text.includes('phong nha') || text.includes('quảng bình') || text.includes('đồng hới')) return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=320&q=80';
  if (text.includes('quy nhơn') || text.includes('bình định') || text.includes('kỳ co')) return 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=320&q=80';
  if (text.includes('nha trang') || text.includes('khánh hòa')) return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=320&q=80';
  if (text.includes('đà lạt') || text.includes('lâm đồng') || text.includes('lâm viên') || text.includes('liên khương')) return 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=320&q=80';
  if (text.includes('phú yên') || text.includes('tuy hòa') || text.includes('nghinh phong')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80';
  if (text.includes('vũng tàu') || text.includes('bà rịa')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80';
  if (text.includes('sài gòn') || text.includes('hồ chí minh') || text.includes('tân sơn nhất') || text.includes('thủ đức') || text.includes('bình thạnh') || text.includes('tân bình') || text.includes('bình tân')) return 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=320&q=80';
  if (text.includes('bình dương') || text.includes('thủ dầu một')) return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=320&q=80';
  if (text.includes('đồng nai') || text.includes('biên hòa')) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=320&q=80';
  if (text.includes('cần thơ') || text.includes('ninh kiều')) return 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=320&q=80';
  if (text.includes('mũi né') || text.includes('phan thiết') || text.includes('bình thuận')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=320&q=80';
  if (text.includes('tây ninh') || text.includes('bà đen')) return 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=320&q=80';
  if (text.includes('châu đốc') || text.includes('an giang')) return 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=320&q=80';
  if (text.includes('rạch giá') || text.includes('kiên giang') || text.includes('phú quốc')) return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=320&q=80';
  if (text.includes('tiền giang') || text.includes('mỹ tho')) return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=320&q=80';
  return null;
};

const featuredRidesByRegion: Record<Region, any[]> = {
  north: [
    {
      _id: 'featured-north-1',
      carType: '7',
      price: 4200000,
      startPoint: 'Bắc Giang',
      endPoint: 'Cao Bằng',
      startDetail: 'Thành phố Bắc Giang',
      endDetail: 'Thác Bản Giốc (Trùng Khánh, Cao Bằng)',
      displayTime: '04:00',
      displayDate: '2026-10-05',
      note: 'Đi vùng cao đường đèo',
      category: 'Khách du lịch',
      badgeIcon: '⚡',
      badgeText: 'Cuốc hot'
    },
    {
      _id: 'featured-north-2',
      carType: '7',
      price: 2900000,
      startPoint: 'Hà Nội',
      endPoint: 'Lào Cai',
      startDetail: 'Bến xe Mỹ Đình, Nam Từ Liêm',
      endDetail: 'Thị xã Sa Pa (Trung tâm Sa Pa)',
      displayTime: '05:30',
      displayDate: '2026-10-05',
      note: 'Xe êm ái, đưa đón tận nơi',
      category: 'Gia đình nghỉ dưỡng',
      badgeIcon: '🔥',
      badgeText: 'Đi cao tốc'
    },
    {
      _id: 'featured-north-3',
      carType: '4',
      price: 1450000,
      startPoint: 'Hà Nội',
      endPoint: 'Quảng Ninh',
      startDetail: 'Sân bay Quốc tế Nội Bài',
      endDetail: 'Cảng tàu Tuần Châu (Vịnh Hạ Long)',
      displayTime: '08:00',
      displayDate: '2026-10-05',
      note: 'Cao tốc HN - HP - Hạ Long',
      category: 'Khách quốc tế',
      badgeIcon: '✈️',
      badgeText: 'Đón sân bay'
    },
    {
      _id: 'featured-north-4',
      carType: '5',
      price: 850000,
      startPoint: 'Hải Phòng',
      endPoint: 'Hà Nội',
      startDetail: 'Quận Lê Chân, Hải Phòng',
      endDetail: 'Quận Cầu Giấy, Hà Nội',
      displayTime: '10:15',
      displayDate: '2026-10-05',
      note: 'Khách đi họp, xuất hóa đơn VAT',
      category: 'Khách công tác',
      badgeIcon: '💼',
      badgeText: 'Công tác'
    },
    {
      _id: 'featured-north-5',
      carType: '7',
      price: 1200000,
      startPoint: 'Hà Nội',
      endPoint: 'Ninh Bình',
      startDetail: 'KĐT Times City, Hai Bà Trưng',
      endDetail: 'Khu du lịch Tràng An – Bái Đính',
      displayTime: '07:00',
      displayDate: '2026-10-05',
      note: 'Xe đời mới không khói thuốc',
      category: 'Khách tham quan',
      badgeIcon: '⭐',
      badgeText: 'Cuốc tiện chuyến'
    },
    {
      _id: 'featured-north-6',
      carType: '4',
      price: 750000,
      startPoint: 'Hà Nội',
      endPoint: 'Vĩnh Phúc',
      startDetail: 'Quận Tây Hồ, Hà Nội',
      endDetail: 'Thị trấn Tam Đảo, Vĩnh Phúc',
      displayTime: '13:30',
      displayDate: '2026-10-05',
      note: 'Xe đón tận nhà, leo dốc êm',
      category: 'Khách nghỉ dưỡng',
      badgeIcon: '🌲',
      badgeText: 'Nghỉ dưỡng'
    },
    {
      _id: 'featured-north-7',
      carType: '5',
      price: 450000,
      startPoint: 'Bắc Ninh',
      endPoint: 'Hà Nội',
      startDetail: 'TP. Bắc Ninh, Bắc Ninh',
      endDetail: 'Bệnh viện Bạch Mai, Giải Phóng, Hà Nội',
      displayTime: '06:15',
      displayDate: '2026-10-05',
      note: 'Đưa đón người lớn tuổi khám bệnh',
      category: 'Khách khám bệnh',
      badgeIcon: '🏥',
      badgeText: 'Khám bệnh'
    },
    {
      _id: 'featured-north-8',
      carType: '7',
      price: 2500000,
      startPoint: 'Hà Nội',
      endPoint: 'Sơn La',
      startDetail: 'Quận Hà Đông, Hà Nội',
      endDetail: 'Rừng thông Bản Áng, Mộc Châu, Sơn La',
      displayTime: '06:00',
      displayDate: '2026-10-05',
      note: 'Khách đi săn mây cuối tuần',
      category: 'Khách du lịch',
      badgeIcon: '📸',
      badgeText: 'Khám phá'
    },
    {
      _id: 'featured-north-9',
      carType: '4',
      price: 600000,
      startPoint: 'Thái Nguyên',
      endPoint: 'Hà Nội',
      startDetail: 'TP. Thái Nguyên, Thái Nguyên',
      endDetail: 'Sảnh T2 Sân bay Nội Bài, Hà Nội',
      displayTime: '16:00',
      displayDate: '2026-10-05',
      note: 'Cao tốc HN - TN, đúng giờ bay',
      category: 'Khách bay đêm',
      badgeIcon: '✈️',
      badgeText: 'Đón sân bay'
    },
    {
      _id: 'featured-north-10',
      carType: '7',
      price: 1950000,
      startPoint: 'Hà Nội',
      endPoint: 'Lạng Sơn',
      startDetail: 'Quận Long Biên, Hà Nội',
      endDetail: 'Cửa khẩu Quốc tế Hữu Nghị, Lạng Sơn',
      displayTime: '05:00',
      displayDate: '2026-10-05',
      note: 'Khách đi giao thương cửa khẩu',
      category: 'Khách thương gia',
      badgeIcon: '💼',
      badgeText: 'Công tác'
    }
  ],
  central: [
    {
      _id: 'featured-central-1',
      carType: '7',
      price: 2800000,
      startPoint: 'Đà Nẵng',
      endPoint: 'Quy Nhơn',
      startDetail: 'Sân bay Đà Nẵng',
      endDetail: 'Kỳ Co – Eo Gió (Quy Nhơn)',
      displayTime: '07:30',
      displayDate: '2026-10-05',
      note: 'Đi công tác & du lịch',
      category: 'Khách công tác',
      badgeIcon: '⚡',
      badgeText: 'Cuốc hot'
    },
    {
      _id: 'featured-central-2',
      carType: '4',
      price: 350000,
      startPoint: 'Đà Nẵng',
      endPoint: 'Quảng Nam',
      startDetail: 'Bãi biển Mỹ Khê, Sơn Trà',
      endDetail: 'Phố cổ Hội An, Quảng Nam',
      displayTime: '15:00',
      displayDate: '2026-10-05',
      note: 'Đi dạo phố đèn lồng đêm',
      category: 'Khách du lịch',
      badgeIcon: '⭐',
      badgeText: 'Giá tốt'
    },
    {
      _id: 'featured-central-3',
      carType: '7',
      price: 1350000,
      startPoint: 'Thừa Thiên Huế',
      endPoint: 'Đà Nẵng',
      startDetail: 'Đại Nội Huế, TP. Huế',
      endDetail: 'Quận Hải Châu, TP. Đà Nẵng',
      displayTime: '08:30',
      displayDate: '2026-10-05',
      note: 'Dừng ngắm cảnh Hải Vân Quan 20 phút',
      category: 'Khách gia đình',
      badgeIcon: '🏞️',
      badgeText: 'Cảnh đẹp'
    },
    {
      _id: 'featured-central-4',
      carType: '7',
      price: 1650000,
      startPoint: 'Khánh Hòa',
      endPoint: 'Lâm Đồng',
      startDetail: 'Đường Trần Phú, TP. Nha Trang',
      endDetail: 'Hồ Xuân Hương, TP. Đà Lạt',
      displayTime: '06:30',
      displayDate: '2026-10-05',
      note: 'Đèo Khánh Lê lái cẩn thận, êm',
      category: 'Khách nghỉ dưỡng',
      badgeIcon: '⚡',
      badgeText: 'Cuốc hot'
    },
    {
      _id: 'featured-central-5',
      carType: '5',
      price: 950000,
      startPoint: 'Bình Định',
      endPoint: 'Phú Yên',
      startDetail: 'Quảng trường Quy Nhơn',
      endDetail: 'Tháp Nghinh Phong, TP. Tuy Hòa',
      displayTime: '09:00',
      displayDate: '2026-10-05',
      note: 'Ghé check-in Gành Đá Đĩa',
      category: 'Khách du lịch',
      badgeIcon: '📸',
      badgeText: 'Khám phá'
    },
    {
      _id: 'featured-central-6',
      carType: '4',
      price: 450000,
      startPoint: 'Đà Nẵng',
      endPoint: 'Bà Nà Hills',
      startDetail: 'Khách sạn Novotel Bạch Đằng, Đà Nẵng',
      endDetail: 'Cáp treo Sun World Bà Nà Hills, Đà Nẵng',
      displayTime: '07:45',
      displayDate: '2026-10-05',
      note: 'Đưa đón khứ hồi tham quan Cầu Vàng',
      category: 'Khách tham quan',
      badgeIcon: '🎢',
      badgeText: 'Vui chơi'
    },
    {
      _id: 'featured-central-7',
      carType: '7',
      price: 650000,
      startPoint: 'Quảng Bình',
      endPoint: 'Phong Nha',
      startDetail: 'Ga Đồng Hới, TP. Đồng Hới, Quảng Bình',
      endDetail: 'Vườn Quốc gia Phong Nha – Kẻ Bàng',
      displayTime: '08:15',
      displayDate: '2026-10-05',
      note: 'Đón ga tàu đúng giờ, tài xế nhiệt tình',
      category: 'Khách thám hiểm',
      badgeIcon: '🌄',
      badgeText: 'Khám phá'
    },
    {
      _id: 'featured-central-8',
      carType: '4',
      price: 280000,
      startPoint: 'Lâm Đồng',
      endPoint: 'Sân bay Liên Khương',
      startDetail: 'Chợ Đà Lạt, Nguyễn Thị Minh Khai',
      endDetail: 'Sân bay Liên Khương, Đức Trọng, Lâm Đồng',
      displayTime: '11:00',
      displayDate: '2026-10-05',
      note: 'Xe đón đúng giờ ra sân bay',
      category: 'Khách bay',
      badgeIcon: '✈️',
      badgeText: 'Đón sân bay'
    },
    {
      _id: 'featured-central-9',
      carType: '5',
      price: 480000,
      startPoint: 'Nghệ An',
      endPoint: 'Hà Tĩnh',
      startDetail: 'Quảng trường Hồ Chí Minh, TP. Vinh',
      endDetail: 'TP. Hà Tĩnh, Tỉnh Hà Tĩnh',
      displayTime: '14:00',
      displayDate: '2026-10-05',
      note: 'Đi công tác làm việc trong ngày',
      category: 'Khách công tác',
      badgeIcon: '💼',
      badgeText: 'Công tác'
    },
    {
      _id: 'featured-central-10',
      carType: '7',
      price: 1150000,
      startPoint: 'Ninh Thuận',
      endPoint: 'Khánh Hòa',
      startDetail: 'TP. Phan Rang - Tháp Chàm, Ninh Thuận',
      endDetail: 'Bến xe phía Nam Nha Trang, Khánh Hòa',
      displayTime: '08:00',
      displayDate: '2026-10-05',
      note: 'Tuyến đường ngắm vịnh Vĩnh Hy',
      category: 'Khách du lịch',
      badgeIcon: '🏖️',
      badgeText: 'Nghỉ dưỡng'
    }
  ],
  south: [
    {
      _id: 'featured-south-1',
      carType: '7',
      price: 1800000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Bà Rịa - Vũng Tàu',
      startDetail: 'Quận 1, TP. HCM',
      endDetail: 'Bãi Sau, TP. Vũng Tàu',
      displayTime: '06:00',
      displayDate: '2026-10-05',
      note: 'Đưa đón tận nơi, xe đời mới 2024',
      category: 'Gia đình nghỉ dưỡng',
      badgeIcon: '⚡',
      badgeText: 'Cuốc hot'
    },
    {
      _id: 'featured-south-2',
      carType: '4',
      price: 650000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Bình Dương',
      startDetail: 'Ga quốc nội Tân Sơn Nhất',
      endDetail: 'TP. Thủ Dầu Một, Bình Dương',
      displayTime: '11:30',
      displayDate: '2026-10-05',
      note: 'Đón khách chuyên gia đúng giờ',
      category: 'Khách chuyên gia',
      badgeIcon: '✈️',
      badgeText: 'Đón sân bay'
    },
    {
      _id: 'featured-south-3',
      carType: '7',
      price: 2100000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Cần Thơ',
      startDetail: 'Quận 7, TP. HCM',
      endDetail: 'Bến Ninh Kiều, TP. Cần Thơ',
      displayTime: '05:00',
      displayDate: '2026-10-05',
      note: 'Cao tốc Trung Lương - Mỹ Thuận',
      category: 'Khách công tác',
      badgeIcon: '💼',
      badgeText: 'Công tác'
    },
    {
      _id: 'featured-south-4',
      carType: '7',
      price: 2350000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Bình Thuận',
      startDetail: 'TP. Thủ Đức, TP. HCM',
      endDetail: 'Mũi Né, TP. Phan Thiết',
      displayTime: '07:00',
      displayDate: '2026-10-05',
      note: 'Cao tốc Dầu Giây - Phan Thiết chỉ 2.5h',
      category: 'Khách du lịch',
      badgeIcon: '🔥',
      badgeText: 'Đi cao tốc'
    },
    {
      _id: 'featured-south-5',
      carType: '5',
      price: 1250000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Tây Ninh',
      startDetail: 'Quận Tân Bình, TP. HCM',
      endDetail: 'KDL Quốc gia Núi Bà Đen, Tây Ninh',
      displayTime: '06:30',
      displayDate: '2026-10-05',
      note: 'Đi viếng chùa Bà Đen trong ngày',
      category: 'Khách hành hương',
      badgeIcon: '🙏',
      badgeText: 'Hành hương'
    },
    {
      _id: 'featured-south-6',
      carType: '4',
      price: 450000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Đồng Nai',
      startDetail: 'Quận Bình Thạnh, TP. HCM',
      endDetail: 'KCN Amata, TP. Biên Hòa, Đồng Nai',
      displayTime: '08:00',
      displayDate: '2026-10-05',
      note: 'Khách đi làm việc đối tác',
      category: 'Khách công tác',
      badgeIcon: '💼',
      badgeText: 'Công tác'
    },
    {
      _id: 'featured-south-7',
      carType: '7',
      price: 1100000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Tiền Giang',
      startDetail: 'Quận 5 (Chợ Lớn), TP. HCM',
      endDetail: 'Bến tàu Du lịch Mỹ Tho, Tiền Giang',
      displayTime: '07:30',
      displayDate: '2026-10-05',
      note: 'Khách đi tour cồn Thới Sơn sinh thái',
      category: 'Khách du lịch',
      badgeIcon: '🌴',
      badgeText: 'Du lịch'
    },
    {
      _id: 'featured-south-8',
      carType: '7',
      price: 2800000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'An Giang',
      startDetail: 'Quận 10, TP. HCM',
      endDetail: 'Miếu Bà Chúa Xứ Núi Sam, TP. Châu Đốc',
      displayTime: '04:30',
      displayDate: '2026-10-05',
      note: 'Khách hành hương cầu tài lộc bình an',
      category: 'Khách hành hương',
      badgeIcon: '🙏',
      badgeText: 'Hành hương'
    },
    {
      _id: 'featured-south-9',
      carType: '7',
      price: 1350000,
      startPoint: 'Cần Thơ',
      endPoint: 'Kiên Giang',
      startDetail: 'Ninh Kiều, TP. Cần Thơ',
      endDetail: 'Bến tàu Rạch Giá, Tỉnh Kiên Giang',
      displayTime: '05:45',
      displayDate: '2026-10-05',
      note: 'Kịp chuyến tàu cao tốc đi Phú Quốc',
      category: 'Khách du lịch',
      badgeIcon: '🚢',
      badgeText: 'Đi tàu đảo'
    },
    {
      _id: 'featured-south-10',
      carType: '4',
      price: 400000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Long An',
      startDetail: 'Quận Bình Tân, TP. HCM',
      endDetail: 'Thị trấn Bến Lức, Tỉnh Long An',
      displayTime: '16:30',
      displayDate: '2026-10-05',
      note: 'Cao tốc TP.HCM - Trung Lương',
      category: 'Khách về quê',
      badgeIcon: '⭐',
      badgeText: 'Cuốc tiện chuyến'
    }
  ]
};

const FeaturedRidesSection = ({
  user,
  region = 'north',
  onRequireAuth,
  onRegisterClick,
  onViewAllClick
}: Props) => {
  const currentList = featuredRidesByRegion[region] || featuredRidesByRegion.north;

  return (
    <div className="featured-rides-section">
      {/* Section Header matching Homepage mockup */}
      <div className="featured-rides-header">
        <div className="featured-rides-title">
          <span className="featured-bell-icon">🔔</span>
          <h3>Cuốc xe mới nhất</h3>
        </div>
        <button
          type="button"
          className="featured-view-all-btn"
          onClick={() => {
            if (onViewAllClick) onViewAllClick();
          }}
        >
          <span>Xem tất cả</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>›</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <div className="featured-rides-list" key={region}>
          {currentList.map((notification, index) => {
            const dateObj = notification.displayDate ? new Date(notification.displayDate) : new Date();
            const weekday = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeString = `${notification.displayTime || '04:00'} · ${weekdayCap}, ${dateStr}`;

            return (
              <motion.div
                key={notification._id}
                className="featured-ride-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
              >
                {/* Header: Time + Hot badge */}
                <div className="featured-card-top">
                  <div className="featured-time-pill">
                    <span className="featured-time-icon">🕐</span>
                    <span className="featured-time-text">{timeString}</span>
                  </div>
                  <div className="featured-hot-pill">
                    <span className="featured-hot-icon">{notification.badgeIcon || '⚡'}</span>
                    <span className="featured-hot-text">{notification.badgeText || 'Cuốc hot'}</span>
                  </div>
                </div>

                {/* Car type & Price */}
                <div className="featured-card-middle">
                  <div className="featured-card-cartype">
                    <span className="featured-car-emoji">🚗</span>
                    <span className="featured-car-name">Có tài xế bắn cuốc {notification.carType} chỗ</span>
                  </div>
                  <div className="featured-card-price-wrap">
                    <div className="featured-card-price">{Number(notification.price).toLocaleString('vi-VN')}đ</div>
                    <div className="featured-card-price-sub">Giá chuyến</div>
                  </div>
                </div>

                {/* Route Points */}
                <div className="featured-card-route">
                  <span className="route-pin-icon route-pin-icon--green">📍</span>
                  <span className="route-loc-name route-loc-name--start">{notification.startPoint}</span>
                  <span className="route-arrow-icon">→</span>
                  <span className="route-pin-icon route-pin-icon--red">📍</span>
                  <span className="route-loc-name route-loc-name--end">{notification.endPoint}</span>
                </div>

                {/* Dynamic Google Maps Route View */}
                <div
                  className="featured-map-view"
                  title="Nhấn để mở chỉ đường trên Google Maps"
                  onClick={() => {
                    const start = notification.startDetail || notification.startPoint;
                    const end = notification.endDetail || notification.endPoint;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start + ', Việt Nam')}&destination=${encodeURIComponent(end + ', Việt Nam')}`;
                    window.open(url, '_blank');
                  }}
                >
                  <div className="featured-map-bg">
                    <iframe
                      title={`Bản đồ ${notification.startPoint} đến ${notification.endPoint}`}
                      src={`https://maps.google.com/maps?saddr=${encodeURIComponent((notification.startDetail || notification.startPoint) + ', Việt Nam')}&daddr=${encodeURIComponent((notification.endDetail || notification.endPoint) + ', Việt Nam')}&output=embed`}
                      className="featured-map-iframe"
                      loading="lazy"
                    />
                  </div>

                  <div className="featured-map-expand-badge">
                    <span>🗺️ Google Maps</span>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>↗</span>
                  </div>

                  {/* Start Point Marker Card */}
                  <div className="featured-map-marker featured-map-marker--start">
                    {getPlaceImage(notification.startPoint, notification.startDetail) ? (
                      <img
                        src={getPlaceImage(notification.startPoint, notification.startDetail)!}
                        alt={notification.startDetail || notification.startPoint}
                        className="marker-img"
                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="marker-img-placeholder marker-img-placeholder--start">
                        <span>📍</span>
                      </div>
                    )}
                    <div className="marker-content">
                      <span className="marker-badge marker-badge--start">Điểm đón</span>
                      <div className="marker-address">{notification.startDetail || notification.startPoint}</div>
                    </div>
                  </div>

                  {/* End Point Marker Card */}
                  <div className="featured-map-marker featured-map-marker--end">
                    {getPlaceImage(notification.endPoint, notification.endDetail) ? (
                      <img
                        src={getPlaceImage(notification.endPoint, notification.endDetail)!}
                        alt={notification.endDetail || notification.endPoint}
                        className="marker-img"
                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="marker-img-placeholder marker-img-placeholder--end">
                        <span>🏁</span>
                      </div>
                    )}
                    <div className="marker-content">
                      <span className="marker-badge marker-badge--end">Điểm đến</span>
                      <div className="marker-address">{notification.endDetail || notification.endPoint}</div>
                    </div>
                  </div>
                </div>

                {/* Specs row */}
                <div className="featured-card-specs">
                  <div className="spec-tag">
                    <span className="spec-icon">🚗</span>
                    <span>{notification.carType} chỗ</span>
                  </div>
                  <div className="spec-tag">
                    <span className="spec-icon">👥</span>
                    <span>{notification.category || 'Khách du lịch'}</span>
                  </div>
                  <div className="spec-tag spec-tag--note">
                    <span className="spec-icon">🧳</span>
                    <span className="spec-text">Yêu cầu: {notification.note || 'Đưa đón tận nơi'}</span>
                  </div>
                  <div className="spec-tag-menu">⋮</div>
                </div>

                {/* Big Action Button */}
                <button
                  type="button"
                  className="featured-card-submit-btn"
                  onClick={() => {
                    if (!user) {
                      if (onRequireAuth) onRequireAuth();
                      return;
                    }
                    if (onRegisterClick) {
                      onRegisterClick();
                    } else if (onViewAllClick) {
                      onViewAllClick();
                    }
                  }}
                >
                  <span>ĐĂNG KÝ CHỞ CUỐC XE</span>
                  <span className="featured-btn-arrow">›</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default FeaturedRidesSection;
