import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome, FiUsers, FiMessageSquare, FiClock,
    FiTrendingUp, FiDollarSign, FiBriefcase, FiCreditCard,
    FiArrowUpRight, FiMapPin, FiEye, FiStar
} from 'react-icons/fi';

const fmt = (n) => {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000)     return (n / 1000).toFixed(1) + 'K';
    return String(n ?? 0);
};

const Card = ({ delay, children, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.3 }}
        className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${className}`}
    >
        {children}
    </motion.div>
);

const Dashboard = ({ stats, onRefresh }) => {
    if (!stats) return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
            </div>
        </div>
    );

    const s = stats.stats || {};

    const topStats = [
        { label: 'Total Properties', value: fmt(s.totalProperties), icon: FiHome,         color: 'from-blue-500 to-blue-600',    sub: `${s.newPropertiesThisMonth || 0} this month`,  subIcon: FiArrowUpRight, subColor: 'text-blue-500' },
        { label: 'Total Users',      value: fmt(s.totalUsers),      icon: FiUsers,         color: 'from-green-500 to-emerald-600',  sub: `${s.newUsersThisWeek || 0} this week`,        subIcon: FiArrowUpRight, subColor: 'text-green-500' },
        { label: 'Agents',           value: fmt(s.totalAgents),     icon: FiBriefcase,     color: 'from-purple-500 to-violet-600',  sub: `${s.activeSubscriptions || 0} paid plans`,    subIcon: FiCreditCard,   subColor: 'text-purple-500' },
        { label: 'Inquiries',        value: fmt(s.totalInquiries),  icon: FiMessageSquare, color: 'from-orange-500 to-amber-600',   sub: `${s.newInquiries || 0} new`,                  subIcon: FiClock,        subColor: 'text-orange-500' },
    ];

    const propStats = [
        { label: 'Available', value: s.availableProperties || 0, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: FiHome },
        { label: 'Sold',      value: s.soldProperties || 0,      color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',       icon: FiDollarSign },
        { label: 'Rented',    value: s.rentedProperties || 0,    color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/20',   icon: FiTrendingUp },
    ];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                {onRefresh && (
                    <button onClick={onRefresh} className="btn-secondary text-sm self-start sm:self-auto">
                        Refresh
                    </button>
                )}
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {topStats.map((stat, i) => (
                    <Card key={i} delay={i * 0.08}>
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                                    <stat.icon className="text-white w-5 h-5" />
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{stat.value}</p>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${stat.subColor}`}>
                                <stat.subIcon className="w-3 h-3" />
                                {stat.sub}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Property status row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {propStats.map((p, i) => (
                    <Card key={i} delay={0.3 + i * 0.07}>
                        <div className={`p-4 flex items-center gap-4 ${p.bg} rounded-2xl`}>
                            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm ${p.color}`}>
                                <p.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className={`text-2xl font-black ${p.color}`}>{p.value}</p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{p.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent activity grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Recent Properties */}
                <Card delay={0.5}>
                    <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Listings</h2>
                            <Link to="/admin/properties" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                View all <FiArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {(stats.recentProperties || []).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">No properties yet</p>
                            ) : (stats.recentProperties || []).map((p) => (
                                <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                        {p.images?.[0]?.url
                                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                                            : <FiHome className="w-5 h-5 m-3 text-gray-400" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.title}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <FiMapPin className="w-3 h-3 flex-shrink-0" />
                                            {p.location?.city}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-primary-600">{fmt(p.price)}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                            p.status === 'available' ? 'bg-green-100 text-green-700' :
                                            p.status === 'sold'      ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>{p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Recent Inquiries */}
                <Card delay={0.6}>
                    <div className="p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Inquiries</h2>
                            <Link to="/admin/inquiries" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                View all <FiArrowUpRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {(stats.recentInquiries || []).length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-6">No inquiries yet</p>
                            ) : (stats.recentInquiries || []).map((inq) => (
                                <div key={inq._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                                        {inq.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{inq.name}</p>
                                        <p className="text-xs text-gray-400 truncate">Re: {inq.property?.title || 'Unknown property'}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase flex-shrink-0 ${
                                        inq.status === 'new'       ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        inq.status === 'contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>{inq.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
