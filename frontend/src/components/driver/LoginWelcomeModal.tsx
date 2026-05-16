import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onHide2Hours: () => void;
  onAfterClose?: () => void;
};

const LoginWelcomeModal = ({ isOpen, onClose, onHide2Hours, onAfterClose }: Props) => {
  const handleClose = () => { onClose(); if (onAfterClose) setTimeout(onAfterClose, 400); };
  const handleHide2Hours = () => { onHide2Hours(); if (onAfterClose) setTimeout(onAfterClose, 400); };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="welcome-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1a8a3c 0%, #27ae60 100%)',
              padding: '16px 20px',
              borderRadius: '16px 16px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>🎉 Chào mừng bạn!</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '2px' }}>
                  Xem quyền lợi thành viên của bạn
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  borderRadius: '50%', width: '32px', height: '32px',
                  cursor: 'pointer', color: '#fff', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>

            {/* Comparison Table */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {/* WEB column */}
                <div style={{
                  background: '#e8f4fd', borderRadius: '12px', padding: '12px',
                  border: '2px solid #3498db',
                }}>
                  <div style={{
                    textAlign: 'center', fontWeight: 700, fontSize: '12px',
                    color: '#1a5276', marginBottom: '10px', lineHeight: '1.3',
                  }}>
                    💻 SỬ DỤNG<br />TRÊN WEB
                  </div>

                  <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: '2px' }}>Phí duy nhất:</div>
                    <div style={{ color: '#1a5276', fontWeight: 700 }}>💰 200K / 1 Lần</div>
                    <div style={{ color: '#666', fontSize: '11px' }}>Cam kết không phát sinh</div>
                  </div>

                  <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: '2px' }}>Quyền lợi:</div>
                    <div style={{ color: '#555' }}>100% Tính năng &amp; <strong>Dùng vĩnh viễn</strong></div>
                  </div>

                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: '4px' }}>Tính năng thông báo:</div>
                    <div style={{ color: '#555', lineHeight: '1.4' }}>
                      Web <strong style={{ color: '#e74c3c' }}>KHÔNG HỖ TRỢ</strong> thông báo tức thì về đơn hàng hay sự kiện.
                    </div>
                    <div style={{ color: '#555', marginTop: '4px', lineHeight: '1.4' }}>
                      • <strong>Trải nghiệm:</strong> Ổn định trên trình duyệt
                    </div>
                  </div>
                </div>

                {/* APP column */}
                <div style={{
                  background: '#fff8e6', borderRadius: '12px', padding: '12px',
                  border: '2px solid #f39c12',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: '#e67e22', color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
                  }}>⭐ KHUYẾN NGHỊ</div>

                  <div style={{
                    textAlign: 'center', fontWeight: 700, fontSize: '12px',
                    color: '#7d4400', marginBottom: '10px', lineHeight: '1.3',
                  }}>
                    📱 SỬ DỤNG<br />QUA APP
                  </div>

                  <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: '2px' }}>Phí duy trì:</div>
                    <div style={{ color: '#7d4400', fontWeight: 700, lineHeight: '1.5' }}>
                      💳 400K / Năm<br />or 💰 1 Triệu / Trọn đời
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: '2px' }}>Quyền lợi:</div>
                    <div style={{ color: '#555' }}>100% Tính năng &amp; <strong>Hỗ trợ ưu tiên</strong></div>
                  </div>

                  <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#333', marginBottom: '4px' }}>Tính năng thông báo:</div>
                    <div style={{ color: '#555', lineHeight: '1.4' }}>
                      App có <strong style={{ color: '#27ae60' }}>THÔNG BÁO TỨC THÌ</strong> ngay khi có đơn hàng, kèo mới hoặc tin quan trọng.
                    </div>
                  </div>
                </div>
              </div>

              {/* Lời khuyên */}
              <div style={{
                background: '#fdf9e7', border: '1px solid #f0c040',
                borderRadius: '12px', padding: '12px', marginBottom: '14px',
              }}>
                <div style={{
                  fontWeight: 700, color: '#7d5a00', marginBottom: '8px',
                  fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  💡 LỜI KHUYÊN DÀNH CHO ANH EM
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#555', lineHeight: '1.6' }}>
                  <li>
                    <strong>WEB - Sự lựa chọn cho người bắt đầu:</strong> Phù hợp nếu bạn chủ yếu dùng PC hoặc có thời gian kiểm tra web thường xuyên. Tuy nhiên, lưu ý là Web <strong>sẽ không có hệ thống thông báo tức thì</strong>.
                  </li>
                  <li style={{ marginTop: '6px' }}>
                    <strong>APP - Dành cho chiến thần thực thụ:</strong> Với APP, bạn sẽ luôn là người dẫn đầu. Hệ thống <strong>thông báo tức thì</strong> đảm bảo bạn <strong>nhận được kèo mới, đơn hàng mới NGAY LẬP TỨC</strong>.
                  </li>
                  <li style={{ marginTop: '6px' }}>
                    <strong>Gợi ý:</strong> Nếu bạn nghiêm túc và muốn kiếm tiền nhanh nhất, hãy chọn Gói APP Trọn Đời.
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <button
                onClick={handleHide2Hours}
                style={{
                  width: '100%', padding: '12px',
                  background: '#e74c3c', color: '#fff',
                  border: 'none', borderRadius: '10px',
                  fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer',
                  letterSpacing: '0.3px',
                }}
              >
                Không hiển thị lại trong 2 giờ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginWelcomeModal;
