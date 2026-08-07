import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../../../services/adminApi';
import Can from '../../../components/rbac/Can';
import {
    FaEnvelope, FaPlus, FaSearch, FaSpinner, FaTimes, FaCheck,
    FaRedo, FaBan, FaClock, FaCheckCircle,
} from 'react-icons/fa';

const STATUS_STYLES = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Accepted: 'bg-green-50 text-green-700 border-green-200',
    Expired: 'bg-gray-50 text-gray-500 border-gray-200',
    Cancelled: 'bg-red-50 text-red-500 border-red-200',
};

const Invitations = () => {
    const [invitations, setInvitations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ email: '', roleId: '', message: '' });
    const [sending, setSending] = useState(false);

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const [invRes, rolesRes] = await Promise.all([
                adminApi.get(`/invitations?page=${page}&limit=15&search=${search}&status=${filterStatus}`),
                adminApi.get('/roles'),
            ]);
            setInvitations(invRes.data.data);
            setPagination(invRes.data.pagination);
            setRoles(rolesRes.data);
        } catch {
            toast.error('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]);

    useEffect(() => { fetchData(1); }, [fetchData]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.email || !form.roleId) { toast.error('Email and role are required'); return; }
        setSending(true);
        try {
            await adminApi.post('/invitations', form);
            toast.success(`Invitation sent to ${form.email}`);
            setShowModal(false);
            setForm({ email: '', roleId: '', message: '' });
            fetchData(1);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setSending(false);
        }
    };

    const handleResend = async (id, email) => {
        try {
            await adminApi.post(`/invitations/${id}/resend`);
            toast.success(`Invitation resent to ${email}`);
            fetchData(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Resend failed');
        }
    };

    const handleCancel = async (id) => {
        try {
            await adminApi.delete(`/invitations/${id}/cancel`);
            toast.success('Invitation cancelled');
            fetchData(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cancel failed');
        }
    };

    const isExpired = (expiresAt) => new Date() > new Date(expiresAt);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Invitations</h1>
                    <p className="text-gray-500 text-sm mt-1">{pagination.total} total invitations</p>
                </div>
                <Can module="Invitations" action="Create">
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all">
                        <FaPlus /> Invite Admin
                    </button>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-48">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="text" placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Expired">Expired</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invited By</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expires</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[1, 2, 3, 4, 5, 6].map(j => (
                                            <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : invitations.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16 text-gray-400">No invitations found</td></tr>
                            ) : (
                                invitations.map(inv => (
                                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FaEnvelope className="text-gray-300 text-xs flex-shrink-0" />
                                                <span className="font-medium text-gray-900">{inv.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">{inv.role?.name || '—'}</td>
                                        <td className="px-4 py-4 text-gray-600">
                                            {inv.inviter ? `${inv.inviter.firstName} ${inv.inviter.lastName}` : '—'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLES[inv.status]}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <FaClock className={isExpired(inv.expiresAt) && inv.status === 'Pending' ? 'text-red-400' : 'text-gray-300'} />
                                                {new Date(inv.expiresAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {inv.status === 'Pending' && (
                                                    <>
                                                        <Can module="Invitations" action="Create">
                                                            <button onClick={() => handleResend(inv.id, inv.email)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Resend">
                                                                <FaRedo className="text-xs" />
                                                            </button>
                                                        </Can>
                                                        <Can module="Invitations" action="Delete">
                                                            <button onClick={() => handleCancel(inv.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                                                                <FaBan className="text-xs" />
                                                            </button>
                                                        </Can>
                                                    </>
                                                )}
                                                {inv.status === 'Accepted' && <FaCheckCircle className="text-green-400" />}
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
                        <p className="text-sm text-gray-500">Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}</p>
                        <div className="flex gap-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button key={i} onClick={() => fetchData(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pagination.page === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{i + 1}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Send Invitation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900">Invite Admin User</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address *</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="colleague@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Assign Role *</label>
                                <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Select a role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Personal Message (optional)</label>
                                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Add a personal note..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                                <strong>Note:</strong> The invitation link expires in 48 hours. The invitee must click the link and set their password.
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={sending} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {sending ? <FaSpinner className="animate-spin text-xs" /> : <FaEnvelope className="text-xs" />}
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invitations;
