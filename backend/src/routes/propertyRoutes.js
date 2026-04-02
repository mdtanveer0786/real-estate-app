'use strict';

const express = require('express');
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    getFeaturedProperties,
    getSimilarProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    addToWishlist,
} = require('../controllers/propertyController');
const { protect, agentOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validate');
const { createPropertySchema, updatePropertySchema } = require('../validators/propertyValidator');
const User = require('../models/User');

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/featured', getFeaturedProperties);
router.get('/', getProperties);

// ── Property by ID (must come after /featured) ───────────────────────────────
router.get('/:id', getPropertyById);
router.get('/:id/similar', getSimilarProperties);

// ── Agent + Admin routes ──────────────────────────────────────────────────────
router.post('/', protect, agentOrAdmin, validate(createPropertySchema), createProperty);
router.put('/:id', protect, agentOrAdmin, validate(updatePropertySchema), updateProperty);
router.delete('/:id', protect, agentOrAdmin, deleteProperty);

// ── Image upload ──────────────────────────────────────────────────────────────
router.post('/:id/images', protect, agentOrAdmin, upload.array('images', 10), uploadPropertyImages);

// ── Wishlist ──────────────────────────────────────────────────────────────────
router.route('/:id/wishlist')
    .post(protect, addToWishlist)
    .delete(protect, addToWishlist);

router.get('/:id/wishlist/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const inWishlist = user.wishlist && user.wishlist.includes(req.params.id);
        res.json({ success: true, inWishlist: !!inWishlist });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;