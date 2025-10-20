import { useState, useEffect, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { authAPI, driversAPI, requestsAPI } from './services/api'
import AdminLogin from './components/admin/Login'
import AdminDashboard from './components/admin/Dashboard'

// Error Boundary Component
class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: ReactNode}) {
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
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
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

//

function maskPhoneStrict(phone: string): string {
  const last4 = phone.slice(-4)
  return `xxxx ${last4}`
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
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null)
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('driver_user') || 'null') } catch { return null }
  })
  const [drivers, setDrivers] = useState<DriverPost[]>(posts)
  const [activeRegion, setActiveRegion] = useState<Region>('north')
  const [loading, setLoading] = useState(false)
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
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [requests, setRequests] = useState<Array<{ _id: string; name: string; phone: string; startPoint: string; endPoint: string; price: number; createdAt: string; note?: string; region?: Region }>>([])
  const [callSheet, setCallSheet] = useState<{phone: string} | null>(null)
  const [pendingAction, setPendingAction] = useState<null | { type: 'wait' } | { type: 'call', phone: string }>(null)
  const [activeView, setActiveView] = useState<'home' | 'requests'>('home')
  const [activeRequestRegion, setActiveRequestRegion] = useState<Region>('north')
  const [showPayment, setShowPayment] = useState(false)
  const [pendingRegister, setPendingRegister] = useState<{ name: string; phone: string; password: string; carType: string; carYear: string } | null>(null)
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
  const tickerDrivers = (displayedDrivers.length > 0 ? displayedDrivers : normalizedDrivers).slice(0, 6)
  
  // Filter requests by region and sort newest first
  const regionRequests = requests
    .filter((request) => (request.region || 'north') === activeRequestRegion)
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

  // Auto-open registration modal on first visit when not logged in
  useEffect(() => {
    const hasUser = !!localStorage.getItem('driver_user')
    if (!hasUser) {
      setAuthModal('register')
    }
  }, [])

  // If URL hash points to requests, scroll to it on mount
  useEffect(() => {
    const shouldOpen = location.hash === '#requests' || new URLSearchParams(location.search).get('show') === 'requests'
    if (shouldOpen) {
      setActiveView('requests')
      setTimeout(() => {
        document.getElementById('requests')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [])


  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
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
    
    setLoading(true)
    try {
      await requestsAPI.createRequest({
        name: form.name,
        phone: form.phone,
        startPoint: form.startPoint,
        endPoint: form.endPoint,
        price: parseInt(form.price) || 0,
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
      
      // Sau khi đăng ký xong, chuyển sang tab Yêu cầu và chọn đúng miền vừa đăng ký
      setActiveView('requests')
      setActiveRequestRegion(form.region)
      
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

  return (
    <div className="app">
      <div className="topbar">
        <button className="hamburger" aria-label="Menu" onClick={() => setMenuOpen((v)=>!v)}> MENU</button>
        <div className="topbar__actions">
          {user && (
            <div className="user-info">
              <span className="hello">Hi {user.name || user.phone}</span>
              {/* <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('driver_user');
                  setUser(null);
                  setMenuOpen(false);
                }}
              >
                Đăng xuất
              </button> */}
            </div>
          )}
        </div>
        {menuOpen && (
          <div className="menu-popover">
            {!user && (
              <>
                <button className="menu-item" onClick={() => { setAuthModal('register'); setMenuOpen(false) }}>Đăng ký thành viên</button>
                <button className="menu-item" onClick={() => { setAuthModal('login'); setMenuOpen(false) }}>Đăng nhập</button>
              </>
            )}
            <button className="menu-item" onClick={() => {
              setActiveView('requests')
              setActiveRequestRegion(activeRegion) // Đồng bộ miền hiện tại
              setMenuOpen(false)
            }}>Xem yêu cầu cuốc xe</button>
            {user && (
              <>
                <button className="menu-item" onClick={() => { localStorage.removeItem('driver_user'); localStorage.removeItem('token'); localStorage.removeItem('driver_registered'); setUser(null); setMenuOpen(false) }}>Đăng xuất</button>
              </>
            )}
          </div>
        )}
      </div>
      <header className="ticker">
        <div className="ticker__track">
          {tickerDrivers.map((p) => (
            <div className="ticker__item" key={`ticker-${p._id}`}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đang nhờ: {p.route} - Liên hệ {formatPhone(p.phone)}
              </span>
            </div>
          ))}
          {tickerDrivers.map((p) => (
            <div className="ticker__item" key={`ticker-dup-${p._id}`}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đang nhờ: {p.route} - Liên hệ {formatPhone(p.phone)}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="content">
        {activeView === 'requests' && (
        <section className="requests-section" id="requests">
          <div className="section-header" style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 8}}>
            <h2 className="requests-heading" style={{margin: 0}}>Yêu cầu chở cuốc xe</h2>
            <button className="menu-item" onClick={() => setActiveView('home')}>‹ Quay về</button>
          </div>
          
          <div className="region-tabs" style={{marginBottom: 16}}>
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
          
          <h3 style={{margin: '0 0 12px 0', fontSize: '16px', color: '#333'}}>
            {regionLabels[activeRequestRegion]}
          </h3>
          
          {regionRequests.length === 0 && (
            <div className="empty-state">Chưa có yêu cầu nào trong {regionLabels[activeRequestRegion]}.</div>
          )}
          {regionRequests.map((r) => (
            <div className="request-card" key={r._id}>
              <div className="request-main">
                <div className="request-name">{r.name}</div>
                <div className="request-phone">{formatPhone(r.phone)}</div>
                <div className="request-route">{r.startPoint} -&gt; {r.endPoint}</div>
                {r.note && <div className="request-note">Ghi chú: {r.note}</div>}
                <div className="request-price">Giá: {r.price?.toLocaleString('vi-VN')} VND</div>
              </div>
              <button className="copy-btn" onClick={() => {
                const text = `${r.name}\n${r.phone}\n${r.startPoint} -> ${r.endPoint}\nGiá: ${r.price?.toLocaleString('vi-VN')} VND`
                navigator.clipboard.writeText(text)
              }}>SAO CHÉP</button>
            </div>
          ))}
        </section>
        )}
        {activeView === 'home' && (
        <>
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
        <h2 className="region-heading">{regionLabels[activeRegion]}</h2>

        {displayedDrivers.length === 0 && (
          <div className="empty-state">Chưa có tài xế trong nhóm này.</div>
        )}

        {(() => { const usedAvatarIdx = new Set<number>(); return displayedDrivers.map((p) => {
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
        })})()}
        </>
        )}
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
              <div className="field" style={{gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '12px'}}>
                <label className="field">
                  <span>Điểm xuất phát</span>
                  <motion.select name="startPoint" value={form.startPoint} onChange={(e) => onChange(e as any)} required
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(0,177,79,.18)' }}
                  >
                    <option value="" disabled>Chọn tỉnh/thành</option>
                    {provincesVN63.map((p) => (
                      <option key={'s-'+p} value={p}>{p}</option>
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
                      <option key={'e-'+p} value={p}>{p}</option>
                    ))}
                  </motion.select>
                </label>
              </div>
              <label className="field">
                <span>Giá dự kiến (VND)</span>
                <input name="price" value={form.price} onChange={onChange} placeholder="VD: 800000" inputMode="numeric" pattern="[0-9]*" />
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
            <motion.div className="sheet__backdrop" onClick={() => setCallSheet(null)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} />
            <motion.div className="sheet__panel" initial={{y: 240}} animate={{y:0}} exit={{y:240}} transition={{ type:'spring', stiffness:400, damping:34 }}>
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
            <motion.div className="modal__backdrop" onClick={() => setAuthModal(null)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} />
            <motion.div 
              className={`modal__panel ${isDragging ? 'dragging' : ''}`}
              initial={{opacity:0,y:40}} 
              animate={{opacity:1,y:0}} 
              exit={{opacity:0,y:20}}
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
                    localStorage.setItem('token', response.data.token)
                    localStorage.setItem('driver_user', JSON.stringify(response.data.user))
                    localStorage.setItem('driver_registered', '1')
                    setUser(response.data.user)
                    setAuthModal(null)
                    setShowSuccess(true)
                    setTimeout(() => setShowSuccess(false), 1600)

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
                    <input name="name" value={authForm.name} onChange={(e)=>setAuthForm({...authForm, name: e.target.value})} placeholder="VD: Nguyễn Văn A" required />
                  </label>
                )}
                <label className="field">
                  <span>Số điện thoại</span>
                  <input name="phone" value={authForm.phone} onChange={(e)=>setAuthForm({...authForm, phone: e.target.value})} inputMode="tel" pattern="[0-9]{9,11}" placeholder="VD: 09xxxxxxx" required />
                </label>
                {authModal === 'register' && (
                  <>
                    <label className="field">
                      <span>Loại xe</span>
                      <input name="carType" value={authForm.carType} onChange={(e)=>setAuthForm({...authForm, carType: e.target.value})} placeholder="VD: Toyota Camry, Honda Civic..." required />
                    </label>
                    <label className="field">
                      <span>Đời xe</span>
                      <input name="carYear" value={authForm.carYear} onChange={(e)=>setAuthForm({...authForm, carYear: e.target.value})} placeholder="VD: 2020, 2021..." required />
                    </label>
                    
                  </>
                )}
                <label className="field">
                  <span>Mật khẩu</span>
                  <input type="password" name="password" value={authForm.password} onChange={(e)=>setAuthForm({...authForm, password: e.target.value})} placeholder="Ít nhất 4 ký tự" required />
                </label>
                {authModal === 'register' && (
                  <label className="field">
                    <span>Xác nhận lại mật khẩu</span>
                    <input type="password" name="confirmPassword" value={authForm.confirmPassword} onChange={(e)=>setAuthForm({...authForm, confirmPassword: e.target.value})} placeholder="Nhập lại mật khẩu" required />
                  </label>
                )}
                <motion.button 
                  type="submit" 
                  className="submit" 
                  whileTap={{scale:.98}} 
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
            <motion.div className="modal__backdrop" onClick={() => setShowPayment(false)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} />
            <motion.div className="modal__panel" initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>
              <div className="modal__header">
                <div className="modal__title">Phí vào nhóm 200.000đ</div>
                <button className="modal__close" onClick={() => setShowPayment(false)} aria-label="Đóng">×</button>
              </div>
              <div style={{padding:'8px 16px'}}>
                <p style={{marginTop:0}}>Vui lòng chuyển khoản 200.000đ theo QR bên dưới để hoàn tất đăng ký.</p>
                <div style={{display:'flex', justifyContent:'center'}}>
                  <img
                    src={`https://img.vietqr.io/image/VIB-081409781-compact2.png?amount=100000&addInfo=Phi%20tham%20gia%20nhom&accountName=PHAN%20NGOC%20CHUNG`}
                    alt="VietQR VIB 081409781"
                    style={{width:'100%', maxWidth:360, borderRadius:12, boxShadow:'0 6px 24px rgba(0,0,0,.08)'}}
                  />
                </div>
                <div style={{marginTop:12, fontSize:13, color:'#444'}}>Nội dung chuyển khoản: <strong>Phi tham gia nhom</strong></div>
                <div style={{display:'flex', gap:12, marginTop:16}}>
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
                    style={{flex:1}}
                  >
                    Tôi đã chuyển 200k - Tiếp tục
                  </button>
                  <button className="sheet__cancel" onClick={() => setShowPayment(false)} style={{flex:1}}>Để sau</button>
                </div>
              </div>
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












