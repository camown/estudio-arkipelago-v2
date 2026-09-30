'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User, Role } from '@/types';
import { PRESET_ACCOUNTS } from '@/lib/constants';

export const STORAGE_KEY = 'arkipelago_user';
export const PROFILES_STORAGE_KEY = 'arkipelago_user_profiles';
export const USER_EVENT_NAME = 'arkipelago_user_updated';
export const USER_CHANNEL_NAME = 'arkipelago_user_channel';

function getRoleFromEmail(email: string): Role {
  const lower = email.toLowerCase().trim();
  if (lower.startsWith('partner@')) return 'partner';
  if (lower.startsWith('senior@')) return 'senior_architect';
  if (lower.startsWith('contractor@')) return 'contractor';
  return 'junior_architect';
}

export function getStoredProfiles(): Record<string, Partial<User>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getProfileForEmail(email: string): Partial<User> | null {
  if (!email) return null;
  const profiles = getStoredProfiles();
  return profiles[email.toLowerCase().trim()] || null;
}

export function saveProfileForEmail(email: string, profile: Partial<User>) {
  if (!email || typeof window === 'undefined') return;
  try {
    const key = email.toLowerCase().trim();
    const profiles = getStoredProfiles();
    profiles[key] = {
      ...profiles[key],
      ...profile,
      email: key,
    };
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profile for email:', err);
  }
}

function getNameFromEmail(email: string): string {
  const lower = email.toLowerCase().trim();
  const saved = getProfileForEmail(lower);
  if (saved?.name && saved.name.trim()) {
    return saved.name.trim();
  }
  const preset = PRESET_ACCOUNTS.find(a => a.email.toLowerCase() === lower);
  if (preset) return preset.name;
  const localPart = email.split('@')[0] || 'User';
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed: User = JSON.parse(stored);
      const savedProfile = getProfileForEmail(parsed.email);
      if (savedProfile) {
        return {
          ...parsed,
          name: savedProfile.name || parsed.name,
          phoneNumber: savedProfile.phoneNumber || parsed.phoneNumber,
          avatarUrl: savedProfile.avatarUrl || parsed.avatarUrl,
        };
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  useEffect(() => {
    // 1. Sync state across other browser tabs via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };

    // 2. Sync state in the same tab via custom window event
    const handleCustomUserUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<User>;
      if (customEvent.detail) {
        setUser(customEvent.detail);
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          setUser(stored ? JSON.parse(stored) : null);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(USER_EVENT_NAME, handleCustomUserUpdate);

    // 3. Sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(USER_CHANNEL_NAME);
        bc.onmessage = (msg) => {
          if (msg.data?.user) {
            setUser(msg.data.user);
          }
        };
      } catch {}
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(USER_EVENT_NAME, handleCustomUserUpdate);
      bc?.close();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (password !== 'admin') return { success: false, error: 'Invalid credentials' };
    const lowerEmail = email.toLowerCase().trim();
    const preset = PRESET_ACCOUNTS.find(a => a.email.toLowerCase() === lowerEmail);
    const saved = getProfileForEmail(lowerEmail);

    const role = saved?.role || preset?.role || getRoleFromEmail(lowerEmail);
    const name = saved?.name || preset?.name || getNameFromEmail(lowerEmail);
    const avatarUrl = saved?.avatarUrl || (typeof window !== 'undefined' ? localStorage.getItem('arkipelago_user_avatar') || undefined : undefined);
    const phoneNumber = saved?.phoneNumber;

    const mockUser: User = {
      id: saved?.id || preset?.id || (crypto.randomUUID?.() || `user-${Date.now()}`),
      email: lowerEmail,
      name,
      role,
      avatarUrl,
      phoneNumber,
      assignedProjectCodes: preset?.assignedProjectCodes || (role === 'contractor' ? ['CV-2024', 'BCP-2024'] : undefined),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    saveProfileForEmail(lowerEmail, mockUser);
    setUser(mockUser);

    // Broadcast user update across window and tabs
    window.dispatchEvent(new CustomEvent(USER_EVENT_NAME, { detail: mockUser }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(USER_CHANNEL_NAME);
        bc.postMessage({ type: 'USER_UPDATED', user: mockUser });
        bc.close();
      } catch {}
    }

    return { success: true };
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>): Promise<User | null> => {
    if (!user) return null;
    const lowerEmail = user.email.toLowerCase().trim();
    const updatedUser: User = {
      ...user,
      ...updates,
      email: lowerEmail,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    saveProfileForEmail(lowerEmail, updatedUser);
    setUser(updatedUser);

    // Notify current tab
    window.dispatchEvent(new CustomEvent(USER_EVENT_NAME, { detail: updatedUser }));

    // Notify other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(USER_CHANNEL_NAME);
        bc.postMessage({ type: 'USER_UPDATED', user: updatedUser });
        bc.close();
      } catch {}
    }

    // Persist to server API asynchronously
    try {
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      }).catch(() => {});
    } catch {}

    return updatedUser;
  }, [user]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    window.dispatchEvent(new CustomEvent(USER_EVENT_NAME, { detail: null }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(USER_CHANNEL_NAME);
        bc.postMessage({ type: 'USER_UPDATED', user: null });
        bc.close();
      } catch {}
    }
    router.push('/login');
  }, [router]);

  return {
    user,
    loading,
    login,
    updateUser,
    logout,
    isAuthenticated: Boolean(user),
  };
}

export default useAuth;
