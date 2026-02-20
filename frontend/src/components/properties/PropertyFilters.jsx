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
            {/* Mobile Filter Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed bottom-4 right-4 z-40 bg-primary-600 text-white p-4 rounded-full shadow-lg"
            >
                <FiFilter size={24} />
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
                <FilterContent
                    filters={localFilters}
                    handleChange={handleChange}
                    applyFilters={applyFilters}
                    clearFilters={clearFilters}
                />
            </div>

            {/* Mobile Filter Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />

                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween' }}
                            className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl p-6 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Filters</h3>
                                <button onClick={() => setIsOpen(false)}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <FilterContent
                                filters={localFilters}
                                handleChange={handleChange}
                                applyFilters={() => {
                                    applyFilters();
                                    setIsOpen(false);
                                }}
                                clearFilters={clearFilters}
                            />
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