'use strict';

const express = require('express');
const router = express.Router();
const {
    getPlans,
    getCurrentSubscription,
    createOrder,
    verifyPayment,
    cancelSubscription,
    getBillingHistory,
    webhook,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/plans', getPlans);
router.post('/webhook', webhook);

// Protected
router.get('/current', protect, getCurrentSubscription);
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/cancel', protect, cancelSubscription);
router.get('/billing', protect, getBillingHistory);

module.exports = router;
