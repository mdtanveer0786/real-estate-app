'use strict';

const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validate');
const { createReviewSchema } = require('../validators/propertyValidator');
const {
    createReview,
    getPropertyReviews,
    deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Get reviews for a property (public)
router.get('/:propertyId', getPropertyReviews);

// Create review (authenticated)
router.post('/:propertyId', protect, validate(createReviewSchema), createReview);

// Delete review (owner or admin)
router.delete('/:id', protect, deleteReview);

module.exports = router;
