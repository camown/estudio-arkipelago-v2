'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TimeEntry } from '@/types';
import { MOCK_PROJECTS } from '@/lib/constants';

const CLOCKIN_STATE_KEY = 'arkipelago_clockin_state';
const TIME_ENTRIES_KEY = 'arkipelago_time_entries';

interface StoredClockInState {
  isClocked: boolean;
  startTime: string;
  selectedProjectId: string | null;
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

function getInitialClockInState() {
  if (typeof window === 'undefined') {
    return { isClocked: false, startTime: null, elapsed: 0, selectedProjectId: null };
  }
  try {
    const rawState = localStorage.getItem(CLOCKIN_STATE_KEY);
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
      return entryDate === today;
    });
  }, [getEntries]);

  const [initialState] = useState(getInitialClockInState);
  const [isClocked, setIsClocked] = useState<boolean>(initialState.isClocked);
  const [startTime, setStartTime] = useState<Date | null>(initialState.startTime);
  const [elapsed, setElapsed] = useState<number>(initialState.elapsed);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialState.selectedProjectId);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>(getTodayEntries);

  const refreshTodayEntries = useCallback(() => {
    setTodayEntries(getTodayEntries());
  }, [getTodayEntries]);



  // Tick elapsed duration every second while clocked in
  useEffect(() => {
    if (!isClocked || !startTime) {
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const diffSeconds = Math.max(
        0,
        Math.floor((now.getTime() - new Date(startTime).getTime()) / 1000)
      );
      setElapsed(diffSeconds);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isClocked, startTime]);

  const clockIn = useCallback((projectId: string) => {
    const now = new Date();
    setIsClocked(true);
    setStartTime(now);
    setElapsed(0);
    setSelectedProjectId(projectId);

    try {
      const stateToStore: StoredClockInState = {
        isClocked: true,
        startTime: now.toISOString(),
        selectedProjectId: projectId,
      };
      localStorage.setItem(CLOCKIN_STATE_KEY, JSON.stringify(stateToStore));
    } catch (error) {
      console.error('Failed to persist clock-in state:', error);
    }
  }, []);

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
      userId: 'current',
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
      localStorage.removeItem(CLOCKIN_STATE_KEY);
    } catch (error) {
      console.error('Failed to persist time entry:', error);
    }

    setIsClocked(false);
    setStartTime(null);
    setElapsed(0);
    setSelectedProjectId(null);

    refreshTodayEntries();

    return newEntry;
  }, [isClocked, startTime, selectedProjectId, refreshTodayEntries]);

  const activeSession: ActiveSession | null =
    isClocked && startTime
      ? {
          startTime: startTime.toISOString(),
          projectId: selectedProjectId || '',
        }
      : null;

  return {
    // Prompt specification
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
