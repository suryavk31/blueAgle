const { Policy } = require('../models');

const getPolicy = async (req, res) => {
    try {
        const { type } = req.params;
        const policy = await Policy.findOne({ where: { type } });
        if (!policy) return res.status(404).json({ message: 'Policy not found' });
        res.json(policy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePolicy = async (req, res) => { // Admin
    try {
        const { type } = req.params;
        const { content } = req.body;

        // Find or create
        let policy = await Policy.findOne({ where: { type } });
        if (!policy) {
            policy = await Policy.create({ type, content });
        } else {
            policy.content = content;
            await policy.save();
        }
        res.json(policy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPolicy,
    updatePolicy
};
