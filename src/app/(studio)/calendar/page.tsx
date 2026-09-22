'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  FileText,
  MessageSquare,
  Link2,
  Calendar as CalendarIcon,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { TaskItem } from '@/types';

interface SyncedEvent {
  id: string;
  summary: string;
  description?: string;
  start?: string;
  end?: string;
  location?: string;
  day: number;
  source: string;
}

const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'TASKS'>('CALENDAR');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  
  // Google Calendar Sync & Detail Modal states
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isLiveGoogle, setIsLiveGoogle] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('partner@arkipelago.com');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedEvents, setSyncedEvents] = useState<SyncedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SyncedEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSyncGoogleCalendar = React.useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/calendar/sync');
      const data = await res.json();
      if (data.success) {
        setIsGoogleSynced(true);
        if (data.events && Array.isArray(data.events)) {
          setSyncedEvents(data.events);
        }
        setIsLiveGoogle(!!data.isLive);
        if (data.account) {
          setConnectedAccount(data.account);
        }
      }
    } catch (err) {
      console.error('Failed to sync Google Calendar:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    const isSyncedParam = typeof window !== 'undefined' && window.location.search.includes('synced=true');
    if (isSyncedParam) {
      handleSyncGoogleCalendar();
    }
  }, [handleSyncGoogleCalendar]);

  const handleConnectGmail = () => {
    window.location.assign('/api/auth/google/login');
  };

  const handleTaskCreated = (newTaskData: Partial<TaskItem>) => {
    const created: TaskItem = {
      id: 'task-' + Date.now(),
      name: newTaskData.name || 'UNTITLED TASK',
      projectId: newTaskData.projectId || '',
      description: newTaskData.description || '',
      projectPhase: newTaskData.projectPhase || 'SCHEMATIC',
      deliverables: newTaskData.deliverables || [],
      taskType: newTaskData.taskType || 'WORKSHOP',
      priority: newTaskData.priority || 'MEDIUM',
      assignedMember: newTaskData.assignedMember || 'UNASSIGNED',
      startDate: newTaskData.startDate,
      endDate: newTaskData.endDate,
      timeNeeded: newTaskData.timeNeeded,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
  };

  // Generate 35 cells for full month grid (with overflow previous/next days)
  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Prev month overflow
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        number: daysInPrevMonth - i,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        number: i,
        isCurrentMonth: true,
      });
    }

    // Next month overflow to complete 35 cells (5 rows of 7)
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        number: i,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [year, month]);

  return (
    <div className="font-mono text-text-main space-y-6 pb-12 relative min-h-screen">
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Top Header Bar with Tabs, Google Calendar Sync, + ADD TASK, and Bell Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main/50 pb-3 gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`text-xs font-extrabold uppercase tracking-widest pb-3 -mb-3 border-b-2 transition-all ${
              activeTab === 'CALENDAR'
                ? 'border-text-main text-text-main'
                : 'border-transparent text-muted-main hover:text-text-main'
            }`}
          >
            CALENDAR
          </button>
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`text-xs font-extrabold uppercase tracking-widest pb-3 -mb-3 border-b-2 transition-all ${
              activeTab === 'TASKS'
                ? 'border-text-main text-text-main'
                : 'border-transparent text-muted-main hover:text-text-main'
            }`}
          >
            TASKS
          </button>
        </div>

        {/* Right Actions: Google Calendar Sync Buttons, + ADD TASK & Notification Bell */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleConnectGmail}
            className="flex items-center space-x-2 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-sm"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>CONNECT REAL GMAIL</span>
          </button>

          <button
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
              isGoogleSynced
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-surface-main border-border-main hover:border-text-main text-text-main'
            }`}
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : isGoogleSynced ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <CalendarIcon className="w-3.5 h-3.5" />
            )}
            <span>
              {isSyncing
                ? 'SYNCING...'
                : isGoogleSynced
                ? isLiveGoogle
                  ? 'LIVE GMAIL SYNCED'
                  : 'DEMO SYNCED'
                : 'FETCH DEMO EVENTS'}
            </span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-wider text-muted-main hover:text-text-main transition-colors px-2 py-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>ADD TASK</span>
          </button>

          <button className="w-9 h-9 rounded-full border border-border-main bg-surface-main flex items-center justify-center text-muted-main hover:text-text-main hover:bg-surface-hover transition-colors shadow-xs">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Content 1: CALENDAR VIEW */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-6">
          {/* Main Full-Size Calendar Box */}
          <div className="bg-surface-main border border-border-main rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Calendar Controls (Month Switcher + Sync Notice) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border-main/40 pb-5">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handlePrevMonth}
                  className="text-muted-main hover:text-text-main transition-colors p-1"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm sm:text-base font-extrabold tracking-widest uppercase text-text-main min-w-[180px]">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="text-muted-main hover:text-text-main transition-colors p-1"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {isGoogleSynced && (
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isLiveGoogle ? 'LIVE SYNCED WITH GMAIL' : 'SYNCED DEMO MODE'} ({connectedAccount})
                </div>
              )}
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-extrabold uppercase text-muted-main tracking-widest border-b border-border-main/40 pb-3 mb-4">
              <div>SUNDAY</div>
              <div>MONDAY</div>
              <div>TUESDAY</div>
              <div>WEDNESDAY</div>
              <div>THURSDAY</div>
              <div>FRIDAY</div>
              <div>SATURDAY</div>
            </div>

            {/* Month Day Grid */}
            <div className="grid grid-cols-7 gap-3">
              {daysGrid.map((cell, idx) => {
                const daySyncedEvents = cell.isCurrentMonth
                  ? syncedEvents.filter((e) => e.day === cell.number)
                  : [];

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] sm:min-h-[135px] border border-border-main/80 rounded-xl p-3 flex flex-col justify-between transition-all ${
                      cell.isCurrentMonth
                        ? 'bg-surface-main hover:border-text-main'
                        : 'bg-surface-hover/20 text-muted-main/30 border-border-main/30'
                    }`}
                  >
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        cell.isCurrentMonth ? 'text-text-main' : 'text-muted-main/40'
                      }`}
                    >
                      {cell.number}
                    </span>

                    <div className="space-y-1 mt-1">
                      {/* Default studio task sample */}
                      {cell.isCurrentMonth && cell.number === 15 && (
                        <div
                          onClick={() =>
                            setSelectedEvent({
                              id: 'studio-01',
                              summary: 'SITE VISIT & CLIENT BRIEFING',
                              description: 'Architectural site inspection of Tagaytay Villa grounds and client brief meeting.',
                              day: 15,
                              location: 'Tagaytay Site / Studio HQ',
                              source: 'Estudio Arkipelago Task',
                            })
                          }
                          className="bg-cyan-500/10 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400 p-1 rounded text-[9px] font-bold uppercase truncate cursor-pointer hover:bg-cyan-500/20 transition-all"
                        >
                          📌 SITE VISIT & BRIEF
                        </div>
                      )}

                      {/* Synced Google Calendar Events */}
                      {daySyncedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 p-1.5 rounded text-[9px] font-bold uppercase truncate cursor-pointer hover:bg-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-1 shadow-2xs"
                          title="Click to view event details"
                        >
                          <span>📅</span>
                          <span className="truncate">{evt.summary}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal Popup - Premium High Contrast Studio Theme */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0f1117] border border-zinc-700/80 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-zinc-100 font-mono">
            {/* Top Bar / Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedEvent.source}
                </span>
                <h3 className="text-lg sm:text-xl font-black uppercase text-white tracking-wide leading-tight">
                  {selectedEvent.summary}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700 text-sm font-bold shadow-xs"
              >
                ✕
              </button>
            </div>

            {/* Event Meta Details Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#161922] p-4.5 rounded-xl border border-zinc-800 shadow-inner">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                    DATE
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {MONTH_NAMES[month]} {selectedEvent.day}, {year}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                    TIME
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {selectedEvent.start
                      ? `${new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'All Day Event'}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div className="col-span-full pt-2 border-t border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-1">
                      LOCATION / MEETING LINK
                    </span>
                    <span className="font-bold text-emerald-400 hover:text-emerald-300 underline break-all inline-flex items-center gap-1">
                      📍 {selectedEvent.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Description & Notes */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                  DESCRIPTION & NOTES
                </span>
                <div className="p-4 rounded-xl bg-[#161922] border border-zinc-800 text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap min-h-[80px]">
                  {selectedEvent.description || 'No detailed description provided for this Google Calendar event.'}
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800 pt-5">
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold uppercase text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1.5 tracking-wider"
              >
                <span>OPEN IN GOOGLE CALENDAR</span> ↗
              </a>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:bg-zinc-200 transition-colors shadow-lg"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: TASKS VIEW */}
      {activeTab === 'TASKS' && (
        <div className="bg-surface-main border border-border-main rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-text-main">
              STUDIO TASKS LIST ({tasks.length})
            </h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> INITIALIZE TASK
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-5 border border-border-main rounded-xl bg-surface-hover/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm uppercase text-text-main">{t.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-main border border-border-main uppercase text-muted-main">
                        {t.taskType}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-muted-main">{t.description}</p>}
                    <div className="text-[10px] text-muted-main font-bold pt-1 uppercase flex gap-4">
                      <span>PHASE: {t.projectPhase}</span>
                      <span>ASSIGNED: {t.assignedMember}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded uppercase tracking-wider self-start sm:self-center ${
                      t.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                        : t.priority === 'MEDIUM'
                        ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                        : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {t.priority} PRIORITY
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-muted-main uppercase tracking-widest italic">
                NO TASKS INITIALIZED YET.
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 border border-border-strong text-xs font-bold uppercase rounded tracking-wider hover:bg-surface-hover"
              >
                + INITIALIZE FIRST TASK
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons Widget Stack (Bottom Right matching screenshot) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-2.5">
        <button className="w-12 h-12 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors">
          <FileText className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors">
          <Link2 className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
