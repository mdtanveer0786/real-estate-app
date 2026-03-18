'use strict';

const asyncHandler = require('express-async-handler');
const NotificationService = require('../services/notificationService');

// @desc    Get notifications for the current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const { page, unreadOnly } = req.query;
    const result = await NotificationService.getForUser(req.user._id, {
        page: Number(page) || 1,
        unreadOnly: unreadOnly === 'true',
    });
    res.json({ success: true, ...result });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await NotificationService.countUnread(req.user._id);
    res.json({ success: true, count });
});

// @desc    Mark one notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    await NotificationService.markRead(req.params.id, req.user._id);
    res.json({ success: true });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    await NotificationService.markAllRead(req.user._id);
    res.json({ success: true });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
    await NotificationService.delete(req.params.id, req.user._id);
    res.json({ success: true });
});

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
