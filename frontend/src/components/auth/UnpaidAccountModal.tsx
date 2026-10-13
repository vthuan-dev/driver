import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnpaidAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankConfig?: {
    bankCode?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
  };
  onPaymentSuccess?: () => void;
}

export const UnpaidAccountModal: React.FC<UnpaidAccountModalProps> = ({
  isOpen,
  onClose,
  bankConfig = {},
  onPaymentSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankCode = bankConfig.bankCode || 'VIB';
  const accountNo = bankConfig.accountNo || '092480168';
  const accountName = bankConfig.accountName || 'HOANG MANH DUY';
  const amount = '200.000đ';
  const memo = 'Phi tham gia nhom';

  const qrImageUrl =
    bankConfig.bankCode && bankConfig.accountNo
      ? `https://img.vietqr.io/image/${bankConfig.bankCode}-${bankConfig.accountNo}-compact2.png?amount=200000&addInfo=Phi%20tham%20gia%20nhom&accountName=${encodeURIComponent(
          bankConfig.accountName || 'TEST'
        )}`
      : `https://img.vietqr.io/image/VIB-092480168-compact2.png?amount=200000&addInfo=Phi%20tham%20gia%20nhom&accountName=HOANG%20MANH%20DUY`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
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

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 410,
              maxHeight: '92vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              background: '#ffffff',
              borderRadius: 28,
              padding: '24px 20px 28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              boxSizing: 'border-box',
              zIndex: 1,
            }}
          >
            {/* Close Button Top Right */}
            <button
              onClick={onClose}
              aria-label="Đóng"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#f1f5f9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155',
                fontSize: 18,
                fontWeight: 600,
                zIndex: 2,
              }}
            >
              ✕
            </button>

            {/* Illustration: Unpaid Account (Ảnh 3) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
                marginTop: 4,
              }}
            >
              <svg
                width="220"
                height="175"
                viewBox="0 0 240 190"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: 'visible', maxWidth: '100%' }}
              >
                {/* Background Ambient Glow */}
                <ellipse cx="120" cy="100" rx="95" ry="68" fill="#ffe4e6" fillOpacity="0.75" />
                <circle cx="56" cy="55" r="3.5" fill="#fca5a5" />
                {/* Sparkles */}
                <path d="M 58 48 Q 58 54 52 54 Q 58 54 58 60 Q 58 54 64 54 Q 58 54 58 48" fill="#f87171" />
                <path d="M 186 42 Q 186 47 181 47 Q 186 47 186 52 Q 186 47 191 47 Q 186 47 186 42" fill="#f87171" />

                {/* Back Paper */}
                <rect x="66" y="44" width="70" height="95" rx="8" fill="#e2e8f0" transform="rotate(-6 66 44)" />
                <rect x="68" y="42" width="70" height="95" rx="8" fill="#f8fafc" transform="rotate(-6 68 42)" />

                {/* Clipboard Base */}
                <rect x="80" y="32" width="84" height="118" rx="14" fill="#b91c1c" />
                <rect x="82" y="34" width="80" height="114" rx="12" fill="#ef4444" />

                {/* Document Sheet */}
                <rect x="87" y="44" width="70" height="98" rx="8" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />

                {/* Top Clip on Board */}
                <rect x="104" y="24" width="36" height="18" rx="6" fill="#991b1b" />
                <rect x="107" y="26" width="30" height="14" rx="4" fill="#dc2626" />
                <circle cx="122" cy="30" r="3" fill="#fee2e2" />

                {/* Red Circular Badge with X in Center */}
                <circle cx="122" cy="74" r="17" fill="#b91c1c" />
                <circle cx="122" cy="74" r="15" fill="#ef4444" />
                {/* White X */}
                <path
                  d="M 116 68 L 128 80 M 128 68 L 116 80"
                  stroke="#ffffff"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Placeholder Lines on Document */}
                <rect x="103" y="100" width="38" height="4.5" rx="2.2" fill="#f1f5f9" />
                <rect x="99" y="109" width="46" height="4.5" rx="2.2" fill="#f8fafc" />
                <rect x="105" y="118" width="34" height="4.5" rx="2.2" fill="#f1f5f9" />

                {/* Dynamic Red Rays on Right */}
                <g transform="translate(156, 52)">
                  <path d="M 4 18 L 16 7" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 8 26 L 20 22" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 0 10 L 8 2" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Stack of Golden Coins at Bottom-Left */}
                <g transform="translate(62, 98)">
                  <g transform="translate(0, 22)">
                    <ellipse cx="20" cy="8" rx="16" ry="6" fill="#b45309" />
                    <rect x="4" y="4" width="32" height="6" fill="#d97706" />
                    <ellipse cx="20" cy="4" rx="16" ry="6" fill="#f59e0b" />
                    <ellipse cx="20" cy="4" rx="13" ry="4.5" fill="#fbbf24" />
                  </g>
                  <g transform="translate(0, 11)">
                    <ellipse cx="20" cy="8" rx="16" ry="6" fill="#b45309" />
                    <rect x="4" y="4" width="32" height="6" fill="#d97706" />
                    <ellipse cx="20" cy="4" rx="16" ry="6" fill="#f59e0b" />
                    <ellipse cx="20" cy="4" rx="13" ry="4.5" fill="#fbbf24" />
                  </g>
                  <g transform="translate(0, 0)">
                    <ellipse cx="20" cy="8" rx="16" ry="6" fill="#b45309" />
                    <rect x="4" y="4" width="32" height="6" fill="#d97706" />
                    <ellipse cx="20" cy="4" rx="16" ry="6" fill="#f59e0b" />
                    <ellipse cx="20" cy="4" rx="13" ry="4.5" fill="#fbbf24" />
                  </g>
                  <g transform="translate(18, 12)">
                    <ellipse cx="14" cy="7" rx="13" ry="5.5" fill="#b45309" />
                    <rect x="1" y="3" width="26" height="5" fill="#d97706" />
                    <ellipse cx="14" cy="3" rx="13" ry="5.5" fill="#f59e0b" />
                    <ellipse cx="14" cy="3" rx="10.5" ry="4" fill="#fde047" />
                  </g>
                </g>
              </svg>
            </div>

            {/* Title: Tài khoản của bạn chưa đóng phí */}
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: 21,
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.35,
                letterSpacing: '-0.3px',
              }}
            >
              Tài khoản của bạn<br />
              <span style={{ color: '#dc2626', fontWeight: 800 }}>chưa đóng phí</span>
            </h2>

            {/* Description Text */}
            <p
              style={{
                margin: '0 0 16px',
                fontSize: 14.5,
                color: '#475569',
                lineHeight: 1.5,
                fontWeight: 500,
                padding: '0 4px',
              }}
            >
              Bạn vui lòng{' '}
              <span style={{ color: '#1e293b', fontWeight: 600 }}>
                hoàn tất đóng phí thành viên
              </span>{' '}
              để được admin duyệt và kích hoạt tài khoản nhé!
            </p>

            {/* ── QR PAYMENT SECTION ── */}
            <div
              style={{
                background: '#fafafa',
                border: '1px solid #f1f5f9',
                borderRadius: 18,
                padding: '14px 12px',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                Quét mã QR để chuyển khoản 200.000đ
              </div>

              {/* VietQR Image */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <img
                  src={qrImageUrl}
                  alt="VietQR Đóng phí thành viên"
                  style={{
                    width: '100%',
                    maxWidth: 290,
                    borderRadius: 14,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  }}
                />
              </div>

              {/* Bank Details */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '10px 12px',
                  fontSize: 13,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                  <strong style={{ color: '#0f172a' }}>{bankCode}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ color: '#0f172a', letterSpacing: 0.5 }}>{accountNo}</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(accountNo, 'accountNo')}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: 6,
                        padding: '2px 6px',
                        fontSize: 11,
                        cursor: 'pointer',
                        color: copiedField === 'accountNo' ? '#16a34a' : '#475569',
                        fontWeight: 600,
                      }}
                    >
                      {copiedField === 'accountNo' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                  <strong style={{ color: '#0f172a' }}>{accountName}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Số tiền:</span>
                  <strong style={{ color: '#dc2626', fontSize: 14 }}>{amount}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b' }}>Nội dung:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ color: '#dc2626' }}>{memo}</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(memo, 'memo')}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: 6,
                        padding: '2px 6px',
                        fontSize: 11,
                        cursor: 'pointer',
                        color: copiedField === 'memo' ? '#16a34a' : '#475569',
                        fontWeight: 600,
                      }}
                    >
                      {copiedField === 'memo' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Alert box */}
              <div
                style={{
                  marginTop: 10,
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: 10,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    minWidth: 18,
                    borderRadius: '50%',
                    background: '#dc2626',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  !
                </div>
                <div style={{ color: '#b91c1c', fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>
                  Vui lòng hoàn tất chuyển khoản để tiếp tục kích hoạt tài khoản.
                </div>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="button"
              onClick={() => {
                if (onPaymentSuccess) {
                  onPaymentSuccess();
                } else {
                  onClose();
                }
              }}
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '14px 16px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              Tôi đã chuyển 200k - Tiếp tục
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UnpaidAccountModal;
