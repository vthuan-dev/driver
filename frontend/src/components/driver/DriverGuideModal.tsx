import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DriverGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriverGuideModal: React.FC<DriverGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop mờ nền */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          />

          {/* Hộp thoại Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              maxHeight: '88vh',
              background: '#ffffff',
              borderRadius: 22,
              boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '18px 20px 14px',
                background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>🚗</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                    HƯỚNG DẪN SỬ DỤNG
                  </h3>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, fontWeight: 600 }}>
                    App Chia Sẻ Cuốc Xe Cho Tài Xế
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              style={{
                padding: '18px 18px 10px',
                overflowY: 'auto',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#334155',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Giới thiệu mục đích */}
              <div
                style={{
                  background: '#f0fdf4',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                Ứng dụng dành cho <strong>anh em tài xế cùng chia sẻ cuốc xe</strong>, hỗ trợ nhau tìm kiếm chuyến phù hợp. Anh em có cuốc không chạy được có thể chia sẻ lên hệ thống để tài xế khác tham khảo và nhận cuốc.
              </div>

              {/* Mục 1 */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>📱</span>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>1. Đăng ký tài khoản</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <li>
                    Truy cập ứng dụng:{' '}
                    <a
                      href="https://driver-uenm.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      driver-uenm.vercel.app
                    </a>
                  </li>
                  <li>Đăng ký tài khoản theo hướng dẫn trên màn hình.</li>
                  <li>Hoàn tất các bước đăng ký và chờ quản trị viên duyệt tài khoản nếu được yêu cầu.</li>
                </ul>
              </div>

              {/* Mục 2 */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🚘</span>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>2. Khi anh em có cuốc cần chia sẻ</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <li>Nếu có cuốc xe nhưng không tiện chạy, anh em có thể đăng thông tin cuốc lên app.</li>
                  <li>Cung cấp đầy đủ thông tin chuyến đi theo các trường trên ứng dụng.</li>
                  <li>Anh em tài xế khác có thể xem thông tin và liên hệ để trao đổi, nhận chuyến phù hợp.</li>
                </ul>
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: '#fef3c7',
                    borderLeft: '3px solid #f59e0b',
                    color: '#92400e',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  💡 Có cuốc không chạy được thì chia sẻ cho anh em, đừng để lãng phí cơ hội!
                </div>
              </div>

              {/* Mục 3 */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🔎</span>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>3. Khi anh em cần tìm cuốc xe</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <li>Thường xuyên kiểm tra danh sách cuốc được chia sẻ trên app.</li>
                  <li>Chọn những cuốc phù hợp với tuyến đường, thời gian và khả năng phục vụ của mình.</li>
                  <li>Chủ động liên hệ theo thông tin được cung cấp để trao đổi và xác nhận chuyến xe.</li>
                </ul>
              </div>

              {/* Mục 4 */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>🔔</span>
                  <strong style={{ fontSize: 14, color: '#0f172a' }}>4. Bật thông báo để không bỏ lỡ cuốc mới</strong>
                </div>
                <p style={{ margin: '0 0 6px 0' }}>
                  Anh em nên cho phép thông báo từ ứng dụng nếu thiết bị hỗ trợ, đồng thời kiểm tra cài đặt thông báo trên điện thoại.
                </p>
                <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>
                  Cuốc mới có thể được chia sẻ bất cứ lúc nào. Theo dõi sớm sẽ giúp anh em có thêm cơ hội tiếp cận cuốc phù hợp.
                </p>
              </div>

              {/* Mục 5 */}
              <div
                style={{
                  background: '#fffbeb',
                  borderRadius: 14,
                  padding: '14px',
                  border: '1px solid #fde68a',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <strong style={{ fontSize: 14, color: '#b45309' }}>5. Một số lưu ý quan trọng</strong>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5, color: '#78350f' }}>
                  <li><strong>Đây là ứng dụng chia sẻ cuốc giữa anh em tài xế</strong>, không phải ứng dụng taxi.</li>
                  <li>App không bảo đảm có cuốc liên tục mỗi ngày.</li>
                  <li>Số lượng cuốc phụ thuộc vào việc anh em chia sẻ và nhu cầu thực tế.</li>
                  <li>Trước khi nhận cuốc, hãy xác nhận rõ điểm đón, điểm trả, giá cước và các điều kiện liên quan với bên giao cuốc.</li>
                  <li>Chỉ nhận những chuyến phù hợp với lịch trình và khả năng của mình.</li>
                </ul>
              </div>

              {/* Lời chúc anh em */}
              <div
                style={{
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                  color: '#ffffff',
                  borderRadius: 14,
                  padding: '12px 14px',
                  fontWeight: 700,
                  fontSize: 12.5,
                  boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
                }}
              >
                🤝 Anh em có cuốc thì chia sẻ – anh em cần cuốc thì tìm. Cùng hỗ trợ nhau, cùng phát triển!
              </div>
            </div>

            {/* Footer Action */}
            <div
              style={{
                padding: '12px 18px 16px',
                background: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px',
                  fontSize: 14.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
              >
                ✓ Đã hiểu & Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
