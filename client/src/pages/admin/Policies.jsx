import React, { useEffect, useState, useCallback } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import PolicyVisualEditor from '../../components/policy/PolicyVisualEditor';
import PolicyLivePreview from '../../components/policy/PolicyLivePreview';
import PolicyImportExportModal from '../../components/policy/PolicyImportExportModal';
import {
    FaFileAlt, FaShieldAlt, FaSave, FaCheckCircle, FaExclamationCircle,
    FaHistory, FaGlobe, FaEye, FaUndo, FaCode, FaFileExport, FaDownload,
} from 'react-icons/fa';

const POLICY_TYPES = [
    { type: 'account-deletion', label: 'Account Deletion Policy', icon: FaShieldAlt },
    { type: 'privacy', label: 'Privacy Policy', icon: FaShieldAlt },
    { type: 'terms', label: 'Terms & Conditions', icon: FaFileAlt },
    { type: 'return', label: 'Return & Refund Policy', icon: FaFileAlt },
    { type: 'cancellation', label: 'Cancellation Policy', icon: FaFileAlt },
    { type: 'shipping', label: 'Shipping & Delivery', icon: FaFileAlt },
    { type: 'cookie', label: 'Cookie Policy', icon: FaFileAlt },
    { type: 'contact', label: 'Contact Support', icon: FaFileAlt },
    { type: 'about', label: 'About Us', icon: FaFileAlt },
    { type: 'faq', label: 'FAQ', icon: FaFileAlt },
];

const Policies = () => {
    const [type, setType] = useState('account-deletion');
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('Published');
    const [changeSummary, setChangeSummary] = useState('');
    const [version, setVersion] = useState(1);
    const [versions, setVersions] = useState([]);

    // Structured Policy JSON state
    const [policyJson, setPolicyJson] = useState({ title: '', sections: [] });

    // SEO Metadata state
    const [seoTitle, setSeoTitle] = useState('');
    const [seoDescription, setSeoDescription] = useState('');
    const [seoKeywords, setSeoKeywords] = useState('');
    const [canonicalUrl, setCanonicalUrl] = useState('');

    const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview', 'history', 'seo'
    const [showImportExport, setShowImportExport] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const fetchPolicy = useCallback(async () => {
        try {
            const res = await adminApi.get(`/policies/admin/cms/${type}`);
            const p = res.data;
            setTitle(p.title || type.replace('-', ' ').toUpperCase());
            setStatus(p.status || 'Published');
            setVersion(p.version || 1);
            setVersions(p.versions || []);
            setSeoTitle(p.seoTitle || '');
            setSeoDescription(p.seoDescription || '');
            setSeoKeywords(p.seoKeywords || '');
            setCanonicalUrl(p.canonicalUrl || '');

            if (p.contentJson && typeof p.contentJson === 'object') {
                setPolicyJson(p.contentJson);
            } else {
                setPolicyJson({
                    title: p.title || type.replace('-', ' ').toUpperCase(),
                    sections: [
                        {
                            id: 'section-1',
                            title: '1. Overview',
                            order: 1,
                            content: [{ id: 'blk-1', type: 'paragraph', text: p.content ? p.content.replace(/<[^>]+>/g, '').trim() : 'Enter policy clause...' }],
                        },
                    ],
                });
            }
        } catch {
            setTitle(type.replace('-', ' ').toUpperCase());
            setStatus('Published');
            setVersion(1);
            setVersions([]);
            setPolicyJson({
                title: type.replace('-', ' ').toUpperCase(),
                sections: [
                    {
                        id: 'section-1',
                        title: '1. Overview',
                        order: 1,
                        content: [{ id: 'blk-1', type: 'paragraph', text: 'Enter initial policy clause...' }],
                    },
                ],
            });
        }
    }, [type]);

    useEffect(() => {
        fetchPolicy();
    }, [fetchPolicy]);

    const handleSave = async () => {
        // Validate JSON before saving
        try {
            const valRes = await adminApi.post('/policies/validate', { json: policyJson });
            if (!valRes.data.valid) {
                setValidationErrors(valRes.data.errors || []);
                toast.error('Validation errors found. Please review the banner warnings.');
                return;
            }
            setValidationErrors([]);
        } catch {
            // Ignore validation error and proceed
        }

        setIsSaving(true);
        try {
            await adminApi.post(`/policies/${type}`, {
                title,
                contentJson: policyJson,
                status,
                changeSummary,
                seoTitle,
                seoDescription,
                seoKeywords,
                canonicalUrl,
            });
            toast.success(`Structured Policy v${version + 1} Saved Successfully`);
            setLastSaved(new Date());
            setChangeSummary('');
            fetchPolicy();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save policy');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestore = async (versionId, versionNumber) => {
        if (!window.confirm(`Restore policy to version v${versionNumber}?`)) return;
        try {
            await adminApi.post(`/policies/${type}/restore/${versionId}`);
            toast.success(`Restored to v${versionNumber}`);
            fetchPolicy();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Restore failed');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaShieldAlt className="text-indigo-600" /> JSON-Driven Policy CMS
                    </h2>
                    <p className="text-gray-500 font-medium">Structured block-based policy editor with version snapshots, SEO, and device previews.</p>
                </div>
                <button
                    onClick={() => setShowImportExport(true)}
                    className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-50 shadow-sm transition-all"
                >
                    <FaFileExport /> Import / Export JSON
                </button>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
                {/* Navigation Sidebar */}
                <div className="w-full lg:w-72 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 p-6 shrink-0 flex flex-col gap-2 relative overflow-hidden">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Document Type</h3>
                    {POLICY_TYPES.map((item) => {
                        const Icon = item.icon;
                        const isActive = type === item.type;
                        return (
                            <button
                                key={item.type}
                                onClick={() => setType(item.type)}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl font-bold text-xs transition-all text-left w-full ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 translate-x-1'
                                        : 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                                }`}
                            >
                                <Icon className={isActive ? 'text-white' : 'text-gray-400'} />
                                <span className="truncate">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Editor Workspace */}
                <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 flex flex-col overflow-hidden w-full relative">
                    {/* Workspace Tabs Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 shrink-0">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                                {title || type.toUpperCase()}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100">
                                    Current v{version}.0
                                </span>
                                <span>Status: <strong className="text-gray-700">{status}</strong></span>
                            </div>
                        </div>

                        {/* Tabs Bar */}
                        <div className="flex bg-gray-200/60 p-1 rounded-xl gap-1 text-xs font-bold">
                            <button
                                onClick={() => setActiveTab('editor')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'editor' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600'}`}
                            >
                                <FaCode /> Visual Block Editor
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600'}`}
                            >
                                <FaEye /> Live Device Preview
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600'}`}
                            >
                                <FaHistory /> Versions ({versions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('seo')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'seo' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600'}`}
                            >
                                <FaGlobe /> SEO Metadata
                            </button>
                        </div>
                    </div>

                    {/* Tab Body */}
                    <div className="p-6 flex-1 flex flex-col">
                        {activeTab === 'editor' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                setPolicyJson((prev) => ({ ...prev, title: e.target.value }));
                                            }}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Publish Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="Published">Published (Public)</option>
                                            <option value="Draft">Draft (Internal)</option>
                                            <option value="Unpublished">Unpublished</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Version Change Summary</label>
                                        <input
                                            type="text"
                                            value={changeSummary}
                                            onChange={(e) => setChangeSummary(e.target.value)}
                                            placeholder="e.g. Added FAQ and structured tables"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        />
                                    </div>
                                </div>

                                <PolicyVisualEditor
                                    policyJson={policyJson}
                                    onChange={setPolicyJson}
                                    validationErrors={validationErrors}
                                />
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <PolicyLivePreview policyJson={policyJson} />
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4 max-h-[550px] overflow-y-auto">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Version Snapshots Timeline</h4>
                                {versions.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-8 text-center">No historical versions available.</p>
                                ) : (
                                    versions.map((ver) => (
                                        <div key={ver.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-gray-900">v{ver.version}.0</span>
                                                    <span className="text-xs text-gray-500">{ver.title}</span>
                                                    {ver.version === version && (
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Current Active</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {ver.changeSummary ? `"${ver.changeSummary}" • ` : ''}
                                                    {new Date(ver.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {ver.version !== version && (
                                                <button
                                                    onClick={() => handleRestore(ver.id, ver.version)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-200"
                                                >
                                                    <FaUndo /> Restore v{ver.version}
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'seo' && (
                            <div className="space-y-4 max-w-2xl">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Dynamic SEO Metadata</h4>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SEO Meta Title</label>
                                    <input
                                        type="text"
                                        value={seoTitle}
                                        onChange={(e) => setSeoTitle(e.target.value)}
                                        placeholder="e.g. Account Deletion Policy | BlueAgle"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Meta Description</label>
                                    <textarea
                                        value={seoDescription}
                                        onChange={(e) => setSeoDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Summary for Google Search & Social Preview..."
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Keywords</label>
                                    <input
                                        type="text"
                                        value={seoKeywords}
                                        onChange={(e) => setSeoKeywords(e.target.value)}
                                        placeholder="account deletion, privacy policy, BlueAgle"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Canonical URL</label>
                                    <input
                                        type="text"
                                        value={canonicalUrl}
                                        onChange={(e) => setCanonicalUrl(e.target.value)}
                                        placeholder="https://blueeagle.com/policies/account-deletion"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Save Action Footer */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-6">
                            {lastSaved ? (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                    <FaCheckCircle /> Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            ) : <div />}

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <FaSave size={16} />
                                )}
                                {isSaving ? 'Saving...' : 'Publish Structured Version'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Import / Export Modal */}
            {showImportExport && (
                <PolicyImportExportModal
                    policyJson={policyJson}
                    onImport={(imported) => {
                        setPolicyJson(imported);
                        if (imported.title) setTitle(imported.title);
                    }}
                    onClose={() => setShowImportExport(false)}
                />
            )}
        </div>
    );
};

export default Policies;
