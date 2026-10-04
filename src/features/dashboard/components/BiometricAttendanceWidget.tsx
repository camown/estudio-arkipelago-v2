'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Clock, Play, Square } from 'lucide-react';
import { Project, TimeEntry } from '@/types';
import { LiveElapsedTime } from '@/lib/hooks/useClockIn';

interface BiometricAttendanceWidgetProps {
  isClocked: boolean;
  elapsedTime?: string;
  startTime?: Date | string | null;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
  clockIn: (projectId: string) => void;
  clockOut: () => void;
  availableProjects: Project[];
  todayEntries: TimeEntry[];
}

export function BiometricAttendanceWidget({
  isClocked,
  elapsedTime,
  startTime,
  selectedProjectId,
  setSelectedProjectId,
  clockIn,
  clockOut,
  availableProjects,
  todayEntries,
}: BiometricAttendanceWidgetProps) {

  const [activeTimerProject, setActiveTimerProject] = useState<string>(() => {
    return selectedProjectId || availableProjects[0]?.id || '1';
  });

  const effectiveTimerProject = availableProjects.some((p) => p.id === activeTimerProject)
    ? activeTimerProject
    : (availableProjects[0]?.id || '1');

  return (
    <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4 relative overflow-hidden transition-colors">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-border-main bg-surface-hover text-text-main transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-sans text-text-main leading-tight">
                Active Time Tracking
              </h2>
              <span className="text-[10px] text-muted-main font-mono">
                {isClocked ? 'Session in progress' : 'No active session'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider font-mono flex items-center gap-1.5',
                isClocked
                  ? 'bg-surface-hover border-border-strong text-text-main'
                  : 'bg-surface-hover border-border-main text-muted-main'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  isClocked ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-muted-main'
                )}
              />
              {isClocked ? 'Clocked In' : 'Offline'}
            </span>
            <Link
              href="/hr"
              className="text-xs text-accent-cyan hover:underline font-mono"
              title="Open HR Timesheet"
            >
              Timesheet →
            </Link>
          </div>
        </div>

        {/* Stopwatch Display */}
        <div className="p-4 rounded-xl border border-border-main/80 bg-surface-hover/30 flex flex-col items-center justify-center space-y-3">
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-wider text-muted-main font-mono">
              Elapsed Session Time
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-text-main mt-0.5">
              <LiveElapsedTime startTime={startTime} isClocked={isClocked} fallback={elapsedTime || '00:00:00'} />
            </div>

          </div>

          {/* Project Assignment Dropdown */}
          <div className="w-full max-w-xs space-y-1">
            <label className="text-[10px] font-mono text-muted-main block text-center uppercase tracking-wider">
              Assigned Project / Task Code
            </label>
            <select
              disabled={isClocked}
              value={effectiveTimerProject}
              onChange={(e) => {
                setActiveTimerProject(e.target.value);
                setSelectedProjectId(e.target.value);
              }}
              className="w-full bg-surface-main border border-border-main text-text-main text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent-cyan disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {availableProjects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  [{proj.code}] {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Action Button */}
          <div>
            {!isClocked ? (
              <button
                onClick={() => {
                  clockIn(effectiveTimerProject);
                }}
                className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 hover:opacity-90"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Clock In Now</span>
              </button>
            ) : (
              <button
                onClick={clockOut}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Clock Out &amp; Save Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Logged Sessions Stream */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-muted-main uppercase tracking-wider font-mono">
              Today&apos;s Logs ({todayEntries.length})
            </span>
            <Link href="/hr" className="text-accent-cyan hover:underline text-[10px] font-mono">
              Full Log →
            </Link>
          </div>

          {todayEntries.length > 0 ? (
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {todayEntries.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="p-2 rounded-lg border border-border-main/50 bg-surface-hover/20 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-text-main truncate text-[11px]">
                      {entry.projectName || 'Studio Task'}
                    </p>
                    <span className="text-[10px] text-muted-main font-mono" suppressHydrationWarning>
                      {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-main border border-border-main text-text-main shrink-0">
                    {entry.durationFormatted || '--:--'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-main italic py-1 text-center font-sans">
              No completed sessions yet today. Clock in to log your billable hours.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
