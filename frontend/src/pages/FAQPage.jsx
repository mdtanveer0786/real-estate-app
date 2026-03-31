import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useState } from 'react';

const FAQPage = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            q: "Are the properties listed on EstateElite RERA registered?",
            a: "Yes, all new developer projects and applicable properties listed on our platform are thoroughly verified for RERA (Real Estate Regulatory Authority) registration to ensure complete transparency and security for our buyers."
        },
        {
            q: "What documents do I need for property registration in India?",
            a: "You will typically need your Aadhar Card, PAN Card, passport-size photographs, the original sale deed, NOC from the society/builder, and proof of stamp duty payment. Our legal team assists you through the entire registration process at the Sub-Registrar's office."
        },
        {
            q: "Do you provide home loan assistance?",
            a: "Yes, we have strategic partnerships with major Indian banks (SBI, HDFC, ICICI, Axis Bank) and NBFCs. We help you get the best interest rates, assist with documentation, and fast-track your loan approval process at zero extra cost."
        },
        {
            q: "What are the hidden costs when buying a property?",
            a: "We believe in 100% transparency. Besides the property value, you should budget for Stamp Duty (varies by state, typically 5-7%), Registration charges (usually 1%), Legal/Advocate fees, Society transfer charges, and GST (if applicable on under-construction properties)."
        },
        {
            q: "How does the rental agreement process work?",
            a: "We handle the end-to-end rental process including tenant background verification, drafting the Leave and License agreement, and facilitating the online or offline police verification and agreement registration as per state laws."
        },
        {
            q: "Is there any brokerage or platform fee?",
            a: "For buyers browsing listed properties, our platform is completely free to use. For personalized premium brokerage services or property sales, our fee ranges from 1-2% depending on the property value and city. All charges are discussed upfront with zero hidden costs."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <>
            <Helmet>
                <title>FAQ | EstateElite</title>
                <meta name="description" content="Frequently asked questions about buying, selling, and renting properties with EstateElite in India." />
            </Helmet>

            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
                {/* Premium Hero Section */}
                <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white py-14 sm:py-20 lg:py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="container-custom text-center relative z-10 px-4">
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
                            className="text-lg sm:text-xl max-w-2xl mx-auto opacity-90"
                        >
                            Find answers to common questions about RERA, home loans, property registration, and our services in India.
                        </motion.p>
                    </div>
                </section>

                {/* FAQ Accordion Section */}
                <section className="section-padding -mt-10 relative z-20">
                    <div className="container-custom max-w-4xl px-4">
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl transition-all duration-300 overflow-hidden border ${activeIndex === index ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-primary-300'}`}
                                >
                                    <button
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                                    >
                                        <span className={`text-base md:text-lg font-bold pr-4 transition-colors ${activeIndex === index ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                            {faq.q}
                                        </span>
                                        <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-primary-600 text-white rotate-180 shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'}`}>
                                            {activeIndex === index ? <FiMinus size={18} /> : <FiPlus size={18} />}
                                        </div>
                                    </button>
                                    
                                    <motion.div
                                        initial={false}
                                        animate={{ height: activeIndex === index ? 'auto' : 0, opacity: activeIndex === index ? 1 : 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 md:p-6 pt-0 border-t border-gray-50 dark:border-gray-700/50 mt-2 md:mt-0">
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Still Have Questions? */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary-700 to-primary-600 text-white text-center shadow-2xl shadow-primary-600/30 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                            
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Still have questions?</h2>
                            <p className="mb-8 opacity-90 text-sm md:text-base max-w-xl mx-auto relative z-10">Can't find the answer you're looking for? Our experienced real estate advisors are here to help you navigate your property journey.</p>
                            <a 
                                href="/contact" 
                                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 shadow-xl relative z-10"
                            >
                                Contact Support
                            </a>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default FAQPage;