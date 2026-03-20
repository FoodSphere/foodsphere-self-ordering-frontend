"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Trash2, History } from "lucide-react";
import OrderCustomizationModal from "@/app/components/OrderCustomizationModal";
import OrderHistoryModal from "@/app/components/OrderHistoryModal";
import CartItemCard from "@/app/components/CartItemCard";
import { useCart } from "@/app/context/CartContext";
import { CartItem } from "@/types/cartType";
import { OrderMenuItem } from "@/types/orderType";
import { Bill } from "@/types/billType";
import { apiGet } from "@/services/common";
import { EBillStatus } from "@/types/enum";
import { redirect } from "next/navigation";

const CartRender = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    totalPrice,
    updateCartItem,
    clearCart,
    placeOrder,
  } = useCart();

  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [bill, setBill] = useState<Bill | null>(null);

  const handleCartItemClick = (item: CartItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleUpdateItem = (
    item: CartItem | OrderMenuItem,
    quantity: number,
    note: string | null = null
  ) => {
    // Update the item in the cart
    updateCartItem(item.menu_id, note, {
      quantity,
      note,
    });
    setIsModalOpen(false);
  };

  const fetchBill = async () => {
    const response = await apiGet(`/bill`);
    const billData = response?.data;
    setBill(billData);

    if (billData?.status === EBillStatus.PAID) {
      clearCart();
      return redirect(`/payment/success?bill_id=${billData.id}`);
    } else if (billData?.status === EBillStatus.COMPLETED) {
      clearCart();
      return redirect("/thank-you");
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/menu"
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">My Cart</h1>
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
            <p className="text-lg font-medium">Your cart is empty.</p>
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
              <CartItemCard
                key={`${item.menu_id}-${item.note}`}
                item={item}
                handleCartItemClick={handleCartItemClick}
                removeFromCart={removeFromCart}
                updateQuantity={updateQuantity}
              />
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
            <button
              onClick={() => {
                placeOrder();
                // Optionally navigate specifically or just close modal/cleared state
                // The cart will become empty, showing the "Cart is empty" view
              }}
              className="w-full bg-[var(--primary-orange-main)] text-white py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      <OrderCustomizationModal
        orderGroupId={0} // 0 is a placeholder for cart items
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

export default CartRender;
