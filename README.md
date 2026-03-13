# 🚗 Driver App - Flutter Migration Documentation

Complete documentation for migrating the Driver App to Flutter. **Admin features excluded.**

---

## 📖 Table of Contents

1. [API Documentation](#-api-documentation)
2. [Design System](#-design-system)
3. [Components Specification](#-components-specification)
4. [Screen Layouts](#-screen-layouts)
5. [Flutter Implementation Guide](#-flutter-implementation-guide)

---

## 🌐 API Documentation

**Base URL:** `https://driver-ahv6.onrender.com/api`

### Authentication

JWT token stored locally, expires after 7 days.

```dart
// Add to headers for protected endpoints
headers: {'Authorization': 'Bearer $token'}
```

---

### 1. Authentication Endpoints

#### POST `/api/auth/register`
Register new driver account.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ | Driver full name |
| `phone` | String | ✅ | Phone number (unique) |
| `password` | String | ✅ | Min 4 characters |
| `carType` | String | ✅ | Vehicle model (e.g., "Toyota Vios") |
| `carYear` | String | ✅ | Year (e.g., "2020") |

**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "password": "123456",
  "carType": "Toyota Vios",
  "carYear": "2020"
}
```

**Response (201):**
```json
{
  "message": "Đăng ký thành công. Vui lòng chờ admin phê duyệt.",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "status": "pending"
  }
}
```

**Errors:** `400` Phone exists | `500` Server error

---

#### POST `/api/auth/login`

**Request:**
```json
{
  "phone": "0901234567",
  "password": "123456"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "carType": "Toyota Vios",
    "carYear": "2020"
  }
}
```

**Errors:** `400` Invalid credentials | `403` Not approved

---

### 2. Drivers Endpoints

#### GET `/api/drivers`
Get active drivers list.

**Query Params:**
| Param | Values |
|-------|--------|
| `region` | `north`, `central`, `south` |

**Response:**
```json
{
  "drivers": [
    {
      "_id": "60d21b4667d0d8992e610c87",
      "name": "Trần Văn B",
      "phone": "0912345678",
      "route": "Hà Nội <-> Hải Phòng",
      "avatar": "https://...",
      "region": "north",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 3. Requests Endpoints

#### POST `/api/requests`
Create ride request (public, no auth).

**Request:**
```json
{
  "name": "Lê Văn C",
  "phone": "0923456789",
  "startPoint": "Hà Nội",
  "endPoint": "Hải Phòng",
  "price": 500000,
  "note": "Đi lúc 8h sáng",
  "region": "north"
}
```

**Response (201):**
```json
{
  "message": "Request created successfully",
  "request": {
    "_id": "60d21b4667d0d8992e610c88",
    "status": "waiting",
    ...
  }
}
```

---

#### GET `/api/requests`
Get all requests.

**Query Params:**
| Param | Type | Values |
|-------|------|--------|
| `status` | string | `waiting`, `matched`, `completed` |
| `limit` | number | Max 100 |

---

#### GET `/api/requests/my-requests`
Get current user's requests. **Auth required.**

---

## 🎨 Design System

### Color Palette

```dart
class AppColors {
  // Primary - Green
  static const primary = Color(0xFF00B14F);
  static const primaryDark = Color(0xFF0A8F43);
  static const primaryLight = Color(0xFF007F3B);
  
  // Background
  static const background = Color(0xFFF6F7F8);
  static const surface = Color(0xFFFFFFFF);
  static const cardBg = Color(0xFFFFFFFF);
  
  // Text
  static const textPrimary = Color(0xFF111827);
  static const textSecondary = Color(0xFF5B6B72);
  static const textMuted = Color(0xFF64748B);
  static const textDark = Color(0xFF334155);
  
  // Accent
  static const amber = Color(0xFFF59E0B);
  static const amberDark = Color(0xFFFBBF24);
  static const red = Color(0xFFEF4444);
  static const redDark = Color(0xFFDC2626);
  
  // Borders & Dividers
  static const border = Color(0xFFE5E7EB);
  static const borderLight = Color(0xFFEEF0F2);
  static const divider = Color(0xFFE2E8F0);
  
  // Ticker
  static const tickerBg = Color(0xFFE9FBF0);
  static const tickerBorder = Color(0xFFD6F5E3);
  static const tickerText = Color(0xFF007F3B);
  
  // Shadows
  static const shadow = Color(0x0F000000); // 6% opacity
  static const primaryShadow = Color(0x3300B14F); // 20% opacity
}
```

### Gradients

```dart
class AppGradients {
  static const primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF00B14F), Color(0xFF0A8F43)],
  );
}
```

### Typography

```dart
class AppTextStyles {
  static const fontFamily = 'Be Vietnam Pro'; // or 'Roboto'
  
  // Headings
  static const heading1 = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: Color(0xFF111827),
  );
  
  static const heading2 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w800,
    color: Color(0xFF111827),
  );
  
  // Body
  static const body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: Color(0xFF111827),
  );
  
  static const bodySmall = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: Color(0xFF5B6B72),
  );
  
  // Labels
  static const label = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: Color(0xFF5B6B72),
  );
  
  // Buttons
  static const button = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.3,
  );
  
  // Phone numbers
  static const phone = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: Color(0xFF111111),
  );
  
  // Price
  static const price = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: Color(0xFF0A8F43),
  );
}
```

### Border Radius

```dart
class AppRadius {
  static const small = 10.0;
  static const medium = 12.0;
  static const large = 14.0;
  static const xl = 16.0;
  static const xxl = 20.0;
  static const circle = 999.0;
}
```

### Spacing

```dart
class AppSpacing {
  static const xs = 6.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 20.0;
  static const xxl = 24.0;
}
```

### Shadows

```dart
class AppShadows {
  static final card = BoxShadow(
    color: Colors.black.withOpacity(0.06),
    blurRadius: 18,
    offset: Offset(0, 6),
  );
  
  static final button = BoxShadow(
    color: Color(0xFF00B14F).withOpacity(0.35),
    blurRadius: 18,
    offset: Offset(0, 8),
  );
  
  static final modal = BoxShadow(
    color: Colors.black.withOpacity(0.25),
    blurRadius: 60,
    offset: Offset(0, 24),
  );
}
```

---

## 📦 Components Specification

### 1. RegionTabBar

Horizontal tab bar for switching regions.

```
┌─────────────┬─────────────┬─────────────┐
│  Miền Bắc   │  Miền Trung │  Miền Nam   │
│   (active)  │             │             │
└─────────────┴─────────────┴─────────────┘
```

**Specs:**
- Height: 44px
- Gap: 8px between tabs
- Active: Green bg (#00B14F), white text, shadow
- Inactive: Gray bg (#E2E8F0), dark text

---

### 2. DriverCard

```
┌──────────────────────────────────────────────┐
│  ┌──────┐  Trần Văn B           ┌──────────┐ │
│  │Avatar│  0912 xxxx 678        │ 📞 Call  │ │
│  │ 48px │  Hà Nội <-> Hải Phòng └──────────┘ │
│  └──────┘                                    │
└──────────────────────────────────────────────┘
```

**Specs:**
- Padding: 12px
- Border radius: 16px
- Avatar: 48x48, circular, gradient background
- Call button: 44x44, circular, green, white phone icon
- Phone: 18px bold, masked for non-logged users
- Route: 13px, gray (#5B6B72)

---

### 3. RequestCard

```
┌──────────────────────────────────────────────┐
│  Lê Văn C                                    │
│  SĐT khách hàng: 092 xxxx 789                │
│  Hà Nội -> Hải Phòng                         │
│  Ghi chú: Đi lúc 8h sáng                     │
│  Giá: 500,000 VND                            │
│  ┌──────────────────────────────────────────┐│
│  │              SAO CHÉP                    ││
│  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

**Specs:**
- Padding: 12px
- Border radius: 12px
- Name: Bold text
- Route: Gray text
- Price: Green (#0A8F43), bold
- Copy button: Amber (#F59E0B), full width, 12px radius

---

### 4. AuthBox (Promo Banner)

Gradient card prompting registration/login.

```
┌──────────────────────────────────────────────┐
│      🚗 Tham gia nhóm tài xế                 │
│   Để liên hệ và đăng cuốc xe                 │
│                                              │
│  ┌───────────┐  ┌───────────────┐            │
│  │ Đăng ký   │  │  Đăng nhập    │            │
│  │  ngay     │  │               │            │
│  └───────────┘  └───────────────┘            │
└──────────────────────────────────────────────┘
```

**Specs:**
- Gradient: #00B14F → #0A8F43
- Border radius: 16px
- Padding: 20px
- Title: White, 18px bold
- Subtitle: White 90% opacity, 14px
- Primary button: White bg, green text
- Secondary button: Semi-transparent white border

---

### 5. FloatingCTA

Sticky bottom button.

**Specs:**
- Position: Fixed at bottom center
- Width: 100% - 32px, max 480px
- Height: ~56px
- Background: #00B14F
- Text: White, bold, centered
- Border radius: 16px
- Bottom margin: 16px

---

### 6. Ticker

Scrolling driver announcements.

**Specs:**
- Background: #E9FBF0
- Border bottom: 1px #D6F5E3
- Animation: Scroll left, 22s linear infinite
- Items: Green dot + driver info
- Text: 14px, #007F3B

---

### 7. Modal

Bottom sheet style modal.

**Specs:**
- Backdrop: Black 45% opacity
- Panel: White, rounded corners (20px)
- Max height: 85vh
- Header: Light green (#E9FBF0), green text
- Drag indicator: 40x4px gray bar on mobile

---

### 8. ProvinceDropdown

Select province filter.

**Specs:**
- Full width
- Border: 1px #E5E7EB
- Border radius: 12px
- Padding: 12px 14px
- Focus: Green border + shadow
- Custom dropdown arrow

---

## 📱 Screen Layouts

### Home Screen

```
┌────────────────────────────────┐
│ ☰  TOPBAR               [Đăng │
│                          nhập]│
├────────────────────────────────┤
│ 🟢 Anh Tuấn - HN<->HP    >>>  │ ← Ticker
├────────────────────────────────┤
│                                │
│  ┌────────────────────────┐    │
│  │ 🚗 Tham gia nhóm tài xế│    │ ← AuthBox
│  │ [Đăng ký] [Đăng nhập]  │    │
│  └────────────────────────┘    │
│                                │
│  📋 Yêu cầu chờ cuốc xe        │
│  [Miền Bắc] [Miền Trung] [Nam] │
│  [Dropdown: Chọn tỉnh ▼]       │
│                                │
│  ┌────────────────────────┐    │
│  │ RequestCard 1          │    │
│  └────────────────────────┘    │
│  ┌────────────────────────┐    │
│  │ RequestCard 2          │    │
│  └────────────────────────┘    │
│                                │
│  🚘 Danh sách tài xế           │
│  [Miền Bắc] [Miền Trung] [Nam] │
│                                │
│  ┌────────────────────────┐    │
│  │ DriverCard 1           │    │
│  └────────────────────────┘    │
│                                │
├────────────────────────────────┤
│  [  ĐĂNG KÝ CHỜ CUỐC XE  →  ]  │ ← Floating CTA
└────────────────────────────────┘
```

---

## 🦋 Flutter Implementation Guide

### Project Structure

```
lib/
├── main.dart
├── config/
│   └── theme.dart           # AppColors, TextStyles, etc.
├── models/
│   ├── user.dart
│   ├── driver.dart
│   └── request.dart
├── services/
│   ├── api_service.dart
│   └── auth_service.dart
├── providers/
│   ├── auth_provider.dart
│   ├── drivers_provider.dart
│   └── requests_provider.dart
├── screens/
│   ├── home_screen.dart
│   ├── login_screen.dart
│   ├── register_screen.dart
│   └── create_request_screen.dart
├── widgets/
│   ├── region_tab_bar.dart
│   ├── driver_card.dart
│   ├── request_card.dart
│   ├── auth_box.dart
│   ├── ticker.dart
│   ├── province_dropdown.dart
│   └── floating_cta.dart
└── utils/
    ├── phone_mask.dart
    └── provinces.dart
```

### Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  provider: ^6.1.1
  flutter_secure_storage: ^9.0.0
  google_fonts: ^6.1.0
  url_launcher: ^6.2.1
  flutter_animate: ^4.3.0  # For animations
```

### Key Implementation Notes

1. **Phone Masking:**
```dart
String maskPhone(String phone, {bool isLoggedIn = false}) {
  if (isLoggedIn) return phone;
  if (phone.length >= 10) {
    return '${phone.substring(0, 3)} xxxx ${phone.substring(phone.length - 3)}';
  }
  return phone;
}
```

2. **Region Enum:**
```dart
enum Region { north, central, south }

extension RegionExtension on Region {
  String get label {
    switch (this) {
      case Region.north: return 'Miền Bắc';
      case Region.central: return 'Miền Trung';
      case Region.south: return 'Miền Nam';
    }
  }
}
```

3. **63 Vietnamese Provinces:**
```dart
final Map<Region, List<String>> provincesByRegion = {
  Region.north: ['Hà Nội', 'Hải Phòng', 'Hải Dương', ...],
  Region.central: ['Đà Nẵng', 'Huế', 'Quảng Nam', ...],
  Region.south: ['TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', ...],
};
```

4. **API Service:**
```dart
class ApiService {
  static const baseUrl = 'https://driver-ahv6.onrender.com/api';
  
  Future<List<Driver>> getDrivers({Region? region}) async {
    final url = region != null 
      ? '$baseUrl/drivers?region=${region.name}' 
      : '$baseUrl/drivers';
    final response = await http.get(Uri.parse(url));
    // Parse response...
  }
}
```

5. **Secure Token Storage:**
```dart
final storage = FlutterSecureStorage();
await storage.write(key: 'token', value: token);
await storage.write(key: 'user', value: jsonEncode(user));
```

---

## 🧪 API Testing (cURL)

```bash
# Get drivers (North)
curl https://driver-ahv6.onrender.com/api/drivers?region=north

# Get all requests
curl https://driver-ahv6.onrender.com/api/requests

# Register
curl -X POST https://driver-ahv6.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"0999999999","password":"1234","carType":"Honda","carYear":"2022"}'

# Login
curl -X POST https://driver-ahv6.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0999999999","password":"1234"}'
```

---

## 📝 Error Response Format

```json
{
  "message": "Error description"
}
```

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (not approved) |
| 404 | Not Found |
| 500 | Server Error |

---

**📅 Last Updated:** January 2026
