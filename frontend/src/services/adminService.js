import api from './api';

const adminService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Get all users
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    // Delete user
    deleteUser: async (userId) => {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Get all inquiries
    getInquiries: async () => {
        const response = await api.get('/inquiries');
        return response.data;
    },

    // Update inquiry status
    updateInquiryStatus: async (inquiryId, status) => {
        const response = await api.put(`/inquiries/${inquiryId}`, { status });
        return response.data;
    },

    // Get recent activities
    getRecentActivities: async () => {
        const [properties, inquiries] = await Promise.all([
            api.get('/properties?limit=5&sort=-createdAt'),
            api.get('/inquiries?limit=5&sort=-createdAt'),
        ]);

        return {
            recentProperties: properties.data.properties,
            recentInquiries: inquiries.data,
        };
    },
};

export default adminService;