const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getSalesChart,
    getTopProducts,
    getCategoryDistribution
} = require('../controllers/analyticsController');
const { verifyAdminToken, requirePermission } = require('../middleware/adminAuthMiddleware');

router.get('/stats', verifyAdminToken, requirePermission('Dashboard', 'View'), getDashboardStats);
router.get('/sales-chart', verifyAdminToken, requirePermission('Dashboard', 'View'), getSalesChart);
router.get('/top-products', verifyAdminToken, requirePermission('Dashboard', 'View'), getTopProducts);
router.get('/category-dist', verifyAdminToken, requirePermission('Dashboard', 'View'), getCategoryDistribution);

module.exports = router;
