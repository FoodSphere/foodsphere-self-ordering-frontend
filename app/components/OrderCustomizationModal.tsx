"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Minus, Plus } from "lucide-react";
import { CartItem } from "@/app/context/CartContext";

interface OrderCustomizationModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    item: CartItem,
    quantity: number,
    notes: string,
    modifiers: { name: string; price: number }[]
  ) => void;
  mode: "add" | "edit";
}

const MOCK_OPTIONS = [
  {
    title: "Extra Size",
    maxSelect: 1,
    options: [{ name: "Extra Size", price: 10 }],
  },
  {
    title: "Topping",
    maxSelect: 4, // allow multiple
    options: [
      { name: "Fried Egg", price: 10 },
      { name: "Omelette", price: 10 },
      { name: "Boiled Egg", price: 10 },
    ],
  },
];

const OrderCustomizationModal = ({
  item,
  isOpen,
  onClose,
  onConfirm,
  mode,
}: OrderCustomizationModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedModifiers, setSelectedModifiers] = useState<
    { name: string; price: number }[]
  >([]);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(mode === "edit" ? item.quantity : 1);
      setNotes(item.notes || "");
      setSelectedModifiers(item.modifiers || []);
    }
  }, [isOpen, item, mode]);

  if (!isOpen || !item) return null;

  const handleModifierToggle = (modifier: { name: string; price: number }) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.name === modifier.name);
      if (exists) {
        return prev.filter((m) => m.name !== modifier.name);
      } else {
        return [...prev, modifier];
      }
    });
  };

  const calculateTotalPrice = () => {
    const modifiersPrice = selectedModifiers.reduce(
      (sum, m) => sum + m.price,
      0
    );
    return (item.basePrice + modifiersPrice) * quantity;
  };

  const handleConfirm = () => {
    onConfirm(item, quantity, notes, selectedModifiers);
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
              Crispy pork yummy yummy!!!
            </p>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Options */}
          {MOCK_OPTIONS.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex justify-between items-end">
                <h3 className="font-bold text-lg text-gray-800">
                  {group.title}
                </h3>
                <span className="text-xs text-gray-400">
                  Select up to {group.maxSelect} option
                </span>
              </div>

              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isSelected = selectedModifiers.some(
                    (m) => m.name === opt.name
                  );
                  return (
                    <label
                      key={opt.name}
                      className="flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[var(--primary-orange-main)] border-[var(--primary-orange-main)]"
                              : "border-gray-300 group-hover:border-[var(--primary-orange-main)]"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                          )}
                        </div>
                        <span
                          className={`text-base ${
                            isSelected
                              ? "text-gray-800 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {opt.name}
                        </span>
                      </div>
                      <span className="text-gray-400">฿ {opt.price}</span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => handleModifierToggle(opt)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="h-px bg-gray-100" />

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg text-gray-800">
              Additional Request
            </h3>
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
