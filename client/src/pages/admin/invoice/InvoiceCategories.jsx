import React, { useEffect, useState } from 'react';
import adminApi from '../../../services/adminApi';
import { toast } from 'react-toastify';
import { FaTags, FaPlus, FaSave } from 'react-icons/fa';

const InvoiceCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await adminApi.get('/invoice-builder/categories');
            setCategories(res.data || []);
        } catch {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            await adminApi.post('/invoice-builder/categories', { name, description });
            toast.success('Category created');
            setName('');
            setDescription('');
            fetchCategories();
        } catch {
            toast.error('Failed to create category');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <FaTags className="text-indigo-600" /> Template Categories
                </h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Organize invoice and document templates by business workflow.</p>
            </div>

            <form onSubmit={handleCreate} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Export & International Billing"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Short overview..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shrink-0">
                    <FaPlus /> Add Category
                </button>
            </form>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading categories...</div>
            ) : (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                    {categories.map((c) => (
                        <div key={c.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/70 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
                                {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvoiceCategories;
