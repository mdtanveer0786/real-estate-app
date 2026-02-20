import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const PropertySearch = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        location: '',
        type: 'buy',
        minPrice: '',
        maxPrice: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchParams.location) params.append('city', searchParams.location);
        if (searchParams.type) params.append('type', searchParams.type);
        if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
        if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);

        navigate(`/properties?${params.toString()}`);
    };

    return (
        <section id="search-section" className="py-16 bg-gray-50 dark:bg-gray-800">
            <div className="container-custom">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Find Your Perfect Property</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Search through thousands of properties to find your dream home
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Location */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-2">Location</label>
                                <div className="relative">
                                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter city or area"
                                        className="input-field pl-10"
                                        value={searchParams.location}
                                        onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Property Type */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Purpose</label>
                                <select
                                    className="input-field"
                                    value={searchParams.type}
                                    onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                                >
                                    <option value="buy">Buy</option>
                                    <option value="rent">Rent</option>
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Price</label>
                                <input
                                    type="number"
                                    placeholder="Any"
                                    className="input-field"
                                    value={searchParams.maxPrice}
                                    onChange={(e) => setSearchParams({ ...searchParams, maxPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            <FiSearch /> Search Properties
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default PropertySearch;