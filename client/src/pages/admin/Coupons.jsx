import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaTrash, FaTicketAlt, FaPlus, FaSave, FaPercentage, FaRupeeSign } from 'react-icons/fa';

const Coupons = () => {
    const { currentUser } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [formData, setFormData] = useState({
        code: '', discountType: 'fixed', value: '', expiryDate: '', isActive: true
    });

    const fetchCoupons = async () => {
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/api/coupons', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCoupons(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (currentUser) fetchCoupons();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await currentUser.getIdToken();
            await axios.post('http://localhost:5000/api/coupons', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            const token = await currentUser.getIdToken();
            await axios.delete(`http://localhost:5000/api/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Coupon Deleted");
            fetchCoupons();
        } catch (error) {
            toast.error("Error deleting coupon");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaTicketAlt className="text-indigo-600" /> Manage Coupons
                    </h2>
                    <p className="text-gray-500 font-medium">Create and distribute promotional codes to boost customer loyalty.</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left transition-all">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaPlus className="text-indigo-500" /> Generate New Coupon
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Coupon Code</label>
                            <input 
                                type="text" 
                                placeholder="e.g. SUMMER50" 
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold tracking-widest uppercase rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" 
                                value={formData.code} 
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Discount Type</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors appearance-none" 
                                value={formData.discountType} 
                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                            >
                                <option value="fixed">Fixed Amount (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Discount Value</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-500">
                                    {formData.discountType === 'percentage' ? <FaPercentage size={12} /> : <FaRupeeSign size={12} />}
                                </div>
                                <input 
                                    type="number" 
                                    placeholder={formData.discountType === 'percentage' ? "e.g. 15" : "e.g. 500"} 
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 pl-9 outline-none transition-colors" 
                                    value={formData.value} 
                                    onChange={e => setFormData({ ...formData, value: e.target.value })} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Expiry Date</label>
                            <input 
                                type="date" 
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3.5 outline-none transition-colors" 
                                value={formData.expiryDate} 
                                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} 
                                required 
                            />
                        </div>
                    </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <label className="relative inline-flex items-center cursor-pointer group">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={formData.isActive}
                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner group-hover:after:scale-95"></div>
                        <span className="ml-3 text-sm font-bold text-gray-700 transition-colors">
                            Launch Coupon Immediately
                        </span>
                    </label>

                    <button 
                        onClick={handleSubmit}
                        disabled={!formData.code || !formData.value || !formData.expiryDate}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                    >
                        <FaSave /> Create Coupon
                    </button>
                </div>
            </div>

            {/* Coupons Table Section */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-800">Active & Historical Coupons</h3>
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">{coupons.length} Total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-3">
                        <thead className="bg-transparent text-gray-400 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 rounded-l-xl">Coupon Code</th>
                                <th className="px-6 py-4">Discount Details</th>
                                <th className="px-6 py-4">Validity</th>
                                <th className="px-6 py-4 rounded-r-xl text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-16 text-gray-400">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <FaTicketAlt size={24} className="text-gray-300" />
                                            </div>
                                            <p className="font-medium text-base">No coupons found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                coupons.map(c => {
                                    const isExpired = new Date(c.expiryDate) < new Date();
                                    return (
                                        <tr key={c.id} className="group hover:bg-gray-50 shadow-sm bg-white border-y border-gray-50 transition-colors">
                                            <td className="px-6 py-5 rounded-l-xl border-y border-l border-gray-100 group-hover:border-transparent">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-500 group-hover:scale-110 transition-transform">
                                                        <FaTicketAlt size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-gray-900 text-base tracking-wider uppercase">{c.code}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-flex items-center w-fit px-2 py-0.5 rounded-sm ${c.isActive && !isExpired ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                            {c.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-y border-gray-100 group-hover:border-transparent">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-indigo-600 text-lg">
                                                        {c.discountType === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium mt-0.5 capitalize">{c.discountType} Discount</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-y border-gray-100 group-hover:border-transparent">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${isExpired ? 'text-rose-500 line-through' : 'text-gray-800'}`}>
                                                        {new Date(c.expiryDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {isExpired && <span className="text-xs text-rose-500 font-bold mt-0.5">Expired</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 rounded-r-xl border-y border-r border-gray-100 group-hover:border-transparent text-right">
                                                <button 
                                                    onClick={() => handleDelete(c.id)} 
                                                    className="w-10 h-10 inline-flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
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
