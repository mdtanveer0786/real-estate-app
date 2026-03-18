'use strict';

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: [
            'inquiry',         // Someone inquired about your property
            'message',         // New chat message
            'property_update', // A wishlisted property was updated
            'price_drop',      // Price dropped on a wishlisted property
            'verification',    // Email verification reminder
            'subscription',    // Subscription status change
            'review',          // New review on your property
            'system',          // System announcements
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 200,
    },
    message: {
        type: String,
        required: true,
        maxlength: 500,
    },
    link: {
        type: String, // Frontend route to navigate to when clicked
    },
    read: {
        type: Boolean,
        default: false,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // Flexible extra data
    },
}, {
    timestamps: true,
});

// Indexes for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

module.exports = mongoose.model('Notification', notificationSchema);
