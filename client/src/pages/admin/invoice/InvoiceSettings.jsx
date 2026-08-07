import React, { useEffect, useState } from 'react';
import adminApi from '../../../services/adminApi';
import { toast } from 'react-toastify';
import { FaBuilding, FaSave, FaCheckCircle } from 'react-icons/fa';

const InvoiceSettings = () => {
    const [form, setForm] = useState({
        companyName: '',
        companyLogo: '',
        gstNumber: '',
        vatNumber: '',
        businessRegistration: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        defaultCurrency: 'INR',
        currencySymbol: '₹',
        decimalPrecision: 2,
        digitalSignature: '',
        companyStamp: '',
        footerNotes: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await adminApi.get('/invoice-builder/settings');
                if (res.data) setForm(res.data);
            } catch {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await adminApi.post('/invoice-builder/settings', form);
            toast.success('Company branding settings saved');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FaBuilding className="text-indigo-600" /> Company Invoice Settings
                </h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Configure company branding, GSTIN, digital signatures, logos, and currency formats.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Legal Name</label>
                        <input
                            type="text"
                            value={form.companyName || ''}
                            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Logo URL</label>
                        <input
                            type="text"
                            value={form.companyLogo || ''}
                            onChange={(e) => setForm({ ...form, companyLogo: e.target.value })}
                            placeholder="https://..."
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GSTIN Number</label>
                        <input
                            type="text"
                            value={form.gstNumber || ''}
                            onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Business Registration / CIN</label>
                        <input
                            type="text"
                            value={form.businessRegistration || ''}
                            onChange={(e) => setForm({ ...form, businessRegistration: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Billing Email</label>
                        <input
                            type="email"
                            value={form.email || ''}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Billing Phone</label>
                        <input
                            type="text"
                            value={form.phone || ''}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Registered Address</label>
                    <textarea
                        value={form.address || ''}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Default Currency</label>
                        <input
                            type="text"
                            value={form.defaultCurrency || 'INR'}
                            onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency Symbol</label>
                        <input
                            type="text"
                            value={form.currencySymbol || '₹'}
                            onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Decimal Precision</label>
                        <input
                            type="number"
                            value={form.decimalPrecision || 2}
                            onChange={(e) => setForm({ ...form, decimalPrecision: parseInt(e.target.value) || 2 })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Footer Notice / Terms</label>
                    <textarea
                        value={form.footerNotes || ''}
                        onChange={(e) => setForm({ ...form, footerNotes: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <FaSave /> {isSaving ? 'Saving Settings...' : 'Save Company Invoice Settings'}
                </button>
            </form>
        </div>
    );
};

export default InvoiceSettings;
