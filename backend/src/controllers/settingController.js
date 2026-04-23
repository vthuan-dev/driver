const { AppSetting } = require('../models');

// Helper để đảm bảo luôn có đúng 1 document cài đặt
const getOrCreateSettings = async () => {
  let settings = await AppSetting.findOne();
  if (!settings) {
    settings = await AppSetting.create({
      minFakeCount: 3,
      maxFakeCount: 4,
      minFakeInterval: 15,
      maxFakeInterval: 30
    });
  }
  return settings;
};

// @desc    Get app settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cấu hình'
    });
  }
};

// @desc    Update app settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { minFakeCount, maxFakeCount, minFakeInterval, maxFakeInterval } = req.body;

    // Validate inputs
    if (minFakeCount > maxFakeCount) {
      return res.status(400).json({
        success: false,
        message: 'Số lượng tối thiểu không được lớn hơn số lượng tối đa'
      });
    }

    if (minFakeInterval > maxFakeInterval) {
      return res.status(400).json({
        success: false,
        message: 'Khoảng thời gian tối thiểu không được lớn hơn tối đa'
      });
    }

    let settings = await getOrCreateSettings();

    const updateData = {};
    if (minFakeCount !== undefined) updateData.minFakeCount = minFakeCount;
    if (maxFakeCount !== undefined) updateData.maxFakeCount = maxFakeCount;
    if (minFakeInterval !== undefined) updateData.minFakeInterval = minFakeInterval;
    if (maxFakeInterval !== undefined) updateData.maxFakeInterval = maxFakeInterval;

    await settings.update(updateData);

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật cấu hình'
    });
  }
};
