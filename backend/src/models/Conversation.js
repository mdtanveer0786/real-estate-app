'use strict';

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
    },
    lastMessage: {
        text:      String,
        sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: Date,
    },
    // Unread count per participant: { userId: count }
    unreadCount: {
        type: Map,
        of: Number,
        default: {},
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked'],
        default: 'active',
    },
}, {
    timestamps: true,
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ property: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
