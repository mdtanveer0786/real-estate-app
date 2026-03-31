import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiMapPin, FiMaximize2, FiHome, FiTag, 
  FiCalendar, FiEye, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyQuickView = ({ property, isOpen, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!property) return null;

  const images = property.images?.length > 0 
    ? property.images 
    : [{ url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23f3f4f6'/%3E%3Cpath d='M340 240h120v30h-30v60h-60v-60h-30z' fill='%23d1d5db'/%3E%3C/svg%3E` }];

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md md:hidden transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Left Side: Image Gallery */}
            <div className="w-full md:w-3/5 h-[300px] sm:h-[400px] md:h-auto relative bg-gray-100 dark:bg-gray-800">
              <img
                src={getImageUrl(images[activeImageIndex].url)}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Status Badge */}
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl border border-white/20 backdrop-blur-md ${
                  property.status === 'available' 
                    ? 'bg-emerald-500/90 text-white' 
                    : 'bg-orange-500/90 text-white'
                }`}>
                  {property.status}
                </span>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-medium">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-2/5 p-6 sm:p-8 overflow-y-auto bg-white dark:bg-gray-900">
              <div className="hidden md:flex justify-end mb-2">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <FiTag className="w-4 h-4" />
                    For {property.type}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {property.title}
                  </h2>
                  <p className="text-3xl font-black text-primary-600 mt-2">
                    ₹{property.price?.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-gray-500 dark:text-gray-400">
                  <FiMapPin className="w-5 h-5 mt-1 flex-shrink-0 text-primary-500" />
                  <span className="text-sm sm:text-base">
                    {property.location?.address}, {property.location?.city}, {property.location?.state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-1 text-gray-400">
                      <FiHome className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Type</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{property.propertyType}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-1 text-gray-400">
                      <FiMaximize2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Area</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{property.area?.value} {property.area?.unit}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-4 sm:line-clamp-6">
                    {property.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <FiEye className="w-4 h-4" />
                      {property.views || 0}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="w-4 h-4" />
                      {new Date(property.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`/property/${property._id}`, '_blank')}
                    className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    View Details
                    <FiMaximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PropertyQuickView;
