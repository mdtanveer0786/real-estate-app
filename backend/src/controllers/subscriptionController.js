'use strict';

const asyncHandler          = require('express-async-handler');
const crypto                = require('crypto');
const Razorpay              = require('razorpay');
const SubscriptionService   = require('../services/subscriptionService');
const NotificationService   = require('../services/notificationService');
const Subscription          = require('../models/Subscription');
const AppError              = require('../utils/AppError');
const logger                = require('../utils/logger');
const { emitNotification }  = require('../config/socket');

// ── Razorpay client (lazy init so missing keys don't crash on startup) ─────────
let _rzp = null;
const getRzp = () => {
    if (_rzp) return _rzp;
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret || keyId === 'dummy') {
        logger.warn('Razorpay keys not configured – running in sandbox/mock mode');
        return null;
    }
    _rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return _rzp;
};

// GET /api/subscriptions/plans
const getPlans = asyncHandler(async (req, res) => {
    const plans = [
        {
            id: 'free', name: 'Free', price: 0, priceDisplay: '₹0', period: 'forever',
            popular: false,
            features: ['3 listings', 'Basic search visibility', 'Email support'],
            limits: Subscription.getPlanLimits('free'),
        },
        {
            id: 'basic', name: 'Basic', price: 499, priceDisplay: '₹499', period: '/month',
            popular: true,
            features: ['15 listings', '2 featured listings', 'Advanced analytics', 'Priority placement', 'Chat support'],
            limits: Subscription.getPlanLimits('basic'),
        },
        {
            id: 'premium', name: 'Premium', price: 999, priceDisplay: '₹999', period: '/month',
            popular: false,
            features: ['Unlimited listings', '10 featured listings', 'AI insights', 'Top placement', 'Priority support', 'Market reports'],
            limits: Subscription.getPlanLimits('premium'),
        },
    ];
    res.json({ success: true, plans });
});

// GET /api/subscriptions/current
const getCurrentSubscription = asyncHandler(async (req, res) => {
    const subscription = await SubscriptionService.getActive(req.user._id);
    const { plan, limits } = await SubscriptionService.getUserLimits(req.user._id);
    res.json({ success: true, subscription, currentPlan: plan, limits });
});

// POST /api/subscriptions/create-order  ← REAL Razorpay order
const createOrder = asyncHandler(async (req, res) => {
    const { plan } = req.body;
    if (!plan || !['basic', 'premium'].includes(plan)) {
        throw AppError.badRequest('Valid plan (basic or premium) is required');
    }

    const limits = Subscription.getPlanLimits(plan);
    const rzp    = getRzp();

    let orderId, amount;
    amount = limits.price; // paise

    if (rzp) {
        // REAL Razorpay order
        const order = await rzp.orders.create({
            amount,
            currency: 'INR',
            receipt:  `receipt_${req.user._id}_${Date.now()}`,
            notes:    { userId: req.user._id.toString(), plan },
        });
        orderId = order.id;
    } else {
        // Mock for development when keys not set
        orderId = `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        logger.warn(`Mock order created for ${req.user.email} – plan: ${plan}`);
    }

    res.json({
        success: true,
        order: {
            id:       orderId,
            amount,
            currency: 'INR',
            plan,
            key:      process.env.RAZORPAY_KEY_ID || '',
            prefill:  { name: req.user.name, email: req.user.email },
            notes:    { userId: req.user._id.toString(), plan },
        },
    });
});

// POST /api/subscriptions/verify  ← verify Razorpay signature + activate
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, plan } = req.body;

    if (!plan || !['basic', 'premium'].includes(plan)) {
        throw AppError.badRequest('Valid plan is required');
    }

    const rzp = getRzp();

    // Verify signature only when real keys are set
    if (rzp && razorpayOrderId && razorpaySignature) {
        const body     = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expected !== razorpaySignature) {
            throw AppError.badRequest('Payment verification failed – signature mismatch', 'PAYMENT_INVALID');
        }
    }

    // Activate subscription
    const subscription = await SubscriptionService.createOrUpgrade(req.user._id, {
        plan,
        razorpaySubscriptionId: razorpayOrderId,
        razorpayPlanId:         `plan_${plan}`,
    });

    // Record payment
    if (razorpayPaymentId) {
        await SubscriptionService.recordPayment(subscription._id, {
            razorpayPaymentId,
            amount:  subscription.amount,
            status:  'captured',
        });
    }

    // In-app notification
    const notif = await NotificationService.create({
        user:    req.user._id,
        type:    'subscription',
        title:   'Subscription Activated! 🎉',
        message: `Your ${plan} plan is now active. Enjoy premium features!`,
        link:    '/billing',
    });
    emitNotification(req.user._id.toString(), notif);

    res.json({ success: true, message: `${plan} plan activated`, subscription });
});

// POST /api/subscriptions/cancel
const cancelSubscription = asyncHandler(async (req, res) => {
    const subscription = await SubscriptionService.cancel(req.user._id);

    const notif = await NotificationService.create({
        user:    req.user._id,
        type:    'subscription',
        title:   'Subscription Cancelled',
        message: 'Your subscription has been cancelled. Access continues until billing period ends.',
        link:    '/pricing',
    });
    emitNotification(req.user._id.toString(), notif);

    res.json({ success: true, message: 'Subscription cancelled', subscription });
});

// GET /api/subscriptions/billing
const getBillingHistory = asyncHandler(async (req, res) => {
    const subscriptions = await Subscription.find({ user: req.user._id })
        .sort('-createdAt').limit(20);

    const payments = subscriptions.flatMap(sub =>
        (sub.payments || []).map(p => ({
            ...p.toObject(), plan: sub.plan, subscriptionId: sub._id,
        }))
    ).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    res.json({ success: true, payments });
});

// POST /api/subscriptions/webhook  ← Razorpay webhook
const webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret && signature) {
        const expected = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (expected !== signature) {
            logger.warn('Razorpay webhook signature mismatch');
            return res.status(400).json({ success: false });
        }
    }

    const { event, payload } = req.body;
    logger.info(`Razorpay webhook: ${event}`);

    switch (event) {
        case 'subscription.cancelled':
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
            logger.warn('Payment failed', { payload });
            break;
        default:
            logger.info(`Unhandled webhook: ${event}`);
    }

    res.json({ success: true });
});

module.exports = {
    getPlans, getCurrentSubscription, createOrder,
    verifyPayment, cancelSubscription, getBillingHistory, webhook,
};
