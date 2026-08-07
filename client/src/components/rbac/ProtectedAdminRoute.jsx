import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import ForbiddenPage from './ForbiddenPage';

/**
 * ProtectedAdminRoute — wraps admin pages with auth + permission check.
 *
 * @param {string} [requiredModule] - If provided, checks View permission for this module.
 *
 * Logic:
 *  1. Not authenticated → redirect to /admin/login
 *  2. Authenticated but no View permission for module → 403 ForbiddenPage
 *  3. Super Admin → always passes
 *  4. Authorized → render children
 */
const ProtectedAdminRoute = ({ children, requiredModule = null }) => {
    const { adminUser, loading, hasPermission, isSuperAdmin } = useAdminAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fbfa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    if (requiredModule && !isSuperAdmin && !hasPermission(requiredModule, 'View')) {
        return <ForbiddenPage requiredPermission={`${requiredModule}.View`} />;
    }

    return children;
};

export default ProtectedAdminRoute;
