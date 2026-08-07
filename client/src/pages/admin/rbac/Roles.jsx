import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../../../services/adminApi';
import Can from '../../../components/rbac/Can';
import {
    FaPlus, FaEdit, FaTrash, FaCopy, FaSearch, FaToggleOn, FaToggleOff,
    FaShieldAlt, FaUsers, FaSpinner, FaTimes, FaCheck, FaEllipsisV,
} from 'react-icons/fa';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showPermMatrix, setShowPermMatrix] = useState(null); // roleId

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminApi.get(`/roles?search=${search}`);
            setRoles(res.data);
        } catch {
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchRoles(); }, [fetchRoles]);

    const openCreate = () => {
        setEditingRole(null);
        setForm({ name: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setForm({ name: role.name, description: role.description || '' });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Role name is required'); return; }
        setSaving(true);
        try {
            if (editingRole) {
                await adminApi.put(`/roles/${editingRole.id}`, form);
                toast.success('Role updated');
            } else {
                await adminApi.post('/roles', form);
                toast.success('Role created');
            }
            setShowModal(false);
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (roleId) => {
        try {
            await adminApi.delete(`/roles/${roleId}`);
            toast.success('Role deleted');
            setDeleteConfirm(null);
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete role');
        }
    };

    const handleDuplicate = async (role) => {
        try {
            await adminApi.post(`/roles/${role.id}/duplicate`);
            toast.success(`'${role.name}' duplicated`);
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to duplicate');
        }
    };

    const handleToggle = async (role) => {
        try {
            await adminApi.put(`/roles/${role.id}`, { isActive: !role.isActive });
            toast.success(`Role ${role.isActive ? 'disabled' : 'enabled'}`);
            fetchRoles();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to toggle');
        }
    };

    const PERM_COLORS = {
        'Super Admin': 'from-amber-500 to-orange-500',
        default: 'from-indigo-500 to-purple-600',
    };

    return (
        <div>
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-gray-100 mb-6">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <FaShieldAlt className="text-indigo-600" /> Role Permissions
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Manage system roles, module permissions, and access controls.</p>
                </div>
                <Can module="Roles" action="Create">
                    <button
                        onClick={openCreate}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-extrabold px-5 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all text-xs self-stretch sm:self-auto"
                    >
                        <FaPlus /> Create Role
                    </button>
                </Can>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md mb-6">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                    type="text"
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-xs"
                />
            </div>

            {/* Role Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                            <div className="h-3 bg-gray-100 rounded mb-4 w-full" />
                            <div className="flex gap-2">
                                <div className="h-8 bg-gray-100 rounded-lg flex-1" />
                                <div className="h-8 bg-gray-100 rounded-lg w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map(role => (
                        <div key={role.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${PERM_COLORS[role.name] || PERM_COLORS.default} flex items-center justify-center shadow-md`}>
                                        <FaShieldAlt className="text-white text-sm" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{role.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {role.isSystemRole && (
                                                <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-bold">System</span>
                                            )}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${role.isActive ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                                                {role.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {role.description && (
                                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{role.description}</p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                <FaShieldAlt className="text-indigo-400" />
                                <span>{role.permissions?.length || 0} permissions</span>
                                <span className="mx-1">·</span>
                                <FaUsers className="text-indigo-400" />
                                <span>{role.memberCount} members</span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Can module="Roles" action="Manage">
                                    <button
                                        onClick={() => setShowPermMatrix(role.id)}
                                        className="flex-1 py-2 text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        Permissions
                                    </button>
                                </Can>
                                <Can module="Roles" action="Update">
                                    <button onClick={() => openEdit(role)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                        <FaEdit className="text-xs" />
                                    </button>
                                    {!role.isSystemRole && (
                                        <button onClick={() => handleToggle(role)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors" title="Toggle">
                                            {role.isActive ? <FaToggleOn className="text-green-500" /> : <FaToggleOff />}
                                        </button>
                                    )}
                                </Can>
                                <Can module="Roles" action="Create">
                                    <button onClick={() => handleDuplicate(role)} className="p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors" title="Duplicate">
                                        <FaCopy className="text-xs" />
                                    </button>
                                </Can>
                                {!role.isSystemRole && (
                                    <Can module="Roles" action="Delete">
                                        <button onClick={() => setDeleteConfirm(role)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <FaTrash className="text-xs" />
                                        </button>
                                    </Can>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900">
                                {editingRole ? 'Edit Role' : 'Create Role'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <FaTimes className="text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Role Name *</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Content Manager"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="What can this role do?"
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                                    {editingRole ? 'Save' : 'Create'}
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
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTrash className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete "{deleteConfirm.name}"?</h3>
                        <p className="text-gray-500 text-sm mb-6">This action cannot be undone. Members will lose this role.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission Matrix Modal */}
            {showPermMatrix && (
                <PermissionMatrixModal
                    roleId={showPermMatrix}
                    roleName={roles.find(r => r.id === showPermMatrix)?.name}
                    onClose={() => { setShowPermMatrix(null); fetchRoles(); }}
                />
            )}
        </div>
    );
};

// ─── Inline Permission Matrix Modal ──────────────────────────────────────────

const PERM_TYPES = ['View', 'Create', 'Update', 'Delete', 'Export', 'Import', 'Approve', 'Reject', 'Publish', 'Unpublish', 'Manage'];

const PermissionMatrixModal = ({ roleId, roleName, onClose }) => {
    const [modules, setModules] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState(new Set());

    useEffect(() => {
        const load = async () => {
            try {
                const [permRes, roleRes] = await Promise.all([
                    adminApi.get('/permissions/grouped'),
                    adminApi.get(`/roles/${roleId}`),
                ]);
                setModules(permRes.data);
                const existingIds = new Set(roleRes.data.permissions?.map(p => p.id) || []);
                setSelected(existingIds);
                // Expand all groups by default
                setExpandedGroups(new Set(permRes.data.filter(m => m.children?.length).map(m => m.id)));
            } catch {
                toast.error('Failed to load permissions');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [roleId]);

    const togglePerm = (permId) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(permId)) next.delete(permId);
            else next.add(permId);
            return next;
        });
    };

    const getPermission = (module, type) => {
        return module.permissions?.find(p => p.permissionKey === `${module.name}.${type}`);
    };

    const toggleRow = (module) => {
        const perms = module.permissions || [];
        const allChecked = perms.every(p => selected.has(p.id));
        setSelected(prev => {
            const next = new Set(prev);
            perms.forEach(p => allChecked ? next.delete(p.id) : next.add(p.id));
            return next;
        });
    };

    const toggleCol = (type) => {
        const allPerms = modules.flatMap(m => m.permissions || []).filter(p => p.permissionKey.endsWith(`.${type}`));
        const allChecked = allPerms.every(p => selected.has(p.id));
        setSelected(prev => {
            const next = new Set(prev);
            allPerms.forEach(p => allChecked ? next.delete(p.id) : next.add(p.id));
            return next;
        });
    };

    const toggleAll = () => {
        const allIds = modules.flatMap(m => m.permissions?.map(p => p.id) || []);
        const allChecked = allIds.every(id => selected.has(id));
        setSelected(allChecked ? new Set() : new Set(allIds));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminApi.put(`/roles/${roleId}/permissions`, { permissionIds: [...selected] });
            toast.success('Permissions saved');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const allIds = modules.flatMap(m => m.permissions?.map(p => p.id) || []);
    const allChecked = allIds.length > 0 && allIds.every(id => selected.has(id));

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col" style={{ maxHeight: '85vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Permission Matrix</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Role: <span className="font-semibold text-indigo-600">{roleName}</span> · {selected.size} permissions selected</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleAll} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
                            {allChecked ? 'Deselect All' : 'Select All'}
                        </button>
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-50">
                            {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            Save
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <FaTimes className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Matrix */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <FaSpinner className="animate-spin text-indigo-500 text-2xl" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-xs border-collapse">
                            <thead className="sticky top-0 bg-gray-50 z-10">
                                <tr>
                                    <th className="text-left px-4 py-3 font-bold text-gray-600 border-b border-gray-200 w-48 sticky left-0 bg-gray-50 z-20">Module</th>
                                    {PERM_TYPES.map(type => (
                                        <th key={type} className="px-2 py-3 text-center font-bold text-gray-600 border-b border-gray-200 cursor-pointer hover:bg-gray-100 min-w-[72px]" onClick={() => toggleCol(type)}>
                                            <span className="text-[10px] block">{type}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map(module => (
                                    <tr key={module.id} className="border-b border-gray-100 hover:bg-indigo-50/30 group">
                                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-indigo-50/30 z-10">
                                            <button
                                                onClick={() => toggleRow(module)}
                                                className="flex items-center gap-2 font-semibold text-gray-700 hover:text-indigo-600 transition-colors w-full text-left"
                                            >
                                                <span className="w-3 h-3 border border-gray-300 rounded flex-shrink-0 flex items-center justify-center bg-white">
                                                    {module.permissions?.every(p => selected.has(p.id)) && (
                                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-sm" />
                                                    )}
                                                </span>
                                                {module.displayName}
                                            </button>
                                        </td>
                                        {PERM_TYPES.map(type => {
                                            const perm = getPermission(module, type);
                                            const checked = perm && selected.has(perm.id);
                                            return (
                                                <td key={type} className="px-2 py-3 text-center">
                                                    {perm ? (
                                                        <button
                                                            onClick={() => togglePerm(perm.id)}
                                                            className={`w-5 h-5 rounded border-2 mx-auto flex items-center justify-center transition-all ${checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-indigo-400'}`}
                                                        >
                                                            {checked && <FaCheck className="text-white text-[8px]" />}
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-200 text-lg leading-none mx-auto block text-center">–</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Roles;
