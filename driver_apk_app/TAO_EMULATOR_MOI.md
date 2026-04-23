# 📱 TẠO ANDROID EMULATOR MỚI

## Cách 1: Dùng Android Studio (Dễ nhất)

### Bước 1: Mở Android Studio
1. Mở **Android Studio**
2. Click **More Actions** → **Virtual Device Manager**
3. Hoặc: **Tools** → **Device Manager**

### Bước 2: Tạo emulator mới
1. Click **Create Device**
2. Chọn **Phone** → **Pixel 5** (hoặc Pixel 6)
3. Click **Next**

### Bước 3: Chọn System Image
1. Chọn **API Level 34** (Android 14) hoặc **API 33**
2. Click **Download** nếu chưa có
3. Click **Next**

### Bước 4: Cấu hình (QUAN TRỌNG)
```
Device Name: Flutter_Test_Phone
Startup orientation: Portrait

Advanced Settings:
├── RAM: 4096 MB (4GB) ← QUAN TRỌNG
├── VM Heap: 512 MB
├── Internal Storage: 8192 MB (8GB) ← QUAN TRỌNG
├── SD Card: 512 MB
└── Graphics: Hardware - GLES 2.0
```

5. Click **Finish**

---

## Cách 2: Dùng Command Line (Nhanh)

### Tạo emulator với cấu hình cao:
```bash
# Xem danh sách system images có sẵn
sdkmanager --list | findstr "system-images"

# Download system image (nếu chưa có)
sdkmanager "system-images;android-34;google_apis_playstore;x86_64"

# Tạo AVD mới
avdmanager create avd -n Flutter_Phone -k "system-images;android-34;google_apis_playstore;x86_64" -d "pixel_5"
```

### Chỉnh RAM và Storage:
Mở file config:
```
C:\Users\LENOVO\.android\avd\Flutter_Phone.avd\config.ini
```

Sửa các dòng:
```ini
hw.ramSize=4096
disk.dataPartition.size=8G
vm.heapSize=512
```

---

## Cách 3: Sửa emulator hiện tại

### Bước 1: Tìm file config
```
C:\Users\LENOVO\.android\avd\Medium_Phone_API_36.0.avd\config.ini
```

### Bước 2: Sửa các giá trị
```ini
hw.ramSize=4096          # Tăng RAM lên 4GB
disk.dataPartition.size=8G  # Tăng storage lên 8GB
vm.heapSize=512          # Tăng heap
```

### Bước 3: Khởi động lại emulator
```bash
flutter emulators --launch Medium_Phone_API_36.0
```

---

## Kiểm tra emulator mới

```bash
# Xem danh sách
flutter emulators

# Khởi động
flutter emulators --launch Flutter_Phone

# Chạy app
flutter run
```

---

## Cấu hình khuyến nghị

### Tối thiểu (Chạy được):
- RAM: 2GB
- Storage: 4GB
- API Level: 30+

### Khuyến nghị (Mượt):
- RAM: 4GB ⭐
- Storage: 8GB ⭐
- API Level: 33-34
- Graphics: Hardware

### Tối ưu (Rất mượt):
- RAM: 6-8GB
- Storage: 16GB
- API Level: 34
- Graphics: Hardware
- Enable Snapshot

---

## Troubleshooting

### Lỗi: "Not enough disk space"
→ Xóa emulators cũ không dùng
→ Dọn dẹp Android SDK

### Lỗi: "Emulator too slow"
→ Enable Hardware Graphics
→ Tăng RAM
→ Enable Snapshot

### Lỗi: "Cannot create AVD"
→ Chạy Android Studio as Administrator
→ Kiểm tra ANDROID_HOME environment variable
