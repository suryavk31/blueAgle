import api from './api';
import adminApi from './adminApi';

export const blogService = {
    // Public Endpoints
    getPublicBlogs: async (params = {}) => {
        const response = await api.get('/blogs', { params });
        return response.data;
    },

    getPublicBlogBySlug: async (slug) => {
        const response = await api.get(`/blogs/${slug}`);
        return response.data;
    },

    // Admin Endpoints
    getAllBlogsAdmin: async (params = {}) => {
        const response = await adminApi.get('/blogs/admin/all', { params });
        return response.data;
    },

    getBlogByIdAdmin: async (id) => {
        const response = await adminApi.get(`/blogs/admin/${id}`);
        return response.data;
    },

    createBlogAdmin: async (data) => {
        const response = await adminApi.post('/blogs/admin', data);
        return response.data;
    },

    updateBlogAdmin: async (id, data) => {
        const response = await adminApi.put(`/blogs/admin/${id}`, data);
        return response.data;
    },

    deleteBlogAdmin: async (id) => {
        const response = await adminApi.delete(`/blogs/admin/${id}`);
        return response.data;
    }
};

export default blogService;
