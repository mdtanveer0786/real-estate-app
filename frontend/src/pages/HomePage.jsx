import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/home/HeroSection';
import PropertySearch from '../components/home/PropertySearch';
import FeaturedProperties from '../components/home/FeaturedProperties';
import Testimonials from '../components/home/Testimonials';
import { motion } from 'framer-motion';

const HomePage = () => {
    return (
        <>
            <Helmet>
                <title>EstateElite - Find Your Dream Property</title>
                <meta name="description" content="Discover the best properties for sale and rent. Find your dream home with EstateElite." />
            </Helmet>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <HeroSection />
                <PropertySearch />
                <FeaturedProperties />
                <Testimonials />
            </motion.div>
        </>
    );
};

export default HomePage;