import React, { useState, useEffect } from 'react';
import { 
    FiBarChart2, FiTrendingUp, FiUsers, FiHome, 
    FiMessageSquare, FiMapPin, FiPieChart 
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [propertyStats, setPropertyStats] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [inquiryStats, setInquiryStats] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const [propRes, userRes, inqRes] = await Promise.all([
                    api.get('/analytics/properties'),
                    api.get('/analytics/users'),
                    api.get('/analytics/inquiries')
                ]);

                setPropertyStats(propRes.data);
                setUserStats(userRes.data);
                setInquiryStats(inqRes.data);
            } catch (error) {
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h1 className="text-2xl font-bold">Platform Analytics</h1>
                <p className="text-sm text-gray-500">Comprehensive overview of platform performance</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <h3 className="text-2xl font-bold">{userStats?.totalUsers || 0}</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Regular Users</span>
                            <span className="font-bold">{userStats?.userCount || 0}</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-blue-500 h-full rounded-full" 
                                style={{ width: `${(userStats?.userCount / userStats?.totalUsers) * 100 || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
                            <FiHome size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Properties</p>
                            <h3 className="text-2xl font-bold">
                                {propertyStats?.propertiesByStatus?.reduce((acc, curr) => acc + curr.count, 0) || 0}
                            </h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Available</span>
                            <span className="font-bold">
                                {propertyStats?.propertiesByStatus?.find(s => s._id === 'available')?.count || 0}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-green-500 h-full rounded-full" 
                                style={{ width: `${(propertyStats?.propertiesByStatus?.find(s => s._id === 'available')?.count / propertyStats?.propertiesByStatus?.reduce((acc, curr) => acc + curr.count, 1)) * 100 || 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                            <FiMessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Inquiries</p>
                            <h3 className="text-2xl font-bold">{inquiryStats?.totalInquiries || 0}</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Conversion Rate</span>
                            <span className="font-bold">
                                {((inquiryStats?.inquiriesByStatus?.find(s => s._id === 'closed')?.count / inquiryStats?.totalInquiries) * 100 || 0).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-purple-500 h-full rounded-full" 
                                style={{ width: `${(inquiryStats?.inquiriesByStatus?.find(s => s._id === 'closed')?.count / inquiryStats?.totalInquiries) * 100 || 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Properties by Type */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiPieChart className="text-primary-500" /> Inventory Mix
                    </h3>
                    <div className="space-y-4">
                        {propertyStats?.propertiesByType?.map((item) => (
                            <div key={item._id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="capitalize text-gray-600 dark:text-gray-400">{item._id}</span>
                                    <span className="font-bold">{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-primary-500 h-full rounded-full" 
                                        style={{ width: `${(item.count / propertyStats?.propertiesByType?.reduce((acc, curr) => acc + curr.count, 0)) * 100 || 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Properties by City */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiMapPin className="text-primary-500" /> Geographical Distribution
                    </h3>
                    <div className="space-y-4">
                        {propertyStats?.propertiesByCity?.map((item) => (
                            <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                <span className="font-medium">{item._id || 'Unknown'}</span>
                                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold">
                                    {item.count} Listings
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Properties by Inquiries */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiTrendingUp className="text-primary-500" /> Hot Properties
                    </h3>
                    <div className="space-y-4">
                        {inquiryStats?.topProperties?.map((item) => (
                            <div key={item._id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0">
                                <div className="min-w-0">
                                    <p className="font-medium truncate text-sm">{item.property?.title}</p>
                                    <p className="text-xs text-gray-500">Most inquired listings</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-bold text-primary-600">{item.count}</span>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Leads</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Growth (Simple Monthly view) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiBarChart2 className="text-primary-500" /> User Onboarding
                    </h3>
                    <div className="flex items-end gap-2 h-48 pt-4">
                        {userStats?.usersByMonth?.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                <div 
                                    className="w-full bg-primary-500 rounded-t-lg transition-all group-hover:bg-primary-600 relative"
                                    style={{ height: `${(item.count / Math.max(...userStats.usersByMonth.map(u => u.count), 1)) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {item.count} users
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">
                                    {new Date(0, item._id - 1).toLocaleString('default', { month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;