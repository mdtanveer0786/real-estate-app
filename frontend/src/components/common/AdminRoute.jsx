import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('AdminRoute - User:', user); // DEBUG
  console.log('AdminRoute - Loading:', loading); // DEBUG

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" />;
  }

  console.log('User is admin, rendering admin panel');
  return children;
};

export default AdminRoute;