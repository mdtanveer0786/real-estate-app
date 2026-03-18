import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiSearch } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import EmptyState from '../components/common/EmptyState';

const MessagesPage = () => {
    const { user } = useAuth();
    const { on, off, connect, joinConversation, leaveConversation, startTyping, stopTyping } = useSocket();
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [typing, setTyping] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const msgEndRef = React.useRef(null);

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

    useEffect(() => {
        const handleMsg = (msg) => {
            if (activeConv && msg.sender !== user?._id) {
                setMessages(prev => [...prev, msg]);
                api.put(`/conversations/${activeConv._id}/read`).catch(() => {});
            }
            fetchConversations();
        };
        const handleType = ({ name }) => setTyping(name);
        const handleStop = () => setTyping(null);

        on('message:new', handleMsg);
        on('typing:start', handleType);
        on('typing:stop', handleStop);
        return () => { off('message:new', handleMsg); off('typing:start', handleType); off('typing:stop', handleStop); };
    }, [on, off, activeConv, user, fetchConversations]);

    useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const openConv = async (conv) => {
        if (activeConv) leaveConversation(activeConv._id);
        setActiveConv(conv);
        joinConversation(conv._id);
        try {
            const { data } = await api.get(`/conversations/${conv._id}/messages`);
            setMessages(data.messages || []);
            await api.put(`/conversations/${conv._id}/read`);
        } catch { /* ignore */ }
    };

    const send = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeConv) return;
        try {
            const { data } = await api.post(`/conversations/${activeConv._id}/messages`, { text: newMsg });
            setMessages(prev => [...prev, data.message]);
            setNewMsg('');
            stopTyping(activeConv._id);
            fetchConversations();
        } catch { /* ignore */ }
    };

    const getOther = (conv) => conv.participants?.find(p => p._id !== user?._id) || {};

    const filtered = conversations.filter(c => {
        const other = getOther(c);
        return !search || other.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Messages</h1>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex" style={{ height: 'calc(100vh - 200px)' }}>
                    {/* Sidebar */}
                    <div className={`w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'} ${!activeConv ? 'flex-1 md:flex-none' : ''}`}>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 rounded-xl outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
                            ) : filtered.length === 0 ? (
                                <EmptyState icon="💬" title="No conversations" message="Start a conversation from any property page." />
                            ) : filtered.map(conv => {
                                const other = getOther(conv);
                                const isActive = activeConv?._id === conv._id;
                                return (
                                    <button
                                        key={conv._id}
                                        onClick={() => openConv(conv)}
                                        className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${
                                            isActive ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                                            {other.name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{other.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage?.text || 'No messages'}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
                        {!activeConv ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <FiMessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Select a conversation to start chatting</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Chat header */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                    <button onClick={() => { leaveConversation(activeConv._id); setActiveConv(null); }} className="md:hidden p-1 text-gray-500">←</button>
                                    <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                        {getOther(activeConv).name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{getOther(activeConv).name}</p>
                                        {typing && <p className="text-xs text-primary-500">typing...</p>}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                    {messages.map(msg => {
                                        const mine = msg.sender?.toString() === user?._id || msg.sender?._id === user?._id;
                                        return (
                                            <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                                    mine
                                                        ? 'bg-primary-600 text-white rounded-br-sm'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                                }`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={msgEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={send} className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                                    <input
                                        value={newMsg}
                                        onChange={e => { setNewMsg(e.target.value); startTyping(activeConv._id); }}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl outline-none text-sm text-gray-900 dark:text-white"
                                    />
                                    <button type="submit" disabled={!newMsg.trim()} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors">
                                        Send
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
