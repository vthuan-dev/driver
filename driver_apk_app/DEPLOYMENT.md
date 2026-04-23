# Driver App - iOS Deployment Guide

## 🎯 Current Status
- ✅ App hoạt động hoàn hảo trên web và mobile
- ✅ API integration với backend trên Render
- ✅ Pagination và lazy loading
- ✅ Hỗ trợ cả 3 miền: Bắc, Trung, Nam
- ✅ Ready for iOS deployment

## 📱 Build IPA

### Option 1: GitHub Actions (Recommended)
1. Push code lên GitHub
2. GitHub Actions sẽ tự động build IPA
3. Download artifact từ Actions tab
4. Thuê người upload lên TestFlight

### Option 2: Local Build (Cần macOS)
```bash
chmod +x scripts/build_ios.sh
./scripts/build_ios.sh
```

## 🚀 TestFlight Deployment

### Cần có:
1. **Apple Developer Account** ($99/year)
2. **Bundle ID**: `com.driver.driverapp`
3. **App Store Connect** access
4. **Certificates & Provisioning Profiles**

### Upload Methods:
1. **Transporter App** (macOS)
2. **Xcode** (macOS)
3. **Fastlane** (automated)
4. **Hire iOS developer** (easiest)

## 📋 Pre-deployment Checklist

- [x] App tested on web
- [x] API calls working
- [x] All regions have data
- [x] Pagination working
- [x] UI/UX polished
- [ ] Remove debug logs (production)
- [ ] App icons added
- [ ] Privacy policy URL
- [ ] Terms of service

## 🔧 Configuration

### Bundle ID
```
com.driver.driverapp
```

### App Name
```
Driver App
```

### Version
```
1.0.0+1
```

## 📞 Support
- Backend: `https://driver-ahv6.onrender.com/api`
- Platform: Flutter 3.35.1
- Target: iOS 12.0+