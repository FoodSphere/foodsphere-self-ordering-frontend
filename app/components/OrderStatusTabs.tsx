"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/libs/utils";
import { useRef } from "react";

interface OrderStatusTabsProps {
  orderStatus: string[];
  activeOrderStatus: string;
  onSelectOrderStatus: (orderStatus: string) => void;
}

const OrderStatusTabs = ({
  orderStatus,
  activeOrderStatus,
  onSelectOrderStatus,
}: OrderStatusTabsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full bg-white sticky top-0 shadow-sm flex flex-col z-50">
      <div className="px-4">
        <h1 className="text-xl font-bold text-gray-800">My Order</h1>
      </div>
      <div className="flex justify-between items-center w-full pb-2">
        <button
          onClick={() => scroll("left")}
          className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-600 hover:text-[var(--primary-orange-main)] transition-colors ml-1"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-x-auto scrollbar-hide mx-2"
        >
          <div className="flex gap-2 whitespace-nowrap">
            {orderStatus.map((orderStatus) => (
              <button
                key={orderStatus}
                onClick={() => onSelectOrderStatus(orderStatus)}
                className={cn(
                  "px-4 py-2 rounded-full text-base font-medium transition-colors",
                  activeOrderStatus === orderStatus
                    ? "bg-[var(--primary-orange-main)] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => scroll("right")}
          className="p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-600 hover:text-[var(--primary-orange-main)] transition-colors mr-1"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default OrderStatusTabs;
