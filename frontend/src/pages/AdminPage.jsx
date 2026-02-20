import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome, FiUsers, FiMessageSquare, FiPlus,
    FiList, FiBarChart2, FiLogOut
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PropertyManagement from '../components/admin/PropertyManagement';
import UserManagement from '../components/admin/UserManagement';
import Inquiries from '../components/admin/Inquiries';
import Dashboard from '../components/admin/Dashboard';
import PropertyForm from '../components/admin/PropertyForm';

const AdminPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '', name: 'Dashboard', icon: FiBarChart2 },
        { path: 'properties', name: 'Properties', icon: FiHome },
        { path: 'add-property', name: 'Add Property', icon: FiPlus },
        { path: 'users', name: 'Users', icon: FiUsers },
        { path: 'inquiries', name: 'Inquiries', icon: FiMessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen fixed">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-primary-600">Admin Panel</h2>
                    </div>

                    <nav className="mt-6">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={`/admin/${item.path}`}
                                className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 hover:text-primary-600 transition"
                            >
                                <item.icon className="mr-3" />
                                {item.name}
                            </Link>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="flex items-center px-6 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition"
                        >
                            <FiLogOut className="mr-3" />
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="ml-64 flex-1 p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
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
                </main>
            </div>
        </div>
    );
};

export default AdminPage;