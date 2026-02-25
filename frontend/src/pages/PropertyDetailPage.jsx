import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMapPin, FiMaximize, FiDroplet, FiGrid, FiHeart, FiArrowLeft } from 'react-icons/fi';
import ImageGallery from '../components/properties/ImageGallery';
import ContactForm from '../components/properties/ContactForm';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        console.log('PropertyDetailPage mounted with ID:', id);

        if (!id) {
            setError('No property ID provided');
            setLoading(false);
            return;
        }

        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching property with ID:', id);

            // Important: Make sure we're using the correct endpoint
            const { data } = await api.get(`/properties/${id}`);

            console.log('Property data received:', data);

            // Handle both response formats
            if (data.property) {
                setProperty(data.property);
            } else {
                setProperty(data);
            }

        } catch (error) {
            console.error('Error fetching property:', error);

            if (error.response?.status === 400) {
                setError('Invalid property ID format');
            } else if (error.response?.status === 404) {
                setError('Property not found');
            } else {
                setError('Failed to load property details. Please try again.');
            }

            toast.error(error.response?.data?.error || 'Failed to load property');
        } finally {
            setLoading(false);
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to save properties');
            return;
        }

        try {
            if (isInWishlist(id)) {
                await removeFromWishlist(id);
                toast.success('Removed from wishlist');
            } else {
                await addToWishlist(id);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="text-6xl mb-4">🏠</div>
                    <h2 className="text-2xl font-bold mb-2">Oops! Something Went Wrong</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/properties')}
                            className="btn-primary"
                        >
                            Browse Properties
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <FiArrowLeft /> Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No property state
    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400">Property not found</p>
            </div>
        );
    }

    // Success state - render property
    return (
        <>
            <Helmet>
                <title>{property.title} | EstateElite</title>
                <meta name="description" content={property.description?.substring(0, 160)} />
            </Helmet>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900"
            >
                {/* Back Button */}
                <div className="container-custom py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition"
                    >
                        <FiArrowLeft /> Back to Properties
                    </button>
                </div>

                {/* Image Gallery */}
                <ImageGallery images={property.images || []} />

                {/* Property Info */}
                <div className="container-custom py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <FiMapPin className="mr-2" />
                                        <span>{property.location?.address}, {property.location?.city}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleWishlistToggle}
                                    className={`p-3 rounded-full transition-all ${isInWishlist(id)
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                                        }`}
                                    aria-label="Toggle wishlist"
                                >
                                    <FiHeart className={isInWishlist(id) ? 'fill-current' : ''} />
                                </button>
                            </div>

                            {/* Price */}
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
                                <span className="text-2xl font-bold text-primary-600">
                                    ₹{property.price?.toLocaleString()}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                    {property.type === 'rent' ? '/month' : ''}
                                </span>
                            </div>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FiMaximize className="mx-auto text-xl mb-1" />
                                    <div className="font-semibold">{property.area?.value} {property.area?.unit}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Area</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FiGrid className="mx-auto text-xl mb-1" />
                                    <div className="font-semibold">{property.bedrooms}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FiDroplet className="mx-auto text-xl mb-1" />
                                    <div className="font-semibold">{property.bathrooms}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FiMapPin className="mx-auto text-xl mb-1" />
                                    <div className="font-semibold capitalize">{property.propertyType}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3">Description</h2>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {property.description}
                                </p>
                            </div>

                            {/* Features List */}
                            {property.features && property.features.length > 0 && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-3">Features</h2>
                                    <div className="grid grid-cols-2 gap-2">
                                        {property.features.map((feature, index) => (
                                            <div key={index} className="flex items-center">
                                                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Contact Form */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <ContactForm propertyId={property._id} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default PropertyDetailPage;