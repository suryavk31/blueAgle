const { SeoSetting, SeoGlobalSetting, SeoAuditLog, Product, Category, SubCategory } = require('../models');
const { Op } = require('sequelize');

// Helper to ensure Global SEO settings record exists
const getOrCreateGlobalSettings = async () => {
    let globalSetting = await SeoGlobalSetting.findOne();
    if (!globalSetting) {
        globalSetting = await SeoGlobalSetting.create({
            siteName: 'BlueAgle - Organic & Wood Pressed Essentials',
            defaultTitle: 'BlueAgle | Organic & Wood-Pressed Grocery Essentials',
            titleTemplate: '%s | BlueAgle',
            defaultDescription: 'Shop pure wood pressed oils, organic A2 desi ghee, honey, nuts, and authentic grocery staples delivered to your doorstep.',
            defaultKeywords: 'wood pressed oil, organic grocery, cold pressed coconut oil, pure ghee, blueagle',
            defaultOgImage: '/logo.png',
            defaultTwitterImage: '/logo.png',
            defaultRobots: 'index, follow',
            defaultAuthor: 'BlueAgle Organics Team',
            defaultLanguage: 'en',
            defaultThemeColor: '#3c006b',
            defaultFavicon: '/favicon.ico',
        });
    }
    return globalSetting;
};

// 1. Resolve SEO Record for a given Route or PageKey with Global Fallback
const resolveSeoByRoute = async (req, res) => {
    try {
        const { route, pageKey } = req.query;
        const globalSettings = await getOrCreateGlobalSettings();

        let record = null;

        // A. Match by pageKey if provided
        if (pageKey) {
            record = await SeoSetting.findOne({
                where: { pageKey, isActive: true }
            });
        }

        // B. Match by exact route
        if (!record && route) {
            record = await SeoSetting.findOne({
                where: { route, isActive: true }
            });
        }

        // C. Match by route pattern / dynamic routes
        if (!record && route) {
            // Check for product details page e.g. /product/12
            if (route.startsWith('/product/')) {
                const id = route.split('/product/')[1];
                if (id && !isNaN(id)) {
                    const product = await Product.findByPk(id);
                    if (product) {
                        record = {
                            pageKey: `product_${id}`,
                            pageName: product.name,
                            pageType: 'Product Details',
                            route: `/product/${id}`,
                            title: `${product.name} - Pure & Natural | BlueAgle`,
                            metaDescription: product.description ? product.description.slice(0, 160) : `Buy authentic ${product.name} online at BlueAgle with fast delivery.`,
                            metaKeywords: `${product.name}, organic ${product.name}, buy ${product.name} online`,
                            canonicalUrl: `http://localhost:5000/product/${id}`,
                            ogTitle: product.name,
                            ogDescription: product.description ? product.description.slice(0, 160) : product.name,
                            ogImage: product.images?.[0] || globalSettings.defaultOgImage,
                            ogType: 'og:product',
                            structuredData: {
                                "@context": "https://schema.org/",
                                "@type": "Product",
                                "name": product.name,
                                "description": product.description,
                                "offers": {
                                    "@type": "Offer",
                                    "priceCurrency": "INR",
                                    "price": product.price,
                                    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                                }
                            }
                        };
                    }
                }
            }

            // Check for category page e.g. /products?category=2
            if (!record && route.includes('category=')) {
                const catId = new URLSearchParams(route.split('?')[1]).get('category');
                if (catId) {
                    const category = await Category.findByPk(catId);
                    if (category) {
                        record = {
                            pageKey: `category_${catId}`,
                            pageName: category.name,
                            pageType: 'Category',
                            route: route,
                            title: `${category.name} Products | BlueAgle Store`,
                            metaDescription: `Explore our collection of organic ${category.name} items. Direct from farm to kitchen.`,
                            metaKeywords: `${category.name}, organic ${category.name}, blueagle categories`,
                            ogTitle: `${category.name} - BlueAgle`,
                            ogImage: category.image || globalSettings.defaultOgImage
                        };
                    }
                }
            }
        }

        // Response payload merging record with global fallbacks
        const resolvedSeo = {
            title: record?.title || globalSettings.defaultTitle,
            metaDescription: record?.metaDescription || globalSettings.defaultDescription,
            metaKeywords: record?.metaKeywords || globalSettings.defaultKeywords,
            canonicalUrl: record?.canonicalUrl || (route ? `http://localhost:5000${route}` : 'http://localhost:5000/'),
            robots: record?.robots || globalSettings.defaultRobots,
            author: record?.author || globalSettings.defaultAuthor,
            language: record?.language || globalSettings.defaultLanguage,
            viewport: record?.viewport || 'width=device-width, initial-scale=1.0',
            themeColor: record?.themeColor || globalSettings.defaultThemeColor,
            favicon: record?.favicon || globalSettings.defaultFavicon,
            ogTitle: record?.ogTitle || record?.title || globalSettings.defaultTitle,
            ogDescription: record?.ogDescription || record?.metaDescription || globalSettings.defaultDescription,
            ogImage: record?.ogImage || globalSettings.defaultOgImage,
            ogUrl: record?.ogUrl || (route ? `http://localhost:5000${route}` : 'http://localhost:5000/'),
            ogType: record?.ogType || 'website',
            twitterCard: record?.twitterCard || 'summary_large_image',
            twitterTitle: record?.twitterTitle || record?.title || globalSettings.defaultTitle,
            twitterDescription: record?.twitterDescription || record?.metaDescription || globalSettings.defaultDescription,
            twitterImage: record?.twitterImage || globalSettings.defaultTwitterImage,
            structuredData: record?.structuredData || globalSettings.websiteSchema,
            alternateLanguages: record?.alternateLanguages || null,
            customHeadTags: record?.customHeadTags || null,
            customMetaTags: record?.customMetaTags || null,
            pageKey: record?.pageKey || pageKey || 'default',
            pageType: record?.pageType || 'static'
        };

        res.json({
            seo: resolvedSeo,
            globalSettings
        });
    } catch (error) {
        console.error('Error resolving SEO:', error);
        res.status(500).json({ message: 'Error resolving SEO configuration' });
    }
};

// 2. Get All SEO Settings (Admin List with Search and Filter)
const getAllSeo = async (req, res) => {
    try {
        const { search, pageType, isActive, page = 1, limit = 50 } = req.query;
        const where = {};

        if (search) {
            where[Op.or] = [
                { pageKey: { [Op.like]: `%${search}%` } },
                { pageName: { [Op.like]: `%${search}%` } },
                { title: { [Op.like]: `%${search}%` } },
                { route: { [Op.like]: `%${search}%` } }
            ];
        }

        if (pageType) {
            where.pageType = pageType;
        }

        if (isActive !== undefined && isActive !== '') {
            where.isActive = isActive === 'true' || isActive === true;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await SeoSetting.findAndCountAll({
            where,
            order: [['updatedAt', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            seoRecords: rows,
            totalRecords: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching SEO list:', error);
        res.status(500).json({ message: 'Error loading SEO records' });
    }
};

// 3. Get Single SEO Setting by ID
const getSeoById = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await SeoSetting.findByPk(id);
        if (!record) {
            return res.status(404).json({ message: 'SEO record not found' });
        }

        const auditLogs = await SeoAuditLog.findAll({
            where: { pageKey: record.pageKey },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        res.json({ record, auditLogs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching SEO record' });
    }
};

// 4. Create SEO Setting
const createSeo = async (req, res) => {
    try {
        const data = req.body;
        const existing = await SeoSetting.findOne({ where: { pageKey: data.pageKey } });
        if (existing) {
            return res.status(400).json({ message: `Page Key "${data.pageKey}" already exists.` });
        }

        const newRecord = await SeoSetting.create({
            ...data,
            createdBy: req.user?.email || 'admin'
        });

        await SeoAuditLog.create({
            pageKey: newRecord.pageKey,
            action: 'CREATE',
            performedBy: req.user?.email || 'admin',
            changes: newRecord.toJSON()
        });

        res.status(201).json({ message: 'SEO record created successfully', record: newRecord });
    } catch (error) {
        console.error('Error creating SEO:', error);
        res.status(500).json({ message: error.message || 'Error creating SEO record' });
    }
};

// 5. Update SEO Setting
const updateSeo = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const record = await SeoSetting.findByPk(id);
        if (!record) {
            return res.status(404).json({ message: 'SEO record not found' });
        }

        const oldValues = record.toJSON();
        await record.update({
            ...data,
            isManuallyEdited: true,   // Prevent auto-sync from overwriting this
            updatedBy: req.user?.email || 'admin'
        });

        await SeoAuditLog.create({
            pageKey: record.pageKey,
            action: 'UPDATE',
            performedBy: req.user?.email || 'admin',
            changes: { before: oldValues, after: record.toJSON() }
        });

        res.json({ message: 'SEO record updated successfully', record });
    } catch (error) {
        console.error('Error updating SEO:', error);
        res.status(500).json({ message: 'Error updating SEO record' });
    }
};

// 6. Delete SEO Setting
const deleteSeo = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await SeoSetting.findByPk(id);
        if (!record) {
            return res.status(404).json({ message: 'SEO record not found' });
        }

        const pageKey = record.pageKey;
        await record.destroy();

        await SeoAuditLog.create({
            pageKey,
            action: 'DELETE',
            performedBy: req.user?.email || 'admin',
            changes: { deleted: record.toJSON() }
        });

        res.json({ message: 'SEO record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting SEO record' });
    }
};

// 7. Bulk Delete & Bulk Update
const bulkActions = async (req, res) => {
    try {
        const { action, ids, updateData } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No records selected' });
        }

        if (action === 'DELETE') {
            await SeoSetting.destroy({ where: { id: ids } });
            res.json({ message: `Successfully deleted ${ids.length} SEO records.` });
        } else if (action === 'TOGGLE_ACTIVE') {
            await SeoSetting.update({ isActive: updateData.isActive }, { where: { id: ids } });
            res.json({ message: `Successfully updated status for ${ids.length} records.` });
        } else {
            res.status(400).json({ message: 'Invalid bulk action' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error performing bulk action' });
    }
};

// 8. Import / Export SEO
const exportSeo = async (req, res) => {
    try {
        const records = await SeoSetting.findAll({ order: [['pageName', 'ASC']] });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Export failed' });
    }
};

const importSeo = async (req, res) => {
    try {
        const { records } = req.body;
        if (!Array.isArray(records)) {
            return res.status(400).json({ message: 'Invalid import format. Expected array.' });
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of records) {
            if (!item.pageKey || !item.pageName || !item.route) continue;
            const [seo, created] = await SeoSetting.upsert({
                ...item,
                updatedBy: req.user?.email || 'import_admin'
            });
            if (created) createdCount++;
            else updatedCount++;
        }

        res.json({ message: `Import completed. ${createdCount} created, ${updatedCount} updated.` });
    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ message: 'Import failed: ' + error.message });
    }
};

// 9. Global SEO Settings Handlers
const getGlobalSeo = async (req, res) => {
    try {
        const settings = await getOrCreateGlobalSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching global settings' });
    }
};

const updateGlobalSeo = async (req, res) => {
    try {
        const settings = await getOrCreateGlobalSettings();
        await settings.update(req.body);
        res.json({ message: 'Global SEO settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ message: 'Error updating global settings' });
    }
};

// 10. Real-time SEO Validation
const validateSeo = async (req, res) => {
    const { title, metaDescription, pageKey, canonicalUrl, structuredData } = req.body;
    const warnings = [];

    if (!title || title.trim().length === 0) warnings.push({ field: 'title', message: 'Page Title is missing.' });
    else if (title.length < 30) warnings.push({ field: 'title', message: 'Page Title is short (< 30 chars). Recommended 50-60 chars.' });
    else if (title.length > 60) warnings.push({ field: 'title', message: 'Page Title exceeds 60 chars. May get truncated in Google Search.' });

    if (!metaDescription || metaDescription.trim().length === 0) warnings.push({ field: 'metaDescription', message: 'Meta Description is missing.' });
    else if (metaDescription.length < 70) warnings.push({ field: 'metaDescription', message: 'Meta Description is short (< 70 chars).' });
    else if (metaDescription.length > 160) warnings.push({ field: 'metaDescription', message: 'Meta Description exceeds 160 chars. May get truncated.' });

    if (!canonicalUrl) warnings.push({ field: 'canonicalUrl', message: 'Canonical URL is not specified.' });

    if (structuredData) {
        try {
            if (typeof structuredData === 'string') JSON.parse(structuredData);
        } catch (e) {
            warnings.push({ field: 'structuredData', message: 'Invalid JSON-LD schema syntax.' });
        }
    }

    res.json({ valid: warnings.length === 0, warnings });
};

module.exports = {
    resolveSeoByRoute,
    getAllSeo,
    getSeoById,
    createSeo,
    updateSeo,
    deleteSeo,
    bulkActions,
    exportSeo,
    importSeo,
    getGlobalSeo,
    updateGlobalSeo,
    validateSeo
};
