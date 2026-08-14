import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt, FaBox, FaList, FaShoppingCart, FaTags, FaUsers, FaFileAlt,
    FaSignOutAlt, FaBullhorn, FaSearch, FaStore, FaShoppingBag, FaChartBar,
    FaCog, FaShieldAlt, FaCubes, FaUserTag, FaUsersCog, FaEnvelope, FaHistory,
    FaAd, FaChevronDown, FaChevronRight, FaExternalLinkAlt, FaFileInvoiceDollar, FaCode, FaSlidersH, FaTimes, FaTruck, FaCreditCard
} from 'react-icons/fa';
import { useAdminAuth } from '../context/AdminAuthContext';

const ICON_MAP = {
    FaTachometerAlt, FaBox, FaList, FaShoppingCart, FaTags, FaUsers, FaFileAlt,
    FaBullhorn, FaSearch, FaStore, FaShoppingBag, FaChartBar, FaCog, FaShieldAlt,
    FaCubes, FaUserTag, FaUsersCog, FaEnvelope, FaHistory, FaAd, FaFileInvoiceDollar, FaCode, FaSlidersH, FaTruck, FaCreditCard,
};

const getIcon = (iconName, className = '') => {
    const IconComp = ICON_MAP[iconName];
    return IconComp ? <IconComp className={className} /> : <FaBox className={className} />;
};

// ─── Single Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ module, depth = 0, isCollapsed = false, onCloseMobile }) => {
    const location = useLocation();
    const isActive = module.route
        ? (module.route === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(module.route))
        : false;

    if (!module.route) return null;

    return (
        <Link
            to={module.route}
            onClick={onCloseMobile}
            title={isCollapsed ? module.displayName : undefined}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative
                ${depth > 0 && !isCollapsed ? 'ml-4 text-xs' : 'text-xs font-semibold'}
                ${isActive
                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30 font-bold'
                    : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }
                ${isCollapsed ? 'justify-center px-2 py-3' : ''}`}
        >
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-400 rounded-r-full" />
            )}
            <span className={`text-base shrink-0 transition-all duration-200 ${isActive ? 'text-indigo-300' : 'text-indigo-400 group-hover:text-indigo-300'}`}>
                {getIcon(module.icon)}
            </span>
            {!isCollapsed && (
                <span className="flex-1 truncate">{module.displayName}</span>
            )}
        </Link>
    );
};

// ─── Group Nav Item ───────────────────────────────────────────────────────────
const NavGroup = ({ module, depth = 0, isCollapsed = false, onCloseMobile }) => {
    const location = useLocation();
    const isChildActive = (module.children || []).some(child => {
        if (!child.route) return false;
        return child.route === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(child.route);
    });
    const [open, setOpen] = useState(isChildActive);

    if (!module.children?.length && !module.route) return null;
    if (!module.children?.length) return <NavItem module={module} depth={depth} isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />;

    return (
        <div>
            <button
                onClick={() => setOpen(prev => !prev)}
                title={isCollapsed ? module.displayName : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold
                    ${isChildActive ? 'text-white bg-white/5' : 'text-indigo-200 hover:bg-white/5 hover:text-white'}
                    ${isCollapsed ? 'justify-center px-2 py-3' : ''}`}
            >
                <span className="text-base text-indigo-400 shrink-0">
                    {getIcon(module.icon)}
                </span>
                {!isCollapsed && (
                    <>
                        <span className="flex-1 text-left truncate">{module.displayName}</span>
                        <span className={`transition-transform duration-200 text-indigo-400 text-[10px] ${open ? 'rotate-0' : '-rotate-90'}`}>
                            <FaChevronDown />
                        </span>
                    </>
                )}
            </button>

            {open && !isCollapsed && (
                <div className="mt-1 space-y-0.5 pl-1">
                    {module.children
                        .filter(child => child.isVisible && child.isActive)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(child => (
                            child.children?.length
                                ? <NavGroup key={child.id} module={child} depth={depth + 1} isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />
                                : <NavItem key={child.id} module={child} depth={depth + 1} isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />
                        ))
                    }
                </div>
            )}
        </div>
    );
};

// ─── AdminSidebar Component ───────────────────────────────────────────────────
const AdminSidebar = ({ isOpen, onCloseMobile, isCollapsed }) => {
    const { adminUser, sidebarModules, logout, isSuperAdmin } = useAdminAuth();

    // Close mobile drawer on ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onCloseMobile();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCloseMobile]);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    const sidebarContent = (
        <div className={`h-full flex flex-col bg-[#0f0f2e] text-indigo-100 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />

            {/* Top Logo */}
            <div className="p-4 relative z-10 border-b border-white/5 flex items-center justify-between">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-white/5 flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="BlueAgle" className="w-full h-full object-contain" />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-base font-black text-white tracking-tight">
                                Blue<span className="text-indigo-400">Agle</span>
                            </h1>
                            <p className="text-[9px] uppercase font-extrabold text-indigo-400 tracking-widest">Admin Master</p>
                        </div>
                    )}
                </div>

                {/* Mobile Close Button */}
                <button
                    onClick={onCloseMobile}
                    className="lg:hidden text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
                    aria-label="Close Sidebar"
                >
                    <FaTimes className="text-base" />
                </button>
            </div>

            {/* Admin User Info */}
            {adminUser && !isCollapsed && (
                <div className="px-3 py-2.5 relative z-10 border-b border-white/5">
                    <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {adminUser.firstName?.[0]}{adminUser.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-xs font-extrabold truncate">
                                {adminUser.firstName} {adminUser.lastName}
                            </p>
                            <p className="text-indigo-300 text-[10px] truncate font-bold">
                                {isSuperAdmin ? '⭐ Super Admin' : adminUser.roleName}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Modules */}
            <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto scrollbar-none relative z-10">
                {sidebarModules.length === 0 ? (
                    <div className="space-y-2 animate-pulse px-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-9 bg-white/5 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    sidebarModules
                        .filter(m => m.isVisible && m.isActive)
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map(module => (
                            module.children?.length
                                ? <NavGroup key={module.id} module={module} isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />
                                : <NavItem key={module.id} module={module} isCollapsed={isCollapsed} onCloseMobile={onCloseMobile} />
                        ))
                )}
            </nav>

            {/* Footer */}
            <div className="p-3 relative z-10 border-t border-white/5 bg-black/20 space-y-1.5">
                <Link
                    to="/admin/blogs"
                    onClick={onCloseMobile}
                    className={`flex items-center justify-center gap-2 w-full py-2 bg-white/5 text-indigo-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-semibold text-xs border border-white/5 ${
                        isCollapsed ? 'px-0' : 'px-3'
                    }`}
                    title="Blog Manager"
                >
                    <FaFileAlt className="text-xs text-indigo-400" />
                    {!isCollapsed && <span>Blog Articles</span>}
                </Link>

                <Link
                    to="/admin/delivery-settings"
                    onClick={onCloseMobile}
                    className={`flex items-center justify-center gap-2 w-full py-2 bg-white/5 text-indigo-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-semibold text-xs border border-white/5 ${
                        isCollapsed ? 'px-0' : 'px-3'
                    }`}
                    title="Delivery Settings"
                >
                    <FaTruck className="text-xs text-indigo-400" />
                    {!isCollapsed && <span>Delivery Settings</span>}
                </Link>

                <Link
                    to="/admin/settings/payment"
                    onClick={onCloseMobile}
                    className={`flex items-center justify-center gap-2 w-full py-2 bg-white/5 text-indigo-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-semibold text-xs border border-white/5 ${
                        isCollapsed ? 'px-0' : 'px-3'
                    }`}
                    title="Payment & Tax Settings"
                >
                    <FaCreditCard className="text-xs text-indigo-400" />
                    {!isCollapsed && <span>Payment &amp; Tax Settings</span>}
                </Link>

                <Link
                    to="/"
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-2 bg-white/5 text-indigo-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-semibold text-xs border border-white/5 ${
                        isCollapsed ? 'px-0' : 'px-3'
                    }`}
                    title="View Store"
                >
                    <FaExternalLinkAlt className="text-xs" />
                    {!isCollapsed && <span>Store Front</span>}
                </Link>

                <button
                    onClick={handleLogout}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all font-bold text-xs ${
                        isCollapsed ? 'px-0' : 'px-3'
                    }`}
                    title="Logout"
                >
                    <FaSignOutAlt />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* 1. Mobile Off-Canvas Drawer Backdrop */}
            {isOpen && (
                <div
                    onClick={onCloseMobile}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
                />
            )}

            {/* 2. Mobile Off-Canvas Drawer */}
            <aside className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {sidebarContent}
            </aside>

            {/* 3. Desktop Persistent Sidebar */}
            <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-20">
                {sidebarContent}
            </aside>
        </>
    );
};

export default AdminSidebar;
