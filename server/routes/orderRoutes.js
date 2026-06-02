const express = require('express');
const router = express.Router();
const {
    createRazorpayOrder, verifyPaymentAndCreateOrder, createCODOrder, getMyOrders, getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/create-order', verifyToken, createRazorpayOrder);
router.post('/verify-payment', verifyToken, verifyPaymentAndCreateOrder);
router.post('/cod', verifyToken, createCODOrder);
router.get('/my-orders', verifyToken, getMyOrders);

// Admin
router.get('/all', verifyToken, isAdmin, getAllOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
