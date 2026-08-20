import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RoleRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    if (user) {
        if (user.role === 'SUPER_ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        if (user.role === 'PHARMACY_ADMIN' || user.role === 'PHARMACIST') {
            return <Navigate to="/pharmacy/dashboard" replace />;
        }
        if (user.role === 'DELIVERY_AGENT') {
            return <Navigate to="/delivery/dashboard" replace />;
        }
    }

    return <>{children}</>;
};
