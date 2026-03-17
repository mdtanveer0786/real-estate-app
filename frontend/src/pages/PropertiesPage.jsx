import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyList from '../components/properties/PropertyList';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { motion } from 'framer-motion';

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
            <Helmet>
                <title>Properties for Sale and Rent | EstateElite</title>
                <meta name="description" content="Browse our extensive collection of properties for sale and rent. Find your perfect home with advanced filters." />
            </Helmet>

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