# 🤖 HƯỚNG DẪN CHẠY ANDROID

## Cách 1: Tự động (Dễ nhất)
1. Double click file: `run_android_full.bat`
2. Đợi emulator khởi động (40 giây)
3. App sẽ tự động chạy

## Cách 2: Thủ công

### Bước 1: Khởi động emulator
```bash
flutter emulators --launch Medium_Phone_API_36.0
```

### Bước 2: Đợi emulator boot xong (30-60 giây)
- Xem cửa sổ emulator hiện lên
- Đợi màn hình home Android xuất hiện

### Bước 3: Kiểm tra device đã sẵn sàng
```bash
flutter devices
```
Phải thấy: `emulator-xxxx • sdk gphone64 x86 64 • android-x64 • Android ...`

### Bước 4: Chạy app
```bash
flutter run
```

## Cách 3: Chạy trực tiếp (nếu emulator đã bật)
```bash
flutter run -d emulator-5554
```

## Troubleshooting

### Lỗi: "No devices found"
- Đợi thêm 30 giây cho emulator boot
- Chạy lại: `flutter devices`

### Lỗi: "Emulator already running"
- Emulator đã chạy rồi
- Chỉ cần: `flutter run`

### Lỗi: Android licenses
```bash
flutter doctor --android-licenses
```
Nhấn 'y' cho tất cả

### Muốn tạo emulator mới
```bash
flutter emulators --create
```

## Hot Reload
Khi app đang chạy:
- Nhấn `r` - Hot reload (nhanh)
- Nhấn `R` - Hot restart (khởi động lại)
- Nhấn `q` - Thoát

## Debug
- Nhấn `o` - Toggle platform (Android/iOS)
- Nhấn `p` - Toggle debug painting
- Nhấn `w` - Dump widget hierarchy
