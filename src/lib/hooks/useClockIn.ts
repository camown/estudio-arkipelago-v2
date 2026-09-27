'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TimeEntry } from '@/types';
import { MOCK_PROJECTS } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';

const CLOCKIN_STATE_KEY = 'arkipelago_clockin_state';
const TIME_ENTRIES_KEY = 'arkipelago_time_entries';

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

function getStoredClockInState(userId?: string) {
  if (typeof window === 'undefined') {
    return { isClocked: false, startTime: null, elapsed: 0, selectedProjectId: null };
  }
  try {
    const userKey = userId ? `${CLOCKIN_STATE_KEY}_${userId}` : null;
    const rawState = (userKey && localStorage.getItem(userKey)) || localStorage.getItem(CLOCKIN_STATE_KEY);
    if (rawState) {
      const parsed: StoredClockInState = JSON.parse(rawState);
      if (parsed.userId && userId && parsed.userId !== userId) {
        return { isClocked: false, startTime: null, elapsed: 0, selectedProjectId: null };
      }
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => getStoredClockInState(userId).selectedProjectId);
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);

  const [prevUserId, setPrevUserId] = useState<string | undefined>(userId);
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    const stored = getStoredClockInState(userId);
    setIsClocked(stored.isClocked);
    setStartTime(stored.startTime);
    setElapsed(stored.elapsed);
    setSelectedProjectId(stored.selectedProjectId);
  }

  const refreshTodayEntries = useCallback(() => {
    setTodayEntries(getTodayEntries());
  }, [getTodayEntries]);

  useEffect(() => {
    setTodayEntries(getTodayEntries());
  }, [getTodayEntries, userId]);
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
        userId,
      };
      localStorage.setItem(userClockKey, JSON.stringify(stateToStore));
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
    } catch (error) {
      console.error('Failed to persist time entry:', error);
    }

    setIsClocked(false);
    setStartTime(null);
    setElapsed(0);
    setSelectedProjectId(null);

    refreshTodayEntries();

    return newEntry;
  }, [isClocked, startTime, selectedProjectId, userId, userClockKey, refreshTodayEntries]);

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
