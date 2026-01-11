"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface modifier {
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // Unique Cart Item ID
  menuId?: string; // Original Menu ID
  title: string;
  price: number; // Final unit price (base + modifiers)
  basePrice: number; // Original price
  imageUrl?: string;
  quantity: number;
  notes?: string;
  modifiers?: modifier[];
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateCartItem: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load from local storage on mount (optional but good UX)
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart items", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    setCartItems((prev) => {
      // Simple check by ID. Ideally should check if modifiers match too for splitting items,
      // but for now keeping it simple as per request or just adding as new if needed.
      // If we want distinct items for different customizations, we'd need a unique 'cartId' distinct from 'menuId'.
      // For this implementation, I will treat every add as a unique entry if it has customizations?
      // Or just push to array?
      // Let's stick to the existing logic: if ID matches, increment quantity.
      // BUT if we are customizing, we likely want a separate entry if options differ.
      // To simplify for this specific task "add details... update":
      // I will generate a unique ID for the cart item if it's being added with customizations, OR
      // just assume the user handles quantities in the modal.

      // Let's just append for now if it's a new "add from menu" action with potential customization.
      // Actually, standard behavior: check if Same ID + Same Options exists.
      // Simplest approach: Just add it as a new item in the array if it's coming from the menu?
      // But the existing code deduplicates by ID.
      // Let's Modify logic: If newItem has modifiers/notes, add as new item (maybe generic ID suffix).
      // Or: just always find exact match.

      const existingIndex = prev.findIndex(
        (i) =>
          (i.menuId === item.id || i.id === item.id) &&
          JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
          i.notes === item.notes
      );

      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += item.quantity || 1;
        return newItems;
      }

      // If no exact match (including decorators), add as new.
      // Note: this might create duplicates of "ID 1" so React keys need to be valid.
      // If `item.id` is the MENU ID, we might need a unique `cartItemId`.
      // The current app uses `item.id` as key. This will break if multiple "Steaks" are in the list.
      // I will generate a random UUID for the cart item ID to be safe, storing originalId if needed.
      // But `removeFromCart` uses ID.
      // Let's assume for this step, we just use the provided Item.

      return [
        ...prev,
        {
          ...item,
          quantity: item.quantity || 1,
          menuId: item.id,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
