'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS, MOCK_PROJECTS } from '@/lib/constants';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { useTheme } from '@/lib/themeContext';
import Logo from '@/components/ui/Logo';

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { themeMode, toggleThemeMode } = useTheme();

  const {
    isClockedIn,
    clockIn,
    clockOut,
    selectedProjectId,
    setSelectedProjectId,
    elapsedTime,
  } = useClockIn();

  return (
    <div className="hidden md:flex flex-col fixed left-0 top-0 w-64 h-screen border-r border-border-main bg-surface-main z-50 text-text-main font-mono shadow-sm">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Studio Brand Header */}
        <div className="p-6 border-b border-border-main flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <Logo size={36} />
            <div>
              <h1 className="font-bold text-sm tracking-wider uppercase leading-none">
                ESTUDIO
              </h1>
              <p className="text-xs font-light tracking-[0.2em] text-muted-main uppercase">
                ARKIPELAGO
              </p>
            </div>
          </Link>

          {/* Theme Toggle Button (Day Light / Night Light) */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-muted-main hover:text-text-main"
            title={themeMode === 'light' ? 'Switch to Night Mode' : 'Switch to Day Light'}
          >
            {themeMode === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active Work Tracking Widget */}
        <div className="p-4 mt-auto">
          <div className="border border-border-main rounded-xl p-4 bg-surface-hover/50 space-y-3">
            <h2 className="text-[11px] text-muted-main uppercase font-bold tracking-wider">
              ACTIVE WORK TRACKING
            </h2>

            <div className="text-xs">
              {isClockedIn ? (
                <div className="flex flex-col">
                  <span className="text-accent-cyan font-bold truncate">
                    {MOCK_PROJECTS.find((p) => p.id === selectedProjectId)?.name || 'UNKNOWN PROJECT'}
                  </span>
                  <span className="text-lg font-bold font-mono">{elapsedTime}</span>
                </div>
              ) : (
                <div className="text-accent-red italic">NO SESSION ACTIVE</div>
              )}
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] text-muted-main uppercase font-semibold">
                ACTIVE PROJECT
              </label>
              <select
                value={selectedProjectId || MOCK_PROJECTS[0]?.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={isClockedIn}
                className="bg-surface-main border border-border-main text-text-main p-2 text-xs font-mono focus:outline-none focus:border-accent-cyan rounded-md disabled:opacity-50 uppercase"
              >
                {MOCK_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={isClockedIn ? () => clockOut() : () => clockIn(selectedProjectId || MOCK_PROJECTS[0]?.id)}
              className={cn(
                'w-full py-2 border font-bold text-xs uppercase rounded-md transition-all',
                isClockedIn
                  ? 'border-accent-red text-accent-red hover:bg-accent-red hover:text-white'
                  : 'border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-black'
              )}
            >
              {isClockedIn ? 'CLOCK-OUT' : 'CLOCK-IN'}
            </button>

            <div className="text-[10px] font-bold uppercase text-center pt-1">
              STATUS:{' '}
              {isClockedIn ? (
                <span className="text-accent-cyan">CLOCKED IN</span>
              ) : (
                <span className="text-accent-red">NOT CLOCKED IN</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-border-main p-4 bg-surface-main flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 shrink-0 rounded-full border border-border-strong flex items-center justify-center font-bold text-xs bg-surface-hover text-text-main">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold uppercase truncate">{user?.name || 'GUEST'}</span>
            <span className="text-[10px] text-muted-main uppercase truncate">
              {user?.role?.replace('_', ' ') || 'VIEWER'}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('arkipelago_user');
            router.push('/login');
          }}
          className="text-muted-main hover:text-accent-red transition-colors p-1 rounded"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
