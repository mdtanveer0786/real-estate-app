import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

const extractError = (error, fallback = 'Something went wrong') =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback;

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken]     = useState(() => localStorage.getItem('token'));

    useEffect(() => {
        if (token) loadUser();
        else setLoading(false);
    }, [token]);

    const loadUser = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
        } catch {
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    // ── login ──────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            toast.success(`Welcome back, ${data.name}!`);
            if (data.role === 'admin') window.location.href = '/admin';
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Invalid email or password'));
            throw err;
        }
    };

    // ── register ───────────────────────────────────────────────────────────
    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData);
            // Do NOT auto-login – user must verify email first
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Registration failed. Please try again.'));
            throw err;
        }
    };

    // ── logout ─────────────────────────────────────────────────────────────
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    // ── updateProfile ──────────────────────────────────────────────────────
    const updateProfile = async (userData) => {
        try {
            const { data } = await api.put('/auth/profile', userData);
            setUser(data);
            toast.success('Profile updated successfully');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Update failed'));
            throw err;
        }
    };

    // ── forgotPassword ─────────────────────────────────────────────────────
    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            toast.success(data.message || 'If an account exists, a reset link has been sent.');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Failed to send reset email'));
            throw err;
        }
    };

    // ── resetPassword ──────────────────────────────────────────────────────
    const resetPassword = async (resetToken, password) => {
        try {
            const { data } = await api.put(`/auth/resetpassword/${resetToken}`, { password });
            toast.success(data.message || 'Password reset successful!');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Password reset failed. The link may have expired.'));
            throw err;
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
