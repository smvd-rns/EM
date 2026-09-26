/**
 * Helper function to get display name for role
 * @param {string} role - The role constant (REQUESTER, ADMIN, SUPER_ADMIN)
 * @returns {string} - User-friendly display name
 */
export const getRoleDisplayName = (role) => {
    switch (role) {
        case 'REQUESTER':
            return 'USER';
        case 'ADMIN':
            return 'ADMIN';
        case 'SUPER_ADMIN':
            return 'SUPER ADMIN';
        case 'STORE_MANAGER':
            return 'STORE MANAGER';
        case 'VENDOR':
            return 'VENDOR';
        default:
            return role || 'User';
    }
};

/**
 * Get dashboard route for a given role
 * @param {string} role - The role constant
 * @returns {string} - The route path
 */
export const getDashboardRoute = (role) => {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'SUPER_ADMIN':
            return '/super-admin';
        case 'STORE_MANAGER':
            return '/store-manager';
        case 'VENDOR':
            return '/vendor';
        case 'REQUESTER':
        default:
            return '/dashboard';
    }
};
