import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext'; // Assuming configured

const AdminLayout = () => {
    // const { userData, loading } = useAuth(); // Enable later

    // For verification MVP, assume Admin if specific path or mock check
    // if (loading) return <div>Loading...</div>;
    // if (!userData || userData.role !== 'admin') return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-[#f8fbfa] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
            {/* Subtle global background glow */}
            <div className="absolute top-0 left-64 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-10 relative z-10 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
