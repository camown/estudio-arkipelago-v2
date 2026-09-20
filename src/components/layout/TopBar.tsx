'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { useTheme } from '@/lib/themeContext';
import Logo from '@/components/ui/Logo';
import { Sun, Moon, LogOut } from 'lucide-react';

interface TopBarProps {
  user: User | null;
}

export function TopBar({ user }: TopBarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const { themeMode, toggleThemeMode } = useTheme();

  useEffect(() => {
    setCurrentDate(new Date());
    const interval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatFullTimestamp = (date: Date) => {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const dayNum = date.getDate();
    const year = date.getFullYear();

    return `${timeStr} - ${dayName}, ${monthName} ${dayNum}, ${year}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 18) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 w-full md:w-[calc(100%-16rem)] h-16 bg-surface-main border-b border-border-main z-40 flex items-center justify-between px-4 sm:px-6 text-text-main font-mono">
      {/* Left side: Logo on mobile, Timestamp on desktop (Matching Image 3) */}
      <div className="flex items-center gap-3">
        {/* Mobile only logo */}
        <div className="flex items-center gap-3 md:hidden">
          <Logo size={28} />
          <span className="font-bold text-xs tracking-wider uppercase">
            ESTUDIO ARKIPELAGO
          </span>
        </div>

        {/* Desktop live timestamp (Matching Image 3: 11:11:50 PM - SUN, SEP 20, 2026) */}
        <div className="hidden md:block text-xs font-semibold text-muted-main tracking-wider">
          {currentDate ? formatFullTimestamp(currentDate) : '--:--:-- --'}
        </div>
      </div>

      {/* Right side: Greeting, Role Badge, Theme Switcher, Sign Out */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {user && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="hidden sm:inline text-muted-main">
              {getGreeting()}, {user.name.toUpperCase()}
            </span>
            <span className="bg-surface-hover border border-border-main px-2 py-0.5 text-[10px] uppercase font-bold rounded">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Day / Night Theme Toggle */}
        <button
          onClick={toggleThemeMode}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-muted-main hover:text-text-main"
          title="Toggle Day/Night Mode"
        >
          {themeMode === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Sign Out */}
        <button
          onClick={() => {
            localStorage.removeItem('arkipelago_user');
            window.location.href = '/login';
          }}
          className="p-1.5 text-muted-main hover:text-accent-red transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
