import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategories } from '../context/CategoryContext';
import { FaSearch, FaShoppingCart, FaUser, FaChevronDown, FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';
import api from '../services/api';

const Navbar = ({ onCartClick }) => {
    const { currentUser } = useAuth();
    const { itemCount } = useCart();
    const { categories } = useCategories();
    const navigate = useNavigate();
    const location = useLocation();

    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const debounceRef = useRef(null);

    // Desktop hover state with delay to prevent flickering
    const [hoveredCatId, setHoveredCatId] = useState(null);
    const hoverTimeoutRef = useRef(null);

    // Mobile accordion expand state
    const [expandedMobileCatId, setExpandedMobileCatId] = useState(null);

    const queryParams = new URLSearchParams(location.search);
    const currentCategoryQuery = queryParams.get('category');
    const currentSubCategoryQuery = queryParams.get('subcategory');

    const isAllActive = location.pathname === '/';

    const isCategoryActive = (catId) => {
        return location.pathname === '/products' && currentCategoryQuery?.toString() === catId.toString();
    };

    const handleMouseEnterCat = (catId) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setHoveredCatId(catId);
    };

    const handleMouseLeaveCat = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCatId(null);
        }, 150);
    };

    const toggleMobileCat = (catId) => {
        setExpandedMobileCatId(prev => prev === catId ? null : catId);
    };

    // Debounced fetch suggestions
    const fetchSuggestions = useCallback((query) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoadingSuggestions(true);
            try {
                const res = await api.get(`/products?search=${encodeURIComponent(query.trim())}`);
                setSuggestions(res.data.slice(0, 6)); // max 6 suggestions
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 300);
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchSuggestions(val);
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        const trimmed = search.trim();
        if (!trimmed) return;
        setShowSuggestions(false);
        setSuggestions([]);
        navigate(`/products?search=${encodeURIComponent(trimmed)}`);
        setSearch('');
    };

    const handleSuggestionClick = (productId) => {
        setShowSuggestions(false);
        setSuggestions([]);
        setSearch('');
        navigate(`/product/${productId}`);
    };

    // Close suggestions when clicking outside both desktop & mobile search inputs
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isInsideDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(e.target);
            const isInsideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
            if (!isInsideDesktop && !isInsideMobile) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    const SuggestionDropdown = () => {
        if (!showSuggestions) return null;

        return (
            <>
                {/* Mobile backdrop to dismiss search on tap outside */}
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[180] md:hidden"
                    onClick={() => setShowSuggestions(false)}
                />

                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden max-h-[60vh] md:max-h-[400px] overflow-y-auto">
                    {loadingSuggestions ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#3c006b]"></div>
                            <span className="ml-3 text-sm text-gray-400 font-medium">Searching products...</span>
                        </div>
                    ) : suggestions.length === 0 ? (
                        <div className="py-8 text-center px-4">
                            <div className="text-2xl mb-1">🔍</div>
                            <p className="text-sm font-semibold text-gray-700">No products found</p>
                            <p className="text-xs text-gray-400 mt-0.5">Try searching with a different keyword</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                                Suggestions ({suggestions.length})
                            </div>
                            {suggestions.map((product, idx) => {
                                const price = parseFloat(product.price);
                                const mrp = Math.round(price * 1.2);
                                return (
                                    <button
                                        type="button"
                                        key={product.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSuggestionClick(product.id);
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSuggestionClick(product.id);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50/60 active:bg-purple-100/60 transition-colors text-left ${idx > 0 ? 'border-t border-gray-50' : ''}`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100 p-1">
                                            {product.images?.[0] ? (
                                                <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                            ) : (
                                                <span className="text-gray-300 text-[10px]">N/A</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{product.shortDescription || product.description || '1 pack'}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-sm font-extrabold text-[#1a7428]">₹{price}</div>
                                            <div className="text-[10px] text-gray-400 line-through">₹{mrp}</div>
                                        </div>
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSearch(e);
                                }}
                                onClick={handleSearch}
                                className="w-full py-3 text-center text-xs font-extrabold text-[#3c006b] bg-purple-50/80 hover:bg-purple-100 transition-colors border-t border-gray-100 flex items-center justify-center gap-1.5"
                            >
                                <FaSearch className="text-[11px]" />
                                <span>View all results for "{search}"</span>
                            </button>
                        </>
                    )}
                </div>
            </>
        );
    };

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-xs">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-100">
                <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">

                    {/* Left: Logo + Brand Name */}
                    <div className="flex items-center shrink-0">
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <img src="/logo.png" alt="BlueAgle" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg object-contain" />
                            <span className="text-xl sm:text-2xl font-extrabold text-[#3c006b] tracking-tight block">
                                Blue<span className="text-[#ff3269]">Agle</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center: Search Bar (Desktop) */}
                    <form onSubmit={handleSearch} className="flex-grow max-w-2xl hidden md:flex relative" ref={desktopSearchRef}>
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                            <FaSearch className="text-gray-400 text-sm" />
                        </div>
                        <input
                            type="text"
                            placeholder='Search for oils, groundnuts, combos...'
                            className="w-full bg-gray-50 border border-gray-200 focus:border-[#3c006b] text-gray-900 text-sm rounded-xl block pl-10 pr-10 p-2.5 focus:outline-none focus:bg-white shadow-xs transition-all"
                            value={search}
                            onChange={handleSearchChange}
                            onFocus={() => { if (suggestions.length > 0 || search.trim()) setShowSuggestions(true); }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); }}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 z-10"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        )}
                        <SuggestionDropdown />
                    </form>

                    {/* Right: Auth & Cart */}
                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        {currentUser ? (
                            <Link to="/profile" className="hidden md:flex flex-col items-center text-gray-600 hover:text-[#3c006b]">
                                <FaUser className="text-xl mb-1" />
                                <span className="text-xs font-bold">Profile</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="hidden md:block font-bold text-gray-600 hover:text-[#3c006b]">Login</Link>
                        )}

                        {/* Cart: Icon only on mobile, Icon + text on desktop */}
                        <button
                            onClick={onCartClick}
                            className="flex flex-col items-center justify-center text-gray-700 hover:text-[#3c006b] relative p-1.5 md:p-0 transition-colors"
                            aria-label="Shopping Cart"
                        >
                            <div className="relative flex items-center justify-center">
                                <FaShoppingCart className="text-xl sm:text-2xl md:text-xl md:mb-1 text-[#3c006b]" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2.5 bg-[#ff3269] text-white text-[9px] font-black min-w-[17px] h-[17px] rounded-full flex items-center justify-center px-1 shadow-xs">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-bold hidden md:block">Cart</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Mobile Search & Categories Nav */}
            <div className="container mx-auto px-2.5 sm:px-4">
                {/* Mobile Search */}
                <div className="md:hidden py-2.5">
                    <div className="relative" ref={mobileSearchRef}>
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                <FaSearch className="text-gray-400 text-sm" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search for items..."
                                className="w-full bg-gray-50 border border-gray-200 focus:border-[#3c006b] rounded-xl py-2 pl-10 pr-10 text-sm font-medium focus:outline-none focus:bg-white shadow-xs transition-all"
                                value={search}
                                onChange={handleSearchChange}
                                onFocus={() => { if (suggestions.length > 0 || search.trim()) setShowSuggestions(true); }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setSuggestions([]); setShowSuggestions(false); }}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 z-10"
                                >
                                    <FaTimes className="text-xs" />
                                </button>
                            )}
                        </form>
                        <SuggestionDropdown />
                    </div>
                </div>

                {/* DESKTOP CATEGORY NAVIGATION (API Driven + Hover Dropdowns) */}
                <div className="hidden md:flex items-center gap-8 py-3 text-sm font-medium text-gray-600 border-b-0">
                    {/* ALL Link */}
                    <Link
                        to="/"
                        className={`flex items-center gap-2 whitespace-nowrap pb-3 -mb-3 transition-colors ${
                            isAllActive
                                ? 'hover:text-[#ff3269] text-[#ff3269] font-extrabold border-b-2 border-[#ff3269]'
                                : 'text-gray-700 hover:text-[#ff3269]'
                        }`}
                    >
                        All
                    </Link>

                    {/* DYNAMIC CATEGORIES FROM API */}
                    {categories.map((cat) => {
                        const active = isCategoryActive(cat.id);
                        const hasSub = cat.SubCategories && cat.SubCategories.length > 0;
                        const isHovered = hoveredCatId === cat.id;

                        return (
                            <div
                                key={cat.id}
                                className="relative group py-3 -my-3"
                                onMouseEnter={() => handleMouseEnterCat(cat.id)}
                                onMouseLeave={handleMouseLeaveCat}
                            >
                                <Link
                                    to={`/products?category=${cat.id}`}
                                    className={`flex items-center gap-1.5 whitespace-nowrap pb-3 -mb-3 transition-colors ${
                                        active
                                            ? 'text-[#ff3269] font-extrabold border-b-2 border-[#ff3269]'
                                            : 'text-gray-700 hover:text-[#ff3269] font-medium'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    {hasSub && (
                                        <FaChevronDown
                                            className={`text-[10px] transition-transform duration-200 ${
                                                isHovered ? 'rotate-180 text-[#ff3269]' : 'text-gray-400'
                                            }`}
                                        />
                                    )}
                                </Link>

                                {/* Subcategory Desktop Hover Dropdown */}
                                {hasSub && isHovered && (
                                    <div
                                        className="absolute top-full left-0 mt-0 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-150"
                                        onMouseEnter={() => handleMouseEnterCat(cat.id)}
                                        onMouseLeave={handleMouseLeaveCat}
                                    >
                                        <div className="px-4 py-2 border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            {cat.name}
                                        </div>
                                        {cat.SubCategories.map((sub) => {
                                            const subActive = active && currentSubCategoryQuery?.toString() === sub.id.toString();
                                            return (
                                                <Link
                                                    key={sub.id}
                                                    to={`/products?category=${cat.id}&subcategory=${sub.id}`}
                                                    onClick={() => setHoveredCatId(null)}
                                                    className={`block px-4 py-2 text-xs font-semibold transition-colors ${
                                                        subActive
                                                            ? 'bg-purple-50 text-[#ff3269] font-bold'
                                                            : 'text-gray-700 hover:bg-purple-50 hover:text-[#3c006b]'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* MOBILE CATEGORY NAVIGATION (Tap Expand / Collapse) */}
                <div className="md:hidden py-2 border-t border-gray-100 flex flex-col gap-1">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        <Link
                            to="/"
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                                isAllActive ? 'bg-[#ff3269] text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            All
                        </Link>
                        {categories.map((cat) => {
                            const active = isCategoryActive(cat.id);
                            const hasSub = cat.SubCategories && cat.SubCategories.length > 0;
                            const isExpanded = expandedMobileCatId === cat.id;

                            return (
                                <div key={cat.id} className="relative shrink-0 flex items-center">
                                    <Link
                                        to={`/products?category=${cat.id}`}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
                                            active
                                                ? 'bg-[#3c006b] text-white font-bold'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                    </Link>
                                    {hasSub && (
                                        <button
                                            onClick={() => toggleMobileCat(cat.id)}
                                            className="p-1.5 text-gray-500 hover:text-gray-800"
                                            title="Toggle Subcategories"
                                        >
                                            <FaChevronDown className={`text-[10px] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile Expanded Subcategories Bar */}
                    {expandedMobileCatId && (() => {
                        const activeCat = categories.find(c => c.id === expandedMobileCatId);
                        if (!activeCat || !activeCat.SubCategories?.length) return null;

                        return (
                            <div className="p-3 bg-purple-50/70 rounded-xl my-1 flex flex-wrap gap-2 border border-purple-100 animate-in fade-in duration-200">
                                <span className="w-full text-[10px] font-bold text-purple-900 uppercase tracking-wider">
                                    {activeCat.name} Subcategories:
                                </span>
                                {activeCat.SubCategories.map(sub => (
                                    <Link
                                        key={sub.id}
                                        to={`/products?category=${activeCat.id}&subcategory=${sub.id}`}
                                        onClick={() => setExpandedMobileCatId(null)}
                                        className="px-2.5 py-1 bg-white hover:bg-purple-100 rounded-lg text-xs font-medium text-gray-700 border border-purple-100"
                                    >
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
