const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    getUserInquiries
} = require('../controllers/userController');
const { updateUserProfile } = require('../controllers/authController');

// Profile routes
router.put('/profile', protect, updateUserProfile);

// Wishlist routes
router.route('/wishlist')
    .get(protect, getWishlist);

router.route('/wishlist/:propertyId')
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

// Inquiries route
router.get('/inquiries', protect, getUserInquiries);

module.exports = router;