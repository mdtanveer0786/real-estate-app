const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Normalizes image URLs to ensure they work regardless of whether they are
 * absolute (Cloudinary/Unsplash) or relative (local backend public folder).
 * 
 * @param {string} url - The image URL to normalize
 * @returns {string} - The normalized URL
 */
export const getImageUrl = (url) => {
    if (!url) return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath d='M340 240h120v30h-30v60h-60v-60h-30z' fill='%23d1d5db'/%3E%3C/svg%3E`;

    // If it's already an absolute URL (starts with http or https), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Otherwise, prepend the API_URL (removing trailing slash from API_URL and leading slash from url)
    const cleanBaseUrl = API_URL.replace(/\/+$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBaseUrl}${cleanPath}`;
};
