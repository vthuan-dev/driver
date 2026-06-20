const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const requestController = require('../controllers/requestController');
const driverStatsController = require('../controllers/driverStatsController');

// Admin authentication
router.post('/login', authController.adminLogin);
router.put('/change-password', adminAuthMiddleware, authController.changePassword);

// Get admin profile
router.get('/profile', adminAuthMiddleware, (req, res) => {
  res.json({ admin: req.user });
});

// User management
router.get('/users', adminAuthMiddleware, userController.getAllUsers);
router.get('/users/pending', adminAuthMiddleware, userController.getPendingUsers);
router.put('/users/:id/approve', adminAuthMiddleware, userController.approveUser);
router.put('/users/:id/reject', adminAuthMiddleware, userController.rejectUser);
router.put('/users/:id/ban', adminAuthMiddleware, userController.banUser);
router.put('/users/:id/unban', adminAuthMiddleware, userController.unbanUser);
router.delete('/users/:id', adminAuthMiddleware, userController.deleteUser);
router.put('/users/:id/income', adminAuthMiddleware, driverStatsController.setDriverIncome);

// Request management
router.get('/requests', adminAuthMiddleware, requestController.getAllRequests);
router.put('/requests/:id', adminAuthMiddleware, requestController.updateRequest);
router.delete('/requests/:id', adminAuthMiddleware, requestController.deleteRequest);

module.exports = router;
