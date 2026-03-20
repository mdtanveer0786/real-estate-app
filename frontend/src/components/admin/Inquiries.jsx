import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMail, FiPhone, FiCalendar,
    FiCheck, FiX, FiClock, FiLoader, FiInbox,
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ─── Status helpers ─────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    new:       { label: 'New',       icon: FiClock, iconColor: 'text-yellow-500 dark:text-yellow-400', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
    contacted: { label: 'Contacted', icon: FiCheck, iconColor: 'text-blue-500 dark:text-blue-400',   badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'   },
    closed:    { label: 'Closed',    icon: FiX,     iconColor: 'text-gray-400 dark:text-gray-500',   badge: 'bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300'   },
};

/* ─── Loading skeleton ───────────────────────────────────────────────────── */
const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56" />
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>
        ))}
    </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [filter, setFilter]       = useState('all');
    const [updating, setUpdating]   = useState(null); // id of row being updated

    const fetchInquiries = useCallback(async () => {
        try {
            const { data } = await api.get('/inquiries');
            // Controller returns { success, inquiries } — handle both shapes for safety
            setInquiries(data.inquiries ?? data);
        } catch {
            toast.error('Failed to load inquiries. Please refresh.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

    const updateStatus = async (id, status) => {
        setUpdating(id);
        // Optimistic update
        setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, status } : inq));
        try {
            await api.put(`/inquiries/${id}`, { status });
            toast.success(`Status updated to "${STATUS_CONFIG[status]?.label ?? status}"`);
        } catch {
            toast.error('Failed to update status. Please try again.');
            // Rollback on failure
            fetchInquiries();
        } finally {
            setUpdating(null);
        }
    };

    const filtered   = filter === 'all' ? inquiries : inquiries.filter(i => i.status === filter);
    const countOf    = (s) => inquiries.filter(i => i.status === s).length;

    const FILTER_TABS = [
        { key: 'all',       label: 'All',       count: inquiries.length },
        { key: 'new',       label: 'New',        count: countOf('new') },
        { key: 'contacted', label: 'Contacted',  count: countOf('contacted') },
        { key: 'closed',    label: 'Closed',     count: countOf('closed') },
    ];

    return (
        <div>
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inquiry Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Review and respond to property inquiries
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-semibold rounded-lg">
                    <FiInbox size={14} />
                    {countOf('new')} new
                </span>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total',     value: inquiries.length,   color: 'text-primary-600 dark:text-primary-400' },
                    { label: 'New',       value: countOf('new'),      color: 'text-yellow-600 dark:text-yellow-400'   },
                    { label: 'Contacted', value: countOf('contacted'), color: 'text-blue-600 dark:text-blue-400'      },
                    { label: 'Closed',    value: countOf('closed'),   color: 'text-gray-500 dark:text-gray-400'       },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center shadow-sm">
                        <p className={`text-2xl font-bold ${color}`}>{loading ? '–' : value}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
                {FILTER_TABS.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${
                            filter === key
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <span>{label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                            filter === key
                                ? 'bg-white/25 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <LoadingSkeleton />
            ) : (
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
                        >
                            <FiInbox className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No inquiries found</p>
                            {filter !== 'all' && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                >
                                    Show all inquiries
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((inquiry) => {
                                const cfg = STATUS_CONFIG[inquiry.status] ?? STATUS_CONFIG.new;
                                const Icon = cfg.icon;
                                const isUpdating = updating === inquiry._id;

                                return (
                                    <motion.div
                                        key={inquiry._id}
                                        layout
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-6 hover:shadow-md transition-shadow ${isUpdating ? 'opacity-70' : ''}`}
                                    >
                                        {/* Top row */}
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                                                        {inquiry.name}
                                                    </h3>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${cfg.badge}`}>
                                                        <Icon size={10} />
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    Property: <span className="font-medium text-gray-700 dark:text-gray-200">{inquiry.property?.title ?? 'N/A'}</span>
                                                </p>
                                            </div>

                                            {/* Status selector */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isUpdating && <FiLoader className="animate-spin text-primary-500" size={14} />}
                                                <select
                                                    value={inquiry.status}
                                                    onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                                                    disabled={isUpdating}
                                                    aria-label="Update inquiry status"
                                                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 cursor-pointer transition-colors"
                                                >
                                                    <option value="new">New</option>
                                                    <option value="contacted">Contacted</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDelete(inquiry._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete Inquiry"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Contact details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                                            <a
                                                href={`mailto:${inquiry.email}`}
                                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group truncate"
                                            >
                                                <span className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                                    <FiMail size={13} className="text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                                </span>
                                                <span className="truncate">{inquiry.email}</span>
                                            </a>
                                            <a
                                                href={`tel:${inquiry.phone}`}
                                                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                                            >
                                                <span className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                                                    <FiPhone size={13} className="text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                                                </span>
                                                {inquiry.phone}
                                            </a>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                    <FiCalendar size={13} className="text-gray-500 dark:text-gray-400" />
                                                </span>
                                                {new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </div>
                                        </div>

                                        {/* Message bubble */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/50 rounded-lg p-4">
                                            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                                                {inquiry.message}
                                            </p>
                                        </div>

                                        {/* Registered user tag */}
                                        {inquiry.user && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                                <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded font-medium">
                                                    Registered User
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    {inquiry.user.name} · {inquiry.user.email}
                                                </span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

export default Inquiries;
