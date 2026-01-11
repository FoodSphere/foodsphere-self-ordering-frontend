"use client";

import { useState } from "react";
import BottomNavigation from "@/app/components/BottomNavigation";
import CategoryTabs from "@/app/components/CategoryTabs";
import MenuItemCard from "@/app/components/MenuItemCard";
import { useCart, CartItem } from "@/app/context/CartContext";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";

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

const MENU_ITEMS = [
  {
    id: "1",
    title: "Pork Steak",
    price: 109.0,
    category: "Steak",
    imageUrl:
      "https://images.unsplash.com/photo-1600891965050-681fb7c34dcb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "French Fries",
    price: 79.0,
    category: "Appetizer",
    imageUrl:
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Fried Onion",
    price: 89.0,
    category: "Appetizer",
    imageUrl:
      "https://images.unsplash.com/photo-1618556653033-56f8f8319e64?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Chicken Nuggets",
    price: 89.0,
    category: "Appetizer",
    imageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "Beef Burger",
    price: 139.0,
    category: "Burger",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "Fish Burger",
    price: 129.0,
    category: "Burger",
    imageUrl:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=800&auto=format&fit=crop",
  },
];

const MenuRender = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();
  const [selectedMenuItem, setSelectedMenuItem] = useState<CartItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuItemClick = (item: any) => {
    // Convert menu item to cart item structure (mocking quantity/options)
    setSelectedMenuItem({
      ...item,
      quantity: 1,
      basePrice: item.price,
    });
    setIsModalOpen(true);
  };

  const handleAddToCart = (
    item: CartItem,
    quantity: number,
    notes: string,
    modifiers: { name: string; price: number }[]
  ) => {
    // Add to cart with customizations
    addToCart({
      ...item,
      quantity: quantity, // This is initial quantity from modal
      notes,
      modifiers,
      price: item.basePrice + modifiers.reduce((sum, m) => sum + m.price, 0),
    });
    setIsModalOpen(false);
  };

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header / Search placeholder if needed or just title */}
      {/* For now, just spacing top */}

      <CategoryTabs
        categories={CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onSearch={setSearchQuery}
      />

      <main className="flex-1 px-4 pt-4 overflow-y-auto mb-25">
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
              title={item.title}
              price={item.price}
              imageUrl={item.imageUrl}
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
