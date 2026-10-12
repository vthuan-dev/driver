import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({
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

            {/* Illustration: Pending Approval (Ảnh 2) */}
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
                <ellipse cx="120" cy="100" rx="95" ry="68" fill="#dcfce7" fillOpacity="0.75" />
                <circle cx="50" cy="55" r="3.5" fill="#86efac" />
                <circle cx="195" cy="140" r="3" fill="#86efac" />
                {/* Sparkles */}
                <path d="M 52 48 Q 52 54 46 54 Q 52 54 52 60 Q 52 54 58 54 Q 52 54 52 48" fill="#4ade80" />
                <path d="M 188 42 Q 188 47 183 47 Q 188 47 188 52 Q 188 47 193 47 Q 188 47 188 42" fill="#4ade80" />

                {/* Back Paper */}
                <rect x="62" y="44" width="70" height="95" rx="8" fill="#e2e8f0" transform="rotate(-6 62 44)" />
                <rect x="64" y="42" width="70" height="95" rx="8" fill="#f8fafc" transform="rotate(-6 64 42)" />

                {/* Clipboard Base */}
                <rect x="80" y="32" width="84" height="118" rx="14" fill="#15803d" />
                <rect x="82" y="34" width="80" height="114" rx="12" fill="#22c55e" />

                {/* Document Sheet */}
                <rect x="87" y="44" width="70" height="98" rx="8" fill="#ffffff" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))" />

                {/* Top Clip on Board */}
                <rect x="104" y="24" width="36" height="18" rx="6" fill="#166534" />
                <rect x="107" y="26" width="30" height="14" rx="4" fill="#15803d" />
                <circle cx="122" cy="30" r="3" fill="#dcfce7" />

                {/* Avatar circle in upper center */}
                <circle cx="122" cy="62" r="14" fill="#15803d" />
                {/* Avatar head & body */}
                <circle cx="122" cy="58" r="4.5" fill="#ffffff" />
                <path d="M 113.5 70 C 113.5 65.5 117.2 64.5 122 64.5 C 126.8 64.5 130.5 65.5 130.5 70 Z" fill="#ffffff" />

                {/* Checklist items */}
                {/* Row 1 */}
                <rect x="96" y="82" width="10" height="10" rx="3" fill="#22c55e" />
                <path d="M 98.5 87 L 100.5 89 L 104 84.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <rect x="110" y="85" width="38" height="4" rx="2" fill="#e2e8f0" />

                {/* Row 2 */}
                <rect x="96" y="97" width="10" height="10" rx="3" fill="#22c55e" />
                <path d="M 98.5 102 L 100.5 104 L 104 99.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <rect x="110" y="100" width="32" height="4" rx="2" fill="#e2e8f0" />

                {/* Row 3 */}
                <rect x="96" y="112" width="10" height="10" rx="3" fill="#22c55e" />
                <path d="M 98.5 117 L 100.5 119 L 104 114.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <rect x="110" y="115" width="26" height="4" rx="2" fill="#e2e8f0" />

                {/* Clock on Right */}
                <g transform="translate(156, 48)">
                  <circle cx="16" cy="16" r="16" fill="#15803d" />
                  <circle cx="16" cy="16" r="14" fill="#22c55e" />
                  <circle cx="16" cy="16" r="11" fill="#ecfdf5" />
                  {/* Clock ticks */}
                  <circle cx="16" cy="7" r="1" fill="#15803d" />
                  <circle cx="25" cy="16" r="1" fill="#15803d" />
                  <circle cx="16" cy="25" r="1" fill="#15803d" />
                  <circle cx="7" cy="16" r="1" fill="#15803d" />
                  {/* Clock hands pointing ~ 10:10 */}
                  <line x1="16" y1="16" x2="11.5" y2="10.5" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="16" x2="21.5" y2="13.5" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="16" cy="16" r="2" fill="#15803d" />
                </g>

                {/* Magnifying Glass Floating */}
                <g transform="translate(126, 92)">
                  {/* Handle */}
                  <rect x="26" y="26" width="7" height="18" rx="3.5" fill="#166534" transform="rotate(-45 26 26)" />
                  <rect x="25" y="27" width="5" height="16" rx="2.5" fill="#15803d" transform="rotate(-45 25 27)" />
                  {/* Outer Rim */}
                  <circle cx="17" cy="17" r="17" fill="#15803d" />
                  <circle cx="17" cy="17" r="14.5" fill="#22c55e" />
                  {/* Lens */}
                  <circle cx="17" cy="17" r="11" fill="#dcfce7" fillOpacity="0.85" />
                  {/* Glass highlight */}
                  <path d="M 10 13 A 8 8 0 0 1 20 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </g>
              </svg>
            </div>

            {/* Title: Tài khoản của bạn đang được admin duyệt */}
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
              <span style={{ color: '#16a34a', fontWeight: 800 }}>đang được admin duyệt</span>
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
              <strong style={{ color: '#16a34a', fontWeight: 700 }}>
                gửi bill chuyển khoản thành công
              </strong>{' '}
              cho admin để được xác nhận và kích hoạt tài khoản sớm nhất nhé!
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PendingApprovalModal;
