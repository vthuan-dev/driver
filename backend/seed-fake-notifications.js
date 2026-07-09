/**
 * Seed ~10 thông báo cuốc xe ảo (fake notifications) THẬT vào DB (bảng fake_notifications).
 * Đồng thời nâng minFakeCount/maxFakeCount để driver thấy nhiều cuốc (cuộn được).
 *
 * Chạy:  node seed-fake-notifications.js
 * (Chạy ở máy/server nào đang kết nối tới DB production của backend.)
 */
const { sequelize, FakeNotification, AppSetting, Admin } = require('./src/models');

// 10 tuyến miền Bắc, giá thực tế
// startDetail/endDetail = tên điểm chi tiết (đậm), startArea/endArea = dòng "Khu vực" (mờ)
const templates = [
  { startPoint: 'Phú Thọ',   endPoint: 'Lào Cai',    startDetail: 'Thành phố Việt Trì (Phú Thọ)', endDetail: 'Thị trấn du lịch Sa Pa (Lào Cai)', startArea: 'Thành phố Việt Trì, Phú Thọ', endArea: 'Sa Pa, Lào Cai',                 displayDate: '2026-07-10', displayTime: '09:00', carType: '4', price: 2800000, note: 'Khách đi nghỉ dưỡng yêu cầu chạy thẳng tuyến cao tốc Nội Bài – Lào Cai, xe đời mới êm ái, tài xế không hút thuốc.' },
  { startPoint: 'Hà Nội',    endPoint: 'Bắc Ninh',   startDetail: 'Quận Cầu Giấy (Hà Nội)',      endDetail: 'Thành phố Bắc Ninh (Bắc Ninh)',    startArea: 'Cầu Giấy, Hà Nội',      endArea: 'Thành phố Bắc Ninh, Bắc Ninh',   displayTime: '08:30', carType: '4', price: 360000,  note: 'Đón tại Cầu Giấy, khách 2 người ít đồ' },
  { startPoint: 'Hà Nội',    endPoint: 'Hải Phòng',  startDetail: 'Quận Long Biên (Hà Nội)',     endDetail: 'Quận Lê Chân (Hải Phòng)',         startArea: 'Long Biên, Hà Nội',      endArea: 'Lê Chân, Hải Phòng',             displayTime: '09:15', carType: '7', price: 850000,  note: 'Đi công tác, cần đúng giờ, xe đời mới' },
  { startPoint: 'Hà Nội',    endPoint: 'Hạ Long',    startDetail: 'Quận Hoàn Kiếm (Hà Nội)',     endDetail: 'Phường Bãi Cháy (Hạ Long)',        startArea: 'Hoàn Kiếm, Hà Nội',      endArea: 'Bãi Cháy, Hạ Long, Quảng Ninh',  displayTime: '07:45', carType: '7', price: 1100000, note: 'Gia đình đi du lịch, có trẻ nhỏ' },
  { startPoint: 'Hà Nội',    endPoint: 'Ninh Bình',  startDetail: 'Quận Hà Đông (Hà Nội)',       endDetail: 'Chùa Bái Đính (Ninh Bình)',        startArea: 'Hà Đông, Hà Nội',        endArea: 'Chùa Bái Đính, Gia Viễn, Ninh Bình', displayTime: '10:00', carType: '4', price: 700000,  note: 'Khách đi lễ chùa Bái Đính' },
  { startPoint: 'Hà Nội',    endPoint: 'Thái Nguyên',startDetail: 'Quận Long Biên (Hà Nội)',     endDetail: 'Thành phố Thái Nguyên (Thái Nguyên)', startArea: 'Long Biên, Hà Nội',   endArea: 'Thành phố Thái Nguyên, Thái Nguyên', displayTime: '13:30', carType: '4', price: 650000,  note: 'Đón tại Long Biên' },
  { startPoint: 'Hà Nội',    endPoint: 'Nam Định',   startDetail: 'Quận Thanh Xuân (Hà Nội)',    endDetail: 'Thành phố Nam Định (Nam Định)',    startArea: 'Thanh Xuân, Hà Nội',     endArea: 'Thành phố Nam Định, Nam Định',   displayTime: '14:20', carType: '7', price: 720000,  note: 'Khách về quê, nhiều hành lý' },
  { startPoint: 'Hà Nội',    endPoint: 'Phú Thọ',    startDetail: 'Quận Cầu Giấy (Hà Nội)',      endDetail: 'Đền Hùng, Việt Trì (Phú Thọ)',     startArea: 'Cầu Giấy, Hà Nội',       endArea: 'Đền Hùng, Việt Trì, Phú Thọ',    displayTime: '15:00', carType: '4', price: 680000,  note: 'Đi Đền Hùng, khách 3 người' },
  { startPoint: 'Hà Nội',    endPoint: 'Lào Cai',    startDetail: 'Sân bay Nội Bài (Hà Nội)',    endDetail: 'Thị trấn Sa Pa (Lào Cai)',         startArea: 'Nội Bài, Hà Nội',        endArea: 'Sa Pa, Lào Cai',                 displayTime: '06:30', carType: '7', price: 2200000, note: 'Đi Sa Pa nghỉ dưỡng, chạy cao tốc Nội Bài - Lào Cai' },
  { startPoint: 'Hà Nội',    endPoint: 'Thanh Hóa',  startDetail: 'Quận Hoàng Mai (Hà Nội)',     endDetail: 'Thành phố Thanh Hóa (Thanh Hóa)',  startArea: 'Hoàng Mai, Hà Nội',      endArea: 'Thành phố Thanh Hóa, Thanh Hóa', displayTime: '16:10', carType: '16',price: 1500000, note: 'Đoàn 12 người đi sự kiện' },
  { startPoint: 'Hà Nội',    endPoint: 'Quảng Ninh', startDetail: 'Quận Long Biên (Hà Nội)',     endDetail: 'Thành phố Cẩm Phả (Quảng Ninh)',   startArea: 'Long Biên, Hà Nội',      endArea: 'Cẩm Phả, Quảng Ninh',            displayTime: '11:40', carType: '7', price: 1150000, note: 'Khách đi công tác Cẩm Phả' },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối DB thành công.');

    // Cần 1 admin để gán createdById (NOT NULL, ref admins)
    const admin = await Admin.findOne({ order: [['id', 'ASC']] });
    if (!admin) {
      console.error('❌ Không tìm thấy admin nào trong DB. Hãy tạo admin trước khi seed.');
      process.exit(1);
    }
    console.log(`ℹ️  Dùng adminId=${admin.id} (${admin.username}) làm người tạo.`);

    // Xoá các thông báo north cũ do seed trước đó (tránh trùng lặp khi chạy lại)
    const deleted = await FakeNotification.destroy({ where: { region: 'north' } });
    if (deleted > 0) console.log(`🗑️  Đã xoá ${deleted} thông báo 'north' cũ.`);

    let ok = 0;
    for (const t of templates) {
      await FakeNotification.create({
        region: 'north',
        startPoint: t.startPoint,
        endPoint: t.endPoint,
        startArea: t.startArea || null,
        endArea: t.endArea || null,
        startDetail: t.startDetail || null,
        endDetail: t.endDetail || null,
        displayTime: t.displayTime,
        displayDate: t.displayDate || null,
        carType: t.carType,
        price: t.price,
        note: t.note,
        isActive: true,
        createdById: admin.id,
      });
      ok++;
      console.log(`✓ [${ok}/${templates.length}] ${t.startPoint} → ${t.endPoint} : ${t.price.toLocaleString('vi-VN')}đ`);
    }

    // Nâng số lượng hiển thị để driver thấy nhiều cuốc (cuộn được)
    let settings = await AppSetting.findOne();
    if (!settings) {
      settings = await AppSetting.create({ minFakeCount: 8, maxFakeCount: 10, minFakeInterval: 15, maxFakeInterval: 30 });
      console.log('⚙️  Tạo AppSetting mới: minFakeCount=8, maxFakeCount=10');
    } else {
      await settings.update({ minFakeCount: 8, maxFakeCount: 10 });
      console.log('⚙️  Cập nhật AppSetting: minFakeCount=8, maxFakeCount=10');
    }

    console.log(`\n✅ Hoàn tất. Đã seed ${ok} thông báo. Driver sẽ thấy 8-10 cuốc mỗi lần.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed lỗi:', err.message);
    process.exit(1);
  }
}

seed();
