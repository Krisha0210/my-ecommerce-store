import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  // Load cart on auth-change
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const apiItems = await api.getCart();
          // Merge local anonymous items if any
          const localItems = JSON.parse(localStorage.getItem('cart') || '[]');
          if (localItems.length > 0) {
            const merged = mergeCarts(apiItems, localItems);
            setCartItems(merged);
            await api.updateCart(merged);
            localStorage.removeItem('cart');
          } else {
            setCartItems(apiItems);
          }
        } catch (err) {
          console.error('Failed to load cart from API:', err);
        }
      } else {
        const local = localStorage.getItem('cart');
        setCartItems(local ? JSON.parse(local) : []);
      }
    };
    loadCart();
  }, [user]);

  const mergeCarts = (base, additional) => {
    const result = [...base];
    additional.forEach(item => {
      const idx = result.findIndex(i => i.productId === item.productId);
      if (idx > -1) {
        result[idx].quantity += item.quantity;
      } else {
        result.push(item);
      }
    });
    return result;
  };

  const syncCart = async (items) => {
    setCartItems(items);
    if (user) {
      try {
        await api.updateCart(items);
      } catch (err) {
        console.error('Failed to sync cart with API:', err);
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(item => item.productId === product.id);
    let updated;
    if (existingIndex > -1) {
      updated = cartItems.map((item, idx) => 
        idx === existingIndex 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updated = [
        ...cartItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity
        }
      ];
    }
    syncCart(updated);
  };

  const removeFromCart = (productId) => {
    const updated = cartItems.filter(item => item.productId !== productId);
    syncCart(updated);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    syncCart(updated);
  };

  const clearCart = () => {
    syncCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = parseFloat(cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2));

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartCount,
      cartSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
