const { FakeNotification, Admin } = require('../models');

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
      createdById: req.user.id || req.user._id
    });

    const data = template.toJSON();
    data._id = data.id;

    res.status(201).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error creating template:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
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
    const allTemplates = await FakeNotification.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: Admin,
        as: 'createdBy',
        attributes: ['username']
      }]
    });

    const templates = allTemplates.map(t => {
      const data = t.toJSON();
      data._id = data.id;
      return data;
    });

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
    const template = await FakeNotification.findByPk(req.params.id, {
      include: [{
        model: Admin,
        as: 'createdBy',
        attributes: ['username']
      }]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    const data = template.toJSON();
    data._id = data.id;

    res.status(200).json({
      success: true,
      data: data
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

    const template = await FakeNotification.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    // Update fields
    const updateData = {};
    if (region !== undefined) updateData.region = region;
    if (startPoint !== undefined) updateData.startPoint = startPoint;
    if (endPoint !== undefined) updateData.endPoint = endPoint;
    if (displayTime !== undefined) updateData.displayTime = displayTime;
    if (carType !== undefined) updateData.carType = carType;
    if (price !== undefined) updateData.price = price;
    if (isActive !== undefined) updateData.isActive = isActive;

    await template.update(updateData);

    const data = template.toJSON();
    data._id = data.id;

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error updating template:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
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
    const template = await FakeNotification.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    await template.destroy();

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
    const template = await FakeNotification.findByPk(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy template'
      });
    }

    // Toggle isActive
    await template.update({ isActive: !template.isActive });

    const data = template.toJSON();
    data._id = data.id;

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error toggling template:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi bật/tắt template'
    });
  }
};
