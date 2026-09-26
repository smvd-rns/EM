import React, { useState, useEffect } from 'react';
import { userService } from '../../../services/userService';
import { useAuth } from '../../../context/AuthContext';

const ROLES = [
    { value: 'REQUESTER', label: 'Requester', color: 'bg-surface-variant text-on-surface-variant border-outline' },
    { value: 'ADMIN', label: 'Admin', color: 'bg-primary-container text-primary border-primary/30' },
    { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'bg-purple-500/20 text-accent-purple border-purple-500/30' },
    { value: 'STORE_MANAGER', label: 'Store Manager', color: 'bg-success-container text-success border-success/30' },
    { value: 'VENDOR', label: 'Vendor', color: 'bg-warning-container text-warning border-warning/30' },
];

const UserManagementSection = () => {
    const { user, updateUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [updatingId, setUpdatingId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error('Error loading users:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            await userService.updateUserRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

            // Real-time AuthContext state update if changing logged-in user's own role
            if (user && user.id === userId && updateUser) {
                await updateUser({ role: newRole, roles: [newRole] });
            }

            setToastMessage(`✅ Updated role to ${newRole}!`);
            setTimeout(() => setToastMessage(null), 3500);
        } catch (e) {
            alert('Failed to update role: ' + (e.message || 'Unknown error'));
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name || u.username || '').toLowerCase().includes(search.toLowerCase()) ||
                              (u.email || '').toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (!isSuperAdmin) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm animate-fadeUp">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mx-auto mb-3">⛔</div>
                <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
                <p className="text-sm text-slate-500 mt-1">User Role Management is strictly available to Super Admins only.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-3xl border border-outline shadow-2xl p-6 sm:p-8 animate-fadeUp">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 pb-6 border-b border-outline">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-2xl bg-primary-container border border-primary/30 flex items-center justify-center text-accent font-bold">
                            👥
                        </div>
                        <div>
                            <h3 className="text-[22px] font-display font-extrabold text-on-surface">User Role Management</h3>
                            <p className="text-[14px] text-on-surface-variant font-ui">Control access levels and assign department permissions across the organization</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search bar */}
                    <div className="relative min-w-[240px]">
                        <input
                            type="text"
                            placeholder="Search user name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline bg-surface-variant text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-on-surface-variant/60"
                        />
                        <svg className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <button
                        onClick={loadUsers}
                        className="h-11 px-4 rounded-xl border border-outline bg-surface-variant text-on-surface font-semibold text-[14px] hover:bg-surface-variant/80 flex items-center gap-2 transition-colors"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <button
                    onClick={() => setRoleFilter('ALL')}
                    className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${roleFilter === 'ALL' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 border border-outline/40'}`}
                >
                    All Users ({users.length})
                </button>
                {ROLES.map(r => {
                    const count = users.filter(u => u.role === r.value).length;
                    return (
                        <button
                            key={r.value}
                            onClick={() => setRoleFilter(r.value)}
                            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${roleFilter === r.value ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80 border border-outline/40'}`}
                        >
                            {r.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Toast Feedback Notification */}
            {toastMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-success-container border border-success/30 text-success text-[14px] font-bold flex items-center justify-between animate-fadeUp">
                    <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-success animate-ping"></span>
                        {toastMessage}
                    </span>
                    <button onClick={() => setToastMessage(null)} className="text-success hover:text-white font-bold text-[16px]">✕</button>
                </div>
            )}

            {/* User List Table */}
            {loading ? (
                <div className="py-12 text-center text-on-surface-variant font-medium">Loading user profiles...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-on-surface-variant font-medium bg-surface-variant/40 rounded-2xl border border-dashed border-outline">
                    No matching users found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-outline text-[12px] uppercase font-bold text-on-surface-variant tracking-wider">
                                <th className="pb-3 px-4">User Profile</th>
                                <th className="pb-3 px-4">Email</th>
                                <th className="pb-3 px-4">Contact</th>
                                <th className="pb-3 px-4">Current Role</th>
                                <th className="pb-3 px-4 text-right">Assign Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/50 text-[14px]">
                            {filteredUsers.map(user => {
                                const currentRoleObj = ROLES.find(r => r.value === user.role) || { label: user.role, color: 'bg-surface-variant text-on-surface-variant border-outline' };
                                const isUpdating = updatingId === user.id;

                                return (
                                    <tr key={user.id} className="hover:bg-surface-variant/40 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-bold text-[14px] shadow-md">
                                                    {(user.name || user.username || 'U').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-on-surface">{user.name || user.username || 'Unnamed User'}</div>
                                                    <div className="text-[12px] text-on-surface-variant">ID: {user.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-accent font-medium">{user.email}</td>
                                        <td className="py-4 px-4 text-on-surface-variant font-medium">{user.mobileNumber}</td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold border ${currentRoleObj.color}`}>
                                                {currentRoleObj.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <select
                                                value={user.role}
                                                disabled={isUpdating}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="h-10 px-3 rounded-xl border border-outline bg-surface-variant text-on-surface text-[13px] font-bold focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r.value} value={r.value} className="bg-surface text-on-surface">
                                                        Change to: {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserManagementSection;
