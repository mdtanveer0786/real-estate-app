import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PropertyCard from '../properties/PropertyCard';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PropertyManagement = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Add navigate for edit

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const { data } = await api.get('/properties?limit=100');
            setProperties(data.properties);
        } catch (error) {
            toast.error('Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;

        try {
            await api.delete(`/properties/${id}`);

            // Update local state immediately without waiting for refresh
            setProperties(prevProperties =>
                prevProperties.filter(property => property._id !== id)
            );

            toast.success('Property deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.error || 'Failed to delete property');
        }
    };

    const handleEdit = (id) => {
        navigate(`/admin/edit-property/${id}`);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Property Management</h1>
                <Link to="/admin/add-property" className="btn-primary">
                    Add New Property
                </Link>
            </div>

            {/* Grid View with Property Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                    <div key={property._id} className="relative group">
                        <PropertyCard
                            property={property}
                            onDelete={handleDelete}
                            onEdit={handleEdit} // Add edit handler
                        />
                    </div>
                ))}
            </div>

            {/* Table View for Desktop */}
            <div className="hidden lg:block mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {properties.map((property) => (
                            <tr key={property._id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <img
                                            src={property.images[0]?.url || 'https://via.placeholder.com/50'}
                                            alt={property.title}
                                            className="w-10 h-10 rounded-lg object-cover mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">{property.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{property.location.city}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">₹{property.price.toLocaleString()}</td>
                                <td className="px-6 py-4 capitalize">{property.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${property.status === 'available' ? 'bg-green-100 text-green-800' :
                                        property.status === 'sold' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {property.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/property/${property._id}`}
                                            target="_blank"
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <FiEye />
                                        </Link>
                                        <Link
                                            to={`/admin/edit-property/${property._id}`}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                        >
                                            <FiEdit2 />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(property._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PropertyManagement;