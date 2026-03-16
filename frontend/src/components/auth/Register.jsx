import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
    FiUser, FiMail, FiLock, FiUserPlus,
    FiEye, FiEyeOff, FiSend
} from 'react-icons/fi';
import { MdMarkEmailRead } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const { register: registerUser } = useAuth();
    const [loading, setLoading]               = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState(null); // null = show form
    const [showPwd, setShowPwd]               = useState(false);
    const [showConfirm, setShowConfirm]       = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const password = watch('password');

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await registerUser({ name: data.name, email: data.email, password: data.password, role: 'user' });
            setRegisteredEmail(data.email);
        } catch {
            // Error toast handled inside AuthContext
        } finally {
            setLoading(false);
        }
    };

    // ── Post-registration screen ───────────────────────────────────────────
    if (registeredEmail) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                        <MdMarkEmailRead className="text-blue-600 dark:text-blue-400 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 dark:text-white">Check Your Email</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm leading-relaxed">
                        We sent a verification link to
                    </p>
                    <p className="font-semibold text-primary-600 mb-5 break-words">{registeredEmail}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Click the link in that email to verify your account, then come back here to log in.
                        The link expires in <strong>24 hours</strong>.
                    </p>
                    <Link to="/login" className="btn-primary inline-block px-8 py-3 rounded-lg font-semibold">
                        Go to Login
                    </Link>
                    <p className="text-xs text-gray-400 mt-4">
                        Didn't receive it?{' '}
                        <button
                            onClick={() => setRegisteredEmail(null)}
                            className="text-primary-600 hover:underline"
                        >
                            Re-enter your details
                        </button>
                    </p>
                </motion.div>
            </div>
        );
    }

    // ── Registration form ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'At least 2 characters' },
                                })}
                                className="input-field pl-10"
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' },
                                })}
                                className="input-field pl-10"
                                placeholder="john@example.com"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
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
                                placeholder="••••••••"
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
                            Confirm Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: v => v === password || 'Passwords do not match',
                                })}
                                className="input-field pl-10 pr-10"
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showConfirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading
                            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <><FiUserPlus /> Create Account</>
                        }
                    </button>

                    <p className="text-xs text-gray-400 text-center">
                        By signing up you agree to our{' '}
                        <Link to="/terms" className="text-primary-600 hover:underline">Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>.
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
