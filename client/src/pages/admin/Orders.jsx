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
            default: return 'bg-amber-50 text-amber-600 border-amber-200'; // Pending
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaShoppingCart className="text-indigo-600" /> Manage Orders
                    </h2>
                    <p className="text-gray-500 font-medium">Track, process, and fulfill customer orders in real-time.</p>
                </div>
                <div className="relative z-10 flex gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search orders..." className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64 transition-all" />
                    </div>
                    <button className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 font-bold shadow-sm">
                        <FaFilter />
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                        <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 rounded-l-xl">Order ID & Date</th>
                                <th className="px-6 py-4">Customer Details</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Fulfillment Status</th>
                                <th className="px-6 py-4 text-right rounded-r-xl">Action / Update</th>
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
                                        <td className="px-6 py-5 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent">
                                            <div className="flex flex-col">
                                                <span className="font-black text-gray-900 text-base group-hover:text-indigo-600 transition-colors">#{order.id.toString().padStart(5, '0')}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {order.paymentMethod || 'Online'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:border-transparent">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200/50 shrink-0">
                                                    {(order.User?.name || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 text-sm">{order.User?.name || 'Unknown User'}</span>
                                                    <span className="text-xs text-gray-500 font-medium">{order.User?.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:border-transparent">
                                            <span className="font-black text-gray-800 text-base">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 border-y border-gray-100 group-hover:border-transparent">
                                            <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                                {!['Delivered', 'Cancelled'].includes(order.status) && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 mr-2 animate-pulse"></span>
                                                )}
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 rounded-r-xl border-y border-r border-gray-100 group-hover:border-transparent text-right">
                                            <select
                                                value={order.status}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateStatus(order.id, e.target.value);
                                                }}
                                                className="bg-white border text-sm font-bold border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm appearance-none cursor-pointer text-center"
                                                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                                            >
                                                <option value="Pending" className="text-gray-900 font-medium">Set to Pending</option>
                                                <option value="Processing" className="text-gray-900 font-medium">Set to Processing</option>
                                                <option value="Shipped" className="text-gray-900 font-medium">Set to Shipped</option>
                                                <option value="Delivered" className="text-gray-900 font-medium">Set to Delivered</option>
                                                <option value="Cancelled" className="text-rose-600 font-medium">Cancel Order</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedOrder(null)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] animate-slide-up flex flex-col">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 flex justify-between items-start border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    Order #{selectedOrder.id.toString().padStart(5, '0')}
                                    <span className={`text-sm px-4 py-1 rounded-full border font-bold ${getStatusStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 font-medium">
                                    <p className="flex items-center gap-2"><FaCalendarAlt className="text-indigo-400" /> Placed on {new Date(selectedOrder.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="flex items-center gap-2"><FaCreditCard className="text-indigo-400" /> {selectedOrder.paymentStatus} via {selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Items */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                        <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                            <FaShoppingCart className="text-indigo-500" /> Order Items ({selectedOrder.OrderItems?.length || 0})
                                        </h4>
                                        <div className="space-y-4">
                                            {selectedOrder.OrderItems?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.01]">
                                                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                                        <img
                                                            src={item.Product?.images?.[0] ? getImageUrl(item.Product.images[0]) : 'https://via.placeholder.com/150'}
                                                            alt={item.Product?.name}
                                                            className="w-full h-full object-cover"
                                                        />

                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <h5 className="font-bold text-gray-900 truncate text-sm">{item.Product?.name}</h5>
                                                        <p className="text-xs text-gray-500 mt-0.5 font-medium">SKU: {item.productId}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-2">
                                                        <p className="font-bold text-gray-900 text-sm">₹{parseFloat(item.price).toLocaleString()} × {item.quantity}</p>
                                                        <p className="font-black text-indigo-600 text-sm">₹{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Customer & Summary */}
                                <div className="space-y-6">
                                    {/* Customer Section */}
                                    <div className="bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100/50">
                                        <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                            <FaUser className="text-indigo-600" /> Customer Details
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <FaUser size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Name</p>
                                                    <p className="font-bold text-gray-900">{selectedOrder.User?.name || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <FaPhoneAlt size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Phone</p>
                                                    <p className="font-bold text-gray-900">{selectedOrder.User?.phone || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                    <FaMapMarkerAlt size={12} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Delivery Address</p>
                                                    <p className="font-medium text-gray-700 text-sm line-clamp-3 leading-relaxed">
                                                        {typeof selectedOrder.address === 'object' 
                                                            ? [
                                                                selectedOrder.address.flatNo,
                                                                selectedOrder.address.floor ? `Floor ${selectedOrder.address.floor}` : null,
                                                                selectedOrder.address.area,
                                                                selectedOrder.address.landmark ? `Near: ${selectedOrder.address.landmark}` : null,
                                                                (selectedOrder.address.contactName || selectedOrder.address.contactPhone) 
                                                                    ? `(${selectedOrder.address.contactName}${selectedOrder.address.contactPhone ? ': ' : ''}${selectedOrder.address.contactPhone})` 
                                                                    : null
                                                              ].filter(Boolean).join(', ')
                                                            : (selectedOrder.address || 'No address provided')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                                        <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                            Payment Summary
                                        </h4>
                                        <div className="space-y-3 border-b border-gray-100 pb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Subtotal</span>
                                                <span className="text-gray-900 font-bold">₹{parseFloat(selectedOrder.totalAmount).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Shipping</span>
                                                <span className="text-emerald-600 font-bold">FREE</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <span className="font-black text-gray-900 text-lg">Total Amount</span>
                                            <span className="font-black text-2xl text-indigo-600">₹{parseFloat(selectedOrder.totalAmount).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 pt-4 border-t border-gray-100 flex-shrink-0 flex justify-between items-center gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await adminApi.get(`/invoice/order/${selectedOrder.id}/render`);
                                        const printWin = window.open('', '_blank');
                                        printWin.document.write(`
                                            <html>
                                                <head>
                                                    <title>Invoice #${selectedOrder.id}</title>
                                                    <style>body { font-family: Inter, sans-serif; margin: 0; padding: 20px; }</style>
                                                </head>
                                                <body>
                                                    <div id="render-root"></div>
                                                    <script>window.print();</script>
                                                </body>
                                            </html>
                                        `);
                                    } catch {
                                        toast.error('Failed to compile invoice');
                                    }
                                }}
                                className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-bold text-sm flex items-center gap-2 border border-indigo-200 transition-colors"
                            >
                                🖨️ Print / Download Invoice
                            </button>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-sm transition-colors"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
