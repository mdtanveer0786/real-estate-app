import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiFacebook, FiTwitter, FiInstagram, FiYoutube,
    FiMail, FiPhone, FiMapPin, FiArrowUp, FiHome
} from 'react-icons/fi';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white mt-10 border-t border-gray-800">
            {/* Scroll to top button */}
            <button
                onClick={scrollToTop}
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white p-3.5 rounded-full shadow-xl shadow-primary-500/20 transition-all duration-300 hover:-translate-y-2 border-4 border-gray-50 dark:border-gray-900 z-10"
                aria-label="Scroll to top"
            >
                <FiArrowUp className="text-xl" />
            </button>

            {/* Top decorative line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600"></div>

            <div className="container-custom pt-20 pb-10 relative z-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-16">
                    {/* Company Info (Takes up more space) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <FiHome className="text-white text-lg" />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                                Estate<span className="text-primary-500">Elite</span>
                            </h3>
                        </div>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            India's most trusted real estate platform. We make finding your dream property simple, transparent, and completely hassle-free with expert guidance at every step.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex gap-3 pt-2">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-semibold text-gray-300 flex items-center gap-1.5 backdrop-blur-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                RERA Registered
                            </span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs font-semibold text-gray-300 flex items-center gap-1.5 backdrop-blur-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                ISO Certified
                            </span>
                        </div>

                        <div className="flex gap-3 pt-4">
                            {[
                                { icon: FiFacebook, label: 'Facebook' },
                                { icon: FiTwitter, label: 'Twitter' },
                                { icon: FiInstagram, label: 'Instagram' },
                                { icon: FiYoutube, label: 'YouTube' }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 bg-white/5 hover:bg-primary-600 border border-white/10 hover:border-primary-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/25 group"
                                    aria-label={social.label}
                                >
                                    <social.icon className="text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2 lg:ml-auto">
                        <h4 className="text-lg font-bold mb-6 text-white tracking-wide">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Properties', path: '/properties' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' },
                                { name: 'FAQ', path: '/faq' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.path} className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group text-sm font-medium">
                                        <span className="w-0 group-hover:w-3 h-[2px] bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Property Types */}
                    <div className="lg:col-span-2 lg:ml-auto">
                        <h4 className="text-lg font-bold mb-6 text-white tracking-wide">Properties</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Buy Property', path: '/properties?type=buy' },
                                { name: 'Rent Property', path: '/properties?type=rent' },
                                { name: 'Luxury Apartments', path: '/properties?propertyType=apartment' },
                                { name: 'Independent Villas', path: '/properties?propertyType=house' },
                                { name: 'Commercial Spaces', path: '/properties?propertyType=commercial' }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.path} className="text-gray-400 hover:text-primary-400 transition-colors flex items-center group text-sm font-medium">
                                        <span className="w-0 group-hover:w-3 h-[2px] bg-primary-500 mr-0 group-hover:mr-2 transition-all duration-300 rounded-full"></span>
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-4 lg:ml-auto">
                        <h4 className="text-lg font-bold mb-6 text-white tracking-wide">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 text-gray-400 group">
                                <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-colors flex-shrink-0">
                                    <FiMapPin className="text-lg text-primary-400" />
                                </div>
                                <span className="mt-1 text-sm leading-relaxed">123 Business Avenue, Koramangala, Bangalore - 560034</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400">
                                <FiPhone className="flex-shrink-0" />
                                <a href="tel:+918252574386" className="hover:text-primary-400 transition">
                                    +91 8252574386
                                </a>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400">
                                <FiMail className="flex-shrink-0" />
                                <a href="mailto:realestateeliteteam01@gmail.com" className="hover:text-primary-400 transition break-all">
                                    realestateeliteteam01@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <p className="text-gray-400 text-sm text-center sm:text-left">
                            © {new Date().getFullYear()} EstateElite. All rights reserved.
                        </p>
                        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm">
                            <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-400 hover:text-primary-400 transition">
                                Terms of Service
                            </Link>
                            <Link to="/privacy" className="text-gray-400 hover:text-primary-400 transition">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;