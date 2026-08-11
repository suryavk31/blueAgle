const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Customer Routes ──────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const policyRoutes = require('./routes/policyRoutes');
const userRoutes = require('./routes/userRoutes');
const adRoutes = require('./routes/adRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const addressRoutes = require('./routes/addressRoutes');
const seoRoutes = require('./routes/seoRoutes');
const blogRoutes = require('./routes/blogRoutes');
const { generateSitemap } = require('./controllers/sitemapController');
const { generateRobotsTxt } = require('./controllers/robotsController');

const accountDeletionRoutes = require('./routes/accountDeletionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/account', accountDeletionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/blogs', blogRoutes);

const productAttrCtrl = require('./controllers/productAttributeController');
app.get('/api/product-attributes', productAttrCtrl.listAttributes);
app.post('/api/product-attributes', productAttrCtrl.createAttribute);
app.put('/api/product-attributes/:id', productAttrCtrl.updateAttribute);
app.delete('/api/product-attributes/:id', productAttrCtrl.deleteAttribute);

// ─── Admin RBAC Routes ────────────────────────────────────────────────────────
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminUsersRoutes = require('./routes/adminUsersRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const modulesRoutes = require('./routes/modulesRoutes');
const permissionsRoutes = require('./routes/permissionsRoutes');
const invitationsRoutes = require('./routes/invitationsRoutes');
const activityLogsRoutes = require('./routes/activityLogsRoutes');
const invoiceBuilderRoutes = require('./routes/invoiceBuilderRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin/delivery', deliveryRoutes);
app.use('/api/invoice', invoiceBuilderRoutes);
app.use('/api/admin/invoice', invoiceBuilderRoutes);
app.use('/api/admin/invoice-builder', invoiceBuilderRoutes);

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/roles', rolesRoutes);
app.use('/api/admin/modules', modulesRoutes);
app.use('/api/admin/permissions', permissionsRoutes);
app.use('/api/admin/invitations', invitationsRoutes);
app.use('/api/admin/activity-logs', activityLogsRoutes);

// ─── Resource Routes (Admin Aliases for adminApi) ─────────────────────────────
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/orders', orderRoutes);
app.use('/api/admin/coupons', couponRoutes);
app.use('/api/admin/ads', adRoutes);
app.use('/api/admin/policies', policyRoutes);
app.use('/api/admin/seo', seoRoutes);
app.use('/api/admin/blogs', blogRoutes);
app.use('/api/admin/customer-users', userRoutes);

// ─── SEO & Sitemap ────────────────────────────────────────────────────────────
const socialCrawlerMiddleware = require('./middleware/socialCrawlerMiddleware');
app.use(socialCrawlerMiddleware);

app.get('/sitemap.xml', generateSitemap);
app.get('/robots.txt', generateRobotsTxt);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'BlueAgle API Service Operational' });
});

// ─── Centralized Error Handling ───────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ─── Database Sync and Server Start ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize.sync()
    .then(() => {
        console.log('Database connected & synced successfully.');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
