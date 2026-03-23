const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const driverStatsController = require('../controllers/driverStatsController');

// Get driver statistics (requires authentication)
router.get('/stats', authMiddleware, driverStatsController.getDriverStats);

module.exports = router;
