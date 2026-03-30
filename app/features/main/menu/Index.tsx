"use client";

import { useEffect, useState } from "react";
import CategoryTabs from "@/app/components/CategoryTabs";
import MenuItemCard from "@/app/components/MenuItemCard";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";
import { useCart } from "@/app/context/CartContext";
import { CartItem } from "@/types/cartType";
import {
  MenuItem,
  MenuItemResponse,
  component,
  componentMappedMenu,
} from "@/types/menuType";
import { OrderMenuItem } from "@/types/orderType";
import { apiGet } from "@/services/common";
import { tag } from "@/types/menuType";
import { Bill } from "@/types/billType";
import { EBillStatus, EMenuStatus } from "@/types/enum";
import { redirect } from "next/navigation";
import { Restaurant } from "@/types/restaurantType";

const MenuRender = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const [selectedMenuItem, setSelectedMenuItem] = useState<CartItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuItemClick = (item: MenuItem) => {
    const Menu: CartItem = {
      id: 0, // Placeholder for new cart item
      menu_id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      quantity: 1,
      note: null,
      components: item.components,
    };

    setSelectedMenuItem(Menu);
    setIsModalOpen(true);
  };

  const handleAddToCart = (
    item: CartItem | OrderMenuItem,
    quantity: number,
    note: string | null = null
  ) => {
    // Add to cart with notes
    addToCart({
      ...(item as CartItem),
      quantity: quantity,
      note: note,
      price: item.price,
    });
    setIsModalOpen(false);
  };

  const filteredItems = menus.filter((item) => {
    const isPromotion = item.components && item.components.length > 0;
    const isOther = (!item.tags || item.tags.length === 0) && !isPromotion;

    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Other" && isOther) ||
      (activeCategory === "Promotion" && isPromotion) ||
      (item.tags && item.tags.some((tag) => tag.name === activeCategory));
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const fetchMenus = async () => {
    const res = await apiGet(`/menus?stock_availability=true&status=${EMenuStatus.ACTIVE}`);
    const menusData = res?.data ?? [];

    const menusDataWithComponents: MenuItem[] = menusData.map(
      (menu: MenuItemResponse) => {
        const components = menu.components.map((component: component) => {
          const componentMenu = menusData.find(
            (m: MenuItem) => m.id === component.menu_id
          );
          const componentMappedMenu: componentMappedMenu = {
            ...component,
            menu_id: component.menu_id,
            quantity: component.quantity,
            name: componentMenu?.name,
            price: componentMenu?.price,
            image_url: componentMenu?.image_url,
            description: componentMenu?.description,
          };
          return componentMappedMenu;
        });

        return {
          ...menu,
          components: components,
        };
      }
    );

    setMenus(menusDataWithComponents);
  };

  const fetchTags = async () => {
    const res = await apiGet("/tags");
    const catagories = res?.data.map((tag: tag) => tag.name) ?? [];
    setCategories(["All", "Promotion", ...catagories, "Other"]);
  };

  const fetchBill = async () => {
    const res = await apiGet("/bill");
    const billData = res?.data ?? null;
    setBill(billData);

    if (billData?.status === EBillStatus.PAID) {
      return redirect(`/payment/success?bill_id=${billData.id}`);
    } else if (billData?.status === EBillStatus.COMPLETED) {
      return redirect("/thank-you");
    }
  };

  const fetchRestaurant = async () => {
    const res = await apiGet("/restaurant");
    const restaurantData = res?.data ?? null;
    setRestaurant(restaurantData);
  };

  useEffect(() => {
    fetchMenus();
    fetchTags();
    fetchBill();
    fetchRestaurant();
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 pb-[80px] overflow-hidden">
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        restaurantName={restaurant?.restaurant_name || ""}
        tableName={bill?.table.name || ""}
        onSelectCategory={setActiveCategory}
        onSearch={setSearchQuery}
      />

      <main className="flex-1 px-4 pt-4 overflow-y-auto min-h-0 custom-scrollbar">
        <div>
          {categories.slice(1).map((category) => {
            const categoryItems = filteredItems.filter((item) => {
              const isPromotion = item.components && item.components.length > 0;
              const isOther =
                (!item.tags || item.tags.length === 0) && !isPromotion;

              if (activeCategory === "All") return (category === "Promotion" && isPromotion) || (category === "Other" && isOther) || (item.tags && item.tags.some((tag) => tag.name === category));
              if (category === "Other" && activeCategory === "Other") return isOther;
              if (category === "Promotion" && activeCategory === "Promotion") return isPromotion;
              return (
                item.tags && item.tags.some((tag) => tag.name === category && activeCategory === category)
              );
            });
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="mb-4">
                {/* Category Title */}
                <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                {/* Category Items */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {categoryItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      imageUrl={item.image_url}
                      onClick={() => handleMenuItemClick(item)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-8">
              {activeCategory === "All" ? (
                <p className="text-gray-500">No menu found</p>
              ) : (
                <p className="text-gray-500">No {activeCategory} menu found</p>
              )}
            </div>
          )}
        </div>
      </main>

      <OrderCustomizationModal
        orderGroupId={null}
        item={selectedMenuItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddToCart}
        mode="add"
      />
    </div>
  );
};

export default MenuRender;
