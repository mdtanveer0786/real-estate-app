const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Property = require('../models/Property');

// @desc    Get user wishlist with full property details
// @route   GET /api/users/wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            populate: {
                path: 'createdBy',
                select: 'name email'
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:propertyId
// @access  Private
router.post('/wishlist/:propertyId', protect, async (req, res) => {
    try {
        const property = await Property.findById(req.params.propertyId);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if already in wishlist
        if (user.wishlist.includes(req.params.propertyId)) {
            return res.status(400).json({ error: 'Property already in wishlist' });
        }

        user.wishlist.push(req.params.propertyId);
        await user.save();

        res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:propertyId
// @access  Private
router.delete('/wishlist/:propertyId', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== req.params.propertyId
        );

        await user.save();

        res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;