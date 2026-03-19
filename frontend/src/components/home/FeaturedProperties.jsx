import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyCard from '../properties/PropertyCard';
import PropertyDetails from '../properties/PropertyDetails';
import api from '../../services/api';
import Loader from '../common/Loader';

const FeaturedProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState(null);

    useEffect(() => {
        fetchFeaturedProperties();
    }, []);

    const fetchFeaturedProperties = async () => {
        try {
            const { data } = await api.get('/properties?limit=6&sort=-views');
            setProperties(data.properties);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <section className="py-16 bg-white dark:bg-gray-900">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Discover our hand-picked selection of premium properties that offer exceptional value and luxury living
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property, index) => (
                        <motion.div
                            key={property._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <PropertyCard 
                                property={property} 
                                onClick={() => setSelectedProperty(property)}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link to="/properties" className="btn-primary inline-block">
                        View All Properties
                    </Link>
                </div>
            </div>

            {/* Property Details Modal */}
            <AnimatePresence>
                {selectedProperty && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/80 backdrop-blur-md overflow-hidden">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl no-scrollbar bg-white dark:bg-gray-900 relative"
                        >
                            <PropertyDetails 
                                property={selectedProperty} 
                                onClose={() => setSelectedProperty(null)} 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default FeaturedProperties;