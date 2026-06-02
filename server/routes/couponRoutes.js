const express = require('express');
const router = express.Router();
const {
    createCoupon, getCoupons, deleteCoupon, verifyCoupon
} = require('../controllers/couponController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, isAdmin, createCoupon);
router.get('/', verifyToken, isAdmin, getCoupons);
router.delete('/:id', verifyToken, isAdmin, deleteCoupon);
router.post('/verify', verifyToken, verifyCoupon);

module.exports = router;
