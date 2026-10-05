import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { driverFakeNotificationsAPI } from '../../services/api';
import './DriverDashboard.css';

type Props = {
  user?: {
    status: string;
    [key: string]: any;
  } | null;
  region?: 'north' | 'central' | 'south';
  limit?: number;
  onRequireAuth?: () => void;
  onRegisterClick?: () => void;
  onViewAllClick?: () => void;
};

// Default featured fake rides matching the user's reference exactly
const defaultRidesByRegion: Record<string, any[]> = {
  north: [
    {
      _id: 'default-featured-north-1',
      carType: '4',
      price: 2800000,
      startPoint: 'Phú Thọ',
      endPoint: 'Lào Cai',
      startDetail: 'Thành phố Việt Trì (Phú Thọ)',
      startArea: 'Thành phố Việt Trì, Phú Thọ',
      endDetail: 'Thị trấn du lịch Sa Pa (Lào Cai)',
      endArea: 'Sa Pa, Lào Cai',
      displayTime: '09:00',
      displayDate: '2026-07-10',
      note: 'Khách đi nghỉ dưỡng yêu cầu chạy thẳng tuyến cao tốc Nội Bài – Lào Cai, xe đời mới êm ái, tài xế không hút thuốc.'
    },
    {
      _id: 'default-featured-north-2',
      carType: '4',
      price: 360000,
      startPoint: 'Hà Nội',
      endPoint: 'Bắc Ninh',
      startDetail: 'Bến xe Gia Lâm (Hà Nội)',
      startArea: 'Long Biên, Hà Nội',
      endDetail: 'TP. Từ Sơn (Bắc Ninh)',
      endArea: 'Từ Sơn, Bắc Ninh',
      displayTime: '09:30',
      displayDate: '2026-07-10',
      note: 'Khách đi công tác mang theo 1 vali nhỏ.'
    },
    {
      _id: 'default-featured-north-3',
      carType: '7',
      price: 4200000,
      startPoint: 'Bắc Giang',
      endPoint: 'Cao Bằng',
      startDetail: 'TP. Bắc Giang',
      startArea: 'TP. Bắc Giang',
      endDetail: 'Thác Bản Giốc (Trùng Khánh, Cao Bằng)',
      endArea: 'Trùng Khánh, Cao Bằng',
      displayTime: '04:00',
      displayDate: '2026-10-05',
      note: 'Gia đình đi du lịch vùng cao cuối tuần.'
    }
  ],
  central: [
    {
      _id: 'default-featured-central-1',
      carType: '7',
      price: 2800000,
      startPoint: 'Đà Nẵng',
      endPoint: 'Quy Nhơn',
      startDetail: 'Sân bay Đà Nẵng',
      startArea: 'Hải Châu, Đà Nẵng',
      endDetail: 'Kỳ Co – Eo Gió (Quy Nhơn)',
      endArea: 'Quy Nhơn, Bình Định',
      displayTime: '07:30',
      displayDate: '2026-10-05',
      note: 'Đi công tác & du lịch kết hợp.'
    },
    {
      _id: 'default-featured-central-2',
      carType: '4',
      price: 450000,
      startPoint: 'Đà Nẵng',
      endPoint: 'Hội An',
      startDetail: 'Cầu Rồng, Đà Nẵng',
      startArea: 'Sơn Trà, Đà Nẵng',
      endDetail: 'Phố cổ Hội An',
      endArea: 'Hội An, Quảng Nam',
      displayTime: '08:15',
      displayDate: '2026-10-05',
      note: 'Đoàn 2 khách du lịch nước ngoài.'
    }
  ],
  south: [
    {
      _id: 'default-featured-south-1',
      carType: '7',
      price: 1800000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Vũng Tàu',
      startDetail: 'Quận 1, TP. HCM',
      startArea: 'Quận 1, TP. Hồ Chí Minh',
      endDetail: 'Bãi Sau, TP. Vũng Tàu',
      endArea: 'Bãi Sau, TP. Vũng Tàu',
      displayTime: '06:00',
      displayDate: '2026-10-05',
      note: 'Đưa đón tận nơi, xe êm ái.'
    },
    {
      _id: 'default-featured-south-2',
      carType: '4',
      price: 650000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Bình Dương',
      startDetail: 'Sân bay Tân Sơn Nhất',
      startArea: 'Tân Bình, TP. HCM',
      endDetail: 'TP. Thủ Dầu Một',
      endArea: 'Thủ Dầu Một, Bình Dương',
      displayTime: '07:45',
      displayDate: '2026-10-05',
      note: 'Chuyên gia nước ngoài đi công tác KCN.'
    }
  ]
};

const FakeNotificationBanner = ({
  user,
  region = 'north',
  limit,
  onRequireAuth,
  onViewAllClick,
}: Props) => {
  const [fakeNotifications, setFakeNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [acceptingNotificationId, setAcceptingNotificationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFakeNotifications = async (currentRegion: string) => {
    try {
      setLoadingNotifications(true);
      const response = await driverFakeNotificationsAPI.getFakeNotifications(currentRegion, true);
      const newNotifications = response.data.data || [];

      if (newNotifications.length > 0) {
        setFakeNotifications(newNotifications);

        // Bắn thông báo đẩy ra Desktop / Mobile nếu có quyền
        if ('Notification' in window && Notification.permission === 'granted') {
          const notif = newNotifications[0];
          const systemNotification = new Notification(`🔔 Có cuốc xe ${notif.carType} chỗ mới!`, {
            body: `${notif.startPoint} ➔ ${notif.endPoint}\nGiá: ${Number(notif.price).toLocaleString('vi-VN')}đ`,
            icon: '/vite.svg',
            requireInteraction: true
          });

          systemNotification.onclick = () => {
            window.focus();
            systemNotification.close();
          };
        }
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
        fetchFakeNotifications(currentRegion);
      }, randomMinutes * 60 * 1000);
    } catch (error: any) {
      console.error('Error fetching fake notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (user?.status === 'approved') {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    fetchFakeNotifications(region);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user?.status, region]);

  const handleAcceptFakeNotification = async (notificationId: string) => {
    try {
      setAcceptingNotificationId(notificationId);
      if (!String(notificationId).startsWith('default-')) {
        await driverFakeNotificationsAPI.acceptFakeNotification(notificationId);
      } else {
        await new Promise((r) => setTimeout(r, 500));
        throw new Error('Đã có tài xế nhận cuốc, vui lòng đợi cuốc tiếp theo');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Đã có tài xế nhận cuốc, vui lòng đợi cuốc tiếp theo';
      setErrorMessage(message);
      setShowErrorPopup(true);
      setTimeout(() => {
        setFakeNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        setShowErrorPopup(false);
      }, 3000);
    } finally {
      setAcceptingNotificationId(null);
    }
  };

  const handleRideClick = (notification: any) => {
    if (!user || user.status !== 'approved') {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    handleAcceptFakeNotification(notification._id);
  };

  const formatRideDate = (notification: any) => {
    const d = notification.displayDate ? new Date(notification.displayDate) : new Date();
    const weekday = d.toLocaleDateString('vi-VN', { weekday: 'long' });
    const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = notification.displayTime || '09:00';
    return `${time} · ${weekdayCap}, ${dateStr}`;
  };

  // Merge database fake notifications with default mock rides so the list is NEVER empty
  const baseRides = defaultRidesByRegion[region] || defaultRidesByRegion.north;
  const fullList = fakeNotifications.length > 0
    ? [...fakeNotifications, ...baseRides.filter((b) => !fakeNotifications.some((f) => f.startPoint === b.startPoint && f.endPoint === b.endPoint))]
    : baseRides;
  const displayList = limit ? fullList.slice(0, limit) : fullList;

  return (
    <div className="fake-notifications-section">
      {/* Section Header matching user image */}
      <div className="section-header">
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
          🔔 Bạn có cuốc xe có thể nhận
        </h3>
        {onViewAllClick ? (
          <button
            type="button"
            className="featured-view-all-btn"
            onClick={onViewAllClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#00b14f',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Xem tất cả</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>›</span>
          </button>
        ) : loadingNotifications ? (
          <span className="loading-spinner">⟳</span>
        ) : (
          <span className="ride-latest-badge">Mới nhất</span>
        )}
      </div>

      <AnimatePresence>
        <div className="fake-notifications-list">
          {displayList.map((notification, index) => (
            <motion.div
              key={notification._id || index}
              className="fake-notification-card"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
            >
              {/* Row 1: Time */}
              <div className="ride-card-header">
                <span className="ride-time-wrap">
                  <span className="ride-time-icon">🕐</span>
                  <span className="ride-time-text">{formatRideDate(notification)}</span>
                </span>
                <span className="ride-latest-badge" style={{ fontSize: '11px', padding: '3px 8px', fontWeight: 700 }}>
                  ⚡ Cuốc hot
                </span>
              </div>

              {/* Row 2: Car type + Route on left, Price on right (moved down & shifted left) */}
              <div className="ride-summary-row">
                <div className="ride-summary-container">
                  <div className="ride-cartype">
                    🚗 Có tài xế bắn cuốc {notification.carType} chỗ
                  </div>
                  <div className="ride-summary-route">
                    <span className="ride-pin ride-pin-start">📍</span>
                    <span className="ride-summary-point ride-point-start">{notification.startPoint}</span>
                    <span className="ride-summary-arrow">→</span>
                    <span className="ride-pin ride-pin-end">📍</span>
                    <span className="ride-summary-point ride-point-end">{notification.endPoint}</span>
                  </div>
                </div>

                <span className="ride-price-block">
                  <span className="ride-price">{Number(notification.price).toLocaleString('vi-VN')}đ</span>
                  <span className="ride-price-label">Giá chuyến</span>
                </span>
              </div>

              {/* Row 3: Timeline Route Box (Điểm đón -> Điểm đến) */}
              <div className="ride-timeline">
                <div className="ride-timeline-row">
                  <span className="ride-marker ride-marker-start" />
                  <div className="ride-timeline-content">
                    <div className="ride-point-head">
                      <span className="ride-badge ride-badge-start">📍 Điểm đón</span>
                      <span className="ride-point-name">
                        {notification.startDetail || notification.startPoint}
                      </span>
                    </div>
                    {notification.startArea && (
                      <div className="ride-point-area">Khu vực: {notification.startArea}</div>
                    )}
                  </div>
                </div>

                <div className="ride-timeline-connector" />

                <div className="ride-timeline-row">
                  <span className="ride-marker ride-marker-end" />
                  <div className="ride-timeline-content">
                    <div className="ride-point-head">
                      <span className="ride-badge ride-badge-end">📍 Điểm đến</span>
                      <span className="ride-point-name">
                        {notification.endDetail || notification.endPoint}
                      </span>
                    </div>
                    {notification.endArea && (
                      <div className="ride-point-area">Khu vực: {notification.endArea}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: Additional Requirements / Note box */}
              {notification.note && (
                <div className="ride-note-box">
                  <span className="ride-note-icon">📋</span>
                  <span className="ride-note-text">
                    <strong>Yêu cầu phụ:</strong> {notification.note}
                  </span>
                </div>
              )}

              {/* Row 5: Action Button matching user image */}
              <button
                type="button"
                className="accept-ride-btn"
                onClick={() => handleRideClick(notification)}
                disabled={acceptingNotificationId === notification._id}
              >
                {acceptingNotificationId === notification._id ? 'Đang xử lý...' : 'Nhận chuyến ngay ›'}
              </button>
            </motion.div>
          ))}
        </div>
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
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              className="error-popup-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                textAlign: 'center',
                maxWidth: '320px',
                width: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '18px' }}>Rất tiếc!</h3>
              <p style={{ color: '#333', marginBottom: '20px', lineHeight: '1.5', fontSize: '14px' }}>
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => setShowErrorPopup(false)}
                style={{
                  background: '#00b14f',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  width: '100%',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer'
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
