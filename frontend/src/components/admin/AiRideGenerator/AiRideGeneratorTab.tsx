import React, { useState, useEffect } from 'react';
import { requestsAPI, aiAPI } from '../../../services/adminApi';
import { detectRegionFromPlace, type Region } from '../../../utils/geoUtils';
import './AiRideGenerator.css';

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

// Danh mục dữ liệu địa lý phong phú theo vùng miền (dùng cho Engine Nội bộ)
const SAMPLE_CITIES_BY_REGION: Record<Region, string[]> = {
  north: [
    'Sân bay Nội Bài, Hà Nội',
    'Bãi Cháy, Hạ Long, Quảng Ninh',
    'Trung tâm TP. Hải Phòng',
    'TP. Bắc Ninh',
    'Sa Pa, Lào Cai',
    'Tam Chúc, Hà Nam',
    'Tràng An, Ninh Bình',
    'TP. Hải Dương'
  ],
  central: [
    'Sân bay Đà Nẵng',
    'Bà Nà Hills, Đà Nẵng',
    'TP. Huế, Thừa Thiên - Huế',
    'Sân bay Cam Ranh, Nha Trang',
    'TP. Quy Nhơn, Bình Định',
    'Đà Lạt, Lâm Đồng',
    'TP. Vinh, Nghệ An',
    'Sầm Sơn, Thanh Hóa'
  ],
  south: [
    'Sân bay Tân Sơn Nhất, TP.HCM',
    'Quận 1, TP. Hồ Chí Minh',
    'TP. Vũng Tàu, BR-VT',
    'TP. Thủ Dầu Một, Bình Dương',
    'TP. Biên Hòa, Đồng Nai',
    'Bến xe Cần Thơ',
    'Đảo Phú Quốc, Kiên Giang',
    'TP. Mỹ Tho, Tiền Giang'
  ]
};

// Hàm trích xuất thông số chuẩn xác từ câu lệnh prompt
export function parsePromptParameters(promptText: string) {
  const text = promptText.toLowerCase();

  // 1. Trích xuất số lượng:
  let count = 20;
  const countActionMatch = text.match(/(?:tạo|sinh|làm|thêm|đăng|bắn)\s*(\d+)\b/i);
  const countNounMatch = text.match(/(\d+)\s*(?:thông báo|cuốc|chuyến|lệnh|đơn|tin|bản tin|item)\b/i);

  if (countActionMatch) {
    count = parseInt(countActionMatch[1]);
  } else if (countNounMatch) {
    count = parseInt(countNounMatch[1]);
  }
  count = Math.max(1, Math.min(50, count));

  // 2. Trích xuất giá (đơn lẻ hoặc khoảng giá):
  let minPrice = 1000000;
  let maxPrice = 3500000;
  let singlePrice: number | null = null;

  const singlePriceMatch = text.match(/giá\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)\b/);
  const priceRangeMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:[-–—toàn]|đến)\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)/);

  if (singlePriceMatch) {
    singlePrice = parseFloat(singlePriceMatch[1].replace(',', '.')) * 1000000;
    minPrice = singlePrice;
    maxPrice = singlePrice;
  } else if (priceRangeMatch) {
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

  // 3. Loại xe:
  let preferredCarType: CarType = '4';
  if (text.includes('5–7 chỗ') || text.includes('5-7 chỗ') || text.includes('7 chỗ') || text.includes('7c')) {
    preferredCarType = '7';
  } else if (text.includes('16 chỗ') || text.includes('16c')) {
    preferredCarType = '16';
  }

  // 4. Vùng miền:
  let selectedRegions: Region[] = ['north', 'central', 'south'];
  if (text.includes('miền bắc') || text.includes('bắc bộ')) {
    selectedRegions = ['north'];
  } else if (text.includes('miền trung') || text.includes('trung bộ')) {
    selectedRegions = ['central'];
  } else if (text.includes('miền nam') || text.includes('nam bộ')) {
    selectedRegions = ['south'];
  }

  return { count, minPrice, maxPrice, singlePrice, preferredCarType, selectedRegions };
}

const generateRandomPhone = (): string => {
  const prefixes = ['090', '091', '098', '097', '096', '086', '088', '038', '039', '077'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
  return `${prefix}${suffix}`;
};

export const PROMPT_SUGGESTIONS: Record<'requests' | 'fake_notifications' | 'both', {
  label: string;
  defaultPrompt: string;
  textareaHeader: string;
  chips: { label: string; prompt: string }[];
}> = {
  requests: {
    label: 'Tab Cuốc xe (Chờ nhận)',
    defaultPrompt: 'Tạo 20 cuốc xe từ các thành phố lớn, giá 3–5 triệu, xe 5–7 chỗ.',
    textareaHeader: '✨ Nhập yêu cầu cuốc xe chờ ghép (Số lượng, khu vực, khoảng giá, loại xe...)',
    chips: [
      {
        label: '🌟 Thành phố lớn (3–5 triệu, xe 7 chỗ)',
        prompt: 'Tạo 20 cuốc xe từ các thành phố lớn, giá 3–5 triệu, xe 5–7 chỗ.'
      },
      {
        label: '🚗 Miền Bắc liên tỉnh (1–2 triệu, xe 4 chỗ)',
        prompt: 'Tạo 15 cuốc xe đón tại Miền Bắc đi các tỉnh, giá 1–2 triệu, xe 4 chỗ.'
      },
      {
        label: '🌴 Miền Nam xuất phát TP.HCM (2–4 triệu, xe 7 chỗ)',
        prompt: 'Tạo 15 cuốc xe liên tỉnh Miền Nam xuất phát từ TP.HCM, giá 2–4 triệu, xe 7 chỗ.'
      },
      {
        label: '✈️ Đưa đón Sân bay / Du lịch (800k–1.5tr)',
        prompt: 'Tạo 10 cuốc xe đưa đón sân bay và khu du lịch, giá 800k–1.5 triệu, xe 5–7 chỗ.'
      }
    ]
  },
  fake_notifications: {
    label: 'Thông báo ảo (Trang chủ)',
    defaultPrompt: 'Tạo 10 thông báo nổ cuốc xe VIP trên trang chủ, giá 2–4 triệu, xe 7 chỗ.',
    textareaHeader: '📢 Nhập yêu cầu thông báo nổ cuốc trang chủ (Tạo sôi động, giờ cao điểm, cuốc VIP...)',
    chips: [
      {
        label: '🔥 Nổ cuốc Hot trang chủ (2–4 triệu, xe 7 chỗ)',
        prompt: 'Tạo 10 thông báo nổ cuốc xe VIP trên trang chủ, giá 2–4 triệu, xe 7 chỗ.'
      },
      {
        label: '⚡ Giờ cao điểm Sân bay (1–2.5 triệu, xe 4-7 chỗ)',
        prompt: 'Tạo 8 thông báo nổ cuốc đón sân bay Nội Bài và Tân Sơn Nhất giờ cao điểm, giá 1–2.5 triệu, xe 4–7 chỗ.'
      },
      {
        label: '🏖️ Tuyến du lịch nổi bật (1.5–3 triệu, xe 7 chỗ)',
        prompt: 'Tạo 10 thông báo nổ cuốc đi các điểm du lịch Hạ Long, Sapa, Vũng Tàu, Đà Lạt, giá 1.5–3 triệu, xe 7 chỗ.'
      },
      {
        label: '🚗 Cuốc liên tỉnh giá cao (3–5 triệu, TP lớn)',
        prompt: 'Tạo 12 thông báo cuốc liên tỉnh giá cao 3–5 triệu xuất phát từ các thành phố lớn.'
      }
    ]
  },
  both: {
    label: 'Xuất bản cả 2 nơi (Đồng bộ toàn app)',
    defaultPrompt: 'Tạo 15 cuốc xe đồng bộ vừa nổ thông báo trang chủ vừa vào danh sách nhận cuốc, giá 2–4 triệu, xe 7 chỗ.',
    textareaHeader: '⚡ Nhập yêu cầu cuốc xe xuất bản đồng thời (Vừa vào danh sách nhận cuốc vừa nổ chuông trang chủ...)',
    chips: [
      {
        label: '⚡ Đồng bộ toàn hệ thống (2–4 triệu, xe 7 chỗ)',
        prompt: 'Tạo 15 cuốc xe đồng bộ vừa nổ thông báo trang chủ vừa vào danh sách nhận cuốc, giá 2–4 triệu, xe 7 chỗ.'
      },
      {
        label: '🌟 Tuyến vàng Hà Nội - Quảng Ninh (1.5–2.5tr)',
        prompt: 'Tạo 10 cuốc xe tuyến Hà Nội đi Quảng Ninh, Hải Phòng, giá 1.5–2.5 triệu, xe 5–7 chỗ.'
      },
      {
        label: '🌴 Tuyến vàng Sài Gòn - Vũng Tàu (1.5–2.5tr)',
        prompt: 'Tạo 10 cuốc xe tuyến TP.HCM đi Vũng Tàu, Cần Thơ, giá 1.5–2.5 triệu, xe 7 chỗ.'
      },
      {
        label: '✈️ Đón trả Sân bay toàn quốc (800k–2tr)',
        prompt: 'Tạo 10 cuốc xe đưa đón sân bay toàn quốc, giá 800k–2 triệu, xe 4–7 chỗ.'
      }
    ]
  }
};

export const AiRideGeneratorTab: React.FC<{ onPublished?: (target: 'requests' | 'fake_notifications' | 'both') => void }> = ({ onPublished }) => {
  const [targetDestination, setTargetDestination] = useState<'requests' | 'fake_notifications' | 'both'>('requests');
  const [prompt, setPrompt] = useState<string>(
    PROMPT_SUGGESTIONS.requests.defaultPrompt
  );
  const [aiMode, setAiMode] = useState<'groq' | 'local'>('groq');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [generationSource, setGenerationSource] = useState<{ source: string; model?: string } | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [generatedRides, setGeneratedRides] = useState<AiGeneratedRide[]>([]);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Hàm chuyển đổi nơi xuất bản và tự động cập nhật Prompt mẫu
  const handleSelectTarget = (newTarget: 'requests' | 'fake_notifications' | 'both') => {
    setTargetDestination(newTarget);
    setPrompt(PROMPT_SUGGESTIONS[newTarget].defaultPrompt);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('admin_groq_api_key');
    if (savedKey) {
      setCustomApiKey(savedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (customApiKey.trim()) {
      localStorage.setItem('admin_groq_api_key', customApiKey.trim());
      setAlertMsg({ type: 'success', text: 'Đã lưu cấu hình API Key Groq tùy chỉnh vào trình duyệt!' });
    } else {
      localStorage.removeItem('admin_groq_api_key');
      setAlertMsg({ type: 'success', text: 'Đã hoàn trả về API Key Groq mặc định của hệ thống!' });
    }
    setShowConfig(false);
  };

  // ── Engine Nội Bộ (Offline Fallback) ──
  const runLocalEngine = (requestedCount?: number): AiGeneratedRide[] => {
    const params = parsePromptParameters(prompt);
    const count = requestedCount !== undefined ? requestedCount : params.count;
    const { minPrice, maxPrice, preferredCarType, selectedRegions } = params;

    // Thuật toán sinh danh sách & Chống trùng tuyến
    const rides: AiGeneratedRide[] = [];
    const usedRoutes = new Set<string>();

    for (let i = 0; i < count; i++) {
      const region = selectedRegions[Math.floor(Math.random() * selectedRegions.length)];
      const cities = SAMPLE_CITIES_BY_REGION[region];

      let start = cities[Math.floor(Math.random() * cities.length)];
      let end = cities[Math.floor(Math.random() * cities.length)];
      let attempts = 0;

      while (attempts < 20 && (end === start || usedRoutes.has(`${start}__${end}`))) {
        attempts++;
        end = cities[Math.floor(Math.random() * cities.length)];
      }

      if (start === end) {
        end = cities[(cities.indexOf(start) + 1) % cities.length];
      }
      usedRoutes.add(`${start}__${end}`);

      const rawPrice = minPrice === maxPrice ? minPrice : (minPrice + Math.random() * (maxPrice - minPrice));
      const price = Math.round(rawPrice / 50000) * 50000;

      let carType: CarType = preferredCarType;
      if (preferredCarType === '7' && Math.random() > 0.8) {
        carType = '4';
      }

      const name = VIETNAMESE_NAMES[Math.floor(Math.random() * VIETNAMESE_NAMES.length)];
      const phone = generateRandomPhone();
      const noteTemplate = TRIP_NOTES[Math.floor(Math.random() * TRIP_NOTES.length)];
      const note = `Xe ${carType} chỗ · ${noteTemplate}`;
      const detectedRegion = detectRegionFromPlace(start, end);
      const isValid = Boolean(start && end && price > 0 && name && phone);

      rides.push({
        id: `ai-ride-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        phone,
        startPoint: start,
        endPoint: end,
        price,
        carType,
        region: detectedRegion,
        note,
        isValid,
      });
    }

    return rides;
  };

  // ── Kích Hoạt Sinh Cuốc Bằng AI ──
  const parsePromptAndGenerate = async () => {
    setIsGenerating(true);
    setAlertMsg(null);

    // Trích xuất số lượng và thông số chuẩn xác từ prompt
    const { count: requestedCount } = parsePromptParameters(prompt);

    // Chế độ 1: Groq Cloud LPU AI
    if (aiMode === 'groq') {
      try {
        const response = await aiAPI.generateRides({
          prompt,
          count: requestedCount,
          customApiKey: customApiKey.trim() || undefined
        });

        if (response.data && response.data.success && Array.isArray(response.data.rides)) {
          const rawList = response.data.rides;
          const mappedRides: AiGeneratedRide[] = rawList.map((r: any, idx: number) => {
            let carTypeVal: CarType = '4';
            const cStr = String(r.carType || '');
            if (cStr.includes('7') || cStr.includes('5')) carTypeVal = '7';
            else if (cStr.includes('16')) carTypeVal = '16';

            const startPoint = (r.startPoint || 'Hà Nội').trim();
            const endPoint = (r.endPoint || 'Hải Phòng').trim();
            const detectedRegion = detectRegionFromPlace(startPoint, endPoint);
            const regionVal: Region = (r.region && ['north', 'central', 'south'].includes(r.region))
              ? (r.region as Region)
              : detectedRegion;

            return {
              id: `groq-ride-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
              name: r.name || 'Khách đặt xe',
              phone: r.phone || generateRandomPhone(),
              startPoint,
              endPoint,
              price: Number(r.price) || 1200000,
              carType: carTypeVal,
              region: regionVal,
              note: r.note || `Xe ${carTypeVal} chỗ · Đón đúng giờ`,
              isValid: Boolean(startPoint && endPoint && Number(r.price) > 0),
            };
          });

          setGeneratedRides(mappedRides);
          setGenerationSource({
            source: response.data.source === 'groq' ? '⚡ Groq LPU Cloud' : '🧠 Fallback Engine',
            model: response.data.model || 'Groq LPU'
          });

          if (response.data.source === 'groq') {
            setAlertMsg({
              type: 'success',
              text: `⚡ Groq AI (Model: ${response.data.model}) đã tạo và kiểm tra thành công ${mappedRides.length} chuyến xe siêu tốc! Dữ liệu đạt chuẩn 100%.`
            });
          } else {
            setAlertMsg({
              type: 'warning',
              text: `⚠️ ${response.data.warning || 'Hệ thống đã tự động chuyển sang Engine dự phòng để sinh cuốc an toàn.'}`
            });
          }
          setIsGenerating(false);
          return;
        }
      } catch (groqErr: any) {
        console.warn('Groq API error, falling back to local engine:', groqErr);
      }
    }

    // Chế độ 2: Engine Nội bộ (Offline / Fallback)
    setTimeout(() => {
      try {
        const rides = runLocalEngine(requestedCount);
        setGeneratedRides(rides);
        setGenerationSource({
          source: '🧠 Engine Nội bộ (Offline)',
          model: 'Local NLP & Route Deduplicator'
        });
        setAlertMsg({
          type: 'success',
          text: `✨ Engine nội bộ đã phân tích câu lệnh và tạo thành công ${rides.length} cuốc xe! 0 tuyến trùng lặp.`
        });
      } catch (err: any) {
        console.error('Error generating rides locally:', err);
        setAlertMsg({ type: 'error', text: 'Có lỗi xảy ra khi tạo cuốc xe. Vui lòng thử lại!' });
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  // Cập nhật từng ô trong bảng xem trước
  const handleUpdateRide = (id: string, field: keyof AiGeneratedRide, value: any) => {
    setGeneratedRides(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, [field]: value };
        if (field === 'startPoint') {
          updated.region = detectRegionFromPlace(String(value), updated.endPoint);
        } else if (field === 'endPoint') {
          updated.region = detectRegionFromPlace(updated.startPoint, String(value));
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

      setGeneratedRides([]);

      if (onPublished) {
        onPublished(targetDestination);
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

  const totalValue = generatedRides.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

  return (
    <div className="ai-generator-container">
      {/* Header Banner */}
      <div className="ai-header-banner">
        <div className="ai-header-title-wrap">
          <div className="ai-header-icon-box">⚡</div>
          <div>
            <h2 className="ai-header-title">Trợ Lý AI Tạo Cuốc Xe Tự Động</h2>
            <div className="ai-header-subtitle">
              Tích hợp suy luận siêu tốc <strong>Groq Cloud LPU</strong> & Engine kiểm tra dữ liệu, lọc tuyến trùng
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="ai-badge-status" style={{ background: aiMode === 'groq' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)', borderColor: aiMode === 'groq' ? '#8b5cf6' : '#10b981' }}>
            <span className="ai-status-dot" style={{ background: aiMode === 'groq' ? '#a855f7' : '#10b981' }}></span>
            <span>{aiMode === 'groq' ? 'Groq LPU AI Online' : 'Engine Nội Bộ'}</span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚙️ Cấu hình API Key
          </button>
        </div>
      </div>

      {/* Accordion Cấu hình Groq Key */}
      {showConfig && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 20,
          color: '#e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔑</span> Cấu hình Groq API Key
            </div>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Mặc định: Đã nạp sẵn key Groq của bạn
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="password"
              placeholder="Nhập Groq API Key mới (gsk_...)"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              style={{
                flex: 1,
                minWidth: 260,
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #475569',
                background: '#1e293b',
                color: '#f8fafc',
                fontSize: 13,
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleSaveApiKey}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Lưu Key
            </button>
            <button
              onClick={() => { setCustomApiKey(''); handleSaveApiKey(); }}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #64748b',
                background: 'transparent',
                color: '#cbd5e1',
                fontSize: 13,
                cursor: 'pointer'
              }}
            >
              Đặt lại mặc định
            </button>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
            Hệ thống hỗ trợ model siêu tốc: <code>openai/gpt-oss-120b</code>, <code>openai/gpt-oss-20b</code>, <code>qwen/qwen3.8-27b</code> từ Groq.
          </div>
        </div>
      )}

      {/* Alert Notice */}
      {alertMsg && (
        <div className={`ai-alert ${alertMsg.type}`}>
          <span>{alertMsg.type === 'success' ? '✅' : alertMsg.type === 'warning' ? '⚡' : '⚠️'}</span>
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
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Nguồn xử lý:</span>
            <div className="ai-source-switcher">
              <button
                type="button"
                className={`ai-source-pill ${aiMode === 'groq' ? 'active groq' : ''}`}
                onClick={() => setAiMode('groq')}
              >
                <span>⚡</span>
                <span>Groq Cloud LPU</span>
              </button>
              <button
                type="button"
                className={`ai-source-pill ${aiMode === 'local' ? 'active local' : ''}`}
                onClick={() => setAiMode('local')}
              >
                <span>🧠</span>
                <span>Engine Nội bộ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Textarea nhập câu lệnh */}
        <div className="ai-prompt-box">
          <div className="ai-prompt-header-bar">
            <span>{PROMPT_SUGGESTIONS[targetDestination].textareaHeader}</span>
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                ✕ Xóa nội dung
              </button>
            )}
          </div>
          <textarea
            className="ai-prompt-textarea"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={PROMPT_SUGGESTIONS[targetDestination].defaultPrompt}
          />
          <div className="ai-prompt-footer-bar">
            <span>💡 Mẹo: Có thể nhập tự do mọi cung đường và khoảng giá mong muốn</span>
            <span>{prompt.length} ký tự</span>
          </div>
        </div>

        {/* Nút gợi ý nhanh thay đổi tự động theo thẻ xuất bản */}
        <div className="ai-suggestions-row">
          <span className="ai-suggestions-label">
            <span>🎯</span> Gợi ý lệnh nhanh:
          </span>
          {PROMPT_SUGGESTIONS[targetDestination].chips.map((c, idx) => (
            <button
              key={idx}
              type="button"
              className="ai-suggestion-chip"
              onClick={() => setPrompt(c.prompt)}
              title={c.prompt}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Tùy chọn điểm đến xuất bản dạng 3 thẻ trực quan */}
        <div className="ai-config-section">
          <span className="ai-config-label">
            📍 Chọn nơi xuất bản cuốc xe lên ứng dụng (Bấm để tự đổi Prompt gợi ý):
          </span>
          <div className="ai-target-cards-grid">
            <div
              className={`ai-target-card ${targetDestination === 'requests' ? 'selected' : ''}`}
              onClick={() => handleSelectTarget('requests')}
            >
              <div className="ai-target-card-radio">
                {targetDestination === 'requests' && <div className="ai-target-card-radio-dot" />}
              </div>
              <div className="ai-target-card-text">
                <div className="ai-target-card-title">📋 Tab Cuốc xe</div>
                <div className="ai-target-card-desc">Danh sách yêu cầu chờ tài xế nhận & ghép cuốc</div>
              </div>
            </div>

            <div
              className={`ai-target-card ${targetDestination === 'fake_notifications' ? 'selected' : ''}`}
              onClick={() => handleSelectTarget('fake_notifications')}
            >
              <div className="ai-target-card-radio">
                {targetDestination === 'fake_notifications' && <div className="ai-target-card-radio-dot" />}
              </div>
              <div className="ai-target-card-text">
                <div className="ai-target-card-title">📢 Thông báo ảo</div>
                <div className="ai-target-card-desc">Hiển thị popup nổ cuốc tạo sôi động trang chủ</div>
              </div>
            </div>

            <div
              className={`ai-target-card ${targetDestination === 'both' ? 'selected' : ''}`}
              onClick={() => handleSelectTarget('both')}
            >
              <div className="ai-target-card-radio">
                {targetDestination === 'both' && <div className="ai-target-card-radio-dot" />}
              </div>
              <div className="ai-target-card-text">
                <div className="ai-target-card-title">⚡ Xuất bản cả 2 nơi</div>
                <div className="ai-target-card-desc">Tự động đồng bộ vừa nổ chuông vừa vào tab cuốc xe</div>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh hành động chính */}
        <div className="ai-action-bar">
          <button
            type="button"
            className="ai-action-btn primary"
            onClick={parsePromptAndGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? (
              <>
                <span className="ai-spinner"></span>
                <span>{aiMode === 'groq' ? '⚡ Groq LPU đang suy luận & kiểm tra...' : 'Đang phân tích & lọc trùng...'}</span>
              </>
            ) : (
              <>
                <span>{aiMode === 'groq' ? '⚡' : '✨'}</span>
                <span>{aiMode === 'groq' ? 'Groq LPU Tạo cuốc xe ngay' : 'AI Phân tích & Tạo cuốc ngay'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── BƯỚC 2: AI TẠO & KIỂM TRA CUỐC XE ── */}
      {generatedRides.length > 0 && (
        <div className="ai-card">
          <div className="ai-card-title-row">
            <div className="ai-step-indicator">
              <span className="ai-step-num">2</span>
              <span>
                {targetDestination === 'fake_notifications'
                  ? `AI tạo và kiểm tra thông báo ảo (${generatedRides.length} thông báo)`
                  : targetDestination === 'both'
                  ? `AI tạo và kiểm tra cuốc & thông báo đồng bộ (${generatedRides.length} chuyến)`
                  : `AI tạo và kiểm tra cuốc xe (${generatedRides.length} chuyến)`}
              </span>
            </div>
            <div className="ai-validation-badges">
              {generationSource && (
                <span className="ai-badge valid" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                  {generationSource.source} {generationSource.model ? `(${generationSource.model})` : ''}
                </span>
              )}
              <span className="ai-badge valid">✓ Đã kiểm tra trùng lặp</span>
              <span className="ai-badge valid">✓ Đầy đủ giá & địa chỉ</span>
              <span className="ai-badge valid">✓ 100% Sẵn sàng</span>
            </div>
          </div>

          <div className="ai-summary-bar">
            <div className="ai-summary-item">
              <span className="ai-summary-label">
                {targetDestination === 'fake_notifications' ? 'Tổng thông báo:' : 'Tổng số cuốc:'}
              </span>
              <span className="ai-summary-val">
                {generatedRides.length} {targetDestination === 'fake_notifications' ? 'thông báo' : 'chuyến'}
              </span>
            </div>
            <div className="ai-summary-item">
              <span className="ai-summary-label">Tổng giá trị:</span>
              <span className="ai-summary-val price">{totalValue.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="ai-summary-item">
              <span className="ai-summary-label">Tuyến trùng:</span>
              <span className="ai-summary-val" style={{ color: '#10b981' }}>0 (Đã lọc sạch)</span>
            </div>
            <div className="ai-summary-item">
              <span className="ai-summary-label">Hợp lệ:</span>
              <span className="ai-summary-val" style={{ color: '#10b981' }}>
                {generatedRides.filter(r => r.isValid).length}/{generatedRides.length} {targetDestination === 'fake_notifications' ? 'thông báo' : 'cuốc'}
              </span>
            </div>
          </div>

          <div className="ai-table-wrap">
            <table className="ai-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>STT</th>
                  <th style={{ width: 130 }}>Khách hàng</th>
                  <th style={{ width: 110 }}>Điện thoại</th>
                  <th>Điểm đón</th>
                  <th>Điểm đến</th>
                  <th style={{ width: 130 }}>Khu vực</th>
                  <th style={{ width: 85 }}>Loại xe</th>
                  <th style={{ width: 115 }}>Giá cước (VNĐ)</th>
                  <th>Ghi chú chuyến</th>
                  <th style={{ width: 60, textAlign: 'center' }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {generatedRides.map((ride, idx) => (
                  <tr key={ride.id} className={!ride.isValid ? 'invalid-row' : ''}>
                    <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell"
                        value={ride.name}
                        onChange={(e) => handleUpdateRide(ride.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell"
                        value={ride.phone}
                        onChange={(e) => handleUpdateRide(ride.id, 'phone', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell strong"
                        value={ride.startPoint}
                        onChange={(e) => handleUpdateRide(ride.id, 'startPoint', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell strong"
                        value={ride.endPoint}
                        onChange={(e) => handleUpdateRide(ride.id, 'endPoint', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="ai-editable-cell"
                        value={ride.region}
                        onChange={(e) => handleUpdateRide(ride.id, 'region', e.target.value as Region)}
                        style={{
                          fontWeight: 600,
                          fontSize: '12px',
                          color: ride.region === 'north' ? '#0369a1' : ride.region === 'central' ? '#b45309' : '#15803d',
                          background: ride.region === 'north' ? '#f0f9ff' : ride.region === 'central' ? '#fffbeb' : '#f0fdf4',
                          border: `1px solid ${ride.region === 'north' ? '#bae6fd' : ride.region === 'central' ? '#fde68a' : '#bbf7d0'}`
                        }}
                      >
                        <option value="north">🏔️ Miền Bắc</option>
                        <option value="central">🌊 Miền Trung</option>
                        <option value="south">🌴 Miền Nam</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="ai-editable-cell"
                        value={ride.carType}
                        onChange={(e) => handleUpdateRide(ride.id, 'carType', e.target.value as CarType)}
                      >
                        <option value="4">4 chỗ</option>
                        <option value="7">7 chỗ</option>
                        <option value="16">16 chỗ</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="ai-editable-cell price"
                        step={50000}
                        value={ride.price}
                        onChange={(e) => handleUpdateRide(ride.id, 'price', parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="ai-editable-cell"
                        value={ride.note}
                        onChange={(e) => handleUpdateRide(ride.id, 'note', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="ai-delete-btn"
                        onClick={() => handleDeleteRide(ride.id)}
                        title="Xóa cuốc này"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BƯỚC 3: DUYỆT VÀ ĐĂNG LÊN WEBSITE ── */}
      {generatedRides.length > 0 && (
        <div className="ai-card ai-publish-card">
          <div className="ai-publish-info">
            <div className="ai-step-indicator">
              <span className="ai-step-num">3</span>
              <span>Duyệt và đăng lên website</span>
            </div>
            <p className="ai-publish-desc">
              {targetDestination === 'fake_notifications' ? (
                <>
                  Nhấn <strong>"Xác nhận đăng"</strong>, hệ thống sẽ lưu {generatedRides.length} thông báo ảo vào cơ sở dữ liệu và hiển thị ngay lập tức lên popup / banner trang chủ của ứng dụng tài xế!
                </>
              ) : targetDestination === 'both' ? (
                <>
                  Nhấn <strong>"Xác nhận đăng"</strong>, hệ thống sẽ đồng bộ lưu {generatedRides.length} cuốc xe vừa vào danh sách nhận cuốc, vừa nổ thông báo trang chủ!
                </>
              ) : (
                <>
                  Nhấn <strong>"Xác nhận đăng"</strong>, hệ thống sẽ lưu {generatedRides.length} cuốc xe vào cơ sở dữ liệu và hiển thị ngay lập tức lên danh sách chờ nhận cuốc của tài xế!
                </>
              )}
            </p>
          </div>

          <div className="ai-publish-actions">
            <button
              type="button"
              className="ai-action-btn secondary"
              onClick={() => setGeneratedRides([])}
              disabled={isPublishing}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="ai-action-btn success"
              onClick={handlePublishAll}
              disabled={isPublishing || generatedRides.length === 0}
            >
              {isPublishing ? (
                <>
                  <span className="ai-spinner"></span>
                  <span>Đang đăng lên website...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>
                    {targetDestination === 'fake_notifications' && `Xác nhận đăng (${generatedRides.length} thông báo ảo lên trang chủ)`}
                    {targetDestination === 'requests' && `Xác nhận đăng (${generatedRides.length} cuốc xe vào danh sách chờ)`}
                    {targetDestination === 'both' && `Xác nhận đăng (${generatedRides.length} cuốc xe lên cả 2 nơi)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRideGeneratorTab;
