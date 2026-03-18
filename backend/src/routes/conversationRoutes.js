'use strict';

const express = require('express');
const router = express.Router();
const {
    createConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

// All conversation routes require authentication
router.use(protect);

router.route('/')
    .get(getConversations)
    .post(createConversation);

router.get('/unread-count', getUnreadCount);

router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.put('/:id/read', markAsRead);

module.exports = router;
