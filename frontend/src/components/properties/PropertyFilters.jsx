import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';

const PropertyFilters = ({ filters, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
        setIsOpen(false);
    };

    const clearFilters = () => {
        const cleared = {
            type: '',
            city: '',
            minPrice: '',
            maxPrice: '',
            bedrooms: '',
            sort: '-createdAt',
        };
        setLocalFilters(cleared);
        onFilterChange(cleared);
    };

    return (
        <>
            {/* Mobile Filter Button - More prominent */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] flex items-center gap-2 border border-primary-500 animate-fade-in"
            >
                <FiFilter size={20} />
                <span className="font-bold text-sm">Filters</span>
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24 border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiFilter className="text-primary-600" />
                    Search Filters
                </h3>
                <FilterContent
                    filters={localFilters}
                    handleChange={handleChange}
                    applyFilters={applyFilters}
                    clearFilters={clearFilters}
                />
            </div>

            {/* Mobile Filter Modal - Improved layout */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] lg:hidden"
                    >
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 h-full w-full max-w-xs sm:max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-xl font-bold">Filters</h3>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="flex-1 p-6 overflow-y-auto">
                                <FilterContent
                                    filters={localFilters}
                                    handleChange={handleChange}
                                    applyFilters={() => {
                                        applyFilters();
                                        setIsOpen(false);
                                    }}
                                    clearFilters={clearFilters}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const FilterContent = ({ filters, handleChange, applyFilters, clearFilters }) => {
    return (
        <div className="space-y-6">
            {/* Property Type */}
            <div>
                <label className="block text-sm font-medium mb-2">Purpose</label>
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="">All</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                </select>
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="input-field"
                />
            </div>

            {/* Price Range */}
            <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleChange}
                        placeholder="Min"
                        className="input-field"
                    />
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleChange}
                        placeholder="Max"
                        className="input-field"
                    />
                </div>
            </div>

            {/* Bedrooms */}
            <div>
                <label className="block text-sm font-medium mb-2">Bedrooms</label>
                <select
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                </select>
            </div>

            {/* Sort By */}
            <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleChange}
                    className="input-field"
                >
                    <option value="-createdAt">Newest First</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-views">Most Viewed</option>
                </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
                <button
                    onClick={applyFilters}
                    className="flex-1 btn-primary"
                >
                    Apply Filters
                </button>
                <button
                    onClick={clearFilters}
                    className="flex-1 btn-secondary"
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default PropertyFilters;