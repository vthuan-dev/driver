const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings
} = require('../controllers/settingController');
const { adminAuthMiddleware } = require('../middleware/auth');

// All routes require admin authentication
router.use(adminAuthMiddleware);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

module.exports = router;
