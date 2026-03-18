import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BillingPage = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [payments, setPayments] = useState([]);
    const [limits, setLimits] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, billRes] = await Promise.all([
                    api.get('/subscriptions/current'),
                    api.get('/subscriptions/billing'),
                ]);
                setSubscription(subRes.data.subscription);
                setLimits(subRes.data.limits);
                setPayments(billRes.data.payments || []);
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchData();
    }, []);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric',
    });

    const formatPrice = (n) => '₹' + (n / 100).toLocaleString('en-IN');

    if (loading) return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Billing & Subscription</h1>

                {/* Current Plan */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize mt-1">
                                {subscription?.plan || 'Free'}
                            </h2>
                            {subscription && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Renews {formatDate(subscription.currentPeriodEnd)}
                                </p>
                            )}
                        </div>
                        <Link
                            to="/pricing"
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors text-sm"
                        >
                            Change Plan <FiArrowRight />
                        </Link>
                    </div>

                    {/* Usage */}
                    {limits && (
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-xs text-gray-500">Max Listings</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {limits.maxListings >= 999 ? 'Unlimited' : limits.maxListings}
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-xs text-gray-500">Featured Listings</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{limits.featuredListings}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-xs text-gray-500">Analytics</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{limits.analytics ? '✅ Enabled' : '❌ Disabled'}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <p className="text-xs text-gray-500">AI Insights</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{limits.aiInsights ? '✅ Enabled' : '❌ Disabled'}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment History */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiCreditCard />
                            Payment History
                        </h2>
                    </div>

                    {payments.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 text-sm">No payment history</div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {payments.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-6 py-4 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                            {p.plan} Plan
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDate(p.paidAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                                            {formatPrice(p.amount)}
                                        </p>
                                        <span className={`text-xs font-semibold ${
                                            p.status === 'captured' ? 'text-emerald-500' : 'text-red-500'
                                        }`}>
                                            {p.status === 'captured' ? '✓ Paid' : p.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
