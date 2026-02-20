const express = require('express');
const router = express.Router();
const {
    createOrder,
    verifyPayment,
    getPaymentDetails,
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, admin, getPaymentDetails);

module.exports = router;