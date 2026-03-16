import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const SearchSuggestions = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            fetchSuggestions();
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery]);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/search/suggestions?q=${debouncedQuery}`);
            setSuggestions(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (searchQuery = query) => {
        if (searchQuery.trim()) {
            navigate(`/properties?keyword=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const highlightMatch = (text, query) => {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ?
                <span key={index} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">{part}</span> :
                part
        );
    };

    return (
        <div className="relative w-full max-w-2xl" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search by location, property name, or area..."
                    className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />

                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (query.length >= 2 || suggestions.length > 0) && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
                            <span className="ml-2">Searching...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setQuery(suggestion);
                                        handleSearch(suggestion);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                    <FiMapPin className="text-gray-400 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {highlightMatch(suggestion, query)}
                                    </span>
                                </button>
                            ))}

                            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handleSearch()}
                                    className="w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg flex items-center justify-center space-x-2"
                                >
                                    <FiSearch />
                                    <span>Search for "{query}"</span>
                                </button>
                            </div>
                        </div>
                    ) : query.length >= 2 ? (
                        <div className="p-4 text-center text-gray-500">
                            <p>No suggestions found</p>
                            <button
                                onClick={() => handleSearch()}
                                className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Search for "{query}"
                            </button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchSuggestions;