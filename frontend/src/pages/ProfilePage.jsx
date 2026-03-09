import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
    FiUser, FiMail, FiPhone, FiSave, FiHeart, 
    FiMessageSquare, FiLogOut, FiEdit2, FiHome 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageHelper';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [userInquiries, setUserInquiries] = useState([]);
    const [editing, setEditing] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        }
    });

    useEffect(() => {
        if (activeTab === 'inquiries') {
            fetchUserInquiries();
        }
    }, [activeTab]);

    const fetchUserInquiries = async () => {
        try {
            const { data } = await api.get('/users/inquiries');
            setUserInquiries(data.inquiries);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await api.put('/users/profile', data);
            toast.success('Profile updated successfully');
            setEditing(false);
            // Update user in context if needed
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <Helmet>
                <title>My Profile | EstateElite</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container-custom">
                    <div className="max-w-4xl mx-auto">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">{user?.name}</h1>
                                        <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Member since {new Date(user?.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                >
                                    <FiLogOut />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'profile'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <FiUser />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'wishlist'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <FiHeart />
                                Wishlist ({wishlist.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('inquiries')}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap ${
                                    activeTab === 'inquiries'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <FiMessageSquare />
                                My Inquiries
                            </button>
                        </div>

                        {/* Tab Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-xl font-semibold">Profile Information</h2>
                                        {!editing && (
                                            <button
                                                onClick={() => setEditing(true)}
                                                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                                            >
                                                <FiEdit2 />
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>

                                    {editing ? (
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    {...register('name', { required: 'Name is required' })}
                                                    className="input-field"
                                                />
                                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    {...register('email', { 
                                                        required: 'Email is required',
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: 'Invalid email address'
                                                        }
                                                    })}
                                                    className="input-field"
                                                />
                                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    {...register('phone', {
                                                        pattern: {
                                                            value: /^[0-9]{10}$/,
                                                            message: 'Please enter a valid 10-digit phone number'
                                                        }
                                                    })}
                                                    className="input-field"
                                                    placeholder="Optional"
                                                />
                                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn-primary flex items-center gap-2"
                                                >
                                                    {loading ? (
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <FiSave />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditing(false)}
                                                    className="btn-secondary"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <FiUser className="text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Name</p>
                                                    <p className="font-medium">{user?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <FiMail className="text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <FiPhone className="text-gray-400 mr-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <p className="font-medium">{user?.phone || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Wishlist Tab */}
                            {activeTab === 'wishlist' && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
                                    
                                    {wishlist.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiHeart className="mx-auto text-5xl text-gray-400 mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                You haven't saved any properties yet
                                            </p>
                                            <Link to="/properties" className="btn-primary inline-block">
                                                Browse Properties
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {wishlist.map((property) => (
                                                <Link
                                                    key={property._id}
                                                    to={`/property/${property._id}`}
                                                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition group"
                                                >
                                                    <img
                                                        src={getImageUrl(property.images[0]?.url)}
                                                        alt={property.title}
                                                        className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold mb-1 line-clamp-1">{property.title}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                            {property.location?.city}
                                                        </p>
                                                        <p className="text-primary-600 font-semibold">
                                                            ₹{property.price?.toLocaleString()}
                                                            {property.type === 'rent' && '/month'}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Inquiries Tab */}
                            {activeTab === 'inquiries' && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6">My Inquiries</h2>
                                    
                                    {userInquiries.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiMessageSquare className="mx-auto text-5xl text-gray-400 mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400">
                                                You haven't made any inquiries yet
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {userInquiries.map((inquiry) => (
                                                <div key={inquiry._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <Link 
                                                            to={`/property/${inquiry.property?._id}`}
                                                            className="font-semibold hover:text-primary-600"
                                                        >
                                                            {inquiry.property?.title}
                                                        </Link>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            inquiry.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                                                            inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {inquiry.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 mb-2">{inquiry.message}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Sent on {new Date(inquiry.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;