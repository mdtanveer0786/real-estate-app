import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome, FiUsers, FiMessageSquare, FiPlus, FiList,
    FiBarChart2, FiLogOut, FiMenu, FiX, FiChevronRight,
    FiGlobe, FiTrendingUp, FiSettings, FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

import Dashboard        from '../components/admin/Dashboard';
import PropertyManagement from '../components/admin/PropertyManagement';
import UserManagement   from '../components/admin/UserManagement';
import Inquiries        from '../components/admin/Inquiries';
import Analytics        from '../components/admin/Analytics';
import AddEditProperty  from './AddEditProperty';

const NAV = [
    { path: '',            label: 'Dashboard',       icon: FiBarChart2,   group: 'main' },
    { path: 'analytics',   label: 'Analytics',       icon: FiTrendingUp,  group: 'main' },
    { path: 'properties',  label: 'Properties',      icon: FiList,        group: 'main' },
    { path: 'add-property',label: 'Add Property',    icon: FiPlus,        group: 'main' },
    { path: 'users',       label: 'Users',           icon: FiUsers,       group: 'main' },
    { path: 'inquiries',   label: 'Inquiries',       icon: FiMessageSquare, group: 'main' },
];

const AdminPage = () => {
    const { user, logout }       = useAuth();
    const navigate               = useNavigate();
    const location               = useLocation();
    const [stats,     setStats]  = useState(null);
    const [loading,   setLoading]= useState(true);
    const [sideOpen,  setSideOpen]  = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch { toast.error('Failed to load stats'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { setSideOpen(false); }, [location.pathname]);

    const isActive = (path) => {
        const full = `/admin${path ? `/${path}` : ''}`;
        return path === '' ? location.pathname === '/admin' : location.pathname.startsWith(full);
    };

    const currentLabel = () => {
        const seg = location.pathname.replace('/admin', '').replace(/^\//, '');
        return NAV.find(n => n.path === seg)?.label || 'Admin Panel';
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="h-16 sm:h-18 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <Link to="/admin" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25 shrink-0">
                        <FiHome className="text-white text-lg" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-tight">EstateElite</p>
                            <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest">Admin Portal</p>
                        </div>
                    )}
                </Link>
                <button onClick={() => setSideOpen(false)} className="lg:hidden p-1 text-gray-400 min-h-0">
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
                {!collapsed && <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Menu</p>}
                {NAV.map(item => (
                    <Link key={item.path} to={`/admin/${item.path}`}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                            isActive(item.path)
                                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                        {!collapsed && <span className="text-sm font-semibold truncate">{item.label}</span>}
                        {!collapsed && isActive(item.path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                    </Link>
                ))}

                <div className="my-3 border-t border-gray-100 dark:border-gray-800" />
                {!collapsed && <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quick Links</p>}
                <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition-all`}>
                    <FiGlobe className={`w-4 h-4 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                    {!collapsed && <span className="text-sm font-semibold">Visit Site</span>}
                </Link>
                <Link to="/billing" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition-all`}>
                    <FiCreditCard className={`w-4 h-4 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
                    {!collapsed && <span className="text-sm font-semibold">Billing</span>}
                </Link>
            </nav>

            {/* User footer */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
                {!collapsed && (
                    <div className="flex items-center gap-2.5 p-2.5 mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0 overflow-hidden">
                            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-[9px] font-semibold text-primary-600 uppercase tracking-wider">Administrator</p>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors w-full text-sm min-h-0`}>
                    <FiLogOut className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#f8fafc] dark:bg-gray-950">

            {/* ── Mobile overlay ────────────────────────────────────────── */}
            <AnimatePresence>
                {sideOpen && (
                    <motion.div key="overlay"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSideOpen(false)} />
                )}
            </AnimatePresence>

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 flex flex-col
                bg-white dark:bg-gray-900
                border-r border-gray-100 dark:border-gray-800
                shadow-xl lg:shadow-none
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-16' : 'w-64'}
                ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:z-auto
            `}>
                <SidebarContent />
            </aside>

            {/* ── Main ──────────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Topbar */}
                <header className="h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button onClick={() => setSideOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 min-h-0">
                            <FiMenu className="w-5 h-5" />
                        </button>
                        {/* Desktop collapse toggle */}
                        <button onClick={() => setCollapsed(p => !p)}
                            className="hidden lg:flex p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 transition-colors min-h-0">
                            <FiMenu className="w-4 h-4" />
                        </button>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-gray-400">Admin</span>
                            <FiChevronRight className="w-3 h-3 text-gray-300" />
                            <span className="font-bold text-gray-900 dark:text-white">{currentLabel()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                            <p className="text-[9px] text-primary-600 font-bold uppercase tracking-wider">Admin</p>
                        </div>
                        <Link to="/profile"
                            className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden min-h-0">
                            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)?.toUpperCase()}
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}>
                                <Routes>
                                    <Route index element={<Dashboard stats={stats} onRefresh={fetchStats} />} />
                                    <Route path="analytics"          element={<Analytics />} />
                                    <Route path="properties"         element={<PropertyManagement />} />
                                    <Route path="add-property"       element={<AddEditProperty />} />
                                    <Route path="edit-property/:id"  element={<AddEditProperty />} />
                                    <Route path="users"              element={<UserManagement />} />
                                    <Route path="inquiries"          element={<Inquiries />} />
                                </Routes>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPage;
