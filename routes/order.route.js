const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { createOrder, cancelOrder, editOrder, getUserOrders ,getOrderById,getAllOrders,editOrderbyadmin} = require('../controllers/order.controller');
const { authorize } = require('../middleware/role.middleware'); 

router.post('/', authenticate, createOrder);

router.delete('/:orderId', authenticate, cancelOrder);

router.put('/:orderId', authenticate, editOrder);
router.put('/admin/:orderId', authenticate,authorize('admin'), editOrderbyadmin);

router.get('/my-orders', authenticate, getUserOrders);
router.get('/:orderId', authenticate, getOrderById);
router.get('/admin/all-orders', authenticate, authorize('admin'), getAllOrders);

module.exports = router;
