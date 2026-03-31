'use strict';

const asyncHandler = require('express-async-handler');
const User       = require('../models/User');
const Property   = require('../models/Property');
const Inquiry    = require('../models/Inquiry');
const Subscription = require('../models/Subscription');

// GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
    const now   = new Date();
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const week  = new Date(now - 7 * 86400000);

    const [
        totalProperties, totalUsers, totalAgents, totalInquiries,
        newInquiries, availableProperties, soldProperties, rentedProperties,
        newPropertiesThisMonth, newUsersThisWeek, activeSubscriptions,
        recentProperties, recentInquiries,
    ] = await Promise.all([
        Property.countDocuments(),
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'agent' }),
        Inquiry.countDocuments(),
        Inquiry.countDocuments({ status: 'new' }),
        Property.countDocuments({ status: 'available' }),
        Property.countDocuments({ status: 'sold' }),
        Property.countDocuments({ status: 'rented' }),
        Property.countDocuments({ createdAt: { $gte: month } }),
        User.countDocuments({ createdAt: { $gte: week } }),
        Subscription.countDocuments({ status: 'active', plan: { $ne: 'free' } }),
        Property.find().sort({ createdAt: -1 }).limit(6)
            .populate('createdBy', 'name avatar')
            .select('title price location status type propertyType images createdAt views'),
        Inquiry.find().sort({ createdAt: -1 }).limit(6)
            .populate('property', 'title')
            .select('name email phone message status createdAt'),
    ]);

    res.json({
        success: true,
        stats: {
            totalProperties, totalUsers, totalAgents, totalInquiries,
            newInquiries, availableProperties, soldProperties, rentedProperties,
            newPropertiesThisMonth, newUsersThisWeek, activeSubscriptions,
        },
        recentProperties,
        recentInquiries,
    });
});

// GET /api/admin/users?page=1&limit=20&search=&role=
const getUsers = asyncHandler(async (req, res) => {
    const { search = '', role = '', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role)   filter.role   = role;
    if (search) filter.$or    = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
    ];

    const [total, users] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter).select('-password -refreshToken -twoFactorSecret')
            .sort('-createdAt')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit)),
    ]);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// PUT /api/admin/users/:id  — update role or verified status
const updateUser = asyncHandler(async (req, res) => {
    const { role, isVerified, isBanned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
        res.status(403); throw new Error('Cannot modify another admin');
    }
    if (role)                    user.role       = role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    await user.save();
    res.json({ success: true, user: { ...user.toObject(), password: undefined } });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete an admin account'); }
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
});

// GET /api/admin/properties?page=1&search=&status=&type=
const getAllProperties = asyncHandler(async (req, res) => {
    const { search = '', status = '', type = '', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.type   = type;
    if (search) filter.$or    = [
        { title:           { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
    ];

    const [total, properties] = await Promise.all([
        Property.countDocuments(filter),
        Property.find(filter)
            .populate('createdBy', 'name email avatar')
            .sort('-createdAt')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit)),
    ]);

    res.json({ success: true, properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// PUT /api/admin/properties/:id/feature
const toggleFeatured = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);
    if (!property) { res.status(404); throw new Error('Property not found'); }
    property.featured = !property.featured;
    await property.save();
    res.json({ success: true, featured: property.featured });
});

// PUT /api/admin/properties/:id/status
const updatePropertyStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowed = ['available', 'sold', 'rented', 'pending', 'draft'];
    if (!allowed.includes(status)) { res.status(400); throw new Error('Invalid status'); }
    const property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!property) { res.status(404); throw new Error('Property not found'); }
    res.json({ success: true, property });
});

module.exports = {
    getDashboardStats, getUsers, updateUser, deleteUser,
    getAllProperties, toggleFeatured, updatePropertyStatus,
};
