import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaBox, FaList, FaShoppingCart, FaTags, FaUsers, FaFileAlt,
    FaSignOutAlt, FaBullhorn, FaSearch, FaStore, FaShoppingBag, FaChartBar,
    FaCog, FaShieldAlt, FaCubes, FaUserTag, FaUsersCog, FaEnvelope, FaHistory,
    FaAd, FaChevronDown, FaChevronRight, FaExternalLinkAlt, FaFileInvoiceDollar, FaCode, FaSlidersH,
} from 'react-icons/fa';
import { useAdminAuth } from '../context/AdminAuthContext';

// Icon registry — map icon name strings from the Modules table to React components
const ICON_MAP = {
    FaTachometerAlt, FaBox, FaList, FaShoppingCart, FaTags, FaUsers, FaFileAlt,
    FaBullhorn, FaSearch, FaStore, FaShoppingBag, FaChartBar, FaCog, FaShieldAlt,
    FaCubes, FaUserTag, FaUsersCog, FaEnvelope, FaHistory, FaAd, FaFileInvoiceDollar, FaCode, FaSlidersH,
};

const getIcon = (iconName, className = '') => {
    const IconComp = ICON_MAP[iconName];
    return IconComp ? <IconComp className={className} /> : <FaBox className={className} />;
};

// ─── Single nav item (leaf) ───────────────────────────────────────────────────
const NavItem = ({ module, depth = 0 }) => {
    const location = useLocation();
    const isActive = module.route
        ? (module.route === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(module.route))
        : false;

    if (!module.route) return null; // Skip group parents that have no route

    return (
        <Link
            to={module.route}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${depth > 0 ? 'ml-4 text-sm' : 'text-sm font-medium'}
                ${isActive
                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                    : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }`}
        >
            {/* Active indicator */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
            )}
            <span className={`transition-all duration-200 ${isActive ? 'text-indigo-300' : 'text-indigo-400 group-hover:text-indigo-300'}`}>
                {getIcon(module.icon)}
            </span>
            <span className="flex-1 truncate">{module.displayName}</span>
        </Link>
    );
};

// ─── Group item (parent with children) ───────────────────────────────────────
const NavGroup = ({ module, depth = 0 }) => {
    const location = useLocation();
    const isChildActive = (module.children || []).some(child =>
        child.route && location.pathname.startsWith(child.route)
    );
    const [open, setOpen] = useState(isChildActive);

    if (!module.children?.length && !module.route) return null;

    // If no children, render as a leaf
    if (!module.children?.length) return <NavItem module={module} depth={depth} />;

    return (
        <div>
            <button
                onClick={() => setOpen(prev => !prev)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                    ${isChildActive ? 'text-white bg-white/5' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}`}
            >
                <span className="text-indigo-400">
                    {getIcon(module.icon)}
                </span>
                <span className="flex-1 text-left truncate">{module.displayName}</span>
                <span className={`transition-transform duration-200 text-indigo-400 text-xs ${open ? 'rotate-0' : '-rotate-90'}`}>
                    <FaChevronDown />
                </span>
            </button>

            {open && (
                <div className="mt-1 space-y-0.5 pl-2">
                    {module.children
                        .filter(child => child.isVisible && child.isActive)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(child => (
                            child.children?.length
                                ? <NavGroup key={child.id} module={child} depth={depth + 1} />
                                : <NavItem key={child.id} module={child} depth={depth + 1} />
                        ))
                    }
                </div>
            )}
        </div>
    );
};

// ─── AdminSidebar ─────────────────────────────────────────────────────────────
const AdminSidebar = () => {
    const { adminUser, sidebarModules, logout, isSuperAdmin } = useAdminAuth();

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    return (
        <div className="w-[270px] bg-[#0f0f2e] text-indigo-100 h-full flex flex-col shadow-2xl z-20 relative overflow-hidden shrink-0">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />

            {/* Logo */}
            <div className="p-6 pb-4 relative z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-white/5 flex items-center justify-center">
                        <img src="/logo.png" alt="BlueAgle" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tight">
                            Blue<span className="text-indigo-400">Agle</span>
                        </h1>
                        <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Admin info */}
            {adminUser && (
                <div className="px-4 py-3 relative z-10 border-b border-white/5">
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {adminUser.firstName?.[0]}{adminUser.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                                {adminUser.firstName} {adminUser.lastName}
                            </p>
                            <p className="text-indigo-400 text-xs truncate">
                                {isSuperAdmin ? '⭐ Super Admin' : adminUser.roleName}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation — dynamically generated from sidebarModules */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none relative z-10">
                {sidebarModules.length === 0 ? (
                    <div className="space-y-2 animate-pulse px-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-white/5 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    sidebarModules
                        .filter(m => m.isVisible && m.isActive)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(module => (
                            module.children?.length
                                ? <NavGroup key={module.id} module={module} />
                                : <NavItem key={module.id} module={module} />
                        ))
                )}
            </nav>

            {/* Footer */}
            <div className="p-4 relative z-10 border-t border-white/5 bg-black/20 space-y-2">
                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 text-indigo-300 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-200 font-medium text-xs border border-white/5"
                >
                    <FaExternalLinkAlt className="text-xs" />
                    <span>View Store</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all duration-200 font-bold text-sm"
                >
                    <FaSignOutAlt />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
