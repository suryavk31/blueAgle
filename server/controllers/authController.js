const { User } = require('../models');

const loginOrRegister = async (req, res) => {
    try {
        const { phone_number, uid } = req.user; // From middleware

        // Find or create user
        // Note: We might want to update email or name if provided in body
        const [user, created] = await User.findOrCreate({
            where: { phone: phone_number },
            defaults: {
                role: 'user', // Default role
            }
        });

        res.status(200).json({
            message: created ? 'User registered' : 'User logged in',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ where: { phone: req.user.phone_number } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginOrRegister, getMe };
