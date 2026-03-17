import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiMapPin,
    FiMaximize,
    FiHeart,
    FiEye,
    FiGrid,      // Replace FiBed with FiGrid
    FiDroplet,   // Replace FiBath with FiDroplet
    FiSquare,
    FiStar,
    FiTrash2
} from 'react-icons/fi';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyCard = ({ property, onDelete }) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Format Indian Currency (Crore/Lakhs)
    const formatPrice = (price) => {
        if (!price) return 'Contact for Price';
        if (price >= 10000000) return `₹${(price / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
        if (price >= 100000) return `₹${(price / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
        return `₹${price.toLocaleString('en-IN')}`;
    };

    // Check if we're in admin panel
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isAdmin = user?.role === 'admin';

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to save properties');
            return;
        }

        if (isInWishlist(property._id)) {
            await removeFromWishlist(property._id);
            toast.success('Removed from wishlist');
        } else {
            await addToWishlist(property._id);
            toast.success('Added to wishlist');
        }
    };

    const handleDeleteClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onDelete) {
            onDelete(property._id);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="h-full"
        >
            <Link to={`/property/${property._id}`} className="block h-full">
                <div className="card h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                        {/* Image with skeleton loader */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 skeleton" />
                        )}
                        <img
                            src={getImageUrl(property.images[0]?.url)}
                            alt={property.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'
                                } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setImageLoaded(true)}
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Property Type Badge */}
                        <div className="absolute top-3 left-3">
                            <span className={`badge ${property.type === 'buy'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-secondary-600 text-white'
                                }`}>
                                {property.type === 'buy' ? 'For Sale' : 'For Rent'}
                            </span>
                        </div>

                        {/* Featured Badge - Fixed positioning */}
                        {property.featured && (
                            <div className="absolute top-3 left-24">
                                <span className="badge bg-yellow-500 text-white flex items-center gap-1">
                                    <FiStar className="fill-current" /> Featured
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute top-3 right-3 flex gap-2">
                            {/* Delete Button - ONLY show in admin panel */}
                            {isAdminRoute && isAdmin && (
                                <button
                                    onClick={handleDeleteClick}
                                    className="p-2.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg"
                                    aria-label="Delete property"
                                >
                                    <FiTrash2 size={16} />
                                </button>
                            )}

                            {/* Wishlist Button - NEVER show in admin panel */}
                            {!isAdminRoute && (
                                <button
                                    onClick={handleWishlistClick}
                                    className={`p-2.5 rounded-full transition-all duration-300 transform ${isInWishlist(property._id)
                                            ? 'bg-red-500 text-white scale-110'
                                            : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110'
                                        } shadow-lg backdrop-blur-sm`}
                                    aria-label="Toggle wishlist"
                                >
                                    <FiHeart className={isInWishlist(property._id) ? 'fill-current' : ''} size={16} />
                                </button>
                            )}
                        </div>

                        {/* Price Tag */}
                        <div className="absolute bottom-3 left-3">
                            <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl shadow-black/10 border border-white/20">
                                <span className="text-lg sm:text-xl font-bold text-primary-700">
                                    {formatPrice(property.price)}
                                </span>
                                {property.type === 'rent' && (
                                    <span className="text-xs sm:text-sm text-gray-600 ml-1 font-semibold">/mo</span>
                                )}
                            </div>
                        </div>

                        {/* Views Count */}
                        <div className="absolute bottom-3 right-3">
                            <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs flex items-center gap-1">
                                <FiEye />
                                <span>{property.views}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-1 hover:text-primary-600 transition">
                            {property.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-start text-gray-600 dark:text-gray-400 mb-3 text-sm">
                            <FiMapPin className="mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">
                                {property.location.address}, {property.location.city}
                            </span>
                        </div>

                        {/* Features Grid - Using correct icons */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <FiMaximize className="text-primary-600 mr-1 text-xs" />
                                <span className="text-xs font-medium">
                                    {property.area.value} {property.area.unit}
                                </span>
                            </div>
                            <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <FiGrid className="text-primary-600 mr-1 text-xs" /> {/* Changed from FiBed to FiGrid */}
                                <span className="text-xs font-medium">{property.bedrooms} Beds</span>
                            </div>
                            <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <FiDroplet className="text-primary-600 mr-1 text-xs" /> {/* Changed from FiBath to FiDroplet */}
                                <span className="text-xs font-medium">{property.bathrooms} Baths</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                <FiSquare className="mr-1" />
                                <span className="capitalize">{property.propertyType}</span>
                            </div>
                            <span className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform flex items-center">
                                View Details
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default PropertyCard;