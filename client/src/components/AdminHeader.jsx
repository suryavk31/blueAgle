import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaBars, FaSearch, FaExternalLinkAlt, FaUserCircle, FaSignOutAlt, FaChevronRight, FaShieldAlt } from 'react-icons/fa';
import { useAdminAuth } from '../context/AdminAuthContext';

const ROUTE_NAME_MAP = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products Master',
    '/admin/product-attributes': 'Product Attributes',
    '/admin/categories': 'Categories',
    '/admin/orders': 'Orders Management',
    '/admin/coupons': 'Coupons & Discounts',
    '/admin/seo': 'SEO Manager',
    '/admin/policies': 'Policy CMS',
    '/admin/users': 'Customer Directory',
    '/admin/ads': 'Ads & Banners',
    '/admin/rbac/roles': 'Role Permissions',
    '/admin/rbac/admin-users': 'Admin Team',
    '/admin/rbac/modules': 'Module Registry',
    '/admin/rbac/invitations': 'Team Invitations',
    '/admin/rbac/activity-logs': 'Activity Audit Logs',
    '/admin/rbac/deleted-accounts': 'Deleted Accounts',
    '/admin/rbac/invoice-builder/templates': 'Invoice Templates',
    '/admin/rbac/invoice-builder/categories': 'Template Categories',
    '/admin/rbac/invoice-builder/variables': 'Variables Registry',
    '/admin/rbac/invoice-builder/settings': 'Invoice Settings',
};

const AdminHeader = ({ onToggleSidebar, isDesktopCollapsed, onToggleDesktopCollapse }) => {
    const location = useLocation();
    const { adminUser, logout, isSuperAdmin } = useAdminAuth();
    const [profileOpen, setProfileOpen] = useState(false);

    const currentPageName = ROUTE_NAME_MAP[location.pathname] || 'Admin Module';

    const handleLogout = async () => {
        await logout();
        window.location.href = '/admin/login';
    };

    return (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
            <div className="flex items-center justify-between gap-3">

                {/* Left Section: Mobile Hamburger, Desktop Toggle & Breadcrumbs */}
                <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Hamburger Toggle Button */}
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                        aria-label="Toggle Navigation Drawer"
                    >
                        <FaBars className="text-lg" />
                    </button>

                    {/* Desktop Collapse Toggle Button */}
                    <button
                        onClick={onToggleDesktopCollapse}
                        className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors focus:outline-none"
                        title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <FaBars className="text-base" />
                    </button>

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
                        <Link to="/admin" className="text-slate-400 hover:text-indigo-600 hidden sm:inline transition-colors">
                            Admin
                        </Link>
                        <FaChevronRight className="text-[10px] text-slate-300 hidden sm:inline" />
                        <span className="text-slate-900 font-extrabold truncate">{currentPageName}</span>
                    </div>
                </div>

                {/* Right Section: Quick Actions & Profile Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Store Link */}
                    <Link
                        to="/"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/60"
                    >
                        <FaExternalLinkAlt className="text-[11px]" />
                        <span>Live Store</span>
                    </Link>

                    {/* Admin User Profile Dropdown */}
                    {adminUser && (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0">
                                    {adminUser.firstName?.[0]}{adminUser.lastName?.[0]}
                                </div>
                                <div className="hidden sm:block text-left leading-tight">
                                    <div className="text-xs font-extrabold text-slate-900 truncate max-w-[120px]">
                                        {adminUser.firstName} {adminUser.lastName}
                                    </div>
                                    <div className="text-[10px] font-bold text-indigo-600 truncate">
                                        {isSuperAdmin ? 'Super Admin' : adminUser.roleName}
                                    </div>
                                </div>
                            </button>

                            {/* Dropdown Menu */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <div className="text-xs font-extrabold text-slate-900">{adminUser.firstName} {adminUser.lastName}</div>
                                        <div className="text-[11px] text-slate-500 font-medium truncate">{adminUser.email}</div>
                                        <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            <FaShieldAlt className="text-[9px]" /> {isSuperAdmin ? 'Super Admin' : adminUser.roleName}
                                        </div>
                                    </div>

                                    <Link
                                        to="/"
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 font-semibold hover:bg-slate-50 transition-colors md:hidden"
                                    >
                                        <FaExternalLinkAlt className="text-indigo-500" /> View Live Store
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 font-bold hover:bg-rose-50 transition-colors text-left"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
};

export default AdminHeader;
