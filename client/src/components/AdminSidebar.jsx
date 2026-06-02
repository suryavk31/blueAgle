import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBox, FaList, FaShoppingCart, FaTags, FaUsers, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        // Exact match for dashboard, startsWith for subpages
        if (path === '/admin') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/admin', name: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/admin/orders', name: 'Orders', icon: <FaShoppingCart /> },
        { path: '/admin/products', name: 'Products', icon: <FaBox /> },
        { path: '/admin/categories', name: 'Categories', icon: <FaList /> },
        { path: '/admin/users', name: 'Customers', icon: <FaUsers /> },
        { path: '/admin/coupons', name: 'Discounts', icon: <FaTags /> },
        { path: '/admin/policies', name: 'Policies', icon: <FaFileAlt /> },
    ];

    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    return (
        <div className="w-[280px] bg-[#1a1a4e] text-indigo-100 h-full flex flex-col shadow-2xl z-20 relative overflow-hidden shrink-0">
            {/* Elegant sidebar background gradient */}
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/0 pointer-events-none"></div>
            
            <div className="p-8 pb-4 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-lg shadow-indigo-500/30 bg-white/10 flex items-center justify-center">
                        <img src="/logo.jpg" alt="BlueAgle" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Blue<span className="text-indigo-400">Agle</span></h1>
                        <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-widest mt-0.5">Control Panel</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none relative z-10">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium group relative
                            ${isActive(item.path) 
                                ? "bg-white/10 text-white shadow-inner border border-white/5" 
                                : "text-indigo-200 hover:bg-white/5 hover:text-white"
                            }`}
                    >
                        {/* Interactive icon glow */}
                        <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive(item.path) ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'group-hover:scale-110'}`}>
                            {item.icon}
                        </div>
                        <span className="tracking-wide text-sm">{item.name}</span>
                        
                        {/* Active Indicator Line */}
                        {isActive(item.path) && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.8)]"></div>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-6 relative z-10 border-t border-white/10 mt-auto bg-black/10 space-y-3">
                <Link 
                    to="/" 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 text-indigo-200 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300 font-bold text-xs tracking-wide border border-white/5"
                >
                    <span>Back to Store</span>
                </Link>
                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 font-bold text-sm tracking-wide"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
