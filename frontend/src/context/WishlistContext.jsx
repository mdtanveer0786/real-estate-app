import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated, user } = useAuth();

    // Load wishlist when user changes
    useEffect(() => {
        if (isAuthenticated && user?.wishlist) {
            // If user.wishlist contains full property objects
            if (user.wishlist.length > 0 && typeof user.wishlist[0] === 'object') {
                setWishlist(user.wishlist);
            }
            // If user.wishlist contains only IDs, fetch full details
            else if (user.wishlist.length > 0 && typeof user.wishlist[0] === 'string') {
                fetchWishlistDetails();
            }
        } else {
            setWishlist([]);
        }
    }, [isAuthenticated, user]);

    // Fetch full property details for wishlist
    const fetchWishlistDetails = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/wishlist');
            setWishlist(data);
        } catch (error) {
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (propertyId) => {
        if (!isAuthenticated) {
            toast.error('Please login to save properties');
            return false;
        }

        try {
            setLoading(true);
            await api.post(`/users/wishlist/${propertyId}`);

            // Refresh wishlist
            await fetchWishlistDetails();
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save property');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (propertyId) => {
        try {
            setLoading(true);
            await api.delete(`/users/wishlist/${propertyId}`);

            // Update local state
            setWishlist(prev => prev.filter(item => item._id !== propertyId));

            toast.success('Property removed from wishlist');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to remove property');
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (propertyId) => {
        return wishlist.some(item => item._id === propertyId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            refreshWishlist: fetchWishlistDetails,
        }}>
            {children}
        </WishlistContext.Provider>
    );
};