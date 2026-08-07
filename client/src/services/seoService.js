import adminApi from './adminApi';
import api from './api';

const seoService = {
    // Resolve dynamic SEO for route or pageKey (Customer facing)
    resolveSeo: async (route, pageKey) => {
        const params = new URLSearchParams();
        if (route) params.append('route', route);
        if (pageKey) params.append('pageKey', pageKey);
        const res = await api.get(`/seo/resolve?${params.toString()}`);
        return res.data;
    },

    // Admin List with search/filters
    getAllSeo: async (params) => {
        const res = await adminApi.get('/seo/all', { params });
        return res.data;
    },

    // Admin Get By ID
    getSeoById: async (id) => {
        const res = await adminApi.get(`/seo/${id}`);
        return res.data;
    },

    // Admin Create
    createSeo: async (data) => {
        const res = await adminApi.post('/seo', data);
        return res.data;
    },

    // Admin Update
    updateSeo: async (id, data) => {
        const res = await adminApi.put(`/seo/${id}`, data);
        return res.data;
    },

    // Admin Delete
    deleteSeo: async (id) => {
        const res = await adminApi.delete(`/seo/${id}`);
        return res.data;
    },

    // Admin Bulk Actions
    bulkActions: async (action, ids, updateData) => {
        const res = await adminApi.post('/seo/bulk', { action, ids, updateData });
        return res.data;
    },

    // Export JSON
    exportSeo: async () => {
        const res = await adminApi.get('/seo/export');
        return res.data;
    },

    // Import JSON
    importSeo: async (records) => {
        const res = await adminApi.post('/seo/import', { records });
        return res.data;
    },

    // Global Settings
    getGlobalSeo: async () => {
        const res = await adminApi.get('/seo/global');
        return res.data;
    },

    updateGlobalSeo: async (data) => {
        const res = await adminApi.put('/seo/global', data);
        return res.data;
    },

    // Real-time Validate
    validateSeo: async (data) => {
        const res = await adminApi.post('/seo/validate', data);
        return res.data;
    },

    // ── Auto-SEO Sync Engine Methods ──────────────────────────────────────────
    getSyncStats: async () => {
        const res = await adminApi.get('/seo/sync/stats');
        return res.data;
    },

    getMissingPages: async () => {
        const res = await adminApi.get('/seo/sync/missing');
        return res.data;
    },

    previewSync: async () => {
        const res = await adminApi.get('/seo/sync/preview');
        return res.data;
    },

    generateMissingSeo: async () => {
        const res = await adminApi.post('/seo/sync/generate', {});
        return res.data;
    },

    regenerateSeo: async (options) => {
        const res = await adminApi.post('/seo/sync/regenerate', options);
        return res.data;
    },

    markAsManual: async (id) => {
        const res = await adminApi.post(`/seo/sync/mark-manual/${id}`, {});
        return res.data;
    },

    unmarkManual: async (id) => {
        const res = await adminApi.delete(`/seo/sync/mark-manual/${id}`);
        return res.data;
    }
};

export default seoService;
