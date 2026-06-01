const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Get all driver posts (filtered by region)
router.get('/', driverController.getDrivers);

// Search all drivers nationwide (no region filter)
router.get('/search', driverController.searchDrivers);

// Create driver post (admin only)
router.post('/', driverController.createDriver);

// Update driver post (admin only)
router.put('/:id', driverController.updateDriver);

// Delete driver post (admin only)
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
