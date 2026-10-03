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

const defaultRidesByRegion: Record<string, any[]> = {
  north: [
    defaultFeaturedNorth,
    {
      _id: 'featured-north-2',
      carType: '4',
      price: 1250000,
      startPoint: 'Hà Nội',
      endPoint: 'Hải Phòng',
      startDetail: 'Sân bay Nội Bài, Hà Nội',
      endDetail: 'Cảng Đình Vũ, Hải Phòng',
      displayTime: '06:15',
      displayDate: '2026-10-05',
      note: 'Đi công tác, đón đúng giờ'
    },
    {
      _id: 'featured-north-3',
      carType: '7',
      price: 3100000,
      startPoint: 'Hà Nội',
      endPoint: 'Lào Cai',
      startDetail: 'Bến xe Mỹ Đình, Hà Nội',
      endDetail: 'Thị xã Sa Pa, Lào Cai',
      displayTime: '05:30',
      displayDate: '2026-10-05',
      note: 'Gia đình đi nghỉ dưỡng Sa Pa'
    },
    {
      _id: 'featured-north-4',
      carType: '16',
      price: 2800000,
      startPoint: 'Bắc Ninh',
      endPoint: 'Quảng Ninh',
      startDetail: 'KCN Yên Phong, Bắc Ninh',
      endDetail: 'Bãi Cháy, TP. Hạ Long',
      displayTime: '07:00',
      displayDate: '2026-10-05',
      note: 'Đoàn công ty tham quan'
    },
    {
      _id: 'featured-north-5',
      carType: '4',
      price: 850000,
      startPoint: 'Nam Định',
      endPoint: 'Hà Nội',
      startDetail: 'TP. Nam Định',
      endDetail: 'Bệnh viện Bạch Mai, Hà Nội',
      displayTime: '08:00',
      displayDate: '2026-10-05',
      note: 'Khách đi khám bệnh'
    },
    {
      _id: 'featured-north-6',
      carType: '7',
      price: 2600000,
      startPoint: 'Thái Nguyên',
      endPoint: 'Hà Giang',
      startDetail: 'TP. Thái Nguyên',
      endDetail: 'Cột mốc số 0, TP. Hà Giang',
      displayTime: '04:45',
      displayDate: '2026-10-05',
      note: 'Đi phượt miền núi, xe khỏe'
    }
  ],
  central: [
    defaultFeaturedCentral,
    {
      _id: 'featured-central-2',
      carType: '4',
      price: 1200000,
      startPoint: 'Thừa Thiên - Huế',
      endPoint: 'Đà Nẵng',
      startDetail: 'Đại Nội Huế',
      endDetail: 'Bà Nà Hills, Đà Nẵng',
      displayTime: '08:00',
      displayDate: '2026-10-05',
      note: 'Khách du lịch 2 chiều'
    },
    {
      _id: 'featured-central-3',
      carType: '7',
      price: 1850000,
      startPoint: 'Thanh Hóa',
      endPoint: 'Nghệ An',
      startDetail: 'TP. Thanh Hóa',
      endDetail: 'Quảng trường Hồ Chí Minh, TP. Vinh',
      displayTime: '06:30',
      displayDate: '2026-10-05',
      note: 'Đi công tác gấp'
    },
    {
      _id: 'featured-central-4',
      carType: '7',
      price: 2200000,
      startPoint: 'Khánh Hòa',
      endPoint: 'Lâm Đồng',
      startDetail: 'TP. Nha Trang',
      endDetail: 'Hồ Xuân Hương, TP. Đà Lạt',
      displayTime: '07:00',
      displayDate: '2026-10-05',
      note: 'Tour tham quan Đà Lạt'
    },
    {
      _id: 'featured-central-5',
      carType: '4',
      price: 1600000,
      startPoint: 'Quảng Bình',
      endPoint: 'Thừa Thiên - Huế',
      startDetail: 'TP. Đồng Hới',
      endDetail: 'TP. Huế',
      displayTime: '09:00',
      displayDate: '2026-10-05',
      note: 'Xe êm, điều hòa tốt'
    },
    {
      _id: 'featured-central-6',
      carType: '16',
      price: 2100000,
      startPoint: 'Quảng Nam',
      endPoint: 'Quảng Ngãi',
      startDetail: 'Phố cổ Hội An',
      endDetail: 'TP. Quảng Ngãi',
      displayTime: '13:30',
      displayDate: '2026-10-05',
      note: 'Đoàn gia đình đi lễ'
    }
  ],
  south: [
    defaultFeaturedSouth,
    {
      _id: 'featured-south-2',
      carType: '7',
      price: 2500000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Cần Thơ',
      startDetail: 'Sân bay Tân Sơn Nhất',
      endDetail: 'Bến Ninh Kiều, TP. Cần Thơ',
      displayTime: '08:30',
      displayDate: '2026-10-05',
      note: 'Đưa đón khách về miền Tây'
    },
    {
      _id: 'featured-south-3',
      carType: '7',
      price: 2900000,
      startPoint: 'Bình Dương',
      endPoint: 'Bình Thuận',
      startDetail: 'TP. Thủ Dầu Một',
      endDetail: 'Mũi Né, TP. Phan Thiết',
      displayTime: '05:00',
      displayDate: '2026-10-05',
      note: 'Đi nghỉ dưỡng resort Mũi Né'
    },
    {
      _id: 'featured-south-4',
      carType: '4',
      price: 1350000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Tây Ninh',
      startDetail: 'Bến xe Miền Tây',
      endDetail: 'Khu du lịch Núi Bà Đen',
      displayTime: '06:45',
      displayDate: '2026-10-05',
      note: 'Đi viếng chùa Bà Đen'
    },
    {
      _id: 'featured-south-5',
      carType: '16',
      price: 4500000,
      startPoint: 'Đồng Nai',
      endPoint: 'Lâm Đồng',
      startDetail: 'TP. Biên Hòa',
      endDetail: 'TP. Đà Lạt',
      displayTime: '04:00',
      displayDate: '2026-10-05',
      note: 'Đoàn du lịch 3 ngày 2 đêm'
    },
    {
      _id: 'featured-south-6',
      carType: '7',
      price: 2700000,
      startPoint: 'An Giang',
      endPoint: 'TP. Hồ Chí Minh',
      startDetail: 'TP. Long Xuyên, An Giang',
      endDetail: 'Quận 5, TP. Hồ Chí Minh',
      displayTime: '07:15',
      displayDate: '2026-10-05',
      note: 'Khách gia đình có trẻ nhỏ'
    }
  ]
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

  const baseRides = defaultRidesByRegion[region] || defaultRidesByRegion.north;
  const displayList = fakeNotifications.length > 0
    ? [...fakeNotifications, ...baseRides.filter(b => !fakeNotifications.some(f => f.startPoint === b.startPoint && f.endPoint === b.endPoint))]
    : baseRides;

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
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(start + ', Việt Nam')}&destination=${encodeURIComponent(end + ', Việt Nam')}`;
                    window.open(url, '_blank');
                  }}
                >
                  <div className="featured-map-bg">
                    <iframe
                      title={`Bản đồ ${notification.startPoint} đến ${notification.endPoint}`}
                      src={`https://maps.google.com/maps?saddr=${encodeURIComponent((notification.startDetail || notification.startPoint) + ', Việt Nam')}&daddr=${encodeURIComponent((notification.endDetail || notification.endPoint) + ', Việt Nam')}&output=embed`}
                      className="featured-map-iframe"
                      loading="lazy"
                    />
                  </div>

                  <div className="featured-map-expand-badge">
                    <span>🗺️ Google Maps</span>
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>↗</span>
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
