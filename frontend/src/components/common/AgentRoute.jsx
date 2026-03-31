import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AgentRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading && user) return children;
    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    if (user.role !== 'agent' && user.role !== 'admin') return <Navigate to="/" replace />;

    return children;
};

export default AgentRoute;
