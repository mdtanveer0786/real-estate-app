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
    FiChevronRight,
    FiX,
    FiHome
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyDetails = ({ property, onClose }) => {
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showContactForm, setShowContactForm] = useState(true);
    const [contactForm, setContactForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: `I'm interested in this property. Please contact me with more details.`
    });
    const [sending, setSending] = useState(false);

    // Get property ID - ensure we prioritize the property object's _id
    const propertyId = property?._id || property?.id || id;

    // Sync user data when it changes
    useEffect(() => {
        if (user) {
            setContactForm(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
            }));
        }
    }, [user]);

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to save properties');
            return;
        }

        if (isInWishlist(propertyId)) {
            await removeFromWishlist(propertyId);
        } else {
            await addToWishlist(propertyId);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: property?.title,
                text: property?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleWhatsApp = () => {
        // Use property owner's phone if available, else fallback
        const phone = property?.createdBy?.phone || '+918252574386';
        const message = `Hi, I'm interested in this property: ${property?.title} - ₹${property?.price?.toLocaleString()}\n\n${window.location.href}`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();

        if (!propertyId) {
            toast.error('Property ID is missing. Please refresh and try again.');
            return;
        }

        setSending(true);

        try {
            await api.post('/inquiries', {
                propertyId: String(propertyId),
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

    const images = property?.images || [];

    const nextImage = () => {
        if (!images.length) return;
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        if (!images.length) return;
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!property) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-900 relative"
        >
            {/* Close Button (for modal usage) */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[60] bg-white/10 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/20 transition-all shadow-xl border border-white/20 sm:top-8 sm:right-8"
                    aria-label="Close"
                >
                    <FiX size={24} />
                </button>
            )}

            {/* Hero Image Section */}
            <div className="relative h-[45vh] sm:h-[55vh] md:h-[65vh] bg-gray-900 overflow-hidden">
                {/* Main Image with Zoom Effect */}
                <div className="relative h-full w-full group">
                    {images.length > 0 ? (
                        <motion.img
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            src={getImageUrl(images[currentImageIndex]?.url)}
                            alt={property.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500 gap-3">
                            <FiMaximize size={48} className="opacity-20" />
                            <span className="font-medium">No images available</span>
                        </div>
                    )}

                    {/* Sophisticated Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    
                    {/* Floating Info Badges */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg ${
                                    property.type === 'buy' ? 'bg-primary-600 text-white' : 'bg-secondary-600 text-white'
                                }`}>
                                    For {property.type === 'buy' ? 'Sale' : 'Rent'}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                    {property.propertyType}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-lg tracking-tight">
                                {property.title}
                            </h1>
                            <div className="flex items-center text-white/90 text-sm sm:text-base font-medium">
                                <FiMapPin className="mr-2 text-primary-400" />
                                <span>{property.location?.address}, {property.location?.city}</span>
                            </div>
                        </div>
                        
                        <div className="hidden sm:block">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl">
                                <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-1">Asking Price</div>
                                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                                    ₹{property.price?.toLocaleString('en-IN')}
                                    {property.type === 'rent' && <span className="text-sm font-bold text-white/60">/mo</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Gallery Controls */}
                    {images.length > 1 && (
                        <>
                            <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between pointer-events-none">
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="pointer-events-auto bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all border border-white/20"
                                >
                                    <FiChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="pointer-events-auto bg-white/10 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/20 transition-all border border-white/20"
                                >
                                    <FiChevronRight size={24} />
                                </button>
                            </div>

                            {/* Image Indicator Dots */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                                {images.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            idx === currentImageIndex ? 'w-6 bg-primary-500' : 'w-1.5 bg-white/40'
                                        }`} 
                                    />
                                ))}
                            </div>
                        </>
                    )}
                    
                    {/* Action Panel */}
                    <div className="absolute top-6 right-20 flex gap-2 sm:right-24">
                        <button
                            onClick={handleShare}
                            className="bg-white/10 backdrop-blur-md text-white p-3 rounded-xl hover:bg-white/20 transition-all border border-white/20"
                            title="Share Property"
                        >
                            <FiShare2 size={20} />
                        </button>
                        <button
                            onClick={handleWishlistToggle}
                            className={`p-3 rounded-xl transition-all border backdrop-blur-md ${
                                isInWishlist(propertyId)
                                    ? 'bg-red-500/80 border-red-400 text-white'
                                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                            }`}
                        >
                            <FiHeart className={isInWishlist(propertyId) ? 'fill-current' : ''} size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="relative px-4 sm:px-8 py-8 sm:py-12 bg-gray-50 dark:bg-gray-900/50">
                {/* Mobile Price Display */}
                <div className="sm:hidden mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Asking Price</div>
                    <div className="text-3xl font-black text-primary-600 flex items-baseline gap-1">
                        ₹{property.price?.toLocaleString('en-IN')}
                        {property.type === 'rent' && <span className="text-sm font-bold text-gray-400">/mo</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Core Details */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: FiMaximize, label: 'Area', value: `${property.area?.value} ${property.area?.unit}` },
                                { icon: FiGrid, label: 'Bedrooms', value: property.bedrooms },
                                { icon: FiDroplet, label: 'Bathrooms', value: property.bathrooms },
                                { icon: FiHome, label: 'Status', value: property.status, className: 'capitalize' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.02]">
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl mb-3">
                                        <item.icon className="text-primary-600 text-xl" />
                                    </div>
                                    <div className="text-sm font-black dark:text-white truncate max-w-full text-center">{item.value}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Description Section */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-1.5 bg-primary-600 rounded-full" />
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Property Overview</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base sm:text-lg">
                                {property.description}
                            </p>
                        </section>

                        {/* Features & Amenities */}
                        {property.features && property.features.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-1.5 bg-primary-600 rounded-full" />
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">Amenities & Features</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {property.features.map((feature, index) => (
                                        <div key={index} className="group flex items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 transition-colors hover:border-primary-200 dark:hover:border-primary-900">
                                            <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 group-hover:scale-150 transition-transform" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Location Details */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1.5 bg-primary-600 rounded-full" />
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Location Details</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Full Address</h4>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium">
                                        {property.location?.address}<br />
                                        {property.location?.city}, {property.location?.state}<br />
                                        Pin Code: {property.location?.pincode}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Posted on</span>
                                            <span className="text-sm font-bold">{property.createdAt ? format(new Date(property.createdAt), 'MMM dd, yyyy') : 'Recently'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Total Views</span>
                                            <span className="text-sm font-bold">{property.views || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Property ID</span>
                                            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{propertyId.toString().slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Actions & Agent */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            {/* Primary Action Card */}
                            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-black mb-6 tracking-tight">Direct Contact</h3>
                                
                                <div className="space-y-4">
                                    <button
                                        onClick={handleWhatsApp}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/20"
                                    >
                                        <FaWhatsapp size={24} />
                                        WhatsApp Chat
                                    </button>
                                    
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                                            <span className="px-3 bg-white dark:bg-gray-800 text-gray-400">or send inquiry</span>
                                        </div>
                                    </div>

                                    {showContactForm ? (
                                        <form onSubmit={handleContactSubmit} className="space-y-4 animate-fadeIn">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={contactForm.name}
                                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <input
                                                    type="email"
                                                    value={contactForm.email}
                                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                                                    placeholder="Email Address"
                                                />
                                                <input
                                                    type="tel"
                                                    value={contactForm.phone}
                                                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                                    required
                                                    pattern="[0-9]{10}"
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                                                    placeholder="10-digit Phone"
                                                />
                                            </div>
                                            <textarea
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                required
                                                rows="3"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium resize-none"
                                                placeholder="Interested in this property..."
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending}
                                                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20"
                                            >
                                                {sending ? 'Processing...' : 'Send Message'}
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setShowContactForm(true)}
                                            className="w-full bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all hover:bg-gray-800"
                                        >
                                            <FiUser />
                                            Contact Agent
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Agent Branding */}
                            {property.createdBy && (
                                <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-1 rounded-3xl shadow-xl shadow-primary-600/20">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-[calc(1.5rem-1px)]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                <FiUser className="text-primary-600 text-2xl" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black truncate dark:text-white">{property.createdBy.name}</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Certified Agent</p>
                                            </div>
                                        </div>
                                    </div>
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