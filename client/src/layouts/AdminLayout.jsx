import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminLayout = () => {
    const { adminUser, loading } = useAdminAuth();

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

    return (
        <div className="flex h-screen bg-[#f0f2f8] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
            {/* Global background glow */}
            <div className="absolute top-0 left-80 w-[600px] h-[400px] bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
