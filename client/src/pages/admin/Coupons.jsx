import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { FaTrash, FaTicketAlt, FaPlus, FaSave, FaPercentage, FaRupeeSign } from 'react-icons/fa';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [formData, setFormData] = useState({
        code: '', discountType: 'fixed', value: '', expiryDate: '', isActive: true
    });

    const fetchCoupons = async () => {
        try {
            const res = await adminApi.get('/coupons');
            setCoupons(res.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await adminApi.post('/coupons', formData);
            toast.success("Coupon Created Successfully");
            setFormData({ code: '', discountType: 'fixed', value: '', expiryDate: '', isActive: true });
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating coupon");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await adminApi.delete(`/coupons/${id}`);
            toast.success("Coupon Deleted");
            fetchCoupons();
        } catch (error) {
            toast.error("Error deleting coupon");
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaTicketAlt className="text-indigo-600" /> Manage Coupons
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Create and distribute promotional codes to boost customer loyalty.</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FaPlus className="text-indigo-500" /> Generate New Coupon
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Coupon Code */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Coupon Code</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl p-3 uppercase font-mono font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. SUMMER50"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>

                        {/* Discount Type */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Discount Type</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl p-3 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.discountType}
                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                            >
                                <option value="fixed">Fixed Amount (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>

                        {/* Value */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Discount Value</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl p-3 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder={formData.discountType === 'percentage' ? "e.g. 20" : "e.g. 150"}
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                                    {formData.discountType === 'percentage' ? '%' : '₹'}
                                </span>
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Expiry Date</label>
                            <input
                                type="date"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                                value={formData.expiryDate}
                                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={formData.isActive}
                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                            />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            <span className="ml-3 text-xs font-bold text-gray-700">
                                Launch Coupon Immediately
                            </span>
                        </label>

                        <button 
                            type="submit"
                            disabled={!formData.code || !formData.value || !formData.expiryDate}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 text-xs disabled:opacity-50"
                        >
                            <FaSave /> Create Coupon
                        </button>
                    </div>
                </form>
            </div>

            {/* Coupons Table Section */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg sm:text-xl text-gray-800">Active &amp; Historical Coupons</h3>
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">{coupons.length} Total</span>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left text-xs sm:text-sm border-separate border-spacing-y-2.5 min-w-[550px]">
                        <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-4 py-3 rounded-l-xl">Coupon Code</th>
                                <th className="px-4 py-3">Discount Details</th>
                                <th className="px-4 py-3">Validity</th>
                                <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <FaTicketAlt size={24} className="text-gray-300" />
                                            <p className="font-medium text-sm">No coupons found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(c => {
                                    const isExpired = new Date(c.expiryDate) < new Date();
                                    return (
                                        <tr key={c.id} className="group hover:bg-gray-50 shadow-xs bg-white border-y border-gray-50 transition-colors">
                                            <td className="px-4 py-3.5 rounded-l-xl border-y border-l border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                                                        <FaTicketAlt size={16} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-gray-900 text-sm tracking-wider uppercase font-mono">{c.code}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 inline-flex items-center w-fit px-2 py-0.5 rounded-sm ${c.isActive && !isExpired ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {c.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 border-y border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-indigo-600 text-base">
                                                        {c.discountType === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500 font-medium capitalize">{c.discountType} Discount</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 border-y border-gray-100">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-xs ${isExpired ? 'text-rose-500 line-through' : 'text-gray-800'}`}>
                                                        {new Date(c.expiryDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {isExpired && <span className="text-[10px] text-rose-500 font-bold">Expired</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 rounded-r-xl border-y border-r border-gray-100 text-right">
                                                <button 
                                                    onClick={() => handleDelete(c.id)} 
                                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete Coupon"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Coupons;
