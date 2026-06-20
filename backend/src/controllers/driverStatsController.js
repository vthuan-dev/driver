const { User, WaitingRequest } = require('../models');
const { Op } = require('sequelize');

const getDriverStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's deposit balance
    const user = await User.findByPk(userId, { attributes: ['depositBalance'] });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Count completed trips this month
    const monthlyTrips = await WaitingRequest.count({
      where: {
        userId: userId,
        status: 'completed',
        createdAt: {
          [Op.gte]: monthStart,
          [Op.lte]: monthEnd
        }
      }
    });
    
    // Count total completed trips
    const totalTrips = await WaitingRequest.count({
      where: {
        userId: userId,
        status: 'completed'
      }
    });
    
    res.json({
      balance: user.depositBalance,
      monthlyTrips: monthlyTrips,
      totalTrips: totalTrips
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê' });
  }
};

// @desc    Record APK download and save plan to DB
// @route   POST /api/driver/record-download
// @access  Private
const recordDownload = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body; // '6m' or '1y'

    if (!plan || !['6m', '1y'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Gói không hợp lệ' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const updateData = {
      appPlan: plan,
      appDownloadCount: (user.appDownloadCount || 0) + 1,
    };

    // Only set first download time once
    if (!user.appFirstDownloadAt) {
      updateData.appFirstDownloadAt = new Date();
    }

    await user.update(updateData);

    return res.json({
      success: true,
      downloadCount: updateData.appDownloadCount,
      firstDownloadAt: user.appFirstDownloadAt || updateData.appFirstDownloadAt,
      plan: plan
    });
  } catch (error) {
    console.error('Record download error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// @desc    Get download status for current user
// @route   GET /api/driver/download-status
// @access  Private
const getDownloadStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['appPlan', 'appDownloadCount', 'appFirstDownloadAt']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const firstDownloadAt = user.appFirstDownloadAt ? new Date(user.appFirstDownloadAt).getTime() : 0;
    const withinTwoDays = firstDownloadAt > 0 && (Date.now() - firstDownloadAt) < TWO_DAYS_MS;

    return res.json({
      success: true,
      appPlan: user.appPlan,
      downloadCount: user.appDownloadCount || 0,
      firstDownloadAt: user.appFirstDownloadAt,
      withinTwoDays,
      canRedownload: withinTwoDays
    });
  } catch (error) {
    console.error('Get download status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// @desc    Get driver fake income data
// @route   GET /api/driver/income
// @access  Private (driver)
const getDriverIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['fakeIncomeAmount', 'fakeIncomeTips', 'fakeIncomeHistory']
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    let history = [];
    try {
      if (user.fakeIncomeHistory) {
        history = JSON.parse(user.fakeIncomeHistory);
      }
    } catch (_) {
      history = [];
    }

    const amount = Number(user.fakeIncomeAmount) || 0;
    const tips = Number(user.fakeIncomeTips) || 0;

    return res.json({
      success: true,
      data: {
        totalIncome: amount + tips,
        completedRidesAmount: amount,
        tipsAmount: tips,
        history,
      }
    });
  } catch (error) {
    console.error('Get driver income error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// @desc    Admin sets fake income for a driver
// @route   PUT /api/admin/users/:id/income
// @access  Private (admin)
const setDriverIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { fakeIncomeAmount, fakeIncomeTips, fakeIncomeHistory } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const updateData = {};
    if (fakeIncomeAmount !== undefined) updateData.fakeIncomeAmount = Number(fakeIncomeAmount) || 0;
    if (fakeIncomeTips !== undefined) updateData.fakeIncomeTips = Number(fakeIncomeTips) || 0;
    if (fakeIncomeHistory !== undefined) {
      // fakeIncomeHistory should be an array of {date, amount}
      updateData.fakeIncomeHistory = JSON.stringify(fakeIncomeHistory);
    }

    await user.update(updateData);

    return res.json({ success: true, message: 'Cập nhật thu nhập thành công' });
  } catch (error) {
    console.error('Set driver income error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  getDriverStats,
  recordDownload,
  getDownloadStatus,
  getDriverIncome,
  setDriverIncome,
};
