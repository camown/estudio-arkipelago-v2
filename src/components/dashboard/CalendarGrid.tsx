'use client';

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function CalendarGrid() {
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
    <div className="flex flex-col bg-surface-main border border-border-main rounded-xl p-6 shadow-sm h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-main pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-main">
            CALENDAR PREVIEW
          </h3>
          <span className="bg-surface-hover text-accent-cyan border border-accent-cyan/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            SYNCED
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs tracking-widest min-w-[130px] text-center text-text-main">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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

        {/* Days Cells matching Image 3 (rounded light pills/rectangles) */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div
              key={i}
              className={`h-9 sm:h-11 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                !d.isCurrentMonth
                  ? 'text-muted-main/40 bg-surface-hover/30'
                  : d.isToday
                  ? 'bg-black text-white dark:bg-white dark:text-black border-2 border-accent-cyan shadow-sm font-extrabold'
                  : 'bg-surface-hover/80 text-text-main hover:bg-surface-hover'
              }`}
            >
              {d.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
