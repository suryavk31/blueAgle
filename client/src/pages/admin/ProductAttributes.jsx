import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaSlidersH, FaCheck, FaTimes } from 'react-icons/fa';

const ProductAttributes = () => {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [type, setType] = useState('text');
    const [optionsInput, setOptionsInput] = useState('');
    const [isRequired, setIsRequired] = useState(false);

    const fetchAttributes = async () => {
        try {
            const res = await adminApi.get('/product-attributes');
            setAttributes(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const handleOpenModal = (attr = null) => {
        if (attr) {
            setEditingAttr(attr);
            setName(attr.name);
            setSlug(attr.slug);
            setType(attr.type);
            setOptionsInput(Array.isArray(attr.options) ? attr.options.join(', ') : '');
            setIsRequired(attr.isRequired);
        } else {
            setEditingAttr(null);
            setName('');
            setSlug('');
            setType('text');
            setOptionsInput('');
            setIsRequired(false);
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const options = optionsInput ? optionsInput.split(',').map(s => s.trim()).filter(Boolean) : [];
        const payload = {
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            type,
            options,
            isRequired
        };

        try {
            if (editingAttr) {
                await adminApi.put(`/product-attributes/${editingAttr.id}`, payload);
                toast.success('Attribute updated successfully');
            } else {
                await adminApi.post('/product-attributes', payload);
                toast.success('Attribute created successfully');
            }
            setModalOpen(false);
            fetchAttributes();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save attribute');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product attribute?')) return;
        try {
            await adminApi.delete(`/product-attributes/${id}`);
            toast.success('Attribute deleted');
            fetchAttributes();
        } catch (err) {
            toast.error('Failed to delete attribute');
        }
    };

    return (
        <div className="space-y-6 text-slate-800 text-left">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FaSlidersH className="text-indigo-600" /> Product Attributes Catalog
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Create reusable product specifications, colors, sizes, and custom fields</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all self-stretch sm:self-auto justify-center"
                >
                    <FaPlus /> Add New Attribute
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full text-left text-xs text-slate-600 min-w-[600px]">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                            <tr>
                                <th className="p-4">Attribute Name</th>
                                <th className="p-4">Slug</th>
                                <th className="p-4">Input Type</th>
                                <th className="p-4">Options</th>
                                <th className="p-4">Required</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">Loading attributes...</td>
                                </tr>
                            ) : attributes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400 font-bold">No product attributes created yet. Click 'Add New Attribute' above.</td>
                                </tr>
                            ) : (
                                attributes.map((attr) => (
                                    <tr key={attr.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{attr.name}</td>
                                        <td className="p-4 font-mono text-indigo-600 text-[11px]">{attr.slug}</td>
                                        <td className="p-4 uppercase font-bold text-[10px] text-slate-500">{attr.type}</td>
                                        <td className="p-4 text-slate-500 max-w-xs truncate">
                                            {Array.isArray(attr.options) && attr.options.length > 0
                                                ? attr.options.join(', ')
                                                : <span className="text-slate-300 italic">None</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${attr.isRequired ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                                {attr.isRequired ? 'Yes' : 'Optional'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenModal(attr)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Edit"><FaEdit /></button>
                                                <button onClick={() => handleDelete(attr.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete"><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h3 className="font-extrabold text-slate-900 text-base">
                                {editingAttr ? 'Edit Product Attribute' : 'Create Product Attribute'}
                            </h3>
                            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                            <div>
                                <label className="block mb-1">Attribute Display Name *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Volume / Size" className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none focus:border-indigo-500" />
                            </div>

                            <div>
                                <label className="block mb-1">Slug (Identifier)</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="volume-size" className="w-full bg-slate-50 border p-3 rounded-xl font-mono focus:outline-none" />
                            </div>

                            <div>
                                <label className="block mb-1">Attribute Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none font-medium">
                                    <option value="text">Text Input</option>
                                    <option value="number">Number Input</option>
                                    <option value="select">Dropdown Select</option>
                                    <option value="multiselect">Multi Select</option>
                                    <option value="color">Color Picker</option>
                                    <option value="checkbox">Checkbox</option>
                                </select>
                            </div>

                            {(type === 'select' || type === 'multiselect') && (
                                <div>
                                    <label className="block mb-1">Selectable Options (comma-separated)</label>
                                    <input type="text" value={optionsInput} onChange={(e) => setOptionsInput(e.target.value)} placeholder="e.g. 500ml, 1 Liter, 5 Liters" className="w-full bg-slate-50 border p-3 rounded-xl focus:outline-none" />
                                </div>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} className="w-4 h-4 accent-indigo-600 rounded" />
                                <span>Required field during product creation</span>
                            </label>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5"><FaCheck /> Save Attribute</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductAttributes;
