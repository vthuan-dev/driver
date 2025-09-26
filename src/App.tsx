import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

// Load avatar images from ../driver directory
const avatarModules = import.meta.glob('../driver/*.{jpg,jpeg,png}', { eager: true }) as Record<string, any>
const avatarImages: string[] = Object.values(avatarModules).map((m: any) => m.default || m)

type DriverPost = {
  id: string
  name: string
  phone: string
  route: string
}

const posts: DriverPost[] = [
  { id: 'p1', name: 'Anh Tuấn', phone: '0912345678', route: 'Hà Nội ⇄ Lào Cai' },
  { id: 'p2', name: 'Chị Hạnh', phone: '0987654321', route: 'Hà Nội ⇄ Ninh Bình' },
  { id: 'p3', name: 'Anh Dũng', phone: '0901234567', route: 'Mỹ Đình ⇄ Nội Bài' },
  { id: 'p4', name: 'Anh Hoàng', phone: '0968888777', route: 'Cầu Giấy ⇄ Hải Phòng' },
  { id: 'p5', name: 'Anh Nam', phone: '0977123456', route: 'Long Biên ⇄ Hạ Long' },
  { id: 'p6', name: 'Chị Linh', phone: '0355555999', route: 'Hà Đông ⇄ Phú Thọ' },
  { id: 'p7', name: 'Tài xế 1', phone: '0927735274', route: 'Giáp Bát ⇄ Ninh Bình' },
  { id: 'p8', name: 'Tài xế 2', phone: '0924649610', route: 'Hà Nội ⇄ Hải Dương' },
  { id: 'p9', name: 'Tài xế 3', phone: '0844657330', route: 'Hà Nội ⇄ Bắc Ninh' },
  { id: 'p10', name: 'Tài xế 4', phone: '0779966349', route: 'Mỹ Đình ⇄ Nội Bài' },
  { id: 'p11', name: 'Tài xế 5', phone: '0889345121', route: 'Hà Nội ⇄ Nam Định' },
  { id: 'p12', name: 'Tài xế 6', phone: '0325463415', route: 'Cầu Giấy ⇄ Hưng Yên' },
]

const provincesVN34 = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Ninh', 'Bến Tre',
  'Bình Dương', 'Bình Định', 'Bình Thuận', 'Cà Mau', 'Cao Bằng',
  'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Lâm Đồng', 'Lào Cai', 'Long An',
  'Nam Định', 'Nghệ An', 'Ninh Bình', 'Phú Thọ'
]

//

function maskPhoneStrict(phone: string): string {
  const last4 = phone.slice(-4)
  return `xxxx ${last4}`
}

//

function App() {
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null)
  const [user, setUser] = useState<{name: string; phone: string} | null>(() => {
    try { return JSON.parse(localStorage.getItem('driver_user') || 'null') } catch { return null }
  })
  const [authForm, setAuthForm] = useState({ name: '', phone: '', password: '' })
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

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const routeCombined = form.startPoint && form.endPoint ? `${form.startPoint} ⇄ ${form.endPoint}` : ''
    // save to localStorage
    const key = 'driver_waiting_requests'
    const current = JSON.parse(localStorage.getItem(key) || '[]') as any[]
    const entry = { ...form, route: routeCombined, createdAt: new Date().toISOString() }
    localStorage.setItem(key, JSON.stringify([entry, ...current].slice(0, 50)))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2200)
    setShowModal(false)
    setForm({ name: '', phone: '', startPoint: '', endPoint: '', price: '', note: '' })
  }

  return (
    <div className="app">
      <div className="topbar">
        <button className="hamburger" aria-label="Menu" onClick={() => setMenuOpen((v)=>!v)}>≡ MENU</button>
        <div className="topbar__actions">
          {user && <span className="hello">👋 {user.name || maskPhoneStrict(user.phone)}</span>}
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
          {posts.slice(0, 6).map((p) => (
            <div className="ticker__item" key={p.id}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đăng nhờ: {p.route} • Liên hệ {maskPhoneStrict(p.phone)}
              </span>
            </div>
          ))}
          {posts.slice(0, 6).map((p) => (
            <div className="ticker__item" key={p.id + '-dup'}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đăng nhờ: {p.route} • Liên hệ {maskPhoneStrict(p.phone)}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="content">
        {posts.map((p, idx) => (
          <article className="driver-card" key={p.id}>
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
              >
                GỬI ĐĂNG KÍ
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
              <form className="form" onSubmit={(e) => {
                e.preventDefault();
                let loggedIn: {name: string; phone: string} | null = null
                if (authModal === 'register') {
                  localStorage.setItem('driver_registered', JSON.stringify(authForm));
                  localStorage.setItem('driver_user', JSON.stringify({ name: authForm.name, phone: authForm.phone }));
                  loggedIn = { name: authForm.name, phone: authForm.phone }
                } else {
                  const reg = JSON.parse(localStorage.getItem('driver_registered') || 'null');
                  if (!reg) { alert('Bạn chưa đăng ký thành viên. Hãy đăng ký trước.'); return }
                  if (reg.phone !== authForm.phone) { alert('Số điện thoại không khớp hồ sơ đã đăng ký.'); return }
                  if (reg.password !== authForm.password) { alert('Mật khẩu không đúng.'); return }
                  localStorage.setItem('driver_user', JSON.stringify({ name: reg.name, phone: reg.phone }));
                  loggedIn = { name: reg.name, phone: reg.phone }
                }
                setUser(loggedIn)
                setAuthModal(null)
                setShowSuccess(true); setTimeout(()=>setShowSuccess(false), 1600);
                // perform pending action
                if (pendingAction) {
                  if (pendingAction.type === 'wait') openModal()
                  if (pendingAction.type === 'call') setCallSheet({ phone: pendingAction.phone })
                  setPendingAction(null)
                }
                setAuthForm({ name: '', phone: '', password: '' })
              }}>
                <label className="field">
                  <span>Họ và tên</span>
                  <input name="name" value={authForm.name} onChange={(e)=>setAuthForm({...authForm, name: e.target.value})} placeholder="VD: Nguyễn Văn A" required />
                </label>
                <label className="field">
                  <span>Số điện thoại</span>
                  <input name="phone" value={authForm.phone} onChange={(e)=>setAuthForm({...authForm, phone: e.target.value})} inputMode="tel" pattern="[0-9]{9,11}" placeholder="VD: 09xxxxxxx" required />
                </label>
                <label className="field">
                  <span>Mật khẩu</span>
                  <input type="password" name="password" value={authForm.password} onChange={(e)=>setAuthForm({...authForm, password: e.target.value})} placeholder="Ít nhất 4 ký tự" required />
                </label>
                <motion.button type="submit" className="submit" whileTap={{scale:.98}}>XÁC NHẬN</motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
