import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    // Ensure baseURL includes the /api prefix
    baseURL: `${API_URL.replace(/\/+$/, '')}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for tokens and URL safety
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Prevent double /api prefixing if the request URL already starts with /api
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

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;