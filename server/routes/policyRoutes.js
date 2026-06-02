const express = require('express');
const router = express.Router();
const { getPolicy, updatePolicy } = require('../controllers/policyController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/:type', getPolicy);
router.post('/:type', verifyToken, isAdmin, updatePolicy);

module.exports = router;
