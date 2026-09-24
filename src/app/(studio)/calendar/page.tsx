'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Check
} from 'lucide-react';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { useTasks } from '@/lib/hooks/useTasks';

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
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function CalendarPage() {
  const router = useRouter();
  const { tasks, addTask } = useTasks();
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'TASKS'>(() => {
    if (typeof window === 'undefined') return 'CALENDAR';
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    return tabParam === 'TASKS' || tabParam === 'tasks' ? 'TASKS' : 'CALENDAR';
  });
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);
  
  // Google Calendar Sync & Detail Modal states
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isLiveGoogle, setIsLiveGoogle] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('partner@arkipelago.com');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedEvents, setSyncedEvents] = useState<SyncedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SyncedEvent | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    if (eventParam === 'studio-01' || eventParam) {
      return {
        id: 'studio-01',
        summary: 'Site Visit & Client Briefing',
        description: 'Architectural site inspection of Tagaytay Villa grounds and client brief meeting.',
        day: 15,
        location: 'Tagaytay Site / Studio HQ',
        source: 'Estudio Arkipelago Task',
      };
    }
    return null;
  });

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
      const timer = setTimeout(() => {
        handleSyncGoogleCalendar();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [handleSyncGoogleCalendar]);

  const handleConnectGmail = () => {
    router.push('/api/auth/google/login');
  };

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
  };

  // Generate 35 or 42 cells for full month grid
  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
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

      {/* Top Header Bar with Tabs, Google Calendar Sync, + Add Task, and Bell Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main/50 pb-3 gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`text-xs font-bold tracking-wide pb-3 -mb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'CALENDAR'
                ? 'border-text-main text-text-main'
                : 'border-transparent text-muted-main hover:text-text-main'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('TASKS')}
            className={`text-xs font-bold tracking-wide pb-3 -mb-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'TASKS'
                ? 'border-text-main text-text-main'
                : 'border-transparent text-muted-main hover:text-text-main'
            }`}
          >
            Tasks & Queue
          </button>
        </div>

        {/* Right Actions: Google Calendar Sync, Add Task & Notification Bell */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleConnectGmail}
            className="flex items-center space-x-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-border-strong hover:border-text-main bg-surface-hover hover:bg-surface-main text-text-main transition-all shadow-xs cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Connect Google</span>
          </button>

          <button
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className={`flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
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
                ? 'Syncing...'
                : isGoogleSynced
                ? isLiveGoogle
                  ? 'Live Synced'
                  : 'Demo Synced'
                : 'Fetch Events'}
            </span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-text-main hover:text-accent-cyan transition-colors px-2 py-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>

          <button className="w-8 h-8 rounded-full border border-border-main bg-surface-main flex items-center justify-center text-muted-main hover:text-text-main hover:bg-surface-hover transition-colors shadow-xs cursor-pointer">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border-main/40 pb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrevMonth}
                  className="text-muted-main hover:text-text-main transition-colors p-1 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-base font-bold text-text-main min-w-[180px]">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="text-muted-main hover:text-text-main transition-colors p-1 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {isGoogleSynced && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isLiveGoogle ? 'Live synced with Gmail' : 'Synced Demo Mode'} ({connectedAccount})
                </div>
              )}
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-main border-b border-border-main/40 pb-3 mb-4">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
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
                      className={`text-xs sm:text-sm font-bold ${
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
                              summary: 'Site Visit & Client Briefing',
                              description: 'Architectural site inspection of Tagaytay Villa grounds and client brief meeting.',
                              day: 15,
                              location: 'Tagaytay Site / Studio HQ',
                              source: 'Estudio Arkipelago Task',
                            })
                          }
                          className="bg-accent-cyan/10 border border-accent-cyan/40 text-accent-cyan p-1.5 rounded text-[10px] font-semibold truncate cursor-pointer hover:bg-accent-cyan/20 transition-all"
                        >
                          📌 Site Visit & Brief
                        </div>
                      )}

                      {/* Synced Google Calendar Events */}
                      {daySyncedEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 p-1.5 rounded text-[10px] font-semibold truncate cursor-pointer hover:bg-emerald-500/20 transition-all flex items-center gap-1 shadow-2xs"
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

      {/* Event Details Modal Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-text-main font-mono">
            {/* Top Bar / Header */}
            <div className="flex items-start justify-between border-b border-border-main pb-4">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedEvent.source}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-text-main tracking-wide leading-tight">
                  {selectedEvent.summary}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-7 h-7 rounded-full bg-surface-hover hover:bg-border-main text-muted-main hover:text-text-main flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Event Meta Details Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-hover/60 p-4 rounded-xl border border-border-main">
                <div>
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5">
                    Date
                  </span>
                  <span className="font-bold text-text-main text-xs sm:text-sm">
                    {MONTH_NAMES[month]} {selectedEvent.day}, {year}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5">
                    Time
                  </span>
                  <span className="font-bold text-text-main text-xs sm:text-sm">
                    {selectedEvent.start
                      ? `${new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'All Day Event'}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div className="col-span-full pt-2 border-t border-border-main/50">
                    <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5">
                      Location / Meeting Link
                    </span>
                    <span className="font-semibold text-accent-cyan break-all inline-flex items-center gap-1">
                      📍 {selectedEvent.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Description & Notes */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                  Description & Notes
                </span>
                <div className="p-3.5 rounded-xl bg-surface-hover/60 border border-border-main text-text-main text-xs leading-relaxed whitespace-pre-wrap min-h-[70px]">
                  {selectedEvent.description || 'No detailed description provided for this calendar event.'}
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center justify-between border-t border-border-main pt-4">
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
              >
                <span>Open in Google Calendar</span> ↗
              </a>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: TASKS VIEW */}
      {activeTab === 'TASKS' && (
        <div className="bg-surface-main border border-border-main rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-main">
              Studio Tasks List ({tasks.length})
            </h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Initialize Task
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
                      <span className="font-bold text-xs text-text-main">{t.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main">
                        {t.taskType}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-muted-main">{t.description}</p>}
                    <div className="text-[11px] text-muted-main font-semibold pt-1 flex gap-4">
                      <span>Phase: {t.projectPhase}</span>
                      <span>Assigned: {t.assignedMember}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-3 py-1 rounded tracking-wide self-start sm:self-center ${
                      t.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                        : t.priority === 'MEDIUM'
                        ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                        : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-muted-main italic">
                No tasks initialized yet.
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 border border-border-strong text-xs font-semibold rounded-lg hover:bg-surface-hover cursor-pointer"
              >
                + Initialize First Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Buttons Widget Stack */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40 flex flex-col space-y-2.5">
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
          title="Initialize New Task"
        >
          <FileText className="w-5 h-5 text-accent-cyan" />
        </button>
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.origin + '/calendar');
              setCopiedLinkNotice(true);
              setTimeout(() => setCopiedLinkNotice(false), 2500);
            }
          }}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors relative cursor-pointer"
          title="Copy Studio Calendar Link"
        >
          {copiedLinkNotice ? <Check className="w-5 h-5 text-emerald-500" /> : <Link2 className="w-5 h-5" />}
        </button>
        <button
          onClick={() => router.push('/chat')}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
          title="Open Studio Comms & Chat"
        >
          <MessageSquare className="w-5 h-5 text-amber-500" />
        </button>
      </div>
    </div>
  );
}
