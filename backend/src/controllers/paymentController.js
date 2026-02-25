const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt, propertyId } = req.body;

    const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500);
        throw new Error('Payment order creation failed');
    }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount,
        propertyId
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment is verified - Save to database
        const payment = await Payment.create({
            user: req.user._id,
            property: propertyId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount: amount / 100, // Store in actual currency unit, not paise
            status: 'paid',
        });

        res.json({
            success: true,
            message: 'Payment verified and saved successfully',
            payment,
        });
    } else {
        res.status(400);
        throw new Error('Invalid payment signature');
    }
});

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private/Admin
const getPaymentDetails = asyncHandler(async (req, res) => {
    try {
        const payment = await razorpay.payments.fetch(req.params.paymentId);
        res.json(payment);
    } catch (error) {
        res.status(404);
        throw new Error('Payment not found');
    }
});

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentDetails,
};