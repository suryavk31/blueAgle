export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//'))) {
        return path;
    }
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

