'use strict';

const Conversation = require('../models/Conversation');
const Message      = require('../models/Message');
const AppError     = require('../utils/AppError');

class ConversationService {

    /** Get or create a 1-to-1 conversation (optionally scoped to a property). */
    static async getOrCreate(participantIds, propertyId = null) {
        const sorted = [...participantIds].sort();           // canonical order
        let conv = await Conversation.findOne({
            participants: { $all: sorted, $size: sorted.length },
            ...(propertyId ? { property: propertyId } : {}),
        }).populate('participants', 'name email avatar role');

        if (!conv) {
            conv = await Conversation.create({
                participants: sorted,
                property: propertyId || undefined,
            });
            conv = await conv.populate('participants', 'name email avatar role');
        }
        return conv;
    }

    /** List conversations for a user, newest-last-message first. */
    static async listForUser(userId, { page = 1, limit = 20 } = {}) {
        const filter = { participants: userId, status: 'active' };

        const [total, conversations] = await Promise.all([
            Conversation.countDocuments(filter),
            Conversation.find(filter)
                .populate('participants', 'name email avatar role')
                .populate('property', 'title images slug')
                .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
        ]);

        // Attach unread count for this user
        const result = conversations.map(conv => {
            const plain = conv.toObject();
            plain.myUnread = conv.unreadCount?.get(userId.toString()) || 0;
            return plain;
        });

        return { conversations: result, total, page, pages: Math.ceil(total / limit) };
    }

    /** Get paginated messages for a conversation (oldest first, page from end). */
    static async getMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
        const conv = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });
        if (!conv) throw AppError.notFound('Conversation');

        const total = await Message.countDocuments({ conversation: conversationId, deletedAt: { $exists: false } });
        const messages = await Message.find({
            conversation: conversationId,
            deletedAt: { $exists: false },
        })
            .populate('sender', 'name avatar')
            .sort({ createdAt: 1 })
            .skip(Math.max(0, total - page * limit))
            .limit(limit);

        return { messages, total, page, pages: Math.ceil(total / limit) };
    }

    /** Send a message, update conversation metadata, return populated message. */
    static async sendMessage(conversationId, senderId, text) {
        const conv = await Conversation.findOne({
            _id: conversationId,
            participants: senderId,
            status: 'active',
        });
        if (!conv) throw AppError.notFound('Conversation');

        // Create message in separate collection
        const msg = await Message.create({
            conversation: conversationId,
            sender: senderId,
            text: text.trim(),
            deliveredTo: [{ user: senderId }], // sender always delivered
        });

        // Increment unread for every OTHER participant
        for (const pid of conv.participants) {
            if (pid.toString() !== senderId.toString()) {
                const key = pid.toString();
                conv.unreadCount.set(key, (conv.unreadCount.get(key) || 0) + 1);
            }
        }

        conv.lastMessage = {
            text:      text.trim().substring(0, 100),
            sender:    senderId,
            timestamp: new Date(),
        };
        await conv.save();

        const populated = await msg.populate('sender', 'name avatar');
        return { message: populated, conversation: conv };
    }

    /** Mark all messages in a conversation as read by userId. */
    static async markRead(conversationId, userId) {
        const conv = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });
        if (!conv) return { updated: 0 };

        // Zero out unread for this user
        conv.unreadCount.set(userId.toString(), 0);
        await conv.save();

        // Mark messages as seen
        const result = await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                'seenBy.user': { $ne: userId },
                deletedAt: { $exists: false },
            },
            { $push: { seenBy: { user: userId, at: new Date() } } }
        );

        return { updated: result.modifiedCount };
    }

    /** Total unread across all conversations for a user. */
    static async getUnreadCount(userId) {
        const convs = await Conversation.find({ participants: userId, status: 'active' });
        let count = 0;
        convs.forEach(c => {
            count += c.unreadCount?.get(userId.toString()) || 0;
        });
        return count;
    }
}

module.exports = ConversationService;
