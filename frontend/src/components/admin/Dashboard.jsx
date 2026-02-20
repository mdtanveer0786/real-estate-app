import React from 'react';
import { FiHome, FiUsers, FiMessageSquare, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = ({ stats }) => {
    if (!stats) return null;

    const statCards = [
        { title: 'Total Properties', value: stats.stats.totalProperties, icon: FiHome, color: 'bg-blue-500' },
        { title: 'Total Users', value: stats.stats.totalUsers, icon: FiUsers, color: 'bg-green-500' },
        { title: 'Total Inquiries', value: stats.stats.totalInquiries, icon: FiMessageSquare, color: 'bg-purple-500' },
        { title: 'New Inquiries', value: stats.stats.newInquiries, icon: FiClock, color: 'bg-yellow-500' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{card.title}</p>
                                <p className="text-3xl font-bold mt-2">{card.value}</p>
                            </div>
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <card.icon className="text-white" size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Properties */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Properties</h2>
                    <div className="space-y-4">
                        {stats.recentProperties.map((property) => (
                            <div key={property._id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                                <div>
                                    <p className="font-medium">{property.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Added by {property.createdBy?.name}
                                    </p>
                                </div>
                                <span className="text-primary-600 font-semibold">
                                    ₹{property.price.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link to="/admin/properties" className="block text-center mt-4 text-primary-600 hover:text-primary-700">
                        View All Properties →
                    </Link>
                </div>

                {/* Recent Inquiries */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Inquiries</h2>
                    <div className="space-y-4">
                        {stats.recentInquiries.map((inquiry) => (
                            <div key={inquiry._id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                                <div>
                                    <p className="font-medium">{inquiry.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Regarding: {inquiry.property?.title}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${inquiry.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                                        inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {inquiry.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Link to="/admin/inquiries" className="block text-center mt-4 text-primary-600 hover:text-primary-700">
                        View All Inquiries →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;