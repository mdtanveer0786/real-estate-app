import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiUsers, FiMessageSquare, FiPlus,
  FiList, FiBarChart2, FiLogOut, FiLoader, FiMenu, FiX,
  FiChevronRight, FiGlobe, FiBell, FiUser
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// Import actual components
import Dashboard from '../components/admin/Dashboard';
import PropertyManagement from '../components/admin/PropertyManagement';
import PropertyForm from '../components/admin/PropertyForm';
import UserManagement from '../components/admin/UserManagement';
import Inquiries from '../components/admin/Inquiries';

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, [location.pathname]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '', name: 'Dashboard', icon: FiBarChart2 },
    { path: 'properties', name: 'All Properties', icon: FiList },
    { path: 'add-property', name: 'Add Property', icon: FiPlus },
    { path: 'users', name: 'Users', icon: FiUsers },
    { path: 'inquiries', name: 'Inquiries', icon: FiMessageSquare },
  ];

  const getCurrentPageName = () => {
    const path = location.pathname.split('/').pop();
    if (path === 'admin') return 'Dashboard';
    const item = menuItems.find(i => i.path === path);
    return item ? item.name : 'Management';
  };

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-72';

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 ${sidebarWidth} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xl lg:shadow-none`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
          <Link to="/admin" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform shrink-0">
              <FiHome className="text-white text-xl" />
            </div>
            {!isSidebarCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold tracking-tight truncate">EstateElite</h2>
                <span className="text-[10px] uppercase tracking-widest text-primary-600 font-bold">Admin Portal</span>
              </motion.div>
            )}
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsSidebarOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-1 overflow-y-auto">
          <p className={`px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>Main Menu</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === `/admin${item.path ? `/${item.path}` : ''}`;
            return (
              <Link
                key={item.path}
                to={`/admin/${item.path}`}
                onClick={() => setIsSidebarOpen(false)}
                title={isSidebarCollapsed ? item.name : ''}
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-primary-600'
                }`}
              >
                <item.icon className={`text-lg shrink-0 ${isActive ? 'text-white' : 'group-hover:text-primary-600'} ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
          
          <div className="pt-8 space-y-1">
            <p className={`px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`}>Quick Actions</p>
            <Link to="/" className="flex items-center px-4 py-3.5 rounded-xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
              <FiGlobe className={`text-lg ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Visit Website</span>}
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Sign Out' : ''}
            className={`flex items-center justify-center gap-3 py-3.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold transition-all border border-red-100 dark:border-red-900/30 ${isSidebarCollapsed ? 'w-12 mx-auto' : 'w-full'}`}
          >
            <FiLogOut className="shrink-0" />
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Professional TopBar */}
        <header className="sticky top-0 h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800"
            >
              <FiMenu size={20} />
            </button>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm"
            >
              <FiMenu size={20} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hidden xs:inline hover:text-primary-600 cursor-pointer transition">Admin</span>
              <FiChevronRight className="hidden xs:inline text-gray-300" />
              <span className="text-gray-900 dark:text-white font-bold tracking-tight truncate max-w-[120px] xs:max-w-none">{getCurrentPageName()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.name}</span>
              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-tighter">System Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 cursor-pointer hover:border-primary-500 transition-colors group">
              <FiUser className="group-hover:text-primary-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Content Area with Transitions */}
        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-[1600px] mx-auto"
            >
              <Routes>
                <Route index element={<Dashboard stats={stats} />} />
                <Route path="properties" element={<PropertyManagement />} />
                <Route path="add-property" element={<PropertyForm />} />
                <Route path="edit-property/:id" element={<PropertyForm />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="inquiries" element={<Inquiries />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Simple Footer */}
        <footer className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 text-center sm:flex sm:justify-between items-center text-xs text-gray-400">
          <p>© 2026 EstateElite Admin Dashboard. All rights reserved.</p>
          <div className="flex gap-4 justify-center mt-2 sm:mt-0">
            <span className="hover:text-primary-600 cursor-pointer">Support</span>
            <span className="hover:text-primary-600 cursor-pointer">Documentation</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminPage;