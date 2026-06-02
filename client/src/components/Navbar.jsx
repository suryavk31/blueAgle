import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaSearch, FaShoppingCart, FaUser, FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { getImageUrl } from '../utils/imageHelper';

const Navbar = ({ onCartClick }) => {
    const { currentUser, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
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
                const res = await axios.get(`http://localhost:5000/api/products?search=${encodeURIComponent(query.trim())}`);
                setSuggestions(res.data.slice(0, 6)); // max 6 suggestions
                setShowSuggestions(true);
            } catch (err) {
                console.error(err);
                setSuggestions([]);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 300); // 300ms debounce
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchSuggestions(val);
    };

    const handleSearch = (e) => {
        e.preventDefault();
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

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const SuggestionDropdown = () => {
        if (!showSuggestions) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] overflow-hidden max-h-[400px] overflow-y-auto">
                {loadingSuggestions ? (
                    <div className="flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#3c006b]"></div>
                        <span className="ml-3 text-sm text-gray-400">Searching...</span>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="py-6 text-center">
                        <div className="text-2xl mb-1">🔍</div>
                        <p className="text-sm text-gray-400">No products found for "{search}"</p>
                    </div>
                ) : (
                    <>
                        {suggestions.map((product, idx) => {
                            const price = parseFloat(product.price);
                            const mrp = Math.round(price * 1.2);
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left ${idx > 0 ? 'border-t border-gray-50' : ''}`}
                                >
                                    <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                                        {product.images?.[0] ? (
                                            <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <span className="text-gray-300 text-[10px]">N/A</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{product.description || '1 pack'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-sm font-bold text-[#1a7428]">₹{price}</div>
                                        <div className="text-[10px] text-gray-400 line-through">₹{mrp}</div>
                                    </div>
                                </button>
                            );
                        })}
                        {/* View All link */}
                        <button
                            onClick={handleSearch}
                            className="w-full py-3 text-center text-sm font-bold text-[#3c006b] bg-purple-50 hover:bg-purple-100 transition-colors border-t border-gray-100"
                        >
                            View all results for "{search}"
                        </button>
                    </>
                )}
            </div>
        );
    };

    return (
        <nav className="bg-white shadow sticky top-0 z-50">
            {/* Top Row: Logo, Location, Search, Auth */}
            <div className="border-b border-gray-100">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

                    {/* Left: Logo & Location */}
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <img src="/logo.jpg" alt="BlueAgle" className="h-9 w-9 rounded-lg object-contain" />
                            <span className="text-2xl font-extrabold text-[#3c006b] tracking-tight hidden sm:block">Blue<span className="text-[#ff3269]">Agle</span></span>
                        </Link>

                        <div className="hidden md:flex flex-col cursor-pointer group">
                            <span className="text-[10px] font-bold text-gray-800 group-hover:text-[#ff3269]">Delivery to</span>
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 group-hover:text-[#ff3269]">
                                <span className="truncate max-w-[150px]">Home - 123 Street...</span>
                                <div className="text-[10px] transform rotate-90">{'>'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Center: Search Bar */}
                    <form onSubmit={handleSearch} className="flex-grow max-w-2xl hidden md:flex relative" ref={searchRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder='Search for "chocolate box"'
                            className="w-full bg-gray-50 border border-transparent focus:border-gray-200 text-gray-900 text-sm rounded-lg block pl-10 p-2.5 focus:outline-none focus:bg-white shadow-sm transition-all"
                            value={search}
                            onChange={handleSearchChange}
                            onFocus={() => { if (suggestions.length > 0 || search.trim()) setShowSuggestions(true); }}
                        />
                        <SuggestionDropdown />
                    </form>

                    {/* Right: Auth & Cart */}
                    <div className="flex items-center gap-6">
                        {currentUser ? (
                            <Link to="/profile" className="hidden md:flex flex-col items-center text-gray-600 hover:text-[#3c006b]">
                                <FaUser className="text-xl mb-1" />
                                <span className="text-xs font-bold">Profile</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="hidden md:block font-bold text-gray-600 hover:text-[#3c006b]">Login</Link>
                        )}

                        <button onClick={onCartClick} className="flex flex-col items-center text-gray-600 hover:text-[#3c006b] relative">
                            <div className="relative">
                                <FaShoppingCart className="text-xl mb-1" />
                                {itemCount > 0 && <span className="absolute -top-2 -right-2 bg-[#ff3269] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{itemCount}</span>}
                            </div>
                            <span className="text-xs font-bold">Cart</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Mobile Search & Categories Nav */}
            <div className="container mx-auto px-4">
                {/* Mobile Search */}
                <div className="md:hidden py-3">
                    <div className="relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search for items..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 focus:outline-none"
                                value={search}
                                onChange={handleSearchChange}
                                onFocus={() => { if (suggestions.length > 0 || search.trim()) setShowSuggestions(true); }}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </form>
                        <SuggestionDropdown />
                    </div>
                </div>

                {/* Categories Navigation (Horizontal Scroll) */}
                <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide py-3 text-sm font-medium text-gray-600 md:border-b-0 border-b">
                    <Link to="/products" className="flex items-center gap-2 whitespace-nowrap hover:text-[#ff3269] text-[#ff3269] font-bold border-b-2 border-[#ff3269] pb-3 -mb-3">
                        All
                    </Link>
                    {['Cold Pressed', 'Ghee', 'Honey', 'Nuts', 'Combos', 'Offers'].map(item => (
                        <Link key={item} to={`/products?search=${encodeURIComponent(item.toLowerCase())}`} className="flex items-center gap-2 whitespace-nowrap hover:text-[#ff3269] pb-3 -mb-3 transition-colors">
                            {item}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
