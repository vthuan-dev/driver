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

// Avatar images from folder; we will deterministically map driver+region to an image
const avatarModules = import.meta.glob('../driver/*.{jpg,jpeg,png}', { eager: true }) as Record<string, any>
const avatarImages: string[] = Object.values(avatarModules).map((m: any) => m.default || m)

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
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
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
    'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận',
    'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ],
  south: [
    'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa-Vũng Tàu',
    'Tây Ninh', 'Bình Phước', 'Long An', 'Tiền Giang', 'Bến Tre',
    'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang',
    'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau', 'Bình Thuận'
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
  const [drivers, setDrivers] = useState<DriverPost[]>(posts)
  const [activeRegion, setActiveRegion] = useState<Region>('north')
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
  const [form, setForm] = useState({
    name: '',
    phone: '',
    startPoint: '',
    endPoint: '',
    price: '',
    note: '',
    region: 'north' as Region,
  })

  const formatPhone = (phone: string) => (user ? phone : maskPhoneStrict(phone))

  const normalizedDrivers = drivers.map((driver) => ({
    ...driver,
    region: (driver.region ?? 'north') as Region,
  }))

  const regionDrivers = normalizedDrivers.filter((driver) => driver.region === activeRegion)
  const displayedDrivers = regionDrivers.length > 0 ? regionDrivers : fallbackDriversByRegion[activeRegion]

  // Filter requests by region and province, then sort newest first
  const regionRequests = requests
    .filter((request) => {
      const requestRegion = (request.region || 'north') as Region
      if (requestRegion !== activeRequestRegion) return false

      const selected = selectedProvince[activeRequestRegion]
      // Show all if not selected OR empty string (from dropdown default)
      if (!selected || selected.trim() === '') return true

      // Filter theo tỉnh thành: kiểm tra startPoint hoặc endPoint
      return request.startPoint === selected || request.endPoint === selected
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const toInitials = (name: string) => {
    const parts = (name || '').trim().split(/\s+/)
    const first = parts[0]?.[0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'TX'
  }

  const pickAvatarIndex = (name: string, phone: string, region: Region) => {
    if (avatarImages.length === 0) return -1
    // Split global pool into 3 region-specific sub-pools to reduce cross-region duplicates
    const regionOffset = region === 'north' ? 0 : region === 'central' ? 1 : 2
    const regionPool = avatarImages.filter((_, i) => i % 3 === regionOffset)
    const pool = regionPool.length > 0 ? regionPool : avatarImages

    // Hash by name+phone for stable selection inside the pool
    const base = `${name}-${phone}`
    let hash = 0
    for (let i = 0; i < base.length; i++) {
      hash = (hash * 31 + base.charCodeAt(i)) >>> 0
    }

    const idxInPool = Math.abs(hash) % pool.length

    // Map index-in-pool back to global index for rendering
    if (pool === avatarImages) return idxInPool
    // find nth matching index where i % 3 === regionOffset
    let count = -1
    for (let i = 0; i < avatarImages.length; i++) {
      if (i % 3 === regionOffset) {
        count++
        if (count === idxInPool) return i
      }
    }
    return idxInPool % avatarImages.length
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


  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
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
    if (!user) return

    const parsedPrice = parseInt(form.price) || 0
    if (parsedPrice <= 0) {
      alert('Giá phải lớn hơn 0đ')
      return
    }

    setLoading(true)
    try {
      await requestsAPI.createRequest({
        name: form.name,
        phone: form.phone,
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
      setForm({ name: '', phone: '', startPoint: '', endPoint: '', price: '', note: '', region: 'north' })
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Có lỗi xảy ra khi tạo yêu cầu')
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
      <div className="app-header">
        <button className="app-header__menu" aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="app-header__logo">DRIVER <span>APP</span></div>
        <button className="app-header__bell" aria-label="Thông báo" onClick={handleBellClick} style={{ position: 'relative' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              background: '#ef4444', color: '#fff',
              fontSize: 10, fontWeight: 800,
              minWidth: 16, height: 16, borderRadius: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', pointerEvents: 'none',
              border: '1.5px solid #fff'
            }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>

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
      {/* Hero Banner */}
      {!user && (
        <div className="hero-banner">
          <div className="hero-banner__content">
            <h3 className="hero-banner__title">Tham gia nhóm tài xế</h3>
            <p className="hero-banner__subtitle">Đăng ký để có thể liên hệ và đón cuốc</p>
            <div className="hero-banner__buttons">
              <button className="hero-banner__btn hero-banner__btn--primary" onClick={() => setAuthModal('register')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Đăng ký thành viên
              </button>
              <button className="hero-banner__btn hero-banner__btn--secondary" onClick={() => setAuthModal('login')}>
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nút đăng xuất + thông tin khách khi đã đăng nhập */}
      {user && (
        <div className="main-actions">
          <div 
            className="user-summary-card user-summary-card--clickable"
            onClick={() => {
              if (user.status === 'approved') {
                setShowDriverDashboard(true);
              } else {
                setErrorPopupTitle('Thông báo');
                setErrorMessage('Tài khoản đang chờ admin phê duyệt. Vui lòng thử lại sau.');
                setShowErrorPopup(true);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-summary-card__avatar">
              {toInitials(user.name || user.phone)}
            </div>
            <div className="user-summary-card__info">
              <span className="user-summary-card__greeting">Xin chào,</span>
              <strong className="user-summary-card__name">{user.name || 'Tài xế'}</strong>
              <span className="user-summary-card__phone">{maskPhoneStrict(user.phone)}</span>
              {user.status === 'approved' && (
                <span className="user-summary-card__hint"> Nhấn để xem dashboard</span>
              )}
            </div>
          </div>

          {/* Nút tải ứng dụng ở trang chủ */}
          {user.status === 'approved' && (
            <button
              id="joyride-download-btn"
              className="main-action-btn"
              style={{
                borderColor: '#e2e8f0',
                justifyContent: 'space-between',
                marginBottom: '8px',
                color: '#1e293b'
              }}
              onClick={() => {
                const { downloadCount } = downloadStatus;

                // Đã tải trước đó → vào trang download trực tiếp
                if (downloadCount > 0) {
                  setShowDownloadPage(true);
                  return;
                }

                // Chưa tải lần nào → phải chọn gói
                setShowPricingModal(true);
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="main-action-btn__icon">📱</span>
                <span className="main-action-btn__text" style={{ color: '#1e293b' }}>Tải ứng dụng di động</span>
              </span>
              <span style={{ background: '#22c55e', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>APK</span>
            </button>
          )}

          <button
            className="main-action-btn main-action-btn--logout"
            onClick={() => {
              localStorage.removeItem('driver_user');
              localStorage.removeItem('token');
              localStorage.removeItem('driver_registered');
              setUser(null);
              setShowDriverDashboard(false);
            }}
          >
            <span className="main-action-btn__icon">🚪</span>
            <span className="main-action-btn__text">Đăng xuất</span>
          </button>
        </div>
      )}

      {!showDriverDashboard && (
        <div style={{ margin: '15px 10px 0 10px' }}>
          <div className="region-tabs" style={{ margin: 0 }}>
            {(['north', 'central', 'south'] as Region[]).map((region) => (
              <button
                key={region}
                className={`region-tab ${activeRequestRegion === region ? 'active' : ''}`}
                onClick={() => setActiveRequestRegion(region)}
              >
                {regionLabels[region]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hiển thị thông báo cuốc xe ảo cho tất cả người dùng ở trang chủ */}
      {!showDriverDashboard && (
        <FakeNotificationBanner
          user={user}
          region={activeRequestRegion}
          onRequireAuth={() => {
            setErrorPopupTitle('Bạn cần đăng ký trước khi nhận cuốc');
            setErrorMessage('Vui lòng đăng ký hoặc đăng nhập để có thể nhận cuốc xe.');
            setShowErrorPopup(true);
          }}
        />
      )}

      <div className="info-bar">
        <div className="info-bar__item info-bar__item--phone">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00b14f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
          </svg>
          <span>Liên hệ <strong>039 xxxx 932</strong></span>
        </div>
        <div className="info-bar__divider" />
        {/* Scrolling ticker */}
        <div className="info-bar__ticker-wrap">
          <div className="info-bar__ticker">
            {[
              '🚗 Cần xe đi sáng mai 7h từ Hà Nội → Quảng Ninh',
              '👶 TP.HCM → Vũng Tàu, có trẻ em đi cùng',
              '📞 039 xxxx 214 · Hà Nội → Lào Cai, đi gấp hôm nay',
              '🌙 Cần xe đêm nay 21h từ Đà Nẵng → Huế',
              '📞 097 xxxx 881 · Cần Thơ → Cà Mau, 4 người lớn',
              '⚡ Đặt gấp! Hải Phòng → Hà Nội, xe 7 chỗ',
              '📞 093 xxxx 456 · TP.HCM → Bình Dương, đi công tác',
              '🧳 Hà Nội → Thanh Hóa, có hành lý nhiều',
              requests.length > 0
                ? `📍 ${requests[0].startPoint} → ${requests[0].endPoint} · ${requests[0].price.toLocaleString('vi-VN')}đ`
                : '📍 Đang cập nhật cuốc xe mới nhất...',
            ].map((msg, i) => (
              <span key={i} className="info-bar__ticker-item">{msg}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              '🚗 Cần xe đi sáng mai 7h từ Hà Nội → Quảng Ninh',
              '👶 TP.HCM → Vũng Tàu, có trẻ em đi cùng',
              '📞 039 xxxx 214 · Hà Nội → Lào Cai, đi gấp hôm nay',
              '🌙 Cần xe đêm nay 21h từ Đà Nẵng → Huế',
              '📞 097 xxxx 881 · Cần Thơ → Cà Mau, 4 người lớn',
              '⚡ Đặt gấp! Hải Phòng → Hà Nội, xe 7 chỗ',
              '📞 093 xxxx 456 · TP.HCM → Bình Dương, đi công tác',
              '🧳 Hà Nội → Thanh Hóa, có hành lý nhiều',
              requests.length > 0
                ? `📍 ${requests[0].startPoint} → ${requests[0].endPoint} · ${requests[0].price.toLocaleString('vi-VN')}đ`
                : '📍 Đang cập nhật cuốc xe mới nhất...',
            ].map((msg, i) => (
              <span key={`dup-${i}`} className="info-bar__ticker-item">{msg}</span>
            ))}
          </div>
        </div>
      </div>

      <main className="content">
        {/* Yêu cầu chở cuốc xe - Hiển thị luôn trên màn hình chính */}
        <section className="requests-section" id="requests">
          <h2 className="requests-heading">Cuốc xe phù hợp</h2>

          <div className="region-tabs" style={{ marginBottom: 16 }}>
            {(['north', 'central', 'south'] as Region[]).map((region) => (
              <button
                key={region}
                className={`region-tab ${activeRequestRegion === region ? 'active' : ''}`}
                onClick={() => setActiveRequestRegion(region)}
              >
                {regionLabels[region]}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="field" style={{ marginBottom: 0 }}>
              <span>Chọn tỉnh/thành phố</span>
              <motion.select
                name="province"
                value={selectedProvince[activeRequestRegion]}
                onChange={(e) => {
                  setSelectedProvince({
                    ...selectedProvince,
                    [activeRequestRegion]: e.target.value
                  })
                }}
                required
                whileFocus={{ boxShadow: '0 0 0 3px rgba(0,177,79,.18)' }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '15px',
                  fontWeight: '600',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23333\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '36px'
                }}
              >
                <option value="">Tất cả tỉnh/thành ({regionLabels[activeRequestRegion]})</option>
                {provincesByRegion[activeRequestRegion].map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </motion.select>
            </label>
          </div>

          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
            {regionLabels[activeRequestRegion]}
            {selectedProvince[activeRequestRegion] && ` - ${selectedProvince[activeRequestRegion]}`}
          </h3>

          {regionRequests.length === 0 && (
            <div className="empty-state">Chưa có cuốc xe nào trong {regionLabels[activeRequestRegion]}.</div>
          )}
          {regionRequests.map((r) => {
            const isNew = (Date.now() - new Date(r.createdAt).getTime()) < 30 * 60 * 1000;
            return (
              <div className="request-card" key={r._id}>
                <div className="request-card__top">
                  <span className={`request-badge ${isNew ? 'request-badge--new' : 'request-badge--dim'}`}>
                    ⚡ Mới
                  </span>
                  <span className="request-card__name">{r.name}</span>
                  <span className={`request-badge ${!isNew ? 'request-badge--done' : 'request-badge--dim'}`}>
                    🕐 Vừa xong
                  </span>
                </div>
                <div className="request-card__phone">Số điện thoại khách hàng: {formatPhone(r.phone)}</div>
                <div className="request-card__route">
                  <div className="request-card__route-row">
                    <span className="route-dot route-dot--green" />
                    <span>{r.startPoint}</span>
                  </div>
                  <div className="route-line" />
                  <div className="request-card__route-row">
                    <span className="route-dot route-dot--red" />
                    <span>{r.endPoint}</span>
                  </div>
                </div>
                {r.note && <div className="request-card__note">Ghi chú: {r.note}</div>}
                <div className="request-card__price">
                  <span className="request-card__price-label">Giá: </span>
                  <span className="request-card__price-value">{r.price?.toLocaleString('vi-VN')} VND</span>
                </div>
                <button className="call-driver-btn" onClick={() => {
                  if (!user) {
                    setErrorPopupTitle('Bạn cần đăng ký trước khi nhận cuốc');
                    setErrorMessage('Vui lòng đăng ký hoặc đăng nhập để có thể nhận cuốc xe.');
                    setShowErrorPopup(true);
                    return;
                  }
                  setCallSheet({ phone: r.phone });
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V21a1 1 0 01-1 1A18 18 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.01l-2.21 2.22z" />
                  </svg>
                  GỌI TÀI XẾ NGAY
                </button>
              </div>
            );
          })}
        </section>

        {/* Danh sách tài xế */}
        <section className="drivers-section">
          <h2 className="section-heading">Danh sách tài xế</h2>

          <div className="region-tabs">
            {(['north', 'central', 'south'] as Region[]).map((region) => (
              <button
                key={region}
                className={`region-tab ${activeRegion === region ? 'active' : ''}`}
                onClick={() => setActiveRegion(region)}
              >
                {regionLabels[region]}
              </button>
            ))}
          </div>
          <h3 className="region-heading">{regionLabels[activeRegion]}</h3>

          {displayedDrivers.length === 0 && (
            <div className="empty-state">Chưa có tài xế trong nhóm này.</div>
          )}

          {(() => {
            const usedAvatarIdx = new Set<number>(); return displayedDrivers.map((p) => {
              return (
                <article className="driver-card" key={p._id}>
                  <div className="avatar" aria-label={p.name} title={p.name}>
                    {(() => {
                      let idx = pickAvatarIndex(p.name, p.phone, (p.region as Region) || 'north')
                      if (idx >= 0 && usedAvatarIdx.has(idx)) {
                        // try next candidates within same region pool (step by 3 keeps region bucket)
                        let tries = 0
                        while (tries < avatarImages.length) {
                          idx = (idx + 3) % avatarImages.length
                          if (!usedAvatarIdx.has(idx)) break
                          tries++
                        }
                      }
                      if (idx >= 0) usedAvatarIdx.add(idx)
                      const chosen = p.avatar || (idx >= 0 ? avatarImages[idx] : null)
                      // In case new images are added/removed, ensure index stays in range
                      if (!chosen) return <span>{toInitials(p.name)}</span>
                      return <img src={chosen} alt={p.name} />
                    })()}
                  </div>
                  <div className="driver-info">
                    <div className="driver-phone">{formatPhone(p.phone)}</div>
                    <div className="driver-route">{p.route}</div>
                  </div>
                  <button
                    className="call-btn"
                    aria-label="Gọi tài xế"
                    onClick={() => {
                      if (!user) {
                        setPendingAction({ type: 'call', phone: p.phone })
                        const reg = localStorage.getItem('driver_registered')
                        setAuthModal(reg ? 'login' : 'register')
                        return
                      }
                      setCallSheet({ phone: p.phone })
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V21a1 1 0 01-1 1A18 18 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.01l-2.21 2.22z" />
                    </svg>
                  </button>
                </article>
              )
            })
          })()}
        </section>
      </main>

      <button className="floating-cta" onClick={() => {
        if (!user) {
          setPendingAction({ type: 'wait' })
          const reg = localStorage.getItem('driver_registered')
          setAuthModal(reg ? 'login' : 'register')
          return
        }
        openModal()
      }}>
        ĐĂNG KÝ CHỞ CUỐC XE
        <span className="chevron">›</span>
      </button>

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
                  <span>Số điện thoại</span>
                  <input name="phone" value={form.phone} onChange={onChange} placeholder="VD: 09xxxxxxx" inputMode="tel" pattern="[0-9]{9,11}" required />
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












