import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { FaTruck, FaRupeeSign, FaGift, FaSave, FaCheck, FaTimes, FaShieldAlt, FaRocket } from 'react-icons/fa';

const DeliverySettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        standardDeliveryCharge: 49.00,
        expressDeliveryCharge: 99.00,
        freeDeliveryThreshold: 999.00,
        freeDeliveryEnabled: true,
        expressDeliveryEnabled: false,
        standardDeliveryEnabled: true,
        currencySymbol: '₹',
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/delivery/settings');
            if (res.data) {
                setFormData({
                    standardDeliveryCharge: parseFloat(res.data.standardDeliveryCharge) || 49.00,
                    expressDeliveryCharge: parseFloat(res.data.expressDeliveryCharge) || 99.00,
                    freeDeliveryThreshold: parseFloat(res.data.freeDeliveryThreshold) || 999.00,
                    freeDeliveryEnabled: res.data.freeDeliveryEnabled !== undefined ? res.data.freeDeliveryEnabled : true,
                    expressDeliveryEnabled: res.data.expressDeliveryEnabled !== undefined ? res.data.expressDeliveryEnabled : false,
                    standardDeliveryEnabled: res.data.standardDeliveryEnabled !== undefined ? res.data.standardDeliveryEnabled : true,
                    currencySymbol: res.data.currencySymbol || '₹',
                });
            }
        } catch (err) {
            console.error('Failed to fetch delivery settings:', err);
            toast.error('Failed to load delivery settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                standardDeliveryCharge: parseFloat(formData.standardDeliveryCharge),
                expressDeliveryCharge: parseFloat(formData.expressDeliveryCharge),
                freeDeliveryThreshold: parseFloat(formData.freeDeliveryThreshold),
                freeDeliveryEnabled: Boolean(formData.freeDeliveryEnabled),
                expressDeliveryEnabled: Boolean(formData.expressDeliveryEnabled),
                standardDeliveryEnabled: Boolean(formData.standardDeliveryEnabled),
                currencySymbol: formData.currencySymbol,
            };

            const res = await adminApi.put('/delivery/admin/settings', payload);
            toast.success(res.data?.message || 'Delivery settings updated successfully!');
        } catch (err) {
            console.error('Save settings error:', err);
            toast.error(err.response?.data?.message || 'Failed to save delivery settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-5xl mx-auto font-sans animate-fade-in pb-10">
            {/* Header */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xs border border-slate-100">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0 mt-0.5 sm:mt-0">
                        <FaTruck className="text-lg sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900">Delivery &amp; Shipping Settings</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Configure standard delivery fees, free shipping thresholds, and express delivery rules.
                        </p>
                    </div>
                </div>
            </div>

            {/* Live Calculation Preview Banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                            Live Store Banner Preview
                        </span>
                        <h3 className="text-base sm:text-lg font-black mt-2">
                            {formData.freeDeliveryEnabled ? (
                                `🎉 FREE Delivery on all orders over ${formData.currencySymbol}${formData.freeDeliveryThreshold}`
                            ) : (
                                `Standard Delivery Charge: ${formData.currencySymbol}${formData.standardDeliveryCharge}`
                            )}
                        </h3>
                        <p className="text-xs text-indigo-200 mt-1">
                            Orders below threshold are charged standard rate ({formData.currencySymbol}{formData.standardDeliveryCharge}).
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-2.5 sm:p-3 text-center min-w-[140px] sm:min-w-[160px] self-start sm:self-auto">
                        <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-indigo-200">Standard Rate</div>
                        <div className="text-lg sm:text-xl font-black">{formData.currencySymbol}{formData.standardDeliveryCharge}</div>
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

                {/* Free Shipping Configuration Box */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                                <FaGift className="text-base sm:text-lg" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Free Delivery Threshold</h3>
                                <p className="text-xs text-slate-500">Automatically waive shipping charges when order subtotal meets threshold.</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="freeDeliveryEnabled"
                                checked={formData.freeDeliveryEnabled}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-3 text-xs font-bold text-slate-700">
                                {formData.freeDeliveryEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Free Delivery Threshold Amount ({formData.currencySymbol})
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{formData.currencySymbol}</span>
                                <input
                                    type="number"
                                    name="freeDeliveryThreshold"
                                    min="0"
                                    step="1"
                                    value={formData.freeDeliveryThreshold}
                                    onChange={handleChange}
                                    disabled={!formData.freeDeliveryEnabled}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all disabled:opacity-50"
                                    placeholder="999"
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5">Customer gets 100% free delivery when subtotal &gt;= this value.</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                            <div className="text-xs font-bold text-slate-700 mb-1">Threshold Rule Breakdown:</div>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• Subtotal &lt; {formData.currencySymbol}{formData.freeDeliveryThreshold}: Delivery = {formData.currencySymbol}{formData.standardDeliveryCharge}</li>
                                <li>• Subtotal &gt;= {formData.currencySymbol}{formData.freeDeliveryThreshold}: Delivery = FREE ({formData.currencySymbol}0.00)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Standard Shipping Configuration Box */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                <FaTruck className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Standard Delivery Rates</h3>
                                <p className="text-xs text-slate-500">Base shipping fee for standard orders below the free delivery threshold.</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="standardDeliveryEnabled"
                                checked={formData.standardDeliveryEnabled}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-3 text-xs font-bold text-slate-700">
                                {formData.standardDeliveryEnabled ? 'Active' : 'Disabled'}
                            </span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                Standard Delivery Fee ({formData.currencySymbol})
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{formData.currencySymbol}</span>
                                <input
                                    type="number"
                                    name="standardDeliveryCharge"
                                    min="0"
                                    step="1"
                                    value={formData.standardDeliveryCharge}
                                    onChange={handleChange}
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                    placeholder="49"
                                    required
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5">Standard fee added to cart summary during checkout.</p>
                        </div>
                    </div>
                </div>

                {/* Express Shipping Configuration Box */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                <FaRocket className="text-lg" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-800 text-base">Express Delivery Option</h3>
                                <p className="text-xs text-slate-500">Optional expedited shipping choice offered to customers during checkout.</p>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="expressDeliveryEnabled"
                                checked={formData.expressDeliveryEnabled}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                            <span className="ml-3 text-xs font-bold text-slate-700">
                                {formData.expressDeliveryEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    </div>

                    {formData.expressDeliveryEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-200">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Express Delivery Fee ({formData.currencySymbol})
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{formData.currencySymbol}</span>
                                    <input
                                        type="number"
                                        name="expressDeliveryCharge"
                                        min="0"
                                        step="1"
                                        value={formData.expressDeliveryCharge}
                                        onChange={handleChange}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                                        placeholder="99"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">Express fee applied when customer selects Express Delivery at checkout.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-50"
                    >
                        <FaSave /> {saving ? 'Saving Settings...' : 'Save Delivery Settings'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default DeliverySettings;
