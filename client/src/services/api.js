import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
        console.log(`🌐 [api Request] MULTIPART FORM-DATA → ${config.method?.toUpperCase()} ${config.url}`);
    } else {
        console.log(`🌐 [api Request] JSON → ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
});

export default api;
