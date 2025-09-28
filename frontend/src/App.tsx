import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import { authAPI, driversAPI, requestsAPI } from './services/api'
import AdminLogin from './components/admin/Login'
import AdminDashboard from './components/admin/Dashboard'

// Load avatar images from ../driver directory
const avatarModules = import.meta.glob('../driver/*.{jpg,jpeg,png}', { eager: true }) as Record<string, any>
const avatarImages: string[] = Object.values(avatarModules).map((m: any) => m.default || m)

type DriverPost = {
  _id: string
  name: string
  phone: string
  route: string
  avatar?: string
  isActive: boolean
  createdAt: string
}

type User = {
  _id: string
  name: string
  phone: string
  carType: string
  carYear: string
  status: 'pending' | 'approved' | 'rejected'
}

const posts: DriverPost[] = [
  { _id: 'p1', name: 'Anh Tuấn', phone: '0912345678', route: 'Hà Nội ⇄ Lào Cai', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p2', name: 'Chị Hạnh', phone: '0987654321', route: 'Hà Nội ⇄ Ninh Bình', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p3', name: 'Anh Dũng', phone: '0901234567', route: 'Mỹ Đình ⇄ Nội Bài', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p4', name: 'Anh Hoàng', phone: '0968888777', route: 'Cầu Giấy ⇄ Hải Phòng', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p5', name: 'Anh Nam', phone: '0977123456', route: 'Long Biên ⇄ Hạ Long', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p6', name: 'Chị Linh', phone: '0355555999', route: 'Hà Đông ⇄ Phú Thọ', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p7', name: 'Tài xế 1', phone: '0927735274', route: 'Giáp Bát ⇄ Ninh Bình', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p8', name: 'Tài xế 2', phone: '0924649610', route: 'Hà Nội ⇄ Hải Dương', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p9', name: 'Tài xế 3', phone: '0844657330', route: 'Hà Nội ⇄ Bắc Ninh', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p10', name: 'Tài xế 4', phone: '0779966349', route: 'Mỹ Đình ⇄ Nội Bài', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p11', name: 'Tài xế 5', phone: '0889345121', route: 'Hà Nội ⇄ Nam Định', isActive: true, createdAt: new Date().toISOString() },
  { _id: 'p12', name: 'Tài xế 6', phone: '0325463415', route: 'Cầu Giấy ⇄ Hưng Yên', isActive: true, createdAt: new Date().toISOString() },
]

const provincesVN34 = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Ninh', 'Bến Tre',
  'Bình Dương', 'Bình Định', 'Bình Thuận', 'Cà Mau', 'Cao Bằng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Lâm Đồng', 'Lào Cai', 'Long An',
  'Nam Định', 'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Sơn La'
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
  const [drivers, setDrivers] = useState<DriverPost[]>([])
  const [loading, setLoading] = useState(false)
  const [authForm, setAuthForm] = useState({ 
    name: '', 
    phone: '', 
    password: '', 
    confirmPassword: '',
    carType: '', 
    carYear: '' 
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [callSheet, setCallSheet] = useState<{phone: string} | null>(null)
  const [pendingAction, setPendingAction] = useState<null | { type: 'wait' } | { type: 'call', phone: string }>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    startPoint: '',
    endPoint: '',
    price: '',
    note: '',
  })

  // Load drivers from API
  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const response = await driversAPI.getDrivers()
        setDrivers(response.data.drivers)
      } catch (error) {
        console.error('Error loading drivers:', error)
        // Fallback to static data if API fails
        setDrivers(posts)
      }
    }
    loadDrivers()
  }, [])

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
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
        <button className="hamburger" aria-label="Menu" onClick={() => setMenuOpen((v)=>!v)}>≡ MENU</button>
        <div className="topbar__actions">
          {user && (
            <div className="user-info">
              <span className="hello">👋 {user.name || maskPhoneStrict(user.phone)}</span>
              {/* <button 
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('driver_user');
                  setUser(null);
                  setMenuOpen(false);
                }}
              >
                🚪 Đăng xuất
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
            {user && (
              <>
                <button className="menu-item" onClick={() => { localStorage.removeItem('driver_user'); setUser(null); setMenuOpen(false) }}>Đăng xuất</button>
              </>
            )}
          </div>
        )}
      </div>
      <header className="ticker">
        <div className="ticker__track">
          {drivers.slice(0, 6).map((p) => (
            <div className="ticker__item" key={p._id}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đăng nhờ: {p.route} • Liên hệ {maskPhoneStrict(p.phone)}
              </span>
            </div>
          ))}
          {drivers.slice(0, 6).map((p) => (
            <div className="ticker__item" key={p._id + '-dup'}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đăng nhờ: {p.route} • Liên hệ {maskPhoneStrict(p.phone)}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="content">
        {drivers.map((p, idx) => (
          <article className="driver-card" key={p._id}>
            <div className="avatar">
              <img src={avatarImages[idx % avatarImages.length]} alt={p.name} />
            </div>
            <div className="driver-info">
              <div className="driver-phone">{maskPhoneStrict(p.phone)}</div>
              <div className="driver-route">{p.route}</div>
            </div>
            <button className="call-btn" aria-label="Gọi tài xế" onClick={() => {
              if (!user) {
                setPendingAction({ type: 'call', phone: p.phone })
                const reg = localStorage.getItem('driver_registered')
                setAuthModal(reg ? 'login' : 'register')
                return
              }
              setCallSheet({ phone: p.phone })
            }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V21a1 1 0 01-1 1A18 18 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.01l-2.21 2.22z"/>
              </svg>
            </button>
          </article>
        ))}
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
        ĐĂNG KÍ CHỜ CUỐC XE
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
              <div className="modal__title">Đăng kí chờ cuốc xe</div>
              <button className="modal__close" onClick={closeModal} aria-label="Đóng">✕</button>
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
                {loading ? 'ĐANG GỬI...' : 'GỬI ĐĂNG KÍ'}
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
            <span>Đăng kí thành công</span>
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
            <span className="toast__icon">✕</span>
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
                <strong className="sheet__phone">{maskPhoneStrict(callSheet.phone)}</strong>
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
            <motion.div className="modal__panel" initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>
              <div className="modal__header">
                <div className="modal__title">{authModal === 'login' ? 'Đăng nhập' : 'Đăng ký thành viên nhóm'}</div>
                <button className="modal__close" onClick={() => setAuthModal(null)} aria-label="Đóng">✕</button>
              </div>
              <form className="form" onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true)
                try {
                  if (authModal === 'register') {
                    // Validate password confirmation
                    if (authForm.password !== authForm.confirmPassword) {
                      alert('Mật khẩu xác nhận không khớp!')
                      return
                    }
                    
                    await authAPI.register({
                      name: authForm.name,
                      phone: authForm.phone,
                      password: authForm.password,
                      carType: authForm.carType,
                      carYear: authForm.carYear
                    })
                    
                    alert('Đăng ký thành công! Vui lòng chờ admin phê duyệt.')
                    setAuthModal(null)
                  } else {
                    const response = await authAPI.login({
                      phone: authForm.phone,
                      password: authForm.password
                    })
                    
                    localStorage.setItem('token', response.data.token)
                    localStorage.setItem('driver_user', JSON.stringify(response.data.user))
                    setUser(response.data.user)
                    setAuthModal(null)
                    setShowSuccess(true)
                    setTimeout(() => setShowSuccess(false), 1600)
                    
                    // perform pending action
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
                  setAuthForm({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '' })
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
