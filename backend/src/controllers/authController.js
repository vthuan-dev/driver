const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const config = require('../config/config');
const { authMiddleware } = require('../middleware/auth');

const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { name, phone, password, carType, carYear, carImage } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký' });
    }
    
    // Create new user
    const user = new User({
      name,
      phone,
      password,
      carType,
      carYear,
      carImage: carImage || '',
      status: 'pending' // New users need approval
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'Đăng ký thành công. Vui lòng chờ admin phê duyệt.',
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        status: user.status,
        carImage: user.carImage
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký' });
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }
    
    // Check if user is approved
    if (user.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Tài khoản đang chờ phê duyệt',
        status: user.status 
      });
    }
    
    // Generate token
    const token = generateToken({
      id: user._id,
      phone: user.phone,
      role: 'user'
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        carType: user.carType,
        carYear: user.carYear,
        carImage: user.carImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập' });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Thông tin đăng nhập không hợp lệ' });
    }
    
    // Generate token
    const token = generateToken({
      id: admin._id,
      username: admin.username,
      role: admin.role
    });
    
    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi đăng nhập admin' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getMe
};

