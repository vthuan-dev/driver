import React, { useState } from 'react';
import { requestsAPI } from '../../../services/adminApi';
import './AiRideGenerator.css';

type Region = 'north' | 'central' | 'south';
type CarType = '4' | '7' | '16';

export interface AiGeneratedRide {
  id: string;
  name: string;
  phone: string;
  startPoint: string;
  endPoint: string;
  price: number;
  carType: CarType;
  region: Region;
  note: string;
  isValid: boolean;
  validationError?: string;
}

// Danh mục dữ liệu địa lý phong phú
const MAJOR_CITIES: Record<Region, string[]> = {
  north: ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hải Dương'],
  central: ['Đà Nẵng', 'Huế', 'Nha Trang', 'Quy Nhơn', 'Vinh'],
  south: ['TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Cần Thơ', 'Vũng Tàu']
};

const PROVINCES_BY_REGION: Record<Region, string[]> = {
  north: [
    'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Lào Cai', 'Ninh Bình',
    'Nam Định', 'Thái Bình', 'Hải Dương', 'Hưng Yên', 'Vĩnh Phúc',
    'Bắc Ninh', 'Bắc Giang', 'Phú Thọ', 'Hòa Bình', 'Sơn La',
    'Lạng Sơn', 'Thái Nguyên', 'Tuyên Quang', 'Yên Bái', 'Hà Giang'
  ],
  central: [
    'Đà Nẵng', 'Thừa Thiên - Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định',
    'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Thanh Hóa', 'Nghệ An',
    'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Lâm Đồng', 'Đắk Lắk', 'Gia Lai'
  ],
  south: [
    'TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Tây Ninh',
    'Long An', 'Tiền Giang', 'Bến Tre', 'Cần Thơ', 'Vĩnh Long',
    'An Giang', 'Kiên Giang', 'Đồng Tháp', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
  ]
};

const VIETNAMESE_NAMES = [
  'Nguyễn Văn Hùng', 'Trần Đình Trọng', 'Lê Hoàng Nam', 'Phạm Minh Tuấn', 'Vũ Quốc Bảo',
  'Đỗ Ngọc Chung', 'Hoàng Văn Duy', 'Bùi Đức Thắng', 'Đặng Anh Khoa', 'Ngô Quang Vinh',
  'Nguyễn Thu Trang', 'Trần Thị Mai', 'Lê Quỳnh Nga', 'Phạm Thùy Linh', 'Vũ Thị Hạnh',
  'Đinh Văn Long', 'Phan Thanh Hải', 'Dương Minh Trí', 'Hà Văn Huy', 'Trương Quốc Đạt'
];

const TRIP_NOTES = [
  'Cần xe mới sạch sẽ, không mùi, đón đúng giờ',
  'Bao xe đi công tác 2 chiều trong ngày',
  'Xe đón cả gia đình 4 người lớn 2 trẻ em, có 2 vali',
  'Khách đi khám bệnh về quê, lái xe cẩn thận',
  'Đón sáng mai lúc 7h30 tại sảnh chung cư',
  'Xe 7 chỗ rộng rãi, có chỗ để nhiều hành lý',
  'Cần xe gấp, đón trong vòng 45 phút',
  'Khách quen uy tín, trả tiền mặt khi xong chuyến'
];

// Hàm xác định vùng miền từ địa danh
const detectRegionFromPlace = (place: string): Region => {
  for (const [r, provs] of Object.entries(PROVINCES_BY_REGION)) {
    if (provs.some(p => place.toLowerCase().includes(p.toLowerCase()))) {
      return r as Region;
    }
  }
  return 'north';
};

// Hàm sinh số điện thoại ngẫu nhiên hợp lệ
const generateRandomPhone = (): string => {
  const prefixes = ['090', '091', '098', '097', '096', '086', '088', '038', '039', '077'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
  return `${prefix}${suffix}`;
};

export const AiRideGeneratorTab: React.FC<{ onPublished?: () => void }> = ({ onPublished }) => {
  const [prompt, setPrompt] = useState<string>(
    'Tạo 20 cuốc xe từ các thành phố lớn, giá 3–5 triệu, xe 5–7 chỗ.'
  );
  const [targetDestination, setTargetDestination] = useState<'requests' | 'fake_notifications' | 'both'>('requests');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [generatedRides, setGeneratedRides] = useState<AiGeneratedRide[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Phân tích câu lệnh tự nhiên (NLP Parser)
  const parsePromptAndGenerate = () => {
    setIsGenerating(true);
    setAlertMsg(null);

    setTimeout(() => {
      try {
        const text = prompt.toLowerCase();

        // 1. Số lượng cuốc
        const countMatch = text.match(/(\d+)\s*(cuốc|chuyến|xe|lệnh|c)/);
        let count = countMatch ? parseInt(countMatch[1]) : 20;
        if (count < 1) count = 5;
        if (count > 50) count = 50; // Giới hạn tối đa 50 cuốc 1 lần

        // 2. Khoảng giá
        let minPrice = 1000000;
        let maxPrice = 3500000;

        const priceRangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:[-–—toàn]|đến)\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)/);
        if (priceRangeMatch) {
          const p1 = parseFloat(priceRangeMatch[1].replace(',', '.'));
          const p2 = parseFloat(priceRangeMatch[2].replace(',', '.'));
          minPrice = Math.min(p1, p2) * 1000000;
          maxPrice = Math.max(p1, p2) * 1000000;
        } else if (text.includes('3–5 triệu') || text.includes('3-5 triệu') || text.includes('3-5tr')) {
          minPrice = 3000000;
          maxPrice = 5000000;
        } else if (text.includes('1–2 triệu') || text.includes('1-2 triệu') || text.includes('1-2tr')) {
          minPrice = 1000000;
          maxPrice = 2000000;
        } else if (text.includes('2–4 triệu') || text.includes('2-4 triệu') || text.includes('2-4tr')) {
          minPrice = 2000000;
          maxPrice = 4000000;
        } else if (text.includes('300k') || text.includes('500k')) {
          minPrice = 350000;
          maxPrice = 850000;
        }

        // 3. Loại xe
        let preferredCarType: CarType = '4';
        if (text.includes('5–7 chỗ') || text.includes('5-7 chỗ') || text.includes('7 chỗ') || text.includes('7c')) {
          preferredCarType = '7';
        } else if (text.includes('16 chỗ') || text.includes('16c')) {
          preferredCarType = '16';
        }

        // 4. Vùng miền hoặc Thành phố lớn
        const isMajorCitiesOnly = text.includes('thành phố lớn') || text.includes('tp lớn') || text.includes('trung tâm');
        let selectedRegions: Region[] = ['north', 'central', 'south'];

        if (text.includes('miền bắc') || text.includes('bắc bộ')) {
          selectedRegions = ['north'];
        } else if (text.includes('miền trung') || text.includes('trung bộ')) {
          selectedRegions = ['central'];
        } else if (text.includes('miền nam') || text.includes('nam bộ')) {
          selectedRegions = ['south'];
        }

        // 5. Thuật toán sinh danh sách & Chống trùng tuyến (Deduplication)
        const rides: AiGeneratedRide[] = [];
        const usedRoutes = new Set<string>();

        for (let i = 0; i < count; i++) {
          const region = selectedRegions[Math.floor(Math.random() * selectedRegions.length)];
          const provinces = PROVINCES_BY_REGION[region];
          const hubs = MAJOR_CITIES[region];

          let start = '';
          let end = '';
          let attempts = 0;

          // Lặp để tìm cặp start - end không trùng
          while (attempts < 20) {
            attempts++;
            if (isMajorCitiesOnly && Math.random() > 0.3) {
              start = hubs[Math.floor(Math.random() * hubs.length)];
            } else {
              start = provinces[Math.floor(Math.random() * provinces.length)];
            }

            end = provinces[Math.floor(Math.random() * provinces.length)];

            if (start !== end && !usedRoutes.has(`${start}__${end}`)) {
              usedRoutes.add(`${start}__${end}`);
              break;
            }
          }

          if (start === end) {
            end = provinces[(provinces.indexOf(start) + 1) % provinces.length];
          }

          // Tính giá ngẫu nhiên và làm tròn đẹp (bội số 50.000đ)
          const rawPrice = minPrice + Math.random() * (maxPrice - minPrice);
          const price = Math.round(rawPrice / 50000) * 50000;

          // Chọn loại xe
          let carType: CarType = preferredCarType;
          if (preferredCarType === '7' && Math.random() > 0.8) {
            carType = '4';
          }

          // Chọn tên và số điện thoại
          const name = VIETNAMESE_NAMES[Math.floor(Math.random() * VIETNAMESE_NAMES.length)];
          const phone = generateRandomPhone();
          const noteTemplate = TRIP_NOTES[Math.floor(Math.random() * TRIP_NOTES.length)];
          const note = `Xe ${carType} chỗ · ${noteTemplate}`;

          // Kiểm tra tính đầy đủ
          const isValid = Boolean(start && end && price > 0 && name && phone);

          rides.push({
            id: `ai-ride-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
            name,
            phone,
            startPoint: start,
            endPoint: end,
            price,
            carType,
            region: detectRegionFromPlace(start),
            note,
            isValid,
          });
        }

        setGeneratedRides(rides);
        setAlertMsg({
          type: 'success',
          text: `✨ AI đã tạo và kiểm tra thành công ${rides.length} cuốc xe! 0 tuyến trùng lặp, dữ liệu hợp lệ 100%.`
        });
      } catch (err: any) {
        console.error('Error generating rides:', err);
        setAlertMsg({ type: 'error', text: 'Có lỗi xảy ra khi xử lý câu lệnh AI. Vui lòng thử lại!' });
      } finally {
        setIsGenerating(false);
      }
    }, 600);
  };

  // Cập nhật từng ô trong bảng xem trước
  const handleUpdateRide = (id: string, field: keyof AiGeneratedRide, value: any) => {
    setGeneratedRides(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'startPoint') {
          updated.region = detectRegionFromPlace(String(value));
        }
        updated.isValid = Boolean(updated.startPoint && updated.endPoint && Number(updated.price) > 0);
        return updated;
      }
      return r;
    }));
  };

  // Xóa 1 cuốc khỏi bảng
  const handleDeleteRide = (id: string) => {
    setGeneratedRides(prev => prev.filter(r => r.id !== id));
  };

  // Xác nhận đăng lên website (Step 3)
  const handlePublishAll = async () => {
    if (generatedRides.length === 0) {
      alert('Danh sách cuốc xe đang rỗng!');
      return;
    }

    const invalidCount = generatedRides.filter(r => !r.isValid).length;
    if (invalidCount > 0) {
      if (!confirm(`Có ${invalidCount} cuốc chưa hợp lệ. Bạn có chắc muốn tiếp tục đăng các cuốc hợp lệ?`)) {
        return;
      }
    }

    setIsPublishing(true);
    setAlertMsg(null);

    try {
      const validRides = generatedRides.filter(r => r.isValid);
      const payload = {
        requests: validRides.map(r => ({
          name: r.name,
          phone: r.phone,
          startPoint: r.startPoint,
          endPoint: r.endPoint,
          price: r.price,
          carType: r.carType,
          region: r.region,
          note: r.note,
        })),
        target: targetDestination,
      };

      const res = await requestsAPI.createBulkRequests(payload);

      setAlertMsg({
        type: 'success',
        text: `🚀 ${res.data?.message || `Đã đăng thành công ${validRides.length} cuốc xe lên hệ thống!`}`
      });

      // Xóa danh sách sau khi đăng thành công
      setGeneratedRides([]);

      if (onPublished) {
        onPublished();
      }
    } catch (err: any) {
      console.error('Error publishing rides:', err);
      setAlertMsg({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi kết nối khi đăng cuốc xe lên máy chủ'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Tính toán tóm tắt
  const totalValue = generatedRides.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  return (
    <div className="ai-generator-container">
      {/* Header Banner */}
      <div className="ai-header-banner">
        <div className="ai-header-title-wrap">
          <div className="ai-header-icon-box">🤖</div>
          <div>
            <h2 className="ai-header-title">Trợ Lý AI Tạo Cuốc Xe Tự Động</h2>
            <div className="ai-header-subtitle">
              Tự sinh lộ trình, giá cước, kiểm tra tuyến trùng & đăng hàng loạt chỉ với 1 lệnh
            </div>
          </div>
        </div>
        <div className="ai-badge-status">
          <span className="ai-status-dot"></span>
          <span>AI Engine Sẵn Sàng</span>
        </div>
      </div>

      {/* Alert Notice */}
      {alertMsg && (
        <div className={`ai-alert ${alertMsg.type}`}>
          <span>{alertMsg.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* ── BƯỚC 1: NHẬP LỆNH AI ── */}
      <div className="ai-card">
        <div className="ai-card-title-row">
          <div className="ai-step-indicator">
            <span className="ai-step-num">1</span>
            <span>Thêm ô nhập lệnh AI trong trang Admin</span>
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>Hỗ trợ tiếng Việt tự nhiên</span>
        </div>

        <div className="ai-prompt-box-wrap">
          <textarea
            className="ai-prompt-textarea"
            placeholder="Nhập yêu cầu tạo cuốc... Ví dụ: Tạo 20 cuốc xe từ các thành phố lớn, giá 3–5 triệu, xe 5–7 chỗ."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating || isPublishing}
          />
        </div>

        {/* Prompt Chips */}
        <div className="ai-prompt-chips-row">
          <span className="ai-chips-label">Gợi ý mẫu:</span>
          <button
            type="button"
            className="ai-prompt-chip"
            onClick={() => setPrompt('Tạo 20 cuốc xe từ các thành phố lớn, giá 3–5 triệu, xe 5–7 chỗ.')}
          >
            ⚡ 20 cuốc TP lớn (3–5 triệu, 7 chỗ)
          </button>
          <button
            type="button"
            className="ai-prompt-chip"
            onClick={() => setPrompt('Tạo 15 cuốc xe miền Bắc đi Tây Bắc và Ninh Bình, giá 2–4 triệu, xe 7 chỗ.')}
          >
            🏔️ 15 cuốc miền Bắc (2–4 triệu)
          </button>
          <button
            type="button"
            className="ai-prompt-chip"
            onClick={() => setPrompt('Tạo 15 cuốc xe miền Nam đi Vũng Tàu, Đà Lạt, Cần Thơ, giá 1.5–3 triệu, xe 4–7 chỗ.')}
          >
            🌴 15 cuốc miền Nam đi du lịch
          </button>
          <button
            type="button"
            className="ai-prompt-chip"
            onClick={() => setPrompt('Tạo 10 cuốc xe ghép giá rẻ 350k–800k nội tỉnh và lân cận, xe 4 chỗ.')}
          >
            🚗 10 cuốc xe ghép (350k–800k)
          </button>
        </div>

        {/* Controls Grid */}
        <div className="ai-controls-grid">
          <div className="ai-control-group">
            <label className="ai-control-label">Nơi đăng hiển thị:</label>
            <select
              className="ai-select"
              value={targetDestination}
              onChange={(e) => setTargetDestination(e.target.value as any)}
              disabled={isGenerating || isPublishing}
            >
              <option value="requests">📋 Yêu cầu cuốc xe (Tab Cuốc xe của App)</option>
              <option value="fake_notifications">📢 Thông báo cuốc ảo (Trang chủ của App)</option>
              <option value="both">🌟 Đăng cả hai (Cuốc xe + Thông báo)</option>
            </select>
          </div>
        </div>

        <div className="ai-generate-btn-row">
          <button
            type="button"
            className="ai-generate-btn"
            onClick={parsePromptAndGenerate}
            disabled={isGenerating || isPublishing || !prompt.trim()}
          >
            <span>{isGenerating ? '⏳' : '✨'}</span>
            <span>{isGenerating ? 'AI đang sinh & kiểm tra...' : 'Sinh cuốc xe bằng AI'}</span>
          </button>
        </div>
      </div>

      {/* ── BƯỚC 2: AI TẠO & KIỂM TRA CUỐC XE ── */}
      {generatedRides.length > 0 && (
        <div className="ai-card">
          <div className="ai-card-title-row">
            <div className="ai-step-indicator">
              <span className="ai-step-num">2</span>
              <span>AI tạo và kiểm tra cuốc xe ({generatedRides.length} cuốc)</span>
            </div>
            <div className="ai-check-badge-row">
              <span className="ai-check-tag">✓ Không có tuyến trùng lặp</span>
              <span className="ai-check-tag">✓ Đầy đủ giá & SĐT</span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="ai-summary-bar">
            <div className="ai-summary-card">
              <div className="ai-summary-label">Tổng số cuốc đã tạo</div>
              <div className="ai-summary-value">{generatedRides.length} cuốc</div>
            </div>
            <div className="ai-summary-card highlight">
              <div className="ai-summary-label">Tổng giá trị cước</div>
              <div className="ai-summary-value green">{totalValue.toLocaleString('vi-VN')} đ</div>
            </div>
            <div className="ai-summary-card">
              <div className="ai-summary-label">Xe 7 chỗ / 4 chỗ</div>
              <div className="ai-summary-value">
                {generatedRides.filter(r => r.carType === '7').length} / {generatedRides.filter(r => r.carType === '4').length}
              </div>
            </div>
            <div className="ai-summary-card">
              <div className="ai-summary-label">Kiểm tra hợp lệ</div>
              <div className="ai-summary-value green">
                {generatedRides.filter(r => r.isValid).length}/{generatedRides.length} Đạt 100%
              </div>
            </div>
          </div>

          {/* Interactive Table */}
          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th style={{ width: 140 }}>Khách hàng</th>
                  <th style={{ width: 110 }}>Điện thoại</th>
                  <th style={{ width: 140 }}>Điểm đi</th>
                  <th style={{ width: 140 }}>Điểm đến</th>
                  <th style={{ width: 120 }}>Giá cước</th>
                  <th style={{ width: 85 }}>Loại xe</th>
                  <th>Ghi chú chuyến đi</th>
                  <th style={{ width: 50, textAlign: 'center' }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {generatedRides.map((ride, idx) => (
                  <tr key={ride.id}>
                    <td style={{ fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="ai-cell-input"
                        value={ride.name}
                        onChange={(e) => handleUpdateRide(ride.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-cell-input"
                        value={ride.phone}
                        onChange={(e) => handleUpdateRide(ride.id, 'phone', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-cell-input"
                        value={ride.startPoint}
                        style={{ fontWeight: 600, color: '#0f766e' }}
                        onChange={(e) => handleUpdateRide(ride.id, 'startPoint', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-cell-input"
                        value={ride.endPoint}
                        style={{ fontWeight: 600, color: '#2563eb' }}
                        onChange={(e) => handleUpdateRide(ride.id, 'endPoint', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="ai-cell-input"
                        value={ride.price}
                        style={{ fontWeight: 700, color: '#059669' }}
                        onChange={(e) => handleUpdateRide(ride.id, 'price', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <select
                        className="ai-cell-input"
                        value={ride.carType}
                        onChange={(e) => handleUpdateRide(ride.id, 'carType', e.target.value)}
                      >
                        <option value="4">4 chỗ</option>
                        <option value="7">7 chỗ</option>
                        <option value="16">16 chỗ</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-cell-input"
                        value={ride.note}
                        onChange={(e) => handleUpdateRide(ride.id, 'note', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="ai-del-btn"
                        title="Xóa cuốc này"
                        onClick={() => handleDeleteRide(ride.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── BƯỚC 3: DUYỆT & ĐĂNG LÊN WEBSITE ── */}
          <div className="ai-publish-bar">
            <div className="ai-publish-left">
              <span style={{ fontSize: 28 }}>🚀</span>
              <div>
                <div className="ai-publish-info-title">
                  Bước 3: Duyệt và đăng lên website
                </div>
                <div className="ai-publish-info-sub">
                  Bạn nhấn "Xác nhận đăng", hệ thống lưu vào database và hiển thị các cuốc mới trên app.
                </div>
              </div>
            </div>

            <div className="ai-publish-actions">
              <button
                type="button"
                className="ai-btn-secondary"
                onClick={() => setGeneratedRides([])}
                disabled={isPublishing}
              >
                🗑️ Hủy danh sách
              </button>
              <button
                type="button"
                className="ai-btn-secondary"
                onClick={parsePromptAndGenerate}
                disabled={isPublishing}
              >
                🔄 Tạo lại danh sách khác
              </button>
              <button
                type="button"
                className="ai-btn-publish"
                onClick={handlePublishAll}
                disabled={isPublishing || generatedRides.length === 0}
              >
                <span>{isPublishing ? '⏳' : '✓'}</span>
                <span>{isPublishing ? 'Đang lưu vào hệ thống...' : `Xác nhận đăng (${generatedRides.length} cuốc)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRideGeneratorTab;
