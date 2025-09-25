import { useState } from 'react'
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
  const [form, setForm] = useState({
    name: '',
    phone: '',
    route: '',
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
    alert(`Đã nhận đăng kí chờ cuốc xe!\nTên: ${form.name}\nSĐT: ${form.phone}\nTuyến: ${form.route}`)
    setShowModal(false)
    setForm({ name: '', phone: '', route: '', note: '' })
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

      {showModal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__backdrop" onClick={closeModal} />
          <div className="modal__panel">
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
              <label className="field">
                <span>Tuyến đường/Khu vực</span>
                <input name="route" value={form.route} onChange={onChange} placeholder="VD: Hà Nội ⇄ Ninh Bình" required />
              </label>
              <label className="field">
                <span>Ghi chú</span>
                <textarea name="note" value={form.note} onChange={onChange} placeholder="Giờ giấc, loại xe..." rows={3} />
              </label>
              <button type="submit" className="submit">GỬI ĐĂNG KÍ</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
