import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCpu, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PriceEstimator from '../components/ai/PriceEstimator';

const AIToolsPage = () => {
    const { isAuthenticated } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            setLoadingRecs(true);
            api.get('/ai/recommendations?limit=4')
                .then(({ data }) => setRecommendations(data.recommendations || []))
                .catch(() => {})
                .finally(() => setLoadingRecs(false));
        }
    }, [isAuthenticated]);

    const formatPrice = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Hero */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold mb-4"
                    >
                        <FiCpu className="w-4 h-4" />
                        AI-Powered Tools
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                        Smart Property Intelligence
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                        Get AI-powered price estimates, personalized recommendations, and market insights.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Price Estimator */}
                    <PriceEstimator />

                    {/* Recommendations */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FiStar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Recommended for You</h2>
                                    <p className="text-sm text-white/70">Based on your preferences</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">
                            {!isAuthenticated ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Log in to get personalized recommendations
                                    </p>
                                    <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                                        Sign In →
                                    </Link>
                                </div>
                            ) : loadingRecs ? (
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-20 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
                                    ))}
                                </div>
                            ) : recommendations.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <p>Add properties to your wishlist to get recommendations!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recommendations.map(prop => (
                                        <Link
                                            key={prop._id}
                                            to={`/property/${prop.slug || prop._id}`}
                                            className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                        >
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                                {prop.images?.[0]?.url ? (
                                                    <img src={prop.images[0].url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                                                    {prop.title}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{prop.location?.city}</p>
                                                <p className="text-sm font-bold text-primary-600 mt-1">
                                                    {formatPrice(prop.price)}
                                                </p>
                                            </div>
                                            <FiArrowRight className="w-4 h-4 text-gray-400 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIToolsPage;
