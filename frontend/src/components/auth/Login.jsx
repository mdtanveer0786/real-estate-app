import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const { login, verify2FALogin } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading]   = useState(false);
    const [showPwd, setShowPwd]   = useState(false);

    // 2FA state
    const [show2FA, setShow2FA]     = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [twoFACode, setTwoFACode] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const result = await login(data.email, data.password);

            if (result?.requiresTwoFactor) {
                setTempToken(result.tempToken);
                setShow2FA(true);
                setLoading(false);
                return;
            }

            if (result?.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            // Error handled in auth context
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await verify2FALogin(tempToken, twoFACode);
            if (result?.user?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        window.location.href = `${apiUrl}/api/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-6"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Sign in to your account
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!show2FA ? (
                        <motion.div key="login-form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Google OAuth Button */}
                            <button
                                type="button"
                                onClick={handleGoogle}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition-colors mb-6"
                            >
                                <FcGoogle className="text-xl" />
                                Continue with Google
                            </button>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                        or sign in with email
                                    </span>
                                </div>
                            </div>

                            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

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
                                            })}
                                            className="input-field pl-10 pr-10"
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPwd ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end">
                                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                                        Forgot your password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <><FiLogIn /> Sign In</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        /* 2FA Code Entry */
                        <motion.div
                            key="2fa-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
                                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiLock className="text-primary-600 text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 dark:text-white">Two-Factor Authentication</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                    Enter the 6-digit code from your authenticator app.
                                </p>
                                <form onSubmit={handle2FASubmit} className="space-y-4">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={twoFACode}
                                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                                        className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                                        placeholder="000000"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || twoFACode.length !== 6}
                                        className="w-full py-3 px-4 text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                        ) : 'Verify'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShow2FA(false); setTwoFACode(''); }}
                                        className="text-sm text-gray-500 hover:text-primary-600"
                                    >
                                        ← Back to login
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;