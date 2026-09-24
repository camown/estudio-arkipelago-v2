'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS, MOCK_PROJECTS } from '@/lib/constants';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { LogOut } from 'lucide-react';
import { useClockIn } from '@/lib/hooks/useClockIn';
import Logo from '@/components/ui/Logo';

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
        {/* Top Studio Brand Header - Centered */}
        <div className="py-6 px-4 border-b border-border-main flex items-center justify-center text-center">
          <Link href="/dashboard" className="flex items-center justify-center group w-full">
            <Logo size={135} />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.filter((item) => {
            if (!item.minRole) return true;
            const roleRank: Record<string, number> = {
              contractor: 1,
              junior_architect: 2,
              senior_architect: 3,
              partner: 4,
            };
            const userRank = roleRank[user?.role || 'junior_architect'] || 2;
            const requiredRank = roleRank[item.minRole] || 1;
            return userRank >= requiredRank;
          }).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium tracking-normal transition-all',
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Active Work Tracking Widget */}
        {(() => {
          const availableProjects = user?.role === 'contractor' && user?.assignedProjectCodes
            ? MOCK_PROJECTS.filter((p) => user.assignedProjectCodes?.includes(p.code))
            : MOCK_PROJECTS;
          const defaultProjectId = availableProjects[0]?.id || '';

          return (
            <div className="p-4 mt-auto">
              <div className="border border-border-main rounded-xl p-4 bg-surface-hover/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] text-muted-main font-semibold tracking-wide">
                    Active Time Tracking
                  </h2>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase",
                    isClockedIn ? "bg-accent-cyan/15 text-accent-cyan" : "bg-surface-hover text-muted-main"
                  )}>
                    {isClockedIn ? "CLOCKED IN" : "OFFLINE"}
                  </span>
                </div>

                <div className="text-xs">
                  {isClockedIn ? (
                    <div className="flex flex-col">
                      <span className="text-accent-cyan font-bold truncate">
                        {availableProjects.find((p) => p.id === selectedProjectId)?.name || 'Unknown Project'}
                      </span>
                      <span className="text-xl font-bold font-mono tracking-tight">{elapsedTime}</span>
                    </div>
                  ) : (
                    <div className="text-muted-main italic text-[11px]">No active session</div>
                  )}
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-muted-main font-medium">
                    Project Attribution
                  </label>
                  <select
                    value={selectedProjectId || defaultProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={isClockedIn}
                    className="bg-surface-main border border-border-main text-text-main p-2 text-xs font-mono focus:outline-none focus:border-accent-cyan rounded-lg disabled:opacity-50"
                  >
                    {availableProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={isClockedIn ? () => clockOut() : () => clockIn(selectedProjectId || defaultProjectId)}
                  className={cn(
                    'w-full py-2.5 border font-semibold text-xs rounded-lg transition-all shadow-xs',
                    isClockedIn
                      ? 'border-accent-red text-accent-red hover:bg-accent-red hover:text-white'
                      : 'border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-black'
                  )}
                >
                  {isClockedIn ? 'Clock Out' : 'Clock In'}
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* User Footer Profile */}
      <div className="border-t border-border-main p-4 bg-surface-main flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 shrink-0 rounded-full border border-border-strong flex items-center justify-center font-bold text-xs bg-surface-hover text-text-main">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold truncate text-text-main">{user?.name || 'Guest'}</span>
            <span className="text-[10px] text-muted-main capitalize truncate">
              {user?.role?.replace('_', ' ') || 'Viewer'}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('arkipelago_user');
            router.push('/login');
          }}
          className="text-muted-main hover:text-accent-red transition-colors p-1.5 rounded-lg hover:bg-surface-hover"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
