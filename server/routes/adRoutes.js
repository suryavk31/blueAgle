const express = require('express');
const router = express.Router();
const {
    createAd, getAds, getAllAdsAdmin, updateAd, deleteAd, trackEvent
} = require('../controllers/adController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.get('/', getAds);
router.post('/track', trackEvent); // Maybe open? Or verify anonymous token? Let's leave open for now or use optional auth.

// Admin
router.get('/admin', verifyToken, isAdmin, getAllAdsAdmin);
router.post('/', verifyToken, isAdmin, upload.single('media'), createAd);
router.put('/:id', verifyToken, isAdmin, upload.single('media'), updateAd);
router.delete('/:id', verifyToken, isAdmin, deleteAd);

module.exports = router;
