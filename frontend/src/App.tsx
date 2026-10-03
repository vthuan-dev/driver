import { useState, useEffect, Component, useRef } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import api, { authAPI, driversAPI, requestsAPI, driverAPI, bankConfigAPI } from './services/api'
import AdminLogin from './components/admin/Login'
import AdminDashboard from './components/admin/Dashboard'
import DriverDashboard from './components/driver/DriverDashboard'
import FakeNotificationBanner from './components/driver/FakeNotificationBanner'
import AppPricingModal from './components/driver/AppPricingModal'
import DownloadAppPage from './components/driver/DownloadAppPage'
import LoginWelcomeModal from './components/driver/LoginWelcomeModal'
import DriverIncomePage from './components/driver/DriverIncomePage'
import { Joyride, STATUS, EVENTS } from 'react-joyride'
import type { Step } from 'react-joyride'

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Đã xảy ra lỗi</h2>
          <p>Vui lòng tải lại trang hoặc thử lại sau.</p>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

type Region = 'north' | 'central' | 'south'

type DriverPost = {
  _id: string
  name: string
  phone: string
  route: string
  avatar?: string
  region?: Region
  isActive: boolean
  createdAt: string
}

type User = {
  _id: string
  name: string
  phone: string
  carType: string
  carYear: string
  carImage?: string
  status: 'pending' | 'approved' | 'rejected'
}

const fallbackDriversTuples: Array<[string, string, string, string, Region]> = [
  // North (Miền Bắc)
  ['north-1', 'Anh Tuan', '0912345678', 'Ha Noi <-> Lao Cai', 'north'],
  ['north-2', 'Chi Hanh', '0987654321', 'Ha Noi <-> Ninh Binh', 'north'],
  ['north-3', 'Anh Duong', '0901234567', 'My Dinh <-> Noi Bai', 'north'],
  ['north-4', 'Anh Hoang', '0968888777', 'Cau Giay <-> Hai Phong', 'north'],
  ['north-5', 'Anh Nam', '0977123456', 'Long Bien <-> Ha Long', 'north'],
  ['north-6', 'Chi Linh', '0355555999', 'Ha Dong <-> Phu Tho', 'north'],
  ['north-7', 'Bac Tuan', '0934567123', 'Ha Noi <-> Dien Bien', 'north'],
  ['north-8', 'Anh Thang', '0945678123', 'Ha Noi <-> Son La', 'north'],
  ['north-9', 'Anh Vinh', '0911222333', 'Ha Noi <-> Ha Giang', 'north'],
  ['north-10', 'Anh Tam', '0977333555', 'Ha Noi <-> Yen Bai', 'north'],
  ['north-11', 'Anh Duc', '0915667788', 'Ha Noi <-> Tuyen Quang', 'north'],
  ['north-12', 'Anh Hieu', '0982334455', 'Ha Noi <-> Bac Kan', 'north'],
  ['north-13', 'Chi Mai', '0978665544', 'Ha Noi <-> Thai Nguyen', 'north'],
  ['north-14', 'Anh Quang', '0964111222', 'Ha Noi <-> Lang Son', 'north'],

  // Central (Miền Trung)
  ['central-1', 'Anh Khoa', '0934567890', 'Da Nang <-> Hue', 'central'],
  ['central-2', 'Anh Tho', '0905671234', 'Da Nang <-> Quang Nam', 'central'],
  ['central-3', 'Anh Hung', '0978112233', 'Quy Nhon <-> Pleiku', 'central'],
  ['central-4', 'Anh Minh', '0965123789', 'Nha Trang <-> Da Lat', 'central'],
  ['central-5', 'Chi Yen', '0923456781', 'Hue <-> Quang Tri', 'central'],
  ['central-6', 'Anh Phuc', '0907788991', 'Da Nang <-> Quang Ngai', 'central'],
  ['central-7', 'Anh Son', '0935111222', 'Da Nang <-> Quang Binh', 'central'],
  ['central-8', 'Anh Tien', '0978999111', 'Nha Trang <-> Phan Rang', 'central'],
  ['central-9', 'Anh Long', '0965222333', 'Quy Nhon <-> Kon Tum', 'central'],
  ['central-10', 'Chi Ha', '0924666888', 'Hue <-> Da Nang', 'central'],

  // South (Miền Nam)
  ['south-1', 'Anh Khai', '0903456789', 'TP HCM <-> Vung Tau', 'south'],
  ['south-2', 'Anh Phuong', '0939345123', 'TP HCM <-> Can Tho', 'south'],
  ['south-3', 'Anh Cuong', '0988123456', 'Bien Hoa <-> Long An', 'south'],
  ['south-4', 'Chi Trang', '0977456123', 'TP HCM <-> Tay Ninh', 'south'],
  ['south-5', 'Anh Loc', '0911778899', 'Can Tho <-> Ca Mau', 'south'],
  ['south-6', 'Anh Viet', '0906677889', 'TP HCM <-> Vinh Long', 'south'],
  ['south-7', 'Anh Danh', '0938222333', 'TP HCM <-> Tien Giang', 'south'],
  ['south-8', 'Anh Bao', '0977555333', 'TP HCM <-> Ben Tre', 'south'],
  ['south-9', 'Anh Phat', '0965222444', 'TP HCM <-> Binh Duong', 'south'],
  ['south-10', 'Chi Nhi', '0924333444', 'Can Tho <-> Kien Giang', 'south'],
];

function generatePhone(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  const prefix = (hash % 2 === 0) ? '09' : '07'
  const body = (hash % 100000000).toString().padStart(8, '0')
  return prefix + body
}

const posts: DriverPost[] = fallbackDriversTuples.map(([id, name, phone, route, region]) => ({
  _id: id,
  name,
  phone: generatePhone(`${id}-${name}-${phone}`),
  route,
  region,
  isActive: true,
  createdAt: new Date().toISOString(),
}))

const fallbackDriversByRegion: Record<Region, DriverPost[]> = posts.reduce((acc, driver) => {
  const region = (driver.region ?? 'north') as Region
  if (!acc[region]) {
    acc[region] = []
  }
  acc[region].push(driver)
  return acc
}, { north: [], central: [], south: [] } as Record<Region, DriverPost[]>)

const regionLabels: Record<Region, string> = {
  north: '🏔️ Miền Bắc',
  central: '🌊 Miền Trung',
  south: '🌴 Miền Nam',
}

const provincesVN63 = [
  'An Giang', 'Bà Rịa-Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cần Thơ', 'Cao Bằng', 'Đà Nẵng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội', 'Hà Tĩnh',
  'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'TP. Hồ Chí Minh', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Quy Nhơn', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên - Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
]

// Phân loại tỉnh thành theo miền
const provincesByRegion: Record<Region, string[]> = {
  north: [
    'Hà Nội', 'Hải Phòng', 'Hải Dương', 'Hưng Yên', 'Thái Bình',
    'Hà Nam', 'Nam Định', 'Ninh Bình', 'Vĩnh Phúc', 'Bắc Ninh',
    'Quảng Ninh', 'Lạng Sơn', 'Cao Bằng', 'Bắc Kạn', 'Thái Nguyên',
    'Tuyên Quang', 'Hà Giang', 'Lào Cai', 'Yên Bái', 'Lai Châu',
    'Điện Biên', 'Sơn La', 'Hòa Bình', 'Phú Thọ', 'Bắc Giang'
  ],
  central: [
    'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị',
    'Thừa Thiên - Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi',
    'Bình Định', 'Quy Nhơn', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận',
    'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ],
  south: [
    'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa-Vũng Tàu',
    'Tây Ninh', 'Bình Phước', 'Long An', 'Tiền Giang', 'Bến Tre',
    'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang',
    'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
  ]
}

// Hàm xác định miền từ tên tỉnh thành
function getRegionFromProvince(province: string): Region | null {
  for (const [region, provinces] of Object.entries(provincesByRegion)) {
    if (provinces.includes(province)) {
      return region as Region
    }
  }
  return null
}

//

function maskPhoneStrict(phone: string): string {
  // Hiển thị 3 đầu số + xxxx + 3 cuối số
  if (phone.length >= 10) {
    const first3 = phone.slice(0, 3)
    const last3 = phone.slice(-3)
    return `${first3} xxxx ${last3}`
  }
  return phone
}

//

// Admin App Component
function AdminApp() {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('admin_token');
    const adminData = localStorage.getItem('admin_user');

    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (adminData: any) => {
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdmin(null);
    // Redirect to admin login page
    window.location.href = '/admin';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {admin ? (
        <AdminDashboard admin={admin} onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

// Main App Component
function MainApp() {
  // Handle uncaught promise rejections
  const seedingRef = useRef(false)
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Uncaught Promise Rejection:', event.reason);
      event.preventDefault(); // Prevent the default browser behavior

      // Show user-friendly error message
      setErrorMessage('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Helper function để tạo cuốc xe ảo - expose ra window để gọi từ console (DEV only)
    const isDev = import.meta.env.DEV
    const randomPhone = () => {
      const prefixes = ['09', '08', '07', '03']
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const body = Math.floor(1_000_0000 + Math.random() * 8_999_9999).toString() // 8 digits
      return `${prefix}${body}` // 10 digits
    }
    const randomPrice = (min: number = 350_000, max: number = 1_500_000) => {
      const value = min + Math.random() * (max - min)
      return Math.round(value / 1000) * 1000 // làm tròn nghìn cho “thật”
    }
    const randomNote = (notes: string[]) => notes[Math.floor(Math.random() * notes.length)]

    // Map điểm đến ưu tiên để tránh route phi thực tế
    const provincePreferredDestinations: Record<string, string[]> = {
      'Thanh Hóa': ['Hà Nội', 'Ninh Bình', 'Nam Định', 'Hà Nam', 'Nghệ An', 'Hòa Bình'],
      'Hà Nội': [
        'Bắc Ninh', 'Từ Sơn', 'Yên Phong', 'Quế Võ', 'Tiên Du',
        'Hải Dương', 'Hải Phòng', 'Hà Nam', 'Bắc Giang', 'Hòa Bình',
        'Phú Thọ', 'Thái Nguyên', 'Nam Định', 'Ninh Bình', 'Thái Bình',
        'Thanh Hóa', 'Lạng Sơn', 'Yên Bái', 'Quảng Ninh'
      ],
      'Hải Phòng': ['Quảng Ninh', 'Hà Nội', 'Hải Dương', 'Thái Bình', 'Hưng Yên'],
      'TP. Hồ Chí Minh': ['Bình Dương', 'Đồng Nai', 'Bà Rịa-Vũng Tàu', 'Long An', 'Tiền Giang'],
      'Đà Nẵng': ['Quảng Nam', 'Thừa Thiên - Huế', 'Quảng Ngãi'],
    }

    // Bảng giá tham khảo theo tuyến (min, max)
    const provincePriceRanges: Record<string, Record<string, [number, number]>> = {
      'Hà Nội': {
        'Bắc Ninh': [340_000, 380_000],
        'Từ Sơn': [240_000, 290_000],
        'Yên Phong': [280_000, 320_000],
        'Quế Võ': [490_000, 590_000],
        'Tiên Du': [250_000, 350_000],
        'Hải Dương': [480_000, 550_000],
        'Hải Phòng': [800_000, 900_000],
        'Hà Nam': [430_000, 500_000],
        'Bắc Giang': [520_000, 600_000],
        'Hòa Bình': [580_000, 650_000],
        'Phú Thọ': [650_000, 750_000],
        'Thái Nguyên': [620_000, 700_000],
        'Nam Định': [650_000, 750_000],
        'Ninh Bình': [650_000, 750_000],
        'Thái Bình': [750_000, 850_000],
        'Thanh Hóa': [850_000, 950_000],
        'Lạng Sơn': [950_000, 1_050_000],
        'Yên Bái': [950_000, 1_050_000],
        'Quảng Ninh': [1_050_000, 1_150_000],
      },
    }

    const getPriceRange = (origin: string, destination: string, fallbackMin: number, fallbackMax: number): [number, number] => {
      const fromMap = provincePriceRanges[origin]?.[destination]
      if (fromMap) return fromMap
      return [fallbackMin, fallbackMax]
    }

    const createFakeRequests = async (options?: { perProvince?: number; delayMs?: number }) => {
      if (!isDev) {
        console.warn('createFakeRequests chỉ dùng trong DEV')
        return { successCount: 0, errorCount: 0, total: 0 }
      }
      if (seedingRef.current) {
        console.warn('Đang chạy seeding, chờ hoàn tất...')
        return { successCount: 0, errorCount: 0, total: 0 }
      }
      seedingRef.current = true
      const perProvince = options?.perProvince ?? 100
      const delayMs = options?.delayMs ?? 10

      const fakeNames = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
        'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Hùng', 'Bùi Thị Lan',
        'Phan Văn Minh', 'Ngô Thị Nga', 'Đỗ Văn Quang', 'Lý Thị Hoa',
        'Dương Văn Tuấn', 'Võ Thị Mai', 'Tạ Văn Đức', 'Lương Thị Linh'
      ]

      const notes = [
        'Cần đi gấp, xe 4 chỗ', 'Xe 7 chỗ, có hành lý nhiều', 'Đi sớm 6h sáng',
        'Cần tài xế kinh nghiệm', 'Đi về trong ngày', 'Có thể đợi đến 8h tối',
        'Xe đời mới, điều hòa tốt', 'Cần đi đường cao tốc', 'Có trẻ em đi cùng',
        'Cần tài xế cẩn thận', 'Đi công tác, cần đúng giờ', 'Có người già đi cùng'
      ]

      const requests: Array<{ name: string, phone: string, startPoint: string, endPoint: string, price: number, note: string, region: Region }> = []

      // Tạo requests cho mỗi miền
      for (const [region, provinces] of Object.entries(provincesByRegion)) {
        const regionType = region as Region

        // Tạo N requests cho mỗi tỉnh
        provinces.forEach((province, idx) => {
          const preferred = provincePreferredDestinations[province] || []
          const destinationsPool = preferred.length ? preferred : provinces
          const destinations = destinationsPool.filter(p => p !== province)
          const isShort = preferred.length > 0
          const defaultMin = isShort ? 450_000 : 800_000
          const defaultMax = isShort ? 1_400_000 : 2_000_000

          for (let i = 0; i < perProvince; i++) {
            // Chọn destination ngẫu nhiên từ danh sách tỉnh trong cùng miền
            const randomDest = destinations[Math.floor(Math.random() * destinations.length)]

            if (randomDest) {
              const nameIdx = (idx * perProvince + i) % fakeNames.length
              const phone = randomPhone()
              const note = randomNote(notes)
              const [routeMin, routeMax] = getPriceRange(province, randomDest, defaultMin, defaultMax)
              const price = randomPrice(routeMin, routeMax)

              requests.push({
                name: fakeNames[nameIdx],
                phone,
                startPoint: province,
                endPoint: randomDest,
                price,
                note,
                region: regionType
              })
            }
          }
        })
      }

      console.log(`🚀 Đang tạo ${requests.length} cuốc xe ảo (≈ ${perProvince} cuốc/tỉnh, delay ${delayMs}ms)...`)

      // Tạo requests với delay để tránh quá tải server
      let successCount = 0
      let errorCount = 0

      try {
        for (let i = 0; i < requests.length; i++) {
          try {
            await requestsAPI.createRequest(requests[i])
            successCount++
            console.log(`✓ [${i + 1}/${requests.length}] ${requests[i].startPoint} -> ${requests[i].endPoint}`)

            // Delay giữa mỗi request
            if (i < requests.length - 1) {
              await new Promise(resolve => setTimeout(resolve, delayMs))
            }
          } catch (error) {
            errorCount++
            console.error(`✗ Lỗi: ${requests[i].startPoint} -> ${requests[i].endPoint}`, error)
          }
        }

        console.log(`\n✅ Hoàn thành! Đã tạo thành công: ${successCount}/${requests.length}`)
        if (errorCount > 0) {
          console.log(`⚠️ Có ${errorCount} lỗi`)
        }

        // Reload requests sau khi tạo xong
        try {
          const res = await requestsAPI.getAllRequests({ status: 'waiting' })
          const list = Array.isArray(res.data?.requests) ? res.data.requests : []
          list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          console.log(`📋 Đã reload ${list.length} yêu cầu`)
        } catch (e) {
          console.error('Error reloading requests', e)
        }

        return { successCount, errorCount, total: requests.length }
      } finally {
        seedingRef.current = false
      }
    }

    // Helper: tạo cuốc ảo cho 1 tỉnh cụ thể và lưu lên server
    const createProvinceRequests = async (province: string, options?: { count?: number; delayMs?: number }) => {
      if (!isDev) {
        console.warn('createProvinceRequests chỉ dùng trong DEV')
        return { total: 0, successCount: 0, errorCount: 0 }
      }
      if (seedingRef.current) {
        console.warn('Đang chạy seeding, chờ hoàn tất...')
        return { total: 0, successCount: 0, errorCount: 0 }
      }
      seedingRef.current = true
      const count = options?.count ?? 20
      const delayMs = options?.delayMs ?? 20
      const region = getRegionFromProvince(province)
      if (!region) {
        console.warn('Không xác định được miền cho tỉnh/thành:', province)
        return { total: 0, successCount: 0, errorCount: 0 }
      }

      const provinces = provincesByRegion[region] || []
      const preferred = provincePreferredDestinations[province] || []
      const destinationsPool = preferred.length ? preferred : provinces
      const destinations = destinationsPool.filter((p) => p !== province)
      if (destinations.length === 0) {
        console.warn('Không có điểm đến hợp lệ trong cùng miền cho tỉnh:', province)
        return { total: 0, successCount: 0, errorCount: 0 }
      }

      const fakeNames = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
        'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Hùng', 'Bùi Thị Lan',
        'Phan Văn Minh', 'Ngô Thị Nga', 'Đỗ Văn Quang', 'Lý Thị Hoa',
        'Dương Văn Tuấn', 'Võ Thị Mai', 'Tạ Văn Đức', 'Lương Thị Linh'
      ]
      const notes = [
        'Cần đi gấp, xe 4 chỗ', 'Xe 7 chỗ, có hành lý nhiều', 'Đi sớm 6h sáng',
        'Cần tài xế kinh nghiệm', 'Đi về trong ngày', 'Có thể đợi đến 8h tối',
        'Xe đời mới, điều hòa tốt', 'Cần đi đường cao tốc', 'Có trẻ em đi cùng',
        'Cần tài xế cẩn thận', 'Đi công tác, cần đúng giờ', 'Có người già đi cùng'
      ]
      const isShort = preferred.length > 0
      const defaultMin = isShort ? 450_000 : 800_000
      const defaultMax = isShort ? 1_400_000 : 2_000_000
      console.log(`🚀 Tạo ${count} cuốc ảo cho ${province} (server), delay ${delayMs}ms... Destinations ưu tiên: ${destinations.slice(0, 6).join(', ')}`)

      let successCount = 0
      let errorCount = 0

      try {
        for (let i = 0; i < count; i++) {
          const randomDest = destinations[Math.floor(Math.random() * destinations.length)]
          const nameIdx = i % fakeNames.length
          const phone = randomPhone()
          const note = randomNote(notes)
          const [routeMin, routeMax] = getPriceRange(province, randomDest, defaultMin, defaultMax)
          const price = randomPrice(routeMin, routeMax)

          const payload = {
            name: fakeNames[nameIdx],
            phone,
            startPoint: province,
            endPoint: randomDest,
            price,
            note,
            region,
          }

          try {
            await requestsAPI.createRequest(payload)
            successCount++
            console.log(`✓ [${i + 1}/${count}] ${province} -> ${randomDest}`)
            if (i < count - 1) {
              await new Promise((resolve) => setTimeout(resolve, delayMs))
            }
          } catch (error) {
            errorCount++
            console.error(`✗ Lỗi: ${province} -> ${randomDest}`, error)
          }
        }

        console.log(`✅ Hoàn thành ${province}: ${successCount}/${count} cuốc`)

        try {
          const res = await requestsAPI.getAllRequests({ status: 'waiting' })
          const list = Array.isArray(res.data?.requests) ? res.data.requests : []
          list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setRequests(list)
          console.log(`📋 Reload requests: ${list.length}`)
        } catch (e) {
          console.error('Error reloading requests', e)
        }

        return { total: count, successCount, errorCount }
      } finally {
        seedingRef.current = false
      }
    }

    // Helper: seed dữ liệu ảo vào state (không gọi API, chỉ hiển thị local)
    const seedLocalFakeRequests = (options?: { perProvince?: number }) => {
      const perProvince = options?.perProvince ?? 100

      const fakeNames = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
        'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Hùng', 'Bùi Thị Lan',
        'Phan Văn Minh', 'Ngô Thị Nga', 'Đỗ Văn Quang', 'Lý Thị Hoa',
        'Dương Văn Tuấn', 'Võ Thị Mai', 'Tạ Văn Đức', 'Lương Thị Linh'
      ]
      const notes = [
        'Cần đi gấp, xe 4 chỗ', 'Xe 7 chỗ, có hành lý nhiều', 'Đi sớm 6h sáng',
        'Cần tài xế kinh nghiệm', 'Đi về trong ngày', 'Có thể đợi đến 8h tối',
        'Xe đời mới, điều hòa tốt', 'Cần đi đường cao tốc', 'Có trẻ em đi cùng',
        'Cần tài xế cẩn thận', 'Đi công tác, cần đúng giờ', 'Có người già đi cùng'
      ]

      const localRequests: Array<{ _id: string; name: string; phone: string; startPoint: string; endPoint: string; price: number; createdAt: string; note?: string; region?: Region }> = []

      for (const [region, provinces] of Object.entries(provincesByRegion)) {
        const regionType = region as Region
        provinces.forEach((province, idx) => {
          const preferred = provincePreferredDestinations[province] || []
          const destinationsPool = preferred.length ? preferred : provinces
          const destinations = destinationsPool.filter((p) => p !== province)
          const isShort = preferred.length > 0
          const defaultMin = isShort ? 450_000 : 800_000
          const defaultMax = isShort ? 1_400_000 : 2_000_000
          for (let i = 0; i < perProvince; i++) {
            const randomDest = destinations[Math.floor(Math.random() * destinations.length)]
            if (!randomDest) continue

            const nameIdx = (idx * perProvince + i) % fakeNames.length
            const phone = randomPhone()
            const note = randomNote(notes)
            const [routeMin, routeMax] = getPriceRange(province, randomDest, defaultMin, defaultMax)
            const price = randomPrice(routeMin, routeMax)

            localRequests.push({
              _id: `local-${regionType}-${province}-${i}`,
              name: fakeNames[nameIdx],
              phone,
              startPoint: province,
              endPoint: randomDest,
              price,
              note,
              region: regionType,
              createdAt: new Date().toISOString(),
            })
          }
        })
      }

      console.log(`🧪 Seed local: ${localRequests.length} cuốc (≈ ${perProvince} cuốc/tỉnh)`)
      setRequests(localRequests)
      return { total: localRequests.length }
    }

    // Helper: seed thêm cuốc ảo cho một tỉnh cụ thể (local only, không gọi API)
    const seedLocalProvinceRequests = (province: string, options?: { perProvince?: number }) => {
      const perProvince = options?.perProvince ?? 20
      const region = getRegionFromProvince(province)
      if (!region) {
        console.warn('Không xác định được miền cho tỉnh/thành:', province)
        return { total: 0 }
      }

      const fakeNames = [
        'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung',
        'Hoàng Văn Em', 'Vũ Thị Phương', 'Đặng Văn Hùng', 'Bùi Thị Lan',
        'Phan Văn Minh', 'Ngô Thị Nga', 'Đỗ Văn Quang', 'Lý Thị Hoa',
        'Dương Văn Tuấn', 'Võ Thị Mai', 'Tạ Văn Đức', 'Lương Thị Linh'
      ]
      const notes = [
        'Cần đi gấp, xe 4 chỗ', 'Xe 7 chỗ, có hành lý nhiều', 'Đi sớm 6h sáng',
        'Cần tài xế kinh nghiệm', 'Đi về trong ngày', 'Có thể đợi đến 8h tối',
        'Xe đời mới, điều hòa tốt', 'Cần đi đường cao tốc', 'Có trẻ em đi cùng',
        'Cần tài xế cẩn thận', 'Đi công tác, cần đúng giờ', 'Có người già đi cùng'
      ]

      const provinces = provincesByRegion[region] || []
      const preferred = provincePreferredDestinations[province] || []
      const destinationsPool = preferred.length ? preferred : provinces
      const destinations = destinationsPool.filter((p) => p !== province)
      const isShort = preferred.length > 0
      const defaultMin = isShort ? 450_000 : 800_000
      const defaultMax = isShort ? 1_400_000 : 2_000_000
      if (destinations.length === 0) {
        console.warn('Không có điểm đến hợp lệ trong cùng miền cho tỉnh:', province)
        return { total: 0 }
      }

      const newRequests: Array<{ _id: string; name: string; phone: string; startPoint: string; endPoint: string; price: number; createdAt: string; note?: string; region?: Region }> = []

      for (let i = 0; i < perProvince; i++) {
        const randomDest = destinations[Math.floor(Math.random() * destinations.length)]
        const nameIdx = i % fakeNames.length
        const phone = randomPhone()
        const note = randomNote(notes)
        const [routeMin, routeMax] = getPriceRange(province, randomDest, defaultMin, defaultMax)
        const price = randomPrice(routeMin, routeMax)

        newRequests.push({
          _id: `local-${province}-${i}-${Date.now()}`,
          name: fakeNames[nameIdx],
          phone,
          startPoint: province,
          endPoint: randomDest,
          price,
          note,
          region,
          createdAt: new Date().toISOString(),
        })
      }

      setRequests((prev) => [...newRequests, ...prev])
      console.log(`🧪 Seed local tỉnh ${province}: +${newRequests.length} cuốc (≈ ${perProvince} cuốc)`)
      return { total: newRequests.length }
    }

      // Expose function to window for console access
      ; (window as any).createFakeRequests = createFakeRequests;
    ; (window as any).seedLocalFakeRequests = seedLocalFakeRequests;
    ; (window as any).seedLocalProvinceRequests = seedLocalProvinceRequests;
    ; (window as any).createProvinceRequests = createProvinceRequests;
    if (isDev) {
      console.log('💡 Tạo cuốc xe ảo (gọi API): createFakeRequests({ perProvince: 100, delayMs: 10 })')
      console.log('💡 Seed local tất cả tỉnh (không gọi API): seedLocalFakeRequests({ perProvince: 100 })')
      console.log('💡 Seed local 1 tỉnh: seedLocalProvinceRequests("Thanh Hóa", { perProvince: 100 })')
      console.log('💡 Tạo cuốc ảo lên server cho 1 tỉnh: createProvinceRequests("Thanh Hóa", { count: 20, delayMs: 20 })')
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      delete (window as any).createFakeRequests;
      delete (window as any).seedLocalFakeRequests;
      delete (window as any).seedLocalProvinceRequests;
      delete (window as any).createProvinceRequests;
      seedingRef.current = false
    };
  }, []);

  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null)
  const [user, setUser] = useState<User | null>(() => {
    try { 
      const savedUser = JSON.parse(localStorage.getItem('driver_user') || 'null');
      // If user exists but missing status, we'll fetch it in useEffect
      return savedUser;
    } catch { 
      return null;
    }
  })
  
  // ── Driver notifications ──
  const [driverPostId, setDriverPostId] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifList, setNotifList] = useState<any[]>([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)

  useEffect(() => {
    if (!user || user.status !== 'approved') return
    const findPost = async () => {
      try {
        const res = await api.get('/drivers')
        const posts: any[] = res.data.drivers || res.data || []
        const mine = posts.find((p: any) => p.phone === user.phone)
        if (mine) setDriverPostId(Number(mine.id ?? mine._id))
      } catch {}
    }
    findPost()
  }, [user])

  useEffect(() => {
    if (!driverPostId) return
    const poll = async () => {
      try {
        const res = await api.get(`/requests/for-driver/${driverPostId}`)
        setUnreadCount(res.data.unreadCount || 0)
        setNotifList(res.data.requests || [])
      } catch {}
    }
    poll()
    const timer = setInterval(poll, 30000)
    return () => clearInterval(timer)
  }, [driverPostId])

  const handleBellClick = async () => {
    setShowNotifPanel(v => !v)
    if (driverPostId && unreadCount > 0) {
      try { await api.post(`/requests/for-driver/${driverPostId}/mark-read`) } catch {}
      setUnreadCount(0)
    }
  }

  // State to control showing driver dashboard
  const [showDriverDashboard, setShowDriverDashboard] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDownloadPage, setShowDownloadPage] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('1y');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const tourSteps: Step[] = [
    {
      target: '#joyride-download-btn',
      title: '📱 Tải ứng dụng di động',
      content: 'Nhấn vào đây để tải app về điện thoại. App hỗ trợ thông báo cuốc xe TỨC THÌ – không bỏ lỡ kèo nào!',
      placement: 'bottom',
      skipBeacon: true,
    },
    {
      target: '#joyride-pricing-cards',
      title: '💳 Chọn gói phù hợp',
      content: 'Chọn gói 1 năm – 400.000đ ⭐ hoặc Dùng vĩnh viễn – 1.000.000đ 👑. Xác nhận thanh toán là nhận link tải APK ngay!',
      placement: 'top',
      skipBeacon: true,
      targetWaitTimeout: 4000,
    },
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status, type, index } = data;
    if (type === EVENTS.STEP_AFTER && index === 0) {
      setShowPricingModal(true);
    }
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem('joyride_done', '1');
    }
  };

  const startTour = () => {
    if (user?.status === 'approved' && !localStorage.getItem('joyride_done')) {
      setRunTour(true);
    }
  };

  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupTitle, setErrorPopupTitle] = useState('Thông báo');

  const checkShouldShowWelcome = () => {
    const hiddenUntil = localStorage.getItem('welcome_modal_hidden_until');
    if (!hiddenUntil) return true;
    return Date.now() > parseInt(hiddenUntil, 10);
  };

  const handleHideWelcome2Hours = () => {
    localStorage.setItem('welcome_modal_hidden_until', String(Date.now() + 2 * 60 * 60 * 1000));
    setShowWelcomeModal(false);
  };
  const [downloadStatus, setDownloadStatus] = useState<{
    downloadCount: number;
    withinTwoDays: boolean;
    appPlan: string | null;
  }>({ downloadCount: 0, withinTwoDays: false, appPlan: null });
  
  // Fetch user info if logged in but missing status
  useEffect(() => {
    const fetchUserInfo = async () => {
      console.log('Checking user:', user);
      console.log('User status:', user?.status);
      
      if (user && !user.status) {
        try {
          console.log('User missing status, fetching from API...');
          const response = await authAPI.getMe();
          const userData = {
            ...response.data.user,
            _id: response.data.user.id || response.data.user._id
          };
          console.log('Fetched user data:', userData);
          localStorage.setItem('driver_user', JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user info:', error);
          // If token is invalid, clear user
          localStorage.removeItem('driver_user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else if (user && user.status) {
        console.log('User has status:', user.status);
        console.log('Should show dashboard:', user.status === 'approved');
      }
    };
    fetchUserInfo();
  }, [user]);

  // Show welcome modal on app load if user already logged in
  useEffect(() => {
    if (user && checkShouldShowWelcome()) {
      const timer = setTimeout(() => setShowWelcomeModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch download status from DB when user is approved
  useEffect(() => {
    const fetchDownloadStatus = async () => {
      if (user && user.status === 'approved') {
        try {
          const res = await driverAPI.getDownloadStatus();
          setDownloadStatus({
            downloadCount: res.data.downloadCount || 0,
            withinTwoDays: res.data.withinTwoDays || false,
            appPlan: res.data.appPlan || null,
          });
        } catch (error) {
          console.error('Error fetching download status:', error);
        }
      }
    };
    fetchDownloadStatus();
  }, [user?.status]);
  const [, setDrivers] = useState<DriverPost[]>(posts)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authForm, setAuthForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    carType: '',
    carYear: '',
    carImage: ''
  })
  // Removed car image preview state
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuShowIncome, setMenuShowIncome] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [requests, setRequests] = useState<Array<{ _id: string; name: string; phone: string; startPoint: string; endPoint: string; price: number; createdAt: string; note?: string; region?: Region }>>([])
  const [callSheet, setCallSheet] = useState<{ phone: string } | null>(null)
  const [pendingAction, setPendingAction] = useState<null | { type: 'wait' } | { type: 'call', phone: string }>(null)
  const [activeRequestRegion, setActiveRequestRegion] = useState<Region>('north')
  const [selectedProvince, setSelectedProvince] = useState<Record<Region, string>>({
    north: '',
    central: '',
    south: ''
  })
  const [showPayment, setShowPayment] = useState(false)
  const [pendingRegister, setPendingRegister] = useState<{ name: string; phone: string; password: string; carType: string; carYear: string } | null>(null)
  const [bankConfig, setBankConfig] = useState<{ bankCode?: string; bankName?: string; accountNo?: string; accountName?: string }>({});
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'rides' | 'income' | 'profile' | 'messages'>('home');
  const [showBalance, setShowBalance] = useState(true);
  const [ridesSearchQuery, setRidesSearchQuery] = useState('');
  const [ridesSubFilter, setRidesSubFilter] = useState<'all' | '4' | '7' | '16' | 'urgent'>('all');
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    startPoint: '',
    endPoint: '',
    price: '',
    note: '',
    region: 'north' as Region,
  })

  // Đồng bộ user.name và user.phone vào form khi user thay đổi (đăng nhập/tải lại)
  useEffect(() => {
    if (user?.phone) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone
      }))
    }
  }, [user])

  const formatPhone = (phone: string) => (user ? phone : maskPhoneStrict(phone))

  const toInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'TX'
  }

  // Load drivers from API
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const response = await driversAPI.getDrivers()
        const remoteDrivers = Array.isArray(response.data?.drivers) ? (response.data.drivers as DriverPost[]) : []
        const normalizedRemote = remoteDrivers.map((driver) => ({
          ...driver,
          region: (driver.region ?? 'north') as Region,
        }))

        const seenIds = new Set(normalizedRemote.map((driver) => driver._id))
        const supplemented = [...normalizedRemote]

        for (const region of ['north', 'central', 'south'] as Region[]) {
          const hasRegion = supplemented.some((driver) => driver.region === region)
          if (!hasRegion) {
            fallbackDriversByRegion[region].forEach((driver, index) => {
              const fallbackId = seenIds.has(driver._id) ? `fallback-${region}-${index}-${driver._id}` : driver._id
              supplemented.push({
                ...driver,
                _id: fallbackId,
                region: driver.region ?? region,
              })
            })
          }
        }

        setDrivers(supplemented.length ? supplemented : posts)
      } catch (error) {
        console.error('Error loading drivers:', error)
        setDrivers(posts)
      }
    }
    loadDrivers()
  }, [])

  // Load bank config from backend
  useEffect(() => {
    const loadBankConfig = async () => {
      try {
        const res = await bankConfigAPI.getBankConfig();
        if (res.data?.success && res.data.data) {
          setBankConfig(res.data.data);
        }
      } catch (e) { /* ignore */ }
    };
    loadBankConfig();
  }, [])

  // Load public waiting requests for homepage ticker/card list
  useEffect(() => {
    const loadRequests = async () => {
      try {
        // Fetch all waiting requests (no artificial limit so filtering by region doesn't hide items)
        const res = await requestsAPI.getAllRequests({ status: 'waiting' })
        const list = Array.isArray(res.data?.requests) ? res.data.requests : []
        // Sort newest first so các cuốc mới luôn nằm trên cùng
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRequests(list)
      } catch (e) {
        console.error('Error loading requests', e)
        setRequests([])
      }
    }
    loadRequests()
  }, [])

  // Auto-open registration modal on first visit when not logged in - DISABLED
  // useEffect(() => {
  //   const hasUser = !!localStorage.getItem('driver_user')
  //   if (!hasUser) {
  //     setAuthModal('register')
  //   }
  // }, [])

  // If URL hash points to requests, scroll to it on mount
  useEffect(() => {
    const shouldOpen = location.hash === '#requests' || new URLSearchParams(location.search).get('show') === 'requests'
    if (shouldOpen) {
      setTimeout(() => {
        document.getElementById('requests')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])


  const openModal = () => {
    if (user?.phone) {
      setForm((p) => ({
        ...p,
        name: user.name || p.name,
        phone: user.phone
      }))
    }
    setShowModal(true)
  }
  const closeModal = () => setShowModal(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // Không cho phép sửa số điện thoại nếu đã đăng nhập tài khoản
    if (name === 'phone' && user?.phone) {
      return
    }
    setForm((p) => {
      const updated = { ...p, [name]: value }

      // Tự động xác định region khi chọn startPoint hoặc endPoint
      if (name === 'startPoint' || name === 'endPoint') {
        const province = value
        const detectedRegion = getRegionFromProvince(province)
        if (detectedRegion) {
          updated.region = detectedRegion
        }
      }

      return updated
    })
  }
  // Car image upload removed per request

  // Drag handlers for modal
  const handleDragStart = (e: React.TouchEvent) => {
    if (window.innerWidth <= 768) {
      setDragStartY(e.touches[0].clientY)
      setIsDragging(true)
    }
  }

  const handleDragMove = (e: React.TouchEvent) => {
    if (isDragging && window.innerWidth <= 768) {
      setDragCurrentY(e.touches[0].clientY)
    }
  }

  const handleDragEnd = () => {
    if (isDragging && window.innerWidth <= 768) {
      const deltaY = dragCurrentY - dragStartY
      if (deltaY > 100) {
        // Close modal if dragged down significantly
        setAuthModal(null)
      }
      setIsDragging(false)
      setDragStartY(0)
      setDragCurrentY(0)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setPendingAction({ type: 'wait' })
      const reg = localStorage.getItem('driver_registered')
      setAuthModal(reg ? 'login' : 'register')
      return
    }

    const currentPhone = (user.phone || form.phone || '').trim()
    if (!currentPhone) {
      alert('Không tìm thấy số điện thoại đăng ký tài khoản của bạn')
      return
    }

    const parsedPrice = parseInt(form.price) || 0
    if (parsedPrice <= 0) {
      alert('Giá phải lớn hơn 0đ')
      return
    }

    setLoading(true)
    try {
      await requestsAPI.createRequest({
        name: form.name || user.name,
        phone: currentPhone,
        startPoint: form.startPoint,
        endPoint: form.endPoint,
        price: parsedPrice,
        note: form.note,
        region: form.region
      })

      // Tải lại danh sách yêu cầu mà KHÔNG thay đổi activeRequestRegion
      try {
        // Reload all waiting requests (no limit)
        const res = await requestsAPI.getAllRequests({ status: 'waiting' })
        const list = Array.isArray(res.data?.requests) ? res.data.requests : []
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setRequests(list)
      } catch (e) {
        console.error('Error reloading requests', e)
      }

      // Sau khi đăng ký xong, chọn đúng miền và tỉnh thành vừa đăng ký
      setActiveRequestRegion(form.region)
      // Tự động chọn tỉnh thành từ startPoint hoặc endPoint
      const selectedProvinceValue = form.startPoint || form.endPoint
      if (selectedProvinceValue) {
        setSelectedProvince({
          ...selectedProvince,
          [form.region]: selectedProvinceValue
        })
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2200)
      setShowModal(false)
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        startPoint: '',
        endPoint: '',
        price: '',
        note: '',
        region: 'north'
      })
    } catch (error: any) {
      console.error('Error creating request:', error)
      const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Shared drawer menu item styles ────────────────────────────
  const menuItemStyle: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderRadius: 14, border: 'none',
    background: '#f9fafb', cursor: 'pointer', fontSize: 15,
    fontWeight: 600, color: '#1f2937', marginBottom: 8,
    textAlign: 'left', transition: 'background 0.15s',
  }
  const menuIconStyle: React.CSSProperties = {
    fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0
  }
  const menuArrowStyle: React.CSSProperties = {
    marginLeft: 'auto', fontSize: 22, color: '#9ca3af', lineHeight: 1
  }

  return (
    <div className="app">

      {/* Joyride tour hướng dẫn tải APK */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        onEvent={handleJoyrideCallback}
        locale={{
          back: 'Quay lại',
          close: 'Đóng',
          last: 'Xong',
          next: 'Tiếp theo',
          skip: 'Bỏ qua',
        }}
        options={{ primaryColor: '#22c55e', showProgress: true, zIndex: 10000 }}
      />

      {/* Welcome modal hiện sau khi login */}
      <LoginWelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onHide2Hours={handleHideWelcome2Hours}
        onDownloadGuide={() => { localStorage.removeItem('joyride_done'); setTimeout(() => setRunTour(true), 300); }}
        onAfterClose={startTour}
      />

      {/* Show Driver Dashboard only when user clicks to open it */}
      {showDriverDashboard && user && user.status === 'approved' && (
        <DriverDashboard 
          user={user}
          onBack={() => setShowDriverDashboard(false)}
          onLogout={() => {
            localStorage.removeItem('driver_user');
            localStorage.removeItem('token');
            localStorage.removeItem('driver_registered');
            setUser(null);
            setShowDriverDashboard(false);
          }}
        />
      )}

      {/* Show main app (hide when dashboard is open) */}
      {!showDriverDashboard && (
        <>
      {/* ── Modern App Header matching Image 1 & 2 ── */}
      <header className={`modern-header ${activeNavTab === 'home' ? 'modern-header--home' : 'modern-header--light'}`}>
        <div className="modern-header__left">
          <button
            className="modern-hamburger-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="modern-header__brand">
            <div className="brand-title">
              DRIVER <span>APP</span>
            </div>
            <div className="brand-subtitle">
              KẾT NỐI TÀI XẾ - CUỐC XE MỖI NGÀY
            </div>
          </div>
        </div>
        <div className="modern-header__right">
          <button className="modern-bell-btn" onClick={handleBellClick} aria-label="Thông báo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && <span className="bell-badge-dot" />}
          </button>
        </div>
      </header>

      {/* Notification dropdown — small popover near bell */}
      {showNotifPanel && (
        <>
          <div onClick={() => setShowNotifPanel(false)} style={{ position: 'fixed', inset: 0, zIndex: 198 }} />
          <div style={{
            position: 'fixed', top: 52, right: 8, zIndex: 199,
            background: '#fff', borderRadius: 14,
            width: 'min(300px, calc(100vw - 16px)',
            maxHeight: 360, display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            border: '1px solid #f0f0f0',
          }}>
            <div style={{ padding: '10px 14px 8px', fontWeight: 700, fontSize: 13, color: '#111827', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔔 Yêu cầu đặt xe {unreadCount > 0 && <span style={{ background: '#00b14f', color: '#fff', borderRadius: 99, fontSize: 10, padding: '1px 6px', marginLeft: 4 }}>{unreadCount} mới</span>}</span>
              <button onClick={() => setShowNotifPanel(false)} style={{ border: 0, background: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {(!user || user.status !== 'approved') ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🔒</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Đăng nhập để xem</div>
                </div>
              ) : notifList.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📭</div>
                  <div style={{ fontSize: 13 }}>Chưa có yêu cầu nào</div>
                </div>
              ) : notifList.map((r: any) => (
                <div key={r._id} style={{
                  padding: '10px 14px', borderBottom: '1px solid #f9fafb',
                  background: r.isReadByDriver ? '#fff' : '#f0fdf4',
                  position: 'relative',
                }}>
                  {!r.isReadByDriver && <span style={{ position: 'absolute', top: 12, right: 12, width: 7, height: 7, borderRadius: 999, background: '#22c55e', display: 'block' }} />}
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', paddingRight: 16 }}>{r.startPoint} → {r.endPoint}</div>
                  <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>👤 {r.name} · {r.phone}</div>
                  <div style={{ fontSize: 13, color: '#00b14f', fontWeight: 700, marginTop: 2 }}>{Number(r.price).toLocaleString('vi-VN')}đ</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(r.createdAt).toLocaleString('vi-VN')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Income page (full-screen, opened from menu) ── */}
      {menuShowIncome && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: '#f5f5f5',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}>
          <DriverIncomePage onBack={() => { setMenuShowIncome(false); setMenuOpen(false); }} />
        </div>
      )}

      {/* ── Hamburger drawer ── */}
      {menuOpen && (
        <AnimatePresence>
          <>
            {/* Backdrop */}
            <motion.div
              key="menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)'
              }}
            />
            {/* Drawer panel */}
            <motion.div
              key="menu-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 280, zIndex: 2001,
                background: '#fff',
                boxShadow: '4px 0 32px rgba(0,0,0,0.18)',
                display: 'flex', flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              {/* Drawer header */}
              <div style={{
                background: 'linear-gradient(135deg,#1a2340 0%,#243252 100%)',
                padding: '28px 20px 22px',
                position: 'relative'
              }}>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Đóng menu"
                  style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 32, height: 32, borderRadius: '50%',
                    border: 'none', background: 'rgba(255,255,255,0.15)',
                    color: '#fff', fontSize: 20, lineHeight: 1,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >×</button>
                {user ? (
                  <>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#00b14f,#009140)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 800, color: '#fff',
                      marginBottom: 12, boxShadow: '0 4px 14px rgba(0,177,79,0.4)'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{user.name}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{user.phone}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>DRIVER APP</div>
                )}
              </div>

              {/* Menu items */}
              <div style={{ flex: 1, padding: '12px 12px' }}>
                {user?.status === 'approved' && (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); setShowDriverDashboard(true); }}
                      style={menuItemStyle}
                    >
                      <span style={menuIconStyle}>🏠</span>
                      <span>Dashboard tài xế</span>
                      <span style={menuArrowStyle}>›</span>
                    </button>

                    <button
                      onClick={() => { setMenuShowIncome(true); }}
                      style={{ ...menuItemStyle, background: 'linear-gradient(135deg,#e8f5e9,#f1f8e9)' }}
                    >
                      <span style={menuIconStyle}>💵</span>
                      <span style={{ fontWeight: 700, color: '#1a2340' }}>Thu nhập tài xế</span>
                      <span style={{ ...menuArrowStyle, color: '#00b14f' }}>›</span>
                    </button>
                  </>
                )}

                {!user && (
                  <>
                    <button onClick={() => { setMenuOpen(false); setAuthModal('login'); }} style={menuItemStyle}>
                      <span style={menuIconStyle}>🔑</span>
                      <span>Đăng nhập</span>
                      <span style={menuArrowStyle}>›</span>
                    </button>
                    <button onClick={() => { setMenuOpen(false); setAuthModal('register'); }} style={menuItemStyle}>
                      <span style={menuIconStyle}>📝</span>
                      <span>Đăng ký</span>
                      <span style={menuArrowStyle}>›</span>
                    </button>
                  </>
                )}
              </div>

              {/* Logout at bottom */}
              {user && (
                <div style={{ padding: '12px 12px 24px' }}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      localStorage.removeItem('token');
                      localStorage.removeItem('driver_user');
                      localStorage.removeItem('driver_registered');
                      setUser(null);
                      setShowDriverDashboard(false);
                    }}
                    style={{
                      ...menuItemStyle,
                      background: '#fef2f2',
                      color: '#ef4444',
                      border: '1.5px solid #fecaca'
                    }}
                  >
                    <span style={menuIconStyle}>🚪</span>
                    <span style={{ fontWeight: 700 }}>Đăng xuất</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        </AnimatePresence>
      )}
      {/* ── Main App Views (Home vs Rides vs Profile) ── */}
      {activeNavTab === 'home' && (
        <div className="home-view-container">
          {/* Hero Section with Skyline + Driver Banner and Profile Card */}
          <div className="modern-hero-section">
            <div className="modern-hero-bg">
              <img src="/images/driver-hero-banner.jpg" alt="Driver Hero Banner" />
              <div className="modern-hero-bg-overlay" />
            </div>

            <div
              className="hero-profile-card"
              onClick={() => {
                if (user) {
                  if (user.status === 'approved') {
                    setShowDriverDashboard(true);
                  } else {
                    setErrorPopupTitle('Thông báo');
                    setErrorMessage('Tài khoản đang chờ admin phê duyệt. Vui lòng thử lại sau.');
                    setShowErrorPopup(true);
                  }
                } else {
                  setAuthModal('login');
                }
              }}
            >
              <div className="profile-card-left">
                <div className="profile-avatar-circle">
                  {user ? toInitials(user.name || user.phone || 'ĐC') : 'ĐC'}
                </div>
                <div className="profile-info-wrap">
                  <span className="profile-greeting">Xin chào,</span>
                  <div className="profile-name">{user ? user.name : 'Đỗ ngọc chung'}</div>
                  <div className="profile-phone-row">
                    <span className="profile-phone-icon">📞</span>
                    <span className="profile-phone-text">
                      {user ? maskPhoneStrict(user.phone) : '052 xxxx 892'}
                    </span>
                    <span className="profile-verified-badge-icon">✔</span>
                  </div>
                </div>
              </div>
              <div className="profile-card-right">
                <div className="verified-pill-badge">
                  <span>🛡️</span>
                  <span>Tài xế đã xác thực</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row (3 Compact Cards: Thu nhập tháng, Cuốc xe đã nhận, Đánh giá) */}
          <div className="quick-stats-row">
            <div className="qs-card qs-card--income" onClick={() => setActiveNavTab('income')} style={{ cursor: 'pointer' }}>
              <div className="qs-header">
                <span className="qs-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#00b14f">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <circle cx="16.5" cy="13.5" r="1.5" fill="#ffffff" />
                  </svg>
                </span>
                <span className="qs-label">Thu nhập tháng</span>
              </div>
              <div className="qs-value-wrap">
                <span className="qs-value">
                  {showBalance ? '36.500.000đ' : '••••••••'}
                </span>
                <span
                  className="qs-extra"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBalance(!showBalance);
                  }}
                  title={showBalance ? 'Ẩn số tiền' : 'Hiện số tiền'}
                >
                  {showBalance ? '👁️' : '🙈'}
                </span>
              </div>
            </div>

            <div className="qs-card qs-card--rides" onClick={() => setActiveNavTab('rides')} style={{ cursor: 'pointer' }}>
              <div className="qs-header">
                <span className="qs-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#2563eb">
                    <path d="M5 11l1.4-4.2A2 2 0 0 1 8.3 5.4h7.4a2 2 0 0 1 1.9 1.4L19 11M4 11h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" />
                    <circle cx="7.5" cy="14" r="1.2" fill="#ffffff" />
                    <circle cx="16.5" cy="14" r="1.2" fill="#ffffff" />
                  </svg>
                </span>
                <span className="qs-label">Cuốc xe đã nhận</span>
              </div>
              <div className="qs-value-wrap">
                <span className="qs-value">128 cuốc</span>
                <span className="qs-extra" style={{ color: '#2563eb' }}>📊</span>
              </div>
            </div>

            <div className="qs-card qs-card--rating">
              <div className="qs-header">
                <span className="qs-icon">⭐</span>
                <span className="qs-label">Đánh giá</span>
              </div>
              <div className="qs-value-wrap">
                <span className="qs-value">4.9/5</span>
                <span className="qs-extra" style={{ color: '#d97706', fontWeight: 'bold' }}>→</span>
              </div>
            </div>
          </div>

          {/* 4-Action Grid: Tìm cuốc xe, Xe ghép, Bao xe, Đăng chuyến */}
          <div className="action-grid-row">
            <div
              className="action-card action-card--active-green"
              onClick={() => setActiveNavTab('rides')}
            >
              <div className="action-card__icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                </svg>
              </div>
              <div className="action-card__title">Tìm cuốc xe</div>
              <div className="action-card__sub">Có cuốc mới</div>
            </div>

            <div
              className="action-card action-card--blue"
              onClick={() => {
                setActiveNavTab('rides');
                setRidesSubFilter('4');
              }}
            >
              <div className="action-card__icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <div className="action-card__title">Xe ghép</div>
              <div className="action-card__sub">Chuyến tiện đường</div>
            </div>

            <div
              className="action-card action-card--cyan"
              onClick={() => {
                setActiveNavTab('rides');
                setRidesSubFilter('7');
              }}
            >
              <div className="action-card__icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6h-3V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9-2h4v2h-4V4zm9 15H5V8h14v11z"/>
                </svg>
              </div>
              <div className="action-card__title">Bao xe</div>
              <div className="action-card__sub">Đi tỉnh, đi xa</div>
            </div>

            <div
              className="action-card action-card--purple"
              onClick={openModal}
            >
              <div className="action-card__icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                </svg>
              </div>
              <div className="action-card__title">Đăng chuyến</div>
              <div className="action-card__sub">Tạo cuốc xe</div>
            </div>
          </div>

          {/* App Download Banner */}
          <div
            className="modern-download-banner"
            onClick={() => {
              if (!user) {
                setAuthModal('login');
                return;
              }
              if (user.status !== 'approved') {
                setErrorPopupTitle('Thông báo');
                setErrorMessage('Tài khoản của bạn đang chờ phê duyệt.');
                setShowErrorPopup(true);
                return;
              }
              if (downloadStatus.downloadCount > 0) {
                setShowDownloadPage(true);
              } else {
                setShowPricingModal(true);
              }
            }}
          >
            <div className="download-banner__left">
              <div className="download-phone-mockup">
                <div className="phone-screen-inner">
                  <span>ĐC</span>
                </div>
              </div>
              <div className="download-banner__text">
                <div className="download-banner__title">Tải ứng dụng di động</div>
                <div className="download-banner__sub">Nhận thông báo cuốc xe nhanh hơn</div>
              </div>
            </div>
            <button type="button" className="download-banner__btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Tải ngay</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>›</span>
            </button>
          </div>

          {/* Region Tabs (Miền Bắc, Miền Trung, Miền Nam) */}
          <div className="region-pills-row">
            {(['north', 'central', 'south'] as Region[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`region-pill ${activeRequestRegion === r ? 'active' : ''}`}
                onClick={() => setActiveRequestRegion(r)}
              >
                {regionLabels[r]}
              </button>
            ))}
          </div>

          {/* Featured Ride Section: Cuốc xe mới nhất with Google Maps route */}
          <FakeNotificationBanner
            user={user}
            region={activeRequestRegion}
            onRequireAuth={() => {
              setErrorPopupTitle('Bạn cần đăng ký trước khi nhận cuốc');
              setErrorMessage('Vui lòng đăng ký hoặc đăng nhập để có thể nhận cuốc xe.');
              setShowErrorPopup(true);
            }}
            onRegisterClick={() => {
              if (!user) {
                setAuthModal('register');
              } else {
                openModal();
              }
            }}
            onViewAllClick={() => setActiveNavTab('rides')}
          />
        </div>
      )}

      {/* ── Rides Screen matching Image 2 ── */}
      {activeNavTab === 'rides' && (
        <div className="rides-screen-container">
          {/* Region selector */}
          <div className="region-pills-row" style={{ margin: '4px 0 14px' }}>
            {(['north', 'central', 'south'] as Region[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`region-pill ${activeRequestRegion === r ? 'active' : ''}`}
                onClick={() => setActiveRequestRegion(r)}
              >
                {regionLabels[r]}
              </button>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="rides-search-box">
            <div className="rides-search-input-wrap">
              <span className="rides-search-icon">🔍</span>
              <input
                type="text"
                className="rides-search-input"
                placeholder="Tìm kiếm điểm đi, điểm đến, tên khách..."
                value={ridesSearchQuery}
                onChange={(e) => setRidesSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="rides-filter-btn"
              title="Bộ lọc nâng cao"
              onClick={() => {
                if (ridesSubFilter === 'all') setRidesSubFilter('4');
                else if (ridesSubFilter === '4') setRidesSubFilter('7');
                else if (ridesSubFilter === '7') setRidesSubFilter('16');
                else setRidesSubFilter('all');
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </button>
          </div>

          {/* Subfilter Chips */}
          <div className="subfilter-chips-row">
            <button
              type="button"
              className={`subfilter-chip ${ridesSubFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRidesSubFilter('all')}
            >
              <span>⊞ Tất cả</span>
            </button>
            <button
              type="button"
              className={`subfilter-chip ${ridesSubFilter === '4' ? 'active' : ''}`}
              onClick={() => setRidesSubFilter('4')}
            >
              <span>🚗 4 chỗ</span>
            </button>
            <button
              type="button"
              className={`subfilter-chip ${ridesSubFilter === '7' ? 'active' : ''}`}
              onClick={() => setRidesSubFilter('7')}
            >
              <span>🚐 7 chỗ</span>
            </button>
            <button
              type="button"
              className={`subfilter-chip ${ridesSubFilter === '16' ? 'active' : ''}`}
              onClick={() => setRidesSubFilter('16')}
            >
              <span>🚐 16 chỗ</span>
            </button>
            <button
              type="button"
              className={`subfilter-chip ${ridesSubFilter === 'urgent' ? 'active' : ''}`}
              onClick={() => setRidesSubFilter('urgent')}
            >
              <span>⚡ Cuốc gấp</span>
            </button>
          </div>

          {/* Modern Ride Cards List matching Image 2 */}
          <div className="modern-rides-list">
            {(() => {
              const sampleFallbackRides = [
                {
                  _id: 'sample-1',
                  name: 'Hà Văn Huy',
                  phone: '0913488386',
                  startPoint: 'Hà Nội',
                  endPoint: 'Hà Nam',
                  price: 1100000,
                  carType: '4',
                  tripType: 'round',
                  note: 'Đi 2 chiều, Hà Nội - Hà Nam, Toyota altis',
                  createdAt: new Date().toISOString(),
                  region: 'north' as Region
                },
                {
                  _id: 'sample-2',
                  name: 'Nguyễn Quốc dũng',
                  phone: '0985015240',
                  startPoint: 'Bắc Ninh',
                  endPoint: 'Sơn La',
                  price: 3000000,
                  carType: '7',
                  tripType: 'one-way',
                  note: 'xe innova cross 2026 8 chỗ',
                  createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                  region: 'north' as Region
                },
                {
                  _id: 'sample-3',
                  name: 'Nguyễn Xuân được',
                  phone: '0968566350',
                  startPoint: 'Hà Nội',
                  endPoint: 'Nam Định',
                  price: 800000,
                  carType: '4',
                  tripType: 'one-way',
                  note: 'Khách 1 người ít đồ, xe sạch sẽ',
                  createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                  region: 'north' as Region
                },
                {
                  _id: 'sample-4',
                  name: 'Đặng Tuấn Anh',
                  phone: '0977889900',
                  startPoint: 'Hà Nội (Cầu Giấy)',
                  endPoint: 'Quảng Ninh (Hạ Long)',
                  price: 1100000,
                  carType: '7',
                  tripType: 'one-way',
                  note: 'Đi đường cao tốc, cần tài xế chạy êm, không khói thuốc.',
                  createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                  region: 'north' as Region
                },
                {
                  _id: 'sample-5',
                  name: 'Trần Đình Khôi',
                  phone: '0905123456',
                  startPoint: 'Đà Nẵng (Sân bay)',
                  endPoint: 'Hội An (Quảng Nam)',
                  price: 320000,
                  carType: '4',
                  tripType: 'one-way',
                  note: 'Khách du lịch 2 người, đón tận nơi tại sảnh ga đến.',
                  createdAt: new Date().toISOString(),
                  region: 'central' as Region
                },
                {
                  _id: 'sample-6',
                  name: 'Phạm Minh Tuấn',
                  phone: '0938667788',
                  startPoint: 'TP. Hồ Chí Minh (Quận 1)',
                  endPoint: 'Vũng Tàu (Bãi Sau)',
                  price: 950000,
                  carType: '7',
                  tripType: 'round',
                  note: 'Đi nghỉ dưỡng gia đình cuối tuần, đón lúc 7h sáng.',
                  createdAt: new Date().toISOString(),
                  region: 'south' as Region
                }
              ];

              const pool = requests.length > 0 ? requests : sampleFallbackRides;

              const filtered = pool
                .filter((req) => {
                  const reqRegion = (req.region || 'north') as Region;
                  if (reqRegion !== activeRequestRegion) return false;

                  if (ridesSearchQuery.trim()) {
                    const q = ridesSearchQuery.toLowerCase().trim();
                    const matches =
                      (req.startPoint && req.startPoint.toLowerCase().includes(q)) ||
                      (req.endPoint && req.endPoint.toLowerCase().includes(q)) ||
                      (req.name && req.name.toLowerCase().includes(q)) ||
                      (req.note && req.note.toLowerCase().includes(q));
                    if (!matches) return false;
                  }

                  if (ridesSubFilter === '4') {
                    const cType = (req as any).carType;
                    return cType === '4' || (!cType && !req.note?.includes('7 chỗ') && !req.note?.includes('16 chỗ'));
                  }
                  if (ridesSubFilter === '7') {
                    const cType = (req as any).carType;
                    return cType === '7' || req.note?.includes('7 chỗ');
                  }
                  if (ridesSubFilter === '16') {
                    const cType = (req as any).carType;
                    return cType === '16' || req.note?.includes('16 chỗ');
                  }
                  if (ridesSubFilter === 'urgent') {
                    return req.note?.toLowerCase().includes('gấp') || req.note?.toLowerCase().includes('sớm');
                  }

                  return true;
                })
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

              const displayList = filtered.length > 0 ? filtered : sampleFallbackRides.filter(s => s.region === activeRequestRegion);

              return displayList.map((req) => (
                <div key={req._id} className="modern-ride-card">
                  {/* Top Row: MỚI badge, Customer Name, Time badge, Menu */}
                  <div className="mrc-top-row">
                    <div className="mrc-caller-wrap">
                      <span className="mrc-badge-new">⚡ MỚI</span>
                      <span className="mrc-caller-name">{req.name || 'Khách hàng'}</span>
                    </div>
                    <div className="mrc-time-wrap">
                      <span className="mrc-time-badge">🕐 Vừa xong</span>
                      <span className="mrc-menu-btn">⋮</span>
                    </div>
                  </div>

                  {/* Phone row with copy button */}
                  <div className="mrc-phone-row">
                    <span className="mrc-phone-icon">📞</span>
                    <span className="mrc-phone-num">{req.phone}</span>
                    <button
                      type="button"
                      className="mrc-copy-btn"
                      title="Sao chép số điện thoại"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(req.phone);
                        setCopiedPhoneId(req._id);
                        setTimeout(() => setCopiedPhoneId(null), 2000);
                      }}
                    >
                      {copiedPhoneId === req._id ? '✓' : '📄'}
                    </button>
                  </div>

                  {/* Middle Grid: Left Route Points, Right Mint Price Card */}
                  <div className="mrc-middle-grid">
                    <div className="mrc-route-track">
                      <div className="mrc-point-row">
                        <span className="mrc-point-dot mrc-point-dot--green" />
                        <div className="mrc-point-text-wrap">
                          <span className="mrc-point-title">{req.startPoint}</span>
                          <span className="mrc-point-sub">Điểm đi</span>
                        </div>
                      </div>
                      <div className="mrc-route-divider" />
                      <div className="mrc-point-row">
                        <span className="mrc-point-dot mrc-point-dot--red" />
                        <div className="mrc-point-text-wrap">
                          <span className="mrc-point-title">{req.endPoint}</span>
                          <span className="mrc-point-sub">Điểm đến</span>
                        </div>
                      </div>
                    </div>

                    <div className="mrc-price-card">
                      <div className="mrc-price-label">👛 Giá chuyến</div>
                      <div className="mrc-price-amount">
                        {Number(req.price).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>

                  {/* Note Box */}
                  <div className="mrc-note-box">
                    <span className="mrc-note-icon">📄</span>
                    <span className="mrc-note-text">
                      <strong>Ghi chú: </strong>
                      {req.note || 'Khách đặt xe đi trong ngày, cần xe sạch sẽ, tài xế đúng giờ.'}
                    </span>
                  </div>

                  {/* Action Button: GỌI TÀI XẾ NGAY */}
                  <button
                    type="button"
                    className="mrc-call-btn"
                    onClick={() => {
                      if (!user) {
                        setErrorPopupTitle('Bạn cần đăng ký trước khi nhận cuốc');
                        setErrorMessage('Vui lòng đăng ký hoặc đăng nhập để có thể nhận cuốc xe.');
                        setShowErrorPopup(true);
                        return;
                      }
                      setCallSheet({ phone: req.phone });
                    }}
                  >
                    <span>📞 GỌI TÀI XẾ NGAY</span>
                    <span style={{ fontSize: '16px', fontWeight: 900 }}>›</span>
                  </button>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* ── Income View (Thu nhập tài xế) ── */}
      {activeNavTab === 'income' && (
        <div className="income-view-container" style={{ paddingBottom: '90px' }}>
          {user ? (
            <DriverIncomePage onBack={() => setActiveNavTab('home')} />
          ) : (
            <div className="rides-view-container" style={{ padding: '28px 16px 100px' }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: '36px 20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>💵</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Báo cáo thu nhập tài xế</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
                  Đăng nhập tài khoản tài xế để theo dõi doanh thu hàng ngày, chi tiết cuốc xe hoàn thành và tiền mặt/chuyển khoản.
                </p>
                <button
                  type="button"
                  className="modern-call-driver-btn"
                  onClick={() => setAuthModal('login')}
                  style={{ maxWidth: 280, margin: '0 auto' }}
                >
                  🔑 Đăng nhập tài xế
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Messages View (Fallback) ── */}
      {activeNavTab === 'messages' && (
        <div className="rides-view-container" style={{ padding: '16px 12px 100px' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              💬 Hộp thư tin nhắn ({unreadCount > 0 ? `${unreadCount} tin mới` : '0'})
            </h3>
            {notifList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
                <div>Chưa có tin nhắn hoặc yêu cầu trực tiếp nào</div>
              </div>
            ) : (
              notifList.map((r: any) => (
                <div key={r._id} style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                    {r.startPoint} ➔ {r.endPoint}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Khách: {r.name} · {r.phone}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Profile View ── */}
      {activeNavTab === 'profile' && (
        <div className="rides-view-container" style={{ padding: '16px 12px 100px' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div className="profile-card-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
                {toInitials(user?.name || user?.phone || 'TX')}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>{user?.name || 'Tài xế'}</h3>
                <div style={{ fontSize: 13, color: '#64748b' }}>{user?.phone ? maskPhoneStrict(user.phone) : 'Chưa đăng nhập'}</div>
                <div style={{ marginTop: 4 }}>
                  <span className="verified-driver-badge">
                    <span>🛡️ {user?.status === 'approved' ? 'Tài xế đã duyệt' : (user ? 'Chờ duyệt' : 'Chưa đăng nhập')}</span>
                  </span>
                </div>
              </div>
            </div>

            {user?.status === 'approved' && (
              <>
                <button
                  type="button"
                  className="modern-call-driver-btn"
                  style={{ marginBottom: 10, background: '#0f172a' }}
                  onClick={() => setShowDriverDashboard(true)}
                >
                  📊 Xem Dashboard quản lý chi tiết
                </button>
                <button
                  type="button"
                  className="modern-call-driver-btn"
                  style={{ marginBottom: 10, background: '#00b14f' }}
                  onClick={() => setActiveNavTab('income')}
                >
                  💵 Báo cáo thu nhập tài xế
                </button>
                <button
                  type="button"
                  className="modern-call-driver-btn"
                  style={{ marginBottom: 10, background: '#2563eb' }}
                  onClick={() => {
                    if (downloadStatus.downloadCount > 0) {
                      setShowDownloadPage(true);
                    } else {
                      setShowPricingModal(true);
                    }
                  }}
                >
                  📱 Tải ứng dụng APK di động
                </button>
              </>
            )}

            {user && (
              <button
                type="button"
                className="modern-call-driver-btn"
                style={{ background: '#ef4444' }}
                onClick={() => {
                  localStorage.removeItem('driver_user');
                  localStorage.removeItem('token');
                  localStorage.removeItem('driver_registered');
                  setUser(null);
                  setShowDriverDashboard(false);
                  setActiveNavTab('home');
                }}
              >
                🚪 Đăng xuất tài khoản
              </button>
            )}

            {!user && (
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="modern-call-driver-btn"
                  onClick={() => setAuthModal('login')}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className="modern-call-driver-btn"
                  style={{ background: '#3b82f6' }}
                  onClick={() => setAuthModal('register')}
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fixed 5-Item Bottom Navigation Bar (Home, Cuốc xe, Đăng chuyến, Thu nhập, Cá nhân) ── */}
      <nav className="bottom-nav-bar">
        <button
          type="button"
          className={`bottom-nav-item ${activeNavTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveNavTab('home')}
        >
          <div className="nav-icon-box">
            <span className="nav-icon">
              <svg width="23" height="23" viewBox="0 0 24 24" fill={activeNavTab === 'home' ? '#00b14f' : 'currentColor'}>
                <path d="M10.55 2.8c.85-.68 2.05-.68 2.9 0l7.2 5.76c.85.68 1.35 1.72 1.35 2.81V19c0 1.66-1.34 3-3 3h-2.5c-.83 0-1.5-.67-1.5-1.5v-4.5c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v4.5c0 .83-.67 1.5-1.5 1.5H5c-1.66 0-3-1.34-3-3v-7.63c0-1.09.5-2.13 1.35-2.81l7.2-5.76z" />
              </svg>
            </span>
          </div>
          <span className="nav-label">Trang chủ</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeNavTab === 'rides' ? 'active' : ''}`}
          onClick={() => setActiveNavTab('rides')}
        >
          <div className="nav-icon-box">
            <span className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 11l1.4-4.2A2 2 0 0 1 8.3 5.4h7.4a2 2 0 0 1 1.9 1.4L19 11M4 11h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5z" />
                <circle cx="7.5" cy="14" r="1.2" fill="currentColor" />
                <circle cx="16.5" cy="14" r="1.2" fill="currentColor" />
                <path d="M6 17v2m12-2v2" />
              </svg>
            </span>
          </div>
          <span className="nav-label">Cuốc xe</span>
        </button>

        <div className="bottom-nav-center" onClick={openModal} title="Đăng chuyến xe mới">
          <div className="nav-center-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span className="nav-label">Đăng chuyến</span>
        </div>

        <button
          type="button"
          className={`bottom-nav-item ${activeNavTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveNavTab('income')}
        >
          <div className="nav-icon-box">
            <span className="nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2.5" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
            </span>
          </div>
          <span className="nav-label">Thu nhập</span>
        </button>

        <button
          type="button"
          className={`bottom-nav-item ${activeNavTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveNavTab('profile')}
        >
          <div className="nav-icon-box">
            <span className="nav-icon">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          </div>
          <span className="nav-label">Cá nhân</span>
        </button>
      </nav>

      <AnimatePresence>
        {showModal && (
          <div className="modal" role="dialog" aria-modal="true">
            <motion.div className="modal__backdrop" onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div className="modal__panel"
              initial={{ opacity: 0, y: 40, scale: .98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: .98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
              <div className="modal__header">
                <div className="modal__title">Đăng ký chở cuốc xe</div>
                <button className="modal__close" onClick={closeModal} aria-label="Đóng">×</button>
              </div>
              <form className="form" onSubmit={onSubmit}>
                <label className="field">
                  <span>Họ và tên</span>
                  <input name="name" value={form.name} onChange={onChange} placeholder="VD: Nguyễn Văn A" required />
                </label>
                <label className="field">
                  <span>Số điện thoại (SĐT tài khoản đăng ký)</span>
                  <input
                    name="phone"
                    value={user?.phone || form.phone}
                    readOnly
                    style={{
                      backgroundColor: '#f3f4f6',
                      cursor: 'not-allowed',
                      color: '#1f2937',
                      fontWeight: '600'
                    }}
                    title="Số điện thoại cố định theo tài khoản đã đăng ký"
                    required
                  />
                  <small style={{ color: '#059669', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>✓</span> Số điện thoại chính thức đã đăng ký
                  </small>
                </label>
                <label className="field">
                  <span>Miền đăng ký</span>
                  <motion.select name="region" value={form.region} onChange={(e) => onChange(e as any)} required
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(0,177,79,.18)' }}
                  >
                    <option value="north">Miền Bắc</option>
                    <option value="central">Miền Trung</option>
                    <option value="south">Miền Nam</option>
                  </motion.select>
                </label>
                <div className="field" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '12px' }}>
                  <label className="field">
                    <span>Điểm xuất phát</span>
                    <motion.select name="startPoint" value={form.startPoint} onChange={(e) => onChange(e as any)} required
                      whileFocus={{ boxShadow: '0 0 0 3px rgba(0,177,79,.18)' }}
                    >
                      <option value="" disabled>Chọn tỉnh/thành</option>
                      {provincesVN63.map((p) => (
                        <option key={'s-' + p} value={p}>{p}</option>
                      ))}
                    </motion.select>
                  </label>
                  <label className="field">
                    <span>Điểm đến</span>
                    <motion.select name="endPoint" value={form.endPoint} onChange={(e) => onChange(e as any)} required
                      whileFocus={{ boxShadow: '0 0 0 3px rgba(0,177,79,.18)' }}
                    >
                      <option value="" disabled>Chọn tỉnh/thành</option>
                      {provincesVN63.map((p) => (
                        <option key={'e-' + p} value={p}>{p}</option>
                      ))}
                    </motion.select>
                  </label>
                </div>
                <label className="field">
                  <span>Giá dự kiến (VND)</span>
                  <input
                    name="price"
                    value={form.price}
                    onChange={onChange}
                    placeholder="VD: 800000"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1000}
                    required
                  />
                </label>
                <label className="field">
                  <span>Ghi chú</span>
                  <textarea name="note" value={form.note} onChange={onChange} placeholder="Giờ giấc, loại xe..." rows={3} />
                </label>
                <motion.button type="submit" className="submit"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ filter: 'brightness(1.05)' }}
                  disabled={loading}
                >
                  {loading ? 'ĐANG GỬI...' : 'GỬI ĐĂNG KÝ'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div className="toast"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <span className="toast__icon">✔</span>
            <span>Đăng ký thành công</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showError && (
          <motion.div className="toast error"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <span className="toast__icon">✖</span>
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {callSheet && (
          <div className="sheet" role="dialog" aria-modal="true">
            <motion.div className="sheet__backdrop" onClick={() => setCallSheet(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="sheet__panel" initial={{ y: 240 }} animate={{ y: 0 }} exit={{ y: 240 }} transition={{ type: 'spring', stiffness: 400, damping: 34 }}>
              <div className="sheet__row">
                <span className="sheet__label">Gọi</span>
                <strong className="sheet__phone">{formatPhone(callSheet.phone)}</strong>
              </div>
              <a className="sheet__call" href={`tel:${callSheet.phone}`}>GỌI NGAY</a>
              <button className="sheet__cancel" onClick={() => setCallSheet(null)}>Hủy</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!!authModal && (
          <div className="modal" role="dialog" aria-modal="true">
            <motion.div className="modal__backdrop" onClick={() => setAuthModal(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              className={`modal__panel ${isDragging ? 'dragging' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                transform: isDragging ? `translateY(${Math.max(0, dragCurrentY - dragStartY)}px)` : undefined
              }}
            >
              <div
                className="modal__header"
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <div className="modal__title">{authModal === 'login' ? 'Đăng nhập' : 'Đăng ký thành viên nhóm'}</div>
                <button className="modal__close" onClick={() => setAuthModal(null)} aria-label="Đóng">×</button>
              </div>
              <form className="form" onSubmit={async (e) => {
                e.preventDefault();
                if (loading) return;

                console.log('Form submission started', { authModal, authForm });

                // Validate form data
                if (authModal === 'register') {
                  if (!authForm.name.trim()) {
                    alert('Vui lòng nhập họ và tên!');
                    return;
                  }
                  if (!authForm.phone.trim()) {
                    alert('Vui lòng nhập số điện thoại!');
                    return;
                  }
                  if (!authForm.carType.trim()) {
                    alert('Vui lòng nhập loại xe!');
                    return;
                  }
                  if (!authForm.carYear.trim()) {
                    alert('Vui lòng nhập đời xe!');
                    return;
                  }
                  if (authForm.password.length < 4) {
                    alert('Mật khẩu phải có ít nhất 4 ký tự!');
                    return;
                  }
                  if (authForm.password !== authForm.confirmPassword) {
                    alert('Mật khẩu xác nhận không khớp!');
                    return;
                  }

                  // Show payment modal before actual registration
                  setPendingRegister({
                    name: authForm.name,
                    phone: authForm.phone,
                    password: authForm.password,
                    carType: authForm.carType,
                    carYear: authForm.carYear,
                  })
                  setShowPayment(true)
                  return;
                } else {
                  if (!authForm.phone.trim()) {
                    alert('Vui lòng nhập số điện thoại!');
                    return;
                  }
                  if (!authForm.password.trim()) {
                    alert('Vui lòng nhập mật khẩu!');
                    return;
                  }
                }

                setLoading(true)
                try {
                  if (authModal === 'login') {
                    console.log('Attempting login...');
                    const response = await authAPI.login({
                      phone: authForm.phone,
                      password: authForm.password
                    })

                    console.log('Login successful:', response.data);
                    
                    // Map id to _id for consistency
                    const userData = {
                      ...response.data.user,
                      _id: response.data.user.id || response.data.user._id
                    };
                    
                    localStorage.setItem('token', response.data.token)
                    localStorage.setItem('driver_user', JSON.stringify(userData))
                    localStorage.setItem('driver_registered', '1')
                    setUser(userData)
                    setAuthModal(null)
                    setShowSuccess(true)
                    setTimeout(() => setShowSuccess(false), 1600)
                    if (checkShouldShowWelcome()) {
                      setTimeout(() => setShowWelcomeModal(true), 800);
                    }

                    if (pendingAction) {
                      if (pendingAction.type === 'wait') openModal()
                      if (pendingAction.type === 'call') setCallSheet({ phone: pendingAction.phone })
                      setPendingAction(null)
                    }
                  }
                } catch (error: any) {
                  console.error('Auth error details:', {
                    error,
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                  });

                  let errorMsg = 'Có lỗi xảy ra';

                  // Handle specific error cases
                  if (error.response?.status === 403) {
                    if (error.response?.data?.message?.includes('phê duyệt')) {
                      errorMsg = 'Tài khoản đang chờ admin phê duyệt. Vui lòng thử lại sau.';
                    } else {
                      errorMsg = 'Tài khoản chưa được phê duyệt. Vui lòng liên hệ admin.';
                    }
                  } else if (error.response?.data?.message) {
                    errorMsg = error.response.data.message;
                  } else if (error.message) {
                    errorMsg = error.message;
                  } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                    errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
                  }

                  setErrorMessage(errorMsg)
                  setShowError(true)
                  setTimeout(() => setShowError(false), 5000)
                } finally {
                  setLoading(false)
                  setAuthForm({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '', carImage: '' })
                }
              }}>
                {authModal === 'register' && (
                  <label className="field">
                    <span>Họ và tên</span>
                    <input name="name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} placeholder="VD: Nguyễn Văn A" required />
                  </label>
                )}
                <label className="field">
                  <span>Số điện thoại</span>
                  <input name="phone" value={authForm.phone} onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} inputMode="tel" pattern="[0-9]{9,11}" placeholder="VD: 09xxxxxxx" required />
                </label>
                {authModal === 'register' && (
                  <>
                    <label className="field">
                      <span>Loại xe</span>
                      <input name="carType" value={authForm.carType} onChange={(e) => setAuthForm({ ...authForm, carType: e.target.value })} placeholder="VD: Toyota Camry, Honda Civic..." required />
                    </label>
                    <label className="field">
                      <span>Đời xe</span>
                      <input name="carYear" value={authForm.carYear} onChange={(e) => setAuthForm({ ...authForm, carYear: e.target.value })} placeholder="VD: 2020, 2021..." required />
                    </label>

                  </>
                )}
                <label className="field">
                  <span>Mật khẩu</span>
                  <div style={{position:'relative',display:'flex',alignItems:'center'}}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="Ít nhất 4 ký tự"
                      autoComplete={authModal === 'register' ? 'new-password' : 'current-password'}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      style={{flex:1,paddingRight:'40px'}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{position:'absolute',right:'10px',background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:'18px',padding:0}}
                      tabIndex={-1}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>
                {authModal === 'register' && (
                  <label className="field">
                    <span>Xác nhận lại mật khẩu</span>
                    <input type="password" name="confirmPassword" value={authForm.confirmPassword} onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })} placeholder="Nhập lại mật khẩu" required />
                  </label>
                )}
                <motion.button
                  type="submit"
                  className="submit"
                  whileTap={{ scale: .98 }}
                  disabled={loading}
                  style={{
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPayment && (
          <div className="modal" role="dialog" aria-modal="true">
            <motion.div className="modal__backdrop" onClick={() => setShowPayment(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="modal__panel" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="modal__header">
                <div className="modal__title">Phí vào nhóm 200.000đ</div>
                <button className="modal__close" onClick={() => setShowPayment(false)} aria-label="Đóng">×</button>
              </div>
              <div style={{ padding: '8px 16px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 60px)', WebkitOverflowScrolling: 'touch' }}>
                <p style={{ marginTop: 0 }}>Vui lòng chuyển khoản 200.000đ theo QR bên dưới để hoàn tất đăng ký.</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={bankConfig.bankCode && bankConfig.accountNo
                      ? `https://img.vietqr.io/image/${bankConfig.bankCode}-${bankConfig.accountNo}-compact2.png?amount=200000&addInfo=Phi%20tham%20gia%20nhom&accountName=${encodeURIComponent(bankConfig.accountName || 'TEST')}`
                      : `https://img.vietqr.io/image/VIB-092480168-compact2.png?amount=200000&addInfo=Phi%20tham%20gia%20nhom&accountName=HOANG%20MANH%20DUY`}
                    alt="VietQR"
                    style={{ width: '100%', maxWidth: 360, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,.08)' }}
                  />
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#444' }}>Nội dung chuyển khoản: <strong>Phi tham gia nhom</strong></div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 16 }}>
                  <button
                    className="submit"
                    onClick={async () => {
                      if (!pendingRegister) { setShowPayment(false); return }
                      setLoading(true)
                      try {
                        await authAPI.register(pendingRegister)
                        localStorage.setItem('driver_registered', '1')
                        setShowSuccess(true)
                        setErrorMessage('Đăng ký thành công! Tài khoản của bạn đang chờ admin phê duyệt. Bạn sẽ nhận được thông báo khi được duyệt.')
                        setShowError(true)
                        setTimeout(() => { setShowSuccess(false); setShowError(false) }, 5000)
                        setAuthModal(null)
                        setShowPayment(false)
                        setPendingRegister(null)
                      } catch (error: any) {
                        let errorMsg = 'Có lỗi xảy ra'
                        if (error.response?.data?.message) errorMsg = error.response.data.message
                        else if (error.message) errorMsg = error.message
                        setErrorMessage(errorMsg)
                        setShowError(true)
                        setTimeout(() => setShowError(false), 5000)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    style={{ flex: 1 }}
                  >
                    Tôi đã chuyển 200k - Tiếp tục
                  </button>
                  <button className="sheet__cancel" onClick={() => setShowPayment(false)} style={{ flex: 1 }}>Để sau</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}

      {user && (
        <>
          <AppPricingModal 
            isOpen={showPricingModal} 
            onClose={() => setShowPricingModal(false)}
            onConfirm={(plan) => {
              setSelectedPlan(plan.id);
              setShowPricingModal(false);
              setShowDownloadPage(true);
            }}
          />

          {showDownloadPage && (
            <DownloadAppPage 
              user={user}
              plan={downloadStatus.downloadCount > 0 ? (downloadStatus.appPlan || selectedPlan) : selectedPlan}
              onDownloaded={(plan) => {
                setDownloadStatus(prev => ({
                  ...prev,
                  downloadCount: prev.downloadCount + 1,
                  withinTwoDays: true,
                  appPlan: plan,
                }));
              }}
              onBack={() => setShowDownloadPage(false)} 
            />
          )}
        </>
      )}

      {/* Error Popup */}
      <AnimatePresence>
        {showErrorPopup && (
          <div className="error-popup-overlay" onClick={() => setShowErrorPopup(false)}>
            <motion.div
              className="error-popup"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="error-popup-icon">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  ⚠️
                </motion.div>
              </div>
              <h3 className="error-popup-title">{errorPopupTitle}</h3>
              <p className="error-popup-message">{errorMessage}</p>
              <button
                className="error-popup-btn"
                onClick={() => setShowErrorPopup(false)}
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

// Main App with Router
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App












