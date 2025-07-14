const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const contentController = require('../controllers/content.controller');

router.get('/about', contentController.getAbout);
router.post('/about', authenticate, authorize('admin'),contentController.createAbout);
router.put('/about', authenticate, authorize('admin'), contentController.updateAbout);

module.exports = router;
