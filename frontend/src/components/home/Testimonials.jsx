import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const testimonials = [
    {
        id: 1,
        name: 'John Smith',
        role: 'Home Buyer',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'EstateElite made finding my dream home so easy. The platform is intuitive and the agents were incredibly helpful throughout the process.',
        rating: 5,
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        role: 'Property Investor',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'I\'ve used many real estate platforms, but EstateElite stands out. The property recommendations were spot-on and the whole process was seamless.',
        rating: 5,
    },
    {
        id: 3,
        name: 'Michael Brown',
        role: 'First-time Buyer',
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'As a first-time home buyer, I was nervous, but the team guided me through every step. Found the perfect apartment within my budget!',
        rating: 5,
    },
];

const Testimonials = () => {
    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Don't just take our word for it - hear from some of our satisfied clients
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6"
                        >
                            <div className="flex items-center mb-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h3 className="font-semibold">{testimonial.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                                </div>
                            </div>

                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FiStar key={i} className="text-yellow-400 fill-current" />
                                ))}
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.content}"</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;