import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiMail, FiPhone, FiMessageSquare, FiSend, FiUser } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ContactForm = ({ property }) => {
    const propertyId = property?._id;
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

    // Sync user data when it changes
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Interested in this property?</h3>

            {/* WhatsApp Button */}
            <button
                onClick={handleWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mb-4 flex items-center justify-center gap-2 transition"
            >
                <FaWhatsapp size={20} />
                Chat on WhatsApp
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <div className="relative">
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            {...register('name', { required: 'Name is required' })}
                            className="input-field pl-10"
                            placeholder="Your name"
                        />
                    </div>
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <div className="relative">
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
                            })}
                            className="input-field pl-10"
                            placeholder="your@email.com"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Phone *</label>
                    <div className="relative">
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="tel"
                            {...register('phone', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Please enter a valid 10-digit phone number'
                                }
                            })}
                            className="input-field pl-10"
                            placeholder="Your phone number"
                        />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Message *</label>
                    <div className="relative">
                        <FiMessageSquare className="absolute left-3 top-3 text-gray-400" />
                        <textarea
                            {...register('message', { required: 'Message is required' })}
                            rows="4"
                            className="input-field pl-10"
                            placeholder="I'm interested in this property. Please contact me with more details."
                        />
                    </div>
                    {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <FiSend /> Send Inquiry
                        </>
                    )}
                </button>
            </form>

            {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                    You'll receive responses via email. <a href="/login" className="text-primary-600 hover:underline">Login</a> for faster response.
                </p>
            )}
        </div>
    );
};

export default ContactForm;