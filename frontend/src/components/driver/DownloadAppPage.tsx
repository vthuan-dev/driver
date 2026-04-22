import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './DownloadAppPage.css';

type User = {
  _id: string;
  name: string;
  phone: string;
  carType: string;
  carYear: string;
  carImage?: string;
  status: 'pending' | 'approved' | 'rejected';
};

type DownloadAppPageProps = {
  user: User;
  onBack: () => void;
};

const DownloadAppPage: React.FC<DownloadAppPageProps> = ({ user, onBack }) => {
  const planId = localStorage.getItem('driver_app_plan');
  let amount = 400000;
  let planLabel = '1 năm';
  
  if (planId === '6m') { amount = 200000; planLabel = '6 tháng'; }

  const message = `Tai App ${user.phone}`;
  const qrCodeUrl = `https://img.vietqr.io/image/VPBank-0779966349-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(message)}&accountName=NGUYEN%20VAN%20CHI`;

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const baseUrl = apiUrl.replace('/api', '');
      window.location.href = `${baseUrl}/api/download/app`;
      
      // Ghi lại số lần tải
      const currentCount = parseInt(localStorage.getItem('apk_download_count') || '0', 10);
      localStorage.setItem('apk_download_count', (currentCount + 1).toString());

      setIsConfirming(false);
      onBack();
    }, 5000);
  };

  return (
    <AnimatePresence>
      <div className="modal" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
        <motion.div
          className="modal__backdrop"
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div 
          className="modal__panel download-modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <div className="download-header-modal">
            <h2>Tải Ứng Dụng</h2>
            <button className="modal__close" onClick={onBack} aria-label="Đóng" style={{ color: '#64748b', fontSize: '24px', top: '15px', right: '15px' }}>
              ×
            </button>
          </div>

          <div className="download-body-modal">
            <p className="greeting-text">Xin chào <strong>{user.name}</strong>, tài khoản của bạn đã được duyệt!</p>
            <p className="subtitle-text">Quét mã QR để cài đặt ứng dụng</p>

            <div className="qr-section">
              <div className="qr-wrapper">
                <img src={qrCodeUrl} alt="QR Code tải App" className="qr-image" />
                <div className="qr-scan-line"></div>
              </div>
              <div className="download-badges">
                <span className="badge android">Android APK</span>
              </div>
              <div className="payment-info" style={{ marginTop: '16px', background: '#eff6ff', padding: '12px', borderRadius: '12px', width: '100%', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>Số tiền đăng ký ({planLabel}):</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2563eb' }}>{amount.toLocaleString('vi-VN')}đ</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                  Nội dung CK: <strong style={{ color: '#0f172a' }}>{message}</strong>
                </div>
              </div>
            </div>

            <button 
              className="btn-download-primary" 
              onClick={handleConfirm}
              disabled={isConfirming}
              style={{ marginTop: '16px', opacity: isConfirming ? 0.7 : 1 }}
            >
              {isConfirming ? (
                <>
                  <span className="spinner" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  Đang kiểm tra giao dịch...
                </>
              ) : 'Tôi đã chuyển khoản'}
            </button>

            <div className="download-footer">
              <p className="guarantee-note">
                <span className="icon">🛡️</span>
                Không dùng app vẫn rút được tiền ký quỹ
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DownloadAppPage;
