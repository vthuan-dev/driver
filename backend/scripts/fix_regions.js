/**
 * Script quét và chuẩn hóa lại vùng miền (region) cho toàn bộ
 * FakeNotifications và WaitingRequests theo từ điển địa lý chuẩn 63 tỉnh thành.
 *
 * Chạy trên VPS: node backend/scripts/fix_regions.js
 */

const { FakeNotification, WaitingRequest, sequelize } = require('../src/models');
const { detectRegionFromPlace } = require('../src/utils/geoUtils');

async function fixRegions() {
  try {
    console.log('🔄 Đang kết nối cơ sở dữ liệu để chuẩn hóa vùng miền...');
    await sequelize.authenticate();
    console.log('✅ Đã kết nối cơ sở dữ liệu thành công!');

    // 1. Quét FakeNotifications
    console.log('\n--- 1. Quét bảng FakeNotifications ---');
    const fakeList = await FakeNotification.findAll();
    let updatedFakeCount = 0;

    for (const item of fakeList) {
      const correctRegion = detectRegionFromPlace(item.startPoint, item.endPoint);
      if (item.region !== correctRegion) {
        console.log(`[Fake #${item.id}] "${item.startPoint}" -> "${item.endPoint}": ${item.region} ➔ ${correctRegion}`);
        item.region = correctRegion;
        await item.save();
        updatedFakeCount++;
      }
    }
    console.log(`=> Đã chuẩn hóa ${updatedFakeCount}/${fakeList.length} thông báo ảo.`);

    // 2. Quét WaitingRequests
    console.log('\n--- 2. Quét bảng WaitingRequests ---');
    const waitList = await WaitingRequest.findAll();
    let updatedWaitCount = 0;

    for (const item of waitList) {
      const correctRegion = detectRegionFromPlace(item.startPoint, item.endPoint);
      if (item.region !== correctRegion) {
        console.log(`[Request #${item.id}] "${item.startPoint}" -> "${item.endPoint}": ${item.region} ➔ ${correctRegion}`);
        item.region = correctRegion;
        await item.save();
        updatedWaitCount++;
      }
    }
    console.log(`=> Đã chuẩn hóa ${updatedWaitCount}/${waitList.length} cuốc xe chờ.`);

    console.log('\n🎉 Hoàn tất chuẩn hóa vùng miền thành công 100%!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi chuẩn hóa vùng miền:', err);
    process.exit(1);
  }
}

fixRegions();
