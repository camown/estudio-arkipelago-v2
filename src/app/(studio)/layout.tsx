'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { ThemeProvider } from '@/lib/themeContext';
import { User } from '@/types';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('arkipelago_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
        router.push('/login');
      }
    }
  }, [router]);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-bg-main text-text-main flex flex-col md:flex-row transition-colors">
        <Sidebar user={user} />
        <TopBar user={user} />

        <main className="flex-1 ml-0 md:ml-64 pt-20 pb-24 md:pb-10 px-6 md:px-10 w-full max-w-none font-mono transition-colors">
          {children}
        </main>

        <BottomNav />
      </div>
    </ThemeProvider>
  );
}
