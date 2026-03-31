import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCreditCard, FiPackage, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';

const fmtPrice = (p) => '₹' + (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const BillingPage = () => {
    const { user } = useAuth();
    const [sub,      setSub]      = useState(null);
    const [limits,   setLimits]   = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [subRes, billRes] = await Promise.all([
                    api.get('/subscriptions/current'),
                    api.get('/subscriptions/billing'),
                ]);
                setSub(subRes.data.subscription);
                setLimits(subRes.data.limits);
                setPayments(billRes.data.payments || []);
            } catch { /* ignore */ } finally { setLoading(false); }
        };
        load();
    }, []);

    const handleCancel = async () => {
        if (!window.confirm('Cancel your subscription? Access continues until the billing period ends.')) return;
        setCancelling(true);
        try {
            await api.post('/subscriptions/cancel');
            toast.success('Subscription cancelled. Access continues until period end.');
            const { data } = await api.get('/subscriptions/current');
            setSub(data.subscription);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to cancel');
        } finally { setCancelling(false); }
    };

    const planColors = {
        free: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
        basic: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
        premium: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const plan = sub?.plan || user?.subscription?.plan || 'free';

    return (
        <>
            <SEO title="Billing | EstateElite" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-10">
                <div className="container-custom max-w-3xl">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-6">Billing & Subscription</h1>

                    {/* Current plan card */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <FiPackage className="w-4 h-4 text-primary-600" />
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Current Plan</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-sm font-black capitalize ${planColors[plan] || planColors.free}`}>
                                        {plan}
                                    </span>
                                    {sub?.status && (
                                        <span className={`text-xs font-semibold ${
                                            sub.status === 'active' ? 'text-green-500' : 'text-amber-500'
                                        }`}>
                                            {sub.status === 'active'
                                                ? <><FiCheckCircle className="inline mr-1" />Active</>
                                                : <><FiAlertCircle className="inline mr-1" />{sub.status}</>
                                            }
                                        </span>
                                    )}
                                </div>
                                {sub?.currentPeriodEnd && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        {sub.status === 'cancelled' ? 'Access until: ' : 'Renews: '}
                                        <strong>{fmtDate(sub.currentPeriodEnd)}</strong>
                                    </p>
                                )}
                            </div>
                            {plan !== 'free' && sub?.status === 'active' && (
                                <button onClick={handleCancel} disabled={cancelling}
                                    className="text-xs text-red-500 hover:text-red-600 font-semibold border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 min-h-0">
                                    {cancelling ? 'Cancelling…' : 'Cancel Plan'}
                                </button>
                            )}
                        </div>

                        {/* Limits */}
                        {limits && (
                            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Max Listings',   value: limits.maxListings === 9999 ? 'Unlimited' : limits.maxListings },
                                    { label: 'Featured Slots', value: limits.featuredListings === 9999 ? 'Unlimited' : limits.featuredListings },
                                    { label: 'Analytics',      value: limits.analytics ? '✓' : '✗' },
                                    { label: 'AI Insights',    value: limits.aiInsights ? '✓' : '✗' },
                                ].map(item => (
                                    <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                        <p className={`text-base font-black ${item.value === '✓' ? 'text-green-500' : item.value === '✗' ? 'text-gray-300 dark:text-gray-600' : 'text-primary-600'}`}>
                                            {item.value}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {plan === 'free' && (
                            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-between gap-3">
                                <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                                    Unlock more listings and premium features
                                </p>
                                <Link to="/pricing"
                                    className="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors min-h-0 flex-shrink-0">
                                    Upgrade
                                </Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Payment history */}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiCreditCard className="w-4 h-4" /> Payment History
                            </h2>
                        </div>

                        {payments.length === 0 ? (
                            <div className="py-12 text-center">
                                <FiCreditCard className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No payments yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                {payments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between px-6 py-3.5 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                p.status === 'captured' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                                            }`}>
                                                {p.status === 'captured'
                                                    ? <FiCheckCircle className="w-3.5 h-3.5 text-green-500" />
                                                    : <FiXCircle    className="w-3.5 h-3.5 text-red-500" />
                                                }
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{p.plan} Plan</p>
                                                <p className="text-xs text-gray-400">{fmtDate(p.paidAt)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{fmtPrice(p.amount)}</p>
                                            <p className={`text-[10px] font-semibold uppercase ${
                                                p.status === 'captured' ? 'text-green-500' : 'text-red-500'
                                            }`}>{p.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default BillingPage;
