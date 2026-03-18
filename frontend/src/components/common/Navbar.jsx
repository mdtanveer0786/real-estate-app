import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiMenu, FiX, FiSun, FiMoon, FiHeart, 
    FiLogOut, FiHome, FiSearch, FiStar, FiInfo, FiMessageCircle,
    FiUser, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Prevent layout shift by adding padding equal to scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        // Cleanup function ensures body is unlocked if component unmounts while open
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    // Close menu on route change or resize
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768 && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen]);

    const toggleMenu = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/', icon: FiHome },
        { name: 'Properties', path: '/properties', icon: FiSearch },
        { name: 'About', path: '/about', icon: FiInfo },
        { name: 'Contact', path: '/contact', icon: FiMessageCircle },
        { name: 'FAQ', path: '/faq', icon: FiInfo },
    ];

    const authLinks = [
        { name: 'Wishlist', path: '/wishlist', icon: FiHeart, show: isAuthenticated },
        { name: 'Dashboard', path: '/admin', icon: FiStar, show: isAdmin },
        { name: 'Profile', path: '/profile', icon: FiUser, show: isAuthenticated },
    ];

    // Framer Motion Variants
    const menuVariants = {
        closed: {
            opacity: 0,
            y: "-100%",
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        },
        opened: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        closed: { opacity: 0, x: -20 },
        opened: { opacity: 1, x: 0 }
    };

    return (
        <header 
            className={`fixed top-0 left-0 w-full z-[1001] transition-all duration-500 ${
                scrolled 
                    ? 'py-3 bg-white/70 dark:bg-gray-950/70 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-b border-white/20 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60' 
                    : 'py-6 bg-transparent border-b border-transparent'
            }`}
        >
            <div className="container-custom">
                <nav className="flex justify-between items-center">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="relative z-[1002] flex items-center space-x-2.5 group"
                        onClick={() => setIsOpen(false)}
                    >
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 via-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 group-hover:-translate-y-0.5 transition-all duration-300 border border-white/20">
                            <FiHome className="text-white text-xl" />
                        </div>
                        <span className="text-2xl font-display font-black tracking-tight drop-shadow-sm">
                            <span className={scrolled ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white drop-shadow-md'}>Estate</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">Elite</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-5 py-2.5 rounded-full text-[15px] lg:text-base font-semibold transition-all duration-300 relative group ${
                                    location.pathname === link.path
                                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-primary-600'
                                }`}
                            >
                                <span>{link.name}</span>
                                {location.pathname !== link.path && (
                                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 group-hover:w-5" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? <FiSun className="text-yellow-500 text-xl" /> : <FiMoon className="text-xl" />}
                        </button>

                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {authLinks.filter(l => l.show && l.name !== 'Profile').map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 relative"
                                        title={link.name}
                                    >
                                        <link.icon className="text-xl" />
                                    </Link>
                                ))}
                                <NotificationBell />
                                <Link to="/profile" className="flex items-center space-x-2 pl-2 group">
                                    <div className="w-11 h-11 rounded-full border-2 border-transparent group-hover:border-primary-500 transition-all p-0.5">
                                        <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-base shadow-inner">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <FiLogOut className="text-xl" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="px-5 py-2.5 text-[15px] lg:text-base font-bold text-gray-700 dark:text-gray-200 hover:text-primary-600 transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/register" className="px-7 py-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[15px] lg:text-base font-bold hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-all shadow-lg shadow-gray-200 dark:shadow-none hover:-translate-y-0.5 active:translate-y-0">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="md:hidden flex items-center space-x-2 relative z-[1002]">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400"
                        >
                            {darkMode ? <FiSun className="text-yellow-500 text-xl" /> : <FiMoon className="text-xl" />}
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="p-2.5 rounded-xl text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                            aria-label="Toggle menu"
                        >
                            <div className="w-6 h-5 relative flex flex-col justify-between">
                                <motion.span 
                                    animate={{ 
                                        rotate: isOpen ? 45 : 0,
                                        y: isOpen ? 9 : 0,
                                        width: isOpen ? "100%" : "100%"
                                    }}
                                    className="block h-0.5 bg-current rounded-full origin-center transition-all duration-300"
                                />
                                <motion.span 
                                    animate={{ 
                                        opacity: isOpen ? 0 : 1,
                                        x: isOpen ? -20 : 0
                                    }}
                                    className="block h-0.5 w-2/3 bg-current rounded-full transition-all duration-300"
                                />
                                <motion.span 
                                    animate={{ 
                                        rotate: isOpen ? -45 : 0,
                                        y: isOpen ? -9 : 0,
                                        width: isOpen ? "100%" : "100%"
                                    }}
                                    className="block h-0.5 bg-current rounded-full origin-center transition-all duration-300"
                                />
                            </div>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Fullscreen */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="closed"
                        animate="opened"
                        exit="closed"
                        className="fixed inset-0 bg-white dark:bg-gray-950 z-[1000] md:hidden flex flex-col pt-32 pb-[calc(1rem+env(safe-area-inset-bottom))] px-6 overflow-y-auto min-h-screen"
                        style={{ height: '100dvh' }}
                    >
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="flex-1 space-y-8">
                            {/* Main Links */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase ml-4">Navigation</p>
                                {navLinks.map((link) => (
                                    <motion.div key={link.path} variants={itemVariants}>
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                                                location.pathname === link.path
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <link.icon className="text-xl" />
                                                <span className="text-xl font-semibold">{link.name}</span>
                                            </div>
                                            <FiArrowRight className={`transition-transform duration-300 ${location.pathname === link.path ? 'translate-x-0' : '-translate-x-4 opacity-0'}`} />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Account Links */}
                            <div className="space-y-4">
                                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase ml-4">Account</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {authLinks.filter(l => l.show).map((link) => (
                                        <motion.div key={link.path} variants={itemVariants}>
                                            <Link
                                                to={link.path}
                                                onClick={() => setIsOpen(false)}
                                                className="flex flex-col items-start p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                                            >
                                                <link.icon className="text-lg mb-2 text-primary-500" />
                                                <span className="text-sm font-bold">{link.name}</span>
                                            </Link>
                                        </motion.div>
                                    ))}
                                    {!isAuthenticated && (
                                        <>
                                            <motion.div variants={itemVariants} className="col-span-2">
                                                <Link
                                                    to="/login"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-center p-4 rounded-2xl bg-primary-600 text-white font-bold shadow-lg shadow-primary-500/20"
                                                >
                                                    Sign In
                                                </Link>
                                            </motion.div>
                                            <motion.div variants={itemVariants} className="col-span-2">
                                                <Link
                                                    to="/register"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-center p-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold"
                                                >
                                                    Create Account
                                                </Link>
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Footer */}
                        {isAuthenticated && (
                            <motion.div variants={itemVariants} className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 p-4 rounded-2xl text-red-500 bg-red-50 dark:bg-red-900/10 font-bold"
                                >
                                    <FiLogOut className="text-xl" />
                                    <span>Logout from Account</span>
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;