import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

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

function maskPhone(phone: string): string {
  if (phone.length < 3) return phone
  return phone.slice(0, phone.length - 3) + '***'
}

function getInitial(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1].slice(0, 1).toUpperCase()
}

function App() {
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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
      <header className="ticker">
        <div className="ticker__track">
          {posts.slice(0, 6).map((p) => (
            <div className="ticker__item" key={p.id}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đăng nhờ: {p.route} • Liên hệ {maskPhone(p.phone)}
              </span>
            </div>
          ))}
          {posts.slice(0, 6).map((p) => (
            <div className="ticker__item" key={p.id + '-dup'}>
              <span className="dot" />
              <span className="ticker__text">
                {p.name} đăng nhờ: {p.route} • Liên hệ {maskPhone(p.phone)}
              </span>
            </div>
          ))}
        </div>
      </header>

      <main className="content">
        {posts.map((p) => (
          <article className="driver-card" key={p.id}>
            <div className="avatar">{getInitial(p.name)}</div>
            <div className="driver-info">
              <div className="driver-phone">{maskPhone(p.phone)}</div>
              <div className="driver-route">{p.route}</div>
            </div>
            <a className="call-btn" href={`tel:${p.phone}`} aria-label="Gọi tài xế">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V21a1 1 0 01-1 1A18 18 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.24 1.01l-2.21 2.22z"/>
              </svg>
            </a>
          </article>
        ))}
      </main>

      <button className="floating-cta" onClick={openModal}>
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
    </div>
  )
}

export default App
