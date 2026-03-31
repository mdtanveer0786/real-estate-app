'use strict';

const asyncHandler          = require('express-async-handler');
const ConversationService   = require('../services/conversationService');
const NotificationService   = require('../services/notificationService');
const { emitMessage, emitNotification, isUserOnline } = require('../config/socket');

// POST /api/conversations
const createConversation = asyncHandler(async (req, res) => {
    const { participantId, propertyId } = req.body;
    if (!participantId) { res.status(400); throw new Error('participantId is required'); }

    const conv = await ConversationService.getOrCreate(
        [req.user._id, participantId],
        propertyId || null
    );
    res.status(201).json({ success: true, conversation: conv });
});

// GET /api/conversations
const getConversations = asyncHandler(async (req, res) => {
    const result = await ConversationService.listForUser(req.user._id, {
        page: Number(req.query.page) || 1,
    });
    res.json({ success: true, ...result });
});

// GET /api/conversations/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await ConversationService.getUnreadCount(req.user._id);
    res.json({ success: true, count });
});

// GET /api/conversations/:id/messages
const getMessages = asyncHandler(async (req, res) => {
    const result = await ConversationService.getMessages(
        req.params.id,
        req.user._id,
        { page: Number(req.query.page) || 1 }
    );
    res.json({ success: true, ...result });
});

// POST /api/conversations/:id/messages
const sendMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) { res.status(400); throw new Error('Message text is required'); }

    const { message, conversation } = await ConversationService.sendMessage(
        req.params.id,
        req.user._id,
        text
    );

    // Emit real-time to the room
    emitMessage(req.params.id, {
        ...message.toObject(),
        senderName:   req.user.name,
        senderAvatar: req.user.avatar,
        delivered:    true,
    });

    // Notify other participants
    const others = conversation.participants.filter(
        p => p.toString() !== req.user._id.toString()
    );
    for (const pid of others) {
        const pidStr = pid.toString();
        const notification = await NotificationService.create({
            user:    pid,
            type:    'message',
            title:   `New message from ${req.user.name}`,
            message: text.substring(0, 80),
            link:    `/messages/${req.params.id}`,
            metadata: { conversationId: req.params.id },
        });
        emitNotification(pidStr, notification);

        // If user is online, emit delivered receipt
        if (isUserOnline(pidStr)) {
            emitMessage(req.params.id, {
                type: 'delivered',
                messageId: message._id,
                conversationId: req.params.id,
            });
        }
    }

    res.status(201).json({ success: true, message });
});

// PUT /api/conversations/:id/read
const markAsRead = asyncHandler(async (req, res) => {
    const { updated } = await ConversationService.markRead(req.params.id, req.user._id);
    // Emit seen receipt to sender
    if (updated > 0) {
        emitMessage(req.params.id, {
            type:           'seen',
            conversationId: req.params.id,
            seenBy:         req.user._id,
            seenAt:         new Date(),
        });
    }
    res.json({ success: true, updated });
});

// GET /api/conversations/online-status?ids=a,b,c
const getOnlineStatus = asyncHandler(async (req, res) => {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    const result = {};
    ids.forEach(id => { result[id] = isUserOnline(id); });
    res.json({ success: true, status: result });
});

module.exports = {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
    getOnlineStatus,
};
