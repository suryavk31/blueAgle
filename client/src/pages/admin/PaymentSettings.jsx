import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaPercentage, FaSave, FaShieldAlt, FaInfoCircle, FaCheckCircle, FaUndo } from 'react-icons/fa';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';

const PaymentSettings = () => {
    const [settings, setSettings] = useState({
        paymentGatewayFeePercentage: 2.00,
        paymentGatewayFeeGstPercentage: 18.00,
        tdsPercentage: 1.00,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/payment-settings');
            setSettings({
                paymentGatewayFeePercentage: res.data.paymentGatewayFeePercentage ?? 2.00,
                paymentGatewayFeeGstPercentage: res.data.paymentGatewayFeeGstPercentage ?? 18.00,
                tdsPercentage: res.data.tdsPercentage ?? 1.00,
            });
        } catch (err) {
            console.error('Error fetching payment settings:', err);
            toast.error('Failed to load Payment & Tax settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation
        const fee = parseFloat(settings.paymentGatewayFeePercentage);
        const gst = parseFloat(settings.paymentGatewayFeeGstPercentage);
        const tds = parseFloat(settings.tdsPercentage);

        if (isNaN(fee) || fee < 0 || fee > 100) {
            toast.error('Payment Gateway Fee % must be a number between 0 and 100');
            return;
        }
        if (isNaN(gst) || gst < 0 || gst > 100) {
            toast.error('GST on Gateway Fee % must be a number between 0 and 100');
            return;
        }
        if (isNaN(tds) || tds < 0 || tds > 100) {
            toast.error('TDS % must be a number between 0 and 100');
            return;
        }

        setSaving(true);
        try {
            const res = await adminApi.put('/payment-settings', {
                paymentGatewayFeePercentage: fee,
                paymentGatewayFeeGstPercentage: gst,
                tdsPercentage: tds,
            });
            toast.success(res.data.message || 'Payment & Tax settings updated successfully');
            if (res.data.settings) {
                setSettings(res.data.settings);
            }
        } catch (err) {
            console.error('Error updating payment settings:', err);
            toast.error(err.response?.data?.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handleResetDefaults = () => {
        setSettings({
            paymentGatewayFeePercentage: 2.00,
            paymentGatewayFeeGstPercentage: 18.00,
            tdsPercentage: 1.00,
        });
        toast.info('Reset rates to default (2% Gateway, 18% GST, 1% TDS). Click Save to apply.');
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shrink-0 border border-indigo-100">
                        <FaCreditCard />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900">Payment &amp; Tax Settings</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Configure internal accounting rates for Payment Gateway Fees, GST on Gateway Fees, and TDS calculations.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                    >
                        <FaUndo /> Reset Defaults
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                        <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Helper Alert Card */}
            <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/70 to-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-extrabold text-indigo-900">
                    <FaShieldAlt className="text-indigo-600" />
                    <span>Internal Accounting Deductions &amp; Rate Snapshot Rule</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                    • <strong>Internal Only:</strong> Gateway Fee, GST, and TDS are calculated on order creation for internal business accounting and Net Profit reports. They are <em>never</em> added to customer checkout totals or customer invoices.<br />
                    • <strong>Snapshot Protection:</strong> Active rates configured here are permanently snapshotted into orders at creation. Updating these rates later will <em>never</em> alter historical orders.
                </p>
            </div>

            {/* Config Form */}
            <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100 space-y-6">
                <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FaPercentage className="text-indigo-600" /> Accounting Percentage Rates
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Payment Gateway Fee % */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-800">
                            Payment Gateway Fee (%) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                required
                                value={settings.paymentGatewayFeePercentage}
                                onChange={(e) => setSettings({ ...settings, paymentGatewayFeePercentage: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 p-3 pr-8 rounded-xl text-xs font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                            Applied to Online/Razorpay transactions (Default: 2.00%)
                        </span>
                    </div>

                    {/* GST on Gateway Fee % */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-800">
                            GST on Gateway Fee (%) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                required
                                value={settings.paymentGatewayFeeGstPercentage}
                                onChange={(e) => setSettings({ ...settings, paymentGatewayFeeGstPercentage: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 p-3 pr-8 rounded-xl text-xs font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                            GST rate on Gateway Fee (Default: 18.00%)
                        </span>
                    </div>

                    {/* TDS % */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-extrabold text-slate-800">
                            TDS (%) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                required
                                value={settings.tdsPercentage}
                                onChange={(e) => setSettings({ ...settings, tdsPercentage: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 p-3 pr-8 rounded-xl text-xs font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium">
                            Section 194O TDS rate on gross sales (Default: 1.00%)
                        </span>
                    </div>
                </div>

                {/* Formula Example Preview Card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                        <FaInfoCircle className="text-indigo-500" /> Formula Preview (For ₹1,000 Order Value)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono text-slate-600">
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <span className="font-bold text-indigo-700 block mb-1">ONLINE PAYMENT FLOW:</span>
                            • Gateway Fee = ₹1,000 × {settings.paymentGatewayFeePercentage}% = ₹{(1000 * (settings.paymentGatewayFeePercentage / 100)).toFixed(2)}<br />
                            • Gateway GST = ₹{(1000 * (settings.paymentGatewayFeePercentage / 100)).toFixed(2)} × {settings.paymentGatewayFeeGstPercentage}% = ₹{((1000 * (settings.paymentGatewayFeePercentage / 100)) * (settings.paymentGatewayFeeGstPercentage / 100)).toFixed(2)}<br />
                            • TDS (194O) = ₹1,000 × {settings.tdsPercentage}% = ₹{(1000 * (settings.tdsPercentage / 100)).toFixed(2)}
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100">
                            <span className="font-bold text-purple-700 block mb-1">CASH ON DELIVERY (COD) FLOW:</span>
                            • Gateway Fee = ₹0.00 (No Gateway)<br />
                            • Gateway GST = ₹0.00 (No Gateway)<br />
                            • TDS (194O) = ₹1,000 × {settings.tdsPercentage}% = ₹{(1000 * (settings.tdsPercentage / 100)).toFixed(2)}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                        <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentSettings;
