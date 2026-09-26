import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/roleUtils';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user's role is allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on user's actual role
        const route = getDashboardRoute(user.role);
        return <Navigate to={route} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
