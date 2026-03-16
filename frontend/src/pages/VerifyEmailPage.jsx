import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await api.get(`/auth/verifyemail/${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                toast.success('Email verified! You can now login.');
            } catch (error) {
                setStatus('error');
                setMessage(
                    error.response?.data?.error || 
                    error.response?.data?.message || 
                    'Verification failed. The link may be invalid or expired.'
                );
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [token]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700"
            >
                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <FiLoader className="w-16 h-16 text-primary-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verifying your email...</h2>
                        <p className="text-gray-600 dark:text-gray-400">Please wait a moment while we confirm your account.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <FiCheckCircle className="w-16 h-16 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Verified!</h2>
                        <p className="text-gray-600 dark:text-gray-400">{message}</p>
                        <div className="pt-4">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                            >
                                Continue to Login <FiArrowRight />
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <FiXCircle className="w-16 h-16 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verification Failed</h2>
                        <p className="text-gray-600 dark:text-gray-400">{message}</p>
                        <div className="pt-4 space-y-3">
                            <Link 
                                to="/register" 
                                className="block w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
                            >
                                Back to Registration
                            </Link>
                            <Link 
                                to="/contact" 
                                className="block text-primary-600 hover:underline text-sm"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;