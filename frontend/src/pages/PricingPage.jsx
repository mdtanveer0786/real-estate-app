import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiStar, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const PricingPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [currentPlan, setCurrentPlan] = useState('free');
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/subscriptions/plans');
                setPlans(data.plans || []);

                if (isAuthenticated) {
                    const { data: sub } = await api.get('/subscriptions/current');
                    setCurrentPlan(sub.currentPlan || 'free');
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchData();
    }, [isAuthenticated]);

    const handleSubscribe = async (planId) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (planId === 'free' || planId === currentPlan) return;

        setSubscribing(planId);
        try {
            // Create order
            const { data: orderData } = await api.post('/subscriptions/create-order', { plan: planId });
            const order = orderData.order;

            // Check if Razorpay is loaded
            if (window.Razorpay) {
                const rzp = new window.Razorpay({
                    key: order.key,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'EstateElite',
                    description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
                    order_id: order.id,
                    prefill: order.prefill,
                    handler: async (response) => {
                        try {
                            await api.post('/subscriptions/verify', {
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpaySignature: response.razorpay_signature,
                                plan: planId,
                            });
                            toast.success(`${planId} plan activated! 🎉`);
                            setCurrentPlan(planId);
                        } catch {
                            toast.error('Payment verification failed');
                        }
                    },
                    theme: { color: '#6366f1' },
                });
                rzp.open();
            } else {
                // Fallback: directly verify (for demo/testing without Razorpay script)
                await api.post('/subscriptions/verify', { plan: planId });
                toast.success(`${planId} plan activated! 🎉`);
                setCurrentPlan(planId);
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to subscribe');
        } finally {
            setSubscribing(null);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
        try {
            await api.post('/subscriptions/cancel');
            toast.success('Subscription cancelled');
            setCurrentPlan('free');
        } catch {
            toast.error('Failed to cancel subscription');
        }
    };

    const planIcons = { free: <FiShield />, basic: <FiZap />, premium: <FiStar /> };
    const planGradients = {
        free: 'from-gray-500 to-gray-600',
        basic: 'from-blue-500 to-indigo-600',
        premium: 'from-purple-500 to-pink-600',
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-semibold mb-4">
                            💎 Pricing Plans
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                            Choose Your Plan
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Scale your real estate business with powerful tools and premium features.
                        </p>
                    </motion.div>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, i) => {
                        const isCurrentPlan = currentPlan === plan.id;
                        const isPopular = plan.popular;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl ${
                                    isPopular
                                        ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 scale-105'
                                        : isCurrentPlan
                                        ? 'border-emerald-500'
                                        : 'border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                {/* Popular badge */}
                                {isPopular && (
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold text-center py-1.5">
                                        ⚡ MOST POPULAR
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Icon + name */}
                                    <div className={`w-12 h-12 bg-gradient-to-br ${planGradients[plan.id]} rounded-xl flex items-center justify-center text-white text-xl mb-4`}>
                                        {planIcons[plan.id]}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>

                                    {/* Price */}
                                    <div className="mt-4 mb-6">
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">
                                            {plan.priceDisplay}
                                        </span>
                                        <span className="text-gray-500 text-sm">{plan.period}</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, j) => (
                                            <li key={j} className="flex items-start gap-3 text-sm">
                                                <FiCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    {isCurrentPlan ? (
                                        <div className="space-y-2">
                                            <div className="w-full py-3 text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-sm">
                                                ✓ Current Plan
                                            </div>
                                            {plan.id !== 'free' && (
                                                <button
                                                    onClick={handleCancel}
                                                    className="w-full py-2 text-center text-xs text-red-500 hover:underline"
                                                >
                                                    Cancel subscription
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <motion.button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={subscribing === plan.id || plan.id === 'free'}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                                                plan.id === 'free'
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-default'
                                                    : isPopular
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800'
                                            } disabled:opacity-50`}
                                        >
                                            {subscribing === plan.id ? 'Processing...' : plan.id === 'free' ? 'Free Forever' : `Upgrade to ${plan.name}`}
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ section */}
                <div className="max-w-3xl mx-auto mt-20">
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-4">
                        {[
                            { q: 'Can I switch plans anytime?', a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
                            { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets through Razorpay.' },
                            { q: 'Is there a refund policy?', a: 'Yes, we offer a 7-day money-back guarantee on all paid plans.' },
                            { q: 'What happens when I cancel?', a: 'You retain access to paid features until the end of your billing period, then revert to the Free plan.' },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{faq.q}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
