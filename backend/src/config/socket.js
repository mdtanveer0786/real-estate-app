'use strict';

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.io on an existing HTTP server.
 */
const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:5173',
                process.env.FRONTEND_URL,
            ].filter(Boolean),
            credentials: true,
        },
        pingTimeout: 60000,
    });

    // ── Authentication middleware ─────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                          socket.handshake.headers?.authorization?.split(' ')[1];

            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('name email role avatar');

            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    // ── Connection handler ───────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();

        // Join personal room for notifications
        socket.join(`user:${userId}`);

        logger.info(`Socket connected: ${socket.user.name} (${userId})`);

        // ── Join conversation room ───────────────────────────────────────────
        socket.on('conversation:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
        });

        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        // ── Typing indicators ────────────────────────────────────────────────
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:start', {
                userId,
                name: socket.user.name,
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stop', {
                userId,
            });
        });

        // ── Online status ────────────────────────────────────────────────────
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.user.name}`);
        });
    });

    return io;
};

/**
 * Get the Socket.io instance (for emitting from controllers/services).
 */
const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

/**
 * Emit a new message to a conversation room.
 */
const emitMessage = (conversationId, message) => {
    if (io) {
        io.to(`conversation:${conversationId}`).emit('message:new', message);
    }
};

/**
 * Send a notification to a specific user.
 */
const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit('notification:new', notification);
    }
};

module.exports = { initSocket, getIO, emitMessage, emitNotification };
