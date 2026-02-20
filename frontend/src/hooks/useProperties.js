import { useState, useEffect } from 'react';
import api from '../services/api';
import { useDebounce } from './useDebounce';

export function useProperties(initialFilters = {}) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
    });

    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        fetchProperties();
    }, [debouncedFilters, pagination.page]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page,
                ...filters,
            });

            const { data } = await api.get(`/properties?${params}`);
            setProperties(data.properties);
            setPagination({
                page: data.page,
                pages: data.pages,
                total: data.total,
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch properties');
        } finally {
            setLoading(false);
        }
    };

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const setPage = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    return {
        properties,
        loading,
        error,
        filters,
        updateFilters,
        pagination,
        setPage,
        refetch: fetchProperties,
    };
}