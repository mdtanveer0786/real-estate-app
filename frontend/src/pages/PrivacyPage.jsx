import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
    const sections = [
        {
            title: 'Information We Collect',
            content: 'We collect information you provide directly to us, such as when you create an account, list a property, or contact us. This may include your name, email address, phone number, and property details.'
        },
        {
            title: 'How We Use Your Information',
            content: 'We use the information we collect to provide, maintain, and improve our services, to process transactions, to send you technical notices and support messages, and to respond to your comments and questions.'
        },
        {
            title: 'Sharing of Information',
            content: 'We may share information about you with property owners, real estate agents, and service providers who need access to such information to carry out work on our behalf.'
        },
        {
            title: 'Data Security',
            content: 'We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.'
        },
        {
            title: 'Your Choices',
            content: 'You may update, correct, or delete your account information at any time by logging into your account or contacting us. You may also opt out of receiving promotional communications from us.'
        },
        {
            title: 'Cookies',
            content: 'We use cookies and similar technologies to collect information about your browsing activities and to remember your preferences. You can set your browser to refuse all or some browser cookies.'
        },
        {
            title: 'Changes to Privacy Policy',
            content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated effective date.'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Privacy Policy | EstateElite</title>
                <meta name="description" content="Learn about how EstateElite collects, uses, and protects your personal information. Read our comprehensive privacy policy." />
            </Helmet>

            <div className="bg-white dark:bg-gray-900 py-12">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Last updated: January 1, 2024
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-lg dark:prose-invert max-w-none"
                    >
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-8">
                            <p className="text-blue-700 dark:text-blue-300">
                                Your privacy is important to us. This policy describes how we collect, use, and protect your personal information.
                            </p>
                        </div>

                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="mb-8"
                            >
                                <h2 className="text-2xl font-semibold mb-3">{section.title}</h2>
                                <p className="text-gray-700 dark:text-gray-300">{section.content}</p>
                            </motion.div>
                        ))}

                        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                If you have questions about this privacy policy, please contact us:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                                <li>Email: privacy@estateelite.com</li>
                                <li>Phone: +91 9999999999</li>
                                <li>Address: 123 Business Avenue, Koramangala, Bangalore - 560034</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPage;