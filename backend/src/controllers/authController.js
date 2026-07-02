const jwt = require('jsonwebtoken');
const { User, Admin } = require('../models');
const config = require('../config/config');
const telegramBot = require('../utils/telegram');

const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    console.log('Register attempt:', { phone: req.body.phone, name: req.body.name });
    const { name, phone, password, carType, carYear, carImage } = req.body;

    // Validate input
    if (!name || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      console.log('User already exists:', phone);
      return res.status(400).json({ 
        success: false,
        message: 'Số điện thoại này đã được đăng ký' 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      phone,
      password,
      carType,
      carYear,
      carImage: carImage || '',
      status: 'pending' // New users need approval
    });

    console.log('User registered successfully:', { id: user.id, phone: user.phone });

    // Send Telegram notification
    telegramBot.sendNewRegistrationNotification(user);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng chờ admin phê duyệt.',
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        phone: user.phone,
        status: user.status,
        carImage: user.carImage
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi đăng ký',
      error: error.message 
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login attempt:', { phone: req.body.phone });
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      console.log('Missing phone or password');
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu' 
      });
    }

    // Find user
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      console.log('User not found:', phone);
      return res.status(400).json({ 
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ' 
      });
    }

    console.log('User found:', { id: user.id, status: user.status });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', phone);
      return res.status(400).json({ 
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ' 
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      const reason = user.banReason ? ` Lý do: ${user.banReason}` : '';
      return res.status(403).json({
        success: false,
        message: `Tài khoản của bạn đã bị khóa.${reason}`,
        status: 'banned'
      });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      console.log('User not approved:', { phone, status: user.status });
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đang chờ phê duyệt',
        status: user.status
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      phone: user.phone,
      role: user.role || 'driver'
    });

    console.log('Login successful for user:', phone);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role || 'driver',
        carType: user.carType,
        carYear: user.carYear,
        carImage: user.carImage,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập',
      error: error.message 
    });
  }
};

const customerRegister = async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được đăng ký' });
    }
    const user = await User.create({
      name,
      phone,
      password,
      role: 'customer',
      status: 'approved'
    });
    const token = generateToken({ id: user.id, phone: user.phone, role: 'customer' });
    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công!',
      token,
      user: { id: user.id, _id: user.id, name: user.name, phone: user.phone, role: user.role, status: user.status }
    });
  } catch (error) {
    console.error('Customer register error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký', error: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ where: { username } });
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
      id: admin.id,
      username: admin.username,
      role: admin.role
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        _id: admin.id,
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
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    res.json({ 
      user: {
        id: user.id,
        _id: user.id, // For frontend compatibility
        name: user.name,
        phone: user.phone,
        carType: user.carType,
        carYear: user.carYear,
        carImage: user.carImage,
        status: user.status,
        depositBalance: user.depositBalance
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

const checkStatus = async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await User.findOne({ 
      where: { phone },
      attributes: ['name', 'phone', 'status'] 
    });

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với số điện thoại này' });
    }

    res.json({
      status: user.status,
      name: user.name,
      phone: user.phone
    });
  } catch (error) {
    console.error('Check status error:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra trạng thái' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    const admin = await Admin.findByPk(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đổi mật khẩu' });
  }
};

module.exports = {
  register,
  customerRegister,
  login,
  adminLogin,
  getMe,
  checkStatus,
  changePassword
};
