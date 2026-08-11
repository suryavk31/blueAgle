import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Centralized ScrollToTop Component
 * Resets window scroll and all dedicated inner scroll containers (e.g. Admin Dashboard layout)
 * to scrollTop = 0 instantly upon route/pathname or search parameter change.
 */
const ScrollToTop = () => {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // 1. Reset standard window / document scrolling for Customer Website
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        });

        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
        }
        if (document.body) {
            document.body.scrollTop = 0;
        }

        // 2. Reset dedicated scroll containers (e.g., Admin Dashboard <main> container)
        const adminMainContainer = document.getElementById('admin-main-scroll-container');
        if (adminMainContainer) {
            adminMainContainer.scrollTop = 0;
        }

        // 3. Fallback: Reset any overflow-y-auto scrollable containers across the application
        const overflowContainers = document.querySelectorAll('main, [data-scroll-container], .overflow-y-auto');
        overflowContainers.forEach(container => {
            if (container && container.scrollTop > 0) {
                container.scrollTop = 0;
            }
        });
    }, [pathname, search]);

    return null;
};

export default ScrollToTop;
