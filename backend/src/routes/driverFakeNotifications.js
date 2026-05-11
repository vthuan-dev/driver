const express = require('express');
const router = express.Router();
const {
  getFakeNotifications,
  acceptFakeNotification
} = require('../controllers/driverFakeNotificationController');
const { authMiddleware } = require('../middleware/auth');

// Routes
router.get('/', getFakeNotifications);
router.post('/:id/accept', authMiddleware, acceptFakeNotification);

module.exports = router;
