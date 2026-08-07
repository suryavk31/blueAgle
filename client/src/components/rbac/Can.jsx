import React from 'react';
import usePermission from '../../hooks/usePermission';

/**
 * <Can> component — conditionally renders children based on RBAC permission.
 *
 * Usage:
 *   <Can module="Products" action="Create">
 *     <button>Add Product</button>
 *   </Can>
 *
 *   <Can module="Orders" action="Delete" fallback={<span>No access</span>}>
 *     <button>Delete Order</button>
 *   </Can>
 */
const Can = ({ module, action, children, fallback = null }) => {
    const { can } = usePermission();
    return can(module, action) ? children : fallback;
};

export default Can;
