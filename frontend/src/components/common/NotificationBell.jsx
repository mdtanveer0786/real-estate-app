import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();
    const { on, off, connect } = useSocket();
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Fetch initial unread count
    const fetchCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/notifications/unread-count');
            setCount(data.count);
        } catch { /* ignore */ }
    }, [isAuthenticated]);

    // Fetch recent notifications
    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/notifications?unreadOnly=false');
            setNotifications(data.notifications?.slice(0, 8) || []);
        } catch { /* ignore */ }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) {
            connect();
            fetchCount();
        }
    }, [isAuthenticated, connect, fetchCount]);

    // Listen for real-time notifications
    useEffect(() => {
        const handleNew = (notification) => {
            setCount(prev => prev + 1);
            setNotifications(prev => [notification, ...prev].slice(0, 8));
        };
        on('notification:new', handleNew);
        return () => off('notification:new', handleNew);
    }, [on, off]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) fetchNotifications();
    };

    const handleClick = async (notification) => {
        // Mark as read
        if (!notification.read) {
            try {
                await api.put(`/notifications/${notification._id}/read`);
                setCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
                );
            } catch { /* ignore */ }
        }
        setIsOpen(false);
        if (notification.link) navigate(notification.link);
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* ignore */ }
    };

    if (!isAuthenticated) return null;

    const typeIcons = {
        message: '💬',
        inquiry: '📩',
        price_drop: '📉',
        review: '⭐',
        property_update: '🏠',
        subscription: '💳',
        system: '📢',
        verification: '✉️',
    };

    return (
        <div className="relative">
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Notifications"
            >
                <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {count > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {count > 9 ? '9+' : count}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    Notifications
                                </h3>
                                {count > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs text-primary-600 hover:underline"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <button
                                            key={n._id}
                                            onClick={() => handleClick(n)}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 ${
                                                !n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                            }`}
                                        >
                                            <div className="flex gap-3">
                                                <span className="text-lg flex-shrink-0 mt-0.5">
                                                    {typeIcons[n.type] || '🔔'}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-gray-900 dark:text-white truncate`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
