"use client";

import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartButton = () => {
  const { totalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    router.push("/cart");
  };

  if (totalItems === 0 || pathname === "/cart") return null;

  return (
    <button
      className="fixed bottom-24 md:right-8 right-4 z-50 bg-[var(--primary-orange-main)] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative pr-1">
        <ShoppingCart size={26} strokeWidth={2.5} />
        <span className="absolute -top-2 -right-2 bg-white text-[var(--primary-orange-main)] text-base font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-[var(--primary-orange-main)]">
          {totalItems}
        </span>
      </div>
    </button>
  );
};

export default CartButton;
