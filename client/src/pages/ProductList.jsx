import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLocation, Link } from 'react-router-dom';
import { FaFilter, FaSortAmountDown, FaTimes } from 'react-icons/fa';

import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const categoryId = query.get('category');
    const search = query.get('search');

    const [categories, setCategories] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let params = [];
                if (categoryId) params.push(`categoryId=${categoryId}`);
                if (search) params.push(`search=${encodeURIComponent(search)}`);
                if (minPrice) params.push(`minPrice=${minPrice}`);
                if (maxPrice) params.push(`maxPrice=${maxPrice}`);
                if (sortBy) params.push(`sortBy=${sortBy}`);

                const queryString = params.length > 0 ? `?${params.join('&')}` : '';
                const res = await api.get(`/products${queryString}`);
                setProducts(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId, search, minPrice, maxPrice, sortBy]);

    // Removed early return to allow skeleton grid to render in-place

    return (
        <div className="pb-16 relative">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-20 py-2">
                <h2 className="text-lg md:text-2xl font-bold">
                    {categoryId ? 'Category Products' : search ? `Search: "${search}"` : 'All Products'}
                </h2>

                <div className="flex gap-2">
                    <select 
                        className="text-xs border rounded-full px-3 py-1 bg-gray-50 outline-none"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort By</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1 text-sm ${showFilters ? 'bg-[#3c006b] text-white' : 'bg-gray-100'} px-3 py-1 rounded-full transition-colors`}
                    >
                        <FaFilter /> Filter
                    </button>
                </div>
            </div>

            {/* Filter Drawer/Overlay */}
            {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top duration-300">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price Range</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" placeholder="Min" 
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <input 
                                type="number" placeholder="Max" 
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                                value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categories</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <Link 
                                    key={cat.id} 
                                    to={`/products?category=${cat.id}`}
                                    className={`text-xs px-3 py-1 rounded-full border ${categoryId === cat.id.toString() ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-gray-200'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-end justify-end">
                        <button 
                            onClick={() => { setMinPrice(''); setMaxPrice(''); setSortBy(''); }}
                            className="text-xs text-red-500 font-bold hover:underline"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {[...Array(10)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-500">No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {products.map(prod => (
                        <div key={prod.id} className="flex justify-center">
                            <ProductCard product={prod} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
