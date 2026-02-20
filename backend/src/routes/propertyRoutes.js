const express = require('express');
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    uploadPropertyImages,
    addToWishlist,
} = require('../controllers/propertyController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.route('/')
    .get(getProperties)
    .post(protect, admin, createProperty);

// Property by ID routes
router.route('/:id')
    .get(getPropertyById)
    .put(protect, admin, updateProperty)
    .delete(protect, admin, deleteProperty);

// Image upload route
router.post('/:id/images', protect, admin, upload.array('images', 10), uploadPropertyImages);

// Wishlist routes - ADD THIS SECTION
router.route('/:id/wishlist')
    .post(protect, addToWishlist)     // Add to wishlist
    .delete(protect, addToWishlist);  // Remove from wishlist (uses same function)

// Optional: Add status check route
router.get('/:id/wishlist/status', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const inWishlist = user.wishlist && user.wishlist.includes(req.params.id);
        res.json({ inWishlist: !!inWishlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;