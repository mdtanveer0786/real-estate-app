import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMapPin, FiMaximize, FiDroplet, FiGrid, FiHeart } from 'react-icons/fi';
import ImageGallery from '../components/properties/ImageGallery';
import ContactForm from '../components/properties/ContactForm';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { useWishlist } from '../context/WishlistContext';  // Changed from "../../context" to "../context"
import { useAuth } from '../context/AuthContext';  // Changed from "../../context" to "../context"
import toast from 'react-hot-toast';

const PropertyDetailPage = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchProperty();
    }, [id]);

    const fetchProperty = async () => {
        try {
            const { data } = await api.get(`/properties/${id}`);
            setProperty(data);
        } catch (error) {
            console.error('Error fetching property:', error);
            toast.error('Failed to load property details');
        } finally {
            setLoading(false);
        }
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to save properties');
            return;
        }

        if (isInWishlist(id)) {
            await removeFromWishlist(id);
        } else {
            await addToWishlist(id);
        }
    };

    if (loading) return <Loader />;
    if (!property) return <div className="text-center py-12">Property not found</div>;

    return (
        <>
            <Helmet>
                <title>{property.title} | EstateElite</title>
                <meta name="description" content={property.description.substring(0, 160)} />
            </Helmet>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900"
            >
                {/* Image Gallery */}
                <ImageGallery images={property.images} />

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
                                        <span>{property.location.address}, {property.location.city}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleWishlistToggle}
                                    className={`p-3 rounded-full ${isInWishlist(id)
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                        }`}
                                >
                                    <FiHeart />
                                </button>
                            </div>

                            {/* Price */}
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
                                <span className="text-2xl font-bold text-primary-600">
                                    ₹{property.price.toLocaleString()}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                    {property.type === 'rent' ? '/month' : ''}
                                </span>
                            </div>

                            {/* Key Features */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <FiMaximize className="mx-auto text-xl mb-1" />
                                    <div className="font-semibold">{property.area.value} {property.area.unit}</div>
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

                            {/* Features */}
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

                            {/* Location Map */}
                            {property.location.coordinates && (
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-3">Location</h2>
                                    <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
                                        <iframe
                                            title="property-location"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${property.location.coordinates.lat},${property.location.coordinates.lng}`}
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
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