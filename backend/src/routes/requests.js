const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authMiddleware } = require('../middleware/auth');

// Create waiting request
router.post('/', authMiddleware, requestController.createRequest);

// Get user's requests
router.get('/my-requests', authMiddleware, requestController.getMyRequests);

// Get all requests (admin only)
router.get('/', requestController.getAllRequests);

// Update request status (admin only)
router.put('/:id', requestController.updateRequest);

module.exports = router;
