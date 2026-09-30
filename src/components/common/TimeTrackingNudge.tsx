'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, X, Check } from 'lucide-react';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { MOCK_PROJECTS } from '@/lib/constants';
import { usePathname } from 'next/navigation';

const NUDGE_DISMISSED_KEY = 'arkipelago_nudge_dismissed_until';
const NUDGE_SESSION_KEY = 'arkipelago_nudge_shown_this_session';
const SNOOZE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export function TimeTrackingNudge() {
  const { isClockedIn, clockIn } = useClockIn();
  const pathname = usePathname();
  const [suggestedProject, setSuggestedProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Smart Context Detection Engine
  const detectContextualProject = useCallback(() => {
    // 1. Never show while clocked in
    if (isClockedIn) return;

    // 2. Check if snoozed (persistent across navigations)
    if (typeof window !== 'undefined') {
      const dismissedUntil = localStorage.getItem(NUDGE_DISMISSED_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;
      // 3. Only show once per page load (session flag), to avoid re-appearing on each route change
      const shownThisSession = sessionStorage.getItem(NUDGE_SESSION_KEY);
      if (shownThisSession) return;
    }

    // 4. Detect by active page route
    let project = MOCK_PROJECTS[0]; // Default: Casa Verde Residence
    if (pathname.includes('/projects') || pathname.includes('/sketch')) {
      project = MOCK_PROJECTS.find(p => p.id === 'proj-001') || MOCK_PROJECTS[0];
    }

    // 5. Show after 5 seconds of idle page presence
    const timer = setTimeout(() => {
      if (isClockedIn) return;
      setSuggestedProject(project);
      setIsVisible(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(NUDGE_SESSION_KEY, '1');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [pathname, isClockedIn]);

  useEffect(() => {
    // Never show on dashboard (prominent clock-in widget) or root or login
    if (isClockedIn || pathname === '/dashboard' || pathname === '/' || pathname === '/login') return;
    setIsVisible(false); // Hide on navigation change
    const cleanup = detectContextualProject();
    return () => {
      if (cleanup) cleanup();
    };
  }, [isClockedIn, pathname, detectContextualProject]);


  const handleAccept = () => {
    if (suggestedProject) {
      clockIn(suggestedProject.id);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsAnimating(true);
    // Snooze for 2 hours
    const snoozeTime = Date.now() + SNOOZE_DURATION_MS;
    localStorage.setItem(NUDGE_DISMISSED_KEY, snoozeTime.toString());
    sessionStorage.setItem(NUDGE_SESSION_KEY, '1');
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };


  if (!isVisible || !suggestedProject || isClockedIn) return null;

  return (
    <div
      className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 max-w-md w-full transition-all duration-300 transform ${
        isAnimating ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="bg-surface-main border border-border-strong rounded-xl p-4 shadow-sm relative overflow-hidden font-mono text-text-main">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-text-main font-semibold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-surface-hover rounded-md border border-border-main">
              <Clock className="w-3.5 h-3.5 text-text-main" />
            </div>
            <span>Studio Time Reminder</span>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-main hover:text-text-main p-1 rounded-md hover:bg-surface-hover transition-colors"
            title="Snooze Nudge"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs text-text-main font-medium leading-relaxed">
            Are you working on <span className="font-semibold underline underline-offset-2">{suggestedProject.name}</span> right now?
          </p>
          <p className="text-[11px] text-muted-main">
            Detected active studio session without an initialized project timer.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 py-2 px-3 bg-text-main text-bg-main font-medium text-xs tracking-tight rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Clock In ({suggestedProject.code})</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2 px-3 border border-border-main text-muted-main hover:text-text-main font-medium text-xs rounded-lg hover:bg-surface-hover transition-colors"
          >
            Snooze
          </button>
        </div>
      </div>
    </div>
  );
}
