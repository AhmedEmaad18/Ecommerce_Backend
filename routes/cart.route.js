const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { authenticate ,optionalAuth } = require('../middleware/auth.middleware'); // Middleware to protect routes

router.get('/',optionalAuth, cartController.getCart);
router.post('/add',optionalAuth, cartController.addToCart);
router.put('/:itemId',authenticate, cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.put('/:itemId/price', authenticate, cartController.updateCartItemPrice);
router.post('/clear', authenticate, cartController.clearCart);
router.post('/merge', authenticate, cartController.mergeGuestCart);

module.exports = router;
