import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiPlus, FiEdit3, FiTrash2, FiEye, FiSearch, 
    FiFilter, FiHome, FiTrendingUp, FiMessageCircle, FiStar,
    FiChevronRight, FiMapPin, FiMaximize2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/common/StatsCard';
import EmptyState from '../components/common/EmptyState';
import Skeletons from '../components/common/Skeletons';
const { SkeletonDashboard } = Skeletons;
import PropertyQuickView from '../components/properties/PropertyQuickView.jsx';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageHelper';

import Inquiries from '../components/admin/Inquiries';

const AgentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('properties');
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({
        totalListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        avgRating: 0,
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const { data } = await api.get('/properties', {
                params: { createdBy: user?._id, limit: 100, status: 'all' },
            });

            const props = data.properties || [];
            setProperties(props);

            setStats({
                totalListings: data.total || props.length,
                totalViews: props.reduce((sum, p) => sum + (p.views || 0), 0),
                totalInquiries: props.reduce((sum, p) => sum + (p.inquiryCount || 0), 0),
                avgRating: props.length
                    ? (props.reduce((sum, p) => sum + (p.avgRating || 0), 0) / props.length).toFixed(1)
                    : 0,
            });
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
            const matchesType = filterType === 'all' || p.type === filterType;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [properties, searchTerm, filterStatus, filterType]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;
        try {
            await api.delete(`/properties/${id}`);
            toast.success('Property deleted');
            setProperties(prev => prev.filter(p => p._id !== id));
        } catch {
            toast.error('Failed to delete property');
        }
    };

    const handleQuickView = (property) => {
        setSelectedProperty(property);
        setIsQuickViewOpen(true);
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <SkeletonDashboard />
        </div>
    );

    const statusColors = {
        available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
        sold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        rented: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };

    const statConfig = [
        { id: 'properties', label: 'Total Listings', value: stats.totalListings, icon: <FiHome />, color: 'bg-blue-500', trend: '+2%' },
        { id: 'views', label: 'Total Views', value: stats.totalViews, icon: <FiEye />, color: 'bg-purple-500', trend: '+15%' },
        { id: 'inquiries', label: 'Inquiries', value: stats.totalInquiries, icon: <FiMessageCircle />, color: 'bg-orange-500', trend: '+8%' },
        { id: 'rating', label: 'Avg Rating', value: stats.avgRating, icon: <FiStar />, color: 'bg-emerald-500', trend: 'New' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Agent Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                            Welcome back, <span className="font-semibold text-gray-900 dark:text-gray-200">{user?.name}</span> 👋
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/agent/add-property"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-95"
                        >
                            <FiPlus className="w-5 h-5" />
                            Add Property
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statConfig.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => (stat.id === 'inquiries' || stat.id === 'properties') && setActiveTab(stat.id)}
                            className={`bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                activeTab === stat.id ? 'ring-2 ring-primary-500 border-transparent' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                    stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('properties')}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                            activeTab === 'properties' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        My Properties
                        {activeTab === 'properties' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('inquiries')}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                            activeTab === 'inquiries' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Property Inquiries
                        {activeTab === 'inquiries' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'properties' ? (
                        <motion.div
                            key="properties"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                        >
                            {/* Toolbar */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    My Properties
                                    <span className="text-xs font-normal bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-500">
                                        {filteredProperties.length}
                                    </span>
                                </h2>
                                
                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <div className="relative w-full sm:w-64">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search properties..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <FiFilter className="text-gray-400 hidden sm:block" />
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm py-2 focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="available">Available</option>
                                            <option value="sold">Sold</option>
                                            <option value="rented">Rented</option>
                                            <option value="pending">Pending</option>
                                            <option value="draft">Draft</option>
                                        </select>
                                        <select
                                            value={filterType}
                                            onChange={(e) => setFilterType(e.target.value)}
                                            className="w-full sm:w-auto bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm py-2 focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="all">All Types</option>
                                            <option value="buy">For Sale</option>
                                            <option value="rent">For Rent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {filteredProperties.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                        🏗️
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No properties found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                                        {searchTerm || filterStatus !== 'all' 
                                            ? "We couldn't find any properties matching your current filters."
                                            : "You haven't added any properties yet. Start your journey by listing one."}
                                    </p>
                                    {!(searchTerm || filterStatus !== 'all') && (
                                        <button
                                            onClick={() => navigate('/agent/add-property')}
                                            className="mt-6 px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl"
                                        >
                                            Add Your First Property
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Property Details</th>
                                                <th className="px-6 py-4 hidden md:table-cell">Pricing</th>
                                                <th className="px-6 py-4 hidden lg:table-cell">Specs</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {filteredProperties.map((property, i) => (
                                                <motion.tr
                                                    key={property._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                                                {property.images?.[0]?.url ? (
                                                                    <img
                                                                        src={getImageUrl(property.images[0].url)}
                                                                        alt={property.title}
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                        <FiHome className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-gray-900 dark:text-white truncate max-w-[240px]">
                                                                    {property.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                    <FiMapPin className="text-primary-500" />
                                                                    {property.location?.city}, {property.location?.state}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            ₹{property.price?.toLocaleString('en-IN')}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">
                                                            For {property.type}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden lg:table-cell">
                                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                                            <span className="flex items-center gap-1">
                                                                <FiMaximize2 className="text-xs" />
                                                                {property.area?.value} {property.area?.unit}
                                                            </span>
                                                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                            <span className="capitalize">{property.propertyType}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            statusColors[property.status] || statusColors.draft
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                                property.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-current'
                                                            }`} />
                                                            {property.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleQuickView(property)}
                                                                className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-500 hover:text-primary-500 rounded-xl shadow-sm transition-all"
                                                                title="Quick View"
                                                            >
                                                                <FiEye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/agent/edit-property/${property._id}`)}
                                                                className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 rounded-xl shadow-sm transition-all"
                                                                title="Edit"
                                                            >
                                                                <FiEdit3 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(property._id)}
                                                                className="p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-red-500 hover:text-red-500 rounded-xl shadow-sm transition-all"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        {/* Mobile chevron */}
                                                        <FiChevronRight className="w-5 h-5 text-gray-400 md:hidden ml-auto" />
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="inquiries"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <Inquiries />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick View Modal */}
            <PropertyQuickView
                property={selectedProperty}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </div>
    );
};

export default AgentDashboard;

