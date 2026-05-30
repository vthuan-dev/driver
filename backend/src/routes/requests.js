const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { DriverPost } = require('../models');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

// Create waiting request (public + optional auth to capture userId)
router.post('/', optionalAuthMiddleware, requestController.createRequest);

// Create waiting request (authenticated)
router.post('/auth', authMiddleware, requestController.createRequest);

// Get user's requests
router.get('/my-requests', authMiddleware, requestController.getMyRequests);

// Get all requests (admin only)
router.get('/', requestController.getAllRequests);

// Get requests targeted at a specific driver post (public)
router.get('/for-driver/:driverPostId', requestController.getForDriver);
// Mark all requests for driver as read
router.post('/for-driver/:driverPostId/mark-read', requestController.markReadByDriver);

// Update request status (admin only)
router.put('/:id', requestController.updateRequest);

module.exports = router;
