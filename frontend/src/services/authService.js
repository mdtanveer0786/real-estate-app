import api from './api';
import { setAccessToken, clearAccessToken } from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user — returns access token + user data; refresh token set as cookie
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Verify 2FA code during login
    verify2FALogin: async (tempToken, code) => {
        const response = await api.post('/auth/2fa/verify-login', { tempToken, code });
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Logout user — clears refresh token cookie + server-side token
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Always clear local state even if server call fails
        }
        clearAccessToken();
        localStorage.removeItem('user');
    },

    // Refresh access token using HTTP-only cookie
    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Get current user profile
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Forgot password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgotpassword', { email });
        return response.data;
    },

    // Reset password
    resetPassword: async (resetToken, password) => {
        const response = await api.put(`/auth/resetpassword/${resetToken}`, { password });
        if (response.data.accessToken) {
            setAccessToken(response.data.accessToken);
        }
        return response.data;
    },

    // 2FA Setup
    setup2FA: async () => {
        const response = await api.post('/auth/2fa/setup');
        return response.data;
    },

    // 2FA Verify (enable)
    verify2FA: async (code) => {
        const response = await api.post('/auth/2fa/verify', { code });
        return response.data;
    },

    // 2FA Disable
    disable2FA: async (code) => {
        const response = await api.post('/auth/2fa/disable', { code });
        return response.data;
    },

    // Get current user from localStorage (cached)
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try { return JSON.parse(userStr); } catch { return null; }
        }
        return null;
    },

    // Check if user is authenticated (has cached user data)
    isAuthenticated: () => {
        return !!localStorage.getItem('user');
    },

    // Check if user is admin
    isAdmin: () => {
        const user = authService.getCurrentUser();
        return user?.role === 'admin';
    },

    // Check if user is agent
    isAgent: () => {
        const user = authService.getCurrentUser();
        return user?.role === 'agent';
    },

    // Google OAuth — redirect to backend
    googleLogin: () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${apiUrl}/api/auth/google`;
    },
};

export default authService;