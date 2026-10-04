'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Plus,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Navigation,
  Car,
  FileText,
  Briefcase,
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { StudioMeeting, TaskItem } from '@/types';
import { cn } from '@/lib/utils';
import { getWeekDates, getInitialStudioMeetings, getTypeBadgeStyles } from '@/lib/schedule';

interface ThisWeekScheduleWidgetProps {
  tasks: TaskItem[];
  onInitiateTaskToggle: (task: TaskItem) => void;
  onOpenTaskModal: () => void;
}

export function ThisWeekScheduleWidget({
  tasks,
  onInitiateTaskToggle,
  onOpenTaskModal,
}: ThisWeekScheduleWidgetProps) {
  const weekDays = useMemo(() => getWeekDates(new Date()), []);
  const todayDateStr = useMemo(() => {
    const today = weekDays.find((d) => d.isToday);
    return today ? today.dateStr : weekDays[0].dateStr;
  }, [weekDays]);

  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayDateStr);
  const [filterType, setFilterType] = useState<'ALL' | 'SITE' | 'REVIEWS' | 'TASKS'>('ALL');

  // PlanSense-style Fast Quick-Add Slide Sheet state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'TASK' | 'EVENT'>('TASK');
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddProject, setQuickAddProject] = useState('MT-2024');
  const [quickAddPriority, setQuickAddPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [quickAddTime, setQuickAddTime] = useState('09:00 AM');
  const [quickAddSuccess, setQuickAddSuccess] = useState(false);

  // Local state for dynamically added quick items
  const [localQuickTasks, setLocalQuickTasks] = useState<TaskItem[]>([]);
  const [localQuickMeetings, setLocalQuickMeetings] = useState<StudioMeeting[]>([]);

  const baseStudioMeetings = useMemo(() => getInitialStudioMeetings(new Date()), []);
  const allStudioMeetings = useMemo(() => [...localQuickMeetings, ...baseStudioMeetings], [localQuickMeetings, baseStudioMeetings]);
  const allTasks = useMemo(() => [...localQuickTasks, ...tasks], [localQuickTasks, tasks]);

  // Total metrics for this week
  const weekMeetings = useMemo(() => {
    const dates = new Set(weekDays.map((d) => d.dateStr));
    return allStudioMeetings.filter((m) => dates.has(m.date));
  }, [allStudioMeetings, weekDays]);

  const siteVisitsCount = useMemo(() => {
    return weekMeetings.filter((m) => m.type === 'Site Inspection').length;
  }, [weekMeetings]);

  const clientReviewsCount = useMemo(() => {
    return weekMeetings.filter((m) => m.type === 'Client Review').length;
  }, [weekMeetings]);

  // Selected Day Items
  const selectedDayMeetings = useMemo(() => {
    return allStudioMeetings.filter((m) => m.date === selectedDateStr);
  }, [allStudioMeetings, selectedDateStr]);

  const selectedDayInfo = useMemo(() => {
    return weekDays.find((d) => d.dateStr === selectedDateStr) || weekDays[0];
  }, [weekDays, selectedDateStr]);

  // Filter deliverables / tasks
  const inProgressTasks = useMemo(() => {
    return allTasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'PENDING');
  }, [allTasks]);

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;

    if (quickAddType === 'TASK') {
      const newTask: TaskItem = {
        id: `task-quick-${Date.now()}`,
        name: quickAddTitle.trim(),
        projectId: quickAddProject,
        description: `Scheduled for ${selectedDateStr} via PlanSense Quick Action`,
        projectPhase: 'SCHEMATIC',
        deliverables: ['Deliverable'],
        taskType: 'DELIVERABLE',
        priority: quickAddPriority,
        assignedMember: 'Lead Architect',
        status: 'IN_PROGRESS',
        startDate: selectedDateStr,
        createdAt: new Date().toISOString(),
      };
      setLocalQuickTasks((prev) => [newTask, ...prev]);
    } else {
      const newMeeting: StudioMeeting = {
        id: `mtg-quick-${Date.now()}`,
        title: quickAddTitle.trim(),
        client: 'Client Coordination',
        projectCode: quickAddProject,
        date: selectedDateStr,
        startTime: quickAddTime,
        endTime: '11:00 AM',
        type: quickAddPriority === 'HIGH' ? 'Site Inspection' : 'Client Review',
        source: 'STUDIO',
        location: 'Studio Boardroom / Site',
        attendees: ['Arch. Leandro Locsin', 'Lead Architect'],
        description: 'Scheduled via PlanSense Daily Quick Action',
        status: 'confirmed',
      };
      setLocalQuickMeetings((prev) => [newMeeting, ...prev]);
    }

    setQuickAddSuccess(true);
    setTimeout(() => {
      setQuickAddSuccess(false);
      setIsQuickAddOpen(false);
      setQuickAddTitle('');
    }, 700);
  };

  return (
    <div className="bg-surface-main border border-border-main rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full space-y-3.5 relative overflow-hidden transition-colors">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-sans text-text-main leading-tight tracking-tight">
                This Week&apos;s Schedule
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/calendar"
              className="text-xs sm:text-sm font-semibold text-accent-cyan hover:underline flex items-center gap-1 shrink-0 font-mono"
            >
              <span>Full Studio Calendar →</span>
            </Link>
          </div>
        </div>

        {/* PlanSense Tactile Horizontal Date Scrubber Strip */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 p-1 bg-surface-hover/60 border border-border-main/70 rounded-xl select-none">
          {weekDays.map((day) => {
            const isSelected = day.dateStr === selectedDateStr;
            const dayMeetings = allStudioMeetings.filter((m) => m.date === day.dateStr);
            const hasSiteInspection = dayMeetings.some((m) => m.type === 'Site Inspection');
            const hasClientReview = dayMeetings.some((m) => m.type === 'Client Review');
            const dayTasksCount = inProgressTasks.filter((t) => t.startDate === day.dateStr).length;

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(day.dateStr)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-lg cursor-pointer text-center relative group plansense-scrub-item',
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-bold scale-[1.02]'
                    : 'hover:bg-surface-hover text-zinc-600 dark:text-zinc-400 hover:text-text-main'
                )}
              >
                <span className="text-[10px] font-mono uppercase tracking-wider block">
                  {day.dayNameShort}
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold leading-tight mt-0.5">
                  {day.dayNum}
                </span>

                {/* PlanSense Color-Coded Micro-Indicator Dots */}
                <div className="h-2 flex items-center justify-center gap-1 mt-1">
                  {hasSiteInspection && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-2xs"
                      title="Site Inspection scheduled"
                    />
                  )}
                  {hasClientReview && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs"
                      title="Client Review confirmed"
                    />
                  )}
                  {(dayTasksCount > 0 || (dayMeetings.length > 0 && !hasSiteInspection && !hasClientReview)) && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-accent-cyan shadow-2xs"
                      title="Studio Deliverables scheduled"
                    />
                  )}
                </div>

                {day.isToday && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Agenda Banner & Filter Pills */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold font-sans text-text-main">
              {selectedDayInfo.dayNameFull}
            </span>
            <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-surface-hover px-2 py-0.5 rounded-md border border-border-main font-medium">
              {selectedDayInfo.dateStr}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => setFilterType('ALL')}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors cursor-pointer plansense-press',
                filterType === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-text-main'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('SITE')}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors cursor-pointer plansense-press',
                filterType === 'SITE'
                  ? 'bg-amber-500 text-black font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-text-main'
              )}
            >
              Site
            </button>
            <button
              onClick={() => setFilterType('TASKS')}
              className={cn(
                'px-2 py-0.5 rounded-md transition-colors cursor-pointer plansense-press',
                filterType === 'TASKS'
                  ? 'bg-accent-cyan text-black font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-text-main'
              )}
            >
              Tasks
            </button>
          </div>
        </div>

        {/* PlanSense Unified Dual-Track Timeline (Events + Deliverables) */}
        <div key={selectedDateStr} className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 animate-plansense-pop">
          {/* Scheduled Studio Meetings & Inspections */}
          {filterType !== 'TASKS' &&
            selectedDayMeetings
              .filter((m) => filterType === 'ALL' || (filterType === 'SITE' && m.type === 'Site Inspection'))
              .map((meeting) => {
                const badge = getTypeBadgeStyles(meeting.type);

                return (
                  <div
                    key={meeting.id}
                    className="p-3 rounded-xl border border-border-main bg-surface-hover/40 hover:bg-surface-hover transition-all space-y-2 group shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded border uppercase font-mono',
                              badge.bg,
                              badge.border,
                              badge.text
                            )}
                          >
                            {badge.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                            {meeting.projectCode}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-text-main leading-snug group-hover:text-accent-cyan transition-colors">
                          {meeting.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-text-main">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{meeting.startTime}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono block">
                          until {meeting.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono border-t border-border-main/50 pt-2">
                      <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                        {meeting.meetingLink ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-accent-cyan hover:underline truncate"
                            >
                              Google Meet Join
                            </a>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{meeting.location}</span>
                          </>
                        )}
                      </div>

                      <Link
                        href="/calendar"
                        className="text-zinc-500 hover:text-text-main flex items-center gap-0.5 font-bold"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}

          {/* Integrated Deliverable Tasks for the Day */}
          {(filterType === 'ALL' || filterType === 'TASKS') && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                <span className="uppercase tracking-wider">Design Deliverables &amp; Tasks</span>
                <span className="text-accent-cyan font-bold">{inProgressTasks.length} Pending</span>
              </div>

              {inProgressTasks.length > 0 ? (
                inProgressTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onInitiateTaskToggle(task)}
                    className="p-2.5 rounded-xl border border-border-main/70 bg-surface-main hover:bg-surface-hover/60 transition-all flex items-center justify-between gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInitiateTaskToggle(task);
                        }}
                        className="text-zinc-400 group-hover:text-emerald-500 transition-colors p-0.5 cursor-pointer shrink-0"
                        aria-label="Mark task done"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                          {task.name}
                        </p>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block truncate">
                          {task.projectPhase} • {task.assignedMember}
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 font-mono',
                        task.priority === 'HIGH'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                          : 'bg-surface-hover border-border-main text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center border border-dashed border-border-main rounded-xl text-xs text-zinc-500">
                  No pending deliverables for today.
                </div>
              )}
            </div>
          )}

          {/* Empty state if filtering has zero items */}
          {selectedDayMeetings.length === 0 && filterType === 'SITE' && (
            <div className="py-8 text-center border border-dashed border-border-main rounded-xl space-y-1">
              <Car className="w-6 h-6 text-zinc-400 mx-auto opacity-50 mb-1" />
              <p className="text-xs sm:text-sm font-semibold text-text-main">No site inspections on this day</p>
              <p className="text-[11px] text-zinc-500 font-mono">Select another day in the strip above</p>
            </div>
          )}
        </div>
      </div>

      {/* Widget Footer & PlanSense Quick-Add Trigger */}
      <div className="pt-2.5 border-t border-border-main/50 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="px-3 py-1.5 rounded-xl border border-border-main bg-black text-white dark:bg-white dark:text-black text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span>{siteVisitsCount} Site Visits</span>
          <span>•</span>
          <span>{clientReviewsCount} Reviews</span>
        </div>
      </div>

      {/* PlanSense Tactile Quick-Entry Slide Sheet / Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-main border border-border-strong rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4 font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text-main leading-tight">
                    Quick Schedule Action
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    For {selectedDayInfo.dayNameFull}, {selectedDayInfo.dateStr}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="text-zinc-400 hover:text-text-main text-xs font-mono p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-3.5">
              {/* Type Switcher Pills (Task vs Event) */}
              <div className="grid grid-cols-2 p-1 bg-surface-hover/70 border border-border-main rounded-xl text-xs font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setQuickAddType('TASK')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all cursor-pointer',
                    quickAddType === 'TASK'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-zinc-500 hover:text-text-main'
                  )}
                >
                  Deliverable Task
                </button>
                <button
                  type="button"
                  onClick={() => setQuickAddType('EVENT')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all cursor-pointer',
                    quickAddType === 'EVENT'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-zinc-500 hover:text-text-main'
                  )}
                >
                  Site Visit / Meeting
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold">
                  {quickAddType === 'TASK' ? 'Task Title:' : 'Event / Meeting Title:'}
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={quickAddTitle}
                  onChange={(e) => setQuickAddTitle(e.target.value)}
                  placeholder={
                    quickAddType === 'TASK'
                      ? 'e.g. Upload revised Ground Floor CAD set'
                      : 'e.g. Foundation pour inspection with Engr. Cruz'
                  }
                  className="w-full bg-surface-hover/50 border border-border-main rounded-xl px-3 py-2 text-xs sm:text-sm text-text-main font-sans placeholder:text-zinc-400 focus:outline-none focus:border-accent-cyan"
                />
              </div>

              {/* Project Tag & Priority/Time Pills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold font-mono">
                    Project Code:
                  </label>
                  <select
                    value={quickAddProject}
                    onChange={(e) => setQuickAddProject(e.target.value)}
                    className="w-full bg-surface-hover/50 border border-border-main rounded-xl px-2.5 py-1.5 text-xs font-mono text-text-main focus:outline-none focus:border-accent-cyan cursor-pointer"
                  >
                    <option value="MT-2024">[MT-2024] Makati Tower</option>
                    <option value="CV-2024">[CV-2024] Casa Verde</option>
                    <option value="BCP-2024">[BCP-2024] BGC Pavilion</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold font-mono">
                    {quickAddType === 'TASK' ? 'Priority Level:' : 'Start Time:'}
                  </label>
                  {quickAddType === 'TASK' ? (
                    <select
                      value={quickAddPriority}
                      onChange={(e) => setQuickAddPriority(e.target.value as any)}
                      className="w-full bg-surface-hover/50 border border-border-main rounded-xl px-2.5 py-1.5 text-xs font-mono text-text-main focus:outline-none focus:border-accent-cyan cursor-pointer"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={quickAddTime}
                      onChange={(e) => setQuickAddTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full bg-surface-hover/50 border border-border-main rounded-xl px-2.5 py-1.5 text-xs font-mono text-text-main focus:outline-none focus:border-accent-cyan"
                    />
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main/50">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-border-main text-zinc-500 hover:text-text-main text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                >
                  {quickAddSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
