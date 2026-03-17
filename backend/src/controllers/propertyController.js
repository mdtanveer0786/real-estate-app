const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Property = require('../models/Property');
const mongoose = require('mongoose');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all properties with filters
// @route   GET /api/properties
// @access  Public
const getProperties = asyncHandler(async (req, res) => {
    try {
        const pageSize = 12;
        const page = Number(req.query.page) || 1;

        // Build filter object
        const filter = { status: 'available' };

        // Search by keyword
        if (req.query.keyword) {
            filter.$or = [
                { title: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } },
                { 'location.city': { $regex: req.query.keyword, $options: 'i' } },
                { 'location.address': { $regex: req.query.keyword, $options: 'i' } }
            ];
        }

        // Filter by type (buy/rent)
        if (req.query.type) {
            filter.type = req.query.type;
        }

        // Filter by property type
        if (req.query.propertyType) {
            filter.propertyType = req.query.propertyType;
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                filter.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.price.$lte = Number(req.query.maxPrice);
            }
        }

        // Filter by bedrooms
        if (req.query.bedrooms) {
            filter.bedrooms = { $gte: Number(req.query.bedrooms) };
        }

        // Filter by city
        if (req.query.city) {
            filter['location.city'] = { $regex: req.query.city, $options: 'i' };
        }


        // Get total count
        const totalCount = await Property.countDocuments(filter);

        // Get properties with pagination
        const properties = await Property.find(filter)
            .populate('createdBy', 'name email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(req.query.sort || '-createdAt');


        res.json({
            success: true,
            properties,
            page,
            pages: Math.ceil(totalCount / pageSize),
            total: totalCount
        });

    } catch (error) {
        console.error('Error in getProperties:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch properties',
            message: error.message
        });
    }
});

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id)
        .populate('createdBy', 'name email phone');

    if (property) {
        // Increment views
        property.views += 1;
        await property.save();

        res.json(property);
    } else {
        res.status(404);
        throw new Error('Property not found');
    }
});

// Helper to safely parse JSON — handles both string and already-parsed object
const safeParse = (value) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return value;
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private/Admin
const createProperty = asyncHandler(async (req, res) => {
    const { title, description, price, location, type, propertyType,
        bedrooms, bathrooms, area, features } = req.body;

    const property = await Property.create({
        title,
        description,
        price,
        location: safeParse(location),
        type,
        propertyType,
        bedrooms,
        bathrooms,
        area: safeParse(area),
        features: safeParse(features),
        createdBy: req.user._id,
    });

    if (property) {
        res.status(201).json(property);
    } else {
        res.status(400);
        throw new Error('Invalid property data');
    }
});

// @desc    Upload property images
// @route   POST /api/properties/:id/images
// @access  Private/Admin
const uploadPropertyImages = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('Please upload images');
    }

    // Upload each file buffer to Cloudinary
    const uploadPromises = req.files.map(file => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        return uploadToCloudinary(dataURI, 'properties');
    });

    const uploadedImages = await Promise.all(uploadPromises);

    property.images.push(...uploadedImages);
    await property.save();

    res.json(property);
});

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Admin
const updateProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Handle Cloudinary image cleanup if images were removed
    if (req.body.images) {
        const newImages = req.body.images;
        const removedImages = property.images.filter(
            oldImg => !newImages.some(newImg => newImg.public_id === oldImg.public_id)
        );

        // Delete removed images from Cloudinary
        const deletePromises = removedImages
            .filter(img => img.public_id)
            .map(img => deleteFromCloudinary(img.public_id));
        
        await Promise.all(deletePromises);
    }

    const updatedFields = {
        ...req.body,
        location: req.body.location ? safeParse(req.body.location) : property.location,
        area: req.body.area ? safeParse(req.body.area) : property.area,
        features: req.body.features ? safeParse(req.body.features) : property.features
    };

    const updatedProperty = await Property.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true, runValidators: true }
    );

    res.json(updatedProperty);
});

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Admin
const deleteProperty = asyncHandler(async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Delete images from Cloudinary
    const deletePromises = property.images
        .filter(img => img.public_id)
        .map(img => deleteFromCloudinary(img.public_id));
    await Promise.all(deletePromises);

    await property.deleteOne();
    res.json({ message: 'Property removed' });
});

// @desc    Add to wishlist
// @route   POST /api/properties/:id/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
    try {
        // First check if property exists
        const property = await Property.findById(req.params.id);

        if (!property) {
            res.status(404);
            throw new Error('Property not found');
        }

        // Get user and check if property already in wishlist
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Check if property is already in wishlist
        if (user.wishlist && user.wishlist.includes(req.params.id)) {
            // Remove from wishlist
            user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.id);
            await user.save();
            return res.json({
                message: 'Removed from wishlist',
                inWishlist: false
            });
        } else {
            // Add to wishlist
            if (!user.wishlist) user.wishlist = [];
            user.wishlist.push(req.params.id);
            await user.save();
            return res.json({
                message: 'Added to wishlist',
                inWishlist: true
            });
        }
    } catch (error) {
        console.error('Wishlist error:', error);
        res.status(500);
        throw new Error('Failed to update wishlist');
    }
});

module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    addToWishlist,
};