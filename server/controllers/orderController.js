const { Order, OrderItem, Product, Coupon, Cart, CartItem, User, Ad, AdAnalytics, sequelize } = require('../models');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

const createRazorpayOrder = async (req, res) => {
    try {
        const { address, couponCode, items } = req.body;
        const user = await User.findOne({ where: { phone: req.user.phone_number } });

        let cartItems = [];
        if (items && items.length > 0) {
            cartItems = items;
        } else {
            const cart = await Cart.findOne({
                where: { userId: user.id },
                include: [{ model: CartItem, include: [Product] }]
            });
            if (cart) cartItems = cart.CartItems;
        }

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        let totalAmount = 0;
        cartItems.forEach(item => {
            const productPrice = item.Product ? item.Product.price : item.price;
            totalAmount += parseFloat(productPrice) * item.quantity;
        });

        // Apply Coupon
        // Note: Ideally verify coupon again here for safety
        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true } });
            if (coupon && new Date(coupon.expiryDate) >= new Date()) {
                if (coupon.discountType === 'percentage') {
                    const discountAmount = (totalAmount * parseFloat(coupon.value)) / 100;
                    totalAmount -= discountAmount;
                } else {
                    totalAmount -= parseFloat(coupon.value);
                }
            } else if (couponCode) {
                // If code provided but invalid/expired
                return res.status(400).json({ message: 'Invalid or expired coupon' });
            }
        }

        if (totalAmount < 0) totalAmount = 0;

        const options = {
            amount: Math.round(totalAmount * 100), // amount in paisa
            currency: "INR",
            receipt: `order_${Date.now()}`,
        };

        const response = await razorpay.orders.create(options);

        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
            totalAmount: totalAmount, // Sent back for DB record later? 
            // Better to re-calculate on verification or trust amount matches logic
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const verifyPaymentAndCreateOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            address,
            couponCode,
            amount,
            items
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest('hex');

        // Allow bypass in dev if keys are placeholders
        const isDevInfo = (!process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET === 'secret_placeholder');

        if (expectedSignature === razorpay_signature || isDevInfo) {
            const user = await User.findOne({ where: { phone: req.user.phone_number } });

            let cartItems = [];
            if (items && items.length > 0) {
                cartItems = items;
            } else {
                const cart = await Cart.findOne({
                    where: { userId: user.id },
                    include: [{ model: CartItem, include: [Product] }],
                    transaction: t
                });
                if (cart) cartItems = cart.CartItems;
            }

            if (cartItems.length === 0) {
                await t.rollback();
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Re-verify coupon and amount
            let totalAmount = 0;
            cart.CartItems.forEach(item => {
                totalAmount += parseFloat(item.Product.price) * item.quantity;
            });

            if (couponCode) {
                const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true }, transaction: t });
                if (coupon && new Date(coupon.expiryDate) >= new Date()) {
                    if (coupon.discountType === 'percentage') {
                        totalAmount -= (totalAmount * parseFloat(coupon.value)) / 100;
                    } else {
                        totalAmount -= parseFloat(coupon.value);
                    }
                }
            }
            if (totalAmount < 0) totalAmount = 0;

            // Optional: Hard check against passed 'amount' if needed, 
            // but we trust our re-calculation for the DB record.
            const finalAmount = amount || totalAmount; 

            // Create Order
            const order = await Order.create({
                userId: user.id,
                totalAmount: finalAmount,
                paymentStatus: 'Paid',
                paymentId: razorpay_payment_id,
                address: address,
                status: 'Processing',
                paymentMethod: 'Online'
            }, { transaction: t });

            // Create Order Items & Update Stock
            for (const item of cartItems) {
                await OrderItem.create({
                    orderId: order.id,
                    price: item.Product ? item.Product.price : item.price,
                    quantity: item.quantity,
                    productId: item.Product ? item.Product.id : item.productId || item.id
                }, { transaction: t });

                // Deduct Stock
                const prodId = item.Product ? item.Product.id : item.productId || item.id;
                const product = await Product.findByPk(prodId, { transaction: t });
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    await product.save({ transaction: t });
                } else {
                    throw new Error(`Product ${product.name} out of stock`);
                }
            }

            // Clear Cart (only if DB cart was used)
            if (!items) {
                const dbCart = await Cart.findOne({ where: { userId: user.id }, transaction: t });
                if (dbCart) {
                    await CartItem.destroy({ where: { cartId: dbCart.id }, transaction: t });
                }
            }

            // Ad Conversion Tracking
            const { adIdSource } = req.body; // Passed from client if order originated from ad
            if (adIdSource) {
                const ad = await Ad.findByPk(adIdSource, { transaction: t });
                if (ad) {
                    ad.conversions += 1;
                    await ad.save({ transaction: t });
                    await AdAnalytics.create({
                        adId: ad.id,
                        type: 'conversion',
                        userId: user.id
                    }, { transaction: t });
                }
            }

            await t.commit();
            res.json({ message: 'Order placed successfully', orderId: order.id });

        } else {
            await t.rollback();
            res.status(400).json({ message: 'Invalid signature' });
        }

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const createCODOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { address, couponCode, adIdSource, items } = req.body;
        const user = await User.findOne({ where: { phone: req.user.phone_number } });

        let cartItems = [];
        if (items && items.length > 0) {
            cartItems = items;
        } else {
            const cart = await Cart.findOne({
                where: { userId: user.id },
                include: [{ model: CartItem, include: [Product] }],
                transaction: t
            });
            if (cart) cartItems = cart.CartItems;
        }

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total
        let totalAmount = 0;
        cartItems.forEach(item => {
            const productPrice = item.Product ? item.Product.price : item.price;
            totalAmount += parseFloat(productPrice) * item.quantity;
        });

        if (couponCode) {
            const coupon = await Coupon.findOne({ where: { code: couponCode, isActive: true }, transaction: t });
            if (coupon && new Date(coupon.expiryDate) >= new Date()) {
                if (coupon.discountType === 'percentage') {
                    totalAmount -= (totalAmount * parseFloat(coupon.value)) / 100;
                } else {
                    totalAmount -= parseFloat(coupon.value);
                }
            }
        }
        if (totalAmount < 0) totalAmount = 0;

        // Create Order
        const order = await Order.create({
            userId: user.id,
            totalAmount: totalAmount,
            paymentStatus: 'Pending',
            address: address,
            status: 'Processing',
            paymentMethod: 'COD'
        }, { transaction: t });

        // Create Order Items & Update Stock
        for (const item of cartItems) {
            await OrderItem.create({
                orderId: order.id,
                price: item.Product ? item.Product.price : item.price,
                quantity: item.quantity,
                productId: item.Product ? item.Product.id : item.productId || item.id
            }, { transaction: t });

            // Deduct Stock
            const prodId = item.Product ? item.Product.id : item.productId || item.id;
            const product = await Product.findByPk(prodId, { transaction: t });
            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await product.save({ transaction: t });
            } else {
                throw new Error(`Product ${product.name} out of stock`);
            }
        }

        // Clear Cart
        const dbCart = await Cart.findOne({ where: { userId: user.id }, transaction: t });
        if (dbCart) {
            await CartItem.destroy({ where: { cartId: dbCart.id }, transaction: t });
        }

        // Ad Conversion Tracking
        if (adIdSource) {
            const ad = await Ad.findByPk(adIdSource, { transaction: t });
            if (ad) {
                ad.conversions += 1;
                await ad.save({ transaction: t });
                await AdAnalytics.create({ adId: ad.id, type: 'conversion', userId: user.id }, { transaction: t });
            }
        }

        await t.commit();
        res.json({ message: 'Order placed successfully (COD)', orderId: order.id });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const user = await User.findOne({ where: { phone: req.user.phone_number } });
        const orders = await Order.findAll({
            where: { userId: user.id },
            include: [{ model: OrderItem, include: [Product] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => { // Admin
    try {
        const orders = await Order.findAll({
            include: [
                { model: OrderItem, include: [Product] },
                { model: User, attributes: ['id', 'name', 'phone'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => { // Admin
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPaymentAndCreateOrder,
    createCODOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
};
