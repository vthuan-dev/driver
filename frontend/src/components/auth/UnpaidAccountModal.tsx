import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UnpaidAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnpaidAccountModal: React.FC<UnpaidAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
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
              maxWidth: 390,
              background: '#ffffff',
              borderRadius: 28,
              padding: '28px 22px 34px',
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
                top: 16,
                right: 16,
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
                transition: 'background 0.2s',
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
                marginBottom: 16,
                marginTop: 6,
              }}
            >
              <svg
                width="240"
                height="190"
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
                  {/* Coin 1 (Bottom) */}
                  <g transform="translate(0, 22)">
                    <ellipse cx="20" cy="8" rx="16" ry="6" fill="#b45309" />
                    <rect x="4" y="4" width="32" height="6" fill="#d97706" />
                    <ellipse cx="20" cy="4" rx="16" ry="6" fill="#f59e0b" />
                    <ellipse cx="20" cy="4" rx="13" ry="4.5" fill="#fbbf24" />
                    <path d="M 18 4 L 22 4 M 20 2 L 20 6" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
                  </g>

                  {/* Coin 2 (Middle) */}
                  <g transform="translate(0, 11)">
                    <ellipse cx="20" cy="8" rx="16" ry="6" fill="#b45309" />
                    <rect x="4" y="4" width="32" height="6" fill="#d97706" />
                    <ellipse cx="20" cy="4" rx="16" ry="6" fill="#f59e0b" />
                    <ellipse cx="20" cy="4" rx="13" ry="4.5" fill="#fbbf24" />
                    <path d="M 18 4 L 22 4 M 20 2 L 20 6" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
                  </g>

                  {/* Coin 3 (Top Left) */}
                  <g transform="translate(0, 0)">
                    <ellipse cx="20" cy="8" rx="16" ry="6" fill="#b45309" />
                    <rect x="4" y="4" width="32" height="6" fill="#d97706" />
                    <ellipse cx="20" cy="4" rx="16" ry="6" fill="#f59e0b" />
                    <ellipse cx="20" cy="4" rx="13" ry="4.5" fill="#fbbf24" />
                    <path d="M 18 4 L 22 4 M 20 2 L 20 6" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
                  </g>

                  {/* Coin 4 (Front Right slight overlap) */}
                  <g transform="translate(18, 12)">
                    <ellipse cx="14" cy="7" rx="13" ry="5.5" fill="#b45309" />
                    <rect x="1" y="3" width="26" height="5" fill="#d97706" />
                    <ellipse cx="14" cy="3" rx="13" ry="5.5" fill="#f59e0b" />
                    <ellipse cx="14" cy="3" rx="10.5" ry="4" fill="#fde047" />
                    <path d="M 12 3 L 16 3 M 14 1.5 L 14 4.5" stroke="#d97706" strokeWidth="1" strokeLinecap="round" />
                  </g>
                </g>
              </svg>
            </div>

            {/* Title: Tài khoản của bạn chưa đóng phí */}
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: 22,
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
                margin: 0,
                fontSize: 15,
                color: '#475569',
                lineHeight: 1.55,
                fontWeight: 500,
                padding: '0 6px',
              }}
            >
              Bạn vui lòng{' '}
              <span style={{ color: '#1e293b', fontWeight: 600 }}>
                hoàn tất đóng phí thành viên
              </span>{' '}
              để được admin duyệt và kích hoạt tài khoản nhé!
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UnpaidAccountModal;
