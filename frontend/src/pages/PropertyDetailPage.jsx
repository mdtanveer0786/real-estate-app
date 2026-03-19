import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { motion } from 'framer-motion';
import { FiMapPin, FiHome, FiMaximize, FiArrowLeft } from 'react-icons/fi';
import { IoBedOutline, IoWaterOutline } from 'react-icons/io5';
import api from '../services/api';
import Loader from '../components/common/Loader';
import ImageGallery from '../components/properties/ImageGallery';
import ContactForm from '../components/properties/ContactForm';
import { formatPrice } from '../utils/helpers';

const PropertyDetailPage = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState('');

    // Smart back navigation: go back in history or fallback to /properties
    const goBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/properties');
        }
    };

    const fetchProperty = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/properties/${id}`);
            setProperty(data.property);
        } catch (err) {
            setError(err.response?.data?.error || 'Property not found.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchProperty(); }, [fetchProperty]);

    if (loading) return <Loader />;

    if (error || !property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 pt-24">
                <p className="text-red-500 text-lg">{error || 'Property not found.'}</p>
                <button onClick={goBack} className="btn-primary flex items-center gap-2">
                    <FiArrowLeft /> Go Back
                </button>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title={property.title} 
                description={property.description?.slice(0, 155)}
                image={property.images?.[0]?.url}
            />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 sm:pt-24">
                {/* Back button */}
                <div className="container-custom pb-2 px-3 sm:px-4">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition text-sm py-2"
                    >
                        <FiArrowLeft /> Back to Properties
                    </button>
                </div>

                <div className="container-custom px-3 sm:px-4 pb-8 sm:pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Gallery */}
                            <ImageGallery images={property.images} title={property.title} />

                            {/* Title & Price */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 border border-gray-100 dark:border-gray-800"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div className="space-y-2">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight dark:text-white">{property.title}</h1>
                                        <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium">
                                            <FiMapPin className="text-primary-600" />
                                            {property.location?.address}, {property.location?.city}
                                        </p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-3xl sm:text-4xl font-black text-primary-600">
                                            {formatPrice(property.price)}
                                            {property.type === 'rent' && <span className="text-sm font-bold text-gray-400 ml-1">/mo</span>}
                                        </p>
                                        <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                                            property.type === 'buy'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            For {property.type === 'buy' ? 'Sale' : 'Rent'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 sm:gap-6 py-6 border-y border-gray-100 dark:border-gray-700/50 my-6">
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                            <IoBedOutline className="text-primary-600 text-xl sm:text-2xl" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-black dark:text-white">{property.bedrooms} <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Beds</span></span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                            <IoWaterOutline className="text-primary-600 text-xl sm:text-2xl" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-black dark:text-white">{property.bathrooms} <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Baths</span></span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                            <FiMaximize className="text-primary-600 text-xl sm:text-2xl" />
                                        </div>
                                        <span className="text-xs sm:text-sm font-black dark:text-white">{property.area?.value} <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{property.area?.unit}</span></span>
                                    </div>
                                </div>

                                {/* Description */}
                                <h2 className="text-lg sm:text-xl font-black mb-4 tracking-tight dark:text-white">Property Overview</h2>
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line font-medium">
                                    {property.description}
                                </p>

                                {/* Features */}
                                {property.features?.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-lg sm:text-xl font-black mb-4 tracking-tight dark:text-white">Amenities & Features</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {property.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-primary-100 dark:hover:border-primary-900">
                                                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <ContactForm property={property} />

                            {/* Property info card */}
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-black mb-6 tracking-tight dark:text-white">Quick Details</h3>
                                <div className="space-y-4 text-sm font-bold">
                                    <div className="flex justify-between items-center"><span className="text-gray-400 uppercase tracking-widest text-[10px]">Type</span><span className="capitalize text-primary-600">{property.propertyType}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400 uppercase tracking-widest text-[10px]">Status</span><span className="capitalize text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">{property.status}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400 uppercase tracking-widest text-[10px]">Location</span><span className="text-gray-700 dark:text-gray-300">{property.location?.city}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400 uppercase tracking-widest text-[10px]">Pin Code</span><span className="text-gray-700 dark:text-gray-300">{property.location?.pincode}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-gray-400 uppercase tracking-widest text-[10px]">Views</span><span className="text-gray-700 dark:text-gray-300">{property.views} Views</span></div>
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
