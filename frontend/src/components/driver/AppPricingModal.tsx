import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppTourCard, TourCurvedArrow } from './AppTourGuide';

export type Plan = {
  id: string;
  label: string;
  months: number;
  price: number;
  badge: string | null;
  description: string;
};

const PLANS: Plan[] = [
  { id: '1y', label: '1 năm', months: 12, price: 400000, badge: 'PHỔ BIẾN ★', description: 'Tiết kiệm nhất cho lâu dài' },
  { id: 'lifetime', label: 'Dùng vĩnh viễn', months: 9999, price: 1000000, badge: 'TỐT NHẤT 👑', description: 'Một lần – dùng mãi mãi' },
];

type AppPricingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan) => void;
  isTourStep2?: boolean;
  onTourClose?: () => void;
  onTourNext?: () => void;
};

const AppPricingModal: React.FC<AppPricingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isTourStep2,
  onTourClose,
  onTourNext,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1y');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const plan = PLANS.find((p) => p.id === selectedPlanId);
    if (plan) {
      onConfirm(plan);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
          <motion.div
            className="modal__backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="modal__panel pricing-modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ maxWidth: '480px', width: '92%', padding: 0, overflow: 'hidden' }}
          >
            {/* Header matching Image 1 */}
            <div className="pricing-header">
              <h2 className="pricing-title">Chọn gói duy trì App</h2>
              <p className="pricing-subtitle">
                Để tiếp tục tải và sử dụng ứng dụng tài xế, vui lòng chọn gói phù hợp
              </p>
            </div>

            <div className="pricing-body">
              {/* Tour Step 2 Tooltip Overlay matching Image 1 */}
              {isTourStep2 && (
                <div className="tour-step2-wrapper">
                  <AppTourCard
                    title="Nhấn vào đây để chọn gói"
                    description={
                      <>
                        Chọn gói 1 năm – 400.000đ hoặc Dùng vĩnh viễn – 1.000.000đ. Xác nhận thanh toán là{' '}
                        <span className="tour-highlight-red">nhận link tải APK ngay!</span>
                      </>
                    }
                    buttonText="Tiếp theo (1/2) ›"
                    onNext={onTourNext || onClose}
                    onClose={onTourClose || onClose}
                  />
                  <div className="tour-arrow-step2">
                    <TourCurvedArrow />
                  </div>
                </div>
              )}

              <div id="joyride-pricing-cards" className="pricing-cards">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    id={`pricing-card-${plan.id}`}
                    className={`pricing-card ${selectedPlanId === plan.id ? 'selected' : ''} ${
                      isTourStep2 && plan.id === '1y' ? 'tour-highlight-glow' : ''
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {plan.badge && (
                      <div
                        className={`pricing-badge ${
                          plan.id === 'lifetime' ? 'pricing-badge--lifetime' : ''
                        }`}
                      >
                        {plan.badge}
                      </div>
                    )}
                    <div className="pricing-card-content">
                      <div className="pricing-radio">
                        <div className={`radio-inner ${selectedPlanId === plan.id ? 'active' : ''}`} />
                      </div>
                      <div className="pricing-info">
                        <div className="pricing-label">{plan.label}</div>
                        <div className="pricing-desc">{plan.description}</div>
                      </div>
                      <div className="pricing-price">{plan.price.toLocaleString('vi-VN')}đ</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note box matching Image 1 */}
              <div className="pricing-note">
                <span className="note-icon">💡</span>
                <p>
                  <strong>Lưu ý:</strong> Dù không sử dụng app nữa, bạn vẫn sẽ rút được tiền ký quỹ bất kỳ lúc nào.
                </p>
              </div>
            </div>

            {/* Footer matching Image 1 */}
            <div className="pricing-footer">
              <button type="button" className="pricing-btn-cancel" onClick={onClose}>
                Để sau
              </button>
              <button type="button" className="pricing-btn-confirm" onClick={handleConfirm}>
                Xác nhận thanh toán
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppPricingModal;
