const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

// Admin login
router.post('/admin/login', authController.adminLogin);

// Get current user
router.get('/me', authController.getMe);

module.exports = router;
