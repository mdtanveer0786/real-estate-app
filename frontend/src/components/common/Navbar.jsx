import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMenu, FiX, FiSun, FiMoon, FiHeart,
    FiLogOut, FiHome, FiSearch, FiInfo, FiMessageCircle,
    FiUser, FiGrid, FiLayers, FiDollarSign, FiCpu
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
    { name: 'Home',       path: '/',           icon: FiHome },
    { name: 'Properties', path: '/properties', icon: FiSearch },
    { name: 'AI Tools',   path: '/ai-tools',   icon: FiCpu },
    { name: 'Pricing',    path: '/pricing',    icon: FiDollarSign },
    { name: 'About',      path: '/about',      icon: FiInfo },
    { name: 'Contact',    path: '/contact',    icon: FiMessageCircle },
];

const Navbar = () => {
    const [isOpen,   setIsOpen]   = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);

    const { user, logout, isAuthenticated, isAdmin, isAgent } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate  = useNavigate();
    const location  = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const sb = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow     = 'hidden';
            document.body.style.paddingRight = `${sb}px`;
        } else {
            document.body.style.overflow     = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow     = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    useEffect(() => { setIsOpen(false); }, [location.pathname]);

    useEffect(() => {
        const onResize = () => { if (window.innerWidth >= 1024) setIsOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const toggleMenu   = useCallback(() => setIsOpen(p => !p), []);
    const handleLogout = useCallback(() => {
        logout(); setIsOpen(false); navigate('/');
    }, [logout, navigate]);

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const DASH_LINKS = [
        { name: 'Wishlist',    path: '/wishlist', icon: FiHeart,  show: isAuthenticated && !isAdmin },
        { name: 'Admin Panel', path: '/admin',    icon: FiGrid,   show: isAdmin },
        { name: 'My Listings', path: '/agent',    icon: FiLayers, show: isAgent && !isAdmin },
        { name: 'Profile',     path: '/profile',  icon: FiUser,   show: isAuthenticated },
    ];

    const headerCls = [
        'fixed top-0 left-0 right-0 z-[999] transition-all duration-300',
        scrolled
            ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_24px_rgba(0,0,0,0.35)] border-b border-gray-200/50 dark:border-gray-800/50'
            : 'bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900',
    ].join(' ');

    return (
        <header className={headerCls}>
            <div className="container-custom">
                <nav className="flex items-center justify-between h-16 sm:h-[4.25rem]">

                    {/* Logo */}
                    <Link to="/" onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 sm:gap-2.5 shrink-0 group min-h-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/35 transition-shadow duration-300 shrink-0">
                            <FiHome className="text-white text-base sm:text-lg" />
                        </div>
                        <span className="text-[1.2rem] sm:text-xl font-display font-black tracking-tight leading-none">
                            <span className="text-gray-900 dark:text-white">Estate</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Elite</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {NAV_LINKS.map(link => (
                            <Link key={link.path} to={link.path}
                                className={[
                                    'px-3.5 py-2 rounded-full text-[13.5px] font-semibold transition-all duration-200 min-h-0',
                                    isActive(link.path)
                                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/25'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60',
                                ].join(' ')}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop right */}
                    <div className="hidden lg:flex items-center gap-1.5">
                        <button onClick={toggleDarkMode}
                            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
                            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-0">
                            {darkMode ? <FiSun className="w-[18px] h-[18px] text-amber-400" /> : <FiMoon className="w-[18px] h-[18px]" />}
                        </button>

                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />

                        {isAuthenticated ? (
                            <div className="flex items-center gap-0.5">
                                {DASH_LINKS.filter(l => l.show && l.name !== 'Profile').map(link => (
                                    <Link key={link.path} to={link.path} title={link.name}
                                        className={[
                                            'p-2 rounded-xl transition-colors min-h-0',
                                            isActive(link.path)
                                                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
                                        ].join(' ')}>
                                        <link.icon className="w-[18px] h-[18px]" />
                                    </Link>
                                ))}
                                <NotificationBell />
                                <Link to="/profile" title="Profile"
                                    className="ml-0.5 w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-primary-500/40 transition-shadow ring-2 ring-transparent hover:ring-primary-400/40 overflow-hidden min-h-0">
                                    {user?.avatar
                                        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
                                </Link>
                                <button onClick={handleLogout} title="Logout"
                                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-0">
                                    <FiLogOut className="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-1">
                                <Link to="/login"
                                    className="px-4 py-2 text-[13.5px] font-semibold text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-0">
                                    Sign in
                                </Link>
                                <Link to="/register"
                                    className="px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-[13.5px] font-bold shadow-md shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 hover:-translate-y-px active:translate-y-0 min-h-0">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile controls */}
                    <div className="lg:hidden flex items-center gap-0.5">
                        <button onClick={toggleDarkMode}
                            aria-label={darkMode ? 'Light mode' : 'Dark mode'}
                            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 min-h-0">
                            {darkMode ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5" />}
                        </button>
                        {isAuthenticated && <NotificationBell />}
                        <button onClick={toggleMenu}
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={isOpen}
                            className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-0">
                            <AnimatePresence mode="wait" initial={false}>
                                {isOpen
                                    ? <motion.span key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90,  opacity: 0 }} transition={{ duration: 0.15 }}><FiX    className="w-5 h-5" /></motion.span>
                                    : <motion.span key="menu" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><FiMenu className="w-5 h-5" /></motion.span>
                                }
                            </AnimatePresence>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile dropdown drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div key="bd"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="fixed inset-0 top-16 sm:top-[4.25rem] bg-black/25 dark:bg-black/50 lg:hidden z-[997]"
                            onClick={() => setIsOpen(false)} />

                        <motion.div key="drawer" ref={menuRef}
                            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-2xl lg:hidden z-[998] overflow-y-auto"
                            style={{ maxHeight: 'calc(100dvh - 4rem)' }}>

                            <div className="container-custom py-3 pb-5">

                                {/* Nav links */}
                                <div className="space-y-0.5 mb-3">
                                    {NAV_LINKS.map((link, i) => (
                                        <motion.div key={link.path}
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.035, duration: 0.18 }}>
                                            <Link to={link.path} onClick={() => setIsOpen(false)}
                                                className={[
                                                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-semibold transition-all duration-150 min-h-0',
                                                    isActive(link.path)
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/70',
                                                ].join(' ')}>
                                                <link.icon className={`w-4 h-4 shrink-0 ${isActive(link.path) ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`} />
                                                {link.name}
                                                {isActive(link.path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800 mb-3" />

                                {isAuthenticated ? (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.18 }}
                                        className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {DASH_LINKS.filter(l => l.show).map(link => (
                                                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)}
                                                    className={[
                                                        'flex items-center gap-2 p-3 rounded-xl text-[13px] font-semibold transition-all min-h-0',
                                                        isActive(link.path)
                                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                            : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-200 dark:hover:border-primary-800',
                                                    ].join(' ')}>
                                                    <link.icon className="w-4 h-4 text-primary-500 shrink-0" />
                                                    {link.name}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                                                {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                            <button onClick={handleLogout}
                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-0 shrink-0">
                                                <FiLogOut className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.18 }}
                                        className="grid grid-cols-2 gap-2.5">
                                        <Link to="/login" onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center py-2.5 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-bold hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all min-h-0">
                                            Sign In
                                        </Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-md shadow-primary-500/20 transition-all min-h-0">
                                            Get Started
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
