import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiCpu } from 'react-icons/fi';
import api from '../../services/api';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: "👋 Hi! I'm your AI property assistant. Ask me about properties, prices, or recommendations!", type: 'help' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const { data } = await api.post('/ai/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'bot', text: data.reply, type: data.type }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.', type: 'error' }]);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: '🔍 Search Properties', msg: 'Find apartments in Mumbai' },
        { label: '💰 Price Stats', msg: 'What is the average price in Bangalore?' },
        { label: '⭐ Recommendations', msg: 'Suggest properties for me' },
    ];

    return (
        <>
            {/* Toggle button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-6 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="AI Assistant"
            >
                {isOpen ? <FiX className="w-5 h-5" /> : <FiCpu className="w-5 h-5" />}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-40 right-6 w-96 h-[480px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <FiCpu className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Property Assistant</h3>
                                <p className="text-xs text-white/70">Powered by smart search</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                                        msg.role === 'user'
                                            ? 'bg-purple-600 text-white rounded-br-sm'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                    }`}>
                                        {/* Simple markdown-like bold rendering */}
                                        {msg.text.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={j}>{part.slice(2, -2)}</strong>;
                                            }
                                            return part;
                                        })}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2">
                                {quickActions.map((qa, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setInput(qa.msg); }}
                                        className="text-xs px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full hover:bg-purple-100 transition-colors"
                                    >
                                        {qa.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <form onSubmit={send} className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask about properties..."
                                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-full outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 transition-colors flex-shrink-0"
                            >
                                <FiSend className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
