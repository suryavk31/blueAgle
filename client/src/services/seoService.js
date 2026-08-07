import api from './api';

const seoService = {
    // Resolve dynamic SEO for route or pageKey
    resolveSeo: async (route, pageKey) => {
        const params = new URLSearchParams();
        if (route) params.append('route', route);
        if (pageKey) params.append('pageKey', pageKey);
        const res = await api.get(`/seo/resolve?${params.toString()}`);
        return res.data;
    },

    // Admin List with search/filters
    getAllSeo: async (params, token) => {
        const res = await api.get('/seo/all', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Admin Get By ID
    getSeoById: async (id, token) => {
        const res = await api.get(`/seo/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Admin Create
    createSeo: async (data, token) => {
        const res = await api.post('/seo', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Admin Update
    updateSeo: async (id, data, token) => {
        const res = await api.put(`/seo/${id}`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Admin Delete
    deleteSeo: async (id, token) => {
        const res = await api.delete(`/seo/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Admin Bulk Actions
    bulkActions: async (action, ids, updateData, token) => {
        const res = await api.post('/seo/bulk', { action, ids, updateData }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Export JSON
    exportSeo: async (token) => {
        const res = await api.get('/seo/export', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Import JSON
    importSeo: async (records, token) => {
        const res = await api.post('/seo/import', { records }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Global Settings
    getGlobalSeo: async () => {
        const res = await api.get('/seo/global');
        return res.data;
    },

    updateGlobalSeo: async (data, token) => {
        const res = await api.put('/seo/global', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // Real-time Validate
    validateSeo: async (data, token) => {
        const res = await api.post('/seo/validate', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    // ── Auto-SEO Sync Engine Methods ──────────────────────────────────────────
    getSyncStats: async (token) => {
        const res = await api.get('/seo/sync/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    getMissingPages: async (token) => {
        const res = await api.get('/seo/sync/missing', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    previewSync: async (token) => {
        const res = await api.get('/seo/sync/preview', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    generateMissingSeo: async (token) => {
        const res = await api.post('/seo/sync/generate', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    regenerateSeo: async (options, token) => {
        const res = await api.post('/seo/sync/regenerate', options, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    markAsManual: async (id, token) => {
        const res = await api.post(`/seo/sync/mark-manual/${id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    },

    unmarkManual: async (id, token) => {
        const res = await api.delete(`/seo/sync/mark-manual/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    }
};

export default seoService;
