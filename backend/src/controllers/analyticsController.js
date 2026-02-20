const asyncHandler = require('express-async-handler');
const Property = require('../models/Property');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');

// @desc    Get property analytics
// @route   GET /api/analytics/properties
// @access  Private/Admin
const getPropertyAnalytics = asyncHandler(async (req, res) => {
    const { timeframe = 'month' } = req.query;

    let groupBy;
    let dateFormat;

    switch (timeframe) {
        case 'day':
            groupBy = { $dayOfMonth: '$createdAt' };
            dateFormat = '%d';
            break;
        case 'week':
            groupBy = { $week: '$createdAt' };
            dateFormat = '%U';
            break;
        case 'month':
            groupBy = { $month: '$createdAt' };
            dateFormat = '%m';
            break;
        case 'year':
            groupBy = { $year: '$createdAt' };
            dateFormat = '%Y';
            break;
        default:
            groupBy = { $month: '$createdAt' };
            dateFormat = '%m';
    }

    const propertiesByTime = await Property.aggregate([
        {
            $group: {
                _id: groupBy,
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const propertiesByType = await Property.aggregate([
        {
            $group: {
                _id: '$propertyType',
                count: { $sum: 1 },
            },
        },
    ]);

    const propertiesByStatus = await Property.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const propertiesByCity = await Property.aggregate([
        {
            $group: {
                _id: '$location.city',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
    ]);

    const averagePriceByType = await Property.aggregate([
        {
            $group: {
                _id: '$propertyType',
                averagePrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
    ]);

    res.json({
        propertiesByTime,
        propertiesByType,
        propertiesByStatus,
        propertiesByCity,
        averagePriceByType,
    });
});

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });

    const usersByMonth = await User.aggregate([
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const usersWithWishlist = await User.aggregate([
        {
            $match: {
                wishlist: { $exists: true, $ne: [] },
            },
        },
        {
            $count: 'total',
        },
    ]);

    res.json({
        totalUsers,
        adminCount,
        userCount,
        usersByMonth,
        usersWithWishlist: usersWithWishlist[0]?.total || 0,
    });
});

// @desc    Get inquiry analytics
// @route   GET /api/analytics/inquiries
// @access  Private/Admin
const getInquiryAnalytics = asyncHandler(async (req, res) => {
    const totalInquiries = await Inquiry.countDocuments();

    const inquiriesByStatus = await Inquiry.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    const inquiriesByMonth = await Inquiry.aggregate([
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const topProperties = await Inquiry.aggregate([
        {
            $group: {
                _id: '$property',
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'properties',
                localField: '_id',
                foreignField: '_id',
                as: 'property',
            },
        },
        {
            $unwind: '$property',
        },
        {
            $project: {
                'property.title': 1,
                count: 1,
            },
        },
    ]);

    res.json({
        totalInquiries,
        inquiriesByStatus,
        inquiriesByMonth,
        topProperties,
    });
});

module.exports = {
    getPropertyAnalytics,
    getUserAnalytics,
    getInquiryAnalytics,
};