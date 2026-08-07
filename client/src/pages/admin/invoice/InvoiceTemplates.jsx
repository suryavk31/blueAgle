import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../services/adminApi';
import { toast } from 'react-toastify';
import {
    FaFileInvoiceDollar, FaPlus, FaCheck, FaEdit, FaCopy, FaTrash,
    FaStar, FaRegStar, FaEye, FaSearch, FaFilter, FaFileAlt,
} from 'react-icons/fa';

const DOCUMENT_TYPES = [
    'All Document Types',
    'Invoice',
    'Proforma Invoice',
    'Quotation',
    'Estimate',
    'Purchase Order',
    'Delivery Challan',
    'Credit Note',
    'Debit Note',
    'Receipt',
    'Packing Slip',
    'Sales Order',
    'Custom Document',
];

const InvoiceTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [documentTypeFilter, setDocumentTypeFilter] = useState('All Document Types');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const queryType = documentTypeFilter !== 'All Document Types' ? documentTypeFilter : '';
            const res = await adminApi.get('/invoice-builder/templates', {
                params: { documentType: queryType, search },
            });
            setTemplates(res.data?.data || []);
        } catch (err) {
            toast.error('Failed to load invoice templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [documentTypeFilter, search]);

    const handleCreateNew = async () => {
        try {
            const name = `New Invoice Template ${Date.now().toString().slice(-4)}`;
            const res = await adminApi.post('/invoice-builder/templates', {
                name,
                documentType: 'Invoice',
                paperSize: 'A4',
                orientation: 'Portrait',
            });
            toast.success('New template initialized');
            navigate(`/admin/rbac/invoice-builder/editor/${res.data.id}`);
        } catch (err) {
            toast.error('Failed to create template');
        }
    };

    const handleSetDefault = async (id, docType) => {
        try {
            await adminApi.post(`/invoice-builder/templates/${id}/default`);
            toast.success(`Set as default template for ${docType}`);
            fetchTemplates();
        } catch (err) {
            toast.error('Failed to set default template');
        }
    };

    const handleDuplicate = async (id) => {
        try {
            await adminApi.post(`/invoice-builder/templates/${id}/duplicate`);
            toast.success('Template duplicated successfully');
            fetchTemplates();
        } catch (err) {
            toast.error('Failed to duplicate template');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete template "${name}"?`)) return;
        try {
            await adminApi.delete(`/invoice-builder/templates/${id}`);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaFileInvoiceDollar className="text-indigo-600" /> Invoice Templates Studio
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Design drag-and-drop templates, configure dynamic variables, and customize print documents.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="relative z-10 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all self-stretch sm:self-auto"
                >
                    <FaPlus /> Create New Template
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input
                        type="text"
                        placeholder="Search templates by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <FaFilter className="text-gray-400 text-xs" />
                    <select
                        value={documentTypeFilter}
                        onChange={(e) => setDocumentTypeFilter(e.target.value)}
                        className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 focus:outline-none"
                    >
                        {DOCUMENT_TYPES.map((dt) => (
                            <option key={dt} value={dt}>{dt}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Templates Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : templates.length === 0 ? (
                <div className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-gray-100 shadow-xs">
                    <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-800 text-base mb-1">No Templates Found</h4>
                    <p className="text-xs text-gray-500 mb-6">Create your first custom invoice template using the Visual Builder.</p>
                    <button onClick={handleCreateNew} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs">
                        Create Template
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {templates.map((tpl) => (
                        <div
                            key={tpl.id}
                            className="bg-white rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group relative"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                                        {tpl.documentType}
                                    </span>
                                    {tpl.isDefault ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                            <FaStar className="text-emerald-500" /> Default
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleSetDefault(tpl.id, tpl.documentType)}
                                            className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FaRegStar /> Set Default
                                        </button>
                                    )}
                                </div>

                                <h3 className="font-black text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {tpl.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                    {tpl.description || 'Custom document template configuration.'}
                                </p>

                                <div className="flex items-center gap-2 text-[11px] font-mono text-gray-400 mb-6">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{tpl.paperSize}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{tpl.orientation}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">v{tpl.version}.0</span>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                <button
                                    onClick={() => navigate(`/admin/rbac/invoice-builder/editor/${tpl.id}`)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                                >
                                    <FaEdit /> Edit Canvas
                                </button>

                                <div className="flex items-center gap-1 text-gray-400">
                                    <button onClick={() => handleDuplicate(tpl.id)} className="p-2 hover:text-indigo-600 rounded-lg hover:bg-gray-50" title="Duplicate"><FaCopy /></button>
                                    {!tpl.isDefault && (
                                        <button onClick={() => handleDelete(tpl.id, tpl.name)} className="p-2 hover:text-red-600 rounded-lg hover:bg-gray-50" title="Delete"><FaTrash /></button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvoiceTemplates;
