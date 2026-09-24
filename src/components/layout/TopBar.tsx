'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { useTheme } from '@/lib/themeContext';
import { useTasks } from '@/lib/hooks/useTasks';
import Logo from '@/components/ui/Logo';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { 
  Sun, Moon, LogOut, Bell, MessageSquare, Clock, Search,
  FolderKanban, BookUser, PenTool, LayoutDashboard, X, ArrowRight, Command, Plus
} from 'lucide-react';
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
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const { themeMode, toggleThemeMode } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const handleOpenTaskModal = () => {
    if (onInitializeTask) {
      onInitializeTask();
    } else {
      setIsTaskModalOpen(true);
    }
  };

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
    setCurrentDate(new Date());
    const interval = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Escape)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsSearchOpen((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      setIsNotifOpen(false);
    }
  }, []);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Search Results aggregation
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const items: Array<{
      id: string;
      category: 'Projects' | 'Directory' | 'Navigation' | 'Chat';
      title: string;
      subtitle: string;
      icon: React.ComponentType<{ className?: string }>;
      href: string;
    }> = [];

    // Search Projects
    MOCK_PROJECTS.forEach((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchClient = p.clientName ? p.clientName.toLowerCase().includes(q) : false;
      if (matchName || matchCode || matchClient) {
        items.push({
          id: `proj-${p.id}`,
          category: 'Projects',
          title: p.name,
          subtitle: `${p.code} • ${p.clientName || 'Project'}`,
          icon: FolderKanban,
          href: '/projects',
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
      if (d.name.toLowerCase().includes(q) || d.contact.toLowerCase().includes(q) || d.cat.toLowerCase().includes(q)) {
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
      { name: 'Homepage & Workspace', href: '/dashboard', cat: 'Navigation', icon: LayoutDashboard },
      { name: 'Calendar & Google Sync', href: '/calendar', cat: 'Navigation', icon: Clock },
      { name: 'Sketching Studio & Layers', href: '/sketch', cat: 'Navigation', icon: PenTool },
      { name: 'Human Resources & Attendance', href: '/hr', cat: 'Navigation', icon: Clock },
      { name: 'Estudio Wall & Chat Threads', href: '/chat', cat: 'Chat', icon: MessageSquare },
    ];
    navEntries.forEach((n, idx) => {
      if (n.name.toLowerCase().includes(q)) {
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
  }, [searchQuery]);

  return (
    <>
      <header className="w-full h-16 bg-surface-main border-b border-border-main flex items-center justify-between px-3 sm:px-6 text-text-main font-mono shrink-0 mb-6 rounded-2xl shadow-2xs relative z-40">
        {/* Left side: Studio Logo (mobile), System Online status, Timestamp, and Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 max-w-2xl">
          {/* Studio Brand & Logo (Mobile only, desktop uses centered sidebar logo) */}
          <Link href="/dashboard" className="flex md:hidden items-center gap-2.5 shrink-0 group">
            <Logo size={28} />
            <span className="font-bold text-xs tracking-wider uppercase text-text-main group-hover:text-accent-cyan transition-colors">
              Estudio Arkipelago
            </span>
          </Link>

          {/* System Online Status Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">System Online</span>
          </div>

          {/* Desktop live timestamp */}
          <div className="hidden lg:block text-xs font-medium text-muted-main tracking-normal shrink-0">
            {currentDate ? formatFullTimestamp(currentDate) : '--:--:--'}
          </div>

          {/* Persistent Global Search Bar Input Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center justify-between w-full max-w-xs px-3.5 py-1.5 rounded-xl border border-border-main bg-surface-hover/50 hover:bg-surface-hover hover:border-border-strong text-muted-main hover:text-text-main transition-all text-xs"
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

        {/* Right side: Initialize Task CTA, Greeting, Role Badge, Notifications, Theme Switcher, Sign Out */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Initialize Task Primary Action Button */}
          <button
            onClick={handleOpenTaskModal}
            className="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-1.5 rounded-lg shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Initialize New Studio Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Initialize Task</span>
            <span className="sm:hidden">Task</span>
          </button>

          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover text-muted-main"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-2.5 text-xs">
            <span className="text-muted-main font-medium">
              {getGreeting()}, <strong className="text-text-main font-semibold">{user?.name || 'Testing3'}</strong>
            </span>
            <span className="bg-surface-hover border border-border-strong px-2.5 py-1 text-[11px] capitalize font-medium text-text-main rounded-lg shadow-2xs">
              {user?.role ? user.role.replace('_', ' ') : 'Junior Architect'}
            </span>
          </div>

          {/* NOTIFICATION BELL DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover transition-colors text-muted-main hover:text-text-main relative shadow-2xs"
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
                className={`absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl border z-[100] overflow-hidden font-mono transition-all ${
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-surface-main border border-border-strong w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden font-mono text-text-main">
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-border-main gap-3 bg-surface-hover/40">
              <Search className="w-5 h-5 text-muted-main shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, directory contacts, chat threads, or jump to page..."
                className="flex-1 bg-transparent text-sm text-text-main outline-none placeholder:text-muted-main"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-muted-main hover:text-text-main hover:bg-surface-hover"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-3 space-y-1">
              {searchQuery.trim() === '' ? (
                <div className="py-8 text-center text-xs text-muted-main space-y-2">
                  <p>Type to search across entire studio database</p>
                  <div className="flex justify-center gap-2 pt-2 text-[11px]">
                    <span className="px-2 py-0.5 bg-surface-hover rounded border border-border-main">Projects</span>
                    <span className="px-2 py-0.5 bg-surface-hover rounded border border-border-main">Directory</span>
                    <span className="px-2 py-0.5 bg-surface-hover rounded border border-border-main">Threads</span>
                    <span className="px-2 py-0.5 bg-surface-hover rounded border border-border-main">Quick Actions</span>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-main">
                  No matching results found for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                searchResults.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(item.href);
                      }}
                      className="p-3 rounded-xl flex items-center justify-between hover:bg-surface-hover transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-surface-hover group-hover:bg-surface-main border border-border-main shrink-0 text-text-main">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-text-main flex items-center gap-2">
                            <span>{item.title}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-hover text-muted-main border border-border-main font-normal">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-main font-sans mt-0.5">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-main group-hover:text-accent-cyan transition-colors" />
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer Key Navigation Helper */}
            <div className="px-4 py-2.5 border-t border-border-main bg-surface-hover/30 text-[10px] text-muted-main flex items-center justify-between">
              <span>Press <kbd className="px-1 py-0.5 bg-surface-main border border-border-main rounded">Esc</kbd> to close</span>
              <span>Global Studio Command Palette</span>
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
    </>
  );
}
