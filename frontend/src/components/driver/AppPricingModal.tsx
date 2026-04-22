import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Plan = {
  id: string;
  label: string;
  months: number;
  price: number;
  badge: string | null;
  description: string;
};

const PLANS: Plan[] = [
  { id: '6m', label: '6 tháng', months: 6, price: 200000, badge: null, description: 'Gói cơ bản' },
  { id: '1y', label: '1 năm', months: 12, price: 400000, badge: 'Tiết kiệm ⭐', description: 'Tiết kiệm nhất cho lâu dài' },
];

type AppPricingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (plan: Plan) => void;
};

const AppPricingModal: React.FC<AppPricingModalProps> = ({ isOpen, onClose, onConfirm }) => {
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
            style={{ maxWidth: '500px', width: '90%', padding: 0, overflow: 'hidden' }}
          >
            <div className="pricing-header">
              <h2 className="pricing-title">Chọn gói duy trì App</h2>
              <p className="pricing-subtitle">Để tiếp tục tải và sử dụng ứng dụng tài xế, vui lòng chọn gói phù hợp</p>
              <button className="modal__close" onClick={onClose} aria-label="Đóng" style={{ color: 'white' }}>
                ×
              </button>
            </div>

            <div className="pricing-body">
              <div className="pricing-cards">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`pricing-card ${selectedPlanId === plan.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
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

              <div className="pricing-note">
                <span className="note-icon">💡</span>
                <p>
                  <strong>Lưu ý:</strong> Dù không sử dụng app nữa, bạn vẫn sẽ rút được tiền ký quỹ bất kỳ lúc nào.
                </p>
              </div>
            </div>

            <div className="pricing-footer">
              <button className="pricing-btn-cancel" onClick={onClose}>
                Để sau
              </button>
              <button className="pricing-btn-confirm" onClick={handleConfirm}>
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
