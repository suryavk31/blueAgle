import axios from 'axios';

const ADMIN_API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/admin`
    : 'http://localhost:5000/api/admin';

const adminApi = axios.create({
    baseURL: ADMIN_API_BASE,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attach the admin JWT token & handle FormData headers correctly
adminApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle 401 (expired token) with automatic refresh attempt & detailed logging
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error(`❌ [adminApi Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status || 'Network Error'}:`, error.response?.data || error.message);
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (error.response?.data?.code === 'TOKEN_EXPIRED') {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return adminApi(originalRequest);
                    }).catch((err) => Promise.reject(err));
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const refreshToken = localStorage.getItem('admin_refresh_token');
                if (!refreshToken) {
                    window.location.href = '/admin/login';
                    return Promise.reject(error);
                }

                try {
                    const res = await axios.post(`${ADMIN_API_BASE}/auth/refresh`, { refreshToken });
                    const { accessToken, refreshToken: newRefresh } = res.data;
                    localStorage.setItem('admin_access_token', accessToken);
                    localStorage.setItem('admin_refresh_token', newRefresh);
                    processQueue(null, accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return adminApi(originalRequest);
                } catch (err) {
                    processQueue(err, null);
                    localStorage.removeItem('admin_access_token');
                    localStorage.removeItem('admin_refresh_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/admin/login';
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            // Generic 401 — redirect to login
            localStorage.removeItem('admin_access_token');
            localStorage.removeItem('admin_refresh_token');
            localStorage.removeItem('admin_user');
            window.location.href = '/admin/login';
        }

        return Promise.reject(error);
    }
);

export default adminApi;
