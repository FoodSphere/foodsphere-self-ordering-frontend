"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { CartItem } from "@/types/cartType";
import { OrderMenuItem } from "@/types/orderType";
import { componentMappedMenu } from "@/types/menuType";

const ComponentMenuCard = ({
  component,
}: {
  component: componentMappedMenu;
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {component.image_url ? (
          <Image
            src={component.image_url}
            alt={component.name}
            width={50}
            height={50}
            className="rounded-lg"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        <span className="font-semibold">{component.name}</span>
      </div>
      <span className="font-semibold">x{component.quantity}</span>
    </div>
  );
};

interface OrderCustomizationModalProps {
  orderGroupId: number | null;
  item: CartItem | OrderMenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: ((item: CartItem | OrderMenuItem, quantity: number, notes: string | null, orderGroupId: number) => void);
  mode: "add" | "edit";
}

const OrderCustomizationModal = ({
  orderGroupId,
  item,
  isOpen,
  onClose,
  onConfirm,
  mode,
}: OrderCustomizationModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(mode === "edit" ? item.quantity : 1);
      setNote(item.note || null);
    }
  }, [isOpen, item, mode]);

  if (!isOpen || !item) return null;

  const calculateTotalPrice = () => {
    return item.price * quantity;
  };

  const handleConfirm = () => {
    if (mode === "edit") {
      if (!orderGroupId) {
        throw new Error("Order group ID is required for edit mode");
      }
      onConfirm(item, quantity, note, orderGroupId);
    } else if (mode === "add") {
      onConfirm(item, quantity, note, 0); // 0 is a placeholder for cart items
    } else {
      throw new Error("Invalid mode or callback function is not defined");
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Image */}
        <div className="relative h-48 w-full shrink-0">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <X size={20} className="text-gray-800" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Desc */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {item.description}
            </p>
          </div>

          <div className="h-px bg-gray-100 mb-0" />
          
          {/* Components */}
          {item.components && item.components.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-800">Components</h3>
              {item.components.map((component) => (
                <div key={component.menu_id} className="space-y-3 border border-gray-200 rounded-xl p-3">
                  <ComponentMenuCard component={component} />
            </div>
          ))}
          </div>
          )}

          <div className="h-px bg-gray-100 mb-0" />

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-800">Notes</h3>
            <textarea
              value={note || ""}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g. No veggies"
              className="w-full border border-gray-200 rounded-xl p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-orange-main)]/50 focus:border-[var(--primary-orange-main)] resize-none h-24"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-4 bg-gray-100 rounded-full px-4 py-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold w-4 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 shadow-sm"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add/Update Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[var(--primary-orange-main)] text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex justify-between px-6"
          >
            <span className="sm:hidden">
              {mode === "add" ? "Add" : "Update"}
            </span>
            <span className="hidden sm:inline">
              {mode === "add" ? "Add to Basket" : "Update Order"}
            </span>
            <span>฿ {calculateTotalPrice().toFixed(0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCustomizationModal;
