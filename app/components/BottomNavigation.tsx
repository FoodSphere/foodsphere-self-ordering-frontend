"use client";

import { CreditCard, QrCode, ReceiptText, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/libs/utils";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size: number; strokeWidth: number }>;
  href: string;
  badge?: number;
}

const BottomNavigation = () => {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Menu",
      icon: UtensilsCrossed,
      href: "/menu",
    },
    {
      label: "My Order",
      icon: ReceiptText,
      href: "/my-order",
    },
    {
      label: "Payment",
      icon: CreditCard,
      href: "/payment",
    },
    {
      label: "Share QR",
      icon: QrCode,
      href: "/share-qr",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 safe-area-bottom z-50">
      <div className="flex justify-between items-center h-18">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1.5 relative",
                isActive
                  ? "text-[var(--primary-orange-main)] scale-105"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon size={28} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
