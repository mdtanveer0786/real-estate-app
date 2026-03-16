'use strict';

const asyncHandler = require('express-async-handler');
const User     = require('../models/User');
const Property = require('../models/Property');
const Inquiry  = require('../models/Inquiry');

// @desc   Dashboard stats
// @route  GET /api/admin/stats
// @access Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalProperties,
        totalUsers,
        totalInquiries,
        newInquiries,
        availableProperties,
        soldProperties,
        rentedProperties,
        recentProperties,
        recentInquiries,
    ] = await Promise.all([
        Property.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Inquiry.countDocuments(),
        Inquiry.countDocuments({ status: 'new' }),
        Property.countDocuments({ status: 'available' }),
        Property.countDocuments({ status: 'sold' }),
        Property.countDocuments({ status: 'rented' }),
        Property.find().sort({ createdAt: -1 }).limit(5)
            .populate('createdBy', 'name')
            .select('title price location status createdAt'),
        Inquiry.find().sort({ createdAt: -1 }).limit(5)
            .populate('property', 'title')
            .select('name email message status createdAt'),
    ]);

    res.json({
        success: true,
        stats: {
            totalProperties,
            totalUsers,
            totalInquiries,
            newInquiries,
            availableProperties,
            soldProperties,
            rentedProperties,
        },
        recentProperties,
        recentInquiries,
    });
});

// @desc   Get all users
// @route  GET /api/admin/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort('-createdAt');
    res.json({ success: true, users });
});

// @desc   Delete user
// @route  DELETE /api/admin/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete an admin account'); }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
});

// @desc   Get all properties (admin view)
// @route  GET /api/admin/properties
// @access Private/Admin
const getAllProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find({})
        .populate('createdBy', 'name email')
        .sort('-createdAt');
    res.json({ success: true, properties });
});

module.exports = { getDashboardStats, getUsers, deleteUser, getAllProperties };
