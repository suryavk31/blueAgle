import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../../../services/adminApi';
import Can from '../../../components/rbac/Can';
import {
    FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaTimes, FaCheck,
    FaUser, FaEnvelope, FaPhone, FaShieldAlt, FaToggleOn, FaToggleOff,
    FaKey, FaEye, FaEyeSlash, FaUpload, FaFilter,
} from 'react-icons/fa';

const STATUS_COLORS = {
    Active: 'bg-green-50 text-green-700 border-green-200',
    Inactive: 'bg-gray-50 text-gray-500 border-gray-200',
    Suspended: 'bg-red-50 text-red-600 border-red-200',
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterRole, setFilterRole] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', roleId: '', status: 'Active', password: '', confirmPassword: '', forcePasswordChange: false });
    const [showPw, setShowPw] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [resetPwModal, setResetPwModal] = useState(null);
    const [newPw, setNewPw] = useState('');

    const fetchData = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                adminApi.get(`/users?page=${page}&limit=15&search=${search}&status=${filterStatus}&roleId=${filterRole}`),
                adminApi.get('/roles'),
            ]);
            setUsers(usersRes.data.data);
            setPagination(usersRes.data.pagination);
            setRoles(rolesRes.data);
        } catch {
            toast.error('Failed to load admin users');
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus, filterRole]);

    useEffect(() => { fetchData(1); }, [fetchData]);

    const openCreate = () => {
        setEditingUser(null);
        setForm({ firstName: '', lastName: '', email: '', phone: '', roleId: '', status: 'Active', password: '', confirmPassword: '', forcePasswordChange: false });
        setShowPw(false);
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', roleId: user.roleId?.toString() || '', status: user.status, password: '', confirmPassword: '', forcePasswordChange: false });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingUser && form.password !== form.confirmPassword) {
            toast.error('Passwords do not match'); return;
        }
        setSaving(true);
        try {
            if (editingUser) {
                const { password, confirmPassword, ...updateData } = form;
                await adminApi.put(`/users/${editingUser.id}`, updateData);
                toast.success('Admin user updated');
            } else {
                await adminApi.post('/users', { ...form, password: form.password });
                toast.success('Admin user created');
            }
            setShowModal(false);
            fetchData(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await adminApi.delete(`/users/${userId}`);
            toast.success('Admin user deleted');
            setDeleteConfirm(null);
            fetchData(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const handleResetPw = async () => {
        if (!newPw || newPw.length < 8) { toast.error('Min. 8 characters'); return; }
        try {
            await adminApi.post(`/users/${resetPwModal.id}/reset-password`, { newPassword: newPw, forcePasswordChange: true });
            toast.success('Password reset successfully');
            setResetPwModal(null);
            setNewPw('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Users</h1>
                    <p className="text-gray-500 text-sm mt-1">{pagination.total} total admins</p>
                </div>
                <Can module="AdminUsers" action="Create">
                    <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all">
                        <FaPlus /> Add Admin User
                    </button>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-48">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                </select>
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                    <option value="">All Roles</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Admin</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded-xl" /><div><div className="h-3 bg-gray-100 rounded w-32 mb-1" /><div className="h-3 bg-gray-100 rounded w-40" /></div></div></td>
                                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                                        <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded-full w-16" /></td>
                                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                                        <td className="px-4 py-4"><div className="h-6 bg-gray-100 rounded w-20 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-16 text-gray-400">No admin users found</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                                                    <p className="text-gray-400 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <FaShieldAlt className="text-indigo-400 text-xs" />
                                                <span className="text-gray-700 font-medium">{user.role?.name || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[user.status]}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-xs">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Can module="AdminUsers" action="Update">
                                                    <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                        <FaEdit className="text-xs" />
                                                    </button>
                                                    <button onClick={() => { setResetPwModal(user); setNewPw(''); }} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Reset Password">
                                                        <FaKey className="text-xs" />
                                                    </button>
                                                </Can>
                                                <Can module="AdminUsers" action="Delete">
                                                    <button onClick={() => setDeleteConfirm(user)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <FaTrash className="text-xs" />
                                                    </button>
                                                </Can>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
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
                                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${pagination.page === i + 1 ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900">{editingUser ? 'Edit Admin User' : 'Add Admin User'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">First Name *</label>
                                    <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Last Name *</label>
                                    <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            {!editingUser && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email *</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone</label>
                                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role *</label>
                                    <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">Select role</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                            {!editingUser && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Password *</label>
                                        <div className="relative">
                                            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPw ? <FaEyeSlash /> : <FaEye />}</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm Password *</label>
                                        <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={form.forcePasswordChange} onChange={(e) => setForm({ ...form, forcePasswordChange: e.target.checked })} className="w-4 h-4 rounded accent-indigo-600" />
                                        <span className="text-sm text-gray-600">Force password change on first login</span>
                                    </label>
                                </>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><FaTrash className="text-red-400" /></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete {deleteConfirm.firstName}?</h3>
                        <p className="text-gray-500 text-sm mb-6">This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPwModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                            <button onClick={() => setResetPwModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes className="text-gray-400" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Set new password for <strong>{resetPwModal.email}</strong></p>
                        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min 8 chars)" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => setResetPwModal(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleResetPw} className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-400">Reset</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
