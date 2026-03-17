import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiUsers, FiHome, FiAward, FiHeart, FiTarget, FiEye } from 'react-icons/fi';

const AboutPage = () => {
    const stats = [
        { icon: FiHome, value: '5000+', label: 'Properties Sold' },
        { icon: FiUsers, value: '10000+', label: 'Happy Clients' },
        { icon: FiAward, value: '15+', label: 'Years Experience' },
        { icon: FiHeart, value: '50+', label: 'Awards Won' },
    ];

    const values = [
        {
            icon: FiTarget,
            title: 'Integrity',
            description: 'We believe in complete transparency in all our dealings.'
        },
        {
            icon: FiHeart,
            title: 'Customer First',
            description: 'Your satisfaction is our top priority.'
        },
        {
            icon: FiEye,
            title: 'Innovation',
            description: 'We constantly evolve to serve you better.'
        }
    ];

    const team = [
        {
            name: 'Rajesh Sharma',
            role: 'Founder & CEO',
            image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=400&h=400&q=80',
            bio: '20+ years in real estate industry, previously worked with top developers across India.',
        },
        {
            name: 'Priya Patel',
            role: 'Head of Sales',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
            bio: 'Expert in luxury properties with a track record of 500+ successful deals in metropolitan cities.',
        },
        {
            name: 'Amit Kumar',
            role: 'Senior Agent',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
            bio: 'Specializes in commercial real estate and investment properties with high ROI.',
        },
        {
            name: 'Neha Singh',
            role: 'Customer Relations',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80',
            bio: 'Ensures smooth communication, RERA compliance, and handles client inquiries professionally.',
        }
    ];

    return (
        <>
            <Helmet>
                <title>About Us | EstateElite</title>
                <meta name="description" content="Learn about EstateElite - India's most trusted real estate platform. Our mission, vision, values, and team of expert real estate professionals." />
            </Helmet>

            <div className="bg-white dark:bg-gray-900">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="container-custom text-center relative z-10">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            About EstateElite
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl max-w-3xl mx-auto opacity-90"
                        >
                            We're on a mission to make property search simple, transparent, and enjoyable for everyone.
                        </motion.p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="section-padding">
                    <div className="container-custom">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                                        <stat.icon className="text-3xl text-primary-600" />
                                    </div>
                                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="section-padding bg-gray-50 dark:bg-gray-800">
                    <div className="container-custom">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Founded in 2010, EstateElite started with a simple idea: make real estate transactions transparent and hassle-free.
                                    What began as a small team of passionate real estate professionals has grown into India's most trusted property platform.
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Today, we've helped over 10,000 families find their dream homes and assisted countless investors in making smart property decisions.
                                    Our commitment to integrity, innovation, and customer satisfaction sets us apart.
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We're not just about buying and selling properties; we're about building relationships and creating lasting value for our clients.
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
                                    alt="Our Office"
                                    className="rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-primary-600 text-white p-6 rounded-lg shadow-xl">
                                    <p className="text-4xl font-bold">15+</p>
                                    <p className="text-sm">Years of Excellence</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="section-padding">
                    <div className="container-custom">
                        <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card p-8 text-center"
                                >
                                    <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                                        <value.icon className="text-3xl text-primary-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="section-padding bg-gray-50 dark:bg-gray-800">
                    <div className="container-custom">
                        <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
                        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                            Our experienced team of real estate professionals is dedicated to helping you find your perfect property.
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {team.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card p-6 text-center"
                                >
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100"
                                    />
                                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                    <p className="text-primary-600 mb-3">{member.role}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default AboutPage;