import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { driverAPI } from '../../services/api';
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
  plan?: string;
  onBack: () => void;
  onDownloaded?: (plan: string) => void;
};

const SECRET_PASS = '838668';

const DownloadAppPage: React.FC<DownloadAppPageProps> = ({ user, plan = '1y', onBack, onDownloaded }) => {
  let amount = 400000;
  let planLabel = '1 năm';
  if (plan === '6m') { amount = 200000; planLabel = '6 tháng'; }

  const message = `Tai App ${user.phone}`;
  const qrCodeUrl = `https://img.vietqr.io/image/VPBank-0779966349-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(message)}&accountName=NGUYEN%20VAN%20CHI`;

  // Step: 'qr' | 'showpass' | 'enterpass'
  const [step, setStep] = useState<'qr' | 'showpass' | 'enterpass'>('qr');
  const [countdown, setCountdown] = useState(10);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadCountdown, setDownloadCountdown] = useState(3);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const downloadRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown for showpass step (10s)
  useEffect(() => {
    if (step === 'showpass') {
      setCountdown(10);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setStep('enterpass');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step]);

  // Countdown 3s before auto download
  useEffect(() => {
    if (downloading) {
      setDownloadCountdown(3);
      downloadRef.current = setInterval(() => {
        setDownloadCountdown(prev => {
          if (prev <= 1) {
            clearInterval(downloadRef.current!);
            triggerDownload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (downloadRef.current) clearInterval(downloadRef.current);
    };
  }, [downloading]);

  const triggerDownload = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    window.location.href = `${baseUrl}/api/download/app`;

    try {
      await driverAPI.recordDownload(plan);
      if (onDownloaded) onDownloaded(plan);
    } catch (err) {
      console.error('Failed to record download:', err);
    }

    setTimeout(() => onBack(), 1000);
  };

  const handleConfirmPayment = () => {
    setStep('enterpass');
  };

  const handlePassSubmit = () => {
    if (passInput === SECRET_PASS) {
      setPassError('');
      setDownloading(true);
    } else {
      setPassError('Mật khẩu không đúng. Vui lòng thử lại!');
      setPassInput('');
    }
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

        {/* STEP 1: QR + Payment */}
        {step === 'qr' && (
          <motion.div
            className="modal__panel download-modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <div className="download-header-modal">
              <h2>Tải Ứng Dụng</h2>
              <button className="modal__close" onClick={onBack} aria-label="Đóng" style={{ color: '#64748b', fontSize: '24px', top: '15px', right: '15px' }}>×</button>
            </div>
            <div className="download-body-modal">
              <p className="greeting-text">Xin chào <strong>{user.name}</strong>, tài khoản của bạn đã được duyệt!</p>
              <p className="subtitle-text">Quét mã QR để thanh toán và cài đặt ứng dụng</p>
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
                onClick={handleConfirmPayment}
                style={{ marginTop: '16px' }}
              >
                Tôi đã chuyển khoản
              </button>
              <div className="download-footer">
                <p className="guarantee-note">
                  <span className="icon">🛡️</span>
                  Không dùng app vẫn rút được tiền ký quỹ
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Show password for 10s */}
        {step === 'showpass' && (
          <motion.div
            className="modal__panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ maxWidth: '360px', width: '90%', padding: '32px 24px', textAlign: 'center', borderRadius: '20px' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
              Mật khẩu tải ứng dụng
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Ghi nhớ mật khẩu này, sẽ tự ẩn sau <strong style={{ color: '#e74c3c' }}>{countdown}s</strong>
            </p>

            {/* Password display */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '8px', color: 'white', fontFamily: 'monospace' }}>
                {SECRET_PASS}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                Mật khẩu xác nhận tải app
              </div>
            </div>

            {/* Countdown ring */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: countdown > 5 ? '#22c55e' : '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: '16px',
                transition: 'background 0.3s'
              }}>
                {countdown}
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>giây còn lại</span>
            </div>

            <button
              onClick={() => {
                if (countdownRef.current) clearInterval(countdownRef.current);
                setStep('enterpass');
              }}
              style={{
                background: '#1e293b', color: 'white', border: 'none',
                borderRadius: '12px', padding: '12px 24px', fontSize: '14px',
                fontWeight: 600, cursor: 'pointer', width: '100%'
              }}
            >
              Đã nhớ, tiếp tục →
            </button>
          </motion.div>
        )}

        {/* STEP 3: Enter password */}
        {step === 'enterpass' && (
          <motion.div
            className="modal__panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ maxWidth: '360px', width: '90%', padding: '32px 24px', textAlign: 'center', borderRadius: '20px' }}
          >
            {!downloading ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔑</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                  Nhập mật khẩu để tải
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                  Nhập mật khẩu admin cung cấp để tải app
                </p>

                <input
                  type="password"
                  value={passInput}
                  onChange={(e) => {
                    setPassInput(e.target.value);
                    setPassError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handlePassSubmit()}
                  placeholder="Nhập mật khẩu..."
                  autoFocus
                  style={{
                    width: '100%', padding: '14px 16px', fontSize: '18px',
                    border: passError ? '2px solid #ef4444' : '2px solid #e2e8f0',
                    borderRadius: '12px', textAlign: 'center', letterSpacing: '4px',
                    outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
                    fontFamily: 'monospace'
                  }}
                />

                {passError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}
                  >
                    ❌ {passError}
                  </motion.p>
                )}

                <button
                  onClick={handlePassSubmit}
                  disabled={!passInput}
                  style={{
                    background: passInput ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e2e8f0',
                    color: passInput ? 'white' : '#94a3b8',
                    border: 'none', borderRadius: '12px', padding: '14px',
                    fontSize: '15px', fontWeight: 700, cursor: passInput ? 'pointer' : 'not-allowed',
                    width: '100%', transition: 'all 0.2s'
                  }}
                >
                  Xác nhận & Tải xuống
                </button>

                <button
                  onClick={onBack}
                  style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    fontSize: '13px', marginTop: '12px', cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e', marginBottom: '8px' }}>
                  Xác nhận thành công!
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                  Tải xuống sẽ bắt đầu sau <strong style={{ color: '#2563eb', fontSize: '20px' }}>{downloadCountdown}</strong> giây...
                </p>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  border: '4px solid #e2e8f0', borderTopColor: '#2563eb',
                  animation: 'spin 1s linear infinite', margin: '0 auto'
                }} />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default DownloadAppPage;
