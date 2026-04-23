import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { driverFakeNotificationsAPI } from '../../services/api';
import './DriverDashboard.css'; // Reuse styles

type Props = {
  user: {
    status: string;
    [key: string]: any;
  };
};

const FakeNotificationBanner = ({ user }: Props) => {
  const [fakeNotifications, setFakeNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [acceptingNotificationId, setAcceptingNotificationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFakeNotifications = async () => {
    if (user.status !== 'approved') return;

    try {
      setLoadingNotifications(true);
      const region = 'north'; // Default or from user profile
      const response = await driverFakeNotificationsAPI.getFakeNotifications(region);
      
      const newNotifications = response.data.data || [];
      // Only update state if we actually got new notifications to avoid flickering empty state
      if (newNotifications.length > 0) {
        setFakeNotifications(newNotifications);
        
        // Bắn thông báo đẩy ra ngoài hệ điều hành (Desktop / Mobile Push Notification)
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = newNotifications[0];
          const systemNotification = new Notification(`🔔 Có cuốc xe ${notif.carType} chỗ mới!`, {
            body: `${notif.startPoint} ➔ ${notif.endPoint}\nGiá: ${notif.price.toLocaleString('vi-VN')}đ`,
            icon: '/vite.svg', // Icon mặc định của web
            requireInteraction: true // Giữ thông báo trên màn hình cho đến khi user tắt hoặc click
          });

          // Nếu user click vào thông báo đẩy, focus lại trình duyệt
          systemNotification.onclick = () => {
            window.focus();
            systemNotification.close();
          };
        }
        
        // Auto hide after 30 seconds
        if (autoHideRef.current) clearTimeout(autoHideRef.current);
        autoHideRef.current = setTimeout(() => {
          setFakeNotifications([]);
        }, 30000);
        
      } else {
        // If empty, we can choose to clear it or keep the old one until next tick
        // Let's clear it if they wanted to reset
        setFakeNotifications([]);
      }
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      let min = 15;
      let max = 30;
      if (response.data.settings) {
        min = response.data.settings.minInterval || 15;
        max = response.data.settings.maxInterval || 30;
      }
      
      const randomMinutes = Math.floor(Math.random() * (max - min + 1)) + min;
      timeoutRef.current = setTimeout(() => {
        fetchFakeNotifications();
      }, randomMinutes * 60 * 1000);

    } catch (error: any) {
      console.error('Error fetching fake notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    // Xin quyền hiển thị thông báo đẩy khi tài xế vừa mở app
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    fetchFakeNotifications();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [user.status]);

  const handleAcceptFakeNotification = async (notificationId: string) => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    
    try {
      setAcceptingNotificationId(notificationId);
      await driverFakeNotificationsAPI.acceptFakeNotification(notificationId);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đã có tài xế nhận quốc, vui lòng đợi cuốc tiếp theo';
      setErrorMessage(message);
      setShowErrorPopup(true);
      // Remove the notification after failure
      setTimeout(() => {
        setFakeNotifications(prev => prev.filter(n => n._id !== notificationId));
        setShowErrorPopup(false);
      }, 3000);
    } finally {
      setAcceptingNotificationId(null);
    }
  };

  if (user.status !== 'approved') return null;
  if (fakeNotifications.length === 0 && !showErrorPopup) return null;

  return (
    <div className="fake-notifications-section" style={{ margin: '15px 20px', borderRadius: '12px' }}>
      <div className="section-header">
        <h3 style={{ fontSize: '1rem' }}>🔔 Cuốc xe dành riêng cho bạn</h3>
        {loadingNotifications && <span className="loading-spinner">⟳</span>}
      </div>
      
      <AnimatePresence>
        {fakeNotifications.length > 0 && (
          <div className="fake-notifications-list">
            {fakeNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                className="fake-notification-card"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={{ padding: '12px', marginBottom: '10px' }}
              >
                <div className="notification-time">
                  <span className="time-icon">🕐</span>
                  <span className="time-text">{notification.displayTime}</span>
                </div>
                <div className="notification-content">
                  <div className="notification-title" style={{ fontSize: '15px' }}>
                    🚗 Có tài xế bắn cuốc {notification.carType} chỗ
                  </div>
                  <div className="notification-route" style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                    {notification.startPoint} → {notification.endPoint}
                  </div>
                  <div className="notification-price" style={{ color: '#e74c3c', fontSize: '16px' }}>
                    {notification.price.toLocaleString('vi-VN')}đ
                  </div>
                  {notification.note && (
                    <div className="notification-note" style={{
                      marginTop: '8px',
                      padding: '6px 10px',
                      background: '#fffbea',
                      borderLeft: '3px solid #f39c12',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#7d6608',
                      lineHeight: '1.4'
                    }}>
                      📝 {notification.note}
                    </div>
                  )}
                </div>
                <button
                  className="accept-ride-btn"
                  onClick={() => handleAcceptFakeNotification(notification._id)}
                  disabled={acceptingNotificationId === notification._id}
                  style={{ marginTop: '10px', padding: '10px' }}
                >
                  {acceptingNotificationId === notification._id ? 'Đang xử lý...' : 'Nhận chuyến ngay'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Error Popup Modal */}
      <AnimatePresence>
        {showErrorPopup && (
          <motion.div 
            className="error-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div 
              className="error-popup-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                background: 'white', padding: '20px', borderRadius: '12px',
                textAlign: 'center', maxWidth: '300px', width: '90%'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>Rất tiếc!</h3>
              <p style={{ color: '#333', marginBottom: '20px', lineHeight: '1.5' }}>{errorMessage}</p>
              <button 
                onClick={() => setShowErrorPopup(false)}
                style={{
                  background: '#e74c3c', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: '8px', width: '100%',
                  fontWeight: 'bold'
                }}
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FakeNotificationBanner;
