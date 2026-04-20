import { motion } from 'framer-motion';
import type { FakeNotification } from './FakeNotificationsTab';

type Props = {
  template: FakeNotification;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
};

const FakeNotificationCard = ({ template, onEdit, onDelete, onToggle }: Props) => {
  return (
    <motion.div 
      className={`fake-notification-card ${template.isActive ? 'active' : 'inactive'}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
    >
      <div className="card-header">
        <span className="time">🕐 {template.displayTime}</span>
        <span className={`status-indicator ${template.isActive ? 'active' : 'inactive'}`}>
          {template.isActive ? '●' : '○'}
        </span>
      </div>

      <div className="card-body">
        <div className="route">
          <span className="start-point">{template.startPoint}</span>
          <span className="arrow">→</span>
          <span className="end-point">{template.endPoint}</span>
        </div>
        
        <div className="details">
          <span className="car-type">🚗 {template.carType} chỗ</span>
          <span className="price">{template.price.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className={`toggle-btn ${template.isActive ? 'active' : 'inactive'}`}
          onClick={onToggle}
          title={template.isActive ? 'Tắt' : 'Bật'}
        >
          {template.isActive ? '🟢 Bật' : '⚪ Tắt'}
        </button>
        <button className="edit-btn" onClick={onEdit} title="Sửa">
          ✏️
        </button>
        <button className="delete-btn" onClick={onDelete} title="Xóa">
          🗑️
        </button>
      </div>
    </motion.div>
  );
};

export default FakeNotificationCard;
