const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SeoGlobalSetting = sequelize.define('SeoGlobalSetting', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    siteName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'BlueAgle - Organic & Wood Pressed Essentials',
    },
    defaultTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'BlueAgle | Organic & Wood-Pressed Grocery Essentials',
    },
    titleTemplate: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '%s | BlueAgle',
    },
    defaultDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: 'Shop pure wood pressed oils, organic A2 desi ghee, honey, nuts, and authentic grocery staples delivered to your doorstep.',
    },
    defaultKeywords: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'wood pressed oil, organic grocery, cold pressed coconut oil, pure ghee, blueagle',
    },
    defaultOgImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/logo.png',
    },
    defaultTwitterImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/logo.png',
    },
    defaultRobots: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'index, follow',
    },
    defaultAuthor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'BlueAgle Organics Team',
    },
    defaultLanguage: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'en',
    },
    defaultThemeColor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#3c006b',
    },
    defaultFavicon: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/favicon.ico',
    },
    organizationSchema: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    websiteSchema: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    robotsTxtCustomRules: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /cart\nDisallow: /profile\n\nSitemap: http://localhost:5000/sitemap.xml`,
    },
}, {
    timestamps: true,
    tableName: 'seo_global_settings'
});

module.exports = SeoGlobalSetting;
