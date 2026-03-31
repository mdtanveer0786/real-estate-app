'use strict';

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

let io;
// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

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
        pingInterval: 25000,
        transports: ['websocket', 'polling'],
    });

    // ── Auth middleware ───────────────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            const token =
                socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(' ')[1];
            if (!token) return next(new Error('Authentication required'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('name email role avatar');
            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    // ── Connection ────────────────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();

        // Track online status
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);

        // Join personal room
        socket.join(`user:${userId}`);

        // Broadcast online status to everyone
        io.emit('user:online', { userId, online: true });

        logger.info(`Socket connected: ${socket.user.name} (${userId}) [${socket.id}]`);

        // ── Online status query ───────────────────────────────────────────────
        socket.on('users:online', (userIds, callback) => {
            const result = {};
            (userIds || []).forEach(id => {
                result[id] = onlineUsers.has(id) && onlineUsers.get(id).size > 0;
            });
            if (typeof callback === 'function') callback(result);
        });

        // ── Conversation rooms ────────────────────────────────────────────────
        socket.on('conversation:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            logger.info(`${socket.user.name} joined conversation:${conversationId}`);
        });

        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        // ── Typing indicators ─────────────────────────────────────────────────
        socket.on('typing:start', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:start', {
                userId,
                name: socket.user.name,
                conversationId,
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stop', {
                userId,
                conversationId,
            });
        });

        // ── Message delivered/seen acknowledgement ────────────────────────────
        socket.on('message:seen', ({ conversationId, messageId }) => {
            socket.to(`conversation:${conversationId}`).emit('message:seen', {
                conversationId,
                messageId,
                seenBy: userId,
                seenAt: new Date(),
            });
        });

        // ── Disconnect ────────────────────────────────────────────────────────
        socket.on('disconnect', (reason) => {
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                    io.emit('user:offline', { userId, online: false });
                }
            }
            logger.info(`Socket disconnected: ${socket.user.name} (${reason})`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

const emitMessage = (conversationId, message) => {
    if (io) io.to(`conversation:${conversationId}`).emit('message:new', message);
};

const emitNotification = (userId, notification) => {
    if (io) io.to(`user:${userId}`).emit('notification:new', notification);
};

const isUserOnline = (userId) => {
    const sockets = onlineUsers.get(userId?.toString());
    return !!(sockets && sockets.size > 0);
};

const getOnlineUsers = () => [...onlineUsers.keys()];

module.exports = { initSocket, getIO, emitMessage, emitNotification, isUserOnline, getOnlineUsers };
