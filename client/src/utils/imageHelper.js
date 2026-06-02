export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150';
    if (path.startsWith('http') || path.startsWith('//')) {
        return path;
    }
    return `http://localhost:5000${path}`;
};
