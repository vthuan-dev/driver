const express = require('express');
const router = express.Router();
const { adminAuthMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const requestController = require('../controllers/requestController');

// Admin authentication
router.post('/login', authController.adminLogin);

// Get admin profile
router.get('/profile', adminAuthMiddleware, (req, res) => {
  res.json({ admin: req.user });
});

// User management
router.get('/users', adminAuthMiddleware, userController.getAllUsers);
router.get('/users/pending', adminAuthMiddleware, userController.getPendingUsers);
router.put('/users/:id/approve', adminAuthMiddleware, userController.approveUser);
router.put('/users/:id/reject', adminAuthMiddleware, userController.rejectUser);

// Request management
router.get('/requests', adminAuthMiddleware, requestController.getAllRequests);
router.put('/requests/:id', adminAuthMiddleware, requestController.updateRequest);
router.delete('/requests/:id', adminAuthMiddleware, requestController.deleteRequest);

module.exports = router;
