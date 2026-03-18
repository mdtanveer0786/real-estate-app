import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const { on, off, connect, joinConversation, leaveConversation, startTyping, stopTyping } = useSocket();

    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [typing, setTyping] = useState(null);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch conversations list
    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/conversations');
            setConversations(data.conversations || []);
        } catch { /* ignore */ }
    }, []);

    // Fetch unread count
    const fetchUnread = useCallback(async () => {
        try {
            const { data } = await api.get('/conversations/unread-count');
            setUnreadTotal(data.count);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            connect();
            fetchUnread();
        }
    }, [isAuthenticated, connect, fetchUnread]);

    // Real-time message handler
    useEffect(() => {
        const handleNewMessage = (msg) => {
            if (activeConv) {
                setMessages(prev => [...prev, msg]);
                // Mark as read since we're viewing
                api.put(`/conversations/${activeConv._id}/read`).catch(() => {});
            } else {
                setUnreadTotal(prev => prev + 1);
            }
        };

        const handleTypingStart = ({ userId: uid, name }) => {
            if (uid !== user?._id) setTyping(name);
        };
        const handleTypingStop = () => setTyping(null);

        on('message:new', handleNewMessage);
        on('typing:start', handleTypingStart);
        on('typing:stop', handleTypingStop);

        return () => {
            off('message:new', handleNewMessage);
            off('typing:start', handleTypingStart);
            off('typing:stop', handleTypingStop);
        };
    }, [on, off, activeConv, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Open conversation
    const openConversation = async (conv) => {
        setActiveConv(conv);
        setLoading(true);
        joinConversation(conv._id);

        try {
            const { data } = await api.get(`/conversations/${conv._id}/messages`);
            setMessages(data.messages || []);
            await api.put(`/conversations/${conv._id}/read`);
        } catch { /* ignore */ }
        setLoading(false);
    };

    // Close conversation
    const closeConversation = () => {
        if (activeConv) leaveConversation(activeConv._id);
        setActiveConv(null);
        setMessages([]);
        setTyping(null);
    };

    // Send message
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeConv) return;

        try {
            await api.post(`/conversations/${activeConv._id}/messages`, { text: newMsg });
            setNewMsg('');
            stopTyping(activeConv._id);
        } catch { /* ignore */ }
    };

    // Typing indicator
    const handleInputChange = (e) => {
        setNewMsg(e.target.value);
        if (activeConv) {
            startTyping(activeConv._id);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping(activeConv._id);
            }, 2000);
        }
    };

    const toggleOpen = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (next) fetchConversations();
    };

    if (!isAuthenticated) return null;

    const getOtherParticipant = (conv) => {
        return conv.participants?.find(p => p._id !== user?._id) || {};
    };

    return (
        <>
            {/* Floating button */}
            <motion.button
                onClick={toggleOpen}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
                {!isOpen && unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary-600 text-white px-4 py-3 flex items-center gap-3">
                            {activeConv && (
                                <button onClick={closeConversation} className="hover:bg-primary-700 p-1 rounded">
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>
                            )}
                            <h3 className="font-semibold text-sm flex-1">
                                {activeConv
                                    ? getOtherParticipant(activeConv).name || 'Chat'
                                    : 'Messages'
                                }
                            </h3>
                        </div>

                        {!activeConv ? (
                            /* Conversations list */
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="p-6 text-center text-gray-400 text-sm">
                                        <FiMessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                        No conversations yet
                                    </div>
                                ) : conversations.map(conv => {
                                    const other = getOtherParticipant(conv);
                                    return (
                                        <button
                                            key={conv._id}
                                            onClick={() => openConversation(conv)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-3 border-b border-gray-100 dark:border-gray-700/50"
                                        >
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                                                {other.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {other.name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {conv.lastMessage?.text || 'No messages yet'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Messages view */
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {loading ? (
                                        <div className="text-center text-gray-400 text-sm py-8">Loading...</div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-gray-400 text-sm py-8">
                                            Start a conversation! 👋
                                        </div>
                                    ) : messages.map(msg => {
                                        const isMine = msg.sender?.toString() === user?._id ||
                                                       msg.sender?._id === user?._id;
                                        return (
                                            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                                                    isMine
                                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {typing && (
                                        <div className="text-xs text-gray-400 italic">{typing} is typing...</div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                                    <input
                                        value={newMsg}
                                        onChange={handleInputChange}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                        maxLength={2000}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMsg.trim()}
                                        className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors flex-shrink-0"
                                    >
                                        <FiSend className="w-4 h-4" />
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
