import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [prevUser, setPrevUser] = useState(user);

  const getInitialWishlist = () => {
    if (!user) return [];
    const key = `sentara_wishlist_${user.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
    return [];
  };

  const [wishlist, setWishlist] = useState(getInitialWishlist);

  // Synchronously reset wishlist state when user session changes
  if (user !== prevUser) {
    setPrevUser(user);
    setWishlist(getInitialWishlist());
  }

  // Persist wishlist changes
  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    if (user) {
      const key = `sentara_wishlist_${user.id}`;
      localStorage.setItem(key, JSON.stringify(newWishlist));
    }
  };

  const toggleWishlist = (productId) => {
    if (!user) {
      throw new Error('Please login to manage your wishlist');
    }
    if (wishlist.includes(productId)) {
      saveWishlist(wishlist.filter(id => id !== productId));
      return false; // Removed
    } else {
      saveWishlist([...wishlist, productId]);
      return true; // Added
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
