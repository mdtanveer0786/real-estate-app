import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/common/SEO';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyList from '../components/properties/PropertyList';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const PropertiesPage = () => {
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        city: searchParams.get('city') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bedrooms: '',
        sort: '-createdAt',
    });

    useEffect(() => {
        fetchProperties();
    }, [currentPage, filters]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                ...filters,
            });

            const { data } = await api.get(`/properties?${params}`);
            setProperties(data.properties);
            setTotalPages(data.pages);
        } catch (error) {
            toast.error('Failed to load properties. Please try again.');
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
        setCurrentPage(1);
    };

    return (
        <>
            <SEO 
                title="Properties for Sale and Rent" 
                description="Browse our extensive collection of properties for sale and rent. Find your perfect home with advanced filters."
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-8"
            >
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 text-white py-16 mb-8 relative overflow-hidden">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="container-custom relative z-10 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Premier Properties</h1>
                        <p className="text-lg text-gray-200 max-w-2xl mx-auto">Explore our curated selection of luxury homes, apartments, and commercial spaces across India's top cities.</p>
                    </div>
                </div>

                <div className="container-custom">

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <PropertyFilters filters={filters} onFilterChange={handleFilterChange} />
                        </div>

                        {/* Property List */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <Loader />
                            ) : properties.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                        <FiSearch className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Properties Found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md">Try adjusting your filters or search criteria to find what you're looking for.</p>
                                </div>
                            ) : (
                                <PropertyList
                                    properties={properties}
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default PropertiesPage;