import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiZap, FiStar, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

const PricingPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [plans,    setPlans]    = useState([]);
    const [current,  setCurrent]  = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [paying,   setPaying]   = useState(null); // plan id being paid

    useEffect(() => {
        fetchPlans();
        if (isAuthenticated) fetchCurrent();
    }, [isAuthenticated]); // eslint-disable-line

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/subscriptions/plans');
            setPlans(data.plans || []);
        } catch { /* ignore */ }
    };

    const fetchCurrent = async () => {
        try {
            const { data } = await api.get('/subscriptions/current');
            setCurrent(data.currentPlan || 'free');
        } catch { /* ignore */ }
    };

    const handleSubscribe = async (plan) => {
        if (!isAuthenticated) { navigate('/login?redirect=/pricing'); return; }
        if (plan.id === 'free') return;
        if (current === plan.id) { toast('You already have this plan'); return; }

        setPaying(plan.id);
        setLoading(true);
        try {
            const { data } = await api.post('/subscriptions/create-order', { plan: plan.id });
            const order = data.order;

            // If Razorpay key exists, open Razorpay checkout
            if (order.key && order.key !== '') {
                const RazorpayCheckout = () => new Promise((resolve, reject) => {
                    const options = {
                        key:         order.key,
                        amount:      order.amount,
                        currency:    order.currency,
                        name:        'EstateElite',
                        description: `${plan.name} Plan Subscription`,
                        order_id:    order.id,
                        prefill:     order.prefill,
                        notes:       order.notes,
                        theme:       { color: '#2563eb' },
                        handler: (response) => resolve(response),
                        modal:   { ondismiss: () => reject(new Error('Payment cancelled')) },
                    };
                    if (!window.Razorpay) { reject(new Error('Razorpay not loaded')); return; }
                    new window.Razorpay(options).open();
                });

                const paymentResponse = await RazorpayCheckout();
                await api.post('/subscriptions/verify', {
                    plan:                plan.id,
                    razorpayPaymentId:   paymentResponse.razorpay_payment_id,
                    razorpayOrderId:     paymentResponse.razorpay_order_id,
                    razorpaySignature:   paymentResponse.razorpay_signature,
                });
            } else {
                // Mock mode (no Razorpay keys) — verify immediately
                await api.post('/subscriptions/verify', { plan: plan.id, razorpayPaymentId: `mock_${Date.now()}` });
            }

            toast.success(`🎉 ${plan.name} plan activated!`);
            setCurrent(plan.id);
        } catch (err) {
            if (err.message !== 'Payment cancelled') {
                toast.error(err.response?.data?.error || err.message || 'Payment failed. Please try again.');
            }
        } finally {
            setLoading(false);
            setPaying(null);
        }
    };

    const planIcons = { free: FiShield, basic: FiZap, premium: FiStar };

    return (
        <>
            <SEO title="Pricing | EstateElite" description="Choose the right plan for your real estate needs." />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Hero */}
                <div className="bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white py-14 sm:py-20">
                    <div className="container-custom text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <span className="inline-block px-3 py-1 bg-primary-500/20 border border-primary-400/30 rounded-full text-primary-300 text-xs font-bold uppercase tracking-widest mb-4">
                                Simple Pricing
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
                                Plans for Every Agent
                            </h1>
                            <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto">
                                Start free, upgrade when you grow. No hidden fees.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Cards */}
                <div className="container-custom py-10 sm:py-16">
                    {plans.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[1,2,3].map(i => <div key={i} className="h-96 skeleton rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {plans.map((plan, i) => {
                                const Icon     = planIcons[plan.id] || FiShield;
                                const isCurrent = current === plan.id;
                                const isPaying  = paying === plan.id && loading;

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-300
                                            ${plan.popular
                                                ? 'border-primary-500 shadow-xl shadow-primary-500/20 scale-[1.02] md:scale-105'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5">
                                                Most Popular
                                            </div>
                                        )}
                                        {isCurrent && (
                                            <div className="bg-green-500 text-white text-[10px] font-black uppercase tracking-widest text-center py-1.5">
                                                Your Current Plan
                                            </div>
                                        )}

                                        <div className="p-6 flex-1 flex flex-col">
                                            {/* Plan header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                    plan.id === 'premium' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                                    plan.id === 'basic'   ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' :
                                                    'bg-gray-100 dark:bg-gray-700 text-gray-600'
                                                }`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{plan.name}</h3>
                                                    <p className="text-xs text-gray-400">{plan.period}</p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="mb-6">
                                                <div className="flex items-end gap-1">
                                                    <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.priceDisplay}</span>
                                                    {plan.price > 0 && <span className="text-sm text-gray-400 mb-1">/month</span>}
                                                </div>
                                                {plan.price > 0 && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Billed monthly · Cancel anytime
                                                    </p>
                                                )}
                                            </div>

                                            {/* Key limits */}
                                            <div className="grid grid-cols-2 gap-2 mb-5 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                                                <div>
                                                    <p className="text-lg font-black text-primary-600">
                                                        {plan.limits?.maxListings === 9999 ? '∞' : plan.limits?.maxListings}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Listings</p>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-yellow-500">
                                                        {plan.limits?.featuredListings === 9999 ? '∞' : plan.limits?.featuredListings}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Featured</p>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-2.5 mb-6 flex-1">
                                                {plan.features.map((f, fi) => (
                                                    <li key={fi} className="flex items-start gap-2.5">
                                                        <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">{f}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA */}
                                            <button
                                                onClick={() => handleSubscribe(plan)}
                                                disabled={isPaying || isCurrent || plan.id === 'free'}
                                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 min-h-0
                                                    ${isCurrent || plan.id === 'free'
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : plan.popular
                                                            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 hover:-translate-y-0.5'
                                                            : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 hover:-translate-y-0.5'
                                                    } disabled:translate-y-0`}
                                            >
                                                {isPaying ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Processing…
                                                    </span>
                                                ) : isCurrent ? 'Current Plan'
                                                  : plan.id === 'free' ? 'Always Free'
                                                  : `Upgrade to ${plan.name}`}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* FAQ */}
                    <div className="max-w-2xl mx-auto mt-14 sm:mt-20">
                        <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
                        {[
                            { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from the billing page. Your access continues until the end of the billing period.' },
                            { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.' },
                            { q: 'What happens when I hit my listing limit?', a: 'You will see a clear error message. Upgrade your plan to add more listings — no data is deleted.' },
                            { q: 'Is there a free trial?', a: 'The Free plan gives you 3 listings at no charge, forever. Upgrade when you need more.' },
                        ].map((item, i) => (
                            <div key={i} className="border-b border-gray-100 dark:border-gray-800 py-4">
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1.5">{item.q}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PricingPage;
