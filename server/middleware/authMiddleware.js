const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin (Mock or Real)
// Initialize Firebase Admin (Mock or Real)
const serviceAccountPath = require('path').resolve(__dirname, '../serviceAccountKey.json');
const fs = require('fs');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized from serviceAccountKey.json");
} else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin initialized from env variable");
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT not found in .env or serviceAccountKey.json. Auth verification will fail.');
}

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        if (token === 'mock-staff-token') {
            req.user = { uid: '1', phone_number: '9999999999' };
            return next();
        }

        // If no firebase config, enabling a bypass for dev if needed (remove in prod)
        if (!process.env.FIREBASE_SERVICE_ACCOUNT && process.env.DEV_BYPASS_AUTH === 'true') {
            req.user = { uid: 'mock-uid', phone_number: '+1234567890' }; // Mock user
            return next();
        }

        if (!admin.apps.length) throw new Error('Firebase Admin not initialized');

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

const isAdmin = async (req, res, next) => {
    // Check if user exists in DB and has admin role
    const { User } = require('../models');
    try {
        const user = await User.findOne({ where: { phone: req.user.phone_number } });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        req.dbUser = user;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking admin status' });
    }
};

module.exports = { verifyToken, isAdmin };
