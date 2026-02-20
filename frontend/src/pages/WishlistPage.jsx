import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiLoader } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import PropertyCard from '../components/properties/PropertyCard';

const WishlistPage = () => {
    const { wishlist, loading, removeFromWishlist } = useWishlist();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FiLoader className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading your wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>My Wishlist | EstateElite</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container-custom">
                    <h1 className="text-3xl font-bold mb-8">My Saved Properties</h1>

                    {!wishlist || wishlist.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center"
                        >
                            <FiHeart className="mx-auto text-6xl text-gray-400 mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">No saved properties yet</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Start browsing and save your favorite properties to view them later
                            </p>
                            <Link to="/properties" className="btn-primary inline-block">
                                Browse Properties
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.map((property) => (
                                <div key={property._id} className="relative group">
                                    <PropertyCard property={property} />
                                    <button
                                        onClick={() => removeFromWishlist(property._id)}
                                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                                        title="Remove from wishlist"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default WishlistPage;