import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

const TYPE_META = {
    message:         { icon: '💬', color: 'bg-blue-100 dark:bg-blue-900/30' },
    inquiry:         { icon: '📩', color: 'bg-orange-100 dark:bg-orange-900/30' },
    review:          { icon: '⭐', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    price_drop:      { icon: '📉', color: 'bg-green-100 dark:bg-green-900/30' },
    property_update: { icon: '🏠', color: 'bg-primary-100 dark:bg-primary-900/30' },
    subscription:    { icon: '💳', color: 'bg-purple-100 dark:bg-purple-900/30' },
    system:          { icon: '📢', color: 'bg-gray-100 dark:bg-gray-800' },
    verification:    { icon: '✉️', color: 'bg-teal-100 dark:bg-teal-900/30' },
};

const fmtAge = (d) => {
    const secs = Math.floor((Date.now() - new Date(d)) / 1000);
    if (secs < 60)   return 'just now';
    if (secs < 3600) return `${Math.floor(secs/60)}m ago`;
    if (secs < 86400)return `${Math.floor(secs/3600)}h ago`;
    return `${Math.floor(secs/86400)}d ago`;
};

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();
    const { on, off }         = useSocket();
    const navigate            = useNavigate();

    const [count,         setCount]         = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen,        setIsOpen]        = useState(false);
    const [loading,       setLoading]       = useState(false);
    const panelRef = useRef(null);

    /* ── Fetch ─────────────────────────────────────────────────────────────── */
    const fetchCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { data } = await api.get('/notifications/unread-count');
            setCount(data.count || 0);
        } catch { /* ignore */ }
    }, [isAuthenticated]);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const { data } = await api.get('/notifications?limit=10');
            setNotifications(data.notifications || []);
        } catch { /* ignore */ } finally { setLoading(false); }
    }, [isAuthenticated]);

    useEffect(() => { if (isAuthenticated) fetchCount(); }, [isAuthenticated, fetchCount]);

    /* ── Real-time ─────────────────────────────────────────────────────────── */
    useEffect(() => {
        const handle = (notification) => {
            setCount(prev => prev + 1);
            setNotifications(prev => [notification, ...prev].slice(0, 10));
        };
        on('notification:new', handle);
        return () => off('notification:new', handle);
    }, [on, off]);

    /* ── Outside click ─────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    /* ── Actions ───────────────────────────────────────────────────────────── */
    const handleOpen = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next && notifications.length === 0) fetchNotifications();
    };

    const handleClick = async (n) => {
        if (!n.read) {
            try {
                await api.put(`/notifications/${n._id}/read`);
                setCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x));
            } catch { /* ignore */ }
        }
        setIsOpen(false);
        if (n.link) navigate(n.link);
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch { /* ignore */ }
    };

    const deleteOne = async (e, id) => {
        e.stopPropagation();
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            setCount(prev => {
                const n = notifications.find(x => x._id === id);
                return n && !n.read ? Math.max(0, prev - 1) : prev;
            });
        } catch { /* ignore */ }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={handleOpen}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-0"
            >
                <FiBell className="w-[18px] h-[18px]" />
                <AnimatePresence>
                    {count > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                        >
                            {count > 9 ? '9+' : count}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                                    {count > 0 && (
                                        <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                                            {count} new
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {count > 0 && (
                                        <button onClick={markAllRead}
                                            className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors min-h-0">
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)}
                                        className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-0">
                                        <FiX className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-[22rem] overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                                {loading ? (
                                    <div className="p-4 space-y-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-xl skeleton flex-shrink-0" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-3 skeleton rounded w-3/4" />
                                                    <div className="h-2.5 skeleton rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="py-10 text-center">
                                        <FiBell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400 dark:text-gray-500">All caught up!</p>
                                    </div>
                                ) : notifications.map(n => {
                                    const meta = TYPE_META[n.type] || TYPE_META.system;
                                    return (
                                        <div
                                            key={n._id}
                                            onClick={() => handleClick(n)}
                                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group
                                                ${!n.read
                                                    ? 'bg-primary-50/60 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${meta.color}`}>
                                                {meta.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-snug ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                                                    {fmtAge(n.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500" />}
                                                <button
                                                    onClick={(e) => deleteOne(e, n._id)}
                                                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-0"
                                                >
                                                    <FiTrash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 text-center">
                                    <button
                                        onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                                        className="text-[11px] text-primary-600 hover:text-primary-700 font-semibold min-h-0"
                                    >
                                        View all notifications →
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
