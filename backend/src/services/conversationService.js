'use strict';

const Conversation = require('../models/Conversation');
const AppError = require('../utils/AppError');

class ConversationService {
    /**
     * Get or create a conversation between two users about a property.
     */
    static async getOrCreate(participantIds, propertyId = null) {
        // Find existing conversation between these participants
        let conversation = await Conversation.findOne({
            participants: { $all: participantIds, $size: participantIds.length },
            ...(propertyId ? { property: propertyId } : {}),
        }).populate('participants', 'name email avatar');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: participantIds,
                property: propertyId,
            });
            conversation = await conversation.populate('participants', 'name email avatar');
        }

        return conversation;
    }

    /**
     * Get all conversations for a user.
     */
    static async listForUser(userId, { page = 1, limit = 20 } = {}) {
        const filter = { participants: userId, status: 'active' };

        const [total, conversations] = await Promise.all([
            Conversation.countDocuments(filter),
            Conversation.find(filter)
                .populate('participants', 'name email avatar')
                .populate('property', 'title images slug')
                .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('-messages'), // Don't load all messages in list view
        ]);

        return { conversations, total, page, pages: Math.ceil(total / limit) };
    }

    /**
     * Get messages for a conversation (paginated, newest last).
     */
    static async getMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });

        if (!conversation) throw AppError.notFound('Conversation');

        const totalMessages = conversation.messages.length;
        const start = Math.max(0, totalMessages - page * limit);
        const end = Math.max(0, totalMessages - (page - 1) * limit);

        const messages = conversation.messages.slice(start, end);

        return {
            messages,
            total: totalMessages,
            page,
            pages: Math.ceil(totalMessages / limit),
        };
    }

    /**
     * Send a message in a conversation.
     */
    static async sendMessage(conversationId, senderId, text) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: senderId,
            status: 'active',
        });

        if (!conversation) throw AppError.notFound('Conversation');

        const message = {
            sender: senderId,
            text: text.trim(),
        };

        conversation.messages.push(message);
        conversation.lastMessage = {
            text: text.trim().substring(0, 100),
            sender: senderId,
            timestamp: new Date(),
        };

        await conversation.save();

        // Return the last message (with its generated _id)
        const savedMessage = conversation.messages[conversation.messages.length - 1];
        return { message: savedMessage, conversation };
    }

    /**
     * Mark messages as read.
     */
    static async markRead(conversationId, userId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });

        if (!conversation) return;

        let updated = false;
        conversation.messages.forEach(msg => {
            if (msg.sender.toString() !== userId.toString() && !msg.read) {
                msg.read = true;
                updated = true;
            }
        });

        if (updated) await conversation.save();
        return { updated };
    }

    /**
     * Get unread message count across all conversations.
     */
    static async getUnreadCount(userId) {
        const conversations = await Conversation.find({
            participants: userId,
            status: 'active',
        }).select('messages');

        let count = 0;
        conversations.forEach(conv => {
            conv.messages.forEach(msg => {
                if (msg.sender.toString() !== userId.toString() && !msg.read) {
                    count++;
                }
            });
        });

        return count;
    }
}

module.exports = ConversationService;
