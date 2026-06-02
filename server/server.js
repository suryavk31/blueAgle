const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Import from models/index.js to load associations
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const couponRoutes = require('./routes/couponRoutes');
app.use('/api/coupons', couponRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const policyRoutes = require('./routes/policyRoutes');
app.use('/api/policies', policyRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const adRoutes = require('./routes/adRoutes');
app.use('/api/ads', adRoutes);

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

const addressRoutes = require('./routes/addressRoutes');
app.use('/api/addresses', addressRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Sync and Server Start
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }) // Set force: true to drop tables on restart
    .then(() => {
        console.log('Database connected & synced');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
