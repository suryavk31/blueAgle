import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaGoogle, FaCheckCircle, FaExclamationTriangle, FaSave, FaSync, FaInfoCircle, FaShieldAlt, FaKey, FaChartBar } from 'react-icons/fa';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';

const GaSettings = () => {
    const [config, setConfig] = useState({
        propertyId: '',
        measurementId: '',
        serviceAccountEmail: '',
        privateKey: '',
        isEnabled: true,
        connectionStatus: 'Disconnected',
        lastTestedAt: null,
        lastError: null,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const res = await adminApi.get('/analytics/ga4/config');
            setConfig(prev => ({ ...prev, ...res.data }));
        } catch (err) {
            console.error('Error fetching GA4 config:', err);
            toast.error('Failed to load Google Analytics settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await adminApi.post('/analytics/ga4/config', config);
            toast.success(res.data.message || 'Settings saved successfully');
            fetchConfig();
        } catch (err) {
            console.error('Error saving GA4 config:', err);
            toast.error(err.response?.data?.message || 'Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await adminApi.post('/analytics/ga4/test-connection', config);
            setTestResult(res.data);
            if (res.data.success) {
                toast.success('Google Analytics Connected Successfully!');
                setConfig(prev => ({ ...prev, connectionStatus: 'Connected' }));
            } else {
                toast.error(res.data.message || 'Connection test failed');
            }
        } catch (err) {
            console.error('Error testing connection:', err);
            const errMsg = err.response?.data?.message || 'Connection test failed';
            setTestResult({ success: false, message: errMsg });
            toast.error(errMsg);
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shrink-0 border border-amber-100">
                        <FaGoogle />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black text-slate-900">Google Analytics 4 Configuration</h1>
                            <span className={`px-3 py-1 text-xs font-black rounded-full border ${
                                config.connectionStatus === 'Connected'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                                {config.connectionStatus === 'Connected' ? '🟢 Connected ✓' : '🟠 Not Connected'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Connect your GA4 Property via official Google Analytics Data API to view real-time site analytics inside your dashboard.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/admin/analytics/google"
                        className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-purple-200"
                    >
                        <FaChartBar />
                        View Analytics Dashboard
                    </Link>

                    <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testing}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2"
                    >
                        <FaSync className={testing ? 'animate-spin' : ''} />
                        {testing ? 'Testing...' : 'Test Connection'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                        <FaSave />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Diagnostic Result Banner */}
            {testResult && (
                <div className={`p-4 rounded-2xl border text-xs font-semibold ${
                    testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                    <div className="flex items-center gap-2 font-black text-sm mb-1">
                        {testResult.success ? <FaCheckCircle /> : <FaExclamationTriangle />}
                        {testResult.success ? 'Google Analytics Connection Verified' : 'Connection Test Failed'}
                    </div>
                    <p className="mt-1 leading-relaxed">{testResult.message}</p>
                    {testResult.success && testResult.rowCount !== undefined && (
                        <div className="mt-2 text-[11px] font-mono text-emerald-700">
                            Property ID: {testResult.propertyId} | Rows Retrieved: {testResult.rowCount}
                        </div>
                    )}
                </div>
            )}

            {/* Helper Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 rounded-2xl border border-indigo-100/80 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
                        <FaInfoCircle className="text-indigo-600" />
                        <span>GA4 Property ID vs Measurement ID</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                        • <strong>GA4 Property ID (e.g., 123456789):</strong> Numeric ID used by the <em>Backend Data API</em> to fetch reports.<br />
                        • <strong>Measurement ID (e.g., G-XXXXXXXXXX):</strong> Stream ID used by <em>Frontend Browser Script</em> for event logging.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-5 rounded-2xl border border-amber-100/80 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                        <FaShieldAlt className="text-amber-600" />
                        <span>Google Service Account Setup Guide</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                        1. In Google Cloud Console, enable <strong>Google Analytics Data API</strong>.<br />
                        2. Create a Service Account and copy its email address below.<br />
                        3. In GA4 Admin → Property Access Management, grant your Service Account email <strong>Viewer</strong> access.
                    </p>
                </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-xs border border-slate-100 space-y-6">
                <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FaKey className="text-indigo-600" /> API Configuration Credentials
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-1.5 text-xs font-extrabold text-slate-800">
                            GA4 Property ID <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={config.propertyId}
                            onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
                            placeholder="e.g. 123456789"
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                            Found in GA4 Admin → Property Settings → Property ID (Numeric values only)
                        </span>
                    </div>

                    <div>
                        <label className="block mb-1.5 text-xs font-extrabold text-slate-800">
                            GA4 Measurement ID
                        </label>
                        <input
                            type="text"
                            value={config.measurementId}
                            onChange={(e) => setConfig({ ...config, measurementId: e.target.value })}
                            placeholder="e.g. G-XXXXXXXXXX"
                            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                            Found in GA4 Admin → Data Streams → Web Stream → Measurement ID
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block mb-1.5 text-xs font-extrabold text-slate-800">
                        Google Service Account Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                        type="email"
                        required
                        value={config.serviceAccountEmail}
                        onChange={(e) => setConfig({ ...config, serviceAccountEmail: e.target.value })}
                        placeholder="blueagle-analytics@your-project.iam.gserviceaccount.com"
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                        Must have Viewer access granted inside Google Analytics Property Access Management
                    </span>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-extrabold text-slate-800">
                            Service Account Private Key (PEM format) <span className="text-rose-500">*</span>
                        </label>
                        {config.hasPrivateKey && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                Private Key Saved ✓
                            </span>
                        )}
                    </div>
                    <textarea
                        rows={6}
                        value={config.privateKey}
                        onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                        placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
                        className="w-full bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs leading-relaxed focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                        Copy the entire <code>private_key</code> block from your downloaded Service Account JSON keyfile. Credentials remain securely stored server-side.
                    </span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                        <FaSave />
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GaSettings;
