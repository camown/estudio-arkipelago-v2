'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

interface CalendarEvent {
  title: string;
  type: 'deliverable' | 'survey' | 'review';
  color: string;
}

// Studio deliverables and survey milestones for the current calendar
const SCHEDULED_EVENTS: Record<number, CalendarEvent[]> = {
  3: [
    { title: 'Casa Verde Concept Review', type: 'review', color: 'bg-amber-500' },
  ],
  8: [
    { title: 'BGC Pavilion Structural Survey', type: 'survey', color: 'bg-teal-500' },
  ],
  15: [
    { title: 'Makati Tower Schematic Set Due', type: 'deliverable', color: 'bg-rose-500' },
    { title: 'Engineering Coordination Call', type: 'review', color: 'bg-amber-500' },
  ],
  22: [
    { title: 'Casa Verde Material Board Submission', type: 'deliverable', color: 'bg-rose-500' },
  ],
  25: [
    { title: 'Makati Tower Site Inspection', type: 'survey', color: 'bg-teal-500' },
    { title: 'Client Milestone Presentation', type: 'review', color: 'bg-amber-500' },
  ],
  28: [
    { title: 'BGC Pavilion Permit Package Due', type: 'deliverable', color: 'bg-rose-500' },
  ],
};

export default function CalendarGrid() {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = useMemo(() => {
    const daysInCurrentMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const calendarDays = [];

    // Previous month overflow days
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && i === today.getDate();
      calendarDays.push({
        day: i,
        isCurrentMonth: true,
        isToday: isToday,
      });
    }

    // Next month overflow days (fill 35 or 42 cells)
    const targetTotal = calendarDays.length > 35 ? 42 : 35;
    const remainingCells = targetTotal - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      calendarDays.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return calendarDays;
  }, [year, month, today]);

  return (
    <div className="flex flex-col bg-surface-main border border-border-main rounded-xl p-5 sm:p-6 shadow-sm h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-main/70 pb-4 mb-4">
        <Link
          href="/calendar"
          className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          title="Open Full Studio Calendar"
        >
          <CalendarIcon className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-main">
            CALENDAR PREVIEW
          </h3>
          <span className="bg-surface-hover text-accent-cyan border border-accent-cyan/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block">
            SYNCED
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs tracking-wider min-w-[120px] sm:min-w-[130px] text-center text-text-main">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/calendar"
            className="text-[11px] font-semibold text-accent-cyan hover:underline flex items-center gap-1 pl-2 border-l border-border-main/60"
            title="Open Full Calendar View"
          >
            <span>Full View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Days Grid */}
      <div className="flex-grow flex flex-col justify-between space-y-2">
        {/* Day Headers */}
        <div className="grid grid-cols-7 text-center font-bold text-[11px] text-muted-main uppercase">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Cells with Deliverable & Survey Indicators */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((d, i) => {
            const dayEvents = d.isCurrentMonth ? SCHEDULED_EVENTS[d.day] || [] : [];
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={i}
                onClick={() => {
                  if (d.isCurrentMonth) {
                    router.push('/calendar');
                  }
                }}
                title={hasEvents ? dayEvents.map((e) => e.title).join(' • ') : (d.isCurrentMonth ? `Day ${d.day} — Click to view in calendar` : undefined)}
                className={`h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center p-1 relative text-xs font-bold transition-all group ${
                  !d.isCurrentMonth
                    ? 'text-muted-main/30 bg-surface-hover/20 cursor-default'
                    : d.isToday
                    ? 'bg-black text-white dark:bg-white dark:text-black border-2 border-accent-cyan shadow-sm font-extrabold cursor-pointer hover:opacity-90'
                    : 'bg-surface-hover/70 text-text-main hover:bg-surface-hover hover:border-border-strong/70 border border-transparent cursor-pointer'
                }`}
              >
                <span className={d.isToday ? '' : 'group-hover:text-accent-cyan transition-colors'}>
                  {d.day}
                </span>

                {/* Event Indicator Dots */}
                {hasEvents && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {dayEvents.map((evt, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${evt.color} shadow-xs`}
                        title={evt.title}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Micro-Legend */}
      <div className="pt-3 mt-3 border-t border-border-main/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted-main">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-2xs" />
            <span className="font-medium text-text-main/90">Deliverable Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block shadow-2xs" />
            <span className="font-medium text-text-main/90">Site Survey</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shadow-2xs" />
            <span className="font-medium text-text-main/90">Client Review</span>
          </div>
        </div>
        <span className="text-[9px] text-muted-main hidden sm:inline">
          Hover date for schedule details
        </span>
      </div>
    </div>
  );
}
