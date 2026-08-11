import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLocation, Link } from 'react-router-dom';
import { FaFilter, FaLayerGroup, FaCheckCircle } from 'react-icons/fa';
import { useCategories } from '../context/CategoryContext';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import KnowledgeHubBanner from '../components/KnowledgeHubBanner';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const categoryId = query.get('category');
    const subCategoryId = query.get('subcategory');
    const search = query.get('search');

    const { categories, getCategoryById } = useCategories();
    const activeCategory = categoryId ? getCategoryById(categoryId) : null;
    const activeSubCategories = activeCategory?.SubCategories || [];

    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let params = [];
                if (categoryId) params.push(`categoryId=${categoryId}`);
                if (subCategoryId) params.push(`subCategoryId=${subCategoryId}`);
                if (search) params.push(`search=${encodeURIComponent(search)}`);
                if (minPrice) params.push(`minPrice=${minPrice}`);
                if (maxPrice) params.push(`maxPrice=${maxPrice}`);
                if (sortBy) params.push(`sortBy=${sortBy}`);

                const queryString = params.length > 0 ? `?${params.join('&')}` : '';
                const res = await api.get(`/products${queryString}`);
                setProducts(res.data);
            } catch (error) {
                console.error('Error fetching products in ProductList:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId, subCategoryId, search, minPrice, maxPrice, sortBy]);

    // Construct Page Title
    let pageTitle = 'All Products';
    if (activeCategory) {
        if (subCategoryId) {
            const subObj = activeSubCategories.find(s => s.id.toString() === subCategoryId.toString());
            pageTitle = subObj ? `${subObj.name} (${activeCategory.name})` : activeCategory.name;
        } else {
            pageTitle = activeCategory.name;
        }
    } else if (search) {
        pageTitle = `Search Results for "${search}"`;
    }

    return (
        <div className="pb-16 relative">
            {/* Header Title & Sorting Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 py-2 border-b border-gray-100">
                <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                        {pageTitle}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                        Showing {products.length} products
                    </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select 
                        className="text-xs border rounded-xl px-3 py-2 bg-gray-50 text-gray-700 font-semibold outline-none focus:ring-2 focus:ring-purple-500/20"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort By: Default</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 text-xs font-bold ${
                            showFilters ? 'bg-[#3c006b] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } px-3 py-2 rounded-xl transition-colors`}
                    >
                        <FaFilter /> Filters
                    </button>
                </div>
            </div>

            {/* TOP SUBCATEGORY SELECTOR (Mobile View Only) */}
            {activeCategory && activeSubCategories.length > 0 && (
                <div className="mb-6 bg-purple-50/50 p-3 rounded-2xl border border-purple-100/80 md:hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <FaLayerGroup className="text-xs text-[#3c006b]" />
                        <span className="text-[11px] font-extrabold text-[#3c006b] uppercase tracking-wider">
                            Select Subcategory
                        </span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
                        {/* "All [Category]" Pill */}
                        <Link
                            to={`/products?category=${categoryId}`}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                !subCategoryId
                                    ? 'bg-[#ff3269] text-white shadow-md shadow-rose-200 scale-[1.02]'
                                    : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-200'
                            }`}
                        >
                            <span>All {activeCategory.name}</span>
                            {!subCategoryId && <FaCheckCircle className="text-[10px]" />}
                        </Link>

                        {/* Subcategory Pills */}
                        {activeSubCategories.map((sub) => {
                            const isSelected = subCategoryId?.toString() === sub.id.toString();
                            return (
                                <Link
                                    key={sub.id}
                                    to={`/products?category=${categoryId}&subcategory=${sub.id}`}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                        isSelected
                                            ? 'bg-[#3c006b] text-white shadow-md shadow-purple-200 scale-[1.02]'
                                            : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-200'
                                    }`}
                                >
                                    <span>{sub.name}</span>
                                    {isSelected && <FaCheckCircle className="text-[10px]" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Price Filter Drawer */}
            {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top duration-200">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price Range (₹)</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" placeholder="Min" 
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                                value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span className="text-gray-400 font-bold">-</span>
                            <input 
                                type="number" placeholder="Max" 
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categories</label>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                            <Link 
                                to="/products"
                                className={`text-xs px-3 py-1 rounded-lg border font-bold ${!categoryId ? 'bg-[#3c006b] text-white border-[#3c006b]' : 'bg-white text-gray-700 border-gray-200'}`}
                            >
                                All Products
                            </Link>
                            {categories.map(cat => (
                                <Link 
                                    key={cat.id} 
                                    to={`/products?category=${cat.id}`}
                                    className={`text-xs px-3 py-1 rounded-lg border font-semibold ${categoryId === cat.id.toString() ? 'bg-purple-100 border-purple-300 text-[#3c006b]' : 'bg-white text-gray-700 border-gray-200'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-end justify-end">
                        <button 
                            onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy(''); }}
                            className="text-xs text-rose-600 font-bold hover:underline"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA: SIDEBAR + PRODUCT GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-6 items-start">
                
                {/* CATEGORY SIDEBAR */}
                {activeCategory && activeSubCategories.length > 0 && (
                    <aside className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hidden md:block sticky top-24">
                        <h3 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider mb-3">
                            {activeCategory.name} Subcategories
                        </h3>
                        <ul className="space-y-1.5 text-xs font-medium">
                            <li>
                                <Link
                                    to={`/products?category=${categoryId}`}
                                    className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                                        !subCategoryId
                                            ? 'bg-rose-50 text-[#ff3269] font-extrabold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>All {activeCategory.name}</span>
                                    {!subCategoryId && <FaCheckCircle className="text-[10px]" />}
                                </Link>
                            </li>
                            {activeSubCategories.map((sub) => {
                                const isSelected = subCategoryId?.toString() === sub.id.toString();
                                return (
                                    <li key={sub.id}>
                                        <Link
                                            to={`/products?category=${categoryId}&subcategory=${sub.id}`}
                                            className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                                                isSelected
                                                    ? 'bg-purple-50 text-[#3c006b] font-extrabold'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span>{sub.name}</span>
                                            {isSelected && <FaCheckCircle className="text-[10px] text-[#3c006b]" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                )}

                {/* PRODUCT GRID */}
                <div className="w-full">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
                            <div className="text-5xl mb-3">🍃</div>
                            <h3 className="text-base font-bold text-gray-800">No products found</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                We couldn't find any products in this subcategory matching your search parameters.
                            </p>
                            <Link
                                to={categoryId ? `/products?category=${categoryId}` : '/products'}
                                className="mt-4 px-4 py-2 bg-[#3c006b] text-white text-xs font-bold rounded-xl hover:bg-purple-900 transition-colors"
                            >
                                View All Category Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,205px))] gap-3 sm:gap-4 md:gap-5 justify-start">
                            {products.map(prod => (
                                <div key={prod.id} className="flex justify-start">
                                    <ProductCard product={prod} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Contextual Internal Link Banner: Knowledge Hub */}
                    <KnowledgeHubBanner />
                </div>

            </div>
        </div>
    );
};

export default ProductList;
