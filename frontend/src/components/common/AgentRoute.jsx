import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const AgentRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) return <Loader />;

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (user?.role !== 'agent' && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AgentRoute;
