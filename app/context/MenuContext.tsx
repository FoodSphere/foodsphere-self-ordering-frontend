"use client";

import { apiGet } from "@/services/common";
import { MenuItem, MenuItemResponse } from "@/types/menuType";
import { OrderItem, OrderMenuItem } from "@/types/orderType";
import React, { createContext, useContext, useState, useEffect } from "react";

interface MenuContextType {
  menus: MenuItem[];
  mapOrderItemsToOrderMenuItems: (orderItems: OrderItem[]) => OrderMenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const response = await apiGet("/menus");
    const data = response?.data ?? [];
    const menuItems = data.map((item: MenuItemResponse) => {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        display_name: item.display_name,
        description: item.description,
        image_url:
          "https://images.unsplash.com/photo-1600891965050-681fb7c34dcb?q=80&w=800&auto=format&fit=crophttps://images.unsplash.com/photo-1600891965050-681fb7c34dcb?q=80&w=800&auto=format&fit=crop",
          // menu.image_url,
        tag: ["Steak"], // mock tags
      };
    });
    setMenus(menuItems);
  };

  const mapOrderItemsToOrderMenuItems = (
    orderItems: OrderItem[]
  ): OrderMenuItem[] => {
    return orderItems.reduce((acc: OrderMenuItem[], orderItem) => {
      const menu = menus.find((m) => m.id === orderItem.menu_id);
      if (menu) {
        acc.push({
          menu_id: orderItem.menu_id,
          name: menu.name,
          image_url:
            "https://images.unsplash.com/photo-1600891965050-681fb7c34dcb?q=80&w=800&auto=format&fit=crophttps://images.unsplash.com/photo-1600891965050-681fb7c34dcb?q=80&w=800&auto=format&fit=crop",
          // menu.image_url,
          note: orderItem.note ?? null,
          quantity: orderItem.quantity,
          price_per_item: menu.price,
        });
      }
      return acc;
    }, []);
  };

  return (
    <MenuContext.Provider value={{ menus, mapOrderItemsToOrderMenuItems }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
