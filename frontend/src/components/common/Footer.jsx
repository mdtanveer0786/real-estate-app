import React from 'react';
import { Link } from 'react-router-dom';
import {
    FiFacebook, FiTwitter, FiInstagram, FiYoutube,
    FiMail, FiPhone, FiMapPin, FiArrowUp
} from 'react-icons/fi';

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-gray-900 text-white relative">
            {/* Scroll to top button */}
            <button
                onClick={scrollToTop}
                className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1"
                aria-label="Scroll to top"
            >
                <FiArrowUp className="text-xl" />
            </button>

            <div className="container-custom pt-16 pb-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                            EstateElite
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            Your trusted partner in finding the perfect property. We make real estate simple, transparent, and enjoyable.
                        </p>
                        <div className="flex space-x-3">
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                                aria-label="Facebook"
                            >
                                <FiFacebook />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                                aria-label="Twitter"
                            >
                                <FiTwitter />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                                aria-label="Instagram"
                            >
                                <FiInstagram />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                                aria-label="YouTube"
                            >
                                <FiYoutube />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/properties" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Properties
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Property Types */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Property Types</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/properties?type=buy" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Buy
                                </Link>
                            </li>
                            <li>
                                <Link to="/properties?type=rent" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Rent
                                </Link>
                            </li>
                            <li>
                                <Link to="/properties?propertyType=apartment" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Apartments
                                </Link>
                            </li>
                            <li>
                                <Link to="/properties?propertyType=house" className="text-gray-400 hover:text-primary-400 transition flex items-center group">
                                    <span className="w-0 group-hover:w-2 h-0.5 bg-primary-400 mr-0 group-hover:mr-2 transition-all"></span>
                                    Houses
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3 text-gray-400">
                                <FiMapPin className="mt-1 flex-shrink-0" />
                                <span>123 Business Avenue, Koramangala, Bangalore - 560034</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400">
                                <FiPhone className="flex-shrink-0" />
                                <a href="tel:+918252574386" className="hover:text-primary-400 transition">
                                    +91 8252574386
                                </a>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-400">
                                <FiMail className="flex-shrink-0" />
                                <a href="mailto:realestateeliteteam01@gmail.com" className="hover:text-primary-400 transition">
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
                        <div className="flex space-x-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                Terms of Service
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;