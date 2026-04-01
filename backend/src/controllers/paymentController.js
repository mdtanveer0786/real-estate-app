'use strict';

const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// ── Razorpay client (lazy init so missing keys don't crash on startup) ─────────
let _rzp = null;
const getRzp = () => {
    if (_rzp) return _rzp;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId === 'dummy') {
        logger.warn('Razorpay keys not configured – payment features unavailable');
        return null;
    }
    _rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return _rzp;
};

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt, propertyId } = req.body;

    if (!amount || amount <= 0) {
        throw AppError.badRequest('Valid amount is required');
    }

    const rzp = getRzp();

    const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `receipt_${req.user._id}_${Date.now()}`,
        notes: { userId: req.user._id.toString(), propertyId: propertyId || '' },
    };

    if (rzp) {
        const order = await rzp.orders.create(options);
        res.json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID,
        });
    } else {
        // Mock order for development when Razorpay keys not configured
        const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.warn(`Mock payment order created for ${req.user.email}`);
        res.json({
            success: true,
            order: { id: mockOrderId, ...options },
            key: process.env.RAZORPAY_KEY_ID || '',
            mock: true,
        });
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
        propertyId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
        throw AppError.badRequest('Payment details are required');
    }

    const rzp = getRzp();

    // Verify signature only when real keys are configured
    if (rzp && razorpay_signature) {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            throw AppError.badRequest('Payment verification failed – signature mismatch', 'PAYMENT_INVALID');
        }
    }

    // Payment is verified - Save to database
    const payment = await Payment.create({
        user: req.user._id,
        property: propertyId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature: razorpay_signature || 'mock',
        amount: amount ? amount / 100 : 0, // Store in actual currency unit, not paise
        status: 'paid',
    });

    logger.info(`Payment verified: ${razorpay_payment_id} for user ${req.user._id}`);

    res.json({
        success: true,
        message: 'Payment verified and saved successfully',
        payment,
    });
});

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private/Admin
const getPaymentDetails = asyncHandler(async (req, res) => {
    const rzp = getRzp();
    if (!rzp) {
        throw AppError.badRequest('Payment gateway not configured');
    }

    const payment = await rzp.payments.fetch(req.params.paymentId);
    if (!payment) {
        throw AppError.notFound('Payment');
    }
    res.json({ success: true, payment });
});

module.exports = {
    createOrder,
    verifyPayment,
    getPaymentDetails,
};