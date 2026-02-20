import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
};

export default AdminRoute;