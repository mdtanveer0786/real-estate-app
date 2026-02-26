import api from './api';

const propertyService = {
    // Get all properties with filters
    getProperties: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`properties${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },

    // Get single property by ID
    getPropertyById: async (id) => {
        const response = await api.get(`properties/${id}`);
        return response.data;
    },

    // Create new property (admin)
    createProperty: async (propertyData) => {
        const response = await api.post('properties', propertyData);
        return response.data;
    },

    // Update property (admin)
    updateProperty: async (id, propertyData) => {
        const response = await api.put(`properties/${id}`, propertyData);
        return response.data;
    },

    // Delete property (admin)
    deleteProperty: async (id) => {
        const response = await api.delete(`properties/${id}`);
        return response.data;
    },

    // Upload property images (admin)
    uploadImages: async (id, formData) => {
        const response = await api.post(`properties/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Add/remove from wishlist
    toggleWishlist: async (id) => {
        const response = await api.post(`properties/${id}/wishlist`);
        return response.data;
    },

    // Get featured properties
    getFeaturedProperties: async (limit = 6) => {
        const response = await api.get(`properties?limit=${limit}&sort=-views`);
        return response.data;
    },

    // Search properties
    searchProperties: async (query) => {
        const response = await api.get(`properties?keyword=${encodeURIComponent(query)}&limit=5`);
        return response.data;
    },
};

export default propertyService;