"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, History, Pencil } from "lucide-react";
import { useCart, CartItem } from "@/app/context/CartContext";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";
import OrderHistoryModal from "@/app/components/OrderHistoryModal";
import { useState } from "react";

const OrderRender = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    totalPrice,
    updateCartItem,
    clearCart,
  } = useCart();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleCartItemClick = (item: CartItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleUpdateItem = (
    item: CartItem,
    quantity: number,
    notes: string,
    modifiers: { name: string; price: number }[]
  ) => {
    // Update the item in the cart
    updateCartItem(item.id, {
      quantity,
      notes,
      modifiers,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">My Order</h1>
        </div>
        <div className="flex gap-4 mr-4">
          <button
            onClick={() => {
              clearCart();
            }}
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={24} />
          </button>
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
          >
            <History size={24} />
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 pt-4 flex flex-col gap-4 overflow-hidden">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
            <p className="text-lg font-medium">Your cart is empty</p>
            <Link
              href="/menu"
              className="text-[var(--primary-orange-main)] font-semibold hover:underline"
            >
              Go to Menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pb-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-xl shadow-sm flex gap-3 items-center active:bg-gray-50 transition-colors cursor-pointer flex-shrink-0"
                onClick={() => handleCartItemClick(item)}
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 transform scale-75">
                      No Img
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between h-20 py-1">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800 line-clamp-1 text-xl">
                      {item.title}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCartItemClick(item);
                        }}
                        className="text-gray-400 hover:text-[var(--primary-orange-main)] cursor-pointer"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-0 m-0">
                    <span className="text-sm text-gray-500">
                      {[
                        ...(item.modifiers?.map((m) => m.name) || []),
                        item.notes,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-end">
                    <span className="font-bold text-[var(--primary-orange-main)]">
                      ฿{(item.price * item.quantity).toFixed(2)}
                    </span>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-1 border border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, -1);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-[var(--primary-orange-main)] shadow-sm active:scale-95"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold min-w-[1.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, 1);
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--primary-orange-main)] text-white shadow-sm active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Summary */}
      {cartItems.length > 0 && (
        <div className="px-4 pb-4 bg-gray-50 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-[var(--primary-orange-main)]">
                ฿{totalPrice.toFixed(2)}
              </span>
            </div>
            <button className="w-full bg-[var(--primary-orange-main)] text-white py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all">
              Checkout
            </button>
          </div>
        </div>
      )}

      <OrderCustomizationModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleUpdateItem}
        mode="edit"
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  );
};

export default OrderRender;
