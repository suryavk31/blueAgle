const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Policy = sequelize.define('Policy', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING, // 'return', 'terms'
        allowNull: false,
        unique: true,
    },
    content: {
        type: DataTypes.TEXT, // HTML or Markdown content
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Policy;
