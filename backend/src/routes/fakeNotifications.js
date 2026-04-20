const express = require('express');
const router = express.Router();
const {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  toggleTemplate
} = require('../controllers/fakeNotificationController');
const { adminAuthMiddleware } = require('../middleware/auth');

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Routes
router.route('/')
  .get(getAllTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplateById)
  .put(updateTemplate)
  .delete(deleteTemplate);

router.patch('/:id/toggle', toggleTemplate);

module.exports = router;
