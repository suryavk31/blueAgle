const express = require('express');
const router = express.Router();
const {
    getCategories, createCategory, updateCategory, deleteCategory,
    createSubCategory, updateSubCategory, deleteSubCategory
} = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// ── Category routes ──────────────────────────────────────────────────────────
router.get('/', getCategories);
router.post('/', verifyToken, isAdmin, upload.single('image'), createCategory);

// ── Sub-category routes (MUST be before /:id routes to avoid conflicts) ──────
router.post('/sub', verifyToken, isAdmin, upload.single('image'), createSubCategory);
router.put('/sub/:id', verifyToken, isAdmin, upload.single('image'), updateSubCategory);
router.delete('/sub/:id', verifyToken, isAdmin, deleteSubCategory);

// ── Category :id routes ──────────────────────────────────────────────────────
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);

module.exports = router;
