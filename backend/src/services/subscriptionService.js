'use strict';

const Subscription = require('../models/Subscription');
const User = require('../models/User');
const AppError = require('../utils/AppError');

class SubscriptionService {
    /**
     * Get the active subscription for a user (or null).
     */
    static async getActive(userId) {
        return Subscription.findOne({ user: userId, status: 'active' });
    }

    /**
     * Get plan limits for a user (defaults to free).
     */
    static async getUserLimits(userId) {
        const sub = await this.getActive(userId);
        const plan = sub?.plan || 'free';
        return { plan, limits: Subscription.getPlanLimits(plan) };
    }

    /**
     * Check if the user has remaining listings quota.
     */
    static async canCreateListing(userId) {
        const { limits } = await this.getUserLimits(userId);
        const Property = require('../models/Property');
        const count = await Property.countDocuments({
            createdBy: userId,
            status: { $ne: 'draft' },
        });
        return count < limits.maxListings;
    }

    /**
     * Create or upgrade a subscription.
     */
    static async createOrUpgrade(userId, { plan, razorpaySubscriptionId, razorpayPlanId }) {
        // Cancel any existing active subscription
        await Subscription.updateMany(
            { user: userId, status: 'active' },
            { status: 'cancelled', cancelledAt: new Date() }
        );

        const planLimits = Subscription.getPlanLimits(plan);
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1); // 1-month billing cycle

        const subscription = await Subscription.create({
            user: userId,
            plan,
            status: 'active',
            amount: planLimits.price,
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            razorpaySubscriptionId,
            razorpayPlanId,
            limits: planLimits,
        });

        // Sync plan to user
        await User.findByIdAndUpdate(userId, {
            'subscription.plan': plan,
            'subscription.expiresAt': endDate,
            'subscription.razorpaySubId': razorpaySubscriptionId,
        });

        return subscription;
    }

    /**
     * Cancel an active subscription (takes effect at period end).
     */
    static async cancel(userId) {
        const sub = await Subscription.findOne({ user: userId, status: 'active' });
        if (!sub) throw AppError.notFound('Active subscription');

        sub.status = 'cancelled';
        sub.cancelledAt = new Date();
        await sub.save();

        await User.findByIdAndUpdate(userId, {
            'subscription.plan': 'free',
            'subscription.expiresAt': null,
        });

        return sub;
    }

    /**
     * Record a payment for a subscription.
     */
    static async recordPayment(subscriptionId, { razorpayPaymentId, amount, status }) {
        return Subscription.findByIdAndUpdate(
            subscriptionId,
            {
                $push: {
                    payments: {
                        razorpayPaymentId,
                        amount,
                        status,
                        paidAt: new Date(),
                    },
                },
            },
            { new: true }
        );
    }
}

module.exports = SubscriptionService;
