'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/types';
import { useTheme } from '@/lib/themeContext';
import { useTasks } from '@/lib/hooks/useTasks';
import Logo from '@/components/ui/Logo';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { DailyLogbookModal } from '@/components/common/DailyLogbookModal';
import { KeyboardShortcutsModal } from '@/components/common/KeyboardShortcutsModal';
import { 
  Sun, Moon, LogOut, Bell, MessageSquare, Clock, Search,
  FolderKanban, BookUser, PenTool, LayoutDashboard, X, ArrowRight, Command, Plus, PanelLeft,
  FileText, BookOpen, Keyboard, User as UserIcon, Shield, Users, Wrench, Settings, ChevronDown, Check,
  CheckCircle2, Sparkles
} from 'lucide-react';
import { useSidebar } from '@/lib/sidebarContext';
import { MOCK_PROJECTS, PRESET_ACCOUNTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: 'message' | 'reminder' | 'rfi' | 'hr';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  link: string;
}

interface TopBarProps {
  user: User | null;
  onInitializeTask?: () => void;
}

const ROLE_ICONS: Record<Role, React.ComponentType<{ className?: string }>> = {
  partner: Shield,
  senior_architect: Users,
  junior_architect: UserIcon,
  contractor: Wrench,
};

export function TopBar({ user, onInitializeTask }: TopBarProps) {
  const router = useRouter();
  const { addTask } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(() => (typeof window !== 'undefined' ? new Date() : null));
  const { themeMode, toggleThemeMode } = useTheme();
  
  // Menus
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const { isCollapsed: isSidebarCollapsed, toggleSidebar } = useSidebar();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'rfi',
      title: 'New Contractor RFI Logged',
      description: '[MT-2024] RFI-MT2024-001: Cantilever Shear Wall Rebar Clearance on Grid 4-C.',
      time: '5m ago',
      unread: true,
      link: '/projects?code=MT-2024',
    },
    {
      id: 'n2',
      type: 'hr',
      title: 'Overtime Clearance Approved',
      description: 'Your 2.5 hrs Overtime submittal for Casa Verde Residence was stamped approved.',
      time: '25m ago',
      unread: true,
      link: '/hr',
    },
    {
      id: 'n3',
      type: 'message',
      title: 'Studio Wall Update',
      description: 'Arch. Carlos Mendoza shared massing diagram rendering Rev 02.',
      time: '1h ago',
      unread: true,
      link: '/chat?tab=wall',
    },
    {
      id: 'n4',
      type: 'reminder',
      title: 'Site Visit Schedule',
      description: 'BGC Cultural Pavilion site survey scheduled for tomorrow 10:00 AM.',
      time: '3h ago',
      unread: false,
      link: '/calendar',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleOpenTaskModal = useCallback(() => {
    if (onInitializeTask) {
      onInitializeTask();
    } else {
      setIsTaskModalOpen(true);
    }
  }, [onInitializeTask]);

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
    setIsTaskModalOpen(false);
    showToast(`✓ Task "${newTaskData.name}" created!`);
  };

  // 1-Click Role Switcher
  const handleQuickSwitchRole = (targetRole: Role) => {
    const matchedAccount = PRESET_ACCOUNTS.find((a) => a.role === targetRole) || PRESET_ACCOUNTS[0];
    const newUser: User = {
      id: matchedAccount.id || `usr-${Date.now()}`,
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: matchedAccount.role,
      assignedProjectCodes: matchedAccount.assignedProjectCodes,
    };

    localStorage.setItem('arkipelago_user', JSON.stringify(newUser));
    setIsProfileOpen(false);
    showToast(`Switched profile to ${newUser.name} (${newUser.role.replace('_', ' ')})`);
    
    // Refresh page / state
    window.location.reload();
  };

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Listen for shortcuts modal custom event
  useEffect(() => {
    const handleToggleModal = () => setIsShortcutsModalOpen((prev) => !prev);
    window.addEventListener('toggle-shortcuts-modal', handleToggleModal);
    return () => window.removeEventListener('toggle-shortcuts-modal', handleToggleModal);
  }, []);

  useEffect(() => {
    const handleExternalOpen = () => setIsTaskModalOpen(true);
    window.addEventListener('open-task-modal', handleExternalOpen);
    return () => window.removeEventListener('open-task-modal', handleExternalOpen);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // 1. Ctrl+K or Cmd+K: Open Global Search & Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open_command_palette'));
        return;
      }

      // If user is typing in a form field, do not hijack typing keys
      if (isInput) return;

      // 2. '?' or 'Shift + /': Toggle Keyboard Shortcuts Cheatsheet
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 3. Alt + T: Initialize New Studio Task
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTaskModalOpen(true);
        return;
      }

      // 4. Alt + N: Toggle Night / Day Mode
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        toggleThemeMode();
        return;
      }

      // 5. Alt + R: Log New Contractor RFI
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (window.location.pathname.includes('/projects')) {
          window.dispatchEvent(new CustomEvent('open-new-rfi-modal'));
        } else {
          router.push('/projects?action=new-rfi');
        }
        return;
      }

      // 6. Alt + S: Log New Material Submittal
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (window.location.pathname.includes('/projects')) {
          window.dispatchEvent(new CustomEvent('open-new-submittal-modal'));
        } else {
          router.push('/projects?action=new-submittal');
        }
        return;
      }

      // 7. Escape: close any active popover/modal
      if (e.key === 'Escape') {
        setIsNotifOpen(false);
        setIsProfileOpen(false);
        setIsShortcutsModalOpen(false);
      }

      // 8. Two-key chord navigation sequence (e.g. 'G' then 'D')
      const now = Date.now();
      const currentKey = e.key.toLowerCase();

      if (lastKey === 'g' && now - lastKeyTime < 1000) {
        if (currentKey === 'd') {
          e.preventDefault();
          router.push('/dashboard');
        } else if (currentKey === 'p') {
          e.preventDefault();
          router.push('/projects');
        } else if (currentKey === 'c') {
          e.preventDefault();
          router.push('/calendar');
        } else if (currentKey === 's') {
          e.preventDefault();
          router.push('/sketch');
        } else if (currentKey === 'h') {
          e.preventDefault();
          router.push('/hr');
        } else if (currentKey === 'w') {
          e.preventDefault();
          router.push('/chat?tab=wall');
        }
        lastKey = '';
        return;
      }

      if (currentKey === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
      } else {
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [router, toggleThemeMode]);

  const formatFullTimestamp = (date: Date) => {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.getDate();
    const year = date.getFullYear();

    return `${timeStr} — ${dayName}, ${monthName} ${dayNum}, ${year}`;
  };

  const UserRoleIcon = user?.role ? (ROLE_ICONS[user.role] || UserIcon) : UserIcon;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[130] bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="w-full h-16 bg-surface-main border-b border-border-main flex items-center justify-between px-3 sm:px-6 text-text-main font-mono shrink-0 mb-6 rounded-2xl shadow-2xs relative z-40">
        {/* Left side: Sidebar Toggle, Studio Logo, Timestamp, and Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 max-w-2xl">
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer shrink-0 shadow-2xs"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <Link href="/dashboard" className="flex md:hidden items-center gap-2 shrink-0 group">
            <Logo size={24} />
            <span className="font-bold text-xs tracking-wider uppercase text-text-main group-hover:text-accent-cyan transition-colors hidden sm:inline">
              Estudio Arkipelago
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-main tracking-normal shrink-0">
            <Clock className="w-3.5 h-3.5 text-muted-main/70" />
            <span>{currentDate ? formatFullTimestamp(currentDate) : '--:--:--'}</span>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_command_palette'))}
            className="hidden md:flex items-center justify-between w-full max-w-xs px-3.5 py-1.5 rounded-xl border border-border-main bg-surface-hover/50 hover:bg-surface-hover hover:border-border-strong text-muted-main hover:text-text-main transition-all text-xs cursor-pointer"
            title="Global Search (Cmd/Ctrl + K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search studio...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-surface-main border border-border-main rounded text-muted-main shadow-2xs">
              <Command className="w-3 h-3 inline" /> K
            </kbd>
          </button>
        </div>

        {/* Right side Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Add Task Button */}
          <button
            onClick={handleOpenTaskModal}
            className="px-2.5 sm:px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-1.5 rounded-xl shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Add Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>

          {/* Daily Studio Logbook Button */}
          <button
            onClick={() => setIsDailyLogOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-surface-main hover:bg-surface-hover border border-border-main text-text-main font-semibold text-xs tracking-wide flex items-center gap-1.5 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
            title="Studio Daily Logbook"
          >
            <BookOpen className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="hidden sm:inline">Logbook</span>
          </button>

          {/* Mobile search button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open_command_palette'))}
            className="md:hidden p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover text-muted-main cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* NOTIFICATION BELL DROPDOWN */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover active:scale-[0.95] transition-all text-muted-main hover:text-text-main relative shadow-2xs cursor-pointer"
              title="Notifications & Reminders"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-red text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-surface-main">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Popover */}
            {isNotifOpen && (
              <div
                className={`absolute right-[-45px] sm:right-0 top-full mt-3 w-[calc(100vw-1.5rem)] max-w-sm rounded-2xl border z-[100] overflow-hidden font-mono transition-all animate-in fade-in zoom-in-95 duration-150 ${
                  themeMode === 'light'
                    ? 'bg-white border-border-strong text-[#18181B] shadow-2xl ring-1 ring-black/5'
                    : 'bg-[#18181B] border-border-strong text-white shadow-2xl ring-1 ring-white/10'
                }`}
              >
                <div className="p-4 border-b border-border-main flex items-center justify-between bg-surface-hover/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-text-main">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-accent-cyan/15 text-accent-cyan text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-semibold text-accent-cyan hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border-main/50 bg-surface-main">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
                        );
                        setIsNotifOpen(false);
                        if (notif.link) router.push(notif.link);
                      }}
                      className={cn(
                        "p-4 transition-all flex items-start gap-3 cursor-pointer",
                        notif.unread ? "bg-accent-cyan/5 hover:bg-accent-cyan/10" : "hover:bg-surface-hover"
                      )}
                    >
                      <div className="mt-0.5 p-2 rounded-xl border border-border-main bg-surface-hover shrink-0">
                        {notif.type === 'rfi' ? (
                          <FileText className="w-4 h-4 text-rose-500" />
                        ) : notif.type === 'hr' ? (
                          <Clock className="w-4 h-4 text-emerald-500" />
                        ) : notif.type === 'message' ? (
                          <MessageSquare className="w-4 h-4 text-accent-cyan" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-text-main truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-muted-main shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-main leading-relaxed line-clamp-2">
                          {notif.description}
                        </p>
                      </div>

                      {notif.unread && (
                        <span className="w-2 h-2 bg-accent-cyan rounded-full shrink-0 mt-2" title="Unread" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-border-main text-center bg-surface-hover/30">
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[10px] font-bold text-muted-main uppercase tracking-wider hover:text-text-main transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-muted-main hover:text-text-main border border-border-main bg-surface-main shadow-2xs cursor-pointer"
            title="Toggle Day/Night Mode"
          >
            {themeMode === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* USER PROFILE & 1-CLICK ROLE SWITCHER DROPDOWN */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 sm:pl-2.5 sm:pr-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover transition-all text-text-main cursor-pointer shadow-2xs group"
              title="Account & Role Switcher"
            >
              <div className="w-6 h-6 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center font-bold text-[10px] text-text-main shrink-0">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-text-main truncate max-w-[110px] leading-tight">
                  {user?.name ? user.name.split(' ')[0] : 'Architect'}
                </span>
                <span className="text-[9px] text-muted-main font-mono capitalize">
                  {user?.role ? user.role.replace('_', ' ') : 'Role'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-main group-hover:text-text-main transition-transform" />
            </button>

            {/* Profile & Role Switcher Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-xs sm:w-72 rounded-2xl border border-border-strong bg-surface-main shadow-2xl p-3 z-[110] space-y-3 font-mono animate-in fade-in duration-100">
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-surface-hover/50 border border-border-main flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm shrink-0">
                    {user?.name ? user.name.charAt(0) : 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-text-main truncate">
                      {user?.name || 'Studio Member'}
                    </p>
                    <p className="text-[10px] text-muted-main truncate">
                      {user?.email || 'architect@arkipelago.ph'}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-accent-cyan/15 text-accent-cyan uppercase">
                      {user?.role ? user.role.replace(/_/g, ' ') : 'Staff'}
                    </span>
                  </div>
                </div>

                {/* 1-Click Role Switcher */}
                <div className="space-y-1.5 pt-1 border-t border-border-main/50">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-main block px-1">
                    1-Click Role Switcher
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      { role: 'partner', label: 'Partner', icon: Shield },
                      { role: 'senior_architect', label: 'Senior Lead', icon: Users },
                      { role: 'junior_architect', label: 'Junior Staff', icon: UserIcon },
                      { role: 'contractor', label: 'Contractor', icon: Wrench },
                    ] as const).map((r) => {
                      const Icon = r.icon;
                      const isCurrent = user?.role === r.role;
                      return (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => handleQuickSwitchRole(r.role)}
                          className={cn(
                            'p-2 rounded-xl text-[11px] font-semibold text-left transition-colors flex items-center justify-between cursor-pointer border',
                            isCurrent
                              ? 'bg-black text-white dark:bg-white dark:text-black font-bold border-transparent shadow-xs'
                              : 'bg-surface-hover/60 hover:bg-surface-hover text-muted-main hover:text-text-main border-border-main/60'
                          )}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{r.label}</span>
                          </div>
                          {isCurrent && <Check className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="space-y-1 pt-1 border-t border-border-main/50 text-xs">
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full p-2 rounded-xl hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-muted-main" />
                    <span>Profile & Integration Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsShortcutsModalOpen(true);
                    }}
                    className="w-full p-2 rounded-xl hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer text-left"
                  >
                    <Keyboard className="w-4 h-4 text-muted-main" />
                    <span>Keyboard Shortcuts (?)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('arkipelago_user');
                      router.push('/login');
                    }}
                    className="w-full p-2 rounded-xl hover:bg-rose-500/10 flex items-center gap-2 text-rose-500 cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Global Task Initialization Modal */}
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Studio Daily Logbook Modal */}
      <DailyLogbookModal
        isOpen={isDailyLogOpen}
        onClose={() => setIsDailyLogOpen(false)}
        currentUser={{
          name: user?.name || 'Studio Architect',
          role: user?.role ? user.role.replace('_', ' ') : 'Junior Architect'
        }}
      />
    </>
  );
}
export default TopBar;
