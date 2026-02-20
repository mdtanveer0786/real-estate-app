const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'wishlist',
            select: 'title price images location bedrooms bathrooms area type'
        });

    res.json(user.wishlist || []);
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:propertyId
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.propertyId);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    const user = await User.findById(req.user._id);

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) {
        user.wishlist = [];
    }

    // Check if already in wishlist
    if (user.wishlist.includes(req.params.propertyId)) {
        res.status(400);
        throw new Error('Property already in wishlist');
    }

    user.wishlist.push(req.params.propertyId);
    await user.save();

    // Return populated wishlist
    const updatedUser = await User.findById(req.user._id)
        .populate('wishlist');

    res.json(updatedUser.wishlist);
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:propertyId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user.wishlist) {
        user.wishlist = [];
    }

    user.wishlist = user.wishlist.filter(
        id => id.toString() !== req.params.propertyId
    );

    await user.save();

    // Return updated wishlist
    const updatedUser = await User.findById(req.user._id)
        .populate('wishlist');

    res.json(updatedUser.wishlist);
});

// @desc    Get user inquiries
// @route   GET /api/users/inquiries
// @access  Private
const getUserInquiries = asyncHandler(async (req, res) => {
    const inquiries = await Inquiry.find({ user: req.user._id })
        .populate('property', 'title images price location')
        .sort('-createdAt');

    res.json(inquiries);
});

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getUserInquiries,
};