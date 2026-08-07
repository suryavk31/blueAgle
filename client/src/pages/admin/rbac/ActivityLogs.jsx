import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../../../services/adminApi';
import Can from '../../../components/rbac/Can';
import {
    FaSearch, FaDownload, FaFilter, FaUser, FaClock, FaGlobe,
    FaShieldAlt, FaSignInAlt, FaPlus, FaEdit, FaTrash, FaKey,
} from 'react-icons/fa';

const ACTION_COLORS = {
    Login: 'bg-green-50 text-green-700',
    Logout: 'bg-gray-50 text-gray-600',
    Create: 'bg-blue-50 text-blue-700',
    Update: 'bg-amber-50 text-amber-700',
    Delete: 'bg-red-50 text-red-700',
    PermissionChange: 'bg-purple-50 text-purple-700',
    InvitationSent: 'bg-indigo-50 text-indigo-700',
    InvitationAccepted: 'bg-teal-50 text-teal-700',
    PasswordReset: 'bg-orange-50 text-orange-700',
    FailedLogin: 'bg-red-50 text-red-700',
    Export: 'bg-cyan-50 text-cyan-700',
    default: 'bg-gray-50 text-gray-600',
};

const ACTION_ICONS = {
    Login: FaSignInAlt,
    Create: FaPlus,
    Update: FaEdit,
    Delete: FaTrash,
    PasswordReset: FaKey,
    default: FaShieldAlt,
};

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [stats, setStats] = useState({ total: 0, today: 0 });

    const [search, setSearch] = useState('');
    const [filterModule, setFilterModule] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 50, search, module: filterModule, action: filterAction, dateFrom, dateTo });
            const [logsRes, statsRes] = await Promise.all([
                adminApi.get(`/activity-logs?${params}`),
                adminApi.get('/activity-logs/stats'),
            ]);
            setLogs(logsRes.data.data);
            setPagination(logsRes.data.pagination);
            setStats(statsRes.data);
        } catch {
            toast.error('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    }, [search, filterModule, filterAction, dateFrom, dateTo]);

    useEffect(() => { fetchData(1); }, [fetchData]);

    const handleExport = async () => {
        try {
            const params = new URLSearchParams({ module: filterModule, action: filterAction, dateFrom, dateTo });
            const res = await adminApi.get(`/activity-logs/export?${params}`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'activity-logs.csv';
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Export failed');
        }
    };

    const getActionColor = (action) => ACTION_COLORS[action] || ACTION_COLORS.default;
    const getActionIcon = (action) => {
        const Icon = ACTION_ICONS[action] || ACTION_ICONS.default;
        return <Icon className="text-xs" />;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Activity Logs</h1>
                    <p className="text-gray-500 text-sm mt-1">Complete audit trail of all admin actions</p>
                </div>
                <Can module="ActivityLogs" action="Export">
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 shadow-sm transition-all">
                        <FaDownload className="text-xs" /> Export CSV
                    </button>
                </Can>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Events</p>
                    <p className="text-3xl font-black text-gray-900">{stats.total?.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Today's Events</p>
                    <p className="text-3xl font-black text-indigo-600">{stats.today?.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input type="text" placeholder="Search description..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                    </div>
                    <input type="text" placeholder="Module..." value={filterModule} onChange={(e) => setFilterModule(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32" />
                    <input type="text" placeholder="Action..." value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32" />
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={() => { setSearch(''); setFilterModule(''); setFilterAction(''); setDateFrom(''); setDateTo(''); }} className="px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors">
                        Clear
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Who</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Module</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">IP / Device</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">When</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[1,2,3,4,5,6].map(j => (
                                            <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16 text-gray-400">No activity logs found</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            {log.adminUser ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                                        {log.adminUser.firstName?.[0]}{log.adminUser.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-xs">{log.adminUser.firstName} {log.adminUser.lastName}</p>
                                                        <p className="text-gray-400 text-[10px]">{log.adminUser.email}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">System</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{log.module}</code>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${getActionColor(log.action)}`}>
                                                {getActionIcon(log.action)}
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 text-xs max-w-[200px] truncate" title={log.description}>
                                            {log.description || '—'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                <FaGlobe className="text-[10px]" />
                                                {log.ipAddress || '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                <FaClock className="text-[10px]" />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Showing {((pagination.page - 1) * 50) + 1}–{Math.min(pagination.page * 50, pagination.total)} of {pagination.total}</p>
                        <div className="flex gap-2 flex-wrap">
                            {[...Array(Math.min(pagination.pages, 10))].map((_, i) => (
                                <button key={i} onClick={() => fetchData(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pagination.page === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{i + 1}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;
