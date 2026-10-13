import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankConfig?: {
    bankCode?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
  };
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  bankConfig = {},
}) => {
  const [withdrawRequested, setWithdrawRequested] = useState(false);
  const [withdrawCooldown, setWithdrawCooldown] = useState(0);

  // Check existing withdraw request from localStorage
  useEffect(() => {
    if (!isOpen) return;

    const savedRequest = localStorage.getItem('withdraw_requested');
    const savedExpiry = localStorage.getItem('withdraw_expiry');

    if (savedRequest === 'true' && savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      const now = Date.now();

      if (now < expiryTime) {
        setWithdrawRequested(true);
        const remainingSeconds = Math.ceil((expiryTime - now) / 1000);
        setWithdrawCooldown(remainingSeconds);
      } else {
        localStorage.removeItem('withdraw_requested');
        localStorage.removeItem('withdraw_expiry');
        setWithdrawRequested(false);
        setWithdrawCooldown(0);
      }
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (withdrawCooldown > 0) {
      timer = setInterval(() => {
        setWithdrawCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('withdraw_requested');
            localStorage.removeItem('withdraw_expiry');
            setWithdrawRequested(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [withdrawCooldown]);

  const qrImageUrl =
    bankConfig.bankCode && bankConfig.accountNo
      ? `https://img.vietqr.io/image/${bankConfig.bankCode}-${bankConfig.accountNo}-compact2.png?amount=200000&addInfo=Huy%20app%20hoan%20tien&accountName=${encodeURIComponent(
          bankConfig.accountName || 'TEST'
        )}`
      : `https://img.vietqr.io/image/VIB-092480168-compact2.png?amount=200000&addInfo=Huy%20app%20hoan%20tien&accountName=HOANG%20MANH%20DUY`;

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'QR-Rut-Tien.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR:', error);
      alert('Không thể tải QR code. Vui lòng chụp màn hình để quét.');
    }
  };

  const handleConfirmWithdraw = () => {
    const expiryTime = Date.now() + 60000;
    setWithdrawRequested(true);
    setWithdrawCooldown(60);
    localStorage.setItem('withdraw_requested', 'true');
    localStorage.setItem('withdraw_expiry', expiryTime.toString());
    alert('Đã ghi nhận yêu cầu rút tiền. Admin sẽ xử lý trong 24h.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 420,
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 20px 14px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                💳 Rút tiền ký quỹ
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              style={{
                padding: '16px 20px',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                flex: 1,
              }}
            >
              <p
                style={{
                  marginTop: 0,
                  marginBottom: 14,
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: '#334155',
                }}
              >
                Để rút tiền ký quỹ và huỷ tài khoản, vui lòng chuyển khoản <strong>200.000đ</strong> theo mã QR bên dưới. Admin sẽ hoàn trả tổng cộng <strong>400.000đ</strong> cho bạn trong vòng 24 giờ.
              </p>

              {/* QR Image */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <img
                  src={qrImageUrl}
                  alt="VietQR Rút tiền"
                  style={{
                    width: '100%',
                    maxWidth: 320,
                    borderRadius: 14,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />

                <button
                  type="button"
                  onClick={handleDownloadQR}
                  style={{
                    background: '#ffffff',
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: '8px 18px',
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <span>📥</span>
                  <span>Tải xuống mã QR</span>
                </button>
              </div>

              {/* Note memo */}
              <div
                style={{
                  marginTop: 14,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13.5,
                  color: '#334155',
                  textAlign: 'center',
                }}
              >
                Nội dung chuyển khoản:{' '}
                <strong style={{ color: '#dc2626' }}>Huy app hoan tien</strong>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18, marginBottom: 8 }}>
                <button
                  type="button"
                  disabled={withdrawRequested}
                  onClick={handleConfirmWithdraw}
                  style={{
                    flex: 1,
                    background: withdrawRequested ? '#94a3b8' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '13px 16px',
                    fontSize: 14.5,
                    fontWeight: 700,
                    cursor: withdrawRequested ? 'not-allowed' : 'pointer',
                    opacity: withdrawRequested ? 0.75 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {withdrawRequested
                    ? `Đang chờ duyệt... (${withdrawCooldown}s)`
                    : 'Tôi đã chuyển 200k - Tiếp tục'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: 12,
                    padding: '13px 18px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;
