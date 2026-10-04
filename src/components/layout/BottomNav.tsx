'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User } from '@/types';


interface BottomNavProps {
  user?: User | null;
}

export function BottomNav({ user }: BottomNavProps) {
  const pathname = usePathname();

  // RBAC: filter items based on the user's role (same logic as Sidebar)
  const roleRank: Record<string, number> = {
    contractor: 1,
    junior_architect: 2,
    senior_architect: 3,
    partner: 4,
  };

  const userRank = roleRank[user?.role ?? 'junior_architect'] ?? 2;

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (!item.minRole) return true;
    const requiredRank = roleRank[item.minRole] ?? 1;
    return userRank >= requiredRank;
  });

  // Show first 5 accessible items on mobile bottom nav
  const bottomNavItems = filteredNavItems.slice(0, 5);


  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-surface-main border-t border-border-main flex items-center justify-around z-50 transition-colors"
    >
      {bottomNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            <item.icon
              className={cn(
                'w-5 h-5 transition-colors',
                isActive ? 'text-accent-cyan' : 'text-muted-main'
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
