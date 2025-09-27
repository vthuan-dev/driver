const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Get all driver posts
router.get('/', driverController.getDrivers);

// Create driver post (admin only)
router.post('/', driverController.createDriver);

// Update driver post (admin only)
router.put('/:id', driverController.updateDriver);

// Delete driver post (admin only)
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
