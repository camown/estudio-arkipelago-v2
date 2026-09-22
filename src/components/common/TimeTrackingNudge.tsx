'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Clock, X, Check, ArrowRight } from 'lucide-react';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { MOCK_PROJECTS } from '@/lib/constants';
import { usePathname } from 'next/navigation';

const NUDGE_DISMISSED_KEY = 'arkipelago_nudge_dismissed_until';

export function TimeTrackingNudge() {
  const { isClockedIn, selectedProjectId, clockIn } = useClockIn();
  const pathname = usePathname();
  const [suggestedProject, setSuggestedProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Smart Context Detection Engine
  const detectContextualProject = useCallback(() => {
    // If already clocked in, don't show prompt
    if (isClockedIn) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently (within last 30 minutes)
    const dismissedUntil = localStorage.getItem(NUDGE_DISMISSED_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 1. Detect by active page route (e.g., viewing project details or specific chat)
    if (pathname.includes('/projects') || pathname.includes('/sketch')) {
      // Default contextual recommendation
      const project = MOCK_PROJECTS.find(p => p.id === 'proj-001') || MOCK_PROJECTS[0];
      setSuggestedProject(project);
      setIsVisible(true);
      return;
    }

    // 2. Default activity recognition (Casa Verde Residence as primary studio focus)
    const defaultProject = MOCK_PROJECTS[0]; // Casa Verde Residence
    setSuggestedProject(defaultProject);

    // Show after 4 seconds of idle page presence if unclocked
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [isClockedIn, pathname]);

  useEffect(() => {
    detectContextualProject();
  }, [detectContextualProject]);

  const handleAccept = () => {
    if (suggestedProject) {
      clockIn(suggestedProject.id);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsAnimating(true);
    // Dismiss for 30 minutes
    const snoozeTime = Date.now() + 30 * 60 * 1000;
    localStorage.setItem(NUDGE_DISMISSED_KEY, snoozeTime.toString());
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
      <div className="bg-surface-main border-2 border-accent-cyan/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden font-mono text-text-main">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-accent-cyan/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 text-accent-cyan font-extrabold text-xs uppercase tracking-wider">
            <div className="p-1.5 bg-accent-cyan/10 rounded-lg animate-pulse">
              <Sparkles className="w-4 h-4 text-accent-cyan" />
            </div>
            <span>Smart Time Nudge</span>
          </div>

          <button
            onClick={handleDismiss}
            className="text-muted-main hover:text-text-main p-1 rounded-lg hover:bg-surface-hover transition-colors"
            title="Snooze Nudge"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="text-xs text-text-main font-semibold leading-relaxed">
            Are you working on <span className="text-accent-cyan font-bold underline underline-offset-2">{suggestedProject.name}</span> right now?
          </p>
          <p className="text-[11px] text-muted-main">
            Detected active studio session without an initialized project timer.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 px-3 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Click to Log ({suggestedProject.code})</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 border border-border-main text-muted-main hover:text-text-main font-bold text-xs uppercase rounded-xl hover:bg-surface-hover transition-colors"
          >
            Snooze
          </button>
        </div>
      </div>
    </div>
  );
}
