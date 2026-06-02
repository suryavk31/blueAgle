const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { loginOrRegister, getMe } = require('../controllers/authController');

router.post('/login', verifyToken, loginOrRegister);
router.get('/me', verifyToken, getMe);

module.exports = router;
