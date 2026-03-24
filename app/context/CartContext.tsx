"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { apiPatch } from "@/services/common";
import { CartItem } from "@/types/cartType";
import { EHttpStatusCode } from "@/types/enum";
import { OrderPatchRequest } from "@/types/orderType";

import { toast } from "../components/ui/toast/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: number, note: string | null) => void;
  updateQuantity: (id: number, note: string | null, delta: number) => void;
  updateCartItem: (
    id: number,
    oldNote: string | null,
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
        toast({
          variant: "error",
          description: "Failed to parse cart items",
        });
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
        (i) => i.menu_id === item.menu_id && i.note === item.note
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
          menu_id: item.menu_id,
        },
      ];
    });
  };

  const removeFromCart = (id: number, note: string | null = null) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.menu_id === id && item.note === note))
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
          if (item.menu_id === id && item.note === note) {
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
    oldNote: string | null,
    note: string | null = null,
    updates: Partial<CartItem>
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.menu_id === id && item.note === oldNote
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

    const newOrderGroups: OrderPatchRequest[] = cartItems.map((item) => ({
      path: "/-",
      op: "add",
      value: {
        items: [
          {
            id: item.id,
            menu_id: item.menu_id,
            quantity: item.quantity,
            note: item.note,
          },
        ],
      },
    }));

    try {
      const response = await apiPatch("/orders", newOrderGroups);
      const status = response?.statusCode;

      if (status === EHttpStatusCode.SUCCESS) {
        toast({
          icon: "ToastSuccess",
          variant: "success",
          description: "Order placed successfully.",
        });
        clearCart();
      } else if (status === EHttpStatusCode.CONFLICT) {
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Some of menu unavailable. Please try again.",
        });
      } else {
        toast({
          icon: "ToastError",
          variant: "error",
          description: "Failed to place order. Please try again.",
        });
      }
    } catch (error) {
      toast({
        icon: "ToastError",
        variant: "error",
        description: "Failed to place order. Please try again.",
      });
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
