const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { adminAuthMiddleware } = require('../middleware/auth');

// Get pending users (admin only)
router.get('/pending', adminAuthMiddleware, userController.getPendingUsers);

// Approve user (admin only)
router.put('/:id/approve', adminAuthMiddleware, userController.approveUser);

// Reject user (admin only)
router.put('/:id/reject', adminAuthMiddleware, userController.rejectUser);

// Get all users (admin only)
router.get('/', adminAuthMiddleware, userController.getAllUsers);

module.exports = router;
