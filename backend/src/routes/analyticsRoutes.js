const express = require('express');
const router = express.Router();
const {
    getPropertyAnalytics,
    getUserAnalytics,
    getInquiryAnalytics,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/properties', protect, admin, getPropertyAnalytics);
router.get('/users', protect, admin, getUserAnalytics);
router.get('/inquiries', protect, admin, getInquiryAnalytics);

module.exports = router;