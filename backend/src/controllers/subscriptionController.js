'use strict';

const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const SubscriptionService = require('../services/subscriptionService');
const NotificationService = require('../services/notificationService');
const Subscription = require('../models/Subscription');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// @desc    Get plan options
// @route   GET /api/subscriptions/plans
// @access  Public
const getPlans = asyncHandler(async (req, res) => {
    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: 0,
            priceDisplay: '₹0',
            period: 'forever',
            features: [
                'Up to 3 listings',
                'Basic search visibility',
                'Email support',
                'Standard analytics',
            ],
            limits: Subscription.getPlanLimits('free'),
        },
        {
            id: 'basic',
            name: 'Basic',
            price: 499,
            priceDisplay: '₹499',
            period: '/month',
            popular: true,
            features: [
                'Up to 15 listings',
                '2 featured listings',
                'Advanced analytics',
                'Priority search placement',
                'Chat support',
            ],
            limits: Subscription.getPlanLimits('basic'),
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 999,
            priceDisplay: '₹999',
            period: '/month',
            features: [
                'Unlimited listings',
                '10 featured listings',
                'AI-powered insights',
                'Top search placement',
                'Priority support',
                'Market trend reports',
            ],
            limits: Subscription.getPlanLimits('premium'),
        },
    ];

    res.json({ success: true, plans });
});

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
// @access  Private
const getCurrentSubscription = asyncHandler(async (req, res) => {
    const subscription = await SubscriptionService.getActive(req.user._id);
    const { plan, limits } = await SubscriptionService.getUserLimits(req.user._id);

    res.json({
        success: true,
        subscription,
        currentPlan: plan,
        limits,
    });
});

// @desc    Create a Razorpay order for subscription
// @route   POST /api/subscriptions/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const { plan } = req.body;

    if (!plan || !['basic', 'premium'].includes(plan)) {
        throw AppError.badRequest('Valid plan (basic or premium) is required');
    }

    const limits = Subscription.getPlanLimits(plan);

    // In production, this would create a Razorpay order via their API
    // For now, return order details for frontend integration
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.json({
        success: true,
        order: {
            id: orderId,
            amount: limits.price, // in paise
            currency: 'INR',
            plan,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            prefill: {
                name: req.user.name,
                email: req.user.email,
            },
            notes: {
                userId: req.user._id.toString(),
                plan,
            },
        },
    });
});

// @desc    Verify payment and activate subscription
// @route   POST /api/subscriptions/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, plan } = req.body;

    if (!plan || !['basic', 'premium'].includes(plan)) {
        throw AppError.badRequest('Valid plan is required');
    }

    // Verify signature (in production)
    if (process.env.RAZORPAY_KEY_SECRET && razorpayOrderId && razorpaySignature) {
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            throw AppError.badRequest('Payment verification failed', 'PAYMENT_INVALID');
        }
    }

    // Activate subscription
    const subscription = await SubscriptionService.createOrUpgrade(req.user._id, {
        plan,
        razorpaySubscriptionId: razorpayOrderId,
        razorpayPlanId: `plan_${plan}`,
    });

    // Record payment
    if (razorpayPaymentId) {
        await SubscriptionService.recordPayment(subscription._id, {
            razorpayPaymentId,
            amount: subscription.amount,
            status: 'captured',
        });
    }

    // Send notification
    await NotificationService.create({
        user: req.user._id,
        type: 'subscription',
        title: 'Subscription Activated! 🎉',
        message: `Your ${plan} plan is now active. Enjoy premium features!`,
        link: '/profile',
    });

    res.json({
        success: true,
        message: `${plan} plan activated successfully`,
        subscription,
    });
});

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
    const subscription = await SubscriptionService.cancel(req.user._id);

    await NotificationService.create({
        user: req.user._id,
        type: 'subscription',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You\'ll retain access until the end of the billing period.',
        link: '/pricing',
    });

    res.json({ success: true, message: 'Subscription cancelled', subscription });
});

// @desc    Get billing history
// @route   GET /api/subscriptions/billing
// @access  Private
const getBillingHistory = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({ user: req.user._id })
        .sort('-createdAt')
        .limit(20);

    const payments = subscriptions.flatMap(sub =>
        (sub.payments || []).map(p => ({
            ...p.toObject(),
            plan: sub.plan,
            subscriptionId: sub._id,
        }))
    ).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    res.json({ success: true, payments });
});

// @desc    Razorpay webhook handler
// @route   POST /api/subscriptions/webhook
// @access  Public (verified by signature)
const webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];

    // Verify webhook signature
    if (process.env.RAZORPAY_WEBHOOK_SECRET && signature) {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature !== signature) {
            logger.warn('Razorpay webhook signature mismatch');
            return res.status(400).json({ success: false });
        }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    logger.info(`Razorpay webhook: ${event}`);

    switch (event) {
        case 'payment.captured':
            // Payment succeeded — already handled in verify
            break;

        case 'subscription.cancelled':
            // External cancellation
            if (payload?.subscription?.entity?.id) {
                const sub = await Subscription.findOne({
                    razorpaySubscriptionId: payload.subscription.entity.id,
                });
                if (sub) {
                    sub.status = 'cancelled';
                    sub.cancelledAt = new Date();
                    await sub.save();
                }
            }
            break;

        case 'payment.failed':
            // Payment failed
            logger.warn('Payment failed webhook', { payload });
            break;

        default:
            logger.info(`Unhandled webhook event: ${event}`);
    }

    // Always respond 200 to acknowledge
    res.json({ success: true });
});

module.exports = {
    getPlans,
    getCurrentSubscription,
    createOrder,
    verifyPayment,
    cancelSubscription,
    getBillingHistory,
    webhook,
};
