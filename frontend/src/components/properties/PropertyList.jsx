import React from 'react';
import PropertyCard from './PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../common/Pagination';

const PropertyList = ({ properties, totalPages, currentPage, onPageChange }) => {
    if (properties.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold mb-2">No properties found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    We couldn't find any properties matching your current filters. Try broadening your search.
                </p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-6 text-primary-600 font-semibold hover:underline"
                >
                    Reset all filters
                </button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Results Info */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    Showing <span className="text-primary-600 font-bold">{properties.length}</span> properties
                </p>
                <div className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                </div>
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                    {properties.map((property, index) => (
                        <motion.div
                            key={property._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <PropertyCard property={property} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Enhanced Pagination */}
            <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
};

export default PropertyList;