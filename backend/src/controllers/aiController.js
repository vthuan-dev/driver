const config = require('../config/config');
const { detectRegionFromPlace } = require('../utils/geoUtils');

// Danh sách các model Groq hỗ trợ suy luận văn bản & JSON
const GROQ_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b'
];

// Fallback generator phòng trường hợp Groq bị gián đoạn mạng
const FALLBACK_CITIES = [
  { city: 'Hà Nội', region: 'north' },
  { city: 'Hải Phòng', region: 'north' },
  { city: 'Quảng Ninh', region: 'north' },
  { city: 'Đà Nẵng', region: 'central' },
  { city: 'Nha Trang', region: 'central' },
  { city: 'Đà Lạt', region: 'central' },
  { city: 'TP. Hồ Chí Minh', region: 'south' },
  { city: 'Cần Thơ', region: 'south' },
  { city: 'Vũng Tàu', region: 'south' },
  { city: 'Phú Quốc', region: 'south' }
];
const FALLBACK_NAMES = ['Anh Tuấn', 'Chị Lan', 'Nguyễn Văn Hùng', 'Trần Thị Mai', 'Anh Dũng', 'Chị Hương', 'Bác Minh', 'Anh Hoàng', 'Chị Phương'];
const FALLBACK_CAR_TYPES = ['4 chỗ', '7 chỗ', '16 chỗ'];
const FALLBACK_NOTES = [
  'Đón đúng giờ, có 2 vali to',
  'Cần xe sạch không mùi, có trẻ nhỏ',
  'Chuyến công tác, đón sảnh A',
  'Khách đi sân bay, mang theo nhiều đồ',
  'Cần xe 7 chỗ rộng rãi, đi êm ái'
];

function parsePromptCountAndPrice(prompt = '', fallbackCount = 10) {
  const text = String(prompt).toLowerCase();

  let count = fallbackCount;
  const countActionMatch = text.match(/(?:tạo|sinh|làm|thêm|đăng|bắn)\s*(\d+)\b/i);
  const countNounMatch = text.match(/(\d+)\s*(?:thông báo|cuốc|chuyến|lệnh|đơn|tin|bản tin|item)\b/i);

  if (countActionMatch) {
    count = parseInt(countActionMatch[1]);
  } else if (countNounMatch) {
    count = parseInt(countNounMatch[1]);
  }

  if (count < 1) count = 1;
  if (count > 50) count = 50;

  let targetPrice = null;
  const singlePriceMatch = text.match(/giá\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m)\b/);
  if (singlePriceMatch) {
    targetPrice = parseFloat(singlePriceMatch[1].replace(',', '.')) * 1000000;
  }

  return { count, targetPrice };
}

function generateFallbackRides(count = 10, prompt = '') {
  const rides = [];
  const usedRoutes = new Set();
  const { targetPrice } = parsePromptCountAndPrice(prompt, count);
  
  for (let i = 0; i < count; i++) {
    const startObj = FALLBACK_CITIES[Math.floor(Math.random() * FALLBACK_CITIES.length)];
    let endObj = FALLBACK_CITIES[Math.floor(Math.random() * FALLBACK_CITIES.length)];
    while (endObj.city === startObj.city) {
      endObj = FALLBACK_CITIES[Math.floor(Math.random() * FALLBACK_CITIES.length)];
    }
    
    const routeKey = `${startObj.city}__${endObj.city}`;
    if (usedRoutes.has(routeKey) && usedRoutes.size < 40) {
      continue;
    }
    usedRoutes.add(routeKey);

    const randomPhone = '09' + Math.floor(10000000 + Math.random() * 90000000);
    const finalPrice = targetPrice ? Math.round(targetPrice) : (Math.floor(Math.random() * 20 + 5) * 100000);

    const startPoint = `Trung tâm ${startObj.city}`;
    const endPoint = `Trung tâm ${endObj.city}`;
    const region = detectRegionFromPlace(startPoint, endPoint);

    rides.push({
      name: FALLBACK_NAMES[i % FALLBACK_NAMES.length],
      phone: randomPhone,
      startPoint,
      endPoint,
      carType: FALLBACK_CAR_TYPES[Math.floor(Math.random() * FALLBACK_CAR_TYPES.length)],
      price: finalPrice,
      region,
      note: FALLBACK_NOTES[Math.floor(Math.random() * FALLBACK_NOTES.length)],
    });
  }
  return rides;
}

exports.generateRides = async (req, res) => {
  try {
    const { prompt = '', count = 10, customApiKey } = req.body;
    const apiKey = customApiKey?.trim() || config.GROQ_API_KEY;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu lệnh yêu cầu' });
    }

    // Trích xuất số lượng và giá mục tiêu từ prompt nếu có
    const parsedParams = parsePromptCountAndPrice(prompt, parseInt(count) || 10);
    const requestedCount = parsedParams.count;
    const targetPrice = parsedParams.targetPrice;

    // Thử gọi qua Groq API
    let groqSuccess = false;
    let generatedRides = [];
    let usedModel = '';
    let errorMessage = '';

    if (apiKey) {
      for (const model of GROQ_MODELS) {
        try {
          const systemInstruction = `Bạn là chuyên gia điều phối cuốc xe cho ứng dụng tài xế tại Việt Nam.
Nhiệm vụ của bạn là đọc yêu cầu người dùng và tạo danh sách ĐÚNG ${requestedCount} chuyến xe thực tế tại Việt Nam (không tạo thừa, không tạo thiếu).
BẮT BUỘC trả về duy nhất định dạng JSON object theo schema:
{
  "rides": [
    {
      "name": "Tên khách Việt Nam (VD: Nguyễn Văn Tuấn, Chị Lan, Anh Dũng)",
      "phone": "Số điện thoại di động VN 10 số (VD: 0912345678, 0987654321)",
      "startPoint": "Điểm đón cụ thể (VD: Sân bay Nội Bài, Hà Nội hoặc Sân bay Tân Sơn Nhất, TP.HCM)",
      "endPoint": "Điểm đến cụ thể (VD: Bãi Cháy, Hạ Long, Quảng Ninh hoặc Vũng Tàu)",
      "carType": "Loại xe (4 chỗ, 7 chỗ hoặc 16 chỗ)",
      "price": Số nguyên VNĐ (VD: 1500000),
      "region": "Vùng miền của điểm đón: 'north' (Miền Bắc), 'central' (Miền Trung/Tây Nguyên), hoặc 'south' (Miền Nam/Miền Tây)",
      "note": "Ghi chú chuyến đi thực tế (VD: Đón đúng 8h, 2 vali to, cần xe sạch)"
    }
  ]
}
YÊU CẦU QUAN TRỌNG:
1. Số lượng: Tạo CHÍNH XÁC ${requestedCount} chuyến xe trong mảng "rides". Tuyệt đối không tạo nhiều hơn hoặc ít hơn.
2. Vùng miền ("region"): Xác định chuẩn xác:
   - "north": Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, Lào Cai...
   - "central": Đà Nẵng, Huế, Nha Trang, Cam Ranh, Đà Lạt, Quy Nhơn, Vinh...
   - "south": TP.HCM, Sài Gòn, Tân Sơn Nhất, Bình Dương, Đồng Nai, Vũng Tàu, Cần Thơ, Phú Quốc...
3. Giá tiền: ${targetPrice ? `Người dùng yêu cầu giá khoảng ${targetPrice} VNĐ, hãy sinh giá tiền đúng khoảng này.` : 'Giá tiền phải phù hợp với cự ly chuyến đi và câu lệnh.'}
4. Loại xe: Tuân thủ yêu cầu người dùng nếu có đề cập (4 chỗ, 7 chỗ hoặc 16 chỗ).
5. Tuyệt đối không trùng lặp tuyến đường giữa các chuyến xe.`;

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: `Yêu cầu: "${prompt}". Hãy tạo đúng ${requestedCount} chuyến xe.` }
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
              max_tokens: 3000
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            errorMessage = errData.error?.message || `HTTP ${response.status}`;
            continue; // Thử model kế tiếp
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const rawRides = parsed.rides || parsed.trips || parsed.data || [];
            if (Array.isArray(rawRides) && rawRides.length > 0) {
              // Làm sạch dữ liệu và lọc trùng tuyến, giới hạn đúng requestedCount
              const cleanRides = [];
              const seenRoutes = new Set();

              for (const r of rawRides) {
                if (cleanRides.length >= requestedCount) break;

                const startPoint = (r.startPoint || r.start_location || r.start || '').trim();
                const endPoint = (r.endPoint || r.end_location || r.end || '').trim();
                if (!startPoint || !endPoint) continue;

                const routeKey = `${startPoint}__${endPoint}`;
                if (seenRoutes.has(routeKey)) continue;
                seenRoutes.add(routeKey);

                let price = parseInt(r.price || r.price_vnd || r.cost) || (targetPrice ? Math.round(targetPrice) : 500000);
                let phone = (r.phone || '').trim();
                if (!phone || phone.length < 9) {
                  phone = '09' + Math.floor(10000000 + Math.random() * 90000000);
                }

                // Nhận diện vùng miền chuẩn xác qua geoUtils
                const detectedRegion = detectRegionFromPlace(startPoint, endPoint);
                const region = (['north', 'central', 'south'].includes(r.region)) ? r.region : detectedRegion;

                cleanRides.push({
                  name: (r.name || r.customer_name || 'Khách đặt xe').trim(),
                  phone,
                  startPoint,
                  endPoint,
                  carType: (r.carType || r.vehicle_type || '5 chỗ').trim(),
                  price,
                  region: detectedRegion, // Luôn ưu tiên bộ nhận diện chuẩn xác theo địa lý thực tế
                  note: (r.note || r.notes || 'Đón đúng giờ, xe sạch').trim(),
                });
              }

              if (cleanRides.length > 0) {
                generatedRides = cleanRides;
                usedModel = model;
                groqSuccess = true;
                break; // Thành công
              }
            }
          }
        } catch (callErr) {
          errorMessage = callErr.message;
        }
      }
    }

    // Nếu Groq thành công
    if (groqSuccess && generatedRides.length > 0) {
      return res.json({
        success: true,
        source: 'groq',
        model: usedModel,
        count: generatedRides.length,
        rides: generatedRides
      });
    }

    // Fallback nếu Groq không khả dụng
    const fallbackData = generateFallbackRides(requestedCount, prompt);
    return res.json({
      success: true,
      source: 'fallback',
      model: 'internal-nlp-engine',
      count: fallbackData.length,
      rides: fallbackData,
      warning: errorMessage ? `Groq: ${errorMessage}. Hệ thống tự động chuyển sang Engine nội bộ.` : undefined
    });

  } catch (error) {
    console.error('Error generating AI rides:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi sinh cuốc xe AI: ' + error.message });
  }
};
