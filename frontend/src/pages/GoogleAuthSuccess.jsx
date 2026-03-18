import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const GoogleAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleGoogleSuccess } = useAuth();
    const [status, setStatus] = useState('loading'); // loading | success | error

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            return;
        }

        handleGoogleSuccess(token)
            .then((user) => {
                setStatus('success');
                setTimeout(() => {
                    navigate(user?.role === 'admin' ? '/admin' : '/', { replace: true });
                }, 1500);
            })
            .catch(() => {
                setStatus('error');
            });
    }, [searchParams, handleGoogleSuccess, navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <FcGoogle className="text-5xl mx-auto mb-4 animate-bounce" />
                    <p className="text-gray-600 dark:text-gray-400">Completing Google sign-in...</p>
                    <Loader />
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiAlertCircle className="text-red-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Sign-in Failed</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Google authentication failed. Please try again.
                    </p>
                    <button
                        onClick={() => navigate('/login', { replace: true })}
                        className="btn-primary px-8 py-3 rounded-lg font-semibold"
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
            >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                    <FiCheckCircle className="text-green-500 text-4xl" />
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Welcome!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Google sign-in successful. Redirecting...
                </p>
            </motion.div>
        </div>
    );
};

export default GoogleAuthSuccess;
