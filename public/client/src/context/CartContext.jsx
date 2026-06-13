import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [prevUser, setPrevUser] = useState(user);
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartInitialized, setCartInitialized] = useState(!user);

  // Synchronously reset cart state when user session changes
  if (user !== prevUser) {
    setPrevUser(user);
    setCartInitialized(!user);
    setCart([]);
    setSubtotal(0);
    setItemCount(0);
    setCoupon(null);
  }

  // Derive discount instead of keeping it in state
  let discount = 0;
  if (coupon) {
    let discountVal = 0;
    if (coupon.type === 'percent') {
      discountVal = Math.floor((subtotal * coupon.value) / 100);
    } else if (coupon.type === 'flat') {
      discountVal = coupon.value;
    }
    discount = Math.min(discountVal, subtotal);
  }

  // Delivery configuration: Free shipping on orders >= ₹499, else ₹40
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  // Fetch cart whenever the user logs in/changes
  const fetchCart = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.cart.get();
      if (data.success) {
        setCart(data.cart);
        setSubtotal(data.subtotal);
        setItemCount(data.itemCount);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
      setCartInitialized(true);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        fetchCart();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, fetchCart]);

  const addToCart = async (productId, quantity = 1, color = null, size = null) => {
    if (!user) {
      throw new Error('Please login to add items to cart');
    }
    setError(null);
    try {
      const data = await api.cart.add(productId, quantity, color, size);
      if (data.success) {
        await fetchCart();
        return data;
      }
    } catch (err) {
      setError(err.message || 'Failed to add item');
      throw err;
    }
  };

  const updateQuantity = async (productId, quantity, color = null, size = null) => {
    setError(null);
    try {
      const data = await api.cart.update(productId, quantity, color, size);
      if (data.success) {
        await fetchCart();
        return data;
      }
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
      throw err;
    }
  };

  const removeFromCart = async (productId, color = null, size = null) => {
    setError(null);
    try {
      const data = await api.cart.remove(productId, color, size);
      if (data.success) {
        await fetchCart();
        return data;
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
      throw err;
    }
  };

  const applyCoupon = async (code) => {
    if (!user) {
      throw new Error('Please login to apply coupons');
    }
    setError(null);
    try {
      const data = await api.coupons.apply(code, subtotal);
      if (data.success) {
        setCoupon(data.coupon);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Failed to apply coupon');
      setCoupon(null);
      throw err;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const clearCart = async () => {
    setError(null);
    try {
      const data = await api.cart.clear();
      if (data.success) {
        setCart([]);
        setSubtotal(0);
        setItemCount(0);
        setCoupon(null);
        return data;
      }
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      throw err;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        itemCount,
        coupon,
        discount,
        deliveryFee,
        total,
        loading,
        error,
        cartInitialized,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
