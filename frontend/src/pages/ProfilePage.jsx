import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiSave, FiHeart, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';  // Changed from "../../context" to "../context"
import { useWishlist } from '../context/WishlistContext';  // Changed from "../../context" to "../context"
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const ProfilePage = () => {
    const { user, updateProfile, logout } = useAuth();
    const { wishlist } = useWishlist();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await updateProfile(data);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
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
                        {/* Header */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                        <FiUser className="text-primary-600 dark:text-primary-400 text-2xl" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">{user?.name}</h1>
                                        <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                >
                                    <FiLogOut />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-4 mb-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'profile'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Profile Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${activeTab === 'wishlist'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <FiHeart />
                                Saved Properties ({wishlist.length})
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
                            {activeTab === 'profile' ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Full Name</label>
                                            <div className="relative">
                                                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    {...register('name', { required: 'Name is required' })}
                                                    className="input-field pl-10"
                                                />
                                            </div>
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email</label>
                                            <div className="relative">
                                                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="email"
                                                    {...register('email', {
                                                        required: 'Email is required',
                                                        pattern: {
                                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                            message: 'Invalid email address'
                                                        }
                                                    })}
                                                    className="input-field pl-10"
                                                />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                                            <div className="relative">
                                                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    {...register('phone', {
                                                        pattern: {
                                                            value: /^[0-9]{10}$/,
                                                            message: 'Please enter a valid 10-digit phone number'
                                                        }
                                                    })}
                                                    className="input-field pl-10"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                                        </div>

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
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                    <h2 className="text-xl font-semibold mb-6">Saved Properties</h2>

                                    {wishlist.length === 0 ? (
                                        <div className="text-center py-12">
                                            <FiHeart className="mx-auto text-4xl text-gray-400 mb-4" />
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't saved any properties yet</p>
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
                                                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition"
                                                >
                                                    <img
                                                        src={property.images[0]?.url || 'https://via.placeholder.com/80'}
                                                        alt={property.title}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold mb-1">{property.title}</h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                            {property.location.city}
                                                        </p>
                                                        <p className="text-primary-600 font-semibold">
                                                            ₹{property.price.toLocaleString()}
                                                            {property.type === 'rent' && '/month'}
                                                        </p>
                                                    </div>
                                                </Link>
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