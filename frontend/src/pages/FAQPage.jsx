import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useState } from 'react';

const FAQPage = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            q: "How quickly can I get a property visit scheduled?",
            a: "We typically schedule property visits within 24-48 hours of your request, depending on the owner's availability. You can request a visit directly from the property detail page."
        },
        {
            q: "What documents do I need to buy a property?",
            a: "You'll need identity proof (Aadhar/PAN), income documents, bank statements for the last 6 months, and address proof. Our legal team will guide you through the complete documentation and verification process."
        },
        {
            q: "Do you provide home loan assistance?",
            a: "Yes, we have strategic partnerships with major banks (HDFC, SBI, ICICI, etc.) and can help you get the best interest rates and fast-track your loan approval process."
        },
        {
            q: "Is there any brokerage fee?",
            a: "Our fee structure is transparent. For rentals, it's typically 15 days to 1 month of rent. For sales, it ranges from 1-2% depending on the property value and location. We discuss all charges upfront."
        },
        {
            q: "How do I list my property on EstateElite?",
            a: "Listing is easy! Simply create an account, go to your dashboard, and click on 'Add Property'. Fill in the details, upload high-quality photos, and our team will verify and publish it within 24 hours."
        },
        {
            q: "Is my personal data secure with you?",
            a: "Absolutely. We use industry-standard encryption to protect your data. Your contact details are only shared with verified buyers/sellers when you explicitly show interest."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <>
            <Helmet>
                <title>FAQ | EstateElite</title>
                <meta name="description" content="Frequently asked questions about buying, selling, and renting properties with EstateElite." />
            </Helmet>

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20">
                    <div className="container-custom text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Frequently Asked Questions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl max-w-2xl mx-auto opacity-90"
                        >
                            Find answers to the most common questions about our services and the real estate process.
                        </motion.p>
                    </div>
                </section>

                {/* FAQ Accordion Section */}
                <section className="section-padding">
                    <div className="container-custom max-w-3xl">
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                    >
                                        <span className={`text-lg font-bold transition-colors ${activeIndex === index ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>
                                            {faq.q}
                                        </span>
                                        <div className={`flex-shrink-0 ml-4 p-1 rounded-full transition-transform duration-300 ${activeIndex === index ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 rotate-180' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                            {activeIndex === index ? <FiMinus /> : <FiPlus />}
                                        </div>
                                    </button>
                                    
                                    <motion.div
                                        initial={false}
                                        animate={{ height: activeIndex === index ? 'auto' : 0, opacity: activeIndex === index ? 1 : 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 border-t border-gray-50 dark:border-gray-700/50">
                                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Still Have Questions? */}
                        <div className="mt-16 p-8 rounded-3xl bg-primary-600 text-white text-center shadow-xl shadow-primary-500/20">
                            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                            <p className="mb-8 opacity-90">Can't find the answer you're looking for? Our team is here to help.</p>
                            <a 
                                href="/contact" 
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors shadow-lg"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default FAQPage;