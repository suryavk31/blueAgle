import React, { useState, useEffect } from 'react';
import seoService from '../../services/seoService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    FaSearch, FaPlus, FaEdit, FaTrash, FaCopy, FaDownload, FaUpload,
    FaGlobe, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaShieldAlt,
    FaEye, FaCode, FaHistory, FaCog, FaCheck, FaTimes, FaFilter, FaFileCode,
    FaSync, FaMagic, FaSlidersH, FaRobot, FaLock, FaUnlock, FaChartBar
} from 'react-icons/fa';

const PAGE_TYPES = ['static', 'product', 'category', 'subcategory', 'blog', 'cms', 'custom'];

const SCHEMA_TEMPLATES = {
    Organization: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BlueAgle",
        "url": "http://localhost:5173",
        "logo": "http://localhost:5173/logo.png",
        "sameAs": [
            "https://facebook.com/blueagle",
            "https://instagram.com/blueagle"
        ]
    }, null, 2),
    Website: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BlueAgle Organics",
        "url": "http://localhost:5173",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "http://localhost:5173/products?search={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    }, null, 2),
    Product: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "Wood Pressed Groundnut Oil",
        "image": ["http://localhost:5000/uploads/oil.png"],
        "description": "Pure cold pressed oil extracted traditionally.",
        "brand": { "@type": "Brand", "name": "BlueAgle" },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": "360",
            "availability": "https://schema.org/InStock"
        }
    }, null, 2),
    FAQ: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
            "@type": "Question",
            "name": "Is wood pressed oil unrefined?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes, 100% cold wood pressed without heat." }
        }]
    }, null, 2)
};

const SeoManager = () => {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('RECORDS'); // RECORDS, GLOBAL, SYNC, AUDIT
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedPageType, setSelectedPageType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal / Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editorTab, setEditorTab] = useState('BASIC'); // BASIC, SOCIAL, SCHEMA, PREVIEW, HISTORY
    const [formData, setFormData] = useState({
        pageKey: '', pageName: '', pageType: 'static', route: '/',
        title: '', metaDescription: '', metaKeywords: '', canonicalUrl: '',
        robots: 'index, follow', author: 'BlueAgle Team', language: 'en',
        themeColor: '#3c006b', favicon: '/favicon.ico',
        ogTitle: '', ogDescription: '', ogImage: '', ogType: 'website',
        twitterCard: 'summary_large_image', twitterTitle: '', twitterDescription: '', twitterImage: '',
        structuredData: '', priority: 0.8, changeFrequency: 'weekly',
        isIndexed: true, isActive: true
    });

    const [auditLogs, setAuditLogs] = useState([]);

    // Global Settings State
    const [globalSettings, setGlobalSettings] = useState(null);
    const [savingGlobal, setSavingGlobal] = useState(false);

    // ── Auto-SEO Sync & Discovery States ───────────────────────────────────────
    const [syncStats, setSyncStats] = useState(null);
    const [syncReport, setSyncReport] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isRegenModalOpen, setIsRegenModalOpen] = useState(false);
    const [regenOptions, setRegenOptions] = useState({
        onlyMissing: false,
        overwriteAuto: true,
        skipManual: true,
        dryRun: false
    });

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await seoService.getAllSeo({
                search, pageType: selectedPageType, isActive: selectedStatus, page
            });
            setRecords(res.seoRecords || []);
            setTotalPages(res.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGlobalSettings = async () => {
        try {
            const data = await seoService.getGlobalSeo();
            setGlobalSettings(data);
        } catch (error) {
            console.error('Error fetching global settings', error);
        }
    };

    const fetchSyncStats = async () => {
        try {
            const data = await seoService.getSyncStats();
            setSyncStats(data);
        } catch (error) {
            console.error('Error fetching sync stats', error);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [search, selectedPageType, selectedStatus, page]);

    useEffect(() => {
        fetchGlobalSettings();
        fetchSyncStats();
    }, []);

    // ── Auto-SEO Sync Handlers ──────────────────────────────────────────────────
    const handleGenerateMissingSeo = async () => {
        setIsSyncing(true);
        try {
            const res = await seoService.generateMissingSeo();
            setSyncReport(res.report);
            setIsReportModalOpen(true);
            toast.success(`Generated ${res.report.created} missing SEO records!`);
            fetchRecords();
            fetchSyncStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate missing SEO');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRunRegenerate = async () => {
        setIsSyncing(true);
        try {
            const res = await seoService.regenerateSeo(regenOptions);
            setSyncReport(res.report);
            setIsRegenModalOpen(false);
            setIsReportModalOpen(true);
            toast.success(res.message);
            fetchRecords();
            fetchSyncStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const handlePreviewSync = async () => {
        setIsSyncing(true);
        try {
            const res = await seoService.previewSync();
            setSyncReport(res.report);
            setIsReportModalOpen(true);
            toast.info(`Dry run complete. Scanned ${res.report.scanned} pages.`);
        } catch (error) {
            toast.error('Preview failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleToggleManualEdit = async (record) => {
        try {
            if (record.isManuallyEdited) {
                await seoService.unmarkManual(record.id);
                toast.success('Record un-flagged. Auto-sync will update it.');
            } else {
                await seoService.markAsManual(record.id);
                toast.success('Record protected from auto-sync overwrites.');
            }
            fetchRecords();
            fetchSyncStats();
        } catch (error) {
            toast.error('Failed to update manual flag');
        }
    };

    // ── CRUD Handlers ──────────────────────────────────────────────────────────
    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({
            pageKey: '', pageName: '', pageType: 'static', route: '/',
            title: '', metaDescription: '', metaKeywords: '', canonicalUrl: '',
            robots: 'index, follow', author: 'BlueAgle Team', language: 'en',
            themeColor: '#3c006b', favicon: '/favicon.ico',
            ogTitle: '', ogDescription: '', ogImage: '', ogType: 'website',
            twitterCard: 'summary_large_image', twitterTitle: '', twitterDescription: '', twitterImage: '',
            structuredData: '', priority: 0.8, changeFrequency: 'weekly',
            isIndexed: true, isActive: true
        });
        setEditorTab('BASIC');
        setIsModalOpen(true);
    };

    const handleOpenEdit = async (record) => {
        setEditingId(record.id);
        let structStr = '';
        if (record.structuredData) {
            structStr = typeof record.structuredData === 'string'
                ? record.structuredData
                : JSON.stringify(record.structuredData, null, 2);
        }

        setFormData({
            ...record,
            structuredData: structStr
        });

        try {
            const detail = await seoService.getSeoById(record.id);
            setAuditLogs(detail.auditLogs || []);
        } catch (e) {
            setAuditLogs([]);
        }

        setEditorTab('BASIC');
        setIsModalOpen(true);
    };

    const handleDuplicate = (record) => {
        setEditingId(null);
        let structStr = record.structuredData
            ? (typeof record.structuredData === 'string' ? record.structuredData : JSON.stringify(record.structuredData, null, 2))
            : '';

        setFormData({
            ...record,
            pageKey: `${record.pageKey}_copy_${Date.now().toString().slice(-4)}`,
            pageName: `${record.pageName} (Copy)`,
            title: record.title ? `${record.title} - Copy` : '',
            structuredData: structStr
        });
        setEditorTab('BASIC');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this SEO record?')) return;
        try {
            await seoService.deleteSeo(id);
            toast.success('SEO Record Deleted');
            fetchRecords();
            fetchSyncStats();
        } catch (error) {
            toast.error('Failed to delete SEO record');
        }
    };

    const handleSaveRecord = async (e) => {
        e.preventDefault();
        let parsedSchema = null;
        if (formData.structuredData && formData.structuredData.trim()) {
            try {
                parsedSchema = JSON.parse(formData.structuredData);
            } catch (err) {
                toast.error('Structured Data (JSON-LD) has invalid JSON syntax!');
                setEditorTab('SCHEMA');
                return;
            }
        }

        const payload = {
            ...formData,
            structuredData: parsedSchema
        };

        try {
            if (editingId) {
                await seoService.updateSeo(editingId, payload);
                toast.success('SEO Record Updated Successfully');
            } else {
                await seoService.createSeo(payload);
                toast.success('SEO Record Created Successfully');
            }
            setIsModalOpen(false);
            fetchRecords();
            fetchSyncStats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving SEO record');
        }
    };

    // Bulk Actions
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(records.map(r => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete selected ${selectedIds.length} records?`)) return;
        try {
            await seoService.bulkActions('DELETE', selectedIds, null);
            toast.success('Selected SEO records deleted');
            setSelectedIds([]);
            fetchRecords();
            fetchSyncStats();
        } catch (error) {
            toast.error('Bulk deletion failed');
        }
    };

    // Export & Import
    const handleExport = async () => {
        try {
            const data = await seoService.exportSeo();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blueagle_seo_export_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            toast.success('SEO Records Exported');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleImportFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const parsed = JSON.parse(evt.target.result);
                const res = await seoService.importSeo(parsed);
                toast.success(res.message);
                fetchRecords();
                fetchSyncStats();
            } catch (err) {
                toast.error('Failed to import JSON file');
            }
        };
        reader.readAsText(file);
    };

    const handleSaveGlobalSettings = async (e) => {
        e.preventDefault();
        setSavingGlobal(true);
        try {
            await seoService.updateGlobalSeo(globalSettings);
            toast.success('Global SEO Settings Saved');
        } catch (error) {
            toast.error('Error saving global settings');
        } finally {
            setSavingGlobal(false);
        }
    };

    const titleLength = formData.title ? formData.title.length : 0;
    const descLength = formData.metaDescription ? formData.metaDescription.length : 0;

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            {/* Top Bar Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <FaGlobe className="text-[#3c006b]" /> Enterprise SEO Manager
                    </h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Dynamically manage titles, meta tags, Open Graph cards, schema JSON-LD, and automatic SEO discovery.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Auto-SEO Generate Button */}
                    <button
                        onClick={handleGenerateMissingSeo}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-100 transition-all text-xs disabled:opacity-50"
                        title="Scan application and populate missing SEO records automatically"
                    >
                        <FaMagic className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Scanning...' : 'Generate Missing SEO'}
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all text-xs"
                    >
                        <FaDownload /> Export JSON
                    </button>

                    <label className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all text-xs cursor-pointer">
                        <FaUpload /> Import JSON
                        <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    </label>

                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-[#ff3269] text-white font-black px-5 py-2.5 rounded-xl hover:bg-[#e62e5c] shadow-lg shadow-pink-100 transition-all text-xs"
                    >
                        <FaPlus /> Add New SEO Record
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
                <button
                    onClick={() => setActiveTab('RECORDS')}
                    className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'RECORDS'
                            ? 'border-[#3c006b] text-[#3c006b]'
                            : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <FaGlobe /> SEO Records ({records.length})
                </button>

                <button
                    onClick={() => setActiveTab('SYNC')}
                    className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'SYNC'
                            ? 'border-[#3c006b] text-[#3c006b]'
                            : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <FaRobot className="text-emerald-600" /> Auto-Sync &amp; Discovery
                    {syncStats?.stats?.missingCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {syncStats.stats.missingCount} Missing
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('GLOBAL')}
                    className={`pb-4 px-6 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'GLOBAL'
                            ? 'border-[#3c006b] text-[#3c006b]'
                            : 'border-transparent text-gray-400 hover:text-gray-700'
                    }`}
                >
                    <FaCog /> Global Defaults &amp; Robots.txt
                </button>
            </div>

            {/* TAB 1: SEO RECORDS LIST */}
            {activeTab === 'RECORDS' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by Page Key, Name, Title, Route..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#3c006b]"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <select
                                value={selectedPageType}
                                onChange={(e) => setSelectedPageType(e.target.value)}
                                className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none"
                            >
                                <option value="">All Page Types</option>
                                {PAGE_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 focus:outline-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="true">Active Only</option>
                                <option value="false">Inactive Only</option>
                            </select>

                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="bg-rose-50 text-rose-600 font-extrabold px-4 py-2.5 rounded-xl hover:bg-rose-100 text-xs flex items-center gap-2"
                                >
                                    <FaTrash /> Delete Selected ({selectedIds.length})
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Records Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-black uppercase tracking-wider text-gray-400">
                                    <th className="p-4 w-10">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === records.length && records.length > 0} className="w-4 h-4 rounded accent-[#3c006b]" />
                                    </th>
                                    <th className="p-4">Page Key / Name</th>
                                    <th className="p-4">Route</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">SEO Title &amp; Description</th>
                                    <th className="p-4">Source / Lock</th>
                                    <th className="p-4 text-center">Indexing</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                                {loading ? (
                                    <tr><td colSpan={8} className="p-12 text-center text-gray-400 font-bold">Loading SEO Records...</td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan={8} className="p-12 text-center text-gray-400 font-bold">No SEO records found matching filters. Click 'Generate Missing SEO' to populate!</td></tr>
                                ) : (
                                    records.map((r) => (
                                        <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4">
                                                <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => handleToggleSelect(r.id)} className="w-4 h-4 rounded accent-[#3c006b]" />
                                            </td>
                                            <td className="p-4 font-bold">
                                                <div className="text-gray-900 text-sm">{r.pageName}</div>
                                                <div className="text-[11px] font-mono text-[#3c006b] font-semibold">{r.pageKey}</div>
                                            </td>
                                            <td className="p-4 font-mono text-gray-500">{r.route}</td>
                                            <td className="p-4 uppercase font-bold text-[10px] text-gray-400">{r.pageType}</td>
                                            <td className="p-4 max-w-md">
                                                <div className="font-bold text-gray-900 truncate">{r.title || <span className="text-gray-300 italic">No Title</span>}</div>
                                                <div className="text-gray-500 text-[11px] truncate mt-0.5">{r.metaDescription || <span className="text-gray-300 italic">No Meta Description</span>}</div>
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => handleToggleManualEdit(r)}
                                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                                        r.isManuallyEdited
                                                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                    }`}
                                                    title={r.isManuallyEdited ? 'Manually Edited (Protected from auto-sync)' : 'Auto-Generated (Will update on sync)'}
                                                >
                                                    {r.isManuallyEdited ? <FaLock className="text-amber-600" /> : <FaRobot className="text-emerald-600" />}
                                                    <span>{r.isManuallyEdited ? 'Manual' : 'Auto'}</span>
                                                </button>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${r.isIndexed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {r.isIndexed ? 'Index' : 'NoIndex'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleOpenEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit SEO"><FaEdit /></button>
                                                    <button onClick={() => handleDuplicate(r)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Duplicate"><FaCopy /></button>
                                                    <button onClick={() => handleDelete(r.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: AUTO-SYNC & DISCOVERY PANEL */}
            {activeTab === 'SYNC' && (
                <div className="space-y-6">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Scanned Pages</div>
                                <div className="text-2xl font-black text-gray-900 mt-1">{syncStats?.stats?.total || 0}</div>
                            </div>
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FaGlobe className="text-xl" /></div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Auto-Generated</div>
                                <div className="text-2xl font-black text-emerald-600 mt-1">{syncStats?.stats?.autoGenerated || 0}</div>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><FaRobot className="text-xl" /></div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Manually Protected</div>
                                <div className="text-2xl font-black text-amber-600 mt-1">{syncStats?.stats?.manuallyEdited || 0}</div>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><FaLock className="text-xl" /></div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Missing SEO</div>
                                <div className="text-2xl font-black text-rose-600 mt-1">{syncStats?.stats?.missingCount || 0}</div>
                            </div>
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><FaExclamationTriangle className="text-xl" /></div>
                        </div>
                    </div>

                    {/* Sync Actions Bar */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                            <FaSlidersH className="text-[#3c006b]" /> Automatic Synchronization Controls
                        </h3>
                        <p className="text-xs text-gray-500">
                            The Auto-SEO Discovery Engine scans static routes, products, categories, subcategories, policies, and auth pages to generate Google-optimized titles, meta descriptions, and JSON-LD schemas automatically.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                onClick={handleGenerateMissingSeo}
                                disabled={isSyncing}
                                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaMagic className={isSyncing ? 'animate-spin' : ''} /> Generate Missing SEO Only
                            </button>

                            <button
                                onClick={() => setIsRegenModalOpen(true)}
                                disabled={isSyncing}
                                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaSync className={isSyncing ? 'animate-spin' : ''} /> Configure Bulk Regeneration...
                            </button>

                            <button
                                onClick={handlePreviewSync}
                                disabled={isSyncing}
                                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaEye /> Preview Sync (Dry Run)
                            </button>
                        </div>
                    </div>

                    {/* Recent Sync Audit Logs */}
                    {syncStats?.recentLogs?.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                            <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                                <FaHistory className="text-indigo-600" /> Recent Auto-Sync Activity Logs
                            </h3>

                            <div className="divide-y divide-gray-100 text-xs">
                                {syncStats.recentLogs.map((log) => (
                                    <div key={log.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-gray-900">{log.action}</span>
                                            <span className="text-gray-400 ml-2">by {log.performedBy}</span>
                                            {log.changes && (
                                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                                    Created: {log.changes.created || 0} | Updated: {log.changes.updated || 0} | Scanned: {log.changes.scanned || 0} | Execution: {log.changes.executionTimeMs || 0}ms
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: GLOBAL SETTINGS */}
            {activeTab === 'GLOBAL' && globalSettings && (
                <form onSubmit={handleSaveGlobalSettings} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider border-b pb-3">Global SEO Defaults</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-gray-700">
                        <div>
                            <label className="block mb-1">Brand / Site Name</label>
                            <input type="text" value={globalSettings.siteName} onChange={(e) => setGlobalSettings({ ...globalSettings, siteName: e.target.value })} className="w-full bg-gray-50 border p-3 rounded-xl" />
                        </div>
                        <div>
                            <label className="block mb-1">Title Template</label>
                            <input type="text" value={globalSettings.titleTemplate} onChange={(e) => setGlobalSettings({ ...globalSettings, titleTemplate: e.target.value })} className="w-full bg-gray-50 border p-3 rounded-xl font-mono" />
                        </div>
                        <div>
                            <label className="block mb-1">Default Title</label>
                            <input type="text" value={globalSettings.defaultTitle} onChange={(e) => setGlobalSettings({ ...globalSettings, defaultTitle: e.target.value })} className="w-full bg-gray-50 border p-3 rounded-xl" />
                        </div>
                        <div>
                            <label className="block mb-1">Default Author</label>
                            <input type="text" value={globalSettings.defaultAuthor} onChange={(e) => setGlobalSettings({ ...globalSettings, defaultAuthor: e.target.value })} className="w-full bg-gray-50 border p-3 rounded-xl" />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-bold text-gray-700">Default Meta Description</label>
                        <textarea rows={3} value={globalSettings.defaultDescription} onChange={(e) => setGlobalSettings({ ...globalSettings, defaultDescription: e.target.value })} className="w-full bg-gray-50 border p-3 rounded-xl text-xs font-medium" />
                    </div>

                    <div>
                        <label className="block mb-1 text-xs font-bold text-gray-700">Custom Robots.txt Rules</label>
                        <textarea rows={6} value={globalSettings.robotsTxtCustomRules || ''} onChange={(e) => setGlobalSettings({ ...globalSettings, robotsTxtCustomRules: e.target.value })} className="w-full bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-xs" />
                    </div>

                    <button type="submit" disabled={savingGlobal} className="bg-[#3c006b] text-white font-extrabold px-6 py-3 rounded-xl text-xs shadow-md">
                        {savingGlobal ? 'Saving...' : 'Save Global SEO Settings'}
                    </button>
                </form>
            )}

            {/* EXECUTION REPORT MODAL */}
            {isReportModalOpen && syncReport && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-3xl space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
                                <FaMagic className="text-emerald-600" /> Auto-SEO Sync Execution Report
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold"><FaTimes /></button>
                        </div>

                        {/* Report Metrics Header */}
                        <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl text-center text-xs font-bold">
                            <div>
                                <div className="text-gray-400 text-[10px] uppercase">Scanned</div>
                                <div className="text-lg font-black text-gray-900">{syncReport.scanned}</div>
                            </div>
                            <div>
                                <div className="text-emerald-600 text-[10px] uppercase">Created</div>
                                <div className="text-lg font-black text-emerald-600">{syncReport.created}</div>
                            </div>
                            <div>
                                <div className="text-indigo-600 text-[10px] uppercase">Updated</div>
                                <div className="text-lg font-black text-indigo-600">{syncReport.updated}</div>
                            </div>
                            <div>
                                <div className="text-amber-600 text-[10px] uppercase">Skipped</div>
                                <div className="text-lg font-black text-amber-600">{syncReport.skipped + syncReport.skippedManual}</div>
                            </div>
                        </div>

                        {/* Report Table */}
                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-[10px]">
                                    <tr>
                                        <th className="p-3">Page Name / Key</th>
                                        <th className="p-3">Route</th>
                                        <th className="p-3">Action</th>
                                        <th className="p-3">Generated Title</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium">
                                    {syncReport.pages.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-3 font-bold text-gray-900">{p.pageName} <span className="text-[10px] font-mono text-gray-400">({p.pageKey})</span></td>
                                            <td className="p-3 font-mono text-gray-500 text-[11px]">{p.route}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    p.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                                                    p.action === 'UPDATE' ? 'bg-indigo-100 text-indigo-800' :
                                                    p.action === 'SKIP_MANUAL' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {p.action}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600 truncate max-w-xs">{p.title}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button onClick={() => setIsReportModalOpen(false)} className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-xs">Close Report</button>
                        </div>
                    </div>
                </div>
            )}

            {/* REGENERATION OPTIONS MODAL */}
            {isRegenModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                            <FaSync className="text-indigo-600" /> Bulk Regeneration Options
                        </h3>

                        <div className="space-y-3 text-xs font-semibold text-gray-700">
                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={regenOptions.onlyMissing}
                                    onChange={(e) => setRegenOptions({ ...regenOptions, onlyMissing: e.target.checked })}
                                    className="w-4 h-4 accent-indigo-600"
                                />
                                <div>
                                    <div className="font-bold text-gray-900">Only Missing Records</div>
                                    <div className="text-[11px] text-gray-400 font-normal">Skip existing records, only create missing ones</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={regenOptions.overwriteAuto}
                                    onChange={(e) => setRegenOptions({ ...regenOptions, overwriteAuto: e.target.checked })}
                                    className="w-4 h-4 accent-indigo-600"
                                />
                                <div>
                                    <div className="font-bold text-gray-900">Overwrite Auto-Generated SEO</div>
                                    <div className="text-[11px] text-gray-400 font-normal">Refresh title/description templates for previously synced records</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={regenOptions.skipManual}
                                    onChange={(e) => setRegenOptions({ ...regenOptions, skipManual: e.target.checked })}
                                    className="w-4 h-4 accent-indigo-600"
                                />
                                <div>
                                    <div className="font-bold text-gray-900">Protect Manually Edited SEO</div>
                                    <div className="text-[11px] text-gray-400 font-normal">Never overwrite records edited by admins (Recommended)</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={regenOptions.dryRun}
                                    onChange={(e) => setRegenOptions({ ...regenOptions, dryRun: e.target.checked })}
                                    className="w-4 h-4 accent-indigo-600"
                                />
                                <div>
                                    <div className="font-bold text-gray-900">Preview Before Apply (Dry Run)</div>
                                    <div className="text-[11px] text-gray-400 font-normal">Show report without committing changes to database</div>
                                </div>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setIsRegenModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl text-xs">Cancel</button>
                            <button onClick={handleRunRegenerate} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"><FaMagic /> Run Sync Engine</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeoManager;
