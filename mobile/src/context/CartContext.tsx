import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextValue {
  restaurantId: string | null;
  restaurantName: string;
  items: CartItem[];
  addItem: (restaurantId: string, restaurantName: string, item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (rId: string, rName: string, item: CartItem) => {
    // If from a different restaurant, clear the cart first
    if (restaurantId && restaurantId !== rId) {
      setItems([]);
    }
    setRestaurantId(rId);
    setRestaurantName(rName);
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const clearCart = () => {
    setRestaurantId(null);
    setRestaurantName('');
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ restaurantId, restaurantName, items, addItem, removeItem, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
