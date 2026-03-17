import React, { useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email');
            return;
        }

        setLoading(true);
        try {
            await api.post('/newsletter/subscribe', { email });
            toast.success('Successfully subscribed to newsletter!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to subscribe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-10 sm:py-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
            
            {/* Decorative Orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400 rounded-full blur-[100px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

            <div className="container-custom relative z-10">
                <div className="max-w-2xl mx-auto text-center bg-white/5 backdrop-blur-lg p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-sm">
                        Subscribe to Our Newsletter
                    </h3>
                    <p className="text-primary-100 mb-6 max-w-lg mx-auto text-sm leading-relaxed">
                        Get the latest property updates, market insights, and exclusive luxury listings across India directly in your inbox.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                        <div className="flex-1 relative group">
                            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors z-10" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-400/30 transition-all font-medium border-2 border-transparent focus:border-white shadow-inner text-sm"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 text-sm"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiSend className="text-base" />
                                    <span>Subscribe</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-primary-200 text-xs mt-4 font-medium">
                        We respect your privacy. No spam. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;