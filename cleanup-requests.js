/**
 * Cleanup low-price requests by marking them as cancelled.
 *
 * Env:
 *  - TOKEN: Bearer token (đăng nhập tài xế/admin có quyền)
 *  - API_URL: ví dụ http://localhost:5000/api
 *  - MIN_PRICE: ngưỡng hủy (mặc định 300000)
 *
 * Chạy:
 *  TOKEN="..." API_URL="http://localhost:5000/api" node cleanup-requests.js
 *  # hoặc set MIN_PRICE=400000 nếu muốn
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TOKEN = process.env.TOKEN;
const MIN_PRICE = Number(process.env.MIN_PRICE || 300000);

if (!TOKEN) {
  console.error('Thiếu TOKEN. Đặt env TOKEN="your_jwt_token" rồi chạy lại.');
  process.exit(1);
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  },
});

async function loadRequests() {
  // lấy tất cả waiting; chỉnh params nếu backend hỗ trợ status khác
  const res = await client.get('/requests', { params: { status: 'waiting' } });
  return Array.isArray(res.data?.requests) ? res.data.requests : [];
}

async function cancelRequest(id) {
  await client.put(`/requests/${id}`, { status: 'cancelled' });
}

async function main() {
  console.log(`Loading requests... (MIN_PRICE=${MIN_PRICE})`);
  const list = await loadRequests();
  console.log(`Total waiting: ${list.length}`);

  const targets = list.filter((r) => {
    const price = Number(r.price || 0);
    return !Number.isFinite(price) || price < MIN_PRICE;
  });

  console.log(`Will cancel: ${targets.length}`);

  let ok = 0, fail = 0;
  for (const r of targets) {
    try {
      await cancelRequest(r._id);
      ok++;
      console.log(`✓ cancelled ${r.startPoint} -> ${r.endPoint} (${r.price})`);
      await new Promise((res) => setTimeout(res, 80));
    } catch (e) {
      fail++;
      console.error(`✗ ${r._id}`, e?.response?.data || e.message);
    }
  }

  console.log(`Done. Cancelled: ${ok}, Failed: ${fail}`);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

