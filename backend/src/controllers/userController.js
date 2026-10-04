const { User } = require('../models');
const { Op } = require('sequelize');

const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { status: 'pending' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    // plainPassword được include tự động (không exclude)
    
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
    const { status, search, all } = req.query;

    const where = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    if (search && String(search).trim()) {
      const cleanSearch = String(search).trim();
      where[Op.or] = [
        { phone: { [Op.like]: `%${cleanSearch}%` } },
        { name: { [Op.like]: `%${cleanSearch}%` } },
      ];
    }

    // Counts for tabs so badges and stats cards always show accurate totals
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      User.count({ where: { status: 'pending' } }),
      User.count({ where: { status: 'approved' } }),
      User.count({ where: { status: 'rejected' } }),
    ]);

    // If client explicitly requests all=true (for export or special operations)
    if (all === 'true' || all === '1') {
      const allUsers = await User.findAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      const users = allUsers.map(u => {
        const data = u.toJSON();
        data._id = data.id;
        return data;
      });

      return res.json({
        users,
        pagination: {
          total: users.length,
          page: 1,
          limit: users.length,
          totalPages: 1
        },
        counts: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: pendingCount + approvedCount + rejectedCount
        }
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    const users = rows.map(u => {
      const data = u.toJSON();
      data._id = data.id; // For frontend compatibility
      return data;
    });

    res.json({
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount
      }
    });
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

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = true;
    user.banReason = reason || null;
    await user.save();

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    user.banReason = null;
    await user.save();

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  banUser,
  unbanUser,
  deleteUser
};
