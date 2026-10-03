import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { driverFakeNotificationsAPI } from '../../services/api';

type Props = {
  user?: {
    status: string;
    [key: string]: any;
  } | null;
  region?: 'north' | 'central' | 'south';
  onRequireAuth?: () => void;
  onRegisterClick?: () => void;
  onViewAllClick?: () => void;
};

const defaultFeaturedNorth = {
  _id: 'default-featured-north',
  carType: '7',
  price: 4200000,
  startPoint: 'Bắc Giang',
  endPoint: 'Cao Bằng',
  startDetail: 'TP. Bắc Giang',
  endDetail: 'Thác Bản Giốc (Trùng Khánh, Cao Bằng)',
  displayTime: '04:00',
  displayDate: '2026-10-05',
  note: 'Đi vùng cao'
};

const defaultFeaturedCentral = {
  _id: 'default-featured-central',
  carType: '7',
  price: 2800000,
  startPoint: 'Đà Nẵng',
  endPoint: 'Quy Nhơn',
  startDetail: 'Sân bay Đà Nẵng',
  endDetail: 'Kỳ Co - Eo Gió (Quy Nhơn)',
  displayTime: '07:30',
  displayDate: '2026-10-05',
  note: 'Đi công tác & du lịch'
};

const defaultFeaturedSouth = {
  _id: 'default-featured-south',
  carType: '7',
  price: 1800000,
  startPoint: 'TP. Hồ Chí Minh',
  endPoint: 'Vũng Tàu',
  startDetail: 'Quận 1, TP. HCM',
  endDetail: 'Bãi Sau, TP. Vũng Tàu',
  displayTime: '06:00',
  displayDate: '2026-10-05',
  note: 'Đưa đón tận nơi'
};

const defaultMapByRegion: Record<string, any> = {
  north: defaultFeaturedNorth,
  central: defaultFeaturedCentral,
  south: defaultFeaturedSouth
};

const getPlaceImage = (point: string, detail?: string | null): string | null => {
  const text = `${point || ''} ${detail || ''}`.toLowerCase();
  if (text.includes('bắc giang')) return '/images/landmark_bac_giang.jpg';
  if (text.includes('cao bằng') || text.includes('bản giốc')) return '/images/landmark_ban_gioc.jpg';
  return null;
};

const FakeNotificationBanner = ({
  user,
  region = 'north',
  onRequireAuth,
  onRegisterClick,
  onViewAllClick
}: Props) => {
  const [fakeNotifications, setFakeNotifications] = useState<any[]>([]);
  const [, setLoadingNotifications] = useState(false);
  const [acceptingNotificationId, setAcceptingNotificationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFakeNotifications = async (currentRegion: string) => {
    try {
      setLoadingNotifications(true);
      const response = await driverFakeNotificationsAPI.getFakeNotifications(currentRegion);
      const newNotifications = response.data.data || [];

      if (newNotifications.length > 0) {
        setFakeNotifications(newNotifications);

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

        if (autoHideRef.current) clearTimeout(autoHideRef.current);
        autoHideRef.current = setTimeout(() => {
          setFakeNotifications([]);
        }, 3 * 60 * 1000);
      } else {
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
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [user?.status, region]);

  const handleAcceptFakeNotification = async (notificationId: string) => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);

    try {
      setAcceptingNotificationId(notificationId);
      await driverFakeNotificationsAPI.acceptFakeNotification(notificationId);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đã có tài xế nhận cuốc, vui lòng đợi cuốc tiếp theo';
      setErrorMessage(message);
      setShowErrorPopup(true);
      setTimeout(() => {
        setFakeNotifications(prev => prev.filter(n => n._id !== notificationId));
        setShowErrorPopup(false);
      }, 3000);
    } finally {
      setAcceptingNotificationId(null);
    }
  };

  const displayList = fakeNotifications.length > 0 ? fakeNotifications : [defaultMapByRegion[region] || defaultFeaturedNorth];

  return (
    <div className="featured-rides-section">
      {/* Section Header */}
      <div className="featured-rides-header">
        <div className="featured-rides-title">
          <span className="featured-bell-icon">🔔</span>
          <h3>Cuốc xe mới nhất</h3>
        </div>
        <button
          type="button"
          className="featured-view-all-btn"
          onClick={() => {
            if (onViewAllClick) onViewAllClick();
          }}
        >
          <span>Xem tất cả</span>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>›</span>
        </button>
      </div>

      <AnimatePresence>
        <div className="featured-rides-list">
          {displayList.map((notification, index) => {
            const dateObj = notification.displayDate ? new Date(notification.displayDate) : new Date();
            const weekday = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeString = `${notification.displayTime || '04:00'} · ${weekdayCap}, ${dateStr}`;

            return (
              <motion.div
                key={notification._id || index}
                className="featured-ride-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
              >
                {/* Header: Time + Hot badge */}
                <div className="featured-card-top">
                  <div className="featured-time-pill">
                    <span className="featured-time-icon">🕐</span>
                    <span className="featured-time-text">{timeString}</span>
                  </div>
                  <div className="featured-hot-pill">
                    <span className="featured-hot-icon">⚡</span>
                    <span className="featured-hot-text">Cuốc hot</span>
                  </div>
                </div>

                {/* Car type & Price */}
                <div className="featured-card-middle">
                  <div className="featured-card-cartype">
                    <span className="featured-car-emoji">🚗</span>
                    <span className="featured-car-name">Có tài xế bắn cuốc {notification.carType} chỗ</span>
                  </div>
                  <div className="featured-card-price-wrap">
                    <div className="featured-card-price">{Number(notification.price).toLocaleString('vi-VN')}đ</div>
                    <div className="featured-card-price-sub">Giá chuyến</div>
                  </div>
                </div>

                {/* Route Points */}
                <div className="featured-card-route">
                  <span className="route-pin-icon route-pin-icon--green">📍</span>
                  <span className="route-loc-name route-loc-name--start">{notification.startPoint}</span>
                  <span className="route-arrow-icon">→</span>
                  <span className="route-pin-icon route-pin-icon--red">📍</span>
                  <span className="route-loc-name route-loc-name--end">{notification.endPoint}</span>
                </div>

                {/* Dynamic Google Maps Route View */}
                <div
                  className="featured-map-view"
                  title="Nhấn để mở chỉ đường trên Google Maps"
                  onClick={() => {
                    const start = notification.startDetail || notification.startPoint;
                    const end = notification.endDetail || notification.endPoint;
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start)}&destination=${encodeURIComponent(end)}`;
                    window.open(url, '_blank');
                  }}
                >
                  <div
                    className="featured-map-bg"
                    style={{
                      backgroundImage: `url('/images/google_map_terrain.jpg')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* SVG Route Line */}
                  <svg className="featured-map-svg" viewBox="0 0 360 120" preserveAspectRatio="none">
                    <path
                      d="M 60 90 Q 110 90, 160 65 T 260 40 L 305 32"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Car icon placed on route */}
                  <div className="featured-map-car-badge">
                    <span>🚗</span>
                  </div>

                  {/* Start Point Marker Card */}
                  <div className="featured-map-marker featured-map-marker--start">
                    {getPlaceImage(notification.startPoint, notification.startDetail) ? (
                      <img
                        src={getPlaceImage(notification.startPoint, notification.startDetail)!}
                        alt={notification.startDetail || notification.startPoint}
                        className="marker-img"
                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="marker-img-placeholder marker-img-placeholder--start">
                        <span>📍</span>
                      </div>
                    )}
                    <div className="marker-content">
                      <span className="marker-badge marker-badge--start">Điểm đón</span>
                      <div className="marker-address">{notification.startDetail || notification.startPoint}</div>
                    </div>
                  </div>

                  {/* End Point Marker Card */}
                  <div className="featured-map-marker featured-map-marker--end">
                    {getPlaceImage(notification.endPoint, notification.endDetail) ? (
                      <img
                        src={getPlaceImage(notification.endPoint, notification.endDetail)!}
                        alt={notification.endDetail || notification.endPoint}
                        className="marker-img"
                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="marker-img-placeholder marker-img-placeholder--end">
                        <span>🏁</span>
                      </div>
                    )}
                    <div className="marker-content">
                      <span className="marker-badge marker-badge--end">Điểm đến</span>
                      <div className="marker-address">{notification.endDetail || notification.endPoint}</div>
                    </div>
                  </div>
                </div>

                {/* Specs row */}
                <div className="featured-card-specs">
                  <div className="spec-tag">
                    <span className="spec-icon">🚗</span>
                    <span>{notification.carType} chỗ</span>
                  </div>
                  <div className="spec-tag">
                    <span className="spec-icon">👥</span>
                    <span>Khách du lịch</span>
                  </div>
                  <div className="spec-tag spec-tag--note">
                    <span className="spec-icon">🧳</span>
                    <span className="spec-text">Yêu cầu: {notification.note || 'Đi vùng cao'}</span>
                  </div>
                  <div className="spec-tag-menu">⋮</div>
                </div>

                {/* Big Action Button */}
                <button
                  type="button"
                  className="featured-card-submit-btn"
                  onClick={() => {
                    if (!user) {
                      if (onRequireAuth) onRequireAuth();
                      return;
                    }
                    if (onRegisterClick) {
                      onRegisterClick();
                    } else {
                      handleAcceptFakeNotification(notification._id);
                    }
                  }}
                  disabled={acceptingNotificationId === notification._id}
                >
                  <span>ĐĂNG KÝ CHỞ CUỐC XE</span>
                  <span className="featured-btn-arrow">›</span>
                </button>
              </motion.div>
            );
          })}
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
                background: 'white', padding: '20px', borderRadius: '16px',
                textAlign: 'center', maxWidth: '320px', width: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
              <h3 style={{ color: '#e74c3c', marginBottom: '10px', fontSize: '18px' }}>Rất tiếc!</h3>
              <p style={{ color: '#333', marginBottom: '20px', lineHeight: '1.5', fontSize: '14px' }}>{errorMessage}</p>
              <button
                type="button"
                onClick={() => setShowErrorPopup(false)}
                style={{
                  background: '#00b14f', color: 'white', border: 'none',
                  padding: '12px 20px', borderRadius: '10px', width: '100%',
                  fontWeight: 'bold', fontSize: '15px', cursor: 'pointer'
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
