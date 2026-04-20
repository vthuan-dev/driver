import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { FakeNotification } from './FakeNotificationsTab';

type FormData = {
  region: 'north' | 'central' | 'south';
  startPoint: string;
  endPoint: string;
  displayTime: string;
  carType: '4' | '7' | '16';
  price: number;
  isActive: boolean;
};

type Props = {
  template: FakeNotification | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
};

const provincesByRegion: Record<string, string[]> = {
  north: [
    'Hà Nội', 'Hải Phòng', 'Hải Dương', 'Hưng Yên', 'Thái Bình',
    'Hà Nam', 'Nam Định', 'Ninh Bình', 'Vĩnh Phúc', 'Bắc Ninh',
    'Quảng Ninh', 'Lạng Sơn', 'Cao Bằng', 'Bắc Kạn', 'Thái Nguyên',
    'Tuyên Quang', 'Hà Giang', 'Lào Cai', 'Yên Bái', 'Lai Châu',
    'Điện Biên', 'Sơn La', 'Hòa Bình', 'Phú Thọ', 'Bắc Giang'
  ],
  central: [
    'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị',
    'Thừa Thiên - Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi',
    'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận',
    'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ],
  south: [
    'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa-Vũng Tàu',
    'Tây Ninh', 'Bình Phước', 'Long An', 'Tiền Giang', 'Bến Tre',
    'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang',
    'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
  ]
};

const FakeNotificationForm = ({ template, onSubmit, onCancel }: Props) => {
  const [formData, setFormData] = useState<FormData>({
    region: 'north',
    startPoint: '',
    endPoint: '',
    displayTime: '08:00',
    carType: '7',
    price: 0,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load template data if editing
  useEffect(() => {
    if (template) {
      setFormData({
        region: template.region,
        startPoint: template.startPoint,
        endPoint: template.endPoint,
        displayTime: template.displayTime,
        carType: template.carType,
        price: template.price,
        isActive: template.isActive
      });
    }
  }, [template]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startPoint || formData.startPoint.length < 2) {
      newErrors.startPoint = 'Điểm đi phải có ít nhất 2 ký tự';
    }

    if (!formData.endPoint || formData.endPoint.length < 2) {
      newErrors.endPoint = 'Điểm đến phải có ít nhất 2 ký tự';
    }

    if (!formData.displayTime || !/^\d{2}:\d{2}$/.test(formData.displayTime)) {
      newErrors.displayTime = 'Giờ hiển thị không hợp lệ (HH:MM)';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Giá tiền phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <motion.div 
      className="fake-notification-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>{template ? '✏️ Sửa thông báo' : '➕ Tạo thông báo mới'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Vùng miền *</label>
            <select
              value={formData.region}
              onChange={(e) => handleChange('region', e.target.value)}
              required
            >
              <option value="north">Miền Bắc</option>
              <option value="central">Miền Trung</option>
              <option value="south">Miền Nam</option>
            </select>
          </div>

          <div className="form-group">
            <label>Loại xe *</label>
            <select
              value={formData.carType}
              onChange={(e) => handleChange('carType', e.target.value)}
              required
            >
              <option value="4">4 chỗ</option>
              <option value="7">7 chỗ</option>
              <option value="16">16 chỗ</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Điểm đi *</label>
            <select
              value={formData.startPoint}
              onChange={(e) => handleChange('startPoint', e.target.value)}
              disabled={!formData.region}
              required
            >
              <option value="">-- Chọn điểm đi --</option>
              {formData.region && provincesByRegion[formData.region]?.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.startPoint && <span className="error-text">{errors.startPoint}</span>}
          </div>

          <div className="form-group">
            <label>Điểm đến *</label>
            <select
              value={formData.endPoint}
              onChange={(e) => handleChange('endPoint', e.target.value)}
              disabled={!formData.region}
              required
            >
              <option value="">-- Chọn điểm đến --</option>
              {formData.region && provincesByRegion[formData.region]?.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.endPoint && <span className="error-text">{errors.endPoint}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Giờ hiển thị *</label>
            <input
              type="time"
              value={formData.displayTime}
              onChange={(e) => handleChange('displayTime', e.target.value)}
              required
            />
            {errors.displayTime && <span className="error-text">{errors.displayTime}</span>}
          </div>

          <div className="form-group">
            <label>Giá tiền (VND) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
              placeholder="VD: 1200000"
              min="0"
              required
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
            />
            <span>Bật thông báo ngay</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {template ? 'Cập nhật' : 'Tạo mới'}
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default FakeNotificationForm;
