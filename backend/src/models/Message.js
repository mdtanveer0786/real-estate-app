'use strict';
/**
 * Separate Message collection — avoids the 16MB Conversation document limit.
 * Each message belongs to a conversation.
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 2000,
        trim: true,
    },
    // Delivery tracking
    deliveredTo: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at:   { type: Date, default: Date.now },
    }],
    seenBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at:   { type: Date, default: Date.now },
    }],
    // Soft delete
    deletedAt: Date,
}, {
    timestamps: true,
});

messageSchema.index({ conversation: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

// Virtual: is this message read by a given user?
messageSchema.methods.isSeenBy = function (userId) {
    return this.seenBy.some(s => s.user.toString() === userId.toString());
};

module.exports = mongoose.model('Message', messageSchema);
