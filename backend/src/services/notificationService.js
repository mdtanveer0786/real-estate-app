'use strict';

const Notification = require('../models/Notification');

class NotificationService {
    /**
     * Create a notification for a user.
     */
    static async create({ user, type, title, message, link, metadata }) {
        return Notification.create({ user, type, title, message, link, metadata });
    }

    /**
     * Create notifications for multiple users.
     */
    static async createBulk(userIds, { type, title, message, link, metadata }) {
        const docs = userIds.map(userId => ({
            user: userId,
            type, title, message, link, metadata,
        }));
        return Notification.insertMany(docs);
    }

    /**
     * Get notifications for a user (paginated, newest first).
     */
    static async getForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
        const filter = { user: userId };
        if (unreadOnly) filter.read = false;

        const [total, notifications] = await Promise.all([
            Notification.countDocuments(filter),
            Notification.find(filter)
                .sort('-createdAt')
                .skip((page - 1) * limit)
                .limit(limit),
        ]);

        return { notifications, total, page, pages: Math.ceil(total / limit) };
    }

    /**
     * Count unread notifications.
     */
    static async countUnread(userId) {
        return Notification.countDocuments({ user: userId, read: false });
    }

    /**
     * Mark a single notification as read.
     */
    static async markRead(notificationId, userId) {
        return Notification.findOneAndUpdate(
            { _id: notificationId, user: userId },
            { read: true },
            { new: true }
        );
    }

    /**
     * Mark all notifications as read for a user.
     */
    static async markAllRead(userId) {
        return Notification.updateMany({ user: userId, read: false }, { read: true });
    }

    /**
     * Delete a notification.
     */
    static async delete(notificationId, userId) {
        return Notification.findOneAndDelete({ _id: notificationId, user: userId });
    }
}

module.exports = NotificationService;
