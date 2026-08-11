import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { toast } from 'react-toastify';
import {
    FaTrash, FaEdit, FaPlus, FaBoxOpen, FaArrowLeft, FaImage, FaCheck,
    FaInfoCircle, FaDollarSign, FaBoxes, FaSlidersH, FaMagic, FaList,
    FaUtensils, FaAppleAlt, FaCertificate, FaTruck, FaSearch, FaFileExport
} from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageHelper';

const ICON_OPTIONS = ['FaLeaf', 'FaShieldAlt', 'FaCheckCircle', 'FaTruck', 'FaAward', 'FaBox', 'FaStar', 'FaHeart', 'FaCertificate', 'FaMedal'];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [view, setView] = useState('LIST'); // LIST, FORM
    const [activeTab, setActiveTab] = useState('general'); // general, pricing, inventory, media, highlights, specs, content, nutrition, certs, delivery, seo
    const [editingId, setEditingId] = useState(null);

    // Core Form State
    const [formData, setFormData] = useState({
        name: '', slug: '', shortName: '', sku: '', barcode: '', brand: '',
        shortDescription: '', description: '', price: '', mrp: '', costPrice: '',
        offerPercentage: '', gstPercentage: 0, taxStatus: 'Taxable', weight: '',
        stock: 0, lowStockAlert: 5, minOrderQuantity: 1, maxOrderQuantity: 10,
        trackInventory: true, stockStatus: 'In Stock', warehouseLocation: '',
        categoryId: '', subCategoryId: '', videoUrl: '',
        isFeatured: false, isNewArrival: false, isBestSeller: false, isRecommended: false, isTrending: false,
        status: 'Published', visibility: 'Public',
        deliveryTime: '2-3 Business Days', shippingMethod: 'Standard Courier',
        codAvailable: true, expressDelivery: false, returnEligible: true, replacementEligible: true,
        metaTitle: '', metaDescription: '', metaKeywords: '',
    });

    // Repeatable Arrays / Relational Sub-states
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    const [highlights, setHighlights] = useState([]);
    const [specifications, setSpecifications] = useState([]);
    const [badges, setBadges] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [nutrition, setNutrition] = useState([]);

    const [ingredients, setIngredients] = useState([]);
    const [ingredientInput, setIngredientInput] = useState('');
    const [benefits, setBenefits] = useState([]);
    const [benefitInput, setBenefitInput] = useState('');

    // List View Filter State
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [availableSubCategories, setAvailableSubCategories] = useState([]);

    const fetchProducts = async (catId = selectedCategory, subCatId = selectedSubCategory, search = searchQuery) => {
        try {
            const params = new URLSearchParams();
            if (catId) params.append('categoryId', catId);
            if (subCatId) params.append('subCategoryId', subCatId);
            if (search) params.append('search', search);

            const queryString = params.toString();
            const url = queryString ? `/products?${queryString}` : '/products';

            const res = await adminApi.get(url);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await adminApi.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleCategoryFilterChange = (e) => {
        const catId = e.target.value;
        setSelectedCategory(catId);
        setSelectedSubCategory('');

        if (catId) {
            const cat = categories.find(c => c.id == catId);
            setAvailableSubCategories(cat?.SubCategories || []);
        } else {
            setAvailableSubCategories([]);
        }

        fetchProducts(catId, '', searchQuery);
    };

    const handleSubCategoryFilterChange = (e) => {
        const subCatId = e.target.value;
        setSelectedSubCategory(subCatId);
        fetchProducts(selectedCategory, subCatId, searchQuery);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        fetchProducts(selectedCategory, selectedSubCategory, val);
    };

    const handleResetFilters = () => {
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSearchQuery('');
        setAvailableSubCategories([]);
        fetchProducts('', '', '');
    };

    useEffect(() => {
        if (formData.categoryId) {
            const cat = categories.find(c => c.id == formData.categoryId);
            setSubCategories(cat?.SubCategories || []);
        } else {
            setSubCategories([]);
        }
    }, [formData.categoryId, categories]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        let newFormData = { ...formData, [name]: val };

        if (name === 'mrp' || name === 'offerPercentage') {
            const mrp = name === 'mrp' ? parseFloat(value) : parseFloat(formData.mrp);
            const offer = name === 'offerPercentage' ? parseFloat(value) : parseFloat(formData.offerPercentage);
            if (!isNaN(mrp) && !isNaN(offer) && mrp > 0) {
                newFormData.price = (mrp - (mrp * offer / 100)).toFixed(2);
            }
        } else if (name === 'price') {
            const mrp = parseFloat(formData.mrp);
            const price = parseFloat(value);
            if (!isNaN(mrp) && !isNaN(price) && mrp > 0) {
                newFormData.offerPercentage = (((mrp - price) / mrp) * 100).toFixed(2);
            }
        }

        setFormData(newFormData);
    };

    const handleEdit = async (product) => {
        try {
            // Fetch full relational details
            const res = await adminApi.get(`/products/${product.id}`);
            const p = res.data;

            setEditingId(p.id);
            setFormData({
                name: p.name || '',
                slug: p.slug || '',
                shortName: p.shortName || '',
                sku: p.sku || '',
                barcode: p.barcode || '',
                brand: p.brand || '',
                shortDescription: p.shortDescription || '',
                description: p.description || '',
                price: p.price || '',
                mrp: p.mrp || '',
                costPrice: p.costPrice || '',
                offerPercentage: p.offerPercentage || '',
                gstPercentage: p.gstPercentage || 0,
                taxStatus: p.taxStatus || 'Taxable',
                weight: p.weight || '',
                stock: p.stock || 0,
                lowStockAlert: p.lowStockAlert || 5,
                minOrderQuantity: p.minOrderQuantity || 1,
                maxOrderQuantity: p.maxOrderQuantity || 10,
                trackInventory: p.trackInventory !== false,
                stockStatus: p.stockStatus || 'In Stock',
                warehouseLocation: p.warehouseLocation || '',
                categoryId: p.SubCategory?.categoryId || '',
                subCategoryId: p.subCategoryId || '',
                videoUrl: p.videoUrl || '',
                isFeatured: p.isFeatured || false,
                isNewArrival: p.isNewArrival || false,
                isBestSeller: p.isBestSeller || false,
                isRecommended: p.isRecommended || false,
                isTrending: p.isTrending || false,
                status: p.status || 'Published',
                visibility: p.visibility || 'Public',
                deliveryTime: p.deliveryTime || '2-3 Business Days',
                shippingMethod: p.shippingMethod || 'Standard Courier',
                codAvailable: p.codAvailable !== false,
                expressDelivery: p.expressDelivery || false,
                returnEligible: p.returnEligible !== false,
                replacementEligible: p.replacementEligible !== false,
                metaTitle: p.metaTitle || '',
                metaDescription: p.metaDescription || '',
                metaKeywords: p.metaKeywords || '',
            });

            setExistingImages(p.images || []);
            setTags(p.tags || []);
            setIngredients(p.ingredients || []);
            setBenefits(p.benefits || []);
            setHighlights(p.highlights || []);
            setSpecifications(p.specifications || []);
            setBadges(p.badges || []);
            setCertifications(p.certifications || []);
            setNutrition(p.nutrition || []);
            setImages([]);

            setActiveTab('general');
            setView('FORM');
        } catch (error) {
            toast.error("Failed to load product details");
        }
    };

    const handleCreateNew = () => {
        setEditingId(null);
        setFormData({
            name: '', slug: '', shortName: '', sku: '', barcode: '', brand: '',
            shortDescription: '', description: '', price: '', mrp: '', costPrice: '',
            offerPercentage: '', gstPercentage: 0, taxStatus: 'Taxable', weight: '',
            stock: 0, lowStockAlert: 5, minOrderQuantity: 1, maxOrderQuantity: 10,
            trackInventory: true, stockStatus: 'In Stock', warehouseLocation: '',
            categoryId: '', subCategoryId: '', videoUrl: '',
            isFeatured: false, isNewArrival: false, isBestSeller: false, isRecommended: false, isTrending: false,
            status: 'Published', visibility: 'Public',
            deliveryTime: '2-3 Business Days', shippingMethod: 'Standard Courier',
            codAvailable: true, expressDelivery: false, returnEligible: true, replacementEligible: true,
            metaTitle: '', metaDescription: '', metaKeywords: '',
        });
        setExistingImages([]);
        setImages([]);
        setTags([]);
        setIngredients([]);
        setBenefits([]);
        setHighlights([
            { icon: 'FaLeaf', title: '100% Natural', description: 'Sourced directly from farms' },
            { icon: 'FaShieldAlt', title: 'Quality Assured', description: 'Strict quality inspection' }
        ]);
        setSpecifications([
            { groupName: 'General Specifications', specKey: 'Country of Origin', specValue: 'India' },
            { groupName: 'General Specifications', specKey: 'Shelf Life', specValue: '12 Months' }
        ]);
        setBadges([{ badgeText: 'Organic', color: '#10b981' }]);
        setCertifications([{ title: 'FSSAI Certified', certificateNumber: '100123456789' }]);
        setNutrition([]);
        setActiveTab('general');
        setView('FORM');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('existingImages', JSON.stringify(existingImages));
        data.append('tags', JSON.stringify(tags));
        data.append('ingredients', JSON.stringify(ingredients));
        data.append('benefits', JSON.stringify(benefits));

        data.append('highlights', JSON.stringify(highlights));
        data.append('specifications', JSON.stringify(specifications));
        data.append('badges', JSON.stringify(badges));
        data.append('certifications', JSON.stringify(certifications));
        data.append('nutrition', JSON.stringify(nutrition));

        for (let i = 0; i < images.length; i++) {
            data.append('images', images[i]);
        }

        try {
            if (editingId) {
                await adminApi.put(`/products/${editingId}`, data);
                toast.success("Product updated successfully!");
            } else {
                await adminApi.post('/products', data);
                toast.success("Product created successfully!");
            }

            setView('LIST');
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save product");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await adminApi.delete(`/products/${id}`);
            toast.success("Product deleted");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await adminApi.get('/products/export/csv', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'products_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Failed to export products CSV");
        }
    };

    return (
        <div className="space-y-6 text-slate-800">
            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Master Management</h1>
                    <p className="text-xs text-slate-500 font-medium">Manage product details, pricing, media, specifications, highlights &amp; certifications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs"
                    >
                        <FaFileExport /> Export CSV
                    </button>
                    {view === 'LIST' ? (
                        <button
                            onClick={handleCreateNew}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-200 transition-all"
                        >
                            <FaPlus /> Create Product
                        </button>
                    ) : (
                        <button
                            onClick={() => setView('LIST')}
                            className="px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            <FaArrowLeft /> Back to List
                        </button>
                    )}
                </div>
            </div>

            {/* View Switching */}
            {view === 'LIST' ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Filter & Search Bar */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                                Products ({products.length})
                            </span>
                            {(selectedCategory || selectedSubCategory || searchQuery) && (
                                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Filtered
                                </span>
                            )}
                        </div>

                        {/* Filter Inputs */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            {/* Search Input */}
                            <div className="relative min-w-[180px]">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                <input
                                    type="text"
                                    placeholder="Search by name, SKU..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                                />
                            </div>

                            {/* Category Filter Dropdown */}
                            <select
                                value={selectedCategory}
                                onChange={handleCategoryFilterChange}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>

                            {/* Sub-Category Filter Dropdown */}
                            <select
                                value={selectedSubCategory}
                                onChange={handleSubCategoryFilterChange}
                                disabled={!selectedCategory}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 disabled:bg-slate-100"
                            >
                                <option value="">All Sub-Categories</option>
                                {availableSubCategories.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>

                            {/* Reset Filters Button */}
                            {(selectedCategory || selectedSubCategory || searchQuery) && (
                                <button
                                    onClick={handleResetFilters}
                                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                                <tr>
                                    <th className="p-4">Product</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Price / MRP</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4">Badges &amp; Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">No products found. Click 'Create Product' to add one.</td>
                                    </tr>
                                ) : (
                                    products.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                                    {p.images?.[0] ? (
                                                        <img src={getImageUrl(p.images[0])} alt={p.name} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300"><FaImage /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-sm leading-snug">{p.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'} | Brand: {p.brand || 'Generic'}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-slate-700">{p.SubCategory?.Category?.name || 'Uncategorized'}</div>
                                                <div className="text-[11px] text-slate-400">{p.SubCategory?.name}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-extrabold text-slate-900">₹{p.price}</div>
                                                {p.mrp && <div className="text-[11px] text-slate-400 line-through">₹{p.mrp}</div>}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${p.stock > 5 ? 'bg-emerald-100 text-emerald-700' : p.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {p.stock} in stock
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {p.isBestSeller && <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded">Best Seller</span>}
                                                    {p.isFeatured && <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded">Featured</span>}
                                                    <span className="bg-slate-200 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded">{p.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEdit(p)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-bold" title="Edit Product"><FaEdit /></button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold" title="Delete Product"><FaTrash /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Studio Tabbed Form View */
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                    {/* Studio Tabs Navigation */}
                    <div className="flex border-b border-slate-200 bg-slate-900 text-white overflow-x-auto scrollbar-none">
                        {[
                            { id: 'general', name: 'General Info', icon: FaInfoCircle },
                            { id: 'pricing', name: 'Pricing & GST', icon: FaDollarSign },
                            { id: 'inventory', name: 'Inventory & Stock', icon: FaBoxes },
                            { id: 'media', name: 'Media Gallery', icon: FaImage },
                            { id: 'highlights', name: 'Highlights', icon: FaMagic },
                            { id: 'specs', name: 'Specifications', icon: FaList },
                            { id: 'content', name: 'Ingredients & Benefits', icon: FaUtensils },
                            { id: 'nutrition', name: 'Nutrition Facts', icon: FaAppleAlt },
                            { id: 'certs', name: 'Badges & Certs', icon: FaCertificate },
                            { id: 'delivery', name: 'Delivery & Policy', icon: FaTruck },
                            { id: 'seo', name: 'SEO Metadata', icon: FaSearch },
                        ].map((t) => {
                            const IconComp = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-4 py-3.5 text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all border-b-2 ${
                                        activeTab === t.id
                                            ? 'border-indigo-400 text-indigo-400 bg-slate-800'
                                            : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <IconComp /> {t.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Studio Tab Content */}
                    <div className="p-6 md:p-8 space-y-6">

                        {/* TAB 1: General Info */}
                        {activeTab === 'general' && (
                            <div className="space-y-4 text-xs">
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">General Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Product Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Extra Virgin Cold Pressed Coconut Oil" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">URL Slug</label>
                                        <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} placeholder="extra-virgin-coconut-oil" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-indigo-500 font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Brand Name</label>
                                        <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g. OrganicIndia" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Category &amp; Subcategory *</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold">
                                                <option value="">Select Category...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <select name="subCategoryId" value={formData.subCategoryId} onChange={handleInputChange} required className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold">
                                                <option value="">Select Subcategory...</option>
                                                {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Short Description (Summary)</label>
                                    <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} placeholder="100% pure cold pressed unrefined oil..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
                                </div>

                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Full Detailed Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder="Enter rich product details..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">SKU</label>
                                        <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="SKU-COCO-500" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Barcode / EAN</label>
                                        <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="890123456789" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Status &amp; Visibility</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <select name="status" value={formData.status} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold">
                                                <option value="Published">Published</option>
                                                <option value="Draft">Draft</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                            <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold">
                                                <option value="Public">Public</option>
                                                <option value="Hidden">Hidden</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-3 mt-3">
                                    <label className="block text-slate-600 font-bold mb-2">Merchandising Flags</label>
                                    <div className="flex flex-wrap gap-4 font-semibold text-slate-700">
                                        <label className="flex items-center gap-2"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Featured</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Best Seller</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> New Arrival</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="isRecommended" checked={formData.isRecommended} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Recommended</label>
                                        <label className="flex items-center gap-2"><input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Trending</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Pricing & GST */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-4 text-xs">
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Pricing &amp; Taxation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">MRP (Maximum Retail Price) ₹</label>
                                        <input type="number" step="0.01" name="mrp" value={formData.mrp} onChange={handleInputChange} placeholder="120.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Selling Price ₹ *</label>
                                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required placeholder="100.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-indigo-600 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Cost Price ₹ (Internal)</label>
                                        <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleInputChange} placeholder="65.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Discount %</label>
                                        <input type="number" step="0.01" name="offerPercentage" value={formData.offerPercentage} onChange={handleInputChange} placeholder="16.67" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">GST Percentage %</label>
                                        <input type="number" step="0.01" name="gstPercentage" value={formData.gstPercentage} onChange={handleInputChange} placeholder="5" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Taxability Status</label>
                                        <select name="taxStatus" value={formData.taxStatus} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold">
                                            <option value="Taxable">Taxable (GST Applies)</option>
                                            <option value="Exempt">Exempt</option>
                                            <option value="Zero-Rated">Zero-Rated</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: Inventory */}
                        {activeTab === 'inventory' && (
                            <div className="space-y-4 text-xs">
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Inventory &amp; Stock Controls</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Available Stock Count *</label>
                                        <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required placeholder="50" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Low Stock Warning Threshold</label>
                                        <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleInputChange} placeholder="5" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Stock Availability Status</label>
                                        <select name="stockStatus" value={formData.stockStatus} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold">
                                            <option value="In Stock">In Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                            <option value="Pre-Order">Pre-Order</option>
                                            <option value="Backorder">Backorder</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Min Order Qty per Customer</label>
                                        <input type="number" name="minOrderQuantity" value={formData.minOrderQuantity} onChange={handleInputChange} placeholder="1" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Max Order Qty per Customer</label>
                                        <input type="number" name="maxOrderQuantity" value={formData.maxOrderQuantity} onChange={handleInputChange} placeholder="10" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Warehouse Location</label>
                                        <input type="text" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleInputChange} placeholder="Rack B-12, Whse 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: Media Gallery */}
                        {activeTab === 'media' && (
                            <div className="space-y-4 text-xs">
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Media &amp; Gallery</h3>
                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Upload New Images</label>
                                    <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 font-medium" />
                                </div>

                                {existingImages.length > 0 && (
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-2">Existing Images</label>
                                        <div className="flex flex-wrap gap-3">
                                            {existingImages.map((img, idx) => (
                                                <div key={idx} className="relative w-20 h-20 rounded-xl border border-slate-200 bg-white p-1 overflow-hidden group">
                                                    <img src={getImageUrl(img)} alt="Product" className="w-full h-full object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                                                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full text-[10px]"
                                                        title="Remove Image"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Product Video URL (YouTube / MP4)</label>
                                    <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono" />
                                </div>
                            </div>
                        )}

                        {/* TAB 5: Dynamic Highlights */}
                        {activeTab === 'highlights' && (
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Dynamic Product Highlights &amp; Trust Cards</h3>
                                    <button
                                        type="button"
                                        onClick={() => setHighlights([...highlights, { icon: 'FaLeaf', title: 'New Highlight', description: '' }])}
                                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                                    >
                                        <FaPlus /> Add Highlight
                                    </button>
                                </div>

                                {highlights.map((h, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <select
                                            value={h.icon}
                                            onChange={(e) => {
                                                const next = [...highlights];
                                                next[idx].icon = e.target.value;
                                                setHighlights(next);
                                            }}
                                            className="bg-white border border-slate-200 rounded-lg p-2 font-mono font-bold"
                                        >
                                            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            value={h.title}
                                            onChange={(e) => {
                                                const next = [...highlights];
                                                next[idx].title = e.target.value;
                                                setHighlights(next);
                                            }}
                                            placeholder="Title (e.g. 100% Organic)"
                                            className="flex-1 bg-white border border-slate-200 rounded-lg p-2 font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={h.description || ''}
                                            onChange={(e) => {
                                                const next = [...highlights];
                                                next[idx].description = e.target.value;
                                                setHighlights(next);
                                            }}
                                            placeholder="Description (e.g. Chemical free processing)"
                                            className="flex-1 bg-white border border-slate-200 rounded-lg p-2"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setHighlights(highlights.filter((_, i) => i !== idx))}
                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB 6: Technical Specifications */}
                        {activeTab === 'specs' && (
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Technical Specifications</h3>
                                    <button
                                        type="button"
                                        onClick={() => setSpecifications([...specifications, { groupName: 'General Specifications', specKey: '', specValue: '' }])}
                                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                                    >
                                        <FaPlus /> Add Spec
                                    </button>
                                </div>

                                {specifications.map((s, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center">
                                        <input
                                            type="text"
                                            value={s.groupName || 'General Specifications'}
                                            onChange={(e) => {
                                                const next = [...specifications];
                                                next[idx].groupName = e.target.value;
                                                setSpecifications(next);
                                            }}
                                            placeholder="Group (e.g. Technical)"
                                            className="bg-white border border-slate-200 rounded-lg p-2 font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={s.specKey || s.key || ''}
                                            onChange={(e) => {
                                                const next = [...specifications];
                                                next[idx].specKey = e.target.value;
                                                setSpecifications(next);
                                            }}
                                            placeholder="Key (e.g. Shelf Life)"
                                            className="bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={s.specValue || s.value || ''}
                                                onChange={(e) => {
                                                    const next = [...specifications];
                                                    next[idx].specValue = e.target.value;
                                                    setSpecifications(next);
                                                }}
                                                placeholder="Value (e.g. 12 Months)"
                                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSpecifications(specifications.filter((_, i) => i !== idx))}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB 7: Ingredients & Health Benefits */}
                        {activeTab === 'content' && (
                            <div className="space-y-6 text-xs">
                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2">Ingredients List</h3>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={ingredientInput}
                                            onChange={(e) => setIngredientInput(e.target.value)}
                                            placeholder="Enter ingredient (e.g. Cold Pressed Coconut Extract)"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (ingredientInput.trim()) {
                                                    setIngredients([...ingredients, ingredientInput.trim()]);
                                                    setIngredientInput('');
                                                }
                                            }}
                                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {ingredients.map((ing, idx) => (
                                            <span key={idx} className="bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-2">
                                                {ing}
                                                <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="text-rose-500 font-bold">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-2">Health Benefits</h3>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={benefitInput}
                                            onChange={(e) => setBenefitInput(e.target.value)}
                                            placeholder="Enter benefit (e.g. Rich in Lauric Acid)"
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (benefitInput.trim()) {
                                                    setBenefits([...benefits, benefitInput.trim()]);
                                                    setBenefitInput('');
                                                }
                                            }}
                                            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <ul className="space-y-1.5 font-medium text-slate-700">
                                        {benefits.map((ben, idx) => (
                                            <li key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                                <span>• {ben}</span>
                                                <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))} className="text-rose-500 font-bold">&times;</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* TAB 8: Nutrition Facts */}
                        {activeTab === 'nutrition' && (
                            <div className="space-y-4 text-xs">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Nutrition Facts Table</h3>
                                    <button
                                        type="button"
                                        onClick={() => setNutrition([...nutrition, { nutrient: '', amount: '', dailyValue: '' }])}
                                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                                    >
                                        <FaPlus /> Add Nutrient
                                    </button>
                                </div>

                                {nutrition.map((n, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl items-center">
                                        <input
                                            type="text"
                                            value={n.nutrient}
                                            onChange={(e) => {
                                                const next = [...nutrition];
                                                next[idx].nutrient = e.target.value;
                                                setNutrition(next);
                                            }}
                                            placeholder="Nutrient (e.g. Energy, Protein)"
                                            className="bg-white border border-slate-200 rounded-lg p-2 font-bold"
                                        />
                                        <input
                                            type="text"
                                            value={n.amount}
                                            onChange={(e) => {
                                                const next = [...nutrition];
                                                next[idx].amount = e.target.value;
                                                setNutrition(next);
                                            }}
                                            placeholder="Amount (e.g. 899 kcal)"
                                            className="bg-white border border-slate-200 rounded-lg p-2 font-semibold"
                                        />
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={n.dailyValue || ''}
                                                onChange={(e) => {
                                                    const next = [...nutrition];
                                                    next[idx].dailyValue = e.target.value;
                                                    setNutrition(next);
                                                }}
                                                placeholder="% Daily Value (e.g. 45%)"
                                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNutrition(nutrition.filter((_, i) => i !== idx))}
                                                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB 9: Badges & Certifications */}
                        {activeTab === 'certs' && (
                            <div className="space-y-6 text-xs">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Custom Product Badges</h3>
                                        <button
                                            type="button"
                                            onClick={() => setBadges([...badges, { badgeText: 'Organic', color: '#10b981' }])}
                                            className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                                        >
                                            <FaPlus /> Add Badge
                                        </button>
                                    </div>
                                    {badges.map((b, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                                            <input
                                                type="text"
                                                value={b.badgeText || b.text || ''}
                                                onChange={(e) => {
                                                    const next = [...badges];
                                                    next[idx].badgeText = e.target.value;
                                                    setBadges(next);
                                                }}
                                                placeholder="Badge Text (e.g. Organic)"
                                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2 font-bold"
                                            />
                                            <input
                                                type="color"
                                                value={b.color || '#10b981'}
                                                onChange={(e) => {
                                                    const next = [...badges];
                                                    next[idx].color = e.target.value;
                                                    setBadges(next);
                                                }}
                                                className="w-10 h-9 bg-white border border-slate-200 rounded-lg cursor-pointer"
                                            />
                                            <button type="button" onClick={() => setBadges(badges.filter((_, i) => i !== idx))} className="p-2 text-rose-600"><FaTrash /></button>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Quality Certifications</h3>
                                        <button
                                            type="button"
                                            onClick={() => setCertifications([...certifications, { title: 'FSSAI License', certificateNumber: '' }])}
                                            className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                                        >
                                            <FaPlus /> Add Certification
                                        </button>
                                    </div>
                                    {certifications.map((c, idx) => (
                                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 items-center">
                                            <input
                                                type="text"
                                                value={c.title}
                                                onChange={(e) => {
                                                    const next = [...certifications];
                                                    next[idx].title = e.target.value;
                                                    setCertifications(next);
                                                }}
                                                placeholder="Title (e.g. FSSAI Certified)"
                                                className="bg-white border border-slate-200 rounded-lg p-2 font-bold"
                                            />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={c.certificateNumber || ''}
                                                    onChange={(e) => {
                                                        const next = [...certifications];
                                                        next[idx].certificateNumber = e.target.value;
                                                        setCertifications(next);
                                                    }}
                                                    placeholder="License / Certificate No."
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 font-mono"
                                                />
                                                <button type="button" onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))} className="p-2 text-rose-600"><FaTrash /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 10: Delivery & Policy */}
                        {activeTab === 'delivery' && (
                            <div className="space-y-4 text-xs">
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Delivery &amp; Customer Policies</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Estimated Delivery Timeframe</label>
                                        <input type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleInputChange} placeholder="e.g. 10 Min Delivery or 2-3 Days" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-slate-600 font-bold mb-1">Shipping Method</label>
                                        <input type="text" name="shippingMethod" value={formData.shippingMethod} onChange={handleInputChange} placeholder="e.g. Express Courier" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 font-semibold text-slate-700">
                                    <label className="flex items-center gap-2"><input type="checkbox" name="codAvailable" checked={formData.codAvailable} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> COD Available</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="expressDelivery" checked={formData.expressDelivery} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Express Delivery</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="returnEligible" checked={formData.returnEligible} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Return Eligible</label>
                                    <label className="flex items-center gap-2"><input type="checkbox" name="replacementEligible" checked={formData.replacementEligible} onChange={handleInputChange} className="w-4 h-4 accent-indigo-600" /> Replacement Eligible</label>
                                </div>
                            </div>
                        )}

                        {/* TAB 11: SEO */}
                        {activeTab === 'seo' && (
                            <div className="space-y-4 text-xs">
                                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">SEO Metadata Settings</h3>
                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Meta Title</label>
                                    <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleInputChange} placeholder="Buy Pure Cold Pressed Coconut Oil Online" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                </div>
                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Meta Description</label>
                                    <textarea name="metaDescription" value={formData.metaDescription} onChange={handleInputChange} rows={3} placeholder="Experience the pure essence of unrefined cold pressed oil..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                </div>
                                <div>
                                    <label className="block text-slate-600 font-bold mb-1">Meta Keywords (Comma Separated)</label>
                                    <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleInputChange} placeholder="coconut oil, cold pressed, organic, pure oil" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium" />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Studio Footer Action Bar */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <button type="button" onClick={() => setView('LIST')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs">
                            Cancel
                        </button>
                        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-200 flex items-center gap-2">
                            <FaCheck /> {editingId ? 'Save & Update Product' : 'Create Product Master'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Products;
