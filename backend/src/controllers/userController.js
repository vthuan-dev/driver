const { User } = require('../models');

const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { status: 'pending' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    // Convert to expected frontend format if needed
    const users = pendingUsers.map(u => {
      const data = u.toJSON();
      data._id = data.id; // For frontend compatibility
      return data;
    });

    res.json({ users });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    const users = allUsers.map(u => {
      const data = u.toJSON();
      data._id = data.id; // For frontend compatibility
      return data;
    });

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }
    
    user.status = 'approved';
    user.approvedAt = new Date();
    user.approvedById = adminId;
    
    await user.save();
    
    res.json({
      message: 'User approved successfully',
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }
    
    user.status = 'rejected';
    user.approvedAt = new Date();
    user.approvedById = adminId;
    
    await user.save();
    
    res.json({
      message: 'User rejected successfully',
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status,
        approvedAt: user.approvedAt
      }
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser
};
