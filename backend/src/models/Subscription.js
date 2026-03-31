'use strict';

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'past_due', 'trialing'],
        default: 'active',
    },

    // ── Razorpay references ──────────────────────────────────────────────────
    razorpaySubscriptionId: String,
    razorpayPlanId: String,
    razorpayCustomerId: String,

    // ── Pricing ──────────────────────────────────────────────────────────────
    amount: {
        type: Number, // in smallest currency unit (paise for INR)
        required: true,
    },
    currency: {
        type: String,
        default: 'INR',
    },

    // ── Dates ────────────────────────────────────────────────────────────────
    currentPeriodStart: {
        type: Date,
        required: true,
    },
    currentPeriodEnd: {
        type: Date,
        required: true,
    },
    cancelledAt: Date,
    trialEnd: Date,

    // ── Limits based on plan ─────────────────────────────────────────────────
    limits: {
        maxListings: { type: Number, default: 3 },      // free: 3, basic: 15, premium: unlimited
        featuredListings: { type: Number, default: 0 },  // basic: 2, premium: 10
        analytics: { type: Boolean, default: false },    // basic+premium
        aiInsights: { type: Boolean, default: false },   // premium only
        prioritySupport: { type: Boolean, default: false }, // premium only
    },

    // ── Payment history ──────────────────────────────────────────────────────
    payments: [{
        razorpayPaymentId: String,
        amount: Number,
        status: String,
        paidAt: Date,
    }],
}, {
    timestamps: true,
});

// Ensure one active subscription per user
subscriptionSchema.index(
    { user: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } }
);

/**
 * Static: Get plan limits configuration.
 */
subscriptionSchema.statics.getPlanLimits = function (plan) {
    const plans = {
        free: {
            maxListings: 3,
            featuredListings: 0,
            analytics: false,
            aiInsights: false,
            prioritySupport: false,
            price: 0,
        },
        basic: {
            maxListings: 15,
            featuredListings: 2,
            analytics: true,
            aiInsights: false,
            prioritySupport: false,
            price: 49900, // ₹499 in paise
        },
        premium: {
            maxListings: 9999, // unlimited
            featuredListings: 9999, // unlimited
            analytics: true,
            aiInsights: true,
            prioritySupport: true,
            price: 99900, // ₹999 in paise
        },
    };
    return plans[plan] || plans.free;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
