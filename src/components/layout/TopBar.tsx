'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { useTheme } from '@/lib/themeContext';
import Logo from '@/components/ui/Logo';
import { Sun, Moon, LogOut, Bell, MessageSquare, Clock } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'message' | 'reminder';
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

interface TopBarProps {
  user: User | null;
}

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date | null>(() => new Date());
  const { themeMode, toggleThemeMode } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'message',
      title: 'NEW DIRECT MESSAGE',
      description: 'Arch. Maria Cruz sent a photo update on Makati Tower Phase 2.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 'n2',
      type: 'reminder',
      title: 'PROJECT DEADLINE REMINDER',
      description: 'Casa Verde Residence schematic review due by EOD Friday.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 'n3',
      type: 'reminder',
      title: 'SITE VISIT SCHEDULE',
      description: 'BGC Cultural Pavilion site survey scheduled for tomorrow 10:00 AM.',
      time: '3h ago',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  useEffect(() => {
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
    <header className="w-full h-16 bg-surface-main border-b border-border-main flex items-center justify-between px-4 sm:px-6 text-text-main font-mono shrink-0 mb-6 rounded-xl shadow-2xs relative z-40">
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

      {/* Right side: Greeting, Role Badge, Notifications Bell, Theme Switcher, Sign Out */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <span className="hidden sm:inline text-muted-main uppercase font-bold tracking-wider">
            {getGreeting()}, {user?.name ? user.name.toUpperCase() : 'TESTING3'}
          </span>
          <span className="bg-surface-hover border border-border-strong px-2.5 py-1 text-[11px] uppercase font-bold text-text-main rounded-md tracking-wider shadow-2xs">
            {user?.role ? user.role.replace('_', ' ') : 'JUNIOR ARCHITECT'}
          </span>
        </div>

        {/* NOTIFICATION BELL DROPDOWN */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-full border border-border-main bg-surface-main hover:bg-surface-hover transition-colors text-muted-main hover:text-text-main relative shadow-2xs"
            title="Notifications & Reminders"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-surface-main">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover (Theme-Aware Facebook Style Overlay) */}
          {isNotifOpen && (
            <div
              className={`absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl border-2 z-[100] overflow-hidden font-mono transition-all ${
                themeMode === 'light'
                  ? 'bg-white border-[#0284C7] text-[#18181B] shadow-[0_20px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/5'
                  : 'bg-[#18181B] border-[#0284C7] text-white shadow-[0_25px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10'
              }`}
            >
              {/* Header */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  themeMode === 'light'
                    ? 'bg-[#F4F4F5] border-[#E4E4E7]'
                    : 'bg-[#121215] border-[#27272A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <h3
                    className={`font-extrabold text-sm uppercase tracking-wider ${
                      themeMode === 'light' ? 'text-[#18181B]' : 'text-white'
                    }`}
                  >
                    NOTIFICATIONS
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-[#0284C7]/15 border border-[#0284C7]/30 text-[#0284C7] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-extrabold text-[#0284C7] uppercase hover:underline"
                  >
                    MARK ALL AS READ
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div
                className={`max-h-80 overflow-y-auto divide-y ${
                  themeMode === 'light'
                    ? 'divide-[#E4E4E7] bg-white'
                    : 'divide-[#27272A] bg-[#18181B]'
                }`}
              >
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
                      );
                    }}
                    className={`p-4 transition-all flex items-start gap-3 cursor-pointer ${
                      themeMode === 'light'
                        ? notif.unread
                          ? 'bg-[#F0F9FF] hover:bg-[#E0F2FE]'
                          : 'bg-white hover:bg-[#F4F4F5]'
                        : notif.unread
                        ? 'bg-[#0284C7]/15 hover:bg-[#0284C7]/25'
                        : 'bg-[#18181B] hover:bg-[#27272A]'
                    }`}
                  >
                    {/* Icon Column */}
                    <div
                      className={`mt-0.5 p-2 rounded-xl border shrink-0 ${
                        themeMode === 'light'
                          ? 'bg-[#F4F4F5] border-[#E4E4E7]'
                          : 'bg-[#121215] border-[#27272A]'
                      }`}
                    >
                      {notif.type === 'message' ? (
                        <MessageSquare className="w-4 h-4 text-[#0284C7]" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-extrabold text-xs uppercase truncate ${
                            themeMode === 'light' ? 'text-[#18181B]' : 'text-white'
                          }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-bold text-[#71717A] shrink-0">
                          {notif.time}
                        </span>
                      </div>
                      <p
                        className={`text-xs leading-relaxed line-clamp-2 ${
                          themeMode === 'light' ? 'text-[#52525B]' : 'text-[#A1A1AA]'
                        }`}
                      >
                        {notif.description}
                      </p>
                    </div>

                    {/* Unread Blue/Cyan Dot */}
                    {notif.unread && (
                      <span className="w-2.5 h-2.5 bg-[#0284C7] rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(2,132,199,0.6)]" title="Unread" />
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className={`p-3 border-t text-center ${
                  themeMode === 'light'
                    ? 'bg-[#F4F4F5] border-[#E4E4E7] text-[#71717A]'
                    : 'bg-[#121215] border-[#27272A] text-[#A1A1AA]'
                }`}
              >
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[10px] font-extrabold uppercase tracking-widest hover:underline transition-colors"
                >
                  CLOSE NOTIFICATIONS
                </button>
              </div>
            </div>
          )}
        </div>

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
            router.push('/login');
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
