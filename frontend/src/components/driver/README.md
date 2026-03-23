# Driver Dashboard Component

## 📱 Tổng quan

Driver Dashboard là trang chính dành cho tài xế sau khi đăng nhập thành công và được admin phê duyệt.

## 🎯 Chức năng

### 1. **Trang chủ (Home)**
- **Balance Card**: Hiển thị số dư ký quỹ hiện tại (200.000đ)
- **Quick Actions**: 
  - Mua bảo hiểm
  - Đăng ký mở thẻ ngân hàng
- **Stats Card**: Thống kê cuốc xe
  - Cuốc xe hoàn thành/tháng
  - Tổng cuốc xe hoàn thành
- **Service Toggle**: Bật/Tắt nhận dịch vụ cuốc xe

### 2. **Hoạt động (Activity)**
- Lịch sử cuốc xe
- Doanh thu
- Báo cáo (Coming soon)

### 3. **Thông báo (Notifications)**
- Cuốc mới
- Tin nhắn từ khách
- Thông báo hệ thống (Coming soon)

### 4. **Tài khoản (Account)**
- Thông tin cá nhân
- Ảnh xe
- Trạng thái phê duyệt
- Nút đăng xuất

## 🎨 Design System

### Màu sắc
- **Primary**: `#C84A47` (Đỏ cam)
- **Success**: `#10b981` (Xanh lá)
- **Background**: Gradient `#667eea` → `#764ba2`
- **Card**: `rgba(255, 255, 255, 0.95)`

### Typography
- **Font**: System fonts (Inter, SF Pro, Roboto)
- **Sizes**:
  - Balance: 48px
  - Heading: 24px
  - Body: 16px
  - Caption: 13px

### Spacing
- Card padding: 25-30px
- Gap: 12-20px
- Border radius: 16-20px

## 🔧 Cách sử dụng

### Import
```tsx
import DriverDashboard from './components/driver/DriverDashboard';
```

### Props
```tsx
type DriverDashboardProps = {
  user: User;           // Thông tin user đã đăng nhập
  onLogout: () => void; // Callback khi đăng xuất
};
```

### Example
```tsx
<DriverDashboard 
  user={user} 
  onLogout={() => {
    localStorage.removeItem('driver_user');
    localStorage.removeItem('token');
    setUser(null);
  }}
/>
```

## 📱 Responsive

- **Desktop**: Full layout với sidebar
- **Tablet**: Responsive grid
- **Mobile**: Stack layout, bottom navigation

## 🚀 Tích hợp API (Coming soon)

### Endpoints cần tích hợp:
1. `GET /api/driver/balance` - Lấy số dư
2. `GET /api/driver/stats` - Lấy thống kê
3. `PUT /api/driver/online-status` - Cập nhật trạng thái online
4. `GET /api/driver/trips` - Lấy lịch sử cuốc
5. `GET /api/driver/notifications` - Lấy thông báo

## 🎯 Roadmap

- [ ] Tích hợp API backend
- [ ] Real-time notifications (WebSocket)
- [ ] Map hiển thị vị trí
- [ ] Lịch sử cuốc xe chi tiết
- [ ] Báo cáo doanh thu
- [ ] Chat với khách hàng
- [ ] Đánh giá từ khách
- [ ] Quản lý thu nhập

## 📝 Notes

- Component sử dụng Framer Motion cho animations
- State management đơn giản với useState
- Responsive design với CSS Grid & Flexbox
- Bottom navigation cố định ở mobile
