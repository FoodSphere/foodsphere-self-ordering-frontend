"use client";

import { apiGet } from "@/services/common";
import {
  component,
  componentMappedMenu,
  MenuItem,
  MenuItemResponse,
} from "@/types/menuType";
import { OrderItem, OrderMenuItem } from "@/types/orderType";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getCookie } from "@/libs/cookie";

interface MenuContextType {
  menus: MenuItem[];
  loadMenus: () => Promise<void>;
  mapOrderItemsToOrderMenuItems: (orderItems: OrderItem[]) => OrderMenuItem[];
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    const token = getCookie("accessToken");
    if (token) {
      const response = await apiGet("/menus");
      const data = response?.data ?? [];
      const menuItems: MenuItem[] = await Promise.all(data.map(async (item: MenuItemResponse) => {
        return {
          id: item.id,
          name: item.name,
          price: item.price,
          display_name: item.display_name,
          description: item.description,
          image_url: item.image_url,
          tags: item.tags,
          components: await mapComponentItemsToComponentMappedMenus(item.components),
        };
      }));
      setMenus(menuItems);
    }
  };

  const mapComponentItemsToComponentMappedMenus = async (
    components: component[]
  ): Promise<componentMappedMenu[]> => {
   const componentMappedMenus = await Promise.all(components.map(async (component) => {
      const res = await apiGet(`/menus/${component.menu_id}`);
      const menu = res?.data ?? null;
      return {
        menu_id: component.menu_id,
        name: menu?.name ?? "",
        image_url: menu?.image_url ?? null,
        quantity: component.quantity,
        price: menu?.price ?? 0,
        description: menu?.description ?? "",
      };
    }));
    return componentMappedMenus;
  };

  const mapOrderItemsToOrderMenuItems = useCallback(
    (orderItems: OrderItem[]): OrderMenuItem[] => {
      return orderItems.reduce((acc: OrderMenuItem[], orderItem) => {
        const menu = menus.find((m) => m.id === orderItem.menu_id);
        if (menu) {
          acc.push({
            id: orderItem.id,
            menu_id: orderItem.menu_id,
            name: menu.name,
            image_url: menu.image_url,
            note: orderItem.note ?? null,
            quantity: orderItem.quantity,
            price: menu.price,
            description: menu.description,
            components: menu.components,
          });
        }
        return acc;
      }, []);
    },
    [menus]
  );

  const contextValue = useMemo(
    () => ({ menus, loadMenus, mapOrderItemsToOrderMenuItems }),
    [menus, loadMenus, mapOrderItemsToOrderMenuItems]
  );

  return (
    <MenuContext.Provider value={contextValue}>{children}</MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
