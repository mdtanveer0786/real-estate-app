import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const useSocket = () => {
    const listenersRef = useRef([]);
    const [isConnected, setIsConnected] = useState(false);

    const connect = useCallback(() => {
        const token = getAccessToken();
        if (!token || socket?.connected) return;

        socket = io(SOCKET_URL, {
            auth: { token },
            reconnection:         true,
            reconnectionAttempts: 5,
            reconnectionDelay:    1000,
            timeout:              10000,
            transports:           ['websocket', 'polling'],
        });

        socket.on('connect',       () => { setIsConnected(true);  console.log('🔌 Socket connected'); });
        socket.on('disconnect',    () => { setIsConnected(false); console.log('🔌 Socket disconnected'); });
        socket.on('connect_error', (err) => { console.warn('Socket error:', err.message); });

        return socket;
    }, []);

    /** Re-authenticate socket after JWT refresh. */
    const reconnectWithToken = useCallback(() => {
        const token = getAccessToken();
        if (!token) return;
        if (socket) {
            socket.auth = { token };
            if (!socket.connected) socket.connect();
        }
    }, []);

    const disconnect = useCallback(() => {
        if (socket) { socket.disconnect(); socket = null; setIsConnected(false); }
    }, []);

    const on = useCallback((event, handler) => {
        if (socket) {
            socket.on(event, handler);
            listenersRef.current.push({ event, handler });
        }
    }, []);

    const off = useCallback((event, handler) => {
        if (socket) socket.off(event, handler);
    }, []);

    const emit = useCallback((event, data, callback) => {
        if (socket?.connected) socket.emit(event, data, callback);
    }, []);

    const joinConversation  = useCallback((id) => emit('conversation:join', id), [emit]);
    const leaveConversation = useCallback((id) => emit('conversation:leave', id), [emit]);
    const startTyping       = useCallback((id) => emit('typing:start', { conversationId: id }), [emit]);
    const stopTyping        = useCallback((id) => emit('typing:stop',  { conversationId: id }), [emit]);

    /** Query online status of a list of userIds. Returns { userId: bool } */
    const getOnlineStatus   = useCallback((userIds, callback) => {
        emit('users:online', userIds, callback);
    }, [emit]);

    /** Mark a message as seen (emits receipt to sender). */
    const markMessageSeen   = useCallback((conversationId, messageId) => {
        emit('message:seen', { conversationId, messageId });
    }, [emit]);

    useEffect(() => {
        return () => {
            listenersRef.current.forEach(({ event, handler }) => socket?.off(event, handler));
            listenersRef.current = [];
        };
    }, []);

    return {
        socket, connect, disconnect, reconnectWithToken,
        on, off, emit,
        joinConversation, leaveConversation,
        startTyping, stopTyping,
        getOnlineStatus, markMessageSeen,
        isConnected,
    };
};

export const getSocket = () => socket;
