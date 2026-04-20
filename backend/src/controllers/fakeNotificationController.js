const FakeNotification = require('../models/FakeNotification');

// @desc    Create new fake notification template
// @route   POST /api/admin/fake-notifications
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
  try {
    const { region, startPoint, endPoint, displayTime, carType, price, isActive } = req.body;

    // Create template
    const template = await FakeNotification.create({
      region,
      startPoint,
      endPoint,
      displayTime,
      carType,
      price,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id || req.user._id
    });

    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo template thông báo'
    });
  }
};

// @desc    Get all fake notification templates
// @route   GET /api/admin/fake-notifications
// @access  Private/Admin
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await FakeNotification.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    res.status(200).json({
      success: true,
      data: {
        templates,
        count: templates.length
      }
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách template'
    });
  }
};

// @desc    Get single fake notification template
// @route   GET /api/admin/fake-notifications/:id
// @access  Private/Admin
exports.getTemplateById = async (req, res) => {
  try {
    const template = await FakeNotification.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy template'
    });
  }
};

// @desc    Update fake notification template
// @route   PUT /api/admin/fake-notifications/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
  try {
    const { region, startPoint, endPoint, displayTime, carType, price, isActive } = req.body;

    let template = await FakeNotification.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    // Update fields
    template.region = region || template.region;
    template.startPoint = startPoint || template.startPoint;
    template.endPoint = endPoint || template.endPoint;
    template.displayTime = displayTime || template.displayTime;
    template.carType = carType || template.carType;
    template.price = price !== undefined ? price : template.price;
    template.isActive = isActive !== undefined ? isActive : template.isActive;

    await template.save();

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error updating template:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật template'
    });
  }
};

// @desc    Delete fake notification template
// @route   DELETE /api/admin/fake-notifications/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await FakeNotification.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    await template.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa template thành công'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa template'
    });
  }
};

// @desc    Toggle fake notification template active status
// @route   PATCH /api/admin/fake-notifications/:id/toggle
// @access  Private/Admin
exports.toggleTemplate = async (req, res) => {
  try {
    const template = await FakeNotification.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    // Toggle isActive
    template.isActive = !template.isActive;
    await template.save();

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error toggling template:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi bật/tắt template'
    });
  }
};
