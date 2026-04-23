# 🚀 Driver App - Build Instructions

## Method 1: GitHub Actions (Recommended)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name: `driver-app`
4. Don't initialize with README
5. Create repository

### Step 2: Push Code
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/driver-app.git
git branch -M main
git push -u origin main
```

### Step 3: Download IPA
1. Go to repository → Actions tab
2. Wait for "Build iOS IPA" to complete (~10-15 minutes)
3. Click on the completed build
4. Download "driver-app-ipa" artifact
5. Extract to get `driver_app.ipa`

## Method 2: Local Build (macOS only)

### Prerequisites
- macOS with Xcode installed
- Flutter SDK
- Apple Developer Account

### Build Commands
```bash
# Clean and get dependencies
flutter clean
flutter pub get

# Build iOS (no code signing)
flutter build ios --release --no-codesign

# Create IPA
cd build/ios/iphoneos
mkdir -p Payload
cp -r Runner.app Payload/
zip -r driver_app.ipa Payload/
```

## Upload to TestFlight

### Option 1: Transporter App (macOS)
1. Download Transporter from Mac App Store
2. Open Transporter
3. Drag `driver_app.ipa` into Transporter
4. Sign in with Apple ID
5. Upload to App Store Connect

### Option 2: Hire iOS Developer
- Find freelancer on Upwork/Fiverr
- Send them the IPA file
- They upload to your TestFlight

## Required Setup

### Apple Developer Account
- Cost: $99/year
- Sign up at [developer.apple.com](https://developer.apple.com)

### App Store Connect
1. Create new app
2. Bundle ID: `com.driver.driverapp`
3. App Name: `Driver App`
4. Category: Business/Productivity

### TestFlight
- Internal testing: Up to 100 users
- External testing: Up to 10,000 users
- No App Store review needed for internal testing

## App Information

- **Bundle ID**: `com.driver.driverapp`
- **Version**: `1.0.0+1`
- **Display Name**: `Driver App`
- **Minimum iOS**: `12.0`
- **Backend**: `https://driver-ahv6.onrender.com/api`

## Troubleshooting

### Build Fails
- Check Flutter version: `flutter --version`
- Update Flutter: `flutter upgrade`
- Clean project: `flutter clean && flutter pub get`

### Upload Fails
- Ensure Bundle ID matches App Store Connect
- Check app version is higher than previous
- Verify Apple Developer Account is active

## Next Steps After Upload

1. **Internal Testing**
   - Add testers in TestFlight
   - Send test invitations
   - Collect feedback

2. **App Store Submission**
   - Add app screenshots
   - Write app description
   - Set pricing (Free)
   - Submit for review

3. **Production Release**
   - Wait for Apple approval (~24-48 hours)
   - Release to App Store
   - Monitor user feedback