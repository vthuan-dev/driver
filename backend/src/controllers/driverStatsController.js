const User = require('../models/User');
const WaitingRequest = require('../models/WaitingRequest');

const getDriverStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's deposit balance
    const user = await User.findById(userId).select('depositBalance');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Count completed trips this month
    const monthlyTrips = await WaitingRequest.countDocuments({
      userId: userId,
      status: 'completed',
      createdAt: {
        $gte: monthStart,
        $lte: monthEnd
      }
    });
    
    // Count total completed trips
    const totalTrips = await WaitingRequest.countDocuments({
      userId: userId,
      status: 'completed'
    });
    
    res.json({
      balance: user.depositBalance || 200000,
      monthlyTrips: monthlyTrips,
      totalTrips: totalTrips
    });
  } catch (error) {
    console.error('Get driver stats error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy thống kê' });
  }
};

module.exports = {
  getDriverStats
};
