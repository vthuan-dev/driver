import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { driverAPI } from '../../services/api';
import AppPricingModal from './AppPricingModal';
import DownloadAppPage from './DownloadAppPage';
import './DriverDashboard.css';

type User = {
  _id: string;
  name: string;
  phone: string;
  carType: string;
  carYear: string;
  carImage?: string;
  status: 'pending' | 'approved' | 'rejected';
};

type DriverDashboardProps = {
  user: User;
  onLogout: () => void;
  onBack?: () => void;
};

const DriverDashboard = ({ user, onLogout, onBack }: DriverDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'home' | 'activity' | 'notifications' | 'account'>('home');
  const [isOnline, setIsOnline] = useState(false);
  const [balance, setBalance] = useState(200000);
  const [monthlyTrips, setMonthlyTrips] = useState(0);
  const [totalTrips, setTotalTrips] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Initialize withdraw state from localStorage
  const [withdrawRequested, setWithdrawRequested] = useState(() => {
    const saved = localStorage.getItem('withdraw_requested');
    return saved === 'true';
  });
  
  const [withdrawCooldown, setWithdrawCooldown] = useState(() => {
    const savedExpiry = localStorage.getItem('withdraw_expiry');
    if (savedExpiry) {
      const expiryTime = parseInt(savedExpiry, 10);
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
      return remainingSeconds;
    }
    return 0;
  });

  // Add states for App Pricing and Download Modal
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showDownloadPage, setShowDownloadPage] = useState(false);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(() => !!localStorage.getItem('driver_app_plan'));

  // Fetch driver stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await driverAPI.getStats();
        const { balance, monthlyTrips, totalTrips } = response.data;
        
        setBalance(balance);
        setMonthlyTrips(monthlyTrips);
        setTotalTrips(totalTrips);
      } catch (error) {
        console.error('Error fetching driver stats:', error);
        // Keep default values if error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Countdown timer for withdraw cooldown
  useEffect(() => {
    if (withdrawCooldown > 0) {
      const timer = setTimeout(() => {
        setWithdrawCooldown(withdrawCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (withdrawCooldown === 0 && withdrawRequested) {
      // Clear localStorage when cooldown expires
      setWithdrawRequested(false);
      localStorage.removeItem('withdraw_requested');
      localStorage.removeItem('withdraw_expiry');
    }
  }, [withdrawCooldown, withdrawRequested]);

  return (
    <div className="driver-dashboard">
      {/* Back button */}
      {onBack && (
        <button className="back-button" onClick={onBack}>
          ← Quay lại trang chủ
        </button>
      )}
      
      {/* Main Content */}
      <div className="driver-content">
        {activeTab === 'home' && (
          <motion.div 
            className="home-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >


            {/* Balance Card */}
            <div className="balance-card">
              <div className="balance-header">
                <div>
                  <h3>Số dư hiện tại</h3>
                  <p className="balance-subtitle">Số ký quỹ trừ đi các cuốc xe đã hoàn thành</p>
                </div>
              </div>
              <div className="balance-amount">
                {loading ? '...' : balance.toLocaleString('vi-VN')} đ
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button className="action-btn" onClick={() => setShowWithdrawModal(true)}>
                <span>Rút tiền</span>
                <span className="arrow">›</span>
              </button>
              <button 
                className="action-btn action-btn--download" 
                onClick={() => {
                  const downloadCount = parseInt(localStorage.getItem('apk_download_count') || '0', 10);
                  if (downloadCount > 0) {
                    setErrorMessage('Bạn đã tải ứng dụng rồi. Nếu cần tải lại, vui lòng liên hệ Admin!');
                    setShowErrorPopup(true);
                    return;
                  }

                  if (hasSelectedPlan) {
                    setShowDownloadPage(true);
                  } else {
                    setShowPricingModal(true);
                  }
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>📱</span>
                  <span>Tải ứng dụng di động</span>
                </span>
                <span className="download-badge">APK</span>
              </button>
            </div>

            {/* Stats Card */}
            <div className="stats-section">
              <h3>Thống kê cuốc xe</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">🛵</div>
                  <div className="stat-label">Cuốc xe hoàn thành/tháng</div>
                  <div className="stat-value">{loading ? '...' : monthlyTrips}</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-icon stat-icon--success">✓</div>
                  <div className="stat-label">Tổng cuốc xe hoàn thành</div>
                  <div className="stat-value">{loading ? '...' : totalTrips}</div>
                </div>
              </div>
            </div>

            {/* Service Toggle */}
            <div className="service-toggle">
              <span className="toggle-label">Bật/Tắt nhận dịch vụ cuốc xe</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isOnline}
                  onChange={(e) => setIsOnline(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div 
            className="activity-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Hoạt động</h2>
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Chưa có hoạt động nào</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div 
            className="notifications-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Thông báo</h2>
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <p>Chưa có thông báo nào</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'account' && (
          <motion.div 
            className="account-tab"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>Tài khoản</h2>
            <div className="account-info">
              <div className="account-avatar">
                {user.carImage ? (
                  <img src={user.carImage} alt="Car" />
                ) : (
                  <div className="avatar-placeholder">🚗</div>
                )}
              </div>
              <div className="account-details">
                <h3>{user.name}</h3>
                <p>{user.phone}</p>
                <p className="car-info">{user.carType} - {user.carYear}</p>
                <span className="status-badge approved">Đã phê duyệt</span>
              </div>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              🚪 Đăng xuất
            </button>
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Trang chủ</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-label">Hoạt động</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="nav-icon">🔔</span>
          <span className="nav-label">Thông báo</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Tài khoản</span>
        </button>
      </nav>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="modal" role="dialog" aria-modal="true">
            <motion.div 
              className="modal__backdrop" 
              onClick={() => setShowWithdrawModal(false)} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
            />
            <motion.div 
              className="modal__panel" 
              initial={{ opacity: 0, y: 40 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="modal__header">
                <div className="modal__title">Rút tiền ký quỹ</div>
                <button 
                  className="modal__close" 
                  onClick={() => setShowWithdrawModal(false)} 
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
              <div style={{ padding: '8px 16px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 60px)', WebkitOverflowScrolling: 'touch' }}>
                <p style={{ marginTop: 0, fontSize: 15, lineHeight: 1.6, color: '#374151' }}>
                  Để rút tiền ký quỹ và huỷ tài khoản, vui lòng chuyển khoản 200.000đ theo QR bên dưới. Admin sẽ hoàn trả tổng cộng 400.000đ cho bạn trong vòng 24 giờ.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <img
                    id="qr-code-image"
                    src={`https://img.vietqr.io/image/VPBank-0779966349-compact2.png?amount=200000&addInfo=Huy%20app%20hoan%20tien&accountName=NGUYEN%20VAN%20CHI`}
                    alt="VietQR VIB 081409781"
                    style={{ width: '100%', maxWidth: 360, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,.08)' }}
                  />
                  <button
                    onClick={async () => {
                      try {
                        const imageUrl = `https://img.vietqr.io/image/VPBank-0779966349-compact2.png?amount=200000&addInfo=Huy%20app%20hoan%20tien&accountName=NGUYEN%20VAN%20CHI`;
                        
                        // Fetch the image as blob
                        const response = await fetch(imageUrl);
                        const blob = await response.blob();
                        
                        // Create download link
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'QR-Rut-Tien.png';
                        document.body.appendChild(link);
                        link.click();
                        
                        // Cleanup
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Error downloading QR code:', error);
                        alert('Không thể tải QR code. Vui lòng thử lại.');
                      }
                    }}
                    style={{
                      background: 'white',
                      color: '#1f2937',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.12)';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <span>📥</span>
                    <span>Tải xuống QR</span>
                  </button>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, color: '#444' }}>
                  Nội dung chuyển khoản: <strong>Huy app hoan tien</strong>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 16 }}>
                  <button
                    className="submit"
                    disabled={withdrawRequested}
                    onClick={() => {
                      // Handle withdrawal confirmation
                      const expiryTime = Date.now() + 60000; // 60 seconds from now
                      
                      setWithdrawRequested(true);
                      setWithdrawCooldown(60);
                      
                      // Save to localStorage
                      localStorage.setItem('withdraw_requested', 'true');
                      localStorage.setItem('withdraw_expiry', expiryTime.toString());
                      
                      alert('Đã ghi nhận yêu cầu rút tiền. Admin sẽ xử lý trong 24h.');
                    }}
                    style={{ 
                      flex: 1,
                      opacity: withdrawRequested ? 0.6 : 1,
                      cursor: withdrawRequested ? 'not-allowed' : 'pointer',
                      fontSize: withdrawRequested ? '13px' : '15px'
                    }}
                  >
                    {withdrawRequested 
                      ? `Bạn vừa tạo yc, đang chờ ad duyệt. Hãy thử lại sau ${withdrawCooldown}s`
                      : 'Tôi đã chuyển 200k - Tiếp tục'
                    }
                  </button>
                  <button 
                    className="sheet__cancel" 
                    onClick={() => setShowWithdrawModal(false)} 
                    style={{ flex: 1 }}
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Popup for Fake Notifications */}
      <AnimatePresence>
        {showErrorPopup && (
          <div className="error-popup-overlay" onClick={() => setShowErrorPopup(false)}>
            <motion.div
              className="error-popup"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className="error-popup-icon">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  ⚠️
                </motion.div>
              </div>
              <h3 className="error-popup-title">Cuốc xe đã được nhận</h3>
              <p className="error-popup-message">{errorMessage}</p>
              <button
                className="error-popup-btn"
                onClick={() => setShowErrorPopup(false)}
              >
                Đã hiểu
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AppPricingModal 
        isOpen={showPricingModal} 
        onClose={() => setShowPricingModal(false)}
        onConfirm={(plan) => {
          localStorage.setItem('driver_app_plan', plan.id);
          setHasSelectedPlan(true);
          setShowPricingModal(false);
          setShowDownloadPage(true);
        }}
      />

      {showDownloadPage && (
        <DownloadAppPage 
          user={user} 
          onBack={() => setShowDownloadPage(false)} 
        />
      )}
    </div>
  );
};

export default DriverDashboard;
