import React from 'react';
import PropertyCard from './PropertyCard';
import { motion, AnimatePresence } from 'framer-motion';

const PropertyList = ({ properties, totalPages, currentPage, onPageChange }) => {
    if (properties.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Results Count */}
            <div className="mb-4 text-gray-600 dark:text-gray-400">
                Found {properties.length} properties
            </div>

            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {properties.map((property) => (
                        <PropertyCard key={property._id} property={property} />
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => onPageChange(i + 1)}
                            className={`px-4 py-2 rounded-lg transition ${currentPage === i + 1
                                    ? 'bg-primary-600 text-white'
                                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PropertyList;