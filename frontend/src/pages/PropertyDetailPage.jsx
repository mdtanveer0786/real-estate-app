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

    const fetchProperty = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/properties/${id}`);
            setProperty(data);
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
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
                <p className="text-red-500 text-lg">{error || 'Property not found.'}</p>
                <button onClick={() => navigate(-1)} className="btn-primary flex items-center gap-2">
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

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Back button */}
                <div className="container-custom pt-6 pb-2 px-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition text-sm"
                    >
                        <FiArrowLeft /> Back to Properties
                    </button>
                </div>

                <div className="container-custom px-4 pb-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Gallery */}
                            <ImageGallery images={property.images} title={property.title} />

                            {/* Title & Price */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{property.title}</h1>
                                        <p className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <FiMapPin className="text-primary-600" />
                                            {property.location?.address}, {property.location?.city}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-primary-600">
                                            {formatPrice(property.price)}
                                            {property.type === 'rent' && <span className="text-base font-normal text-gray-500">/mo</span>}
                                        </p>
                                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                            property.type === 'buy'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                            For {property.type === 'buy' ? 'Sale' : 'Rent'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100 dark:border-gray-700 my-4">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <IoBedOutline className="text-primary-600 text-xl" />
                                        <span><strong>{property.bedrooms}</strong> Beds</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <IoWaterOutline className="text-primary-600 text-xl" />
                                        <span><strong>{property.bathrooms}</strong> Baths</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <FiMaximize className="text-primary-600 text-xl" />
                                        <span><strong>{property.area?.value}</strong> {property.area?.unit}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <h2 className="text-lg font-semibold mb-2">Description</h2>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                    {property.description}
                                </p>

                                {/* Features */}
                                {property.features?.length > 0 && (
                                    <div className="mt-6">
                                        <h2 className="text-lg font-semibold mb-3">Features & Amenities</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {property.features.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />
                                                    {f}
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
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-sm space-y-3">
                                <h3 className="font-semibold text-base">Property Details</h3>
                                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between"><span>Type</span><span className="font-medium capitalize">{property.propertyType}</span></div>
                                    <div className="flex justify-between"><span>Status</span><span className="font-medium capitalize">{property.status}</span></div>
                                    <div className="flex justify-between"><span>City</span><span className="font-medium">{property.location?.city}</span></div>
                                    <div className="flex justify-between"><span>Pincode</span><span className="font-medium">{property.location?.pincode}</span></div>
                                    <div className="flex justify-between"><span>Views</span><span className="font-medium">{property.views}</span></div>
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
