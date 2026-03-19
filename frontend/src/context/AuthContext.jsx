import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { setAccessToken, clearAccessToken, getAccessToken } from '../services/api';

const AuthContext = createContext(null);

// ── Helpers ──────────────────────────────────────────────────────────────────

const extractError = (err, fallback = 'Something went wrong') =>
    err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;

// ── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
    const [user, setUser]         = useState(() => {
        const savedUser = localStorage.getItem('user');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading]   = useState(true);
    const [token, setToken]       = useState(null); // access token (memory)
    const hasShownWelcome = useRef(false); // prevent duplicate toasts

    // ── Load user on app start ───────────────────────────────────────────────
    const loadUser = useCallback(async () => {
        try {
            // By calling /profile, we trigger the interceptor logic if needed.
            // If the token is missing or expired, api.js will handle the refresh automatically.
            const { data } = await api.get('/auth/profile');
            const accessToken = getAccessToken();
            setToken(accessToken);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
        } catch (err) {
            // If both profile and refresh fail, we clear state
            if (err.response?.status === 401 || err.response?.status === 403) {
                clearAccessToken();
                setToken(null);
                setUser(null);
                localStorage.removeItem('user');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUser(); }, [loadUser]);

    // ── Login ────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });

            // 2FA required — return indicator without setting auth state
            if (data.requiresTwoFactor) {
                return data;
            }

            setAccessToken(data.accessToken);
            setToken(data.accessToken);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Only show toast once per login
            if (!hasShownWelcome.current) {
                hasShownWelcome.current = true;
                toast.success(`Welcome back, ${data.user?.name?.split(' ')[0] || 'User'}!`);
                setTimeout(() => { hasShownWelcome.current = false; }, 3000);
            }
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Invalid email or password'));
            throw err;
        }
    };

    // ── 2FA Login Verification ───────────────────────────────────────────────
    const verify2FALogin = async (tempToken, code) => {
        try {
            const { data } = await api.post('/auth/2fa/verify-login', { tempToken, code });
            setAccessToken(data.accessToken);
            setToken(data.accessToken);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (!hasShownWelcome.current) {
                hasShownWelcome.current = true;
                toast.success(`Welcome back, ${data.user?.name?.split(' ')[0] || 'User'}!`);
                setTimeout(() => { hasShownWelcome.current = false; }, 3000);
            }
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Invalid 2FA code'));
            throw err;
        }
    };

    // ── Register ─────────────────────────────────────────────────────────────
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

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Always clear local state
        }
        clearAccessToken();
        setToken(null);
        setUser(null);
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    // ── Update Profile ───────────────────────────────────────────────────────
    const updateProfile = async (profileData) => {
        try {
            const { data } = await api.put('/auth/profile', profileData);
            if (data.accessToken) {
                setAccessToken(data.accessToken);
                setToken(data.accessToken);
            }
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            toast.success('Profile updated successfully');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Profile update failed'));
            throw err;
        }
    };

    // ── Forgot Password ─────────────────────────────────────────────────────
    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgotpassword', { email });
            toast.success(data.message);
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Failed to send reset email'));
            throw err;
        }
    };

    // ── Reset Password ──────────────────────────────────────────────────────
    const resetPassword = async (resetToken, password) => {
        try {
            const { data } = await api.put(`/auth/resetpassword/${resetToken}`, { password });
            if (data.accessToken) {
                setAccessToken(data.accessToken);
                setToken(data.accessToken);
            }
            toast.success('Password reset successful!');
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Password reset failed'));
            throw err;
        }
    };

    // ── Resend Verification ─────────────────────────────────────────────────
    const resendVerification = async (email) => {
        try {
            const { data } = await api.post('/auth/resendverification', { email });
            toast.success(data.message);
            return data;
        } catch (err) {
            toast.error(extractError(err, 'Failed to resend verification email'));
            throw err;
        }
    };

    // ── Google OAuth Success (called from redirect page) ────────────────────
    const handleGoogleSuccess = async (accessToken) => {
        setAccessToken(accessToken);
        setToken(accessToken);
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            toast.success('Signed in with Google');
            return data;
        } catch (err) {
            clearAccessToken();
            setToken(null);
            toast.error('Google login failed. Please try again.');
            throw err;
        }
    };

    // ── 2FA Setup ────────────────────────────────────────────────────────────
    const setup2FA = async () => {
        const { data } = await api.post('/auth/2fa/setup');
        return data;
    };

    const verify2FA = async (code) => {
        const { data } = await api.post('/auth/2fa/verify', { code });
        setUser(prev => ({ ...prev, twoFactorEnabled: true }));
        toast.success('2FA enabled successfully!');
        return data;
    };

    const disable2FA = async (code) => {
        const { data } = await api.post('/auth/2fa/disable', { code });
        setUser(prev => ({ ...prev, twoFactorEnabled: false }));
        toast.success('2FA disabled.');
        return data;
    };

    // isAuthenticated uses !!user so it stays true from localStorage during initial load
    // loading is true only during the first loadUser() call
    const isAuthenticated = !!user;

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword,
        resendVerification,
        handleGoogleSuccess,
        verify2FALogin,
        setup2FA,
        verify2FA,
        disable2FA,
        loadUser,
        isAdmin: user?.role === 'admin',
        isAgent: user?.role === 'agent',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export default AuthContext;
