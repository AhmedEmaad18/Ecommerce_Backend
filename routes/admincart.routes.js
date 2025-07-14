const express = require('express');
const router = express.Router();
const adminCartController = require('../controllers/adminCart.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.get('/carts/unordered',authenticate,authorize('admin'), adminCartController.getUnorderedCartItems);

module.exports = router;
