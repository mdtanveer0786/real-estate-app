/**
 * AuthContext.jsx
 *
 * Fix: page refresh used to log users out because:
 *   1. loadUser() called /auth/profile without a token → 401
 *   2. Interceptor tried /auth/refresh → raced or failed → cleared user
 *
 * Fix: loadUser() now calls /auth/refresh FIRST to restore the access token,
 * then calls /auth/profile. If the refresh cookie is missing/expired the user
 * is truly logged out and the state is cleared cleanly — no flash/race.
 */
import React, {
    createContext, useState, useContext,
    useEffect, useCallback, useRef,
} from 'react';
import toast from 'react-hot-toast';
import api, { setAccessToken, clearAccessToken, getAccessToken } from '../services/api';
import axios from 'axios';

const AuthContext = createContext(null);

const extractError = (err, fallback = 'Something went wrong') =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message || fallback;

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// ── Safely parse user from localStorage ────────────────────────────────────
const storedUser = () => {
    try {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    } catch { return null; }
};

// ── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
    // Seed from localStorage so UI doesn't flash on cold load
    const [user,    setUser]    = useState(storedUser);
    const [loading, setLoading] = useState(true);
    const welcomeShown = useRef(false);

    // ── Restore session on page load / refresh ────────────────────────────
    const loadUser = useCallback(async () => {
        setLoading(true);
        try {
            // Step 1: get a fresh access token from the HTTP-only cookie
            const refreshRes = await axios.post(
                `${API_URL}/api/auth/refresh`,
                {},
                { withCredentials: true }
            );
            const accessToken = refreshRes.data.accessToken;
            setAccessToken(accessToken);

            // Step 2: fetch full profile with the new token
            const { data: profile } = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
        } catch {
            // Refresh token missing or expired → user is genuinely logged out
            clearAccessToken();
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUser(); }, [loadUser]);

    // ── Login ──────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });

            if (data.requiresTwoFactor) return data; // caller handles 2FA

            setAccessToken(data.accessToken);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (!welcomeShown.current) {
                welcomeShown.current = true;
                toast.success(`Welcome back, ${data.user?.name?.split(' ')[0] || 'User'}! 👋`);
                setTimeout(() => { welcomeShown.current = false; }, 3000);
            }
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Invalid email or password'));
            throw err;
        }
    };

    // ── 2FA ────────────────────────────────────────────────────────────────
    const verify2FALogin = async (tempToken, code) => {
        try {
            const { data } = await api.post('/auth/2fa/verify-login', { tempToken, code });
            setAccessToken(data.accessToken);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (!welcomeShown.current) {
                welcomeShown.current = true;
                toast.success(`Welcome back, ${data.user?.name?.split(' ')[0] || 'User'}! 👋`);
                setTimeout(() => { welcomeShown.current = false; }, 3000);
            }
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Invalid 2FA code'));
            throw err;
        }
    };

    // ── Register ───────────────────────────────────────────────────────────
    const register = async (name, email, password, role) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            toast.success('Registration successful! Please verify your email.');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Registration failed'));
            throw err;
        }
    };

    // ── Logout ─────────────────────────────────────────────────────────────
    const logout = async () => {
        try { await api.post('/auth/logout'); } catch { /* always clear */ }
        clearAccessToken();
        setUser(null);
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    // ── Update Profile ─────────────────────────────────────────────────────
    const updateProfile = async (profileData) => {
        try {
            const { data } = await api.put('/auth/profile', profileData);
            if (data.accessToken) setAccessToken(data.accessToken);
            const updated = data.user || data;
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
            toast.success('Profile updated successfully');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Profile update failed'));
            throw err;
        }
    };

    // ── Forgot / Reset Password ───────────────────────────────────────────
    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            toast.success(data.message || 'Reset link sent to your email');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Failed to send reset email'));
            throw err;
        }
    };

    const resetPassword = async (resetToken, password) => {
        try {
            const { data } = await api.put(`/auth/resetpassword/${resetToken}`, { password });
            if (data.accessToken) setAccessToken(data.accessToken);
            toast.success('Password reset successful!');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Password reset failed'));
            throw err;
        }
    };

    // ── Resend Verification ────────────────────────────────────────────────
    const resendVerification = async (email) => {
        try {
            const { data } = await api.post('/auth/resendverification', { email });
            toast.success(data.message || 'Verification email sent');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Failed to resend verification email'));
            throw err;
        }
    };

    // ── Google OAuth ───────────────────────────────────────────────────────
    const handleGoogleSuccess = async (accessToken) => {
        setAccessToken(accessToken);
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            if (!welcomeShown.current) {
                welcomeShown.current = true;
                toast.success(`Welcome, ${data.name?.split(' ')[0] || 'User'}! 👋`);
                setTimeout(() => { welcomeShown.current = false; }, 3000);
            }
            return data;
        } catch (err) {
            clearAccessToken();
            setUser(null);
            localStorage.removeItem('user');
            toast.error('Google login failed. Please try again.');
            throw err;
        }
    };

    // ── 2FA Setup / Disable ────────────────────────────────────────────────
    const setup2FA   = async () => { const { data } = await api.post('/auth/2fa/setup');   return data; };
    const verify2FA  = async (code) => {
        const { data } = await api.post('/auth/2fa/verify', { code });
        setUser(prev => ({ ...prev, twoFactorEnabled: true }));
        toast.success('2FA enabled!');
        return data;
    };
    const disable2FA = async (code) => {
        const { data } = await api.post('/auth/2fa/disable', { code });
        setUser(prev => ({ ...prev, twoFactorEnabled: false }));
        toast.success('2FA disabled.');
        return data;
    };

    const value = {
        user, loading,
        isAuthenticated: !!user,
        isAdmin:  user?.role === 'admin',
        isAgent:  user?.role === 'agent' || user?.role === 'admin',
        login, register, logout,
        updateProfile, forgotPassword, resetPassword, resendVerification,
        handleGoogleSuccess, verify2FALogin, setup2FA, verify2FA, disable2FA,
        loadUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export default AuthContext;
