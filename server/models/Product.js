const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    mrp: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    offerPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    weight: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    images: {
        type: DataTypes.JSON, // Array of URLs
        allowNull: true,
    },
    // subCategoryId will be added via associations
}, {
    timestamps: true,
});

module.exports = Product;
