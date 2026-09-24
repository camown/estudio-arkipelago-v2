'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { ThemeProvider } from '@/lib/themeContext';
import { SidebarProvider, useSidebar } from '@/lib/sidebarContext';
import { TimeTrackingNudge } from '@/components/common/TimeTrackingNudge';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { User } from '@/types';
import { cn } from '@/lib/utils';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem('arkipelago_user');
    return storedUser ? JSON.parse(storedUser) : null;
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
  const [user] = useState<User | null>(getInitialUser);
  const { isCollapsed } = useSidebar();

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
        </main>

        <BottomNav />
      </div>
    </ErrorBoundary>
  );
}

