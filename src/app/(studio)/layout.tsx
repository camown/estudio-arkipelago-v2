'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { ThemeProvider } from '@/lib/themeContext';
import { SidebarProvider, useSidebar } from '@/lib/sidebarContext';
import { TimeTrackingNudge } from '@/components/common/TimeTrackingNudge';
import { CommandPalette } from '@/components/common/CommandPalette';
import { StickyNotesOverlay } from '@/components/common/StickyNotesOverlay';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import {
  STORAGE_KEY,
  USER_EVENT_NAME,
  USER_CHANNEL_NAME,
  getProfileForEmail,
} from '@/lib/hooks/useAuth';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (!storedUser) return null;
    const parsed: User = JSON.parse(storedUser);
    const saved = getProfileForEmail(parsed.email);
    if (saved) {
      return {
        ...parsed,
        name: saved.name || parsed.name,
        phoneNumber: saved.phoneNumber || parsed.phoneNumber,
        avatarUrl: saved.avatarUrl || parsed.avatarUrl,
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <StudioLayoutContent>{children}</StudioLayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function StudioLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(getInitialUser);
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    // 1. Sync on custom user updated event in current tab
    const handleUserUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<User>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      } else {
        setUser(getInitialUser());
      }
    };

    // 2. Sync on storage event from another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === 'arkipelago_user_profiles') {
        setUser(getInitialUser());
      }
    };

    window.addEventListener(USER_EVENT_NAME, handleUserUpdated);
    window.addEventListener('storage', handleStorage);

    // 3. BroadcastChannel cross-tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(USER_CHANNEL_NAME);
        bc.onmessage = (msg) => {
          if (msg.data && 'user' in msg.data) {
            setUser(msg.data.user);
          }
        };
      } catch {}
    }

    return () => {
      window.removeEventListener(USER_EVENT_NAME, handleUserUpdated);
      window.removeEventListener('storage', handleStorage);
      bc?.close();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-main text-text-main flex flex-col md:flex-row transition-colors">
        <Sidebar user={user} />
        <main
          className={cn(
            "flex-1 pt-6 pb-24 md:pb-10 px-4 sm:px-6 md:px-10 w-full max-w-none font-sans antialiased transition-all duration-300 ease-in-out relative",
            isCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
          )}
        >
          <TopBar user={user} />
          <ErrorBoundary>{children}</ErrorBoundary>
          <TimeTrackingNudge />
          <CommandPalette />
          <StickyNotesOverlay />
        </main>

        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}
