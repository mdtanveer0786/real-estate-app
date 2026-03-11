import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiMapPin,
    FiMaximize,
    FiDroplet,
    FiGrid,
    FiHeart,
    FiShare2,
    FiCalendar,
    FiEye,
    FiUser,
    FiChevronLeft,
    FiChevronRight
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyDetails = ({ property }) => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: `I'm interested in this property. Please contact me with more details.`
    });
    const [sending, setSending] = useState(false);

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

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: property.title,
                text: property.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleWhatsApp = () => {
        const message = `Hi, I'm interested in this property: ${property.title} - ₹${property.price.toLocaleString()}\n\n${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            await api.post('/inquiries', {
                propertyId: id,
                ...contactForm
            });
            toast.success('Inquiry sent successfully!');
            setShowContactForm(false);
            setContactForm({
                ...contactForm,
                message: `I'm interested in this property. Please contact me with more details.`
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send inquiry');
        } finally {
            setSending(false);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-900"
        >
            {/* Image Gallery Section */}
            <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] bg-gray-900 overflow-hidden">
                {/* Main Image */}
                <div className="relative h-full">
                    <img
                        src={getImageUrl(property.images[currentImageIndex]?.url)}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Navigation Arrows - Larger on mobile for easier tapping */}
                    {property.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-md text-white p-3 sm:p-4 rounded-full hover:bg-black/60 transition z-10"
                            >
                                <FiChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/40 backdrop-blur-md text-white p-3 sm:p-4 rounded-full hover:bg-black/60 transition z-10"
                            >
                                <FiChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium z-10">
                        {currentImageIndex + 1} / {property.images.length}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex space-x-2 z-10">
                        <button
                            onClick={handleShare}
                            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-700 dark:text-gray-300 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition shadow-lg border border-white/20"
                        >
                            <FiShare2 size={20} />
                        </button>
                        <button
                            onClick={handleWishlistToggle}
                            className={`p-3 rounded-xl transition shadow-lg backdrop-blur-md border border-white/20 ${isInWishlist(id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            <FiHeart className={isInWishlist(id) ? 'fill-current' : ''} size={20} />
                        </button>
                    </div>

                    {/* Thumbnails - Improved scrolling on mobile */}
                    {property.images.length > 1 && (
                        <div className="absolute bottom-4 left-4 flex space-x-2 overflow-x-auto max-w-[calc(100%-8rem)] pb-2 z-10 scrollbar-hide snap-x">
                            {property.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition snap-start ${index === currentImageIndex ? 'border-primary-500 scale-110' : 'border-transparent opacity-70'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(image.url)}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Property Info Section */}
            <div className="container-custom py-6 sm:py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Title and Location */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="badge badge-primary uppercase tracking-wider text-[10px] font-bold">
                                    {property.type === 'buy' ? 'For Sale' : 'For Rent'}
                                </span>
                                <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                                    {property.propertyType}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight">{property.title}</h1>
                            <div className="flex items-start text-gray-600 dark:text-gray-400">
                                <FiMapPin className="mr-2 mt-1 flex-shrink-0 text-primary-500" />
                                <span className="text-sm sm:text-base">{property.location.address}, {property.location.city}, {property.location.state} - {property.location.pincode}</span>
                            </div>
                        </div>

                        {/* Price and Status - Refined for mobile */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Total Price</span>
                                    <div className="text-3xl sm:text-4xl font-black text-primary-600 mt-1">
                                        ₹{property.price.toLocaleString()}
                                        {property.type === 'rent' && <span className="text-lg font-bold ml-1 text-gray-500">/mo</span>}
                                    </div>
                                </div>
                                <div className="sm:text-right pt-4 sm:pt-0 border-t sm:border-0 border-gray-50 dark:border-gray-700">
                                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Current Status</span>
                                    <div className={`text-lg font-bold mt-1 flex items-center sm:justify-end gap-2 ${property.status === 'available' ? 'text-green-500' :
                                            property.status === 'sold' ? 'text-red-500' :
                                                'text-yellow-500'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${property.status === 'available' ? 'bg-green-500' : property.status === 'sold' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Features Grid - 2x2 on mobile, 4x1 on desktop */}
                        <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 sm:gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-center">
                                <FiMaximize className="mx-auto text-xl mb-2 text-primary-500" />
                                <div className="font-bold text-sm sm:text-base">{property.area.value} {property.area.unit}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Area</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-center">
                                <FiGrid className="mx-auto text-xl mb-2 text-primary-500" />
                                <div className="font-bold text-sm sm:text-base">{property.bedrooms}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Bedrooms</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-center">
                                <FiDroplet className="mx-auto text-xl mb-2 text-primary-500" />
                                <div className="font-bold text-sm sm:text-base">{property.bathrooms}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Baths</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 text-center">
                                <FiMapPin className="mx-auto text-xl mb-2 text-primary-500" />
                                <div className="font-bold text-sm sm:text-base capitalize">{property.propertyType}</div>
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Type</div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-3">Description</h2>
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                {property.description}
                            </p>
                        </div>

                        {/* Features & Amenities */}
                        {property.features && property.features.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-3">Features & Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {property.features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
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
                                <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    <iframe
                                        title="property-location"
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${property.location.coordinates.lat},${property.location.coordinates.lng}`}
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}

                        {/* Additional Details */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Posted on</span>
                                <div className="font-medium flex items-center mt-1">
                                    <FiCalendar className="mr-2" />
                                    {format(new Date(property.createdAt), 'MMM dd, yyyy')}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
                                <div className="font-medium flex items-center mt-1">
                                    <FiEye className="mr-2" />
                                    {property.views} views
                                </div>
                            </div>
                            {property.createdBy && (
                                <div className="col-span-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Listed by</span>
                                    <div className="font-medium flex items-center mt-1">
                                        <FiUser className="mr-2" />
                                        {property.createdBy.name}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Contact & Actions */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-4">
                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsApp}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition"
                            >
                                <FaWhatsApp size={24} />
                                Chat on WhatsApp
                            </button>

                            {/* Contact Form Toggle */}
                            <button
                                onClick={() => setShowContactForm(!showContactForm)}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition"
                            >
                                {showContactForm ? 'Hide Contact Form' : 'Contact Agent'}
                            </button>

                            {/* Contact Form */}
                            {showContactForm && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                                >
                                    <h3 className="text-lg font-semibold mb-4">Send Inquiry</h3>
                                    <form onSubmit={handleContactSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Name *</label>
                                            <input
                                                type="text"
                                                value={contactForm.name}
                                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                required
                                                className="input-field"
                                                placeholder="Your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email *</label>
                                            <input
                                                type="email"
                                                value={contactForm.email}
                                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                required
                                                className="input-field"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Phone *</label>
                                            <input
                                                type="tel"
                                                value={contactForm.phone}
                                                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                                required
                                                className="input-field"
                                                placeholder="10-digit phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Message *</label>
                                            <textarea
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                required
                                                rows="4"
                                                className="input-field"
                                                placeholder="Your message..."
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="w-full btn-primary py-3 disabled:opacity-50"
                                        >
                                            {sending ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* Agent Info Card */}
                            {property.createdBy && (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4">Agent Information</h3>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                            <FiUser className="text-primary-600 dark:text-primary-400 text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{property.createdBy.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Property Agent</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowContactForm(true)}
                                        className="w-full btn-secondary"
                                    >
                                        Contact Agent
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertyDetails;