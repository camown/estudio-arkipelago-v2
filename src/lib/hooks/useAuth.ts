'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { PRESET_ACCOUNTS } from '@/lib/constants';

const STORAGE_KEY = 'arkipelago_user';

function getRoleFromEmail(email: string): 'partner' | 'senior_architect' | 'junior_architect' | 'contractor' {
  const lower = email.toLowerCase();
  if (lower.startsWith('partner@')) return 'partner';
  if (lower.startsWith('senior@')) return 'senior_architect';
  if (lower.startsWith('contractor@')) return 'contractor';
  return 'junior_architect';
}

function getNameFromEmail(email: string): string {
  const preset = PRESET_ACCOUNTS.find(a => a.email === email.toLowerCase());
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
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  useEffect(() => {
    // Sync state if storage changes across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (password !== 'admin') return { success: false, error: 'Invalid credentials' };
    const mockUser: User = {
      id: crypto.randomUUID?.() || `user-${Date.now()}`,
      email,
      name: getNameFromEmail(email),
      role: getRoleFromEmail(email),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return { user, loading, login, logout, isAuthenticated: Boolean(user) };
}

export default useAuth;
