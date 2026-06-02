const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const SubCategory = require('./SubCategory');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Coupon = require('./Coupon');
const Policy = require('./Policy');
const Ad = require('./Ad');
const AdAnalytics = require('./AdAnalytics');
const Address = require('./Address');

// Associations

// Category & SubCategory
Category.hasMany(SubCategory, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
SubCategory.belongsTo(Category, { foreignKey: 'categoryId' });

// SubCategory & Product
SubCategory.hasMany(Product, { foreignKey: 'subCategoryId', onDelete: 'CASCADE' });
Product.belongsTo(SubCategory, { foreignKey: 'subCategoryId' });

// User & Cart
User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Cart & CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// Product & CartItem
Product.hasMany(CartItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// User & Order
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Order & OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Product & OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' }); // Don't cascade delete orders if product deleted, maybe restrict?
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Ads
Ad.hasMany(AdAnalytics, { foreignKey: 'adId', onDelete: 'CASCADE' });
AdAnalytics.belongsTo(Ad, { foreignKey: 'adId' });

// User & Address
User.hasMany(Address, { foreignKey: 'userId', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Category,
    SubCategory,
    Product,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Coupon,
    Policy,
    Ad,
    AdAnalytics,
    Address
};
