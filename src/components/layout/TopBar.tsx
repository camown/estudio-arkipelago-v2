'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { useTheme } from '@/lib/themeContext';
import { useTasks } from '@/lib/hooks/useTasks';
import Logo from '@/components/ui/Logo';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { DailyLogbookModal } from '@/components/common/DailyLogbookModal';
import { 
  Sun, Moon, LogOut, Bell, MessageSquare, Clock, Search,
  FolderKanban, BookUser, PenTool, LayoutDashboard, X, ArrowRight, Command, Plus, PanelLeft,
  FileText, BookOpen
} from 'lucide-react';
import { useSidebar } from '@/lib/sidebarContext';
import { MOCK_PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: 'message' | 'reminder';
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

export function TopBar({ user, onInitializeTask }: TopBarProps) {
  const router = useRouter();
  const { addTask } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(() => (typeof window !== 'undefined' ? new Date() : null));
  const { themeMode, toggleThemeMode } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isCollapsed: isSidebarCollapsed, toggleSidebar } = useSidebar();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'message',
      title: 'New Direct Message',
      description: 'Arch. Maria Cruz sent a photo update on Makati Tower Phase 2.',
      time: '10m ago',
      unread: true,
      link: '/chat?thread=thread-001',
    },
    {
      id: 'n2',
      type: 'reminder',
      title: 'Project Deadline Reminder',
      description: 'Casa Verde Residence schematic review due by EOD Friday.',
      time: '1h ago',
      unread: true,
      link: '/projects',
    },
    {
      id: 'n3',
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
  };

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

    // Quick Actions (always accessible or matched by query)
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

    // Search Drawing Sheets
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
          href: `/projects?sheet=${s.number}`,
        });
      }
    });

    // Search Projects
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
          href: '/projects',
        });
      }
    });

    // Search Chat Rooms & Topic Threads
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

    // Search Directory Contacts
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

    // Search Navigation & Modules
    const navEntries = [
      { name: 'Homepage & Workspace', href: '/dashboard', cat: 'Navigation' as const, icon: LayoutDashboard },
      { name: 'Projects Blueprint Vault', href: '/projects', cat: 'Navigation' as const, icon: FolderKanban },
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

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / ArrowDown / ArrowUp / Enter / Escape)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (!isSearchOpen) return;

      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults.length > 0 && searchResults[selectedIndex]) {
          handleExecuteItem(searchResults[selectedIndex]);
        }
      }
    },
    [isSearchOpen, searchResults, selectedIndex, handleExecuteItem]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

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

  return (
    <>
      <header className="w-full h-16 bg-surface-main border-b border-border-main flex items-center justify-between px-3 sm:px-6 text-text-main font-mono shrink-0 mb-6 rounded-2xl shadow-2xs relative z-40">
        {/* Left side: Sidebar Toggle (Desktop), Studio Logo (mobile), Timestamp, and Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 max-w-2xl">
          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex items-center justify-center p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover text-muted-main hover:text-text-main transition-colors cursor-pointer shrink-0 shadow-2xs"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Studio Brand & Logo (Mobile only, desktop uses centered sidebar logo) */}
          <Link href="/dashboard" className="flex md:hidden items-center gap-2 shrink-0 group">
            <Logo size={26} />
            <span className="font-bold text-xs tracking-wider uppercase text-text-main group-hover:text-accent-cyan transition-colors hidden xs:inline sm:inline">
              Estudio Arkipelago
            </span>
            <span className="font-bold text-xs tracking-wider uppercase text-text-main group-hover:text-accent-cyan transition-colors xs:hidden">
              Arkipelago
            </span>
          </Link>

          {/* Desktop live timestamp */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-main tracking-normal shrink-0">
            <Clock className="w-3.5 h-3.5 text-muted-main/70" />
            <span>{currentDate ? formatFullTimestamp(currentDate) : '--:--:--'}</span>
          </div>

          {/* Persistent Global Search Bar Input Trigger */}
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

        {/* Right side: Initialize Task CTA, Role Badge, Notifications, Theme Switcher, Sign Out */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {/* Add Task Primary Action Button */}
          <button
            onClick={handleOpenTaskModal}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-1.5 rounded-lg shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
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
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover text-muted-main cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Role Badge */}
          <div className="hidden lg:flex items-center">
            <span className="bg-surface-hover border border-border-strong px-2.5 py-1 text-[11px] capitalize font-medium text-text-main rounded-lg shadow-2xs">
              {user?.role ? user.role.replace('_', ' ') : 'Junior Architect'}
            </span>
          </div>

          {/* NOTIFICATION BELL DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
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

            {/* Backdrop overlay for clicking outside */}
            {isNotifOpen && (
              <div
                className="fixed inset-0 z-[95]"
                onClick={() => setIsNotifOpen(false)}
              />
            )}

            {/* Notifications Dropdown Popover */}
            {isNotifOpen && (
              <div
                className={`absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl border z-[100] overflow-hidden font-mono transition-all animate-in fade-in zoom-in-95 duration-150 ${
                  themeMode === 'light'
                    ? 'bg-white border-border-strong text-[#18181B] shadow-2xl ring-1 ring-black/5'
                    : 'bg-[#18181B] border-border-strong text-white shadow-2xl ring-1 ring-white/10'
                }`}
              >
                {/* Header */}
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
                      className="text-[10px] font-semibold text-accent-cyan hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-border-main/50 bg-surface-main">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
                        );
                        setIsNotifOpen(false);
                        if (notif.link) {
                          router.push(notif.link);
                        }
                      }}
                      className={cn(
                        "p-4 transition-all flex items-start gap-3 cursor-pointer",
                        notif.unread ? "bg-accent-cyan/5 hover:bg-accent-cyan/10" : "hover:bg-surface-hover"
                      )}
                    >
                      <div className="mt-0.5 p-2 rounded-xl border border-border-main bg-surface-hover shrink-0">
                        {notif.type === 'message' ? (
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

                {/* Footer */}
                <div className="p-3 border-t border-border-main text-center bg-surface-hover/30">
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-[10px] font-bold text-muted-main uppercase tracking-wider hover:text-text-main transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl hover:bg-surface-hover transition-colors text-muted-main hover:text-text-main border border-border-main bg-surface-main shadow-2xs"
            title="Toggle Day/Night Mode"
          >
            {themeMode === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={() => {
              localStorage.removeItem('arkipelago_user');
              router.push('/login');
            }}
            className="p-2 text-muted-main hover:text-accent-red transition-colors rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover shadow-2xs"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
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
            {/* Search Input Bar */}
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

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-main space-y-2">
                  <p>No matching results found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-[11px] text-muted-main/70">
                    Try searching for sheet numbers like &ldquo;A-101&rdquo;, project codes like &ldquo;PRJ-001&rdquo;, or &ldquo;Timer&rdquo;
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

            {/* Modal Footer Key Navigation Helper */}
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
