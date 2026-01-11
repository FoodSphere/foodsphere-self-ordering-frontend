'use client'

import { UtensilsCrossed, ShoppingCart, CreditCard, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/libs/utils'

import { useCart } from '@/app/context/CartContext'

interface NavItem {
  label: string
  icon: React.ComponentType<{ size: number; strokeWidth: number }>
  href: string
  badge?: number
}

const BottomNavigation = () => {
  const pathname = usePathname()
  const { totalItems } = useCart()

  const navItems: NavItem[] = [
    {
      label: 'Menu',
      icon: UtensilsCrossed,
      href: '/menu',
    },
    {
      label: 'Cart',
      icon: ShoppingCart,
      href: '/cart',
      badge: totalItems
    },
    {
      label: 'Payment',
      icon: CreditCard,
      href: '/payment',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 safe-area-bottom z-50">
      <div className="flex justify-between items-center h-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1.5 relative",
                 isActive ? "text-[var(--primary-orange-main)] scale-105" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <div className="relative">
                <item.icon size={32} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNavigation
