import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiMaximize, FiDroplet, FiGrid, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';

const QuickView = ({ property, isOpen, onClose }) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { isAuthenticated } = useAuth();

    if (!property) return null;

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast.error('Please login to save properties');
            return;
        }

        if (isInWishlist(property._id)) {
            await removeFromWishlist(property._id);
        } else {
            await addToWishlist(property._id);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-4 md:inset-10 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition"
                        >
                            <FiX size={20} />
                        </button>

                        <div className="h-full overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                                {/* Image Section */}
                                <div className="relative h-64 md:h-full">
                                    <img
                                        src={getImageUrl(property.images[0]?.url)}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {property.type === 'buy' ? 'For Sale' : 'For Rent'}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="p-6 overflow-y-auto">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{property.title}</h2>
                                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                                <FiMapPin className="mr-2" />
                                                <span>{property.location.address}, {property.location.city}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleWishlistToggle}
                                            className={`p-3 rounded-full ${isInWishlist(property._id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <FiHeart className={isInWishlist(property._id) ? 'fill-current' : ''} />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg mb-6">
                                        <span className="text-3xl font-bold text-primary-600">
                                            ₹{property.price.toLocaleString()}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                                            {property.type === 'rent' ? '/month' : ''}
                                        </span>
                                    </div>

                                    {/* Key Features */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <FiMaximize className="mx-auto text-xl mb-1" />
                                            <div className="font-semibold">{property.area.value} {property.area.unit}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Area</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <FiGrid className="mx-auto text-xl mb-1" />
                                            <div className="font-semibold">{property.bedrooms}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <FiDroplet className="mx-auto text-xl mb-1" />
                                            <div className="font-semibold">{property.bathrooms}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <FiGrid className="mx-auto text-xl mb-1" />
                                            <div className="font-semibold capitalize">{property.propertyType}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Type</div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-2">Description</h3>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            {property.description.substring(0, 200)}...
                                        </p>
                                    </div>

                                    {/* Features */}
                                    {property.features && property.features.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="font-semibold mb-2">Features</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {property.features.slice(0, 4).map((feature, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                                                    >
                                                        {feature}
                                                    </span>
                                                ))}
                                                {property.features.length > 4 && (
                                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                                                        +{property.features.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <Link
                                            to={`/property/${property._id}`}
                                            className="flex-1 btn-primary text-center"
                                            onClick={onClose}
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => {
                                                onClose();
                                                document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="flex-1 btn-secondary"
                                        >
                                            Contact Agent
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default QuickView;