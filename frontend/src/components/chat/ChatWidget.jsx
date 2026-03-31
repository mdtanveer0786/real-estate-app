import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiChevronLeft, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import api from '../../services/api';

// Online dot indicator
const OnlineDot = ({ online }) => (
    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
);

// Message status icon
const MsgStatus = ({ msg, userId }) => {
    if (msg.sender?._id !== userId && msg.sender !== userId) return null;
    const seen = msg.seenBy?.some(s => (s.user || s) !== userId);
    return seen
        ? <span className="text-blue-400 text-xs ml-1">✓✓</span>
        : <span className="text-gray-300 text-xs ml-1">✓</span>;
};

const ChatWidget = () => {
    const { user, isAuthenticated } = useAuth();
    const { on, off, connect, joinConversation, leaveConversation, startTyping, stopTyping, markMessageSeen, isConnected } = useSocket();

    const [isOpen,        setIsOpen]        = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeConv,    setActiveConv]    = useState(null);
    const [messages,      setMessages]      = useState([]);
    const [newMsg,        setNewMsg]        = useState('');
    const [typing,        setTyping]        = useState(null);
    const [unreadTotal,   setUnreadTotal]   = useState(0);
    const [loading,       setLoading]       = useState(false);
    const [onlineMap,     setOnlineMap]     = useState({});   // { userId: bool }

    const messagesEndRef   = useRef(null);
    const typingTimeoutRef = useRef(null);
    const inputRef         = useRef(null);

    // ── Fetch conversations ───────────────────────────────────────────────────
    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/conversations');
            setConversations(data.conversations || []);
        } catch { /* ignore */ }
    }, []);

    const fetchUnread = useCallback(async () => {
        try {
            const { data } = await api.get('/conversations/unread-count');
            setUnreadTotal(data.count || 0);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (isAuthenticated) { connect(); fetchUnread(); }
    }, [isAuthenticated, connect, fetchUnread]);

    // ── Real-time handlers ────────────────────────────────────────────────────
    useEffect(() => {
        const handleNewMessage = (msg) => {
            // Ignore meta messages (seen/delivered receipts)
            if (msg.type === 'seen' || msg.type === 'delivered') {
                setMessages(prev => prev.map(m =>
                    m._id === msg.messageId
                        ? { ...m, seenBy: [...(m.seenBy || []), { user: msg.seenBy, at: msg.seenAt }] }
                        : m
                ));
                return;
            }
            if (activeConv?._id && msg.conversation === activeConv._id) {
                setMessages(prev => {
                    // Deduplicate by _id
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
                // Auto-mark read
                api.put(`/conversations/${activeConv._id}/read`).catch(() => {});
            } else {
                setUnreadTotal(prev => prev + 1);
            }
            fetchConversations();
        };

        const handleTypingStart = ({ userId: uid, name }) => {
            if (uid !== user?._id) setTyping(name);
        };
        const handleTypingStop = () => setTyping(null);

        const handleUserOnline  = ({ userId, online }) => setOnlineMap(prev => ({ ...prev, [userId]: online }));
        const handleUserOffline = ({ userId })         => setOnlineMap(prev => ({ ...prev, [userId]: false }));

        on('message:new',  handleNewMessage);
        on('typing:start', handleTypingStart);
        on('typing:stop',  handleTypingStop);
        on('user:online',  handleUserOnline);
        on('user:offline', handleUserOffline);

        return () => {
            off('message:new',  handleNewMessage);
            off('typing:start', handleTypingStart);
            off('typing:stop',  handleTypingStop);
            off('user:online',  handleUserOnline);
            off('user:offline', handleUserOffline);
        };
    }, [on, off, activeConv, user, fetchConversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Open widget ───────────────────────────────────────────────────────────
    const handleOpen = () => {
        setIsOpen(p => !p);
        if (!isOpen) { fetchConversations(); inputRef.current?.focus(); }
    };

    // ── Open conversation ─────────────────────────────────────────────────────
    const openConversation = async (conv) => {
        setActiveConv(conv);
        setLoading(true);
        joinConversation(conv._id);

        try {
            const { data } = await api.get(`/conversations/${conv._id}/messages`);
            setMessages(data.messages || []);
            await api.put(`/conversations/${conv._id}/read`);
            setUnreadTotal(prev => Math.max(0, prev - (conv.myUnread || 0)));

            // Mark latest message as seen
            const latest = data.messages?.at(-1);
            if (latest?._id) markMessageSeen(conv._id, latest._id);
        } catch { /* ignore */ }
        setLoading(false);
    };

    const closeConversation = () => {
        if (activeConv) leaveConversation(activeConv._id);
        setActiveConv(null);
        setMessages([]);
        setTyping(null);
    };

    // ── Send message ──────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeConv) return;

        const text = newMsg.trim();
        setNewMsg('');
        stopTyping(activeConv._id);

        // Optimistic UI
        const optimistic = {
            _id:       `opt_${Date.now()}`,
            sender:    { _id: user._id, name: user.name, avatar: user.avatar },
            text,
            createdAt: new Date().toISOString(),
            seenBy:    [],
            optimistic: true,
        };
        setMessages(prev => [...prev, optimistic]);

        try {
            const { data } = await api.post(`/conversations/${activeConv._id}/messages`, { text });
            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m._id === optimistic._id ? data.message : m));
        } catch {
            // Remove optimistic on failure
            setMessages(prev => prev.filter(m => m._id !== optimistic._id));
        }
    };

    // ── Typing ────────────────────────────────────────────────────────────────
    const handleTyping = (e) => {
        setNewMsg(e.target.value);
        if (activeConv) {
            startTyping(activeConv._id);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => stopTyping(activeConv._id), 2000);
        }
    };

    if (!isAuthenticated) return null;

    const getOther = (conv) => conv.participants?.find(p => p._id !== user?._id) || {};

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={handleOpen}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl flex items-center justify-center z-50 transition-colors"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                aria-label="Open chat"
            >
                {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
                {!isOpen && unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadTotal > 9 ? '9+' : unreadTotal}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-[4.5rem] right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[65vh] sm:h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-primary-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                            {activeConv ? (
                                <>
                                    <button onClick={closeConversation} className="p-1 hover:bg-primary-700 rounded-lg">
                                        <FiChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-2 flex-1 ml-2">
                                        <div className="relative">
                                            <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-sm font-bold overflow-hidden">
                                                {getOther(activeConv)?.avatar
                                                    ? <img src={getOther(activeConv).avatar} alt="" className="w-full h-full object-cover" />
                                                    : getOther(activeConv)?.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <OnlineDot online={onlineMap[getOther(activeConv)?._id]} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold leading-tight">{getOther(activeConv)?.name}</p>
                                            <p className="text-[10px] opacity-70">
                                                {typing ? `${typing} is typing...` : onlineMap[getOther(activeConv)?._id] ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FiMessageCircle className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Messages</span>
                                    {!isConnected && <span className="text-[10px] opacity-70 ml-1">(connecting...)</span>}
                                </div>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary-700 rounded-lg ml-2">
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        {!activeConv ? (
                            /* Conversation list */
                            <div className="flex-1 overflow-y-auto">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                                        <FiMessageCircle className="w-10 h-10 mb-3 opacity-30" />
                                        <p className="text-sm font-medium">No conversations yet</p>
                                        <p className="text-xs mt-1 opacity-70">Contact a property agent to start chatting</p>
                                    </div>
                                ) : conversations.map(conv => {
                                    const other = getOther(conv);
                                    return (
                                        <button
                                            key={conv._id}
                                            onClick={() => openConversation(conv)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-left transition-colors"
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                                                    {other?.avatar
                                                        ? <img src={other.avatar} alt="" className="w-full h-full object-cover" />
                                                        : other?.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <OnlineDot online={onlineMap[other?._id]} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{other?.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage?.text || 'Start a conversation'}</p>
                                            </div>
                                            {conv.myUnread > 0 && (
                                                <span className="shrink-0 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {conv.myUnread}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Message view */
                            <>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {loading ? (
                                        <div className="flex justify-center pt-8"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
                                    ) : messages.length === 0 ? (
                                        <p className="text-center text-xs text-gray-400 pt-8">No messages yet. Say hello!</p>
                                    ) : messages.map((msg) => {
                                        const mine = (msg.sender?._id || msg.sender) === user._id;
                                        return (
                                            <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                                                    mine
                                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                                } ${msg.optimistic ? 'opacity-70' : ''}`}>
                                                    <p>{msg.text}</p>
                                                    <div className="flex items-center justify-end gap-1 mt-0.5">
                                                        <span className="text-[10px] opacity-60">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {mine && <MsgStatus msg={msg} userId={user._id} />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {typing && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm">
                                                <div className="flex gap-1 items-center h-4">
                                                    {[0,1,2].map(i => (
                                                        <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 shrink-0">
                                    <input
                                        ref={inputRef}
                                        value={newMsg}
                                        onChange={handleTyping}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full outline-none text-gray-900 dark:text-white placeholder-gray-400 min-h-0"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMsg.trim()}
                                        className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-colors shrink-0 min-h-0"
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
