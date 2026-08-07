import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import adminApi from '../services/adminApi';

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
    return ctx;
};

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [permissions, setPermissions] = useState(() => {
        try {
            const saved = localStorage.getItem('admin_permissions');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch { return new Set(); }
    });
    const [loading, setLoading] = useState(true);
    const [sidebarModules, setSidebarModules] = useState([]);

    // ── Load admin data from server ──────────────────────────────────────────
    const loadAdminData = useCallback(async () => {
        const token = localStorage.getItem('admin_access_token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const [meRes, modulesRes] = await Promise.all([
                adminApi.get('/auth/me'),
                adminApi.get('/modules/my-modules'),
            ]);
            const user = meRes.data;
            const permSet = new Set(user.permissions || []);

            setAdminUser(user);
            setPermissions(permSet);
            setSidebarModules(modulesRes.data || []);

            localStorage.setItem('admin_user', JSON.stringify(user));
            localStorage.setItem('admin_permissions', JSON.stringify([...permSet]));
        } catch (err) {
            // Token invalid — clear storage
            if (err.response?.status === 401) {
                clearAdminSession();
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    // ── Login ────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        const res = await adminApi.post('/auth/login', { email, password });
        const { accessToken, refreshToken, admin } = res.data;

        localStorage.setItem('admin_access_token', accessToken);
        localStorage.setItem('admin_refresh_token', refreshToken);
        localStorage.setItem('admin_user', JSON.stringify(admin));

        setAdminUser(admin);
        setLoading(true);

        // Load full permissions and sidebar after login
        await loadAdminData();
        return admin;
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('admin_refresh_token');
            await adminApi.post('/auth/logout', { refreshToken });
        } catch { /* ignore */ }
        clearAdminSession();
    };

    const clearAdminSession = () => {
        localStorage.removeItem('admin_access_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_permissions');
        setAdminUser(null);
        setPermissions(new Set());
        setSidebarModules([]);
    };

    // ── Permission check ─────────────────────────────────────────────────────
    const hasPermission = useCallback((moduleName, actionType) => {
        if (!adminUser) return false;
        if (adminUser.isSuperAdmin) return true;
        return permissions.has(`${moduleName}.${actionType}`);
    }, [adminUser, permissions]);

    const isSuperAdmin = adminUser?.isSuperAdmin || false;

    // ── Refresh permissions after role change ────────────────────────────────
    const refreshPermissions = useCallback(async () => {
        await loadAdminData();
    }, [loadAdminData]);

    const value = {
        adminUser,
        permissions,
        sidebarModules,
        loading,
        login,
        logout,
        hasPermission,
        isSuperAdmin,
        refreshPermissions,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export default AdminAuthContext;
