const express = require('express');
const router = express.Router();
const {
  getFakeNotifications,
  acceptFakeNotification
} = require('../controllers/driverFakeNotificationController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', getFakeNotifications);
router.post('/:id/accept', acceptFakeNotification);

module.exports = router;
