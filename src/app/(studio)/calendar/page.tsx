'use client';

import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 font-mono pb-12">
      <div className="border-b border-border-main pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-text-main flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-accent-cyan" />
          STUDIO CALENDAR
        </h1>
        <p className="text-xs text-muted-main uppercase tracking-widest mt-1">
          REAL-TIME SCHEDULES, MEETING SYNC, AND ON-SITE VISIT BUFFER TRACKING
        </p>
      </div>

      <div className="bg-surface-main border border-border-main rounded-xl p-8 text-center space-y-6 shadow-sm max-w-3xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center border border-border-main mx-auto">
          <CalendarDays className="w-8 h-8 text-accent-cyan" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold uppercase tracking-wider text-text-main">GOOGLE CALENDAR SYNC</h2>
          <p className="text-muted-main max-w-lg mx-auto font-mono text-xs uppercase leading-relaxed">
            Phase 2 — Two-way real-time sync with Google Calendar including smart scheduling and travel buffers.
          </p>
        </div>
        <button disabled className="px-6 py-3 bg-surface-hover border border-border-strong text-muted-main rounded-lg uppercase tracking-widest text-xs font-bold cursor-not-allowed">
          CONNECT GOOGLE ACCOUNT
        </button>
      </div>

      <div className="border border-border-main bg-surface-main rounded-xl overflow-hidden shadow-sm mt-8">
        <div className="grid grid-cols-7 border-b border-border-main bg-surface-hover text-center font-mono text-xs font-bold uppercase p-3 text-muted-main">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const isToday = day === 15;
            return (
              <div 
                key={i} 
                className={`min-h-[90px] border-r border-b border-border-main p-2.5 transition-colors ${
                  isToday ? 'bg-accent-cyan/10 border-accent-cyan' : 'hover:bg-surface-hover/50'
                }`}
              >
                <div className={`font-mono text-xs font-bold ${isToday ? 'text-accent-cyan' : 'text-muted-main'}`}>
                  {day <= 31 ? day : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
