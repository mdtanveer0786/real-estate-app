import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute — protects authenticated routes.
 *
 * During the initial loadUser() call (loading=true):
 *   - If user exists in localStorage (storedUser), show children immediately.
 *     AuthContext is still verifying in background, but we avoid a flash to /login.
 *   - If no user in localStorage, show a minimal loading spinner.
 *
 * After loadUser() completes (loading=false):
 *   - If no user, redirect to /login preserving the intended URL.
 */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Still verifying session but user data exists in memory → show page (no flash)
    if (loading && user) return children;

    // Verifying but nothing in memory yet → show spinner
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Not authenticated → send to login with return URL
    if (!user) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return children;
};

export default PrivateRoute;
