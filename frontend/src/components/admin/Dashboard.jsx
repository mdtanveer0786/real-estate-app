import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHome, FiUsers, FiMessageSquare, FiClock,
  FiTrendingUp, FiDollarSign, FiMapPin 
} from 'react-icons/fi';

const Dashboard = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    { 
      title: 'Total Properties', 
      value: stats.stats.totalProperties, 
      icon: FiHome, 
      color: 'bg-blue-500',
      change: '+12%',
    },
    { 
      title: 'Total Users', 
      value: stats.stats.totalUsers, 
      icon: FiUsers, 
      color: 'bg-green-500',
      change: '+8%',
    },
    { 
      title: 'Total Inquiries', 
      value: stats.stats.totalInquiries, 
      icon: FiMessageSquare, 
      color: 'bg-purple-500',
      change: '+24%',
    },
    { 
      title: 'New Inquiries', 
      value: stats.stats.newInquiries, 
      icon: FiClock, 
      color: 'bg-yellow-500',
      change: '+5%',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="text-white text-xl" />
              </div>
              <span className="text-green-500 text-sm font-medium bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                {card.change}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Property Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiHome className="mr-2 text-green-500" />
            Available Properties
          </h3>
          <p className="text-3xl font-bold text-green-600">{stats.stats.availableProperties}</p>
          <p className="text-sm text-gray-500 mt-2">Ready for sale/rent</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiDollarSign className="mr-2 text-blue-500" />
            Sold Properties
          </h3>
          <p className="text-3xl font-bold text-blue-600">{stats.stats.soldProperties || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Successfully sold</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-purple-500" />
            Rented Properties
          </h3>
          <p className="text-3xl font-bold text-purple-600">{stats.stats.rentedProperties || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Currently rented</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Properties</h2>
            <Link to="/admin/properties" className="text-primary-600 hover:text-primary-700 text-sm">
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentProperties.map((property) => (
              <div key={property._id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div>
                  <p className="font-medium hover:text-primary-600 cursor-pointer">{property.title}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiMapPin className="mr-1 text-xs" />
                    {property.location.city}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">₹{property.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-primary-600 hover:text-primary-700 text-sm">
              View All →
            </Link>
          </div>
          
          <div className="space-y-4">
            {stats.recentInquiries.map((inquiry) => (
              <div key={inquiry._id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div>
                  <p className="font-medium">{inquiry.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Regarding: {inquiry.property?.title}
                  </p>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    inquiry.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                    inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {inquiry.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;