import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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
            toast.success('Status updated');
            fetchInquiries();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        if (filter === 'all') return true;
        return inquiry.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-yellow-100 text-yellow-800';
            case 'contacted': return 'bg-blue-100 text-blue-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Inquiries</h1>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                {['all', 'new', 'contacted', 'closed'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg capitalize ${filter === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Inquiries List */}
            <div className="space-y-4">
                {filteredInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{inquiry.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Regarding: {inquiry.property?.title}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <select
                                    value={inquiry.status}
                                    onChange={(e) => updateStatus(inquiry._id, e.target.value)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(inquiry.status)}`}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FiMail className="mr-2" />
                                <a href={`mailto:${inquiry.email}`} className="hover:text-primary-600">
                                    {inquiry.email}
                                </a>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FiPhone className="mr-2" />
                                <a href={`tel:${inquiry.phone}`} className="hover:text-primary-600">
                                    {inquiry.phone}
                                </a>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FiCalendar className="mr-2" />
                                {format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <p className="text-gray-800 dark:text-gray-200">{inquiry.message}</p>
                        </div>

                        {inquiry.user && (
                            <div className="mt-4 text-sm text-gray-500">
                                User: {inquiry.user.name} ({inquiry.user.email})
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
        </div>
    );
};

export default Inquiries;