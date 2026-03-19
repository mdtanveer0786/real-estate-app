'use strict';

const asyncHandler = require('express-async-handler');
const PropertyService = require('../services/propertyService');
const User = require('../models/User');

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
    const result = await PropertyService.list(req.query);
    res.json({ success: true, ...result });
});

// @desc    Get single property by ID or slug
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
    const property = await PropertyService.getById(req.params.id);
    res.json({ success: true, property });
});

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
const getFeaturedProperties = asyncHandler(async (req, res) => {
    const properties = await PropertyService.getFeatured(Number(req.query.limit) || 6);
    res.json({ success: true, properties });
});

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
// @access  Public
const getSimilarProperties = asyncHandler(async (req, res) => {
    const properties = await PropertyService.getSimilar(req.params.id, 4);
    res.json({ success: true, properties });
});

// @desc    Create a property
// @route   POST /api/properties
// @access  Private/Agent+Admin
const createProperty = asyncHandler(async (req, res) => {
    const property = await PropertyService.create(req.body, req.user._id);
    res.status(201).json({ success: true, property });
});

// @desc    Upload property images
// @route   POST /api/properties/:id/images
// @access  Private/Agent+Admin
const uploadPropertyImages = asyncHandler(async (req, res) => {
    const property = await PropertyService.uploadImages(
        req.params.id, req.files, req.user._id, req.user.role
    );
    res.json({ success: true, property });
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Agent+Admin
const updateProperty = asyncHandler(async (req, res) => {
    const property = await PropertyService.update(
        req.params.id, req.body, req.user._id, req.user.role
    );
    res.json({ success: true, property });
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Agent+Admin
const deleteProperty = asyncHandler(async (req, res) => {
    const result = await PropertyService.delete(
        req.params.id, req.user._id, req.user.role
    );
    res.json({ success: true, ...result });
});

// @desc    Toggle wishlist
// @route   POST /api/properties/:id/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const propertyId = req.params.id;
    const inWishlist = user.wishlist?.includes(propertyId);

    if (inWishlist) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== propertyId);
        await user.save();
        return res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
    }

    if (!user.wishlist) user.wishlist = [];
    user.wishlist.push(propertyId);
    await user.save();
    res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
});

module.exports = {
    getProperties,
    getPropertyById,
    getFeaturedProperties,
    getSimilarProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    addToWishlist,
};