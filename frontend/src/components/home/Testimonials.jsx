import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa'; // Assuming react-icons/fa is available (it is part of react-icons)
// Swiper integration
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import { testimonialsData } from '../../data/testimonialsData';

const Testimonials = () => {
    return (
        <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
            {/* Decorative Background Accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

            <div className="container-custom relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">What Our <span className="text-primary-600">Clients Say</span></h2>
                        <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full mb-6 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-gray-800 border-2 border-primary-600 rounded-full"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Discover why thousands of Indian home buyers and sellers trust EstateElite for their real estate journey.
                        </p>
                    </motion.div>
                </div>

                <div className="px-4 md:px-12 lg:px-24">
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1200: { slidesPerView: 3 }
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        className="pb-16"
                    >
                        {testimonialsData.map((testimonial, index) => (
                            <SwiperSlide key={testimonial.id} className="h-auto">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-8 h-full flex flex-col relative group hover:-translate-y-2 transition-transform duration-300 border border-gray-100 dark:border-gray-800 z-10"
                                >
                                    {/* Quote Icon Watermark */}
                                    <div className="absolute top-6 right-8 text-primary-100 dark:text-gray-800 text-6xl opacity-40 group-hover:text-primary-200 dark:group-hover:text-gray-700 transition-colors -z-10">
                                        &quot;
                                    </div>

                                    <div className="flex mb-6">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <FiStar key={i} className="text-yellow-400 fill-current text-sm mr-1" />
                                        ))}
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-300 italic mb-8 flex-grow leading-relaxed relative z-20">
                                        "{testimonial.content}"
                                    </p>

                                    <div className="flex items-center mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="relative">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                                className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white dark:border-gray-800 shadow-md"
                                            />
                                            <div className="absolute bottom-0 right-3 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
                                            <p className="text-xs font-semibold tracking-wider uppercase text-primary-600 mt-1">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;