const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

// Admin login
router.post('/admin/login', authController.adminLogin);

// Get current user (requires authentication)
router.get('/me', authMiddleware, authController.getMe);

// Check registration status
router.get('/status/:phone', authController.checkStatus);

module.exports = router;
