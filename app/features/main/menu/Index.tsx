"use client";

import { useState } from "react";
import CategoryTabs from "@/app/components/CategoryTabs";
import MenuItemCard from "@/app/components/MenuItemCard";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";
import { useCart} from "@/app/context/CartContext";
import { useMenu } from "@/app/context/MenuContext";
import { CartItem } from "@/types/cartType";
import { MenuItem } from "@/types/menuType";

// Mock Data
const CATEGORIES = [
  "All",
  "Steak",
  "Appetizer",
  "Spaghetti",
  "Burger",
  "Salad & Sausage",
  "Beverage",
];

const MenuRender = () => {
  const { menus } = useMenu();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const [selectedMenuItem, setSelectedMenuItem] = useState<CartItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuItemClick = (item: MenuItem) => {
    const Menu: CartItem = {
      menuId: item.id,
      title: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.image_url,
      quantity: 1,
      notes: "",
    }

    setSelectedMenuItem(Menu);
    setIsModalOpen(true);
  };

  const handleAddToCart = (item: CartItem, quantity: number, notes: string) => {
    // Add to cart with notes
    addToCart({
      ...item,
      quantity: quantity,
      notes,
      price: item.price,
    });
    setIsModalOpen(false);
  };

  const filteredItems = menus.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.tag.includes(activeCategory);
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header / Search placeholder if needed or just title */}
      {/* For now, just spacing top */}

      <CategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onSearch={setSearchQuery}
      />

      <main className="flex-1 px-4 pt-4 overflow-y-auto pb-20 mb-20">
        {/* Category Title */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">{activeCategory}</h2>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
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
      </main>

      <OrderCustomizationModal
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
