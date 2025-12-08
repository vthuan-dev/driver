/**
 * Seed 20 tuyến Hà Nội -> tỉnh lân cận với giá thực tế vào DB.
 * Yêu cầu:
 *  - Đã có token đăng nhập tài xế (Bearer token) lưu ở env TOKEN
 *  - API_URL trỏ tới backend, mặc định http://localhost:5000/api
 *
 * Chạy:
 *  TOKEN="YOUR_JWT_TOKEN" API_URL="http://localhost:5000/api" node seed-hanoi-routes.js
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error('Thiếu TOKEN. Đặt env TOKEN="your_jwt_token" rồi chạy lại.');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  },
});

const routes = [
  { dest: 'Bắc Ninh', min: 340_000, max: 380_000, note: 'Xe 7 chỗ' },
  { dest: 'Từ Sơn', min: 240_000, max: 290_000, note: 'Xe 4-7 chỗ' },
  { dest: 'Yên Phong', min: 280_000, max: 320_000, note: 'Xe 4-7 chỗ' },
  { dest: 'Quế Võ', min: 490_000, max: 590_000, note: 'Xe 4-7 chỗ' },
  { dest: 'Tiên Du', min: 250_000, max: 350_000, note: 'Xe 4-7 chỗ' },
  { dest: 'Hải Dương', min: 480_000, max: 550_000, note: 'Xe 7 chỗ' },
  { dest: 'Hải Phòng', min: 800_000, max: 900_000, note: 'Xe 7 chỗ' },
  { dest: 'Hà Nam', min: 430_000, max: 500_000, note: 'Xe 7 chỗ' },
  { dest: 'Bắc Giang', min: 520_000, max: 600_000, note: 'Xe 7 chỗ' },
  { dest: 'Hòa Bình', min: 580_000, max: 650_000, note: 'Xe 7 chỗ' },
  { dest: 'Phú Thọ', min: 650_000, max: 750_000, note: 'Xe 7 chỗ' },
  { dest: 'Thái Nguyên', min: 620_000, max: 700_000, note: 'Xe 7 chỗ' },
  { dest: 'Nam Định', min: 650_000, max: 750_000, note: 'Xe 7 chỗ' },
  { dest: 'Ninh Bình', min: 650_000, max: 750_000, note: 'Xe 7 chỗ' },
  { dest: 'Thái Bình', min: 750_000, max: 850_000, note: 'Xe 7 chỗ' },
  { dest: 'Thanh Hóa', min: 850_000, max: 950_000, note: 'Xe 7 chỗ' },
  { dest: 'Lạng Sơn', min: 950_000, max: 1_050_000, note: 'Xe 7 chỗ' },
  { dest: 'Yên Bái', min: 950_000, max: 1_050_000, note: 'Xe 7 chỗ' },
  { dest: 'Quảng Ninh', min: 1_050_000, max: 1_150_000, note: 'Xe 7 chỗ' },
  { dest: 'Phú Thọ', min: 650_000, max: 750_000, note: 'Đi công tác, cần đúng giờ' },
];

const names = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
  'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Hùng', 'Bùi Thị Lan',
  'Phan Văn Minh', 'Ngô Thị Nga', 'Đỗ Văn Quang', 'Lý Thị Hoa',
  'Dương Văn Tuấn', 'Võ Thị Mai', 'Tạ Văn Đức', 'Lương Thị Linh',
];

const randomPhone = () => {
  const prefixes = ['09', '08', '07', '03'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const body = Math.floor(1_000_0000 + Math.random() * 8_999_9999).toString(); // 8 digits
  return `${prefix}${body}`;
};

const randomName = (i) => names[i % names.length];

const randomPrice = (min, max) => {
  const val = min + Math.random() * (max - min);
  return Math.round(val / 1000) * 1000; // round to 1k
};

async function seed() {
  console.log(`Seeding ${routes.length} tuyến Hà Nội -> lân cận ...`);
  let ok = 0, fail = 0;
  for (let i = 0; i < routes.length; i++) {
    const r = routes[i];
    const payload = {
      name: randomName(i),
      phone: randomPhone(),
      startPoint: 'Hà Nội',
      endPoint: r.dest,
      price: randomPrice(r.min, r.max),
      note: r.note,
      region: 'north',
    };
    try {
      await client.post('/requests', payload);
      ok++;
      console.log(`✓ [${i + 1}/${routes.length}] ${payload.startPoint} -> ${payload.endPoint} : ${payload.price.toLocaleString('vi-VN')} VND`);
      await new Promise((res) => setTimeout(res, 120));
    } catch (err) {
      fail++;
      console.error(`✗ [${i + 1}] ${payload.startPoint} -> ${payload.endPoint}`, err?.response?.data || err.message);
    }
  }
  console.log(`Done. Success: ${ok}, Fail: ${fail}`);
}

seed().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

