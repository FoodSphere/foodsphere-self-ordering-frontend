import Image from "next/image";
import { Pencil, Trash2, Minus, Plus } from "lucide-react";
import { CartItem } from "@/types/cartType";

interface CartItemCardProps {
  item: CartItem;
  handleCartItemClick: (item: CartItem) => void;
  removeFromCart: (itemId: number, note: string | null) => void;
  updateQuantity: (itemId: number, note: string | null, delta: number) => void;
}

const CartItemCard = ({
  item,
  handleCartItemClick,
  removeFromCart,
  updateQuantity,
}: CartItemCardProps) => {
  return (
    <div
      key={`${item.menuId}-${item.notes}`}
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
              onClick={() => {handleCartItemClick(item);}}
              className="text-gray-400 hover:text-[var(--primary-orange-main)] cursor-pointer"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFromCart(item.menuId, item.notes);
              }}
              className="text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="p-0 m-0">
          <span className="text-sm text-gray-500">
            {item.notes}
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
                updateQuantity(item.menuId, item.notes, -1);
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
                updateQuantity(item.menuId, item.notes, 1);
              }}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--primary-orange-main)] text-white shadow-sm active:scale-95"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
