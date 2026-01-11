"use client";

import { X, Clock } from "lucide-react";

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock Data based on the provided image
const orderHistoryData = [
  {
    id: 1,
    quantity: 1,
    name: "Shabu Standard",
    items: [
      "3x เนื้อปลากะพง",
      "2x ไข่ปลาหมึก",
      "2x มอสซาเรลล่าชีส",
      "2x เนื้อเสือร้องไห้",
    ],
    price: 0.0,
    time: "19:25",
  },
  {
    id: 2,
    quantity: 1,
    name: "Shabu Standard",
    items: [
      "1x สันคอหมู",
      "1x หมูเด้งชีส",
      "1x คุโรบูตะชีส",
      "1x เนื้อ Us ชอตเพลต",
      "1x เนื้อแองกัส",
      "1x หมูนุ่มตอกไข่",
    ],
    price: 0.0,
    time: "19:18",
  },
  {
    id: 3,
    quantity: 1,
    name: "Shabu Standard",
    items: ["1x สันคอหมู", "1x หมูเด้งชีส"],
    price: 0.0,
    time: "19:13",
  },
  {
    id: 4,
    quantity: 1,
    name: "Shabu Standard",
    items: ["1x สันคอหมู", "1x หมูเด้งชีส"],
    price: 0.0,
    time: "19:13",
  },
];

const OrderHistoryModal = ({ isOpen, onClose }: OrderHistoryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="bg-white md:bg-black/50 min-h-screen w-full flex items-center justify-center fixed inset-0 z-999 md:backdrop-blur-sm md:p-4 animate-in fade-in duration-200">
      {/* Card Container - Full screen on mobile, Card on Desktop */}
      <div className="w-full h-full md:h-auto md:max-h-[75vh] md:max-w-2xl bg-white md:rounded-xl shadow-none md:shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <h2 className="text-xl md:text-lg font-bold text-gray-800">
            Order History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-grow md:max-h-100 overflow-y-auto flex-1 p-0 bg-white">
          {orderHistoryData.map((order) => (
            <div
              key={order.id}
              className="p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-1 gap-4">
                <div className="flex gap-4 flex-1">
                  <span className="text-[var(--primary-orange-main)] font-bold text-xl md:text-lg min-w-[2rem] md:min-w-[1.5rem] mt-0.5">
                    {order.quantity}x
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-xl md:text-lg leading-tight mb-2">
                      {order.name}
                    </h3>
                    {order.items.length > 0 && (
                      <div className="flex flex-col text-gray-600 text-base md:text-sm space-y-1">
                        {order.items.map((item, idx) => (
                          <span key={idx}>- {item}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[var(--primary-orange-main)] font-bold text-xl md:text-lg">
                    ฿ {order.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 md:text-[var(--primary-orange-main)] text-sm font-medium mt-1">
                    <Clock size={16} />
                    <span>{order.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end bg-white sticky bottom-0 z-10">
          <button
            className="w-full md:w-auto bg-[#dc2626] text-white px-8 py-3 md:py-2 rounded-xl md:rounded-lg font-bold md:font-medium text-lg md:text-base hover:bg-red-700 transition-colors active:scale-95 shadow-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryModal;
