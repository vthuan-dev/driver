#!/bin/bash

echo "🚀 Building Driver App for iOS..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean
flutter pub get

# Analyze code
echo "🔍 Analyzing code..."
flutter analyze

# Build iOS
echo "📱 Building iOS app..."
flutter build ios --release --no-codesign

# Create IPA
echo "📦 Creating IPA..."
cd build/ios/iphoneos
mkdir -p Payload
cp -r Runner.app Payload/
zip -r driver_app.ipa Payload/

echo "✅ IPA created at: build/ios/iphoneos/driver_app.ipa"
echo ""
echo "📋 Next steps:"
echo "1. Download the IPA file"
echo "2. Use Transporter app or hire someone to upload to TestFlight"
echo "3. Or use fastlane with proper certificates"