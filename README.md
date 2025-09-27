# Driver App - Gom lại thành 2 service

Dự án đã được gom lại thành 2 service chính:

## Cấu trúc dự án

```
driver-ui/
├── frontend/          # Frontend service (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/     # Admin panel components
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.ts     # Main API
│   │   │   └── adminApi.ts # Admin API
│   │   └── ...
│   └── package.json
├── backend/           # Backend service (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── admin.js   # Admin routes (/api/admin)
│   │   │   └── ...
│   │   └── ...
│   └── package.json
└── README.md
```

## Cách chạy

### 1. Backend Service
```bash
cd backend
npm install
npm run dev
```
Backend sẽ chạy trên http://localhost:5000

### 2. Frontend Service
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy trên http://localhost:5173

## Truy cập Admin

Admin panel có thể truy cập qua: http://localhost:5173/admin

- **Đăng nhập mặc định**: admin / admin123
- **API admin**: http://localhost:5000/api/admin

## API Endpoints

### Main API
- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/login` - Đăng nhập user
- `GET /api/drivers` - Lấy danh sách tài xế
- `POST /api/requests` - Tạo yêu cầu chờ cuốc

### Admin API
- `POST /api/admin/login` - Đăng nhập admin
- `GET /api/admin/users` - Lấy danh sách users
- `PUT /api/admin/users/:id/approve` - Phê duyệt user
- `PUT /api/admin/users/:id/reject` - Từ chối user
- `GET /api/admin/requests` - Lấy danh sách yêu cầu

## Tính năng

### Frontend
- **Trang chủ**: Hiển thị danh sách tài xế, đăng ký chờ cuốc
- **Admin panel** (`/admin`): Quản lý users và requests
- **Responsive design** với Framer Motion animations

### Backend
- **Authentication**: JWT cho user và admin
- **User management**: Đăng ký, phê duyệt, từ chối
- **Request management**: Tạo và quản lý yêu cầu chờ cuốc
- **MongoDB**: Lưu trữ dữ liệu

## Cấu hình

### Backend
Tạo file `.env` trong `backend/`:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Frontend
Cấu hình API URL trong `frontend/src/services/api.ts` và `adminApi.ts` nếu cần.