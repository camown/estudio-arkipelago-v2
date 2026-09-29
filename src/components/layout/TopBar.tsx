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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search Results aggregation
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const items: Array<{
      id: string;
      category: 'Drawing Sheets' | 'Projects' | 'Chat Rooms' | 'Quick Actions' | 'Directory' | 'Navigation';
      title: string;
      code?: string;
      subtitle: string;
      icon: React.ComponentType<{ className?: string }>;
      href?: string;
      action?: () => void;
    }> = [];

    // Quick Actions
    const quickActions = [
      {
        id: 'act-new-task',
        category: 'Quick Actions' as const,
        title: 'New Studio Task',
        subtitle: 'Create a deliverable or assignment task',
        icon: Plus,
        action: () => handleOpenTaskModal(),
      },
      {
        id: 'act-shortcuts',
        category: 'Quick Actions' as const,
        title: 'Keyboard Shortcuts Cheatsheet (?)',
        subtitle: 'View all CAD & studio hotkeys',
        icon: Keyboard,
        action: () => setIsShortcutsModalOpen(true),
      },
      {
        id: 'act-toggle-theme',
        category: 'Quick Actions' as const,
        title: themeMode === 'light' ? 'Switch to Night Mode (Dark)' : 'Switch to Day Mode (Light)',
        subtitle: 'Toggle studio light / dark color system',
        icon: themeMode === 'light' ? Moon : Sun,
        action: () => toggleThemeMode(),
      },
      {
        id: 'act-sketch-canvas',
        category: 'Quick Actions' as const,
        title: 'Open Sketching & Redline Canvas',
        subtitle: 'Direct drawing board, layers & markups',
        icon: PenTool,
        href: '/sketch',
      },
      {
        id: 'act-timesheet',
        category: 'Quick Actions' as const,
        title: 'View Timesheets & Time Logs',
        subtitle: 'Studio attendance and project hour tracking',
        icon: Clock,
        href: '/hr',
      },
    ];

    quickActions.forEach((act) => {
      if (!q || act.title.toLowerCase().includes(q) || act.subtitle.toLowerCase().includes(q)) {
        items.push(act);
      }
    });

    // Drawing Sheets
    const DRAWING_SHEETS = [
      { number: 'A-101', title: 'Ground Floor & Reflected Ceiling Plan', project: 'Makati Luxury Tower', code: 'PRJ-001', rev: 'REV 03' },
      { number: 'A-102', title: 'Second Floor Architectural Layout', project: 'Makati Luxury Tower', code: 'PRJ-001', rev: 'REV 02' },
      { number: 'SEC-01', title: 'Transverse & Longitudinal Sections', project: 'Makati Luxury Tower', code: 'PRJ-001', rev: 'REV 01' },
      { number: 'MAT-01', title: 'Interior Finishes & Material Schedule', project: 'BGC Cultural Pavilion', code: 'PRJ-002', rev: 'REV 04' },
      { number: 'E-101', title: 'Lighting & Power Distribution Plan', project: 'BGC Cultural Pavilion', code: 'PRJ-002', rev: 'REV 02' },
      { number: 'STR-01', title: 'Foundation & Shear Wall Coordination', project: 'Cebu Resort & Spa', code: 'PRJ-003', rev: 'REV 01' },
      { number: 'DET-01', title: 'Curtain Wall & Mullion Junction Details', project: 'Makati Luxury Tower', code: 'PRJ-001', rev: 'REV 03' },
    ];
    DRAWING_SHEETS.forEach((s, idx) => {
      const matchNum = s.number.toLowerCase().includes(q);
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchProj = s.project.toLowerCase().includes(q);
      const matchRev = s.rev.toLowerCase().includes(q);
      if (q && (matchNum || matchTitle || matchProj || matchRev)) {
        items.push({
          id: `sheet-${idx}`,
          category: 'Drawing Sheets',
          title: s.title,
          code: s.number,
          subtitle: `${s.project} [${s.code}] • ${s.rev}`,
          icon: FileText,
          href: `/projects?code=MT-2024`,
        });
      }
    });

    // Projects
    MOCK_PROJECTS.forEach((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchClient = p.clientName ? p.clientName.toLowerCase().includes(q) : false;
      if (q && (matchName || matchCode || matchClient)) {
        items.push({
          id: `proj-${p.id}`,
          category: 'Projects',
          title: p.name,
          code: p.code,
          subtitle: `${p.clientName || 'Studio Project'} • Phase: ${p.status}`,
          icon: FolderKanban,
          href: `/projects?code=${p.code}`,
        });
      }
    });

    // Chat Rooms
    const CHAT_ROOMS = [
      { id: 'thread-001', name: '[PRJ-001] Structural Coordination & Slab Review', project: 'Makati Luxury Tower' },
      { id: 'thread-002', name: '[PRJ-002] 3D Massing & Façade Material Board', project: 'BGC Cultural Pavilion' },
      { id: 'thread-003', name: '[PRJ-003] Interior Finishes & Tile Specs', project: 'Cebu Resort & Spa' },
      { id: 'thread-004', name: '[GENERAL] Studio All-Hands & Weekly Review', project: 'Studio Arkipelago' },
    ];
    CHAT_ROOMS.forEach((c) => {
      const matchName = c.name.toLowerCase().includes(q);
      const matchProj = c.project.toLowerCase().includes(q);
      if (q && (matchName || matchProj)) {
        items.push({
          id: `chat-${c.id}`,
          category: 'Chat Rooms',
          title: c.name,
          subtitle: `Project Topic • ${c.project}`,
          icon: MessageSquare,
          href: `/chat?thread=${c.id}`,
        });
      }
    });

    // Directory Contacts
    const directoryItems = [
      { name: 'AMJ Structural Engineering', cat: 'Engineers', contact: 'Engr. Aris Mendoza' },
      { name: 'Pacific Glass & Aluminum Tech', cat: 'Suppliers', contact: 'Luis Tan' },
      { name: 'BuildCore General Contractors', cat: 'Contractors', contact: 'Engr. Ramon Santos' },
      { name: 'Metro Environmental Legal & Permits', cat: 'Allied Services', contact: 'Atty. Clara Reyes' },
    ];
    directoryItems.forEach((d, idx) => {
      if (q && (d.name.toLowerCase().includes(q) || d.contact.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q))) {
        items.push({
          id: `dir-${idx}`,
          category: 'Directory',
          title: d.name,
          subtitle: `${d.cat} • ${d.contact}`,
          icon: BookUser,
          href: '/directory',
        });
      }
    });

    // Navigation & Modules
    const navEntries = [
      { name: 'Homepage & Workspace', href: '/dashboard', cat: 'Navigation' as const, icon: LayoutDashboard },
      { name: 'Projects Blueprint Vault & RFIs', href: '/projects', cat: 'Navigation' as const, icon: FolderKanban },
      { name: 'Calendar & Google Sync', href: '/calendar', cat: 'Navigation' as const, icon: Clock },
      { name: 'Sketching Studio & Layers', href: '/sketch', cat: 'Navigation' as const, icon: PenTool },
      { name: 'Human Resources & Attendance', href: '/hr', cat: 'Navigation' as const, icon: Clock },
      { name: 'Estudio Wall & Chat Threads', href: '/chat', cat: 'Navigation' as const, icon: MessageSquare },
      { name: 'Directory & Consultants Index', href: '/directory', cat: 'Navigation' as const, icon: BookUser },
    ];
    navEntries.forEach((n, idx) => {
      if (q && n.name.toLowerCase().includes(q)) {
        items.push({
          id: `nav-${idx}`,
          category: 'Navigation',
          title: n.name,
          subtitle: `Go to ${n.name}`,
          icon: n.icon,
          href: n.href,
        });
      }
    });

    return items;
  }, [searchQuery, themeMode, handleOpenTaskModal, toggleThemeMode]);

  const handleExecuteItem = useCallback((item: (typeof searchResults)[0]) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  }, [router]);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // 1. Ctrl+K or Cmd+K: Search & Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // If search palette is open, handle search item navigation
      if (isSearchOpen) {
        if (e.key === 'Escape') {
          setIsSearchOpen(false);
          setIsNotifOpen(false);
          setIsProfileOpen(false);
          return;
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
          return;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
          return;
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (searchResults.length > 0 && searchResults[selectedIndex]) {
            handleExecuteItem(searchResults[selectedIndex]);
          }
          return;
        }
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
        setIsSearchOpen(false);
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
  }, [router, toggleThemeMode, isSearchOpen, searchResults, selectedIndex, handleExecuteItem]);

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
            <Logo size={26} />
            <span className="font-bold text-xs tracking-wider uppercase text-text-main group-hover:text-accent-cyan transition-colors hidden xs:inline sm:inline">
              Estudio Arkipelago
            </span>
            <span className="font-bold text-xs tracking-wider uppercase text-text-main group-hover:text-accent-cyan transition-colors xs:hidden">
              Arkipelago
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-main tracking-normal shrink-0">
            <Clock className="w-3.5 h-3.5 text-muted-main/70" />
            <span>{currentDate ? formatFullTimestamp(currentDate) : '--:--:--'}</span>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
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

          {/* Keyboard Shortcuts Trigger Button */}
          <button
            onClick={() => setIsShortcutsModalOpen(true)}
            className="p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover active:scale-[0.95] transition-all text-muted-main hover:text-text-main shadow-2xs cursor-pointer hidden sm:flex"
            title="Keyboard Shortcuts Cheatsheet (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
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
                className={`absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl border z-[100] overflow-hidden font-mono transition-all animate-in fade-in zoom-in-95 duration-150 ${
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
              <div className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-border-strong bg-surface-main shadow-2xl p-3 z-[110] space-y-3 font-mono animate-in fade-in duration-100">
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

      {/* Global Search Command Palette Modal (Cmd+K) */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-surface-main border border-border-strong w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden font-mono text-text-main cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 py-3.5 border-b border-border-main gap-3 bg-surface-hover/40">
              <Search className="w-5 h-5 text-muted-main shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search projects, drawing sheets (A-101), chat topics, actions..."
                className="flex-1 bg-transparent text-sm text-text-main outline-none placeholder:text-muted-main font-sans"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-muted-main hover:text-text-main hover:bg-surface-hover cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-main space-y-2">
                  <p>No matching results found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-muted-main/70">
                    Try searching for sheet numbers like &ldquo;A-101&rdquo;, project codes like &ldquo;MT-2024&rdquo;, or &ldquo;Timer&rdquo;
                  </p>
                </div>
              ) : (
                searchResults.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleExecuteItem(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        "p-3 rounded-xl flex items-center justify-between transition-all cursor-pointer group",
                        isSelected
                          ? "bg-surface-hover/90 border-l-2 border-accent-cyan pl-3.5 shadow-2xs"
                          : "hover:bg-surface-hover/60"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "p-2 rounded-lg border shrink-0 transition-colors",
                            isSelected
                              ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                              : "bg-surface-hover border-border-main text-muted-main group-hover:text-text-main"
                          )}
                        >
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-text-main flex items-center gap-2 flex-wrap">
                            {item.code && (
                              <span className="font-mono font-bold text-accent-cyan text-[11px]">
                                [{item.code}]
                              </span>
                            )}
                            <span className="truncate">{item.title}</span>
                            <span
                              className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded border font-sans font-medium uppercase tracking-wider shrink-0",
                                item.category === 'Drawing Sheets'
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
                                  : item.category === 'Projects'
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : item.category === 'Chat Rooms'
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : item.category === 'Quick Actions'
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                  : "bg-surface-hover text-muted-main border-border-main"
                              )}
                            >
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-main font-sans mt-0.5 truncate">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight
                        className={cn(
                          "w-4 h-4 text-muted-main transition-transform shrink-0",
                          isSelected ? "text-accent-cyan translate-x-0.5" : "opacity-0 group-hover:opacity-100"
                        )}
                      />
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-border-main bg-surface-hover/30 text-[10px] text-muted-main flex flex-wrap items-center justify-between gap-2 font-sans">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-main border border-border-main rounded font-mono">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-surface-main border border-border-main rounded font-mono">↓</kbd>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-main border border-border-main rounded font-mono">↵</kbd>
                  <span>select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-main border border-border-main rounded font-mono">Esc</kbd>
                  <span>close</span>
                </span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-surface-main border border-border-main rounded text-muted-main font-mono text-[10px]">
                Ctrl + K
              </kbd>
            </div>
          </div>
        </div>
      )}

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
