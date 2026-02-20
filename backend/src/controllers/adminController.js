const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalProperties = await Property.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalInquiries = await Inquiry.countDocuments();
    const newInquiries = await Inquiry.countDocuments({ status: 'new' });
    const availableProperties = await Property.countDocuments({ status: 'available' });
    const soldProperties = await Property.countDocuments({ status: 'sold' });

    // Recent properties
    const recentProperties = await Property.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name');

    // Recent inquiries
    const recentInquiries = await Inquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('property', 'title');

    res.json({
        stats: {
            totalProperties,
            totalUsers,
            totalInquiries,
            newInquiries,
            availableProperties,
            soldProperties,
        },
        recentProperties,
        recentInquiries,
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user && user.role !== 'admin') {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found or cannot delete admin');
    }
});

module.exports = {
    getDashboardStats,
    getUsers,
    deleteUser,
};