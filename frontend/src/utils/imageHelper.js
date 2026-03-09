const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Normalizes image URLs to ensure they work regardless of whether they are
 * absolute (Cloudinary/Unsplash) or relative (local backend public folder).
 * 
 * @param {string} url - The image URL to normalize
 * @returns {string} - The normalized URL
 */
export const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/800x600?text=No+Image';

    // If it's already an absolute URL (starts with http or https), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Otherwise, prepend the API_URL (removing trailing slash from API_URL and leading slash from url)
    const cleanBaseUrl = API_URL.replace(/\/+$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBaseUrl}${cleanPath}`;
};
