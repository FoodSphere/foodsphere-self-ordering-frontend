import Image from "next/image";
import { Plus } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface MenuItemProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  onClick?: () => void;
}

const MenuItemCard = ({
  id,
  title,
  price,
  imageUrl,
  onClick,
}: MenuItemProps) => {
  const { cartItems } = useCart();

  const totalQuantity = cartItems
    .filter((item) => item.menuId === id || item.id === id) // Check both for robustness
    .reduce((acc, item) => acc + item.quantity, 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer border border-gray-100 relative"
      onClick={onClick}
    >
      <div className="relative aspect-square w-full bg-gray-100">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Total Quantity Badge */}
        {totalQuantity > 0 && (
          <div className="absolute top-2 right-2 flex items-center justify-center bg-[var(--primary-orange-main)] text-white text-sm font-bold w-8 h-8 rounded-full shadow-md z-10 transition-transform animate-in zoom-in">
            {totalQuantity}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col">
        <h3 className="text-base text-center sm:text-left font-semibold text-gray-900 line-clamp-1">
          {title}
        </h3>
        <div className="flex sm:flex-row flex-col items-center justify-between mt-1">
          <span className="text-lg font-bold text-[var(--primary-orange-main)]">
            ฿{price.toFixed(2)}
          </span>

          <button
            onClick={handleAdd}
            className="p-2 rounded-full bg-[var(--primary-orange-main)] text-white hover:opacity-90 transition-opacity active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
