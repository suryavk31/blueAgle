import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { FaShoppingCart, FaSearch, FaFilter, FaBoxOpen, FaTimes, FaMapMarkerAlt, FaUser, FaPhoneAlt, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await adminApi.get('/orders/all');
            setOrders(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await adminApi.put(`/orders/${id}/status`, { status });
            toast.success("Status Updated Successfully");
            fetchOrders();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'Processing': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            default: return 'bg-amber-50 text-amber-600 border-amber-200';
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaShoppingCart className="text-indigo-600" /> Manage Orders
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Track, process, and fulfill customer orders in real-time.</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input type="text" placeholder="Search orders..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-y-2.5 min-w-[600px]">
                        <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-4 sm:px-6 py-3 rounded-l-xl">Order ID &amp; Date</th>
                                <th className="px-4 sm:px-6 py-3">Customer Details</th>
                                <th className="px-4 sm:px-6 py-3">Total Amount</th>
                                <th className="px-4 sm:px-6 py-3">Fulfillment Status</th>
                                <th className="px-4 sm:px-6 py-3 text-right rounded-r-xl">Action / Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <FaBoxOpen size={24} className="text-gray-300" />
                                            </div>
                                            <p className="font-medium text-base">No orders found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className="group hover:bg-gray-50 shadow-sm bg-white border-y border-gray-50 transition-all cursor-pointer"
                                    >
                                        <td className="px-4 sm:px-6 py-4 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">#{order.id.toString().padStart(5, '0')}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {order.paymentMethod || 'Online'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-xs sm:text-sm border border-indigo-200/50 shrink-0">
                                                    {(order.User?.name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-gray-800 text-xs sm:text-sm truncate">{order.User?.name || 'Unknown User'}</span>
                                                    <span className="text-[11px] text-gray-500 font-medium truncate">{order.User?.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                            <span className="font-black text-gray-900 text-sm sm:text-base">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 rounded-r-xl border-y border-r border-gray-100 text-right group-hover:border-transparent" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Drawer / Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-left">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl sm:text-2xl font-black text-gray-900">Order #{selectedOrder.id.toString().padStart(5, '0')}</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2 font-medium">
                                    <p className="flex items-center gap-1.5"><FaCalendarAlt className="text-indigo-400" /> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    <p className="flex items-center gap-1.5"><FaCreditCard className="text-indigo-400" /> {selectedOrder.paymentStatus} via {selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2.5 hover:bg-gray-200/60 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-grow space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column: Items */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="bg-gray-50/50 rounded-2xl p-4 sm:p-6 border border-gray-100">
                                        <h4 className="font-black text-gray-900 mb-4 text-sm sm:text-base flex items-center gap-2">
                                            <FaShoppingCart className="text-indigo-500" /> Order Items ({selectedOrder.OrderItems?.length || 0})
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedOrder.OrderItems?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-xs">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                                        <img
                                                            src={item.Product?.images?.[0] ? getImageUrl(item.Product.images[0]) : 'https://via.placeholder.com/150'}
                                                            alt={item.Product?.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h5 className="font-bold text-gray-900 truncate text-xs sm:text-sm">{item.Product?.name}</h5>
                                                        <p className="text-[11px] text-gray-500 mt-0.5 font-medium">SKU: {item.productId}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-gray-900 text-xs sm:text-sm">₹{parseFloat(item.price).toLocaleString()} × {item.quantity}</p>
                                                        <p className="font-black text-indigo-600 text-xs sm:text-sm">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Customer & Summary */}
                                <div className="space-y-4">
                                    <div className="bg-indigo-50/30 rounded-2xl p-4 sm:p-6 border border-indigo-100/50">
                                        <h4 className="font-black text-gray-900 mb-4 text-sm sm:text-base flex items-center gap-2">
                                            <FaUser className="text-indigo-600" /> Customer Details
                                        </h4>
                                        <div className="space-y-3 text-xs sm:text-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <FaUser size={11} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Name</p>
                                                    <p className="font-bold text-gray-900">{selectedOrder.User?.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <FaPhoneAlt size={11} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Phone</p>
                                                    <p className="font-bold text-gray-900">{selectedOrder.User?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <FaMapMarkerAlt size={11} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Delivery Address</p>
                                                    <p className="font-medium text-gray-700 leading-relaxed text-xs">
                                                        {typeof selectedOrder.address === 'object' 
                                                            ? [selectedOrder.address?.flatNo, selectedOrder.address?.area, selectedOrder.address?.landmark, selectedOrder.address?.city, selectedOrder.address?.pincode].filter(Boolean).join(', ')
                                                            : (selectedOrder.address || 'N/A')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
