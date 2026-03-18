import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiTrendingUp, FiHome, FiMessageCircle, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatsCard from '../components/common/StatsCard';
import EmptyState from '../components/common/EmptyState';
import { SkeletonDashboard } from '../components/common/Skeletons';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({
        totalListings: 0,
        totalViews: 0,
        totalInquiries: 0,
        avgRating: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const { data } = await api.get('/properties', {
                params: { createdBy: user?._id, limit: 50 },
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Agent Dashboard
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome back, {user?.name} 👋
                        </p>
                    </div>
                    <Link
                        to="/agent/add-property"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add Property
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard icon="🏠" label="Total Listings" value={stats.totalListings} color="primary" />
                    <StatsCard icon="👁️" label="Total Views" value={stats.totalViews} color="blue" />
                    <StatsCard icon="📩" label="Inquiries" value={stats.totalInquiries} color="orange" />
                    <StatsCard icon="⭐" label="Avg Rating" value={stats.avgRating} color="green" />
                </div>

                {/* Listings Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Your Properties
                        </h2>
                        <span className="text-sm text-gray-500">{properties.length} listings</span>
                    </div>

                    {properties.length === 0 ? (
                        <EmptyState
                            icon="🏗️"
                            title="No properties yet"
                            message="Start listing your properties to reach thousands of potential buyers and renters."
                            action={() => navigate('/agent/add-property')}
                            actionLabel="Add Your First Property"
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-3">Property</th>
                                        <th className="px-6 py-3 hidden md:table-cell">Price</th>
                                        <th className="px-6 py-3 hidden lg:table-cell">Type</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 hidden md:table-cell">Views</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {properties.map((property, i) => (
                                        <motion.tr
                                            key={property._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                                        {property.images?.[0]?.url ? (
                                                            <img
                                                                src={property.images[0].url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                <FiHome />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                                                            {property.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {property.location?.city}, {property.location?.state}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-sm font-semibold text-gray-900 dark:text-white">
                                                ₹{property.price?.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                <span className="text-xs font-medium text-gray-500 capitalize">
                                                    {property.propertyType} • {property.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                                                    statusColors[property.status] || statusColors.draft
                                                }`}>
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-sm text-gray-500">
                                                {property.views || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        to={`/property/${property._id}`}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                                                        title="View"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => navigate(`/agent/edit-property/${property._id}`)}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-500 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FiEdit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(property._id)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
