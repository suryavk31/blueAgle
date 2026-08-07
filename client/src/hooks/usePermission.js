import { useAdminAuth } from '../context/AdminAuthContext';

/**
 * usePermission — hook for checking RBAC permissions in admin panel.
 *
 * @returns {{ can: Function, isSuperAdmin: boolean }}
 *
 * Usage:
 *   const { can, isSuperAdmin } = usePermission();
 *   if (can('Products', 'Create')) { ... }
 */
const usePermission = () => {
    const { hasPermission, isSuperAdmin } = useAdminAuth();

    const can = (moduleName, actionType) => {
        return hasPermission(moduleName, actionType);
    };

    return { can, isSuperAdmin };
};

export default usePermission;
