import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiSearch } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
    return (
        <>
            <Helmet>
                <title>Page Not Found | EstateElite</title>
                <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
            </Helmet>

            <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg"
                >
                    <div className="text-8xl font-bold text-primary-600 mb-4">404</div>
                    <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Oops! The page you're looking for doesn't exist or has been moved.
                        Don't worry, you can find your way back home.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="btn-primary inline-flex items-center justify-center gap-2"
                        >
                            <FiHome />
                            Go to Homepage
                        </Link>
                        <Link
                            to="/properties"
                            className="btn-secondary inline-flex items-center justify-center gap-2"
                        >
                            <FiSearch />
                            Browse Properties
                        </Link>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default NotFoundPage;