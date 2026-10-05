import { motion, AnimatePresence } from 'framer-motion';

type Region = 'north' | 'central' | 'south';

type Props = {
  user?: {
    status: string;
    [key: string]: any;
  } | null;
  region?: Region;
  onRequireAuth?: () => void;
  onRegisterClick?: () => void;
  onViewAllClick?: () => void;
};

const getPlaceImage = (point: string = '', detail: string = '') => {
  const text = (point + ' ' + detail).toLowerCase();
  if (text.includes('sa pa') || text.includes('lào cai')) return '/images/landmark_sapa.jpg';
  if (text.includes('vịnh hạ long') || text.includes('quảng ninh') || text.includes('hạ long')) return '/images/landmark_halong.jpg';
  if (text.includes('hà nội') || text.includes('nội bài') || text.includes('mỹ đình')) return '/images/landmark_hanoi.jpg';
  if (text.includes('vũng tàu')) return '/images/landmark_vung_tau.jpg';
  if (text.includes('đà nẵng') || text.includes('bà nà')) return '/images/landmark_da_nang.jpg';
  if (text.includes('quy nhơn') || text.includes('bình định')) return '/images/landmark_quy_nhon.jpg';
  if (text.includes('hội an')) return '/images/landmark_hoi_an.jpg';
  if (text.includes('sài gòn') || text.includes('hồ chí minh') || text.includes('tân sơn nhất')) return '/images/landmark_hcm.jpg';
  if (text.includes('bắc giang')) return '/images/landmark_bac_giang.jpg';
  if (text.includes('cao bằng') || text.includes('bản giốc')) return '/images/landmark_ban_gioc.jpg';
  return null;
};

const featuredRidesByRegion: Record<Region, any[]> = {
  north: [
    {
      _id: 'featured-north-main',
      carType: '7',
      price: 4200000,
      startPoint: 'Bắc Giang',
      endPoint: 'Cao Bằng',
      startDetail: 'Thành phố Bắc Giang',
      endDetail: 'Thác Bản Giốc (Trùng Khánh, Cao Bằng)',
      displayTime: '04:00',
      displayDate: '2026-10-05',
      note: 'Đi vùng cao',
      category: 'Khách du lịch'
    }
  ],
  central: [
    {
      _id: 'featured-central-main',
      carType: '7',
      price: 2800000,
      startPoint: 'Đà Nẵng',
      endPoint: 'Quy Nhơn',
      startDetail: 'Sân bay Đà Nẵng',
      endDetail: 'Kỳ Co – Eo Gió (Quy Nhơn)',
      displayTime: '07:30',
      displayDate: '2026-10-05',
      note: 'Đi công tác & du lịch',
      category: 'Khách công tác'
    }
  ],
  south: [
    {
      _id: 'featured-south-main',
      carType: '7',
      price: 1800000,
      startPoint: 'TP. Hồ Chí Minh',
      endPoint: 'Vũng Tàu',
      startDetail: 'Quận 1, TP. HCM',
      endDetail: 'Bãi Sau, TP. Vũng Tàu',
      displayTime: '06:00',
      displayDate: '2026-10-05',
      note: 'Đưa đón tận nơi',
      category: 'Gia đình nghỉ dưỡng'
    }
  ]
};

const FeaturedRidesSection = ({
  user,
  region = 'north',
  onRequireAuth,
  onRegisterClick,
  onViewAllClick
}: Props) => {
  const currentList = featuredRidesByRegion[region] || featuredRidesByRegion.north;

  return (
    <div className="featured-rides-section">
      {/* Section Header matching Homepage mockup */}
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

      <AnimatePresence mode="wait">
        <div className="featured-rides-list" key={region}>
          {currentList.map((notification, index) => {
            const dateObj = notification.displayDate ? new Date(notification.displayDate) : new Date();
            const weekday = dateObj.toLocaleDateString('vi-VN', { weekday: 'long' });
            const weekdayCap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
            const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeString = `${notification.displayTime || '04:00'} · ${weekdayCap}, ${dateStr}`;

            return (
              <motion.div
                key={notification._id}
                className="featured-ride-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, delay: index * 0.08 }}
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
                    <span>{notification.category || 'Khách du lịch'}</span>
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
                    } else if (onViewAllClick) {
                      onViewAllClick();
                    }
                  }}
                >
                  <span>ĐĂNG KÝ CHỞ CUỐC XE</span>
                  <span className="featured-btn-arrow">›</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default FeaturedRidesSection;
