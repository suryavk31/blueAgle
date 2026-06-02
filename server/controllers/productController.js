const { Product, SubCategory, Category } = require('../models');
const { Op } = require('sequelize');
const { uploadToImageKit } = require('../utils/imageKitHelper');

const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, subCategoryId, mrp, offerPercentage, weight } = req.body;
        let images = [];

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToImageKit(file.buffer, file.originalname));
            const results = await Promise.all(uploadPromises);
            images = results.map(r => r.url);
        }

        const product = await Product.create({
            name,
            description,
            price,
            mrp,
            offerPercentage,
            weight,
            stock,
            subCategoryId,
            images
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProducts = async (req, res) => {
    try {
        const { categoryId, subCategoryId, search, minPrice, maxPrice, sortBy, categoryIds } = req.query;
        let where = {};
        let include = [{
            model: SubCategory,
            include: [Category]
        }];

        if (subCategoryId) {
            where.subCategoryId = subCategoryId;
        }

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Expanded Filtering: Min/Max Price
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        // Expanded Filtering: Multi-Category Support
        if (categoryIds) {
            const catArray = Array.isArray(categoryIds) ? categoryIds : categoryIds.split(',');
            include[0].where = { categoryId: { [Op.in]: catArray } };
        } else if (categoryId) {
            include[0].where = { categoryId };
        }

        // Sorting Logic
        let order = [['createdAt', 'DESC']]; // Default
        if (sortBy) {
            if (sortBy === 'price_asc') order = [['price', 'ASC']];
            if (sortBy === 'price_desc') order = [['price', 'DESC']];
            if (sortBy === 'newest') order = [['createdAt', 'DESC']];
            if (sortBy === 'oldest') order = [['createdAt', 'ASC']];
        }

        const products = await Product.findAll({
            where,
            include,
            order
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: SubCategory, include: [Category] }]
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { name, description, price, stock, subCategoryId, mrp, offerPercentage, weight } = req.body;

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.mrp = mrp || product.mrp;
        product.offerPercentage = offerPercentage || product.offerPercentage;
        product.weight = weight || product.weight;
        product.stock = stock || product.stock;
        product.subCategoryId = subCategoryId || product.subCategoryId;

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToImageKit(file.buffer, file.originalname));
            const results = await Promise.all(uploadPromises);
            product.images = results.map(r => r.url);
        }

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        await product.destroy();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
