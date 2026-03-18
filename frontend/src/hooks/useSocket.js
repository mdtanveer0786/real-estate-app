import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Hook for Socket.io connection with JWT auth.
 * Automatically connects when user is authenticated.
 */
export const useSocket = () => {
    const listenersRef = useRef([]);

    const connect = useCallback(() => {
        const token = getAccessToken();
        if (!token || socket?.connected) return;

        socket = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected');
        });

        socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        return socket;
    }, []);

    const disconnect = useCallback(() => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }, []);

    const on = useCallback((event, handler) => {
        if (socket) {
            socket.on(event, handler);
            listenersRef.current.push({ event, handler });
        }
    }, []);

    const off = useCallback((event, handler) => {
        if (socket) {
            socket.off(event, handler);
        }
    }, []);

    const emit = useCallback((event, data) => {
        if (socket?.connected) {
            socket.emit(event, data);
        }
    }, []);

    const joinConversation = useCallback((conversationId) => {
        emit('conversation:join', conversationId);
    }, [emit]);

    const leaveConversation = useCallback((conversationId) => {
        emit('conversation:leave', conversationId);
    }, [emit]);

    const startTyping = useCallback((conversationId) => {
        emit('typing:start', { conversationId });
    }, [emit]);

    const stopTyping = useCallback((conversationId) => {
        emit('typing:stop', { conversationId });
    }, [emit]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            listenersRef.current.forEach(({ event, handler }) => {
                socket?.off(event, handler);
            });
            listenersRef.current = [];
        };
    }, []);

    return {
        socket,
        connect,
        disconnect,
        on,
        off,
        emit,
        joinConversation,
        leaveConversation,
        startTyping,
        stopTyping,
        isConnected: socket?.connected || false,
    };
};

export const getSocket = () => socket;
