'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

import type { TimeEntry } from '@/types';
import { MOCK_PROJECTS } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';

const CLOCKIN_STATE_KEY = 'arkipelago_clockin_state';
const TIME_ENTRIES_KEY = 'arkipelago_time_entries';
const CLOCK_EVENT_NAME = 'arkipelago_clock_updated';
const CLOCK_CHANNEL_NAME = 'arkipelago_clock_channel';

interface StoredClockInState {
  isClocked: boolean;
  startTime: string;
  selectedProjectId: string | null;
  userId?: string;
}

export interface ActiveSession {
  startTime: string;
  projectId: string;
}

export function formatElapsed(seconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((val) => String(val).padStart(2, '0'))
    .join(':');
}

/**
 * Isolated, high-performance ticking elapsed time component.
 * Ticks locally every second without causing parent pages or sidebars to re-render.
 */
export function LiveElapsedTime({
  startTime,
  isClocked,
  fallback = '00:00:00',
  className,
}: {
  startTime?: Date | string | null;
  isClocked?: boolean;
  fallback?: string;
  className?: string;
}) {
  const [elapsed, setElapsed] = useState(() => {
    if (!isClocked || !startTime) return 0;
    const startMs = new Date(startTime).getTime();
    return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  });

  useEffect(() => {
    if (!isClocked || !startTime) {
      setElapsed(0);
      return;
    }

    const startMs = new Date(startTime).getTime();
    const update = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isClocked, startTime]);

  if (!isClocked || !startTime) {
    return React.createElement('span', { className, suppressHydrationWarning: true }, fallback);
  }

  return React.createElement(
    'span',
    { className, suppressHydrationWarning: true },
    formatElapsed(elapsed)
  );
}



function getStoredClockInState(userId?: string) {
  if (typeof window === 'undefined') {
    return { isClocked: false, startTime: null, elapsed: 0, selectedProjectId: null };
  }
  try {
    const userKey = userId ? `${CLOCKIN_STATE_KEY}_${userId}` : null;
    const rawState = (userKey && localStorage.getItem(userKey)) || localStorage.getItem(CLOCKIN_STATE_KEY);
    if (rawState) {
      const parsed: StoredClockInState = JSON.parse(rawState);
      if (parsed.isClocked && parsed.startTime) {
        const start = new Date(parsed.startTime);
        const now = new Date();
        const initialElapsed = Math.max(0, Math.floor((now.getTime() - start.getTime()) / 1000));
        return {
          isClocked: true,
          startTime: start,
          elapsed: initialElapsed,
          selectedProjectId: parsed.selectedProjectId || null,
        };
      }
    }
  } catch (error) {
    console.error('Failed to restore clock-in state:', error);
  }
  return { isClocked: false, startTime: null, elapsed: 0, selectedProjectId: null };
}

export function useClockIn() {
  const { user } = useAuth();
  const userId = user?.id;

  const userClockKey = useMemo(() => {
    return userId ? `${CLOCKIN_STATE_KEY}_${userId}` : CLOCKIN_STATE_KEY;
  }, [userId]);

  const getEntries = useCallback((): TimeEntry[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(TIME_ENTRIES_KEY);
      if (!raw) return [];
      const entries: TimeEntry[] = JSON.parse(raw);
      return entries.map((entry) => ({
        ...entry,
        durationFormatted:
          entry.durationFormatted ||
          (entry.duration !== undefined ? formatElapsed(entry.duration) : '--:--:--'),
      }));
    } catch (error) {
      console.error('Failed to retrieve time entries:', error);
      return [];
    }
  }, []);

  const getTodayEntries = useCallback((): TimeEntry[] => {
    const entries = getEntries();
    const today = new Date().toDateString();

    return entries.filter((entry) => {
      const entryDate = new Date(entry.startTime).toDateString();
      const matchesUser = !entry.userId || entry.userId === 'current' || (userId ? entry.userId === userId : true);
      return entryDate === today && matchesUser;
    });
  }, [getEntries, userId]);

  const [isClocked, setIsClocked] = useState<boolean>(() => getStoredClockInState(userId).isClocked);
  const [startTime, setStartTime] = useState<Date | null>(() => getStoredClockInState(userId).startTime);
  const [elapsed, setElapsed] = useState<number>(() => getStoredClockInState(userId).elapsed);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(() => getStoredClockInState(userId).selectedProjectId);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);

  // Synchronize state across all instances on the same page and cross-tab
  const syncStateFromStorage = useCallback(() => {
    const stored = getStoredClockInState(userId);
    setIsClocked(stored.isClocked);
    setStartTime(stored.startTime);
    setElapsed(stored.elapsed);
    if (stored.selectedProjectId) {
      setSelectedProjectIdState(stored.selectedProjectId);
    }
    setTodayEntries(getTodayEntries());
  }, [userId, getTodayEntries]);

  // Set selected project and synchronize across components
  const setSelectedProjectId = useCallback((projId: string | null) => {
    setSelectedProjectIdState(projId);
    try {
      const stored = getStoredClockInState(userId);
      if (stored.isClocked && stored.startTime) {
        const stateToStore: StoredClockInState = {
          isClocked: true,
          startTime: stored.startTime.toISOString(),
          selectedProjectId: projId,
          userId,
        };
        localStorage.setItem(userClockKey, JSON.stringify(stateToStore));
        localStorage.setItem(CLOCKIN_STATE_KEY, JSON.stringify(stateToStore));
        window.dispatchEvent(new CustomEvent(CLOCK_EVENT_NAME));
      }
    } catch (e) {
      console.error('Error updating clock-in project', e);
    }
  }, [userId, userClockKey]);

  useEffect(() => {
    syncStateFromStorage();
  }, [syncStateFromStorage, userId]);

  // Event & BroadcastChannel listeners for instant 0ms cross-component and cross-tab sync
  useEffect(() => {
    const handleSync = () => {
      syncStateFromStorage();
    };

    window.addEventListener(CLOCK_EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(CLOCK_CHANNEL_NAME);
        bc.onmessage = () => {
          syncStateFromStorage();
        };
      } catch (err) {
        console.error('BroadcastChannel initialization error', err);
      }
    }

    return () => {
      window.removeEventListener(CLOCK_EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
      if (bc) bc.close();
    };
  }, [syncStateFromStorage]);

  // Synchronize elapsed time on state updates
  useEffect(() => {
    if (startTime) {
      const now = Date.now();
      const startMs = new Date(startTime).getTime();
      setElapsed(Math.max(0, Math.floor((now - startMs) / 1000)));
    } else {
      setElapsed(0);
    }
  }, [startTime, isClocked]);

  const clockIn = useCallback((projectId: string) => {
    const now = new Date();
    setIsClocked(true);
    setStartTime(now);
    setElapsed(0);
    setSelectedProjectIdState(projectId);

    const stateToStore: StoredClockInState = {
      isClocked: true,
      startTime: now.toISOString(),
      selectedProjectId: projectId,
      userId,
    };

    try {
      localStorage.setItem(userClockKey, JSON.stringify(stateToStore));
      localStorage.setItem(CLOCKIN_STATE_KEY, JSON.stringify(stateToStore));
      window.dispatchEvent(new CustomEvent(CLOCK_EVENT_NAME));

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(CLOCK_CHANNEL_NAME);
        bc.postMessage({ type: 'CLOCK_IN', state: stateToStore });
        bc.close();
      }
    } catch (error) {
      console.error('Failed to persist clock-in state:', error);
    }
  }, [userClockKey, userId]);

  const clockOut = useCallback((): TimeEntry | null => {
    if (!isClocked || !startTime) {
      return null;
    }

    const endTime = new Date();
    const start = new Date(startTime);
    const duration = Math.max(0, Math.floor((endTime.getTime() - start.getTime()) / 1000));

    const activeProjectId = selectedProjectId || '';
    const project = MOCK_PROJECTS.find((p) => p.id === activeProjectId);
    const projectName = project
      ? project.name
      : (activeProjectId ? `Project ${activeProjectId}` : 'General Studio Time');

    const entryId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `entry-${Date.now()}`;

    const newEntry: TimeEntry = {
      id: entryId,
      userId: userId || 'current',
      projectId: activeProjectId,
      projectName,
      startTime: start.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      durationFormatted: formatElapsed(duration),
    };

    try {
      const existingEntriesRaw = localStorage.getItem(TIME_ENTRIES_KEY);
      const existingEntries: TimeEntry[] = existingEntriesRaw ? JSON.parse(existingEntriesRaw) : [];
      const updatedEntries = [newEntry, ...existingEntries];
      localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(updatedEntries));
      localStorage.removeItem(userClockKey);
      localStorage.removeItem(CLOCKIN_STATE_KEY);

      window.dispatchEvent(new CustomEvent(CLOCK_EVENT_NAME));

      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(CLOCK_CHANNEL_NAME);
        bc.postMessage({ type: 'CLOCK_OUT' });
        bc.close();
      }
    } catch (error) {
      console.error('Failed to persist time entry:', error);
    }

    setIsClocked(false);
    setStartTime(null);
    setElapsed(0);
    setSelectedProjectIdState(null);

    setTodayEntries(getTodayEntries());

    return newEntry;
  }, [isClocked, startTime, selectedProjectId, userId, userClockKey, getTodayEntries]);

  const activeSession: ActiveSession | null =
    isClocked && startTime
      ? {
          startTime: startTime.toISOString(),
          projectId: selectedProjectId || '',
        }
      : null;

  return {
    isClocked,
    startTime,
    elapsed,
    selectedProjectId,
    clockIn,
    clockOut,
    getEntries,
    getTodayEntries,
    formatElapsed,
    setSelectedProjectId,

    // Studio page compatibility aliases
    isClockedIn: isClocked,
    activeSession,
    elapsedTime: formatElapsed(elapsed),
    todayEntries,
  };
}

export default useClockIn;
