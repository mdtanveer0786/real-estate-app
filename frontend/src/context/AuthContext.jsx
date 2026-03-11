import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Helper to extract error message from API response
const getErrorMessage = (error, fallback = 'Something went wrong') => {
    return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        fallback
    );
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
        } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            toast.success(`Welcome back, ${data.name || 'User'}!`);

            if (data.role === 'admin') {
                window.location.href = '/admin';
            }
            return data;
        } catch (error) {
            toast.error(getErrorMessage(error, 'Invalid email or password'));
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            toast.success('Registration successful! Please login to continue.');
            return data;
        } catch (error) {
            toast.error(getErrorMessage(error, 'Registration failed. Please try again.'));
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateProfile = async (userData) => {
        try {
            const { data } = await api.put('/auth/profile', userData);
            setUser(data);
            toast.success('Profile updated successfully');
            return data;
        } catch (error) {
            toast.error(getErrorMessage(error, 'Update failed'));
            throw error;
        }
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            toast.success(data.message || 'Password reset email sent!');
            return data;
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to send reset email'));
            throw error;
        }
    };

    const resetPassword = async (resetToken, password) => {
        try {
            const { data } = await api.put(`/auth/resetpassword/${resetToken}`, { password });
            toast.success(data.message || 'Password reset successful!');
            return data;
        } catch (error) {
            toast.error(getErrorMessage(error, 'Password reset failed'));
            throw error;
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
