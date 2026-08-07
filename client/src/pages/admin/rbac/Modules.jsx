import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import adminApi from '../../../services/adminApi';
import Can from '../../../components/rbac/Can';
import {
    FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaTimes, FaCheck,
    FaCubes, FaChevronRight, FaChevronDown, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';

const ICON_OPTIONS = [
    'FaTachometerAlt', 'FaBox', 'FaList', 'FaShoppingCart', 'FaTags', 'FaUsers',
    'FaFileAlt', 'FaBullhorn', 'FaSearch', 'FaStore', 'FaShoppingBag', 'FaChartBar',
    'FaCog', 'FaShieldAlt', 'FaCubes', 'FaUserTag', 'FaUsersCog', 'FaEnvelope',
    'FaHistory', 'FaAd', 'FaStar', 'FaBell', 'FaGlobe', 'FaImage',
];

const Modules = () => {
    const [modules, setModules] = useState([]);
    const [flatModules, setFlatModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [form, setForm] = useState({
        name: '', displayName: '', slug: '', route: '', parentModuleId: '',
        icon: 'FaBox', sortOrder: 0, description: '', isVisible: true, isActive: true,
    });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expanded, setExpanded] = useState(new Set());

    const fetchModules = useCallback(async () => {
        setLoading(true);
        try {
            const [treeRes, flatRes] = await Promise.all([
                adminApi.get(`/modules?search=${search}`),
                adminApi.get('/modules/flat'),
            ]);
            setModules(treeRes.data);
            setFlatModules(flatRes.data);
            setExpanded(new Set(treeRes.data.filter(m => m.children?.length).map(m => m.id)));
        } catch {
            toast.error('Failed to load modules');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchModules(); }, [fetchModules]);

    const openCreate = (parentId = '') => {
        setEditingModule(null);
        setForm({ name: '', displayName: '', slug: '', route: '', parentModuleId: parentId || '', icon: 'FaBox', sortOrder: 0, description: '', isVisible: true, isActive: true });
        setShowModal(true);
    };

    const openEdit = (module) => {
        setEditingModule(module);
        setForm({
            name: module.name,
            displayName: module.displayName,
            slug: module.slug,
            route: module.route || '',
            parentModuleId: module.parentModuleId || '',
            icon: module.icon || 'FaBox',
            sortOrder: module.sortOrder || 0,
            description: module.description || '',
            isVisible: module.isVisible,
            isActive: module.isActive,
        });
        setShowModal(true);
    };

    const autoFillSlug = (name) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    const handleNameChange = (value) => {
        setForm(prev => ({
            ...prev,
            name: value,
            ...((!editingModule && !prev.slug) ? { slug: autoFillSlug(value) } : {}),
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, parentModuleId: form.parentModuleId || null };
            if (editingModule) {
                await adminApi.put(`/modules/${editingModule.id}`, payload);
                toast.success('Module updated');
            } else {
                await adminApi.post('/modules', payload);
                toast.success('Module created with permissions');
            }
            setShowModal(false);
            fetchModules();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (moduleId) => {
        try {
            await adminApi.delete(`/modules/${moduleId}`);
            toast.success('Module deleted');
            setDeleteConfirm(null);
            fetchModules();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cannot delete');
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const ModuleRow = ({ module, depth = 0 }) => {
        const hasChildren = module.children?.length > 0;
        const isOpen = expanded.has(module.id);

        return (
            <>
                <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
                            {hasChildren ? (
                                <button onClick={() => toggleExpand(module.id)} className="text-gray-400 hover:text-indigo-500 w-4 flex-shrink-0">
                                    {isOpen ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                                </button>
                            ) : (
                                <span className="w-4 flex-shrink-0 text-gray-200 text-xs text-center">–</span>
                            )}
                            <span className="font-semibold text-gray-900 text-sm">{module.displayName}</span>
                            <code className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{module.name}</code>
                        </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{module.slug}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{module.route || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{module.icon || '—'}</td>
                    <td className="px-4 py-3.5 text-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${module.isVisible ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                            {module.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-bold border ${module.isActive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                            {module.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                            <Can module="Modules" action="Create">
                                <button onClick={() => openCreate(module.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Add child module">
                                    <FaPlus className="text-[10px]" />
                                </button>
                            </Can>
                            <Can module="Modules" action="Update">
                                <button onClick={() => openEdit(module)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                    <FaEdit className="text-[10px]" />
                                </button>
                            </Can>
                            <Can module="Modules" action="Delete">
                                <button onClick={() => setDeleteConfirm(module)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <FaTrash className="text-[10px]" />
                                </button>
                            </Can>
                        </div>
                    </td>
                </tr>
                {hasChildren && isOpen && module.children.map(child => (
                    <ModuleRow key={child.id} module={child} depth={depth + 1} />
                ))}
            </>
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Modules</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage sidebar modules and their permissions</p>
                </div>
                <Can module="Modules" action="Create">
                    <button onClick={() => openCreate()} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all">
                        <FaPlus /> Add Module
                    </button>
                </Can>
            </div>

            <div className="relative mb-6 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input type="text" placeholder="Search modules..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Module</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Icon</th>
                                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Visibility</th>
                                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i} className="border-b border-gray-50 animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32" /></td>
                                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-28" /></td>
                                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                                        <td className="px-4 py-4 text-center"><div className="h-5 bg-gray-100 rounded-full w-14 mx-auto" /></td>
                                        <td className="px-4 py-4 text-center"><div className="h-5 bg-gray-100 rounded-full w-14 mx-auto" /></td>
                                        <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-16 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : modules.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-gray-400">No modules found</td></tr>
                            ) : (
                                modules.map(module => <ModuleRow key={module.id} module={module} depth={0} />)
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-900">{editingModule ? 'Edit Module' : 'Add Module'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            {!editingModule && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Module Name * <span className="text-gray-400 normal-case font-normal">(internal identifier e.g. "Products")</span></label>
                                    <input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Products" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name *</label>
                                <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required placeholder="Products" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Slug *</label>
                                    <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="products" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sort Order</label>
                                    <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Route</label>
                                <input type="text" value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} placeholder="/admin/products" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Parent Module</label>
                                    <select value={form.parentModuleId} onChange={(e) => setForm({ ...form, parentModuleId: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        <option value="">None (top-level)</option>
                                        {flatModules.filter(m => !editingModule || m.id !== editingModule.id).map(m => (
                                            <option key={m.id} value={m.id}>{m.displayName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Icon</label>
                                    <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm({ ...form, isVisible: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                                    <span className="text-sm text-gray-600">Visible in sidebar</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                                    <span className="text-sm text-gray-600">Active</span>
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                                    {editingModule ? 'Save' : 'Create Module'}
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
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete "{deleteConfirm.displayName}"?</h3>
                        <p className="text-gray-500 text-sm mb-6">This will also delete all associated permissions.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Modules;
