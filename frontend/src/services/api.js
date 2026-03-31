/**
 * api.js — Axios instance with automatic JWT refresh.
 *
 * Token strategy:
 *   Access token  → stored in-memory (_accessToken), 15m TTL
 *   Refresh token → HTTP-only cookie (refreshToken), 7d TTL
 *
 * On every page load / refresh:
 *   1. AuthContext.loadUser() calls /auth/refresh first to get a fresh access token
 *   2. Then calls /auth/profile with that token to restore user state
 *   This avoids hitting /auth/profile unauthenticated and triggering a double-refresh race.
 */
import axios from 'axios';
import { getSocket } from '../hooks/useSocket';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

// ── In-memory access token (never in localStorage/sessionStorage) ─────────────
let _accessToken = null;

export const setAccessToken  = (t) => { _accessToken = t; };
export const getAccessToken  = ()  => _accessToken;
export const clearAccessToken= ()  => { _accessToken = null; };

// ── Axios instance ─────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL:         `${API_URL}/api`,
    headers:         { 'Content-Type': 'application/json' },
    timeout:         30000,
    withCredentials: true,   // send/receive HTTP-only cookies cross-origin
});

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use(
    (config) => {
        if (_accessToken) {
            config.headers.Authorization = `Bearer ${_accessToken}`;
        }
        // Strip accidental /api prefix duplication
        if (config.url && !config.url.startsWith('http')) {
            if (config.url.startsWith('/api/')) config.url = config.url.slice(4);
            else if (config.url.startsWith('/api'))  config.url = config.url.slice(4);
        }
        return config;
    },
    (err) => Promise.reject(err)
);

// ── Token refresh queue ────────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];          // pending requests during refresh

const flushQueue = (token, error = null) => {
    refreshQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token)
    );
    refreshQueue = [];
};

// Routes that must NEVER trigger an auto-refresh attempt
const NO_REFRESH_ROUTES = [
    '/auth/login', '/auth/register', '/auth/forgotpassword',
    '/auth/resetpassword', '/auth/verifyemail', '/auth/resendverification',
    '/auth/refresh', '/auth/logout', '/auth/google',
    '/auth/2fa/verify-login', '/contact',
];

// ── Response interceptor: handle 401 → refresh ────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const url      = original?.url || '';
        const skip     = NO_REFRESH_ROUTES.some((r) => url.includes(r));

        if (error.response?.status !== 401 || skip || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshing) {
            // Queue this request until the refresh completes
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            });
        }

        isRefreshing = true;

        try {
            const { data } = await axios.post(
                `${API_URL}/api/auth/refresh`,
                {},
                { withCredentials: true }   // raw axios — not the intercepted instance
            );

            const newToken = data.accessToken;
            _accessToken   = newToken;
            isRefreshing   = false;

            // Update socket auth
            const sock = getSocket();
            if (sock) {
                sock.auth = { token: newToken };
                if (!sock.connected) sock.connect();
            }

            flushQueue(newToken);

            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
        } catch (refreshErr) {
            isRefreshing  = false;
            _accessToken  = null;
            flushQueue(null, refreshErr);

            // Clear stale user from localStorage so the app shows login
            localStorage.removeItem('user');

            return Promise.reject(refreshErr);
        }
    }
);

export default api;
