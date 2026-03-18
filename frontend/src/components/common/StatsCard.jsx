import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon, label, value, change, color = 'primary' }) => {
    const colors = {
        primary: 'from-primary-500 to-primary-600',
        green: 'from-emerald-500 to-emerald-600',
        blue: 'from-blue-500 to-blue-600',
        orange: 'from-orange-500 to-orange-600',
        purple: 'from-purple-500 to-purple-600',
        red: 'from-red-500 to-red-600',
    };

    const bgColors = {
        primary: 'bg-primary-50 dark:bg-primary-900/20',
        green: 'bg-emerald-50 dark:bg-emerald-900/20',
        blue: 'bg-blue-50 dark:bg-blue-900/20',
        orange: 'bg-orange-50 dark:bg-orange-900/20',
        purple: 'bg-purple-50 dark:bg-purple-900/20',
        red: 'bg-red-50 dark:bg-red-900/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${bgColors[color]} rounded-xl flex items-center justify-center`}>
                    <span className="text-xl">{icon}</span>
                </div>
                {change !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        change >= 0
                            ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20'
                            : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20'
                    }`}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
        </motion.div>
    );
};

export default StatsCard;
