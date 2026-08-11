import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import { 
    FaFolderPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, 
    FaPlus, FaFolder, FaTags, FaImage, FaCheck, FaTimes, FaListUl, FaTag, FaChevronRight, FaSave 
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // SubCategory state
    const [subName, setSubName] = useState('');
    const [subCategoryId, setSubCategoryId] = useState('');
    const [editingSubId, setEditingSubId] = useState(null);
    const [expandedCatId, setExpandedCatId] = useState(null);

    const fetchCategories = async () => {
        try {
            const res = await adminApi.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ─── Category Handlers ────────────────────────────────────────────────────

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        if (image) formData.append('image', image);

        try {
                        if (editingId) {
                await adminApi.put(`/categories/${editingId}`, formData);
                toast.success('Category Updated Successfully');
            } else {
                await adminApi.post('/categories', formData);
                toast.success('Category Created Successfully');
            }

            cancelEdit();
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will delete all sub-categories and products under this category.')) return;
        try {
            await adminApi.delete(`/categories/${id}`);
            toast.success('Category Deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Error deleting category');
        }
    };

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setName(cat.name);
        setImagePreview(cat.image ? getImageUrl(cat.image) : null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setName('');
        setImage(null);
        setImagePreview(null);
    };

    // ─── SubCategory Handlers ──────────────────────────────────────────────────

    const handleSubSubmit = async (e) => {
        e.preventDefault();
        if (!subName.trim() || !subCategoryId) {
            toast.error('Please enter sub-category name and select a parent category');
            return;
        }

        try {
            if (editingSubId) {
                // Update subcategory
                await adminApi.put(`/categories/sub/${editingSubId}`, { name: subName, categoryId: subCategoryId });
                toast.success('Sub-category Updated');
            } else {
                // Create subcategory
                await adminApi.post('/categories/sub', { name: subName, categoryId: subCategoryId });
                toast.success('Sub-category Added');
            }

            cancelSubEdit();
            fetchCategories();
        } catch (error) {
            console.error('Error saving subcategory:', error);
            toast.error(error.response?.data?.message || 'Error saving sub-category');
        }
    };

    const handleSubDelete = async (subId) => {
        if (!window.confirm('Delete this sub-category?')) return;
        try {
            await adminApi.delete(`/categories/sub/${subId}`);
            toast.success('Sub-category Deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Error deleting sub-category');
        }
    };

    const handleSubEdit = (sub, catId) => {
        setSubName(sub.name);
        setSubCategoryId(String(catId));
        setEditingSubId(sub.id);
        // scroll to sub form
        document.getElementById('sub-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelSubEdit = () => {
        setEditingSubId(null);
        setSubName('');
        setSubCategoryId('');
    };

    const toggleExpand = (id) => {
        setExpandedCatId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-3">
                        <FaListUl className="text-indigo-600" /> Manage Categories
                    </h2>
                    <p className="text-gray-500 font-medium">Organize your products into logical categories and sub-categories.</p>
                </div>
            </div>

            {/* ── Category Form ── */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left transition-all">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingId ? <><FaEdit className="text-indigo-500" /> Edit Category</> : <><FaPlus className="text-indigo-500" /> Add New Category</>}
                    </h3>
                    {editingId && (
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Editing Mode Active</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Image Upload */}
                    <div className="w-full md:w-1/4 shrink-0">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Category Cover</label>
                        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden group transition-all">
                            {imagePreview ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-bold text-sm">Change Image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                        <FaImage size={20} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">Upload Image</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>

                    {/* Name + Actions */}
                    <div className="flex-1 w-full space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Category Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-4 outline-none transition-colors"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Oils & Ghee"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                                <FaSave /> {editingId ? 'Update Category' : 'Save Category'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    <FaTimes /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Sub-Category Form ── */}
            <div id="sub-form-section" className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left transition-all">
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingSubId ? <><FaEdit className="text-purple-500" /> Edit Sub-Category</> : <><FaTag className="text-purple-500" /> Add Sub-Category</>}
                    </h3>
                    {editingSubId && (
                        <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-200">Editing Sub-Category</span>
                    )}
                </div>

                <form onSubmit={handleSubSubmit} className="flex flex-col md:flex-row gap-6 items-end">
                    {/* Parent Category Select */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Parent Category</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-4 outline-none transition-colors"
                            value={subCategoryId}
                            onChange={(e) => setSubCategoryId(e.target.value)}
                            required
                        >
                            <option value="">-- Select a Category --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sub-category Name */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Sub-Category Name</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-4 outline-none transition-colors"
                            value={subName}
                            onChange={(e) => setSubName(e.target.value)}
                            placeholder="e.g. Refined Oils"
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 shrink-0">
                        <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                            <FaSave /> {editingSubId ? 'Update' : 'Add Sub-Category'}
                        </button>
                        {editingSubId && (
                            <button type="button" onClick={cancelSubEdit} className="bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                <FaTimes /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Categories List with Sub-categories ── */}
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl text-gray-800">Categories & Sub-categories</h3>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{categories.length} Total</span>
                </div>

                <div className="space-y-4">
                    {categories.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No categories created yet.</p>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Category Row */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-white group">
                                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                                        {/* Thumbnail */}
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                            {cat.image ? (
                                                <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FaImage className="text-gray-300 text-lg sm:text-xl" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{cat.name}</h4>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] sm:text-xs font-bold mt-0.5">
                                                <FaListUl size={9} /> {cat.SubCategories?.length || 0} Sub-categories
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                        <button
                                            onClick={() => toggleExpand(cat.id)}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                                        >
                                            {expandedCatId === cat.id ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                            {expandedCatId === cat.id ? 'Collapse' : 'Show Subs'}
                                        </button>
                                        <button onClick={() => handleEdit(cat)} className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors">
                                            <FaEdit size={12} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shrink-0">
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Sub-categories Dropdown */}
                                {expandedCatId === cat.id && (
                                    <div className="border-t border-gray-50 bg-gray-50/50 px-4 py-3">
                                        {cat.SubCategories?.length > 0 ? (
                                            <div className="space-y-2">
                                                {cat.SubCategories.map((sub) => (
                                                    <div key={sub.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                                                            <span className="font-semibold text-gray-700 text-sm">{sub.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleSubEdit(sub, cat.id)}
                                                                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <FaEdit size={10} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleSubDelete(sub.id)}
                                                                className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                            >
                                                                <FaTrash size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm text-center py-3 italic">No sub-categories yet. Add one above.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Categories;
