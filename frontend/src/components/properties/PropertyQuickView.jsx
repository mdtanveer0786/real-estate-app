import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin, FiMaximize2, FiHome, FiTag, FiCalendar, FiEye } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyQuickView = ({ property, isOpen, onClose }) => {
  if (!property) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:w-[800px] md:max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col md:flex-row"
            style={{ left: '50%', top: '50%', x: '-50%', y: '-50%' }}
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <img
                src={property.images?.[0]?.url ? getImageUrl(property.images[0].url) : 'https://via.placeholder.com/800x600?text=No+Image'}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
                  property.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                  {property.status}
                </span>
              </div>
              {property.images?.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-xs">
                  +{property.images.length - 1} more photos
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {property.title}
                  </h2>
                  <p className="text-primary-600 font-bold text-xl">
                    ₹{property.price?.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FiMapPin className="mr-2 text-primary-500" />
                  <span>{property.location?.address}, {property.location?.city}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center">
                    <FiHome className="mr-3 text-primary-500" />
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="text-sm font-semibold capitalize">{property.propertyType}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center">
                    <FiTag className="mr-3 text-primary-500" />
                    <div>
                      <p className="text-xs text-gray-500">Listing</p>
                      <p className="text-sm font-semibold capitalize">For {property.type}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center">
                    <FiMaximize2 className="mr-3 text-primary-500" />
                    <div>
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="text-sm font-semibold">{property.area?.value} {property.area?.unit}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl flex items-center">
                    <FiCalendar className="mr-3 text-primary-500" />
                    <div>
                      <p className="text-xs text-gray-500">Listed on</p>
                      <p className="text-sm font-semibold">{new Date(property.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4">
                    {property.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiEye className="mr-1" />
                    {property.views || 0} views
                  </div>
                  <button
                    onClick={() => window.open(`/property/${property._id}`, '_blank')}
                    className="text-primary-600 font-semibold hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    View Full Details <FiMaximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PropertyQuickView;
