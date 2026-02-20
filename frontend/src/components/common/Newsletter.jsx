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
        <div className="bg-primary-600 dark:bg-primary-800 py-12">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">
                        Subscribe to Our Newsletter
                    </h3>
                    <p className="text-primary-100 mb-6">
                        Get the latest property updates and exclusive offers directly in your inbox
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FiSend />
                                    Subscribe
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-primary-100 text-sm mt-4">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;