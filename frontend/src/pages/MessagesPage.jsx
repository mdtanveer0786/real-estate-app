import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMessageCircle, FiSearch, FiSend, FiArrowLeft,
    FiCheck, FiMoreVertical
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import SEO from '../components/common/SEO';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => {
    const now  = new Date();
    const date = new Date(d);
    if (now.toDateString() === date.toDateString()) return 'Today';
    const yest = new Date(now); yest.setDate(yest.getDate() - 1);
    if (yest.toDateString() === date.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* Online dot */
const Dot = ({ online }) => (
    <span className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 flex-shrink-0 ${
        online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
    }`} />
);

/* Avatar */
const Avatar = ({ user, size = 10, online }) => (
    <div className={`relative flex-shrink-0 w-${size} h-${size} rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold overflow-hidden`}>
        {user?.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            : <span className={`text-${size <= 8 ? 'sm' : 'base'}`}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
        }
        {online !== undefined && (
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
        )}
    </div>
);

/* Message seen receipt */
const Receipt = ({ msg, myId }) => {
    if ((msg.sender?._id || msg.sender) !== myId) return null;
    const seen = msg.seenBy?.some(s => (s.user?._id || s.user || s) !== myId);
    return (
        <span className={`text-[10px] ml-1 ${seen ? 'text-blue-300' : 'text-white/50'}`}>
            {seen ? '✓✓' : '✓'}
        </span>
    );
};

/* ── Main Component ──────────────────────────────────────────────────────── */
const MessagesPage = () => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        on, off, connect, joinConversation, leaveConversation,
        startTyping, stopTyping, markMessageSeen, isConnected,
    } = useSocket();

    const [conversations, setConversations] = useState([]);
    const [activeConv,    setActiveConv]    = useState(null);
    const [messages,      setMessages]      = useState([]);
    const [newMsg,        setNewMsg]        = useState('');
    const [typing,        setTyping]        = useState(null);
    const [search,        setSearch]        = useState('');
    const [loading,       setLoading]       = useState(true);
    const [msgLoading,    setMsgLoading]    = useState(false);
    const [onlineMap,     setOnlineMap]     = useState({});
    const [hasMore,       setHasMore]       = useState(false);
    const [page,          setPage]          = useState(1);

    const msgEndRef    = useRef(null);
    const typingTimer  = useRef(null);
    const inputRef     = useRef(null);

    /* ── Fetch conversations ─────────────────────────────────────────────── */
    const fetchConversations = useCallback(async () => {
        try {
            const { data } = await api.get('/conversations');
            setConversations(data.conversations || []);
        } catch { /* ignore */ } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        connect();
        fetchConversations();
    }, [connect, fetchConversations]);

    /* ── Auto-open conversation from URL param ───────────────────────────── */
    useEffect(() => {
        if (paramId && conversations.length > 0) {
            const conv = conversations.find(c => c._id === paramId);
            if (conv) openConv(conv);
        }
    }, [paramId, conversations]); // eslint-disable-line

    /* ── Socket handlers ─────────────────────────────────────────────────── */
    useEffect(() => {
        const handleMsg = (msg) => {
            if (msg.type === 'seen' || msg.type === 'delivered') {
                setMessages(prev => prev.map(m =>
                    m._id === msg.messageId
                        ? { ...m, seenBy: [...(m.seenBy || []), { user: msg.seenBy, at: msg.seenAt }] }
                        : m
                ));
                return;
            }
            if (activeConv?._id === (msg.conversation || activeConv._id)) {
                setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
                api.put(`/conversations/${activeConv._id}/read`).catch(() => {});
            }
            fetchConversations();
        };

        const onType    = ({ name }) => setTyping(name);
        const offType   = ()         => setTyping(null);
        const onOnline  = ({ userId, online }) => setOnlineMap(p => ({ ...p, [userId]: online }));
        const onOffline = ({ userId })         => setOnlineMap(p => ({ ...p, [userId]: false }));

        on('message:new',  handleMsg);
        on('typing:start', onType);
        on('typing:stop',  offType);
        on('user:online',  onOnline);
        on('user:offline', onOffline);

        return () => {
            off('message:new',  handleMsg);
            off('typing:start', onType);
            off('typing:stop',  offType);
            off('user:online',  onOnline);
            off('user:offline', onOffline);
        };
    }, [on, off, activeConv, fetchConversations]);

    /* Auto-scroll */
    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ── Open conversation ───────────────────────────────────────────────── */
    const openConv = async (conv) => {
        if (activeConv?._id === conv._id) return;
        if (activeConv) leaveConversation(activeConv._id);

        setActiveConv(conv);
        setMsgLoading(true);
        setMessages([]);
        setPage(1);
        joinConversation(conv._id);

        try {
            const { data } = await api.get(`/conversations/${conv._id}/messages?page=1`);
            setMessages(data.messages || []);
            setHasMore(data.page < data.pages);

            await api.put(`/conversations/${conv._id}/read`);
            setConversations(prev => prev.map(c =>
                c._id === conv._id ? { ...c, myUnread: 0 } : c
            ));

            // Mark latest as seen
            const latest = data.messages?.at(-1);
            if (latest?._id) markMessageSeen(conv._id, latest._id);

            // Update URL without navigation
            window.history.replaceState(null, '', `/messages/${conv._id}`);
        } catch { /* ignore */ } finally { setMsgLoading(false); }

        setTimeout(() => inputRef.current?.focus(), 100);
    };

    /* Load more (pagination) */
    const loadMore = async () => {
        if (!activeConv || !hasMore) return;
        const nextPage = page + 1;
        try {
            const { data } = await api.get(`/conversations/${activeConv._id}/messages?page=${nextPage}`);
            setMessages(prev => [...(data.messages || []), ...prev]);
            setPage(nextPage);
            setHasMore(nextPage < data.pages);
        } catch { /* ignore */ }
    };

    /* ── Send message ────────────────────────────────────────────────────── */
    const handleSend = async (e) => {
        e.preventDefault();
        const text = newMsg.trim();
        if (!text || !activeConv) return;

        setNewMsg('');
        clearTimeout(typingTimer.current);
        stopTyping(activeConv._id);

        // Optimistic message
        const opt = {
            _id: `opt_${Date.now()}`,
            sender: { _id: user._id, name: user.name, avatar: user.avatar },
            text, createdAt: new Date().toISOString(),
            seenBy: [], optimistic: true,
        };
        setMessages(prev => [...prev, opt]);

        try {
            const { data } = await api.post(`/conversations/${activeConv._id}/messages`, { text });
            setMessages(prev => prev.map(m => m._id === opt._id ? data.message : m));
            fetchConversations();
        } catch {
            setMessages(prev => prev.filter(m => m._id !== opt._id));
        }
    };

    /* Typing handler */
    const handleInput = (e) => {
        setNewMsg(e.target.value);
        if (activeConv) {
            startTyping(activeConv._id);
            clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => stopTyping(activeConv._id), 2000);
        }
    };

    /* Handle Enter key (Shift+Enter = newline) */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
    };

    /* ── Helpers ─────────────────────────────────────────────────────────── */
    const getOther = (conv) => conv.participants?.find(p => p._id !== user?._id) || {};

    const filtered = conversations.filter(c => {
        const other = getOther(c);
        return !search || other.name?.toLowerCase().includes(search.toLowerCase());
    });

    /* Group messages by date */
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = fmtDate(msg.createdAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    /* ── Layout ──────────────────────────────────────────────────────────── */
    return (
        <>
            <SEO title="Messages | EstateElite" />
            <div className="min-h-[calc(100dvh-4.25rem)] bg-gray-50 dark:bg-gray-900 flex flex-col">
                <div className="flex-1 flex max-w-6xl mx-auto w-full px-4 py-4 sm:py-6 gap-0">
                    <div
                        className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex shadow-sm"
                        style={{ height: 'calc(100dvh - 6.5rem)' }}
                    >
                        {/* ── Sidebar ────────────────────────────────────── */}
                        <div className={`w-full sm:w-72 lg:w-80 flex-shrink-0 border-r border-gray-100 dark:border-gray-700 flex flex-col ${
                            activeConv ? 'hidden sm:flex' : 'flex'
                        }`}>
                            {/* Sidebar header */}
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-3">
                                    <h1 className="text-base font-bold text-gray-900 dark:text-white">Messages</h1>
                                    {!isConnected && (
                                        <span className="text-[10px] text-amber-500 font-medium">Reconnecting…</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                    <input
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search conversations…"
                                        className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 rounded-lg outline-none text-gray-900 dark:text-white placeholder-gray-400 min-h-0"
                                    />
                                </div>
                            </div>

                            {/* Conversation list */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="space-y-1 p-2">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
                                                <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-3 skeleton rounded w-3/4" />
                                                    <div className="h-2.5 skeleton rounded w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                        <FiMessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No conversations yet</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Contact a property agent to start chatting</p>
                                    </div>
                                ) : filtered.map(conv => {
                                    const other    = getOther(conv);
                                    const isActive = activeConv?._id === conv._id;
                                    const online   = onlineMap[other._id];
                                    return (
                                        <button
                                            key={conv._id}
                                            onClick={() => openConv(conv)}
                                            className={`w-full text-left px-3 py-2.5 flex gap-3 transition-all duration-150 ${
                                                isActive
                                                    ? 'bg-primary-50 dark:bg-primary-900/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                                            }`}
                                        >
                                            <Avatar user={other} size={10} online={online} />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className={`text-sm truncate ${isActive ? 'text-primary-700 dark:text-primary-300 font-semibold' : 'text-gray-900 dark:text-white font-medium'}`}>
                                                        {other.name}
                                                    </p>
                                                    {conv.lastMessage?.timestamp && (
                                                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                            {fmtTime(conv.lastMessage.timestamp)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between gap-1 mt-0.5">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {conv.lastMessage?.text || 'No messages yet'}
                                                    </p>
                                                    {conv.myUnread > 0 && (
                                                        <span className="flex-shrink-0 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                                            {conv.myUnread > 9 ? '9+' : conv.myUnread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Chat area ──────────────────────────────────── */}
                        <div className={`flex-1 flex flex-col min-w-0 ${!activeConv ? 'hidden sm:flex' : 'flex'}`}>
                            {!activeConv ? (
                                /* Empty state */
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                                    <FiMessageCircle className="w-14 h-14 mb-4 opacity-20" />
                                    <p className="text-base font-medium text-gray-500 dark:text-gray-400">Select a conversation</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 text-center max-w-xs">
                                        Choose from your conversations or start a new one from a property listing.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Chat header */}
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-shrink-0 bg-white dark:bg-gray-800">
                                        <button
                                            onClick={() => { leaveConversation(activeConv._id); setActiveConv(null); window.history.replaceState(null, '', '/messages'); }}
                                            className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 min-h-0"
                                        >
                                            <FiArrowLeft className="w-5 h-5" />
                                        </button>
                                        <Avatar user={getOther(activeConv)} size={9} online={onlineMap[getOther(activeConv)?._id]} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {getOther(activeConv)?.name}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {typing
                                                    ? <span className="text-primary-500 font-medium">{typing} is typing…</span>
                                                    : onlineMap[getOther(activeConv)?._id]
                                                        ? <span className="text-green-500 font-medium">Online</span>
                                                        : 'Offline'
                                                }
                                            </p>
                                        </div>
                                        {activeConv.property && (
                                            <span className="hidden sm:flex text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg flex-shrink-0">
                                                🏠 Property enquiry
                                            </span>
                                        )}
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                                        {/* Load more */}
                                        {hasMore && (
                                            <div className="text-center pb-2">
                                                <button onClick={loadMore} className="text-xs text-primary-600 hover:underline font-medium min-h-0 py-1">
                                                    Load earlier messages
                                                </button>
                                            </div>
                                        )}

                                        {msgLoading ? (
                                            <div className="flex justify-center py-8">
                                                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                                                <p className="text-sm">No messages yet. Say hi! 👋</p>
                                            </div>
                                        ) : (
                                            Object.entries(groupedMessages).map(([date, msgs]) => (
                                                <div key={date}>
                                                    {/* Date divider */}
                                                    <div className="flex items-center gap-3 my-3">
                                                        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2">{date}</span>
                                                        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                                                    </div>

                                                    {msgs.map((msg) => {
                                                        const mine = (msg.sender?._id || msg.sender) === user._id;
                                                        return (
                                                            <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'} mb-1`}>
                                                                {!mine && (
                                                                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0 mr-2 self-end mb-1 overflow-hidden">
                                                                        {getOther(activeConv)?.avatar
                                                                            ? <img src={getOther(activeConv).avatar} alt="" className="w-full h-full object-cover" />
                                                                            : getOther(activeConv)?.name?.charAt(0)?.toUpperCase()
                                                                        }
                                                                    </div>
                                                                )}
                                                                <div className={`max-w-[70%] group`}>
                                                                    <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${
                                                                        mine
                                                                            ? `bg-primary-600 text-white rounded-br-sm ${msg.optimistic ? 'opacity-70' : ''}`
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                                                    }`}>
                                                                        {msg.text}
                                                                    </div>
                                                                    <div className={`flex items-center gap-1 mt-0.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                                                                        <span className="text-[10px] text-gray-400">{fmtTime(msg.createdAt)}</span>
                                                                        {mine && <Receipt msg={msg} myId={user._id} />}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))
                                        )}

                                        {/* Typing indicator */}
                                        <AnimatePresence>
                                            {typing && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 8 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="bg-gray-100 dark:bg-gray-700 px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                                                        <div className="flex gap-1 items-center h-4">
                                                            {[0,1,2].map(i => (
                                                                <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                                                    style={{ animationDelay: `${i*150}ms` }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div ref={msgEndRef} />
                                    </div>

                                    {/* Input bar */}
                                    <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
                                        <form onSubmit={handleSend} className="flex items-end gap-2">
                                            <textarea
                                                ref={inputRef}
                                                value={newMsg}
                                                onChange={handleInput}
                                                onKeyDown={handleKeyDown}
                                                placeholder="Type a message… (Enter to send)"
                                                rows={1}
                                                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 rounded-2xl outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none max-h-32 min-h-0"
                                                style={{ overflowY: 'auto' }}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMsg.trim()}
                                                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-all duration-150 flex-shrink-0 min-h-0 hover:-translate-y-0.5 active:translate-y-0"
                                            >
                                                <FiSend className="w-4 h-4" />
                                            </button>
                                        </form>
                                        <p className="text-[10px] text-gray-400 mt-1 pl-1">Shift+Enter for new line</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessagesPage;
