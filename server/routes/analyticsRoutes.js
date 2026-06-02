const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getSalesChart,
    getTopProducts,
    getCategoryDistribution
} = require('../controllers/analyticsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/stats', verifyToken, isAdmin, getDashboardStats);
router.get('/sales-chart', verifyToken, isAdmin, getSalesChart);
router.get('/top-products', verifyToken, isAdmin, getTopProducts);
router.get('/category-dist', verifyToken, isAdmin, getCategoryDistribution);

module.exports = router;
