import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Import local images
import hero1 from '../../assets/hero/hero1.webp';
import hero2 from '../../assets/hero/hero2.webp';
import hero3 from '../../assets/hero/hero3.webp';

const HeroSection = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('buy');
    const [currentSlide, setCurrentSlide] = useState(0);

    const backgroundImages = [hero1, hero2, hero3];

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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <div className="relative z-10 container-custom text-center text-white px-4">
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
                        className="inline-block bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-6 border border-white/10"
                    >
                        <span className="text-[10px] sm:text-xs md:text-sm font-bold tracking-wider uppercase">🏆 India's Most Trusted Platform</span>
                    </motion.div>

                    {/* Main Heading */}
                    <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight drop-shadow-lg">
                        Find Your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-300">
                            Dream Home
                        </span>
                    </h1>

                    <p className="text-base sm:text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
                        Discover the perfect property from our curated collection of luxury homes, premium apartments, and villas across India.
                    </p>

                    {/* Search Bar - Refined for mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-5 mb-12 border border-white/20 shadow-2xl"
                    >
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 sm:gap-4">
                            <div className="flex-1 relative group">
                                <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-500 text-xl group-focus-within:scale-110 transition-transform" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="City, locality or project..."
                                    className="w-full pl-12 pr-4 py-4 rounded-xl sm:rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all font-medium"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSearchType('buy')}
                                    className={`flex-1 px-4 sm:px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 ${searchType === 'buy'
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                                        }`}
                                >
                                    Buy
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSearchType('rent')}
                                    className={`flex-1 px-4 sm:px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 ${searchType === 'rent'
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                            : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                                        }`}
                                >
                                    Rent
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="md:px-10 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl sm:rounded-2xl font-bold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 group"
                            >
                                <FiSearch className="text-xl group-hover:scale-110 transition-transform" />
                                <span className="md:hidden lg:inline">Search Now</span>
                                <span className="hidden md:inline lg:hidden">Go</span>
                            </button>
                        </form>
                    </motion.div>

                    {/* Stats - Grid refined for small mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
                    >
                        <div className="text-center group bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-black/40 transition-all duration-300">
                            <div className="text-2xl sm:text-4xl font-black text-primary-400 mb-1 drop-shadow-md group-hover:scale-110 transition-transform">5000+</div>
                            <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-200">Properties</div>
                        </div>
                        <div className="text-center group bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-black/40 transition-all duration-300">
                            <div className="text-2xl sm:text-4xl font-black text-primary-400 mb-1 drop-shadow-md group-hover:scale-110 transition-transform">1000+</div>
                            <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-200">Happy Clients</div>
                        </div>
                        <div className="text-center group bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-black/40 transition-all duration-300">
                            <div className="text-2xl sm:text-4xl font-black text-primary-400 mb-1 drop-shadow-md group-hover:scale-110 transition-transform">Top 50</div>
                            <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-200">Cities Ranked</div>
                        </div>
                        <div className="text-center group bg-black/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-black/40 transition-all duration-300">
                            <div className="text-2xl sm:text-4xl font-black text-primary-400 mb-1 drop-shadow-md group-hover:scale-110 transition-transform">RERA</div>
                            <div className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-gray-200">Verified</div>
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