import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'];

const PriceEstimator = () => {
    const [form, setForm] = useState({
        city: '', propertyType: 'apartment', bedrooms: 2, bathrooms: 1, area: '', type: 'buy',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const { data } = await api.post('/ai/predict-price', {
                ...form,
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                area: Number(form.area),
            });
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to estimate price');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

    const confidenceColors = {
        high: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400',
        medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
        low: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    };

    const inputClass = 'w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">AI Price Estimator</h2>
                        <p className="text-sm text-white/70">Get an estimated price based on market data</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            <FiMapPin className="inline w-3 h-3 mr-1" /> City
                        </label>
                        <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="e.g. Mumbai" required />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Property Type</label>
                        <select name="propertyType" value={form.propertyType} onChange={handleChange} className={inputClass}>
                            {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Listing Type</label>
                        <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                            <option value="buy">Buy</option>
                            <option value="rent">Rent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Bedrooms</label>
                        <input name="bedrooms" type="number" min="0" max="10" value={form.bedrooms} onChange={handleChange} className={inputClass} required />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Bathrooms</label>
                        <input name="bathrooms" type="number" min="0" max="10" value={form.bathrooms} onChange={handleChange} className={inputClass} required />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Area (sq ft)</label>
                        <input name="area" type="number" min="100" value={form.area} onChange={handleChange} className={inputClass} placeholder="e.g. 1200" required />
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all"
                >
                    {loading ? 'Analyzing...' : '🔮 Estimate Price'}
                </motion.button>
            </form>

            {/* Result */}
            {error && <div className="px-6 pb-6 text-red-500 text-sm">{error}</div>}

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 pb-6 space-y-4"
                >
                    {result.estimatedPrice ? (
                        <>
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 text-center">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Estimated Price</p>
                                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                                    {formatPrice(result.estimatedPrice)}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {formatPrice(result.priceRange.low)} – {formatPrice(result.priceRange.high)}
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Price/sqft: <strong className="text-gray-900 dark:text-white">{formatPrice(result.pricePerSqft)}</strong></span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${confidenceColors[result.confidence]}`}>
                                    {result.confidence} confidence
                                </span>
                            </div>

                            <p className="text-xs text-gray-400">Based on {result.comparablesCount} comparable properties</p>
                        </>
                    ) : (
                        <div className="text-center text-sm text-gray-500 py-4">
                            {result.message || 'Not enough data for this area'}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default PriceEstimator;
