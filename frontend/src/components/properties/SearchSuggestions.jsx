import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageHelper';
import { useDebounce } from '../../hooks/useDebounce';
import propertyService from '../../services/propertyService';

const SearchSuggestions = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const navigate = useNavigate();

    useEffect(() => {
        if (debouncedQuery.length > 1) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const data = await propertyService.searchProperties(debouncedQuery);
            setSuggestions(data.properties);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery('');
        setShowSuggestions(false);
        if (onSelect) {
            onSelect(suggestion);
        } else {
            navigate(`/property/${suggestion._id}`);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setShowSuggestions(false);
            navigate(`/properties?keyword=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative w-full max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search by location, property type, or keyword..."
                    className="w-full px-6 py-4 pr-12 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:bg-gray-800 dark:text-white text-lg"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition"
                >
                    <FiSearch size={20} />
                </button>
            </form>

            <AnimatePresence>
                {showSuggestions && (query.length > 1) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
                                <span className="ml-2">Searching...</span>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <>
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion._id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full px-4 py-3 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left border-b last:border-0 border-gray-100 dark:border-gray-700"
                                    >
                                        <img
                                            src={getImageUrl(suggestion.images[0]?.url)}
                                            alt={suggestion.title}
                                            className="w-12 h-12 rounded-lg object-cover mr-3"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium">{suggestion.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                                <FiMapPin className="mr-1" size={12} />
                                                {suggestion.location.city}
                                            </p>
                                            <p className="text-sm font-semibold text-primary-600">
                                                ₹{suggestion.price.toLocaleString()}
                                                {suggestion.type === 'rent' && '/month'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setShowSuggestions(false);
                                        navigate(`/properties?keyword=${encodeURIComponent(query)}`);
                                    }}
                                    className="w-full p-3 text-center text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition"
                                >
                                    View all results for "{query}"
                                </button>
                            </>
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                No properties found matching "{query}"
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchSuggestions;