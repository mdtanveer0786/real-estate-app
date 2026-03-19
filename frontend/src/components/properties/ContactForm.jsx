import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiMessageSquare, FiSend, FiUser } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ContactForm = ({ property }) => {
    const propertyId = property?._id || property?.id;
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            message: '',
        }
    });

    // Sync user data when it changes or on mount
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                message: '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/inquiries', {
                ...data,
                propertyId,
            });
            toast.success('Inquiry sent successfully! The owner will contact you soon.');
            reset({
                ...data,
                message: '', // Clear only the message
            });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to send inquiry');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = () => {
        // Use property owner's phone if available, else fallback
        const phone = property?.createdBy?.phone || '+918252574386';
        const message = `Hi, I'm interested in your property: "${property?.title}". Can you provide more details?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-8 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl hover:shadow-black/10">
            <h3 className="text-xl font-black mb-6 tracking-tight dark:text-white">Interested in this property?</h3>

            {/* WhatsApp Action */}
            <button
                onClick={handleWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/20 mb-6"
            >
                <FaWhatsapp size={24} />
                Quick Chat on WhatsApp
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="px-3 bg-white dark:bg-gray-800 text-gray-400">or send a message</span>
                </div>
            </div>

            {/* Modernized Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                    <div className="relative group">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium dark:text-white"
                            placeholder="Your full name"
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.name.message}</p>}

                    <div className="relative group">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium dark:text-white"
                            placeholder="Email address"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.email.message}</p>}

                    <div className="relative group">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="tel"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Please enter a valid 10-digit phone number'
                                }
                            })}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium dark:text-white"
                            placeholder="10-digit phone number"
                        />
                    </div>
                    {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.phone.message}</p>}

                    <div className="relative group">
                        <FiMessageSquare className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <textarea
                            {...register('message', { required: 'Message is required' })}
                            rows="4"
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-sm font-medium dark:text-white resize-none"
                            placeholder="I'm interested in this property. Please contact me with more details."
                        />
                    </div>
                    {errors.message && <p className="text-red-500 text-[10px] font-bold uppercase ml-1">{errors.message.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary-600/20 disabled:opacity-50 mt-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <FiSend size={18} /> Send Message
                        </>
                    )}
                </button>
            </form>

            {!isAuthenticated && (
                <p className="text-xs text-center text-gray-500 mt-6 font-medium">
                    Already have an account? <a href="/login" className="text-primary-600 font-bold hover:underline">Login here</a>
                </p>
            )}
        </div>
    );
};

export default ContactForm;