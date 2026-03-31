import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiUserPlus } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const { register: registerUser } = useAuth();
    const [loading, setLoading]       = useState(false);
    const [showPwd, setShowPwd]       = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState(null);

    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await registerUser(data.name, data.email, data.password, data.role);
            setRegisteredEmail(data.email);
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${apiUrl}/api/auth/google`;
    };

    // ── Success state ────────────────────────────────────────────────────────
    if (registeredEmail) {
        return (
            <div className="min-h-[calc(100dvh-4.25rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 sm:py-10 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiCheckCircle className="text-green-500 text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 dark:text-white">
                        Check Your Email
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                        We sent a verification link to:
                    </p>
                    <p className="font-semibold text-primary-600 mb-5 break-words">
                        {registeredEmail}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        Click the link in the email to activate your account.
                        The link expires in <strong>24 hours</strong>.
                    </p>
                    <Link to="/login" className="btn-primary inline-block px-8 py-3 rounded-lg font-semibold">
                        Go to Login
                    </Link>
                    <p className="text-xs text-gray-400 mt-4">
                        Didn't receive it?{' '}
                        <Link to="/resend-verification" className="text-primary-600 hover:underline">
                            Resend verification email
                        </Link>
                        {' '}or{' '}
                        <button
                            onClick={() => setRegisteredEmail(null)}
                            className="text-primary-600 hover:underline"
                        >
                            re-enter your details
                        </button>
                    </p>
                </motion.div>
            </div>
        );
    }

    // ── Registration form ────────────────────────────────────────────────────
    return (
        <div className="min-h-[calc(100dvh-4.25rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 sm:py-10 px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-6"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create Your Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Join EstateElite today
                    </p>
                </div>

                {/* Google OAuth Button */}
                <button
                    type="button"
                    onClick={handleGoogle}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition-colors"
                >
                    <FcGoogle className="text-xl" />
                    Continue with Google
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                            or register with email
                        </span>
                    </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                {...register('name', {
                                    required: 'Name is required',
                                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                })}
                                className="input-field pl-10"
                                placeholder="John Doe"
                                autoComplete="name"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                className="input-field pl-10"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                    pattern: {
                                        value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                                        message: 'Must contain at least one letter and one number',
                                    },
                                })}
                                className="input-field pl-10 pr-10"
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPwd ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            I want to
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className="relative flex cursor-pointer">
                                <input
                                    type="radio"
                                    value="user"
                                    defaultChecked
                                    {...register('role')}
                                    className="peer sr-only"
                                />
                                <div className="w-full py-3 text-center rounded-lg border-2 border-gray-200 dark:border-gray-600 peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 text-sm font-medium text-gray-700 dark:text-gray-300 peer-checked:text-primary-700 dark:peer-checked:text-primary-400 transition-all">
                                    🏠 Buy / Rent
                                </div>
                            </label>
                            <label className="relative flex cursor-pointer">
                                <input
                                    type="radio"
                                    value="agent"
                                    {...register('role')}
                                    className="peer sr-only"
                                />
                                <div className="w-full py-3 text-center rounded-lg border-2 border-gray-200 dark:border-gray-600 peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 text-sm font-medium text-gray-700 dark:text-gray-300 peer-checked:text-primary-700 dark:peer-checked:text-primary-400 transition-all">
                                    🏢 List Properties
                                </div>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><FiUserPlus /> Create Account</>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
