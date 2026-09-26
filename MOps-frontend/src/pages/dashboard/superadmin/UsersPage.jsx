import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getDashboardRoute } from '../../../utils/roleUtils';
import UserManagementSection from '../../../components/dashboard/superadmin/UserManagementSection';

const UsersPage = () => {
    const { user } = useAuth();

    if (user?.role !== 'SUPER_ADMIN') {
        return <Navigate to={getDashboardRoute(user?.role)} replace />;
    }

    return (
        <div className="space-y-6">
            <UserManagementSection />
        </div>
    );
};

export default UsersPage;
