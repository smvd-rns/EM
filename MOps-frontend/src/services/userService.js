import { supabase } from './supabaseClient';

export const userService = {
    /**
     * Fetch all user profiles directly from Supabase profiles table (Single Source of Truth)
     */
    getAllUsers: async () => {
        // Clean up legacy overrides cache & stale local filters so real database records are always visible
        localStorage.removeItem('user_role_overrides');
        localStorage.removeItem('deleted_user_ids');

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .or('is_deleted.eq.false,is_deleted.is.null')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                return userService.getFallbackUsers();
            }

            return data.map(u => ({
                id: u.id,
                email: u.email || u.user_metadata?.email || `${u.username || 'user'}@maintenops.com`,
                username: u.username || u.name || 'User',
                name: u.name || u.username || u.email?.split('@')[0] || 'User',
                mobileNumber: u.mobile_number || u.phone || 'N/A',
                role: u.role || 'REQUESTER',
                createdAt: u.created_at || new Date().toISOString()
            }));
        } catch (e) {
            console.error('[userService] Error fetching users:', e);
            return userService.getFallbackUsers();
        }
    },

    /**
     * Update user role directly in Supabase profiles table
     */
    updateUserRole: async (userId, newRole) => {
        localStorage.removeItem('user_role_overrides');
        try {
            // 1. Direct DB update in Supabase
            const { error, status } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) {
                console.warn('[userService] Supabase update error:', error.message);
                if (error.message?.includes('profiles_role_check')) {
                    throw new Error(`Role "${newRole}" is restricted by Supabase database constraint. Please run the SQL snippet to allow "${newRole}".`);
                }
                throw new Error(error.message);
            }

            // Sync active user session if updating logged in user
            const activeUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (activeUser && activeUser.id === userId) {
                activeUser.role = newRole;
                activeUser.roles = [newRole];
                localStorage.setItem('user', JSON.stringify(activeUser));
            }

            return { id: userId, role: newRole, status };
        } catch (e) {
            console.error('[userService] Error in updateUserRole:', e);
            throw e;
        }
    },

    /**
     * Delete user profile directly from Supabase profiles table
     */
    deleteUser: async (userId) => {
        try {
            // Soft delete directly from Supabase profiles table
            const { error } = await supabase
                .from('profiles')
                .update({ is_deleted: true })
                .eq('id', userId);

            if (error) {
                console.error('[userService] Supabase soft delete error:', error.message);
                throw new Error(`Database Error: ${error.message}`);
            }

            return { id: userId, success: true };
        } catch (e) {
            console.error('[userService] Error in deleteUser:', e);
            throw e;
        }
    },

    /**
     * Fallback mock users when profiles table is empty or offline
     */
    getFallbackUsers: () => [
        { id: '101', email: 'admin@maintenops.com', username: 'Super Admin', name: 'Super Admin', mobileNumber: '9876543210', role: 'SUPER_ADMIN', createdAt: '2026-01-15' },
        { id: '102', email: 'facility.admin@maintenops.com', username: 'Facility Admin', name: 'Facility Admin', mobileNumber: '9876543211', role: 'ADMIN', createdAt: '2026-02-01' },
        { id: '103', email: 'requester@maintenops.com', username: 'Department Lead', name: 'Department Lead', mobileNumber: '9876543212', role: 'REQUESTER', createdAt: '2026-02-10' },
        { id: '104', email: 'store.manager@maintenops.com', username: 'Store Manager', name: 'Store Manager', mobileNumber: '9876543213', role: 'STORE_MANAGER', createdAt: '2026-02-20' },
        { id: '105', email: 'vendor.electric@maintenops.com', username: 'Apex Electricals', name: 'Apex Electricals', mobileNumber: '9876543214', role: 'VENDOR', createdAt: '2026-03-01' }
    ]
};
