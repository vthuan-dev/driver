/**
 * Script cập nhật ngày khởi hành cho toàn bộ thông báo ảo (FakeNotification)
 * lùi về 2 ngày sau (Khách đặt lịch trước 2 ngày) kèm giờ đón chân thực.
 *
 * Chạy trên VPS: node backend/scripts/update_fake_dates.js
 */

const { FakeNotification, sequelize } = require('../src/models');

async function updateFakeDates() {
  try {
    console.log('🔄 Đang kết nối cơ sở dữ liệu...');
    await sequelize.authenticate();
    console.log('✅ Đã kết nối cơ sở dữ liệu thành công!');

    const now = new Date();
    // 2 ngày sau
    const targetDateObj = new Date(now);
    targetDateObj.setDate(targetDateObj.getDate() + 2);
    const twoDaysLaterStr = targetDateObj.toISOString().split('T')[0];

    console.log(`\n📅 Ngày chuẩn hóa mới (2 ngày sau): ${twoDaysLaterStr}`);

    const timeSlots = ['07:30', '08:00', '08:30', '09:00', '09:30', '13:00', '13:30', '14:00', '15:30', '16:00'];

    const fakeList = await FakeNotification.findAll();
    console.log(`Tổng số thông báo ảo trong DB: ${fakeList.length}`);

    let updatedCount = 0;
    for (let i = 0; i < fakeList.length; i++) {
      const item = fakeList[i];
      let needUpdate = false;

      // 1. Chuẩn hóa ngày: Khách đặt trước 2 ngày
      if (!item.displayDate || item.displayDate < twoDaysLaterStr) {
        item.displayDate = twoDaysLaterStr;
        needUpdate = true;
      }

      // 2. Chuẩn hóa giờ đón: Nếu là giờ lẻ bất thường hoặc trùng giờ hiện tại, gán dải giờ đẹp
      let realisticTime = timeSlots[i % timeSlots.length];
      if (item.note) {
        const matchTime = item.note.match(/(\d{1,2})[h:]([0-5][0-9])?/i);
        if (matchTime) {
          const h = parseInt(matchTime[1]);
          const m = matchTime[2] || '00';
          if (h >= 5 && h <= 23) {
            realisticTime = `${String(h).padStart(2, '0')}:${m}`;
          }
        }
      }

      if (!item.displayTime || item.displayTime.includes('15:58') || item.displayTime.includes('15:57')) {
        item.displayTime = realisticTime;
        needUpdate = true;
      }

      if (needUpdate) {
        await item.save();
        updatedCount++;
        console.log(`[#${item.id}] "${item.startPoint} -> ${item.endPoint}": ${item.displayTime} ngày ${item.displayDate}`);
      }
    }

    console.log(`\n🎉 Đã cập nhật thành công ${updatedCount}/${fakeList.length} thông báo ảo sang ngày ${twoDaysLaterStr} (2 ngày sau)!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật ngày thông báo:', err);
    process.exit(1);
  }
}

updateFakeDates();
