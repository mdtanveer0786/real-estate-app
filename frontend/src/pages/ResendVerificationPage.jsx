import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import { MdMarkEmailRead } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const ResendVerificationPage = () => {
    const { resendVerification } = useAuth();
    const [loading, setLoading]     = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [sentEmail, setSentEmail] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await resendVerification(data.email);
            setSentEmail(data.email);
            setSubmitted(true);
        } catch {
            // Error toast handled in AuthContext
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100dvh-4.25rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-6 sm:py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-6"
            >
                {!submitted ? (
                    <>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MdMarkEmailRead className="text-blue-600 text-3xl" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                Resend Verification
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Didn't receive the verification email? Enter your email address and we'll send you a new link.
                            </p>
                        </div>

                        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                                                message: 'Please enter a valid email address',
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading
                                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : <><FiSend /> Send Verification Link</>
                                }
                            </button>
                        </form>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-5">
                            <FiMail className="text-green-600 dark:text-green-400 text-4xl" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 dark:text-white">Email Sent</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                            We sent a new verification link to:
                        </p>
                        <p className="font-semibold text-primary-600 mb-5 break-words">{sentEmail}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                            The link will expire in <strong>24 hours</strong>. Please check your spam folder if you don't see it.
                        </p>
                        <button
                            onClick={() => { setSubmitted(false); setSentEmail(''); }}
                            className="text-sm text-primary-600 hover:underline"
                        >
                            Try another email
                        </button>
                    </motion.div>
                )}

                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <FiArrowLeft /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResendVerificationPage;
