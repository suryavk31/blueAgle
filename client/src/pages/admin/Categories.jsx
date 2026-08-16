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
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 sm:gap-4 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
                <div className="relative z-10 space-y-1 text-left">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 flex items-center gap-2.5 sm:gap-3">
                        <FaListUl className="text-indigo-600 shrink-0" /> Manage Categories
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm font-medium">Organize your products into logical categories and sub-categories.</p>
                </div>
            </div>

            {/* ── Category Form ── */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left transition-all">
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 border-b border-gray-100 pb-3 sm:pb-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingId ? <><FaEdit className="text-indigo-500" /> Edit Category</> : <><FaPlus className="text-indigo-500" /> Add New Category</>}
                    </h3>
                    {editingId && (
                        <span className="bg-amber-50 text-amber-600 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-amber-200">Editing Active</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
                    {/* Image Upload */}
                    <div className="w-full md:w-1/4 shrink-0">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2">Category Cover</label>
                        <label className="relative flex flex-col items-center justify-center w-full h-28 sm:h-36 md:h-40 border-2 border-gray-300 border-dashed rounded-xl sm:rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden group transition-all">
                            {imagePreview ? (
                                <div className="absolute inset-0 w-full h-full">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white font-bold text-xs sm:text-sm">Change Image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-xs mb-1.5 sm:mb-3 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                        <FaImage size={18} />
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Upload Image</p>
                                </div>
                            )}
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>

                    {/* Name + Actions */}
                    <div className="flex-1 w-full space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2">Category Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 sm:p-3.5 md:p-4 outline-none transition-colors"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Oils & Ghee"
                                required
                            />
                        </div>
                        <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-1">
                            <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 text-xs sm:text-sm transition-all hover:-translate-y-0.5">
                                <FaSave /> {editingId ? 'Update Category' : 'Save Category'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={cancelEdit} className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors">
                                    <FaTimes /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* ── Sub-Category Form ── */}
            <div id="sub-form-section" className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative text-left transition-all">
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 border-b border-gray-100 pb-3 sm:pb-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingSubId ? <><FaEdit className="text-purple-500" /> Edit Sub-Category</> : <><FaTag className="text-purple-500" /> Add Sub-Category</>}
                    </h3>
                    {editingSubId && (
                        <span className="bg-purple-50 text-purple-600 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border border-purple-200">Editing Mode</span>
                    )}
                </div>

                <form onSubmit={handleSubSubmit} className="flex flex-col md:flex-row gap-3.5 sm:gap-6 items-stretch md:items-end">
                    {/* Parent Category Select */}
                    <div className="flex-1 min-w-0">
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2">Parent Category</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-3 sm:p-3.5 md:p-4 outline-none transition-colors"
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
                        <label className="block text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5 sm:mb-2">Sub-Category Name</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-xl focus:ring-purple-500 focus:border-purple-500 block p-3 sm:p-3.5 md:p-4 outline-none transition-colors"
                            value={subName}
                            onChange={(e) => setSubName(e.target.value)}
                            placeholder="e.g. Refined Oils"
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2.5 sm:gap-3 shrink-0 pt-1 md:pt-0">
                        <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-500/20 text-xs sm:text-sm transition-all hover:-translate-y-0.5 whitespace-nowrap">
                            <FaSave /> {editingSubId ? 'Update' : 'Add Sub-Category'}
                        </button>
                        {editingSubId && (
                            <button type="button" onClick={cancelSubEdit} className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs sm:text-sm transition-colors">
                                <FaTimes /> Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* ── Categories List with Sub-categories ── */}
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 overflow-hidden text-left">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800">Categories &amp; Sub-categories</h3>
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold">{categories.length} Total</span>
                </div>

                <div className="space-y-3 sm:space-y-4">
                    {categories.length === 0 ? (
                        <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">No categories created yet.</p>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <div key={cat.id} className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
                                {/* Category Row */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-white group">
                                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                                        {/* Thumbnail */}
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                            {cat.image ? (
                                                <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FaImage className="text-gray-300 text-base sm:text-xl" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{cat.name}</h4>
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-bold mt-0.5">
                                                <FaListUl size={9} /> {cat.SubCategories?.length || 0} Sub-categories
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                        <button
                                            onClick={() => toggleExpand(cat.id)}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors"
                                        >
                                            {expandedCatId === cat.id ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                            {expandedCatId === cat.id ? 'Collapse' : 'Show Subs'}
                                        </button>
                                        <button onClick={() => handleEdit(cat)} className="flex-1 sm:flex-initial flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg transition-colors">
                                            <FaEdit size={11} /> Edit
                                        </button>
                                        <button onClick={() => handleDelete(cat.id)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors shrink-0">
                                            <FaTrash size={11} />
                                        </button>
                                    </div>
                                </div>

                                {/* Sub-categories Dropdown */}
                                {expandedCatId === cat.id && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-2.5 sm:p-4">
                                        {cat.SubCategories?.length > 0 ? (
                                            <div className="space-y-2">
                                                {cat.SubCategories.map((sub) => (
                                                    <div key={sub.id} className="flex items-center justify-between bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl border border-gray-100 shadow-2xs gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 shrink-0"></span>
                                                            <span className="font-semibold text-gray-700 text-xs sm:text-sm truncate">{sub.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                onClick={() => handleSubEdit(sub, cat.id)}
                                                                className="text-[11px] sm:text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg transition-colors"
                                                            >
                                                                <FaEdit size={10} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleSubDelete(sub.id)}
                                                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                                                            >
                                                                <FaTrash size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-xs sm:text-sm text-center py-2 italic">No sub-categories yet. Add one above.</p>
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
