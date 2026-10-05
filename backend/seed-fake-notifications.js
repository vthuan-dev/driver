/**
 * Seed 10 thông báo cuốc xe ảo THẬT cho mỗi miền (Bắc, Trung, Nam) vào DB (bảng fake_notifications).
 * Đồng thời nâng minFakeCount/maxFakeCount để driver thấy nhiều cuốc (10 cuốc mỗi miền).
 *
 * Chạy:  node seed-fake-notifications.js
 */
const { sequelize, FakeNotification, AppSetting, Admin } = require('./src/models');

const templatesNorth = [
  { startPoint: 'Bắc Giang',   endPoint: 'Cao Bằng',    startDetail: 'Thành phố Bắc Giang', endDetail: 'Thác Bản Giốc (Trùng Khánh, Cao Bằng)', startArea: 'Bắc Giang', endArea: 'Cao Bằng', displayTime: '04:00', displayDate: '2026-10-05', carType: '7', price: 4200000, note: 'Đi vùng cao đường đèo' },
  { startPoint: 'Hà Nội',      endPoint: 'Lào Cai',     startDetail: 'Bến xe Mỹ Đình, Nam Từ Liêm', endDetail: 'Thị xã Sa Pa (Trung tâm Sa Pa)', startArea: 'Mỹ Đình, Hà Nội', endArea: 'Sa Pa, Lào Cai', displayTime: '05:30', displayDate: '2026-10-05', carType: '7', price: 2900000, note: 'Xe êm ái, đưa đón tận nơi' },
  { startPoint: 'Hà Nội',      endPoint: 'Quảng Ninh',  startDetail: 'Sân bay Quốc tế Nội Bài', endDetail: 'Cảng tàu Tuần Châu (Vịnh Hạ Long)', startArea: 'Nội Bài, Hà Nội', endArea: 'Bãi Cháy, Hạ Long', displayTime: '08:00', displayDate: '2026-10-05', carType: '4', price: 1450000, note: 'Cao tốc HN - HP - Hạ Long' },
  { startPoint: 'Hải Phòng',   endPoint: 'Hà Nội',      startDetail: 'Quận Lê Chân, Hải Phòng', endDetail: 'Quận Cầu Giấy, Hà Nội', startArea: 'Lê Chân, Hải Phòng', endArea: 'Cầu Giấy, Hà Nội', displayTime: '10:15', displayDate: '2026-10-05', carType: '4', price: 850000, note: 'Khách đi họp, xuất hóa đơn VAT' },
  { startPoint: 'Hà Nội',      endPoint: 'Ninh Bình',   startDetail: 'KĐT Times City, Hai Bà Trưng', endDetail: 'Khu du lịch Tràng An – Bái Đính', startArea: 'Times City, Hà Nội', endArea: 'Tràng An, Ninh Bình', displayTime: '07:00', displayDate: '2026-10-05', carType: '7', price: 1200000, note: 'Xe đời mới không khói thuốc' },
  { startPoint: 'Hà Nội',      endPoint: 'Vĩnh Phúc',   startDetail: 'Quận Tây Hồ, Hà Nội', endDetail: 'Thị trấn Tam Đảo, Vĩnh Phúc', startArea: 'Tây Hồ, Hà Nội', endArea: 'Tam Đảo, Vĩnh Phúc', displayTime: '13:30', displayDate: '2026-10-05', carType: '4', price: 750000, note: 'Xe đón tận nhà, leo dốc êm' },
  { startPoint: 'Bắc Ninh',    endPoint: 'Hà Nội',      startDetail: 'TP. Bắc Ninh, Bắc Ninh', endDetail: 'Bệnh viện Bạch Mai, Giải Phóng, Hà Nội', startArea: 'Bắc Ninh', endArea: 'Hai Bà Trưng, Hà Nội', displayTime: '06:15', displayDate: '2026-10-05', carType: '4', price: 450000, note: 'Đưa đón người lớn tuổi khám bệnh' },
  { startPoint: 'Hà Nội',      endPoint: 'Sơn La',      startDetail: 'Quận Hà Đông, Hà Nội', endDetail: 'Rừng thông Bản Áng, Mộc Châu, Sơn La', startArea: 'Hà Đông, Hà Nội', endArea: 'Mộc Châu, Sơn La', displayTime: '06:00', displayDate: '2026-10-05', carType: '7', price: 2500000, note: 'Khách đi săn mây cuối tuần' },
  { startPoint: 'Thái Nguyên', endPoint: 'Hà Nội',      startDetail: 'TP. Thái Nguyên, Thái Nguyên', endDetail: 'Sảnh T2 Sân bay Nội Bài, Hà Nội', startArea: 'Thái Nguyên', endArea: 'Nội Bài, Hà Nội', displayTime: '16:00', displayDate: '2026-10-05', carType: '4', price: 600000, note: 'Cao tốc HN - TN, đúng giờ bay' },
  { startPoint: 'Hà Nội',      endPoint: 'Lạng Sơn',    startDetail: 'Quận Long Biên, Hà Nội', endDetail: 'Cửa khẩu Quốc tế Hữu Nghị, Lạng Sơn', startArea: 'Long Biên, Hà Nội', endArea: 'Cửa khẩu Hữu Nghị, Lạng Sơn', displayTime: '05:00', displayDate: '2026-10-05', carType: '7', price: 1950000, note: 'Khách đi giao thương cửa khẩu' }
];

const templatesCentral = [
  { startPoint: 'Đà Nẵng',     endPoint: 'Quy Nhơn',    startDetail: 'Sân bay Đà Nẵng', endDetail: 'Kỳ Co – Eo Gió (Quy Nhơn)', startArea: 'Hải Châu, Đà Nẵng', endArea: 'Nhơn Lý, Quy Nhơn', displayTime: '07:30', displayDate: '2026-10-05', carType: '7', price: 2800000, note: 'Đi công tác & du lịch' },
  { startPoint: 'Đà Nẵng',     endPoint: 'Quảng Nam',   startDetail: 'Bãi biển Mỹ Khê, Sơn Trà', endDetail: 'Phố cổ Hội An, Quảng Nam', startArea: 'Sơn Trà, Đà Nẵng', endArea: 'Hội An, Quảng Nam', displayTime: '15:00', displayDate: '2026-10-05', carType: '4', price: 350000, note: 'Đi dạo phố đèn lồng đêm' },
  { startPoint: 'Thừa Thiên Huế', endPoint: 'Đà Nẵng',  startDetail: 'Đại Nội Huế, TP. Huế', endDetail: 'Quận Hải Châu, TP. Đà Nẵng', startArea: 'TP. Huế', endArea: 'Hải Châu, Đà Nẵng', displayTime: '08:30', displayDate: '2026-10-05', carType: '7', price: 1350000, note: 'Dừng ngắm cảnh Hải Vân Quan 20 phút' },
  { startPoint: 'Khánh Hòa',   endPoint: 'Lâm Đồng',    startDetail: 'Đường Trần Phú, TP. Nha Trang', endDetail: 'Hồ Xuân Hương, TP. Đà Lạt', startArea: 'Nha Trang, Khánh Hòa', endArea: 'Đà Lạt, Lâm Đồng', displayTime: '06:30', displayDate: '2026-10-05', carType: '7', price: 1650000, note: 'Đèo Khánh Lê lái cẩn thận, êm' },
  { startPoint: 'Bình Định',   endPoint: 'Phú Yên',     startDetail: 'Quảng trường Quy Nhơn', endDetail: 'Tháp Nghinh Phong, TP. Tuy Hòa', startArea: 'TP. Quy Nhơn', endArea: 'Tuy Hòa, Phú Yên', displayTime: '09:00', displayDate: '2026-10-05', carType: '4', price: 950000, note: 'Ghé check-in Gành Đá Đĩa' },
  { startPoint: 'Đà Nẵng',     endPoint: 'Bà Nà Hills', startDetail: 'Khách sạn Novotel Bạch Đằng, Đà Nẵng', endDetail: 'Cáp treo Sun World Bà Nà Hills, Đà Nẵng', startArea: 'Bạch Đằng, Đà Nẵng', endArea: 'Hòa Vang, Đà Nẵng', displayTime: '07:45', displayDate: '2026-10-05', carType: '4', price: 450000, note: 'Đưa đón khứ hồi tham quan Cầu Vàng' },
  { startPoint: 'Quảng Bình',  endPoint: 'Phong Nha',   startDetail: 'Ga Đồng Hới, TP. Đồng Hới, Quảng Bình', endDetail: 'Vườn Quốc gia Phong Nha – Kẻ Bàng', startArea: 'Đồng Hới, Quảng Bình', endArea: 'Bố Trạch, Quảng Bình', displayTime: '08:15', displayDate: '2026-10-05', carType: '7', price: 650000, note: 'Đón ga tàu đúng giờ, tài xế nhiệt tình' },
  { startPoint: 'Lâm Đồng',    endPoint: 'Sân bay Liên Khương', startDetail: 'Chợ Đà Lạt, Nguyễn Thị Minh Khai', endDetail: 'Sân bay Liên Khương, Đức Trọng, Lâm Đồng', startArea: 'TP. Đà Lạt', endArea: 'Đức Trọng, Lâm Đồng', displayTime: '11:00', displayDate: '2026-10-05', carType: '4', price: 280000, note: 'Xe đón đúng giờ ra sân bay' },
  { startPoint: 'Nghệ An',     endPoint: 'Hà Tĩnh',     startDetail: 'Quảng trường Hồ Chí Minh, TP. Vinh', endDetail: 'TP. Hà Tĩnh, Tỉnh Hà Tĩnh', startArea: 'TP. Vinh, Nghệ An', endArea: 'TP. Hà Tĩnh', displayTime: '14:00', displayDate: '2026-10-05', carType: '4', price: 480000, note: 'Đi công tác làm việc trong ngày' },
  { startPoint: 'Ninh Thuận',  endPoint: 'Khánh Hòa',   startDetail: 'TP. Phan Rang - Tháp Chàm, Ninh Thuận', endDetail: 'Bến xe phía Nam Nha Trang, Khánh Hòa', startArea: 'Phan Rang, Ninh Thuận', endArea: 'Nha Trang, Khánh Hòa', displayTime: '08:00', displayDate: '2026-10-05', carType: '7', price: 1150000, note: 'Tuyến đường ngắm vịnh Vĩnh Hy' }
];

const templatesSouth = [
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Bà Rịa - Vũng Tàu', startDetail: 'Quận 1, TP. HCM', endDetail: 'Bãi Sau, TP. Vũng Tàu', startArea: 'Quận 1, TP. HCM', endArea: 'Vũng Tàu', displayTime: '06:00', displayDate: '2026-10-05', carType: '7', price: 1800000, note: 'Đưa đón tận nơi, xe đời mới 2024' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Bình Dương', startDetail: 'Ga quốc nội Tân Sơn Nhất', endDetail: 'TP. Thủ Dầu Một, Bình Dương', startArea: 'Tân Bình, TP. HCM', endArea: 'Thủ Dầu Một, Bình Dương', displayTime: '11:30', displayDate: '2026-10-05', carType: '4', price: 650000, note: 'Đón khách chuyên gia đúng giờ' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Cần Thơ', startDetail: 'Quận 7, TP. HCM', endDetail: 'Bến Ninh Kiều, TP. Cần Thơ', startArea: 'Quận 7, TP. HCM', endArea: 'Ninh Kiều, Cần Thơ', displayTime: '05:00', displayDate: '2026-10-05', carType: '7', price: 2100000, note: 'Cao tốc Trung Lương - Mỹ Thuận' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Bình Thuận', startDetail: 'TP. Thủ Đức, TP. HCM', endDetail: 'Mũi Né, TP. Phan Thiết', startArea: 'Thủ Đức, TP. HCM', endArea: 'Phan Thiết, Bình Thuận', displayTime: '07:00', displayDate: '2026-10-05', carType: '7', price: 2350000, note: 'Cao tốc Dầu Giây - Phan Thiết chỉ 2.5h' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Tây Ninh', startDetail: 'Quận Tân Bình, TP. HCM', endDetail: 'KDL Quốc gia Núi Bà Đen, Tây Ninh', startArea: 'Tân Bình, TP. HCM', endArea: 'TP. Tây Ninh', displayTime: '06:30', displayDate: '2026-10-05', carType: '4', price: 1250000, note: 'Đi viếng chùa Bà Đen trong ngày' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Đồng Nai', startDetail: 'Quận Bình Thạnh, TP. HCM', endDetail: 'KCN Amata, TP. Biên Hòa, Đồng Nai', startArea: 'Bình Thạnh, TP. HCM', endArea: 'Biên Hòa, Đồng Nai', displayTime: '08:00', displayDate: '2026-10-05', carType: '4', price: 450000, note: 'Khách đi làm việc đối tác' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Tiền Giang', startDetail: 'Quận 5 (Chợ Lớn), TP. HCM', endDetail: 'Bến tàu Du lịch Mỹ Tho, Tiền Giang', startArea: 'Quận 5, TP. HCM', endArea: 'TP. Mỹ Tho, Tiền Giang', displayTime: '07:30', displayDate: '2026-10-05', carType: '7', price: 1100000, note: 'Khách đi tour cồn Thới Sơn sinh thái' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'An Giang', startDetail: 'Quận 10, TP. HCM', endDetail: 'Miếu Bà Chúa Xứ Núi Sam, TP. Châu Đốc', startArea: 'Quận 10, TP. HCM', endArea: 'Châu Đốc, An Giang', displayTime: '04:30', displayDate: '2026-10-05', carType: '7', price: 2800000, note: 'Khách hành hương cầu tài lộc bình an' },
  { startPoint: 'Cần Thơ', endPoint: 'Kiên Giang', startDetail: 'Ninh Kiều, TP. Cần Thơ', endDetail: 'Bến tàu Rạch Giá, Tỉnh Kiên Giang', startArea: 'Ninh Kiều, Cần Thơ', endArea: 'Rạch Giá, Kiên Giang', displayTime: '05:45', displayDate: '2026-10-05', carType: '7', price: 1350000, note: 'Kịp chuyến tàu cao tốc đi Phú Quốc' },
  { startPoint: 'TP. Hồ Chí Minh', endPoint: 'Long An', startDetail: 'Quận Bình Tân, TP. HCM', endDetail: 'Thị trấn Bến Lức, Tỉnh Long An', startArea: 'Bình Tân, TP. HCM', endArea: 'Bến Lức, Long An', displayTime: '16:30', displayDate: '2026-10-05', carType: '4', price: 400000, note: 'Cao tốc TP.HCM - Trung Lương' }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối DB thành công.');

    const admin = await Admin.findOne({ order: [['id', 'ASC']] });
    if (!admin) {
      console.error('❌ Không tìm thấy admin nào trong DB.');
      process.exit(1);
    }
    console.log(`ℹ️  Dùng adminId=${admin.id} (${admin.username}) làm người tạo.`);

    // Xoá tất cả thông báo cũ để đồng bộ sạch sẽ
    await FakeNotification.destroy({ where: {} });
    console.log('🗑️  Đã làm sạch bảng fake_notifications.');

    const allRegions = [
      { name: 'north', list: templatesNorth },
      { name: 'central', list: templatesCentral },
      { name: 'south', list: templatesSouth },
    ];

    let total = 0;
    for (const r of allRegions) {
      for (const t of r.list) {
        await FakeNotification.create({
          region: r.name,
          startPoint: t.startPoint,
          endPoint: t.endPoint,
          startArea: t.startArea || null,
          endArea: t.endArea || null,
          startDetail: t.startDetail || null,
          endDetail: t.endDetail || null,
          displayTime: t.displayTime,
          displayDate: t.displayDate || '2026-10-05',
          carType: t.carType,
          price: t.price,
          note: t.note,
          isActive: true,
          createdById: admin.id,
        });
        total++;
      }
      console.log(`✓ Đã thêm 10 cuốc xe cho miền: ${r.name}`);
    }

    // Nâng số lượng hiển thị trong AppSetting lên 10-10
    let settings = await AppSetting.findOne();
    if (!settings) {
      settings = await AppSetting.create({ minFakeCount: 10, maxFakeCount: 10, minFakeInterval: 15, maxFakeInterval: 30 });
    } else {
      await settings.update({ minFakeCount: 10, maxFakeCount: 10 });
    }
    console.log('⚙️  Cập nhật AppSetting: minFakeCount=10, maxFakeCount=10');

    console.log(`\n🎉 Hoàn tất! Đã seed tổng cộng ${total} cuốc xe (10 cuốc/miền) vào cơ sở dữ liệu.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed lỗi:', err);
    process.exit(1);
  }
}

seed();
