export const getImageUrl = (path) => {
    if (!path) return '';
    if (typeof path === 'string') {
        const trimmed = path.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
            return trimmed;
        }
    }

    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = rawApiUrl.replace(/\/api\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};
