import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    FaUser, FaPhone, FaSignOutAlt, FaBox, FaChevronDown, FaChevronUp,
    FaMapMarkerAlt, FaCreditCard, FaTruck, FaCheckCircle, FaClock,
    FaTimesCircle, FaShoppingBag, FaReceipt, FaRedo, FaTrash
} from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import OrderStatusTimeline from '../components/OrderStatusTimeline';

const STATUS_CONFIG = {
    Pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: FaClock, dot: 'bg-yellow-400' },
    Processing: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FaBox, dot: 'bg-blue-500' },
    Shipped: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FaTruck, dot: 'bg-purple-500' },
    'Out for Delivery': { color: 'bg-blue-50 text-blue-600 border-blue-200', icon: FaTruck, dot: 'bg-blue-400' },
    Delivered: { color: 'bg-green-100 text-green-700 border-green-200', icon: FaCheckCircle, dot: 'bg-green-500' },
    Cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: FaTimesCircle, dot: 'bg-red-500' },
    Returned: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FaRedo, dot: 'bg-gray-500' },
};

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const Profile = () => {
    const { currentUser, userData, logout } = useAuth();
    const { itemCount } = useCart();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) { setLoading(false); return; }
            try {
                const token = await currentUser.getIdToken();
                const res = await api.get('/orders/my-orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out');
            navigate('/');
        } catch (err) {
            toast.error('Logout failed');
        }
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="text-7xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Login</h2>
                <p className="text-gray-500 mb-6">Login to view your profile and orders</p>
                <button onClick={() => navigate('/login')} className="bg-[#ff3269] text-white px-8 py-3 rounded-xl font-bold">
                    Login Now
                </button>
            </div>
        );
    }

    const getStepIndex = (status) => {
        const idx = STEPS.indexOf(status);
        return idx >= 0 ? idx : -1;
    };

    return (
        <div className="max-w-4xl mx-auto pb-20 md:pb-8">

            {/* Profile Header Card */}
            <div className="bg-gradient-to-br from-[#1a1a4e] via-[#2d1b69] to-[#3c006b] rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-bold border border-white/20">
                        {(userData?.name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl md:text-2xl font-bold mb-1">{userData?.name || 'User'}</h1>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <FaPhone className="text-xs" />
                            <span>{currentUser?.phoneNumber || 'No phone'}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 transition-all"
                    >
                        <FaSignOutAlt />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10">
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Orders</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10">
                        <div className="text-2xl font-bold">{itemCount}</div>
                        <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider">In Cart</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/10">
                        <div className="text-2xl font-bold">{orders.filter(o => o.status === 'Delivered').length}</div>
                        <div className="text-[11px] text-white/60 font-medium uppercase tracking-wider">Delivered</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-white text-[#1a1a4e] shadow-sm' : 'text-gray-500'}`}
                >
                    <FaShoppingBag className="text-xs" /> My Orders
                </button>
                <button
                    onClick={() => setActiveTab('account')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'account' ? 'bg-white text-[#1a1a4e] shadow-sm' : 'text-gray-500'}`}
                >
                    <FaUser className="text-xs" /> Account
                </button>
            </div>

            {activeTab === 'orders' ? (
                /* Orders Tab */
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#3c006b]"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">No orders yet</h3>
                            <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
                            <button onClick={() => navigate('/products')} className="bg-[#ff3269] text-white px-6 py-2.5 rounded-lg font-bold text-sm">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        orders.map(order => {
                            const isExpanded = expandedOrder === order.id;
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
                            const StatusIcon = config.icon;
                            const stepIdx = getStepIndex(order.status);
                            const items = order.OrderItems || [];
                            const firstItem = items[0];
                            const moreCount = items.length - 1;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Order Header — always visible */}
                                    <div className="p-4 md:p-5 cursor-pointer" onClick={() => toggleOrder(order.id)}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-gray-800">Order #{order.id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-bold text-gray-800">₹{parseFloat(order.totalAmount).toFixed(0)}</span>
                                                {isExpanded ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
                                            </div>
                                        </div>

                                        {/* Preview of first item */}
                                        {firstItem && (
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                                                    {firstItem.Product?.images?.[0] ? (
                                                        <img src={getImageUrl(firstItem.Product.images[0])} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                    ) : (
                                                        <FaBox className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-700 truncate">{firstItem.Product?.name || 'Product'}</p>
                                                    <p className="text-xs text-gray-400">Qty: {firstItem.quantity} × ₹{parseFloat(firstItem.price).toFixed(0)}</p>
                                                </div>
                                                {moreCount > 0 && (
                                                    <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                                                        +{moreCount} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100">
                                            {/* Enhanced Progress Tracker */}
                                            <div className="bg-gray-50/30 border-b border-gray-100">
                                                <OrderStatusTimeline status={order.status} />
                                            </div>

                                            {/* Items List */}
                                            <div className="px-5 py-4">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <FaReceipt className="text-gray-400" /> Items ({items.length})
                                                </h4>
                                                <div className="space-y-3">
                                                    {items.map(item => (
                                                        <div key={item.id} className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                                                                {item.Product?.images?.[0] ? (
                                                                    <img src={getImageUrl(item.Product.images[0])} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                                                ) : (
                                                                    <FaBox className="text-gray-300 text-xs" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-700 truncate">{item.Product?.name || 'Product'}</p>
                                                                <p className="text-xs text-gray-400">{item.Product?.description || '1 pack'}</p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="text-sm font-bold text-gray-800">₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</div>
                                                                <div className="text-[10px] text-gray-400">Qty: {item.quantity}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Delivery Address & Invoice Download */}
                                            <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* Delivery Address */}
                                                {order.address && (
                                                    <div className="bg-gray-50 rounded-xl p-3.5">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <FaMapMarkerAlt className="text-[#ff3269] text-xs" />
                                                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Delivery Address</span>
                                                            </div>
                                                        </div>
                                                        {typeof order.address === 'object' ? (
                                                            <>
                                                                <p className="text-sm text-gray-700 font-medium">{order.address.flatNo}</p>
                                                                <p className="text-xs text-gray-500">{order.address.area}</p>
                                                                {order.address.landmark && <p className="text-xs text-gray-400">Near: {order.address.landmark}</p>}
                                                            </>
                                                        ) : (
                                                            <p className="text-xs text-gray-600">{order.address}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Invoice Download Action */}
                                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex flex-col justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block mb-1">Official Tax Invoice</span>
                                                        <p className="text-xs text-indigo-600">Download or print your official transaction receipt for Order #{order.id}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const apiBase = import.meta.env.VITE_API_URL || '/api';
                                                            window.open(`${apiBase}/invoice/order/${order.id}/download`, '_blank');
                                                        }}
                                                        className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 flex items-center justify-center gap-1.5"
                                                    >
                                                        📄 Print / Download Invoice
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Payment */}
                                            <div className="px-5 pb-5">
                                                <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaCreditCard className="text-blue-500 text-xs" />
                                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Payment Breakdown</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-600">
                                                        <span>Items Subtotal</span>
                                                        <span className="font-semibold">₹{(order.subtotal ? parseFloat(order.subtotal) : (order.OrderItems || []).reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-600">
                                                        <span>Delivery Charge</span>
                                                        <span className={`font-bold ${parseFloat(order.deliveryCharge || 0) === 0 ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                            {parseFloat(order.deliveryCharge || 0) === 0 ? 'FREE' : `₹${parseFloat(order.deliveryCharge).toFixed(2)}`}
                                                        </span>
                                                    </div>
                                                    {parseFloat(order.discountAmount || 0) > 0 && (
                                                        <div className="flex justify-between items-center text-xs text-emerald-600">
                                                            <span>Discount</span>
                                                            <span className="font-semibold">- ₹{parseFloat(order.discountAmount).toFixed(2)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                                        <span className="text-sm font-bold text-gray-800">Grand Total</span>
                                                        <span className="text-base font-extrabold text-[#3c006b]">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                                                        <span>Method: <strong>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</strong></span>
                                                        <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </div>
                                                    {order.paymentId && (
                                                        <div className="text-[10px] text-gray-400 truncate pt-1">Transaction Ref: {order.paymentId}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                /* Account Tab */
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Account Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                    <FaUser />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Full Name</div>
                                    <div className="text-sm font-semibold text-gray-800">{userData?.name || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                    <FaPhone />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400">Phone Number</div>
                                    <div className="text-sm font-semibold text-gray-800">{currentUser?.phoneNumber || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Privacy & Security</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/account/delete')}
                                className="w-full flex items-center justify-between p-3.5 bg-red-50/50 hover:bg-red-50 rounded-xl transition-colors border border-red-100/50 text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm">
                                        <FaTrash />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-red-900 block">Delete My Account</span>
                                        <span className="text-xs text-red-600/70">Permanently anonymize identity and close account</span>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-red-600 group-hover:translate-x-1 transition-transform">Request →</span>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 border border-red-100 transition-colors"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;
