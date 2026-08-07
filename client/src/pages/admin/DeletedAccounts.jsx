import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../../services/adminApi';
import Can from '../../components/rbac/Can';
import {
    FaUserSlash, FaSearch, FaDownload, FaCalendarAlt, FaReceipt,
    FaExclamationCircle, FaShieldAlt,
} from 'react-icons/fa';

const DeletedAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15,
                search,
                dateFrom,
                dateTo,
            });
            const res = await adminApi.get(`/account/admin/deleted-accounts?${params}`);
            setAccounts(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error('Failed to load deleted accounts audit log');
        } finally {
            setLoading(false);
        }
    }, [search, dateFrom, dateTo]);

    useEffect(() => { fetchData(1); }, [fetchData]);

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({ dateFrom, dateTo });
            const res = await adminApi.get(`/account/admin/deleted-accounts/export?${params}`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'deleted-accounts-audit.csv';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Export failed');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-50 to-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-red-900 to-gray-900 flex items-center gap-3">
                        <FaUserSlash className="text-red-600" /> Deleted Accounts Audit Log
                    </h2>
                    <p className="text-gray-500 font-medium">Audit list of anonymized customer accounts and retained order histories.</p>
                </div>
                <Can module="AdminUsers" action="Export">
                    <button
                        onClick={handleExport}
                        className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm transition-all"
                    >
                        <FaDownload className="text-xs" /> Export Audit CSV
                    </button>
                </Can>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder="Search by reason, feedback, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">From:</span>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">To:</span>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <button
                        onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); }}
                        className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Anonymized Identity</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deletion Date</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason & Feedback</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Retained Orders</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[1, 2, 3, 4, 5].map(j => (
                                            <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-400 font-medium">
                                        No deleted accounts found in audit logs.
                                    </td>
                                </tr>
                            ) : (
                                accounts.map(acc => (
                                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-700">#{acc.id}</td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-800 text-xs font-mono">{acc.name}</p>
                                                <p className="text-gray-400 text-[11px] font-mono">{acc.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <FaCalendarAlt className="text-red-400 text-xs" />
                                                {acc.deletedAt ? new Date(acc.deletedAt).toLocaleString() : '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-xs max-w-[280px]">
                                            <span className="inline-block font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 mb-1">
                                                {acc.deletionReason || 'User requested deletion'}
                                            </span>
                                            {acc.deletionFeedback && (
                                                <p className="text-gray-500 italic text-[11px] truncate" title={acc.deletionFeedback}>
                                                    "{acc.deletionFeedback}"
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                <FaReceipt className="text-[10px]" /> {acc.retainedOrderCount} orders
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => fetchData(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pagination.page === i + 1 ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeletedAccounts;
