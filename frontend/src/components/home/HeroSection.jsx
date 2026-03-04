import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('buy');
    const [currentSlide, setCurrentSlide] = useState(0);

    const backgroundImages = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/properties?type=${searchType}&city=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Slider */}
            {backgroundImages.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ backgroundImage: `url(${img})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 container-custom text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6"
                    >
                        <span className="text-sm font-medium">🏆 India's Most Trusted Real Estate Platform</span>
                    </motion.div>

                    {/* Main Heading */}
                    <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
                        Find Your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                            Dream Home
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
                        Discover the perfect property from our extensive collection of 5000+ homes, apartments, and villas across India
                    </p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-12"
                    >
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Enter city, locality or project name"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSearchType('buy')}
                                    className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${searchType === 'buy'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    Buy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType('rent')}
                                    className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${searchType === 'rent'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    Rent
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="md:px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <FiSearch className="text-xl" />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </form>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
                    >
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-primary-400">5000+</div>
                            <div className="text-sm md:text-base text-gray-300">Properties</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-primary-400">1000+</div>
                            <div className="text-sm md:text-base text-gray-300">Happy Clients</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-primary-400">50+</div>
                            <div className="text-sm md:text-base text-gray-300">Cities</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-primary-400">24/7</div>
                            <div className="text-sm md:text-base text-gray-300">Support</div>
                        </div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    >
                        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                            <motion.div
                                animate={{ y: [0, 12, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1 h-3 bg-white rounded-full mt-2"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;