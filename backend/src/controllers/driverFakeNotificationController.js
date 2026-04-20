const User = require('../models/User');
const FakeNotification = require('../models/FakeNotification');
const AppSetting = require('../models/AppSetting');

// @desc    Get fake notifications for driver/customer
// @route   GET /api/driver/fake-notifications
// @access  Private (Driver/Customer)
exports.getFakeNotifications = async (req, res) => {
  try {
    // Check if user is approved
    const user = await User.findById(req.user.id);
    if (!user || user.status !== 'approved') {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get region from query or default to 'north'
    const region = req.query.region || 'north';

    // Validate region
    if (!['north', 'central', 'south'].includes(region)) {
      return res.status(400).json({
        success: false,
        message: 'Vùng miền không hợp lệ'
      });
    }

    // Get all active templates for this region
    const templates = await FakeNotification.find({
      region,
      isActive: true
    }).select('-createdBy -__v');

    // Lấy cài đặt từ database
    let settings = await AppSetting.findOne();
    if (!settings) {
      settings = {
        minFakeCount: 3,
        maxFakeCount: 4,
        minFakeInterval: 15,
        maxFakeInterval: 30
      };
    }

    // Random số lượng theo cấu hình
    const minCount = settings.minFakeCount;
    const maxCount = settings.maxFakeCount;
    const count = Math.min(
      templates.length,
      Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount
    );

    // Shuffle and take random templates
    const shuffled = templates.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.status(200).json({
      success: true,
      data: selected,
      settings: {
        minInterval: settings.minFakeInterval,
        maxInterval: settings.maxFakeInterval
      }
    });
  } catch (error) {
    console.error('Error getting fake notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông báo'
    });
  }
};

// @desc    Accept fake notification (always fails)
// @route   POST /api/driver/fake-notifications/:id/accept
// @access  Private (Driver/Customer)
exports.acceptFakeNotification = async (req, res) => {
  try {
    // Check if template exists
    const template = await FakeNotification.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo'
      });
    }

    // Always return error (fake notification)
    return res.status(409).json({
      success: false,
      message: 'Đã có tài xế nhận quốc, vui lòng đợi cuốc tiếp theo'
    });
  } catch (error) {
    console.error('Error accepting fake notification:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi nhận cuốc'
    });
  }
};
