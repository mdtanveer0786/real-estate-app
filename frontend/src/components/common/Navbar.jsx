import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInfo, FiMessageCircle } from 'react-icons/fi';
import {
    FiMenu, FiX, FiSun, FiMoon, FiUser, FiHeart,
    FiLogOut, FiHome, FiSearch, FiStar, FiPhone
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: FiHome },
        { name: 'Properties', path: '/properties', icon: FiSearch },
        { name: 'About', path: '/about', icon: FiInfo },
        { name: 'Contact', path: '/contact', icon: FiMessageCircle },
        { name: 'Wishlist', path: '/wishlist', icon: FiHeart, protected: true },
        { name: 'Admin', path: '/admin', icon: FiStar, admin: true },
    ];

    const filteredLinks = navLinks.filter(link => {
        if (link.admin) return isAdmin;
        if (link.protected) return isAuthenticated;
        return true;
    });

    return (
        <>
            <nav className={`fixed w-full z-[999] transition-all duration-300 ${scrolled
                ? 'bg-white dark:bg-gray-900 shadow-lg py-3'
                : 'bg-transparent py-5'
                }`}>
                <div className="container-custom">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center space-x-2 group"
                        >
                            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                                EstateElite
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1">
                            {filteredLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${location.pathname === link.path
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <link.icon className="text-lg" />
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Right Icons */}
                        <div className="hidden lg:flex items-center space-x-3">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                aria-label="Toggle theme"
                            >
                                {darkMode ?
                                    <FiSun className="text-yellow-400 text-xl" /> :
                                    <FiMoon className="text-gray-600 text-xl" />
                                }
                            </button>

                            {isAuthenticated ? (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden xl:block">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all duration-300"
                                        aria-label="Logout"
                                    >
                                        <FiLogOut className="text-xl" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-all duration-300 font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn-primary"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween' }}
                            className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl lg:hidden overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-8">
                                    <span className="text-2xl font-bold text-primary-600">EstateElite</span>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                {/* Mobile Navigation Links */}
                                <div className="space-y-2">
                                    {filteredLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${location.pathname === link.path
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <link.icon className="text-xl" />
                                            <span>{link.name}</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Mobile User Section */}
                                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                    {isAuthenticated ? (
                                        <div className="space-y-4">
                                            <Link
                                                to="/profile"
                                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user?.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                                </div>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                                            >
                                                <FiLogOut />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Link
                                                to="/login"
                                                className="block w-full text-center px-4 py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Register
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Theme Toggle */}
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={toggleDarkMode}
                                        className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                                    >
                                        {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-600" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;