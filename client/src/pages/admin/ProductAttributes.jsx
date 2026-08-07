import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaSlidersH, FaCheck } from 'react-icons/fa';

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
        <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FaSlidersH className="text-indigo-600" /> Product Attributes Catalog
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Create reusable product specifications, colors, sizes, and custom fields</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-200"
                >
                    <FaPlus /> Add Attribute
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                        <tr>
                            <th className="p-4">Attribute Name</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4">Input Type</th>
                            <th className="p-4">Preset Options</th>
                            <th className="p-4">Required</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading attributes...</td></tr>
                        ) : attributes.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">No custom attributes created yet. Click 'Add Attribute' to create one.</td></tr>
                        ) : (
                            attributes.map((attr) => (
                                <tr key={attr.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 font-bold text-slate-900 text-sm">{attr.name}</td>
                                    <td className="p-4 font-mono text-slate-500">{attr.slug}</td>
                                    <td className="p-4 uppercase font-bold text-indigo-600 text-[11px]">{attr.type}</td>
                                    <td className="p-4">
                                        {Array.isArray(attr.options) && attr.options.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {attr.options.map((opt, i) => (
                                                    <span key={i} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">{opt}</span>
                                                ))}
                                            </div>
                                        ) : <span className="text-slate-400">—</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${attr.isRequired ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {attr.isRequired ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(attr)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FaEdit /></button>
                                            <button onClick={() => handleDelete(attr.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg"><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="font-extrabold text-slate-900 text-base">{editingAttr ? 'Edit Product Attribute' : 'Create Product Attribute'}</h3>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-600 font-bold mb-1">Attribute Name *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Packaging Type or Material" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-bold mb-1">Slug</label>
                                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="packaging-type" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono" />
                            </div>

                            <div>
                                <label className="block text-slate-600 font-bold mb-1">Input Field Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold">
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
                                    <label className="block text-slate-600 font-bold mb-1">Preset Options (Comma Separated)</label>
                                    <input type="text" value={optionsInput} onChange={(e) => setOptionsInput(e.target.value)} placeholder="e.g. Glass Bottle, Pouch, Can" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                </div>
                            )}

                            <label className="flex items-center gap-2 font-bold text-slate-700 pt-1">
                                <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} className="w-4 h-4 accent-indigo-600" /> Required Attribute
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"><FaCheck /> Save Attribute</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProductAttributes;
