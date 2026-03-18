'use strict';

const asyncHandler = require('express-async-handler');
const ConversationService = require('../services/conversationService');
const NotificationService = require('../services/notificationService');
const { emitMessage, emitNotification } = require('../config/socket');

// @desc    Get or create a conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = asyncHandler(async (req, res) => {
    const { participantId, propertyId } = req.body;

    if (!participantId) {
        res.status(400);
        throw new Error('Participant ID is required');
    }

    const conversation = await ConversationService.getOrCreate(
        [req.user._id, participantId],
        propertyId || null
    );

    res.status(201).json({ success: true, conversation });
});

// @desc    Get all conversations for the logged-in user
// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const result = await ConversationService.listForUser(req.user._id, {
        page: Number(req.query.page) || 1,
    });
    res.json({ success: true, ...result });
});

// @desc    Get messages for a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const result = await ConversationService.getMessages(
        req.params.id,
        req.user._id,
        { page: Number(req.query.page) || 1 }
    );
    res.json({ success: true, ...result });
});

// @desc    Send a message
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text?.trim()) {
        res.status(400);
        throw new Error('Message text is required');
    }

    const { message, conversation } = await ConversationService.sendMessage(
        req.params.id,
        req.user._id,
        text
    );

    // Emit real-time message to the conversation room
    emitMessage(req.params.id, {
        ...message.toObject(),
        senderName: req.user.name,
        senderAvatar: req.user.avatar,
    });

    // Send notification to other participants
    const otherParticipants = conversation.participants.filter(
        p => p.toString() !== req.user._id.toString()
    );

    for (const participantId of otherParticipants) {
        const notification = await NotificationService.create({
            user: participantId,
            type: 'message',
            title: 'New Message',
            message: `${req.user.name}: ${text.substring(0, 80)}`,
            link: `/messages/${req.params.id}`,
        });
        emitNotification(participantId.toString(), notification);
    }

    res.status(201).json({ success: true, message });
});

// @desc    Mark messages as read
// @route   PUT /api/conversations/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    await ConversationService.markRead(req.params.id, req.user._id);
    res.json({ success: true });
});

// @desc    Get unread message count
// @route   GET /api/conversations/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await ConversationService.getUnreadCount(req.user._id);
    res.json({ success: true, count });
});

module.exports = {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
};
