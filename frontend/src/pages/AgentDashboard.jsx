import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiEdit3, FiTrash2, FiEye, FiSearch,
    FiHome, FiMessageCircle, FiStar, FiMapPin,
    FiMaximize2, FiFilter, FiRefreshCw, FiTrendingUp,
    FiAlertCircle, FiCheckCircle, FiChevronRight, FiBarChart2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import SEO from '../components/common/SEO';
import PropertyDetails from '../components/properties/PropertyDetails';

/* ── helpers ────────────────────────────────────────────────────────────── */
const fmtPrice = (n) => {
    if (!n) return '—';
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(1) + 'Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(1) + 'L';
    return '₹' + n.toLocaleString('en-IN');
};

const STATUS = {
    available: { label: 'Available', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
    sold:      { label: 'Sold',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    rented:    { label: 'Rented',    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
    pending:   { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
    draft:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
};

/* ── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, sub, delay }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-md`}>
                {icon}
            </div>
        </div>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{value}</p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
);

/* ── Property Card ──────────────────────────────────────────────────────── */
const PropCard = ({ property, onEdit, onDelete, onView }) => {
    const s = STATUS[property.status] || STATUS.draft;
    return (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            {/* Image */}
            <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {property.images?.[0]?.url
                    ? <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiHome className="w-10 h-10" /></div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Status badge */}
                <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-lg ${s.cls}`}>{s.label}</span>
                {/* Featured badge */}
                {property.featured && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-lg bg-yellow-400 text-yellow-900">★ Featured</span>
                )}
                {/* Price overlay */}
                <div className="absolute bottom-3 left-3">
                    <span className="text-base font-black text-white drop-shadow">{fmtPrice(property.price)}</span>
                    {property.type === 'rent' && <span className="text-xs text-white/70 ml-1">/mo</span>}
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">{property.title}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                    <FiMapPin className="w-3 h-3 flex-shrink-0" />
                    {property.location?.address}, {property.location?.city}
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                    {[
                        { label: 'Views',     val: property.views || 0 },
                        { label: 'Inquiries', val: property.inquiryCount || 0 },
                        { label: 'Rating',    val: property.avgRating ? property.avgRating.toFixed(1) : '—' },
                    ].map(item => (
                        <div key={item.label} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-2 text-center">
                            <p className="text-sm font-black text-gray-900 dark:text-white">{item.val}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => onView(property)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-0">
                        <FiEye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => onEdit(property._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-xl hover:bg-primary-100 transition-colors min-h-0">
                        <FiEdit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => onDelete(property._id)}
                        className="p-2 text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors min-h-0">
                        <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ── Main ───────────────────────────────────────────────────────────────── */
const AgentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [properties,  setProperties]  = useState([]);
    const [stats,       setStats]       = useState({ totalListings: 0, totalViews: 0, totalInquiries: 0, avgRating: '0.0' });
    const [subscription,setSubscription]= useState(null);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState('');
    const [filterStatus,setFilterStatus]= useState('all');
    const [filterType,  setFilterType]  = useState('all');
    const [activeTab,   setActiveTab]   = useState('listings');
    const [preview,     setPreview]     = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [propRes, subRes] = await Promise.allSettled([
                api.get('/properties', { params: { createdBy: user?._id, limit: 50, page: 1, status: 'all' } }),
                api.get('/subscriptions/current'),
            ]);

            const props = propRes.status === 'fulfilled' ? (propRes.value.data.properties || []) : [];
            setProperties(props);
            setStats({
                totalListings:  propRes.status === 'fulfilled' ? (propRes.value.data.total || props.length) : 0,
                totalViews:     props.reduce((s, p) => s + (p.views || 0), 0),
                totalInquiries: props.reduce((s, p) => s + (p.inquiryCount || 0), 0),
                avgRating: props.length ? (props.reduce((s, p) => s + (p.avgRating || 0), 0) / props.length).toFixed(1) : '0.0',
            });
            if (subRes.status === 'fulfilled') setSubscription(subRes.value.data);
        } catch { toast.error('Failed to load dashboard'); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        document.body.style.overflow = preview ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [preview]);

    const filtered = useMemo(() => properties.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.city?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        const matchType   = filterType   === 'all' || p.type === filterType;
        return matchSearch && matchStatus && matchType;
    }), [properties, search, filterStatus, filterType]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this property? This cannot be undone.')) return;
        try {
            await api.delete(`/properties/${id}`);
            toast.success('Property deleted');
            setProperties(prev => prev.filter(p => p._id !== id));
        } catch { toast.error('Failed to delete'); }
    };

    const planColors = { free: 'text-gray-500', basic: 'text-primary-600', premium: 'text-purple-600' };

    return (
        <>
            <SEO title="Agent Dashboard | EstateElite" />
            <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                Agent Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Welcome back, <span className="font-semibold text-primary-600">{user?.name}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button onClick={fetchData} className="btn-secondary text-sm flex items-center gap-2">
                                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <Link to="/agent/add-property" className="btn-primary text-sm flex items-center gap-2">
                                <FiPlus className="w-4 h-4" /> New Listing
                            </Link>
                        </div>
                    </div>

                    {/* Subscription banner */}
                    {subscription && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                subscription.currentPlan === 'free'
                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                                    : 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                            }`}>
                            <div className="flex items-center gap-3">
                                {subscription.currentPlan === 'free'
                                    ? <FiAlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                    : <FiCheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                }
                                <div>
                                    <p className={`text-sm font-bold ${subscription.currentPlan === 'free' ? 'text-amber-800 dark:text-amber-300' : 'text-primary-800 dark:text-primary-300'}`}>
                                        Plan: <span className={`capitalize font-black ${planColors[subscription.currentPlan]}`}>{subscription.currentPlan}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {subscription.limits?.maxListings === 9999 ? 'Unlimited listings' : `${properties.length} / ${subscription.limits?.maxListings} listings used`}
                                        {subscription.currentPlan !== 'free' && subscription.subscription?.currentPeriodEnd &&
                                            ` · Renews ${new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString('en-IN')}`
                                        }
                                    </p>
                                </div>
                            </div>
                            {subscription.currentPlan === 'free' && (
                                <Link to="/pricing" className="btn-primary text-xs self-start sm:self-auto flex-shrink-0">
                                    Upgrade Plan →
                                </Link>
                            )}
                        </motion.div>
                    )}

                    {/* Stats */}
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                            {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                            <StatCard delay={0}    icon={<FiHome className="w-5 h-5" />}          label="Total Listings"  value={stats.totalListings}  color="bg-gradient-to-br from-blue-500 to-blue-600"    sub={`${filtered.length} showing`} />
                            <StatCard delay={0.07} icon={<FiEye className="w-5 h-5" />}           label="Total Views"     value={stats.totalViews}     color="bg-gradient-to-br from-purple-500 to-violet-600" />
                            <StatCard delay={0.14} icon={<FiMessageCircle className="w-5 h-5" />} label="Inquiries"       value={stats.totalInquiries} color="bg-gradient-to-br from-orange-500 to-amber-600"  />
                            <StatCard delay={0.21} icon={<FiStar className="w-5 h-5" />}          label="Avg Rating"      value={stats.avgRating}      color="bg-gradient-to-br from-emerald-500 to-green-600" />
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1 mb-6 w-fit">
                        {[
                            { id: 'listings',  label: 'My Listings',  icon: FiHome },
                            { id: 'inquiries', label: 'Inquiries',    icon: FiMessageCircle },
                            { id: 'analytics', label: 'Performance',  icon: FiBarChart2 },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-0 ${
                                    activeTab === tab.id
                                        ? 'bg-primary-600 text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}>
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── Listings Tab ──────────────────────────────────── */}
                    {activeTab === 'listings' && (
                        <div>
                            {/* Filters */}
                            <div className="flex flex-wrap gap-3 mb-5">
                                <div className="relative flex-1 min-w-[180px]">
                                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input value={search} onChange={e => setSearch(e.target.value)}
                                        placeholder="Search listings…"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white placeholder-gray-400 min-h-0" />
                                </div>
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                    className="py-2.5 px-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white min-h-0">
                                    <option value="all">All Status</option>
                                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                                    className="py-2.5 px-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white min-h-0">
                                    <option value="all">All Types</option>
                                    <option value="buy">For Sale</option>
                                    <option value="rent">For Rent</option>
                                </select>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {[1,2,3].map(i => <div key={i} className="h-80 skeleton rounded-2xl" />)}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <FiHome className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                        {search || filterStatus !== 'all' ? 'No matching properties' : 'No listings yet'}
                                    </p>
                                    <p className="text-sm text-gray-400 mb-4">
                                        {search || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Create your first property listing'}
                                    </p>
                                    {!search && filterStatus === 'all' && (
                                        <Link to="/agent/add-property" className="btn-primary text-sm inline-flex items-center gap-2">
                                            <FiPlus className="w-4 h-4" /> Add First Listing
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-400 mb-3">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                        <AnimatePresence mode="popLayout">
                                            {filtered.map(p => (
                                                <PropCard
                                                    key={p._id}
                                                    property={p}
                                                    onEdit={id => navigate(`/agent/edit-property/${id}`)}
                                                    onDelete={handleDelete}
                                                    onView={setPreview}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Inquiries Tab ─────────────────────────────────── */}
                    {activeTab === 'inquiries' && (
                        <InquiriesTab properties={properties} />
                    )}

                    {/* ── Analytics Tab ─────────────────────────────────── */}
                    {activeTab === 'analytics' && (
                        <AnalyticsTab properties={properties} stats={stats} />
                    )}
                </div>
            </div>

            {/* Preview modal */}
            <AnimatePresence>
                {preview && (
                    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setPreview(null)}>
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                            className="w-full sm:max-w-5xl h-[92vh] sm:h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl no-scrollbar bg-white dark:bg-gray-900"
                            onClick={e => e.stopPropagation()}>
                            <PropertyDetails property={preview} onClose={() => setPreview(null)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

/* ── Inline Inquiries Tab ────────────────────────────────────────────────── */
const InquiriesTab = ({ properties }) => {
    const [inquiries, setInquiries] = useState([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        api.get('/inquiries').then(({ data }) => {
            setInquiries(data.inquiries || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="grid grid-cols-1 gap-4">{[1,2,3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}</div>;

    if (inquiries.length === 0) return (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <FiMessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-500">No inquiries yet</p>
        </div>
    );

    return (
        <div className="space-y-3">
            {inquiries.map(inq => (
                <div key={inq._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                        {inq.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{inq.name}</p>
                        <p className="text-xs text-gray-400 truncate">Re: {inq.property?.title || '—'}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{inq.message}</p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${
                            inq.status === 'new' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            inq.status === 'contacted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>{inq.status}</span>
                        <a href={`tel:${inq.phone}`} className="text-xs text-primary-600 font-semibold">{inq.phone}</a>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ── Inline Analytics Tab ────────────────────────────────────────────────── */
const AnalyticsTab = ({ properties, stats }) => {
    const topByViews     = [...properties].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    const topByInquiries = [...properties].sort((a, b) => (b.inquiryCount || 0) - (a.inquiryCount || 0)).slice(0, 5);
    const maxViews       = topByViews[0]?.views || 1;
    const maxInq         = topByInquiries[0]?.inquiryCount || 1;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Top by Views</h3>
                <div className="space-y-3">
                    {topByViews.length === 0 ? <p className="text-sm text-gray-400">No data yet</p> : topByViews.map(p => (
                        <div key={p._id}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{p.title}</span>
                                <span className="font-bold text-primary-600">{p.views || 0}</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full transition-all duration-700"
                                    style={{ width: `${((p.views || 0) / maxViews) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Top by Inquiries</h3>
                <div className="space-y-3">
                    {topByInquiries.length === 0 ? <p className="text-sm text-gray-400">No data yet</p> : topByInquiries.map(p => (
                        <div key={p._id}>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{p.title}</span>
                                <span className="font-bold text-orange-600">{p.inquiryCount || 0}</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full transition-all duration-700"
                                    style={{ width: `${((p.inquiryCount || 0) / maxInq) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
