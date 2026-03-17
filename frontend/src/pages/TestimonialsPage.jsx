import React from 'react';
import { Helmet } from 'react-helmet-async';
import Testimonials from '../components/home/Testimonials';
import { motion } from 'framer-motion';

const TestimonialsPage = () => {
    return (
        <>
            <Helmet>
                <title>Client Testimonials | EstateElite</title>
                <meta name="description" content="Read what our satisfied clients have to say about buying, selling, and renting properties with EstateElite." />
            </Helmet>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen"
            >
                {/* Premium Header */}
                <div className="bg-gradient-to-r from-gray-900 via-primary-900 to-gray-900 text-white py-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="container-custom relative z-10 text-center">
                        <motion.h1 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Client Success Stories
                        </motion.h1>
                        <motion.p 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-gray-200 max-w-2xl mx-auto"
                        >
                            Don't just take our word for it. Discover how EstateElite has helped thousands of Indian families find their perfect home.
                        </motion.p>
                    </div>
                </div>

                <div className="pb-16">
                    <Testimonials />
                </div>
            </motion.div>
        </>
    );
};

export default TestimonialsPage;
