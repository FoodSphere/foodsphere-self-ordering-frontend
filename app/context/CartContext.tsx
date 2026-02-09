"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiPost } from "@/services/common";
import { OrderGroupRequest } from "@/types/orderType";
import { CartItem } from "@/types/cartType";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number, note: string | null) => void;
  updateQuantity: (id: number, note: string | null, delta: number) => void;
  updateCartItem: (
    id: number,
    note: string | null,
    updates: Partial<CartItem>
  ) => void;
  clearCart: () => void;
  placeOrder: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load from local storage
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
      const existingIndex = prev.findIndex(
        (i) => i.menuId === item.menuId && i.notes === item.notes
      );

      if (existingIndex > -1) {
        const newItems = [...prev];
        newItems[existingIndex].quantity += item.quantity || 1;
        return newItems;
      }

      // If no exact match add as new.
      return [
        ...prev,
        {
          ...item,
          quantity: item.quantity || 1,
          menuId: item.menuId,
        },
      ];
    });
  };

  const removeFromCart = (id: number, note: string | null = null) => {
    setCartItems((prev) =>
      prev.filter((item) => item.menuId !== id && item.notes !== note)
    );
  };

  const updateQuantity = (
    id: number,
    note: string | null = null,
    delta: number
  ) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.menuId === id && item.notes === note) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const updateCartItem = (
    id: number,
    note: string | null = null,
    updates: Partial<CartItem>
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.menuId === id && item.notes === note
          ? { ...item, ...updates }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = async () => {
    if (cartItems.length === 0) return;

    const newOrderGroup: OrderGroupRequest = {
      items: cartItems.map((item) => ({
        menu_id: item.menuId,
        quantity: item.quantity,
        note: item.notes,
      })),
    };

    const response = await apiPost("/orders", newOrderGroup);
    const data = response.statusCode;

    if (data === 201) {
      clearCart();
    }
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
        placeOrder,
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
