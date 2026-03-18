'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
        maxlength: 2000,
    },
    read: {
        type: Boolean,
        default: false,
    },
    attachments: [{
        type: { type: String, enum: ['image', 'file'] },
        url: String,
        name: String,
    }],
}, { timestamps: true });

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
        text: String,
        sender: mongoose.Schema.Types.ObjectId,
        timestamp: Date,
    },
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked'],
        default: 'active',
    },
}, {
    timestamps: true,
});

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ property: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
