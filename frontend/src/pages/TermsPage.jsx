import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const TermsPage = () => {
    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this site.'
        },
        {
            title: '2. Use License',
            content: 'Permission is granted to temporarily download one copy of the materials (information or software) on EstateElite\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.'
        },
        {
            title: '3. Disclaimer',
            content: 'The materials on EstateElite\'s website are provided on an \'as is\' basis. EstateElite makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
        },
        {
            title: '4. Limitations',
            content: 'In no event shall EstateElite or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on EstateElite\'s website.'
        },
        {
            title: '5. Accuracy of Materials',
            content: 'The materials appearing on EstateElite\'s website could include technical, typographical, or photographic errors. EstateElite does not warrant that any of the materials on its website are accurate, complete or current.'
        },
        {
            title: '6. Links',
            content: 'EstateElite has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by EstateElite of the site.'
        },
        {
            title: '7. Modifications',
            content: 'EstateElite may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.'
        },
        {
            title: '8. Governing Law',
            content: 'These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in Bangalore.'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Terms and Conditions | EstateElite</title>
                <meta name="description" content="Read the terms and conditions for using EstateElite's real estate platform. Understand your rights and obligations when using our services." />
            </Helmet>

            <div className="bg-white dark:bg-gray-900 py-12">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl font-bold mb-4">Terms and Conditions</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Last updated: January 1, 2026
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-lg dark:prose-invert max-w-none"
                    >
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-8">
                            <p className="text-yellow-700 dark:text-yellow-300">
                                Please read these terms and conditions carefully before using our website.
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
                            <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                If you have any questions about these Terms, please contact us at:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                                <li>Email: legal@estateelite.com</li>
                                <li>Phone: +91 8252574386</li>
                                <li>Address: 123 Business Avenue, Koramangala, Bangalore - 560034</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default TermsPage;