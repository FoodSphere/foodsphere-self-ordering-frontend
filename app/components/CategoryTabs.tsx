"use client";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/libs/utils";
import { useRef } from "react";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onSearch: (query: string) => void;
}

const CategoryTabs = ({
  categories,
  activeCategory,
  onSelectCategory,
  onSearch,
}: CategoryTabsProps) => {
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
    <div className="w-full bg-white sticky top-0 z-10 shadow-sm flex flex-col z-50">
      <div className="px-4 py-2">
        <h2 className="text-xl font-bold text-gray-800">Hell's Kitchen</h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search menu..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-orange-main)]"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
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
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-base font-medium transition-colors",
                  activeCategory === category
                    ? "bg-[var(--primary-orange-main)] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {category}
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

export default CategoryTabs;
