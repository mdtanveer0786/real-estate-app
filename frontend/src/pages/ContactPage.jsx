import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ContactPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            subject: '',
            message: '',
        }
    });

    // Pre-fill form if user is logged in
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                subject: '',
                message: '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            console.log("contact information ", data)
            const response = await api.post('/contact', data);
            toast.success(response.data?.message || 'Message sent successfully! We\'ll get back to you soon.');
            reset();
        } catch (error) {
            const errorMsg =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'Failed to send message. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: FiPhone,
            title: 'Phone',
            details: ['+91 8252574386'],
            action: 'tel:+918252574386'
        },
        {
            icon: FiMail,
            title: 'Email',
            details: ['realestateeliteteam01@gmail.com'],
            action: 'mailto:realestateeliteteam01@gmail.com'
        },
        {
            icon: FiMapPin,
            title: 'Office',
            details: ['123 Business Avenue', 'Koramangala, Bangalore - 560034'],
            action: 'https://maps.google.com/?q=Bangalore'
        },
        {
            icon: FiClock,
            title: 'Working Hours',
            details: ['Mon - Sat: 9:00 AM - 8:00 PM', 'Sunday: 10:00 AM - 4:00 PM'],
            action: null
        }
    ];

    return (
        <>
            <Helmet>
                <title>Contact Us | EstateElite</title>
                <meta name="description" content="Get in touch with EstateElite. Our team is here to help you with any questions about properties, buying, selling, or renting." />
            </Helmet>

            <div className="bg-white dark:bg-gray-900">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="container-custom text-center relative z-10 px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Get in Touch
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90"
                        >
                            Have questions about buying, selling, or renting properties in India? We'd love to hear from you.
                        </motion.p>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="section-padding">
                    <div className="container-custom px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 -mt-12 sm:-mt-20">
                            {contactInfo.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-5 sm:p-6 text-center card-hover"
                                >
                                    <div className="inline-block p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-3 sm:mb-4">
                                        <item.icon className="text-xl sm:text-2xl text-primary-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">{item.title}</h3>
                                    {item.details.map((detail, i) => (
                                        <p key={i} className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm break-words">
                                            {detail}
                                        </p>
                                    ))}
                                    {item.action && (
                                        <a
                                            href={item.action}
                                            className="inline-block mt-2 sm:mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                        >
                                            Contact Now →
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form & Map */}
                <section className="section-padding bg-gray-50 dark:bg-gray-800">
                    <div className="container-custom px-4">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Contact Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Send us a Message</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
                                    Fill out the form below and we'll get back to you within 24 hours.
                                </p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="input-label">Your Name *</label>
                                            <input
                                                type="text"
                                                {...register('name', { required: 'Name is required' })}
                                                className="input-field"
                                                placeholder="John Doe"
                                            />
                                            {errors.name && <p className="input-error">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label className="input-label">Your Email *</label>
                                            <input
                                                type="email"
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: 'Invalid email address'
                                                    }
                                                })}
                                                className="input-field"
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && <p className="input-error">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="input-label">Phone Number</label>
                                        <input
                                            type="tel"
                                            {...register('phone')}
                                            className="input-field"
                                            placeholder="+91 8252574386"
                                        />
                                    </div>

                                    <div>
                                        <label className="input-label">Subject *</label>
                                        <input
                                            type="text"
                                            {...register('subject', { required: 'Subject is required' })}
                                            className="input-field"
                                            placeholder="How can we help?"
                                        />
                                        {errors.subject && <p className="input-error">{errors.subject.message}</p>}
                                    </div>

                                    <div>
                                        <label className="input-label">Message *</label>
                                        <textarea
                                            {...register('message', { required: 'Message is required' })}
                                            rows="5"
                                            className="input-field resize-y min-h-[120px]"
                                            placeholder="Tell us more about your query..."
                                        />
                                        {errors.message && <p className="input-error">{errors.message.message}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <FiSend />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>

                            {/* Map */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="h-[350px] sm:h-[450px] lg:h-auto min-h-[350px] rounded-lg overflow-hidden shadow-xl"
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.985382234567!2d77.6137!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15b78b6546c1%3A0x1a2b3c4d5e6f7a8b!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    title="Office Location"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ContactPage;