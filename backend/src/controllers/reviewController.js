'use strict';

const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Property = require('../models/Property');

// @desc    Create a review for a property
// @route   POST /api/reviews/:propertyId
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { rating, title, comment } = req.body;

    const property = await Property.findById(req.params.propertyId);
    if (!property) {
        res.status(404);
        throw new Error('Property not found');
    }

    // Check if user already reviewed this property
    const existing = await Review.findOne({
        user: req.user._id,
        property: req.params.propertyId,
    });
    if (existing) {
        res.status(400);
        throw new Error('You have already reviewed this property');
    }

    const review = await Review.create({
        user: req.user._id,
        property: req.params.propertyId,
        rating,
        title,
        comment,
    });

    res.status(201).json({
        success: true,
        review,
    });
});

// @desc    Get reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public
const getPropertyReviews = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const total = await Review.countDocuments({ property: req.params.propertyId });
    const reviews = await Review.find({ property: req.params.propertyId })
        .populate('user', 'name avatar')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit);

    res.json({
        success: true,
        reviews,
        page,
        pages: Math.ceil(total / limit),
        total,
    });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (owner or admin)
const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    await review.deleteOne();
    res.json({ success: true, message: 'Review removed' });
});

module.exports = { createReview, getPropertyReviews, deleteReview };
