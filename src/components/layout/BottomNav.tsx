'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  // Show key navigation items
  const bottomNavItems = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-surface-main border-t border-border-main flex items-center justify-around z-50 transition-colors">
      {bottomNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            <item.icon 
              className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-accent-cyan" : "text-muted-main"
              )} 
            />
            {isActive && (
              <span className="absolute bottom-2 w-1.5 h-1.5 bg-accent-cyan rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
