import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── In-memory access token (never in localStorage) ──────────────────────────
let _accessToken = null;

export const setAccessToken = (token) => { _accessToken = token; };
export const getAccessToken = () => _accessToken;
export const clearAccessToken = () => { _accessToken = null; };

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: `${API_URL.replace(/\/+$/, '')}/api`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
    withCredentials: true, // Required for HTTP-only cookie support
});

// ── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        // Attach access token from memory
        if (_accessToken) {
            config.headers.Authorization = `Bearer ${_accessToken}`;
        }

        // Prevent double /api prefixing
        if (config.url && !config.url.startsWith('http')) {
            if (config.url.startsWith('/api/')) {
                config.url = config.url.substring(5);
            } else if (config.url.startsWith('/api')) {
                config.url = config.url.substring(4);
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor with auto-refresh ──────────────────────────────────

// Prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
    refreshSubscribers.forEach(cb => cb(newToken));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
    refreshSubscribers.push(cb);
};

// Public routes that should NOT trigger refresh/redirect
const publicRoutes = [
    '/auth/login', '/auth/register', '/auth/forgotpassword',
    '/auth/resetpassword', '/auth/verifyemail', '/auth/resendverification',
    '/auth/refresh', '/auth/logout', '/auth/google', '/auth/2fa/verify-login',
    '/contact',
];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || '';
        const isPublicRoute = publicRoutes.some(route => requestUrl.includes(route));

        // Only attempt refresh on 401 for non-public, non-retried requests
        if (error.response?.status === 401 && !isPublicRoute && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const { data } = await api.post('/auth/refresh');
                    _accessToken = data.accessToken;
                    isRefreshing = false;
                    onRefreshed(data.accessToken);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    refreshSubscribers = [];
                    _accessToken = null;
                    localStorage.removeItem('user');

                    // Instead of hard redirect, let the application handle the 401 error
                    return Promise.reject(refreshError);
                }
            }

            // Queue requests while refresh is in progress
            return new Promise((resolve) => {
                addRefreshSubscriber((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;