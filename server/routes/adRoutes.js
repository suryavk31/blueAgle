const express = require('express');
const router = express.Router();
const {
    createAd, getAds, getAllAdsAdmin, updateAd, deleteAd, trackEvent
} = require('../controllers/adController');
const { verifyAdminToken, requirePermission } = require('../middleware/adminAuthMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getAds);
router.post('/track', trackEvent); // Public tracking endpoint

// Admin routes (RBAC)
router.get('/admin', verifyAdminToken, requirePermission('Ads', 'View'), getAllAdsAdmin);
router.post('/', verifyAdminToken, requirePermission('Ads', 'Create'), upload.single('media'), createAd);
router.put('/:id', verifyAdminToken, requirePermission('Ads', 'Update'), upload.single('media'), updateAd);
router.delete('/:id', verifyAdminToken, requirePermission('Ads', 'Delete'), deleteAd);

module.exports = router;
