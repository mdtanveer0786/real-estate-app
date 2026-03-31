import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCpu } from 'react-icons/fi';
import api from '../../services/api';

// Simple markdown bold renderer
const MdText = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <span>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**')
                    ? <strong key={i}>{part.slice(2, -2)}</strong>
                    : <span key={i}>{part}</span>
            )}
        </span>
    );
};

const AIChatbot = () => {
    const [isOpen,   setIsOpen]   = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "👋 Hi! I'm your AI property assistant. Ask me about properties, prices, or recommendations!", type: 'help' },
    ]);
    const [input,    setInput]    = useState('');
    const [loading,  setLoading]  = useState(false);
    const endRef   = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 200); }, [isOpen]);

    const send = async (e) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || loading) return;
        setInput('');

        const userMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            // Build OpenAI-compatible history from last 6 messages
            const history = messages.slice(-6).map(m => ({
                role:    m.role === 'user' ? 'user' : 'assistant',
                content: m.text,
            }));

            const { data } = await api.post('/ai/chat', { message: text, history });
            setMessages(prev => [...prev, {
                role: 'bot',
                text: data.reply,
                type: data.type,
                poweredBy: data.powered_by,
            }]);
        } catch (err) {
            const isTimeout = err.code === 'ECONNABORTED';
            setMessages(prev => [...prev, {
                role: 'bot',
                text: isTimeout
                    ? 'Sorry, the request timed out. Please try again.'
                    : 'Something went wrong. Please try again in a moment.',
                type: 'error',
            }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: '🔍 Find Properties', msg: 'Find 2BHK apartments in Bangalore' },
        { label: '💰 Price Stats',      msg: 'What is the average price in Mumbai?' },
        { label: '⭐ Recommendations',  msg: 'Suggest properties for me' },
    ];

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(p => !p)}
                className="fixed bottom-[5.5rem] right-6 w-11 h-11 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                title="AI Assistant"
                aria-label="Toggle AI assistant"
            >
                {isOpen ? <FiX className="w-4 h-4" /> : <FiCpu className="w-4 h-4" />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="fixed bottom-[9rem] right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[60vh] sm:h-[480px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                                    <FiCpu className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold leading-tight">AI Property Assistant</p>
                                    <p className="text-[10px] opacity-70">Powered by smart search</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                                        msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-sm'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                    } ${msg.type === 'error' ? 'border border-red-300 dark:border-red-700' : ''}`}>
                                        <MdText text={msg.text} />
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2.5 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1 items-center h-4">
                                            {[0,1,2].map(i => (
                                                <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Quick actions (only on first message) */}
                        {messages.length <= 1 && (
                            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
                                {quickActions.map((qa, i) => (
                                    <button key={i}
                                        onClick={() => { setInput(qa.msg); inputRef.current?.focus(); }}
                                        className="text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-100 transition-colors"
                                    >
                                        {qa.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={send} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 shrink-0">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask about properties..."
                                disabled={loading}
                                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full outline-none text-gray-900 dark:text-white placeholder-gray-400 min-h-0"
                            />
                            <button type="submit"
                                disabled={!input.trim() || loading}
                                className="w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-colors shrink-0 min-h-0"
                            >
                                <FiSend className="w-3.5 h-3.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
