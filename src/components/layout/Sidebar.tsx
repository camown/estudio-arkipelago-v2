'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS, MOCK_PROJECTS } from '@/lib/constants';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { LogOut, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { useSidebar } from '@/lib/sidebarContext';
import Logo from '@/components/ui/Logo';

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const {
    isClockedIn,
    clockIn,
    clockOut,
    selectedProjectId,
    setSelectedProjectId,
    elapsedTime,
  } = useClockIn();

  const availableProjects = user?.role === 'contractor' && user?.assignedProjectCodes
    ? MOCK_PROJECTS.filter((p) => user.assignedProjectCodes?.includes(p.code))
    : MOCK_PROJECTS;
  const defaultProjectId = availableProjects[0]?.id || '';

  const filteredNavItems = NAV_ITEMS.filter((item) => {
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
  });

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 h-screen border-r border-border-main bg-surface-main z-50 text-text-main font-mono shadow-sm transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {/* Top Studio Brand Header with Collapse Toggle */}
        {!isCollapsed ? (
          <div className="py-5 px-4 border-b border-border-main flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center justify-center flex-1 group">
              <Logo size={120} />
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-muted-main hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer shrink-0"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="py-4 px-2 border-b border-border-main flex flex-col items-center justify-center gap-3">
            <Link href="/dashboard" className="flex items-center justify-center group" title="Estudio Arkipelago">
              <Logo size={36} />
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-muted-main hover:text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        {!isCollapsed ? (
          <nav className="p-3 space-y-1">
            {filteredNavItems.map((item) => {
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
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          <nav className="p-2 space-y-1.5 flex flex-col items-center">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center justify-center w-11 h-11 rounded-xl text-xs font-medium transition-all group cursor-pointer',
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                      : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                  )}
                  aria-label={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {/* Floating Tooltip */}
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-surface-main border border-border-main text-text-main text-[11px] font-medium font-sans rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Active Work Tracking Widget */}
        {!isCollapsed ? (
          <div className="p-4 mt-auto">
            <div className="border border-border-main rounded-xl p-4 bg-surface-hover/50 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] text-muted-main font-semibold tracking-wide">
                  Active Time Tracking
                </h2>
                <span
                  className={cn(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase',
                    isClockedIn ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-surface-hover text-muted-main'
                  )}
                >
                  {isClockedIn ? 'CLOCKED IN' : 'OFFLINE'}
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
                  'w-full py-2.5 border font-semibold text-xs rounded-lg transition-all shadow-xs cursor-pointer',
                  isClockedIn
                    ? 'border-accent-red text-accent-red hover:bg-accent-red hover:text-white'
                    : 'border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-black'
                )}
              >
                {isClockedIn ? 'Clock Out' : 'Clock In'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-border-main flex flex-col items-center mt-auto">
            <div className="group relative">
              <button
                onClick={isClockedIn ? () => clockOut() : () => clockIn(defaultProjectId)}
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer shadow-xs',
                  isClockedIn
                    ? 'border-accent-red text-accent-red bg-accent-red/10 hover:bg-accent-red hover:text-white'
                    : 'border-accent-cyan text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan hover:text-black'
                )}
                aria-label={isClockedIn ? 'Clock Out' : 'Clock In'}
              >
                <Clock className={cn('w-4 h-4', isClockedIn && 'animate-pulse')} />
              </button>
              {/* Floating Tooltip */}
              <div className="absolute left-full ml-3 bottom-0 px-3 py-2 bg-surface-main border border-border-main text-text-main text-xs font-sans rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                <div className="font-semibold text-text-main flex items-center gap-1.5">
                  <span className={cn('w-2 h-2 rounded-full', isClockedIn ? 'bg-accent-cyan animate-pulse' : 'bg-muted-main')} />
                  <span>{isClockedIn ? 'Active Work Session' : 'Time Tracking Offline'}</span>
                </div>
                {isClockedIn && (
                  <div className="text-accent-cyan font-mono text-xs font-bold mt-1">
                    {elapsedTime}
                  </div>
                )}
                <div className="text-[10px] text-muted-main mt-1 font-mono">
                  Click to {isClockedIn ? 'Clock Out' : 'Clock In'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      {!isCollapsed ? (
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
            className="text-muted-main hover:text-accent-red transition-colors p-1.5 rounded-lg hover:bg-surface-hover cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-t border-border-main p-2 bg-surface-main flex flex-col items-center gap-2 relative z-20">
          <div className="group relative">
            <div className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center font-bold text-xs bg-surface-hover text-text-main cursor-default">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {/* Floating Tooltip */}
            <div className="absolute left-full ml-3 bottom-0 px-3 py-1.5 bg-surface-main border border-border-main text-text-main text-xs font-sans rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
              <div className="font-semibold">{user?.name || 'Architect'}</div>
              <div className="text-[10px] text-muted-main capitalize">{user?.role?.replace('_', ' ') || 'Junior Architect'}</div>
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('arkipelago_user');
              router.push('/login');
            }}
            className="p-2 text-muted-main hover:text-accent-red transition-colors rounded-lg hover:bg-surface-hover cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
