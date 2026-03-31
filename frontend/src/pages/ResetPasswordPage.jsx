import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
    const { resetPassword } = useAuth();
    const { token }         = useParams();
    const navigate          = useNavigate();

    const [loading, setLoading]   = useState(false);
    const [showPwd, setShowPwd]   = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [success, setSuccess]   = useState(false);
    const [tokenError, setTokenError] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch('password');

    const onSubmit = async (data) => {
        if (!token) { setTokenError(true); return; }
        setLoading(true);
        try {
            await resetPassword(token, data.password);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 4000);
        } catch (err) {
            // If token is invalid/expired show a specific message
            const msg = err?.response?.data?.error || err?.message || '';
            if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
                setTokenError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Invalid / expired token ────────────────────────────────────────────
    if (tokenError) {
        return (
            <div className="min-h-[calc(100dvh-4.25rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 sm:py-10 px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiAlertCircle className="text-red-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Link Expired</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        This password reset link is invalid or has expired. Reset links are only valid for 60 minutes.
                    </p>
                    <Link to="/forgot-password" className="btn-primary inline-block px-8 py-3 rounded-lg font-semibold">
                        Request New Reset Link
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Success ────────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="min-h-[calc(100dvh-4.25rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 sm:py-10 px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiCheckCircle className="text-green-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Password Updated!</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                        Your password has been reset successfully. Redirecting to login in a few seconds…
                    </p>
                    <Link to="/login" className="btn-primary inline-block px-8 py-3 rounded-lg font-semibold">
                        Go to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Reset form ─────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiLock className="text-primary-600 text-3xl" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create New Password</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Your new password must be at least 6 characters.
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showPwd ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'At least 6 characters' },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                                        message: 'Must include at least one letter and one number',
                                    },
                                })}
                                className="input-field pl-10 pr-10"
                                placeholder="New password"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPwd ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConf ? 'text' : 'password'}
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: v => v === password || 'Passwords do not match',
                                })}
                                className="input-field pl-10 pr-10"
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowConf(!showConf)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showConf ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : 'Reset Password'
                        }
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Remembered your password?{' '}
                    <Link to="/login" className="text-primary-600 hover:underline font-medium">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
