import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCalendar, FiCheck, FiX, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get('/inquiries');
      setInquiries(data);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/inquiries/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new': return <FiClock className="text-yellow-500" />;
      case 'contacted': return <FiCheck className="text-blue-500" />;
      case 'closed': return <FiX className="text-gray-500" />;
      default: return null;
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.status === filter;
  });

  const getStatusCount = (status) => {
    return inquiries.filter(i => i.status === status).length;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inquiry Management</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'new', 'contacted', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize flex items-center space-x-2 whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span>{status}</span>
            {status !== 'all' && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                filter === status ? 'bg-white text-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                {getStatusCount(status)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => (
          <div key={inquiry._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{inquiry.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Regarding: {inquiry.property?.title}
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-2 md:mt-0">
                {getStatusIcon(inquiry.status)}
                <select
                  value={inquiry.status}
                  onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiMail className="mr-2 flex-shrink-0" />
                <a href={`mailto:${inquiry.email}`} className="hover:text-primary-600 truncate">
                  {inquiry.email}
                </a>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiPhone className="mr-2 flex-shrink-0" />
                <a href={`tel:${inquiry.phone}`} className="hover:text-primary-600">
                  {inquiry.phone}
                </a>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <FiCalendar className="mr-2 flex-shrink-0" />
                {new Date(inquiry.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {inquiry.message}
              </p>
            </div>

            {inquiry.user && (
              <div className="mt-4 text-sm text-gray-500 border-t pt-4">
                <span className="font-medium">User:</span> {inquiry.user.name} ({inquiry.user.email})
              </div>
            )}
          </div>
        ))}

        {filteredInquiries.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">No inquiries found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Summary</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{inquiries.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{getStatusCount('new')}</p>
            <p className="text-sm text-gray-500">New</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{getStatusCount('contacted')}</p>
            <p className="text-sm text-gray-500">Contacted</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{getStatusCount('closed')}</p>
            <p className="text-sm text-gray-500">Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inquiries;