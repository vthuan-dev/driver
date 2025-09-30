import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { authAPI, driversAPI, requestsAPI } from './services/api'
import AdminLogin from './components/admin/Login'
import AdminDashboard from './components/admin/Dashboard'

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

const provincesVN34 = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Ninh', 'Bến Tre',
  'Bình Dương', 'Bình Định', 'Bình Thuận', 'Cà Mau', 'Cao Bằng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Lâm Đồng', 'Lào Cai', 'Long An',
  'Nam Định', 'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Sơn La',
  'Thái Nguyên', 'Lạng Sơn', 'Tuyên Quang', 'Vĩnh Long', 'Tiền Giang'
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
  const [carImagePreview, setCarImagePreview] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragCurrentY, setDragCurrentY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [requests, setRequests] = useState<Array<{ _id: string; name: string; phone: string; startPoint: string; endPoint: string; price: number; createdAt: string }>>([])
  const [callSheet, setCallSheet] = useState<{phone: string} | null>(null)
  const [pendingAction, setPendingAction] = useState<null | { type: 'wait' } | { type: 'call', phone: string }>(null)
  const [activeView, setActiveView] = useState<'home' | 'requests'>('home')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    startPoint: '',
    endPoint: '',
    price: '',
    note: '',
  })

  const formatPhone = (phone: string) => (user ? phone : maskPhoneStrict(phone))

  const normalizedDrivers = drivers.map((driver) => ({
    ...driver,
    region: (driver.region ?? 'north') as Region,
  }))

  const regionDrivers = normalizedDrivers.filter((driver) => driver.region === activeRegion)
  const displayedDrivers = regionDrivers.length > 0 ? regionDrivers : fallbackDriversByRegion[activeRegion]
  const tickerDrivers = (displayedDrivers.length > 0 ? displayedDrivers : normalizedDrivers).slice(0, 6)

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
        const res = await requestsAPI.getAllRequests({ status: 'waiting', limit: 20 })
        const list = Array.isArray(res.data?.requests) ? res.data.requests : []
        setRequests(list)
      } catch (e) {
        console.error('Error loading requests', e)
        setRequests([])
      }
    }
    loadRequests()
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
  const handleCarImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setAuthForm((prev) => ({ ...prev, carImage: '' }))
      setCarImagePreview(null)
      return
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Ảnh xe vượt quá 2MB, vui lòng chọn file nhỏ hơn.')
      event.target.value = ''
      setAuthForm((prev) => ({ ...prev, carImage: '' }))
      setCarImagePreview(null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setAuthForm((prev) => ({ ...prev, carImage: result }))
      setCarImagePreview(result || null)
    }
    reader.readAsDataURL(file)
  }

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
        note: form.note
      })
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2200)
      setShowModal(false)
      setForm({ name: '', phone: '', startPoint: '', endPoint: '', price: '', note: '' })
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
          {requests.length === 0 && (
            <div className="empty-state">Chưa có yêu cầu nào.</div>
          )}
          {requests.map((r) => (
            <div className="request-card" key={r._id}>
              <div className="request-main">
                <div className="request-name">{r.name}</div>
                <div className="request-phone">{formatPhone(r.phone)}</div>
                <div className="request-route">{r.startPoint} -&gt; {r.endPoint}</div>
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
              <div className="field" style={{gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '12px'}}>
                <label className="field">
                  <span>Điểm xuất phát</span>
                  <motion.select name="startPoint" value={form.startPoint} onChange={(e) => onChange(e as any)} required
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(0,177,79,.18)' }}
                  >
                    <option value="" disabled>Chọn tỉnh/thành</option>
                    {provincesVN34.map((p) => (
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
                    {provincesVN34.map((p) => (
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

                if (authModal === 'register') {
                  if (authForm.password !== authForm.confirmPassword) {
                    alert('Mat khau xac nhan khong khop!')
                    return;
                  }

                  if (!authForm.carImage) {
                    alert('Vui long them anh xe truoc khi dang ky.')
                    return;
                  }
                }

                setLoading(true)
                try {
                  if (authModal === 'register') {
                    await authAPI.register({
                      name: authForm.name,
                      phone: authForm.phone,
                      password: authForm.password,
                      carType: authForm.carType,
                      carYear: authForm.carYear,
                      carImage: authForm.carImage,
                    })

                    localStorage.setItem('driver_registered', '1')
                    alert('Đăng ký thành công! Vui lòng đợi admin phê duyệt.')
                    setAuthModal(null)
                  } else {
                    const response = await authAPI.login({
                      phone: authForm.phone,
                      password: authForm.password
                    })

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
                  console.error('Auth error:', error)
                  const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra'
                  setErrorMessage(errorMsg)
                  setShowError(true)
                  setTimeout(() => setShowError(false), 3000)
                } finally {
                  setLoading(false)
                  setAuthForm({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '', carImage: '' })
                  setCarImagePreview(null)
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
                    <label className="field">
                      <span>Ảnh xe (tối đa 2MB)</span>
                      <input
                        key={carImagePreview ? 'car-image-set' : 'car-image-empty'}
                        type="file"
                        accept="image/*"
                        onChange={handleCarImageChange}
                        required
                      />
                      {carImagePreview && (
                        <div className="image-preview">
                          <img src={carImagePreview} alt="Ảnh xe" />
                        </div>
                      )}
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
                <motion.button type="submit" className="submit" whileTap={{scale:.98}} disabled={loading}>
                  {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN'}
                </motion.button>
              </form>
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
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App












