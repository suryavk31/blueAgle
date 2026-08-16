import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import {
    FaShoppingCart, FaSearch, FaBoxOpen, FaTimes, FaMapMarkerAlt,
    FaUser, FaPhoneAlt, FaCalendarAlt, FaCreditCard, FaEnvelope,
    FaTag, FaReceipt, FaImage, FaFileInvoice, FaEye, FaDownload, FaSyncAlt
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

    const fetchOrders = async () => {
        try {
            const res = await adminApi.get('/orders/all');
            setOrders(res.data || []);
        } catch (error) {
            console.error('Error fetching admin orders:', error);
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
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder(prev => ({ ...prev, status }));
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleGenerateInvoice = async (orderId) => {
        try {
            setGeneratingInvoiceId(orderId);
            const res = await adminApi.post(`/invoice/order/${orderId}/generate`);
            toast.success(`Invoice Generated: ${res.data.invoiceNumber}`);
            fetchOrders();
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate invoice');
        } finally {
            setGeneratingInvoiceId(null);
        }
    };

    const handlePreviewInvoice = (orderId) => {
        window.open(`${API_BASE}/invoice/order/${orderId}/render?format=html`, '_blank');
    };

    const handleDownloadInvoice = (orderId) => {
        window.open(`${API_BASE}/invoice/order/${orderId}/download`, '_blank');
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

    const formatAddress = (addr) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr;
        const parts = [
            addr.label ? `[${addr.label}]` : null,
            addr.flatNo,
            addr.floor,
            addr.area,
            addr.landmark,
            addr.city,
            addr.state,
            addr.pincode
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const orderIdStr = order.id.toString();
        const userName = (order.User?.name || order.User?.username || order.address?.contactName || '').toLowerCase();
        const phone = (order.User?.phone || order.address?.contactPhone || '').toLowerCase();
        return orderIdStr.includes(term) || userName.includes(term) || phone.includes(term);
    });

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-2.5 sm:gap-3">
                        <FaShoppingCart className="text-indigo-600 shrink-0" /> Manage Orders ({orders.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Track, process, fulfill customer orders &amp; generate official invoices.</p>
                </div>
                <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search order #, customer, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Orders Section */}
            <div className="bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                {/* Mobile Cards View (< md screens) */}
                <div className="space-y-3 md:hidden">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                <FaBoxOpen size={20} className="text-gray-300" />
                            </div>
                            <p className="font-medium text-sm">No orders found</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const custName = order.address?.contactName || order.address?.name || order.User?.name || order.User?.username || 'Customer';
                            const custPhone = order.address?.contactPhone || order.User?.phone || 'N/A';

                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-3"
                                >
                                    {/* Top Row: Order ID, Method, Date, Status */}
                                    <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-gray-900 text-sm">
                                                    #{order.id.toString().padStart(5, '0')}
                                                </span>
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {order.paymentMethod || 'Online'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Middle Row: Customer Info & Total Amount */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200/50 shrink-0">
                                                {(custName || 'C')[0].toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-800 text-xs truncate">{custName}</p>
                                                <p className="text-[10px] text-gray-400 truncate">{custPhone}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[9px] text-gray-400 block uppercase font-bold">Total</span>
                                            <span className="font-black text-indigo-600 text-sm">₹{parseFloat(order.totalAmount).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Change Status & View Details button */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex-1">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                                        >
                                            <FaEye size={10} /> Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop Table View (>= md screens) */}
                <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
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
                            {filteredOrders.length === 0 ? (
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
                                filteredOrders.map(order => {
                                    const custName = order.address?.contactName || order.address?.name || order.User?.name || order.User?.username || 'Customer';
                                    const custPhone = order.address?.contactPhone || order.User?.phone || 'N/A';

                                    return (
                                        <tr
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className="group hover:bg-gray-50 shadow-xs bg-white border-y border-gray-50 transition-all cursor-pointer"
                                        >
                                            <td className="px-4 sm:px-6 py-4 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                                                        #{order.id.toString().padStart(5, '0')}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] text-gray-400 font-medium">
                                                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {order.paymentMethod || 'Online'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 border-y border-gray-100 group-hover:border-transparent">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-xs sm:text-sm border border-indigo-200/50 shrink-0">
                                                        {(custName || 'C')[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-gray-800 text-xs sm:text-sm truncate">{custName}</span>
                                                        <span className="text-[11px] text-gray-500 font-medium truncate">{custPhone}</span>
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
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Drawer / Modal */}
            {selectedOrder && (() => {
                const custName = selectedOrder.address?.contactName || selectedOrder.address?.name || selectedOrder.User?.name || 'Customer';
                const custPhone = selectedOrder.address?.contactPhone || selectedOrder.User?.phone || 'N/A';
                const custEmail = selectedOrder.User?.email || (typeof selectedOrder.address === 'object' ? selectedOrder.address?.email : null) || 'N/A';

                return (
                    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden text-left">
                            {/* Modal Header */}
                            <div className="p-3.5 sm:p-6 md:p-8 bg-slate-50/80 border-b border-gray-100 flex justify-between items-start gap-2">
                                <div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
                                            Order #{selectedOrder.id.toString().padStart(5, '0')}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold border ${getStatusStyle(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 font-medium">
                                        <p className="flex items-center gap-1.5">
                                            <FaCalendarAlt className="text-indigo-500 shrink-0" /> {new Date(selectedOrder.createdAt).toLocaleString()}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <FaCreditCard className="text-indigo-500 shrink-0" /> {selectedOrder.paymentStatus} via {selectedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online Payment'}
                                        </p>
                                        {selectedOrder.paymentId && (
                                            <p className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-gray-400">
                                                <FaReceipt className="text-indigo-400 shrink-0" /> Ref: {selectedOrder.paymentId}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-1.5 sm:p-2.5 hover:bg-gray-200/60 rounded-xl transition-colors text-gray-400 hover:text-gray-600 shrink-0"
                                >
                                    <FaTimes size={16} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-3.5 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-grow space-y-3.5 sm:space-y-6">
                                {/* Admin Invoice Actions Toolbar */}
                                <div className="p-3 sm:p-4 bg-indigo-50/60 rounded-xl sm:rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                                    <div className="flex items-center gap-2">
                                        <FaFileInvoice className="text-indigo-600 text-base sm:text-lg shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider block truncate">Official Invoice Management</span>
                                            <span className="text-[10px] sm:text-[11px] text-indigo-600 block truncate">Generate, preview, or print official invoice for Order #{selectedOrder.id}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto shrink-0">
                                        <button
                                            onClick={() => handleGenerateInvoice(selectedOrder.id)}
                                            disabled={generatingInvoiceId === selectedOrder.id}
                                            className="px-2 sm:px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                        >
                                            {generatingInvoiceId === selectedOrder.id ? (
                                                <>
                                                    <FaSyncAlt className="animate-spin text-xs" /> <span className="hidden sm:inline">Generating...</span><span className="sm:hidden">Gen...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaFileInvoice className="shrink-0 text-xs" /> <span className="hidden sm:inline">Generate Invoice</span><span className="sm:hidden">Generate</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => handlePreviewInvoice(selectedOrder.id)}
                                            className="px-2 sm:px-3.5 py-2 bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
                                        >
                                            <FaEye className="shrink-0 text-xs" /> <span>Preview</span>
                                        </button>

                                        <button
                                            onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                            className="px-2 sm:px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                                        >
                                            <FaDownload className="shrink-0 text-xs" /> <span className="hidden sm:inline">Download / Print</span><span className="sm:hidden">Download</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-6">
                                    {/* Left Column: Items & Financials */}
                                    <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
                                        <div className="bg-gray-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100">
                                            <h4 className="font-black text-gray-900 mb-3 sm:mb-4 text-xs sm:text-base flex items-center gap-2">
                                                <FaShoppingCart className="text-indigo-500 shrink-0" /> Order Items ({selectedOrder.OrderItems?.length || 0})
                                            </h4>
                                            <div className="space-y-2.5 sm:space-y-3">
                                                {selectedOrder.OrderItems?.map((item, idx) => {
                                                    const prodName = item.Product?.name || `Product #${item.productId || idx + 1}`;
                                                    const prodSku = item.Product?.sku || (item.productId ? `SKU-${item.productId}` : 'SKU-N/A');
                                                    const prodBrand = item.Product?.brand || 'BlueAgle';
                                                    const prodWeight = item.Product?.weight ? ` (${item.Product.weight})` : '';
                                                    const prodImg = item.Product?.images?.[0] ? getImageUrl(item.Product.images[0]) : null;

                                                    return (
                                                        <div key={idx} className="flex items-center gap-2.5 sm:gap-4 bg-white p-2.5 sm:p-4 rounded-xl border border-gray-100 shadow-2xs">
                                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-50 shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                                                                {prodImg ? (
                                                                    <img
                                                                        src={prodImg}
                                                                        alt={prodName}
                                                                        className="w-full h-full object-contain p-1"
                                                                    />
                                                                ) : (
                                                                    <FaImage className="text-gray-300 text-lg sm:text-xl" />
                                                                )}
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <h5 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug truncate">
                                                                    {prodName}{prodWeight}
                                                                </h5>
                                                                <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 font-mono truncate">
                                                                    SKU: {prodSku} | Brand: {prodBrand}
                                                                </p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <p className="font-bold text-gray-900 text-[11px] sm:text-sm">
                                                                    ₹{parseFloat(item.price).toLocaleString()} × {item.quantity}
                                                                </p>
                                                                <p className="font-black text-indigo-600 text-xs sm:text-sm">
                                                                    ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Financial Breakdown */}
                                        <div className="bg-slate-50/70 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-100 flex flex-col gap-2">
                                            <h5 className="font-extrabold text-[11px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                                                Customer Payable Summary
                                            </h5>
                                            <div className="flex justify-between text-xs text-gray-600 font-medium">
                                                <span>Items Subtotal</span>
                                                <span className="font-bold text-gray-800">
                                                    ₹{(selectedOrder.subtotal ? parseFloat(selectedOrder.subtotal) : selectedOrder.OrderItems?.reduce((acc, it) => acc + parseFloat(it.price) * it.quantity, 0)).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 font-medium">
                                                <span>Delivery Charge ({selectedOrder.deliveryMethod || 'Standard'})</span>
                                                <span className={`font-extrabold ${parseFloat(selectedOrder.deliveryCharge || 0) === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                                                    {parseFloat(selectedOrder.deliveryCharge || 0) === 0 ? 'FREE' : `₹${parseFloat(selectedOrder.deliveryCharge).toFixed(2)}`}
                                                </span>
                                            </div>
                                            {parseFloat(selectedOrder.discountAmount || 0) > 0 && (
                                                <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                                    <span>Coupon Discount</span>
                                                    <span className="font-bold">- ₹{parseFloat(selectedOrder.discountAmount).toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200/80 pt-2 flex justify-between text-xs sm:text-base font-black text-gray-900">
                                                <span>Total Amount Paid by Customer</span>
                                                <span className="text-indigo-600">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Internal Business Accounting Breakdown */}
                                        <div className="bg-indigo-50/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-indigo-100/70 flex flex-col gap-2">
                                            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                                                <h5 className="font-black text-[11px] sm:text-xs text-indigo-900 uppercase tracking-wider">
                                                    Internal Business Accounting Summary
                                                </h5>
                                                <span className="text-[9px] sm:text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                                                    Admin Internal
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-xs text-gray-600 font-medium">
                                                <span>Order Value (Gross Total)</span>
                                                <span className="font-bold text-gray-900">₹{parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 font-medium">
                                                <span>Product COGS (Cost of Goods)</span>
                                                <span className="font-bold text-slate-700">₹{parseFloat(selectedOrder.productCogs || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-600 font-medium">
                                                <span>Payment Method</span>
                                                <span className="font-extrabold text-indigo-700">{selectedOrder.paymentMethod || 'Online'}</span>
                                            </div>

                                            <div className="border-t border-indigo-100/80 pt-2 space-y-1.5 text-xs text-gray-600">
                                                <div className="flex justify-between font-medium">
                                                    <span>Payment Gateway Fee ({parseFloat(selectedOrder.paymentGatewayFeeRate || 0).toFixed(2)}%)</span>
                                                    <span className="font-bold text-slate-800">₹{parseFloat(selectedOrder.paymentGatewayFee || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <span>GST on Gateway Fee ({parseFloat(selectedOrder.paymentGatewayGstRate || 0).toFixed(2)}%)</span>
                                                    <span className="font-bold text-slate-800">₹{parseFloat(selectedOrder.paymentGatewayGst || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <span>TDS Section 194O ({parseFloat(selectedOrder.tdsRate || 0).toFixed(2)}%)</span>
                                                    <span className="font-bold text-slate-800">₹{parseFloat(selectedOrder.tdsAmount || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between font-extrabold text-purple-900 pt-1">
                                                    <span>Total Business Deductions</span>
                                                    <span>₹{parseFloat(selectedOrder.totalBusinessDeductions || 0).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="border-t border-indigo-200/80 pt-2 flex justify-between text-xs sm:text-sm font-black">
                                                <span className="text-gray-900">Net Profit (before operating costs)</span>
                                                <span className={parseFloat(selectedOrder.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                                    ₹{parseFloat(selectedOrder.netProfit || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Customer Details & Fulfillment update */}
                                    <div className="space-y-3.5 sm:space-y-4">
                                        <div className="bg-indigo-50/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 border border-indigo-100/50 space-y-3 sm:space-y-4">
                                            <h4 className="font-black text-gray-900 text-xs sm:text-base flex items-center gap-2 border-b border-indigo-100/80 pb-2.5 sm:pb-3">
                                                <FaUser className="text-indigo-600 shrink-0" /> Customer Details
                                            </h4>
                                            <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                                                <div className="flex items-start gap-2.5 sm:gap-3">
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                        <FaUser size={10} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Customer Name</p>
                                                        <p className="font-bold text-gray-900 truncate">{custName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2.5 sm:gap-3">
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                        <FaPhoneAlt size={10} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Phone</p>
                                                        <p className="font-bold text-gray-900">{custPhone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2.5 sm:gap-3">
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                        <FaEnvelope size={10} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</p>
                                                        <p className="font-semibold text-gray-800 break-all text-xs">{custEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2.5 sm:gap-3 pt-1">
                                                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                                                        <FaMapMarkerAlt size={10} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Delivery Address</p>
                                                        <p className="font-medium text-gray-700 leading-relaxed text-[11px] sm:text-xs">
                                                            {formatAddress(selectedOrder.address)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Update Box inside Modal */}
                                        <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-200 shadow-2xs space-y-2">
                                            <h5 className="font-bold text-xs text-gray-700 flex items-center gap-1.5">
                                                <FaTag className="text-indigo-500" /> Update Fulfillment Status
                                            </h5>
                                            <select
                                                value={selectedOrder.status}
                                                onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default Orders;
