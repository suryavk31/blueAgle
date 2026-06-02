const { Category, SubCategory } = require('../models');
const { uploadToImageKit } = require('../utils/imageKitHelper');

// Categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({ include: SubCategory });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        let image = null;
        if (req.file) {
            const result = await uploadToImageKit(req.file.buffer, req.file.originalname);
            image = result.url;
        }
        const category = await Category.create({ name, image });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.name = name || category.name;
        if (req.file) {
            const result = await uploadToImageKit(req.file.buffer, req.file.originalname);
            category.image = result.url;
        }

        await category.save();
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        await category.destroy();
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SubCategories
const createSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        let image = null;
        if (req.file) {
            const result = await uploadToImageKit(req.file.buffer, req.file.originalname);
            image = result.url;
        }
        const subCategory = await SubCategory.create({ name, categoryId, image });
        res.status(201).json(subCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, categoryId } = req.body;
        const subCategory = await SubCategory.findByPk(id);
        if (!subCategory) return res.status(404).json({ message: 'Sub-category not found' });
        subCategory.name = name || subCategory.name;
        if (categoryId) subCategory.categoryId = categoryId;
        
        if (req.file) {
            const result = await uploadToImageKit(req.file.buffer, req.file.originalname);
            subCategory.image = result.url;
        }

        await subCategory.save();
        res.json(subCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const subCategory = await SubCategory.findByPk(id);
        if (!subCategory) return res.status(404).json({ message: 'Sub-category not found' });
        await subCategory.destroy();
        res.json({ message: 'Sub-category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
};
