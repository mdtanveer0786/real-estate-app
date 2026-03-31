import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMapPin, FiHome, FiMaximize, FiArrowLeft,
    FiEye, FiStar, FiHeart, FiShare2, FiChevronDown, FiChevronUp,
    FiCheck, FiTrash2, FiEdit3
} from 'react-icons/fi';
import { IoBedOutline, IoWaterOutline } from 'react-icons/io5';
import api from '../services/api';
import Loader from '../components/common/Loader';
import ImageGallery from '../components/properties/ImageGallery';
import ContactForm from '../components/properties/ContactForm';
import SEO from '../components/common/SEO';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmtPrice = (n) => {
    if (!n) return 'Contact for Price';
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
    return '₹' + n.toLocaleString('en-IN');
};

const AMENITY_ICONS = {
    parking: '🅿️', gym: '🏋️', pool: '🏊', garden: '🌳',
    security: '🔒', elevator: '🛗', power_backup: '⚡',
    water_supply: '💧', clubhouse: '🏠', playground: '🎮',
    wifi: '📶', ac: '❄️', furnished: '🛋️', pet_friendly: '🐾',
    balcony: '🌅', terrace: '☀️', storage: '📦', cctv: '📹', intercom: '📞',
};

/* ─── Stars ──────────────────────────────────────────────────────────────── */
const Stars = ({ rating, size = 4, interactive = false, onRate }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <button key={i}
                type={interactive ? 'button' : undefined}
                onClick={() => interactive && onRate?.(i)}
                className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform min-h-0`}
            >
                <FiStar className={`w-${size} h-${size} ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
            </button>
        ))}
    </div>
);

/* ─── Review form ─────────────────────────────────────────────────────────── */
const ReviewForm = ({ propertyId, onSubmitted }) => {
    const { isAuthenticated } = useAuth();
    const [rating,  setRating]  = useState(0);
    const [title,   setTitle]   = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hover,   setHover]   = useState(0);

    if (!isAuthenticated) return (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            <a href="/login" className="text-primary-600 font-semibold hover:underline">Sign in</a> to leave a review.
        </p>
    );

    const submit = async (e) => {
        e.preventDefault();
        if (!rating) { toast.error('Please select a star rating'); return; }
        if (!comment.trim()) { toast.error('Please write a comment'); return; }
        setLoading(true);
        try {
            await api.post(`/reviews/${propertyId}`, { rating, title, comment });
            toast.success('Review submitted! Thank you.');
            setRating(0); setTitle(''); setComment('');
            onSubmitted?.();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review');
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            {/* Star picker */}
            <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Your Rating *</p>
                <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                        <button key={i} type="button"
                            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(i)}
                            className="p-0.5 min-h-0">
                            <FiStar className={`w-7 h-7 transition-colors ${i <= (hover || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        </button>
                    ))}
                    {rating > 0 && <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 self-center">{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</span>}
                </div>
            </div>
            <div>
                <label className="input-label">Title (optional)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarise your experience"
                    className="input-field" maxLength={100} />
            </div>
            <div>
                <label className="input-label">Review *</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share details about your experience..."
                    className="input-field resize-none" rows={3} maxLength={1000} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Submitting…' : 'Submit Review'}
            </button>
        </form>
    );
};

/* ─── Reviews list ────────────────────────────────────────────────────────── */
const ReviewsList = ({ propertyId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [total,   setTotal]   = useState(0);
    const [loading, setLoading] = useState(true);
    const [page,    setPage]    = useState(1);
    const [showForm, setShowForm] = useState(false);

    const fetch = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/reviews/${propertyId}?page=${p}`);
            setReviews(prev => p === 1 ? (data.reviews || []) : [...prev, ...(data.reviews || [])]);
            setTotal(data.total || 0);
            setPage(p);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [propertyId]);

    useEffect(() => { fetch(1); }, [fetch]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await api.delete(`/reviews/${id}`);
            toast.success('Review deleted');
            fetch(1);
        } catch { toast.error('Failed to delete'); }
    };

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight dark:text-white">Reviews</h2>
                    {avgRating && (
                        <div className="flex items-center gap-2 mt-1">
                            <Stars rating={Math.round(Number(avgRating))} />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{avgRating}</span>
                            <span className="text-xs text-gray-400">({total} review{total !== 1 ? 's' : ''})</span>
                        </div>
                    )}
                </div>
                <button onClick={() => setShowForm(p => !p)}
                    className="btn-outline text-sm self-start sm:self-auto flex items-center gap-2">
                    <FiEdit3 className="w-4 h-4" />
                    {showForm ? 'Cancel' : 'Write a Review'}
                </button>
            </div>

            {/* Review form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <ReviewForm propertyId={propertyId} onSubmitted={() => { setShowForm(false); fetch(1); }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews */}
            {loading && reviews.length === 0 ? (
                <div className="space-y-4">
                    {[1,2].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
                            <div className="flex-1 space-y-2"><div className="h-3 skeleton rounded w-1/3" /><div className="h-3 skeleton rounded w-full" /></div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                    <FiStar className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {reviews.map(r => (
                        <div key={r._id} className="flex gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                                {r.user?.avatar ? <img src={r.user.avatar} alt="" className="w-full h-full object-cover" /> : r.user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{r.user?.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Stars rating={r.rating} size={3} />
                                            <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    </div>
                                    {(user?._id === r.user?._id || user?.role === 'admin') && (
                                        <button onClick={() => handleDelete(r._id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0 min-h-0">
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                {r.title && <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{r.title}</p>}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{r.comment}</p>
                            </div>
                        </div>
                    ))}

                    {/* Load more */}
                    {reviews.length < total && (
                        <button onClick={() => fetch(page + 1)} disabled={loading}
                            className="w-full py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-700 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors min-h-0 flex items-center justify-center gap-2">
                            {loading ? <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /> : <>Load More <FiChevronDown className="w-4 h-4" /></>}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const PropertyDetailPage = () => {
    const { id }   = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const [property,  setProperty]  = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState('');
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const goBack = () => window.history.length > 2 ? navigate(-1) : navigate('/properties');

    const fetchProperty = useCallback(async () => {
        if (!id) return;
        setLoading(true); setError('');
        try {
            const { data } = await api.get(`/properties/${id}`);
            setProperty(data.property);
        } catch (err) {
            setError(err.response?.data?.error || 'Property not found.');
        } finally { setLoading(false); }
    }, [id]);

    useEffect(() => { fetchProperty(); }, [fetchProperty]);

    const handleWishlist = async () => {
        if (!isAuthenticated) { toast.error('Please login to save properties'); navigate('/login'); return; }
        setWishlistLoading(true);
        try {
            if (isInWishlist(property._id)) {
                await removeFromWishlist(property._id);
                toast.success('Removed from wishlist');
            } else {
                await addToWishlist(property._id);
                toast.success('Saved to wishlist ❤️');
            }
        } finally { setWishlistLoading(false); }
    };

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: property.title, text: `Check out this property: ${property.title}`, url });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success('Link copied to clipboard!');
            }
        } catch { /* user cancelled */ }
    };

    if (loading) return <Loader />;
    if (error || !property) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
            <FiHome className="w-12 h-12 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400">{error || 'Property not found.'}</p>
            <button onClick={goBack} className="btn-primary flex items-center gap-2"><FiArrowLeft /> Go Back</button>
        </div>
    );

    const inWishlist = isInWishlist(property._id);

    return (
        <>
            <SEO title={`${property.title} | EstateElite`} description={property.description?.slice(0, 155)} image={property.images?.[0]?.url} />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-3 sm:pt-5 pb-12">
                {/* Back + actions bar */}
                <div className="container-custom mb-3 flex items-center justify-between gap-3">
                    <button onClick={goBack}
                        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium min-h-0">
                        <FiArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={handleShare}
                            className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 transition-colors min-h-0 shadow-sm">
                            <FiShare2 className="w-4 h-4" />
                        </button>
                        <button onClick={handleWishlist} disabled={wishlistLoading}
                            className={`p-2 rounded-xl border transition-all min-h-0 shadow-sm ${inWishlist ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500'}`}>
                            <FiHeart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="container-custom">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">

                        {/* ── Main col ──────────────────────────────────── */}
                        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                            <ImageGallery images={property.images} title={property.title} />

                            {/* Title & Price */}
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 sm:p-8">

                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest ${
                                                property.type === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>For {property.type === 'buy' ? 'Sale' : 'Rent'}</span>
                                            {property.featured && <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">★ Featured</span>}
                                        </div>
                                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">{property.title}</h1>
                                        <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                                            <FiMapPin className="text-primary-600 flex-shrink-0 w-4 h-4" />
                                            {property.location?.address}, {property.location?.city}, {property.location?.state}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-2xl sm:text-3xl font-black text-primary-600">{fmtPrice(property.price)}</p>
                                        {property.type === 'rent' && <span className="text-xs text-gray-400 font-semibold">/month</span>}
                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                            <FiEye className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-400">{property.views || 0} views</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 py-5 border-y border-gray-100 dark:border-gray-700/60">
                                    {[
                                        { icon: <IoBedOutline className="text-primary-600 text-lg sm:text-xl" />, val: property.bedrooms, label: 'Beds' },
                                        { icon: <IoWaterOutline className="text-primary-600 text-lg sm:text-xl" />, val: property.bathrooms, label: 'Baths' },
                                        { icon: <FiMaximize className="text-primary-600 text-lg sm:text-xl" />, val: `${property.area?.value}`, label: property.area?.unit },
                                    ].map(({ icon, val, label }) => (
                                        <div key={label} className="flex flex-col items-center gap-2 text-center">
                                            <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl">{icon}</div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">{val}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Description */}
                                <div className="mt-6">
                                    <h2 className="text-base sm:text-lg font-black mb-3 text-gray-900 dark:text-white">About This Property</h2>
                                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{property.description}</p>
                                </div>

                                {/* Amenities */}
                                {property.amenities?.length > 0 && (
                                    <div className="mt-6">
                                        <h2 className="text-base sm:text-lg font-black mb-3 text-gray-900 dark:text-white">Amenities</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {property.amenities.map(a => (
                                                <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-bold">
                                                    {AMENITY_ICONS[a] || '✓'} {a.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Features */}
                                {property.features?.length > 0 && (
                                    <div className="mt-6">
                                        <h2 className="text-base sm:text-lg font-black mb-3 text-gray-900 dark:text-white">Additional Features</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {property.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <FiCheck className="w-4 h-4 text-primary-500 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>

                            {/* Reviews section */}
                            <ReviewsList propertyId={id} />
                        </div>

                        {/* ── Sidebar ───────────────────────────────────── */}
                        <div className="space-y-5 sm:space-y-6">
                            {/* Contact form with chat */}
                            <div className="lg:sticky lg:top-[5.5rem]">
                                <ContactForm property={property} />

                                {/* Quick info */}
                                <div className="mt-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                                    <h3 className="text-sm font-black mb-4 text-gray-900 dark:text-white uppercase tracking-widest">Quick Details</h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Property Type', val: property.propertyType },
                                            { label: 'Listing Type',  val: property.type === 'buy' ? 'For Sale' : 'For Rent' },
                                            { label: 'Status',        val: property.status },
                                            { label: 'City',          val: property.location?.city },
                                            { label: 'Pin Code',      val: property.location?.pincode },
                                        ].map(({ label, val }) => val ? (
                                            <div key={label} className="flex items-center justify-between text-sm gap-3">
                                                <span className="text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-wider font-semibold">{label}</span>
                                                <span className="text-gray-800 dark:text-gray-200 font-bold capitalize truncate max-w-[55%] text-right">{val}</span>
                                            </div>
                                        ) : null)}
                                    </div>

                                    {/* Posted by */}
                                    {property.createdBy && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Listed By</p>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                                                    {property.createdBy.avatar
                                                        ? <img src={property.createdBy.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                                        : property.createdBy.name?.charAt(0)?.toUpperCase()
                                                    }
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{property.createdBy.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PropertyDetailPage;
