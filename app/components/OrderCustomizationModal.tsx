"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { CartItem } from "@/types/cartType";

interface OrderCustomizationModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: CartItem, quantity: number, notes: string) => void;
  mode: "add" | "edit";
}

const OrderCustomizationModal = ({
  item,
  isOpen,
  onClose,
  onConfirm,
  mode,
}: OrderCustomizationModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(mode === "edit" ? item.quantity : 1);
      setNotes(item.notes || "");
    }
  }, [isOpen, item, mode]);

  if (!isOpen || !item) return null;

  const calculateTotalPrice = () => {
    return item.price * quantity;
  };

  const handleConfirm = () => {
    onConfirm(item, quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header Image */}
        <div className="relative h-48 w-full shrink-0">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
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
            <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {item.description}
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-800">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
