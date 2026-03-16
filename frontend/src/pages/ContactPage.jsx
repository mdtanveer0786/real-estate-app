import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
    FiMapPin, FiPhone, FiMail, FiClock,
    FiSend, FiUser, FiMessageSquare, FiCheckCircle,
} from 'react-icons/fi';
import api from '../services/api';

/* ─── Contact info cards data ────────────────────────────────────────────── */
const CONTACT_INFO = [
    {
        icon: FiPhone,
        title: 'Phone',
        details: ['+91 82525 74386'],
        href: 'tel:+918252574386',
        cta: 'Call Now',
    },
    {
        icon: FiMail,
        title: 'Email',
        details: ['realestateeliteteam01@gmail.com'],
        href: 'mailto:realestateeliteteam01@gmail.com',
        cta: 'Send Email',
    },
    {
        icon: FiMapPin,
        title: 'Office',
        details: ['123 Business Avenue', 'Koramangala, Bangalore – 560034'],
        href: 'https://maps.google.com/?q=Koramangala+Bangalore',
        cta: 'Get Directions',
    },
    {
        icon: FiClock,
        title: 'Working Hours',
        details: ['Mon – Sat: 9:00 AM – 8:00 PM', 'Sunday: 10:00 AM – 4:00 PM'],
        href: null,
        cta: null,
    },
];

/* ─── Success screen shown after submission ──────────────────────────────── */
const SuccessPanel = ({ name, onReset }) => (
    <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col items-center justify-center py-12 text-center"
    >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-5">
            <FiCheckCircle className="text-green-500 text-4xl" />
        </div>
        <h3 className="text-2xl font-bold mb-2 dark:text-white">Message Sent!</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed mb-2">
            Thanks <strong>{name}</strong>! We've received your message and sent a confirmation to your email.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-6">
            Our team will get back to you within <strong>24 hours</strong>.
        </p>
        <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:underline font-medium"
        >
            Send another message
        </button>
    </motion.div>
);

/* ─── Main page ──────────────────────────────────────────────────────────── */
const ContactPage = () => {
    const [loading, setLoading]       = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [submittedName, setSubmittedName] = useState('');
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ mode: 'onTouched' });

    const onSubmit = async (data) => {
        setLoading(true);
        setServerError('');
        try {
            await api.post('/contact', {
                name:    data.name.trim(),
                email:   data.email.trim(),
                phone:   data.phone?.trim() || '',
                subject: data.subject.trim(),
                message: data.message.trim(),
            });
            setSubmittedName(data.name.trim());
            setSubmitted(true);
            reset();
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Failed to send your message. Please try again.';
            setServerError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        setSubmittedName('');
        setServerError('');
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | EstateElite</title>
                <meta
                    name="description"
                    content="Get in touch with EstateElite. Our team is here to help you with any questions about properties, buying, selling, or renting."
                />
            </Helmet>

            <div className="bg-white dark:bg-gray-900">

                {/* ── Hero ──────────────────────────────────────────────── */}
                <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-16 sm:py-20">
                    <div className="container-custom text-center px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
                        >
                            Get in Touch
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="text-base sm:text-xl max-w-2xl mx-auto opacity-90"
                        >
                            Have questions? We'd love to hear from you. Send us a message
                            and we'll respond as soon as possible.
                        </motion.p>
                    </div>
                </section>

                {/* ── Contact info cards ────────────────────────────────── */}
                <section className="section-padding">
                    <div className="container-custom px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 -mt-12 sm:-mt-20">
                            {CONTACT_INFO.map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 sm:p-6 text-center card-hover"
                                >
                                    <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-3 sm:mb-4">
                                        <item.icon className="text-xl sm:text-2xl text-primary-600" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">{item.title}</h3>
                                    {item.details.map((d) => (
                                        <p key={d} className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm break-words">{d}</p>
                                    ))}
                                    {item.href && item.cta && (
                                        <a
                                            href={item.href}
                                            target={item.href.startsWith('http') ? '_blank' : undefined}
                                            rel="noopener noreferrer"
                                            className="inline-block mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                        >
                                            {item.cta} →
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Form + Map ────────────────────────────────────────── */}
                <section className="section-padding bg-gray-50 dark:bg-gray-800">
                    <div className="container-custom px-4">
                        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">

                            {/* Form column */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Send us a Message</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
                                    Fill in the form and we'll get back to you within 24 hours.
                                </p>

                                {/* Server-level error banner */}
                                {serverError && (
                                    <div role="alert" className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                                        {serverError}
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {submitted ? (
                                        <SuccessPanel name={submittedName} onReset={handleReset} />
                                    ) : (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit(onSubmit)}
                                            noValidate
                                            className="space-y-4 sm:space-y-5"
                                        >
                                            {/* Name + Email row */}
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="input-label">
                                                        Your Name <span aria-hidden="true" className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                                                        <input
                                                            id="name"
                                                            type="text"
                                                            autoComplete="name"
                                                            aria-required="true"
                                                            aria-invalid={!!errors.name}
                                                            aria-describedby={errors.name ? 'name-error' : undefined}
                                                            {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                                                            className="input-field pl-10"
                                                            placeholder="John Doe"
                                                        />
                                                    </div>
                                                    {errors.name && <p id="name-error" role="alert" className="input-error">{errors.name.message}</p>}
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className="input-label">
                                                        Your Email <span aria-hidden="true" className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                                                        <input
                                                            id="email"
                                                            type="email"
                                                            autoComplete="email"
                                                            aria-required="true"
                                                            aria-invalid={!!errors.email}
                                                            aria-describedby={errors.email ? 'email-error' : undefined}
                                                            {...register('email', {
                                                                required: 'Email is required',
                                                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                                                            })}
                                                            className="input-field pl-10"
                                                            placeholder="john@example.com"
                                                        />
                                                    </div>
                                                    {errors.email && <p id="email-error" role="alert" className="input-error">{errors.email.message}</p>}
                                                </div>
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label htmlFor="phone" className="input-label">Phone Number</label>
                                                <div className="relative">
                                                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true" />
                                                    <input
                                                        id="phone"
                                                        type="tel"
                                                        autoComplete="tel"
                                                        {...register('phone')}
                                                        className="input-field pl-10"
                                                        placeholder="+91 82525 74386"
                                                    />
                                                </div>
                                            </div>

                                            {/* Subject */}
                                            <div>
                                                <label htmlFor="subject" className="input-label">
                                                    Subject <span aria-hidden="true" className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="subject"
                                                    type="text"
                                                    aria-required="true"
                                                    aria-invalid={!!errors.subject}
                                                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                                                    {...register('subject', { required: 'Subject is required' })}
                                                    className="input-field"
                                                    placeholder="How can we help you?"
                                                />
                                                {errors.subject && <p id="subject-error" role="alert" className="input-error">{errors.subject.message}</p>}
                                            </div>

                                            {/* Message */}
                                            <div>
                                                <label htmlFor="message" className="input-label">
                                                    Message <span aria-hidden="true" className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <FiMessageSquare className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" aria-hidden="true" />
                                                    <textarea
                                                        id="message"
                                                        rows={5}
                                                        aria-required="true"
                                                        aria-invalid={!!errors.message}
                                                        aria-describedby={errors.message ? 'message-error' : undefined}
                                                        {...register('message', {
                                                            required: 'Message is required',
                                                            minLength: { value: 10, message: 'Please write at least 10 characters' },
                                                        })}
                                                        className="input-field pl-10 resize-y min-h-[120px]"
                                                        placeholder="Tell us more about your enquiry…"
                                                    />
                                                </div>
                                                {errors.message && <p id="message-error" role="alert" className="input-error">{errors.message.message}</p>}
                                            </div>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                                                        <span>Sending…</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSend aria-hidden="true" />
                                                        <span>Send Message</span>
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-xs text-gray-400 text-center">
                                                We'll send an auto-reply confirmation to your email address.
                                            </p>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Map column */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="h-[350px] sm:h-[450px] lg:h-auto min-h-[350px] rounded-xl overflow-hidden shadow-xl"
                            >
                                <iframe
                                    title="EstateElite Office Location"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.985382234567!2d77.6137!3d12.9352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae15b78b6546c1%3A0x1a2b3c4d5e6f7a8b!2sKoramangala%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
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
