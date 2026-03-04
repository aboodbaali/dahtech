// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Cart holds at most 1 item at a time (each product is unique used hardware)
  const [cartItem, setCartItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((product) => {
    setCartItem(product);
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback(() => {
    setCartItem(null);
  }, []);

  const clearCart = useCallback(() => {
    setCartItem(null);
    setIsOpen(false);
  }, []);

  return (
    <CartContext.Provider value={{
      cartItem, isOpen, setIsOpen,
      addToCart, removeFromCart, clearCart,
      itemCount: cartItem ? 1 : 0,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
