'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  MessageSquare,
  Link2,
  Calendar as CalendarIcon,
  RefreshCw,
  CheckCircle2,
  Check,
  Search,
  Settings,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  X,
  Video,
  MapPin,
  Clock,
  Users,
  CalendarDays,
  LayoutList
} from 'lucide-react';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { useTasks } from '@/lib/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface StudioMeeting {
  id: string;
  title: string;
  client: string;
  projectCode: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: 'Client Review' | 'Site Inspection' | 'Design Coordination' | 'Permitting';
  source: 'STUDIO' | 'CALENDLY' | 'GOOGLE';
  location: string;
  meetingLink?: string;
  attendees: string[];
  description: string;
  status: 'confirmed' | 'pending' | 'completed';
}

interface SyncedEvent {
  id: string;
  summary: string;
  description?: string;
  start?: string;
  end?: string;
  location?: string;
  day: number;
  source: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const INITIAL_MEETINGS: StudioMeeting[] = [
  {
    id: 'mtg-01',
    title: 'Makati Tower Phase 2 - Client Design Review',
    client: 'Ayala Horizon Dev',
    projectCode: 'MT-2024',
    date: '2026-09-26', // Today (Saturday)
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    type: 'Client Review',
    source: 'CALENDLY',
    location: 'Studio Boardroom A / Google Meet',
    meetingLink: 'https://meet.google.com/ark-makati-rev',
    attendees: ['Arch. Carlos Mendoza', 'Elena Gomez (Client)', 'Mark Tan (Structural)'],
    description: 'Review updated curtain wall facade iterations, shadow study renderings, and structural core coordination.',
    status: 'confirmed',
  },
  {
    id: 'mtg-02',
    title: 'Tagaytay Ridge House - Foundation Slump & Footing Inspection',
    client: 'Montenegro Holdings',
    projectCode: 'TRH-2024',
    date: '2026-09-26', // Today
    startTime: '02:00 PM',
    endTime: '04:00 PM',
    type: 'Site Inspection',
    source: 'STUDIO',
    location: 'Tagaytay Site Location',
    attendees: ['Engr. Roberto Cruz', 'Foreman Danilo', 'Site Inspector'],
    description: 'On-site concrete slump testing and foundation rebar clearance inspection prior to scheduled weekend pouring.',
    status: 'confirmed',
  },
  {
    id: 'mtg-03',
    title: 'Prospective Siargao Villa Architectural Consultation',
    client: 'Dr. James Reyes',
    projectCode: 'SEV-2023',
    date: '2026-09-28', // Upcoming
    startTime: '03:00 PM',
    endTime: '03:45 PM',
    type: 'Client Review',
    source: 'CALENDLY',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/ark-cons-reyes',
    attendees: ['Dr. James Reyes', 'Lead Studio Partner'],
    description: 'Initial site zoning, climate adaptation, cross-ventilation analysis, and architectural style consultation.',
    status: 'confirmed',
  },
  {
    id: 'mtg-04',
    title: 'BGC Cultural Pavilion - Acoustic Consultant Sync',
    client: 'Metro Arts Foundation',
    projectCode: 'BCP-2024',
    date: '2026-09-30', // Upcoming
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    type: 'Design Coordination',
    source: 'STUDIO',
    location: 'Arkipelago Studio HQ - Acoustic Lab',
    meetingLink: 'https://meet.google.com/ark-bgc-sync',
    attendees: ['Acoustics Lead', 'Senior Project Architect'],
    description: 'Acoustic baffle placement and auditorium reverberation modeling sync with structural engineers.',
    status: 'confirmed',
  },
  {
    id: 'mtg-05',
    title: 'Casa Verde Residence - Structural Framing Walkthrough',
    client: 'Verde Family Estate',
    projectCode: 'CV-2024',
    date: '2026-09-18', // Last week (Sep 13-19)
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    type: 'Site Inspection',
    source: 'STUDIO',
    location: 'Batangas Site',
    attendees: ['Contractor Team', 'Junior Architect'],
    description: 'Steel framing alignment, beam tie inspection, and rough-in plumbing clearance check.',
    status: 'completed',
  },
  {
    id: 'mtg-06',
    title: 'City Planning Permitting & Zoning Board Hearing',
    client: 'Ayala Horizon Dev',
    projectCode: 'MT-2024',
    date: '2026-09-24', // This week (Sep 20-26)
    startTime: '01:30 PM',
    endTime: '03:00 PM',
    type: 'Permitting',
    source: 'STUDIO',
    location: 'Makati City Hall - Planning Dept',
    attendees: ['Studio Partner', 'Liaison Officer'],
    description: 'Presentation of building height clearances and traffic impact assessment for Phase 2 endorsement.',
    status: 'completed',
  },
  {
    id: 'mtg-07',
    title: 'Google Calendar: BIM Structural & Facade Alignment',
    client: 'Google Calendar Sync',
    projectCode: 'MT-2024',
    date: '2026-09-26', // Today (Saturday)
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    type: 'Design Coordination',
    source: 'GOOGLE',
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/ark-bim-align',
    attendees: ['partner@arkipelago.com', 'BIM Team Lead'],
    description: 'Quarterly coordination meeting synced from your connected Gmail & Google Calendar account.',
    status: 'confirmed',
  },
];

export default function CalendarPage() {
  const router = useRouter();
  const { tasks, addTask } = useTasks();
  
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'TASKS'>(() => {
    if (typeof window === 'undefined') return 'CALENDAR';
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    return tabParam === 'TASKS' || tabParam === 'tasks' ? 'TASKS' : 'CALENDAR';
  });

  // Calendar display state
  const [calendarViewMode, setCalendarViewMode] = useState<'AGENDA' | 'GRID'>('AGENDA');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 26)); // Sat Sep 26, 2026 (matching reference UI)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState(false);
  const [copiedMeetingLinkId, setCopiedMeetingLinkId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reference UI toolbar controls state
  const [selectedCalendarSource, setSelectedCalendarSource] = useState<string>('All Calendars');
  const [isCalendarSourceMenuOpen, setIsCalendarSourceMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | StudioMeeting['type']>('ALL');
  const [sourceSegment, setSourceSegment] = useState<'ALL' | 'CALENDLY_ONLY'>('ALL');
  const [timeHorizon, setTimeHorizon] = useState<'TODAY' | 'UPCOMING' | 'THIS_WEEK' | 'LAST_WEEK'>('TODAY');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Meetings collection
  const [meetings, setMeetings] = useState<StudioMeeting[]>(INITIAL_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<StudioMeeting | null>(null);

  // New meeting form state
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingClient, setNewMeetingClient] = useState('');
  const [newMeetingProject, setNewMeetingProject] = useState('MT-2024');
  const [newMeetingDate, setNewMeetingDate] = useState('2026-09-26');
  const [newMeetingStart, setNewMeetingStart] = useState('10:00 AM');
  const [newMeetingEnd, setNewMeetingEnd] = useState('11:00 AM');
  const [newMeetingType, setNewMeetingType] = useState<StudioMeeting['type']>('Client Review');
  const [newMeetingSource, setNewMeetingSource] = useState<'STUDIO' | 'CALENDLY'>('STUDIO');
  const [newMeetingLocation, setNewMeetingLocation] = useState('Studio Boardroom / Virtual Meet');
  const [newMeetingNotes, setNewMeetingNotes] = useState('');
  const [scheduleErrors, setScheduleErrors] = useState<Record<string, string>>({});

  // Google Calendar Sync & Detail Modal states
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isLiveGoogle, setIsLiveGoogle] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string>('partner@arkipelago.com');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedEvents, setSyncedEvents] = useState<SyncedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SyncedEvent | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    if (eventParam === 'studio-01' || eventParam) {
      return {
        id: 'studio-01',
        summary: 'Site Visit & Client Briefing',
        description: 'Architectural site inspection of Tagaytay Villa grounds and client brief meeting.',
        day: 15,
        location: 'Tagaytay Site / Studio HQ',
        source: 'Estudio Arkipelago Task',
      };
    }
    return null;
  });

  const filterRef = useRef<HTMLDivElement>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(e.target as Node)) {
        setIsCalendarSourceMenuOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const handleSyncGoogleCalendar = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/calendar/sync');
      const data = await res.json();
      if (data.success) {
        setIsGoogleSynced(true);
        setIsLiveGoogle(!!data.isLive);
        if (data.account) {
          setConnectedAccount(data.account);
        }
        if (data.events && Array.isArray(data.events)) {
          setSyncedEvents(data.events);
          const gcalMeetings: StudioMeeting[] = data.events.map((e: SyncedEvent) => {
            const dateStr = e.start ? e.start.split('T')[0] : `2026-09-${String(e.day).padStart(2, '0')}`;
            const startStr = e.start ? new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM';
            const endStr = e.end ? new Date(e.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';
            return {
              id: e.id,
              title: e.summary,
              client: 'Google Calendar Event',
              projectCode: e.summary.match(/\[(.*?)\]/)?.[1] || 'CALENDAR',
              date: dateStr,
              startTime: startStr,
              endTime: endStr,
              type: 'Client Review' as const,
              source: 'GOOGLE' as const,
              location: e.location || 'Google Meet / Virtual',
              meetingLink: e.location?.includes('meet.google.com') ? e.location : 'https://meet.google.com',
              attendees: [data.account || 'Gmail Account'],
              description: e.description || 'Synced from your connected Gmail & Google Calendar account.',
              status: 'confirmed' as const,
            };
          });
          setMeetings((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newEvents = gcalMeetings.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newEvents];
          });
        }
        showToast('✓ Gmail & Google Calendar synchronized!');
      }
    } catch (err) {
      console.error('Failed to sync Google Calendar:', err);
      showToast('⚠️ Could not sync with Gmail account');
    } finally {
      setIsSyncing(false);
    }
  }, [showToast]);

  useEffect(() => {
    const isSyncedParam = typeof window !== 'undefined' && window.location.search.includes('synced=true');
    if (isSyncedParam) {
      const timer = setTimeout(() => {
        handleSyncGoogleCalendar();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [handleSyncGoogleCalendar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedMeeting) setSelectedMeeting(null);
        else if (selectedEvent) setSelectedEvent(null);
        else if (isScheduleModalOpen) setIsScheduleModalOpen(false);
        else if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        else if (isTaskModalOpen) setIsTaskModalOpen(false);
        else if (isFilterMenuOpen) setIsFilterMenuOpen(false);
        else if (isCalendarSourceMenuOpen) setIsCalendarSourceMenuOpen(false);
        else if (isDatePickerOpen) setIsDatePickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedMeeting,
    selectedEvent,
    isScheduleModalOpen,
    isSettingsModalOpen,
    isTaskModalOpen,
    isFilterMenuOpen,
    isCalendarSourceMenuOpen,
    isDatePickerOpen,
  ]);

  const handleConnectGmail = () => {
    router.push('/api/auth/google/login');
  };

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
    showToast('✓ Task created successfully!');
  };

  // Formatted date string for reference button: e.g. "Sat Sep 26, 2026"
  const formattedReferenceDate = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[currentDate.getDay()]} ${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
  }, [currentDate]);

  // Filtered meetings computed live according to toolbar inputs
  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      // 1. Source Segment filter
      if (sourceSegment === 'CALENDLY_ONLY' && meeting.source !== 'CALENDLY') {
        return false;
      }

      // 2. Calendar source filter dropdown
      if (selectedCalendarSource === 'Google Calendar') {
        if (
          meeting.source !== 'GOOGLE' &&
          !meeting.meetingLink?.includes('meet.google.com') &&
          !meeting.location?.toLowerCase().includes('google')
        ) {
          return false;
        }
      } else if (selectedCalendarSource === 'My Calendly') {
        if (meeting.source !== 'CALENDLY') {
          return false;
        }
      } else if (selectedCalendarSource === 'Studio Schedule') {
        if (meeting.source !== 'STUDIO') {
          return false;
        }
      } else if (selectedCalendarSource === 'Site Inspections') {
        if (meeting.type !== 'Site Inspection') {
          return false;
        }
      } else if (selectedCalendarSource === 'Client Reviews') {
        if (meeting.type !== 'Client Review') {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          meeting.title.toLowerCase().includes(q) ||
          meeting.client.toLowerCase().includes(q) ||
          meeting.projectCode.toLowerCase().includes(q) ||
          meeting.location.toLowerCase().includes(q) ||
          meeting.description.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 4. Type filter popover
      if (selectedTypeFilter !== 'ALL' && meeting.type !== selectedTypeFilter) {
        return false;
      }

      // 5. Time Horizon Filter (relative to Sat Sep 26, 2026)
      const targetDate = '2026-09-26';
      if (timeHorizon === 'TODAY') {
        return meeting.date === targetDate;
      } else if (timeHorizon === 'UPCOMING') {
        return meeting.date > targetDate;
      } else if (timeHorizon === 'THIS_WEEK') {
        // Week of Sep 20 - Sep 26
        return meeting.date >= '2026-09-20' && meeting.date <= '2026-09-26';
      } else if (timeHorizon === 'LAST_WEEK') {
        // Previous week Sep 13 - Sep 19
        return meeting.date >= '2026-09-13' && meeting.date <= '2026-09-19';
      }

      return true;
    });
  }, [
    meetings,
    sourceSegment,
    selectedCalendarSource,
    searchQuery,
    selectedTypeFilter,
    timeHorizon,
  ]);

  // Handle scheduling a new meeting
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!newMeetingTitle.trim()) {
      errors.title = 'Meeting title is required';
    }
    if (!newMeetingClient.trim()) {
      errors.client = 'Client or attendee name is required';
    }
    if (Object.keys(errors).length > 0) {
      setScheduleErrors(errors);
      return;
    }

    const created: StudioMeeting = {
      id: `mtg-${Date.now()}`,
      title: newMeetingTitle.trim(),
      client: newMeetingClient.trim(),
      projectCode: newMeetingProject,
      date: newMeetingDate,
      startTime: newMeetingStart,
      endTime: newMeetingEnd,
      type: newMeetingType,
      source: newMeetingSource,
      location: newMeetingLocation.trim() || 'Studio HQ / Virtual',
      attendees: [newMeetingClient.trim(), 'Estudio Arkipelago Team'],
      description: newMeetingNotes.trim() || 'No additional notes specified.',
      status: 'confirmed',
    };

    setMeetings((prev) => [created, ...prev]);
    setIsScheduleModalOpen(false);
    setNewMeetingTitle('');
    setNewMeetingClient('');
    setNewMeetingNotes('');
    setScheduleErrors({});
    showToast(`✓ Meeting "${created.title}" scheduled!`);
  };

  // Generate 35 or 42 cells for full month grid
  const daysGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];

    // Prev month overflow
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        number: daysInPrevMonth - i,
        isCurrentMonth: false,
        fullDate: `${year}-${String(month).padStart(2, '0')}-${String(daysInPrevMonth - i).padStart(2, '0')}`,
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        number: i,
        isCurrentMonth: true,
        fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        number: i,
        isCurrentMonth: false,
        fullDate: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    return cells;
  }, [year, month]);

  return (
    <div className="font-sans text-text-main space-y-6 pb-16 relative min-h-screen">
      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* TOP HEADER: Title, Tabs & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main/50 pb-3 gap-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main font-sans">
              Calendar
            </h1>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-hover text-muted-main border border-border-main hidden sm:inline-block">
              {activeTab === 'CALENDAR' ? `${syncedEvents.length + meetings.length} Events` : `${tasks.length} Tasks`}
            </span>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 border-l border-border-main/50 pl-3 sm:pl-5">
            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer',
                activeTab === 'CALENDAR'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                  : 'text-muted-main hover:text-text-main hover:bg-surface-hover/70'
              )}
            >
              Schedule & Meetings
            </button>
            <button
              onClick={() => setActiveTab('TASKS')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'TASKS'
                  ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-2xs'
                  : 'text-muted-main hover:text-text-main hover:bg-surface-hover/70'
              )}
            >
              <span>Tasks & Queue</span>
              <span className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                activeTab === 'TASKS'
                  ? 'bg-white/20 dark:bg-black/20 text-current'
                  : 'bg-surface-hover text-muted-main border border-border-main/50'
              )}>
                {tasks.length}
              </span>
            </button>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs active:scale-[0.98] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Meeting</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-8 h-8 rounded-lg border border-border-main hover:border-text-main bg-surface-main hover:bg-surface-hover flex items-center justify-center text-muted-main hover:text-text-main transition-colors shadow-2xs cursor-pointer"
            title="Calendar & Integration Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(`${window.location.origin}/calendar`);
                showToast('✓ Studio calendar booking link copied to clipboard!');
              }
            }}
            className="w-8 h-8 rounded-lg border border-border-main hover:border-text-main bg-surface-main hover:bg-surface-hover flex items-center justify-center text-muted-main hover:text-text-main transition-colors shadow-2xs cursor-pointer"
            title="Share Studio Calendar / Export"
            aria-label="Share Calendar"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Content 1: CALENDAR & MEETINGS OPERATIONS */}
      {activeTab === 'CALENDAR' && (
        <div className="space-y-4">
          {/* REFERENCE DESIGN CONTROLS TOOLBAR CONTAINER */}
          <div className="bg-surface-main border border-border-main rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* ROW 1: Source Dropdown, Search Input, Filter Button, Segmented Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Left Controls Cluster */}
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Calendar Source Dropdown */}
                <div className="relative" ref={sourceMenuRef}>
                  <button
                    onClick={() => setIsCalendarSourceMenuOpen(!isCalendarSourceMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-main hover:border-text-main bg-surface-hover/60 hover:bg-surface-hover text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{selectedCalendarSource}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-main" />
                  </button>

                  {isCalendarSourceMenuOpen && (
                    <div className="absolute left-0 mt-1.5 w-52 bg-surface-main border border-border-main rounded-xl shadow-2xl p-1.5 z-40 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-150">
                      {[
                        'All Calendars',
                        'Google Calendar',
                        'Studio Schedule',
                        'My Calendly',
                        'Client Reviews',
                        'Site Inspections',
                      ].map((source) => (
                        <button
                          key={source}
                          onClick={() => {
                            setSelectedCalendarSource(source);
                            setIsCalendarSourceMenuOpen(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer',
                            selectedCalendarSource === source
                              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                              : 'hover:bg-surface-hover text-text-main'
                          )}
                        >
                          <span>{source}</span>
                          {selectedCalendarSource === source && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Meetings Input */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings"
                    className="w-full pl-8 pr-7 py-2 bg-surface-hover/50 border border-border-main hover:border-text-main focus:border-text-main rounded-lg text-xs font-medium text-text-main placeholder:text-muted-main outline-hidden transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-main hover:text-text-main cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Popover Button */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-2xs',
                      isFilterMenuOpen || selectedTypeFilter !== 'ALL'
                        ? 'border-text-main bg-surface-hover text-text-main'
                        : 'border-border-main hover:border-text-main bg-surface-hover/60 text-text-main'
                    )}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-main" />
                    <span>Filter</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-main" />
                    {selectedTypeFilter !== 'ALL' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    )}
                  </button>

                  {/* Filter Popover Menu */}
                  {isFilterMenuOpen && (
                    <div className="absolute left-0 mt-1.5 w-60 bg-surface-main border border-border-main rounded-xl shadow-2xl p-3 z-40 text-xs font-sans space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-main block mb-1.5">
                          Meeting Category
                        </span>
                        <div className="space-y-1">
                          {[
                            'ALL',
                            'Client Review',
                            'Site Inspection',
                            'Design Coordination',
                            'Permitting',
                          ].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => {
                                setSelectedTypeFilter(cat as typeof selectedTypeFilter);
                                setIsFilterMenuOpen(false);
                              }}
                              className={cn(
                                'w-full text-left px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between text-xs',
                                selectedTypeFilter === cat
                                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                                  : 'hover:bg-surface-hover text-text-main'
                              )}
                            >
                              <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                              {selectedTypeFilter === cat && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedTypeFilter !== 'ALL' && (
                        <div className="pt-2 border-t border-border-main/50 flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedTypeFilter('ALL');
                              setIsFilterMenuOpen(false);
                            }}
                            className="text-[11px] text-muted-main hover:text-rose-500 font-semibold cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Segmented Control: [ All meetings | Calendly only ] */}
              <div className="flex items-center bg-surface-hover/70 p-1 rounded-xl border border-border-main self-start lg:self-auto">
                <button
                  onClick={() => setSourceSegment('ALL')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    sourceSegment === 'ALL'
                      ? 'bg-surface-main text-text-main shadow-2xs border border-border-main/60'
                      : 'text-muted-main hover:text-text-main'
                  )}
                >
                  All meetings
                </button>
                <button
                  onClick={() => setSourceSegment('CALENDLY_ONLY')}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                    sourceSegment === 'CALENDLY_ONLY'
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                      : 'text-muted-main hover:text-text-main'
                  )}
                >
                  Calendly only
                </button>
              </div>
            </div>

            {/* ROW 2: Date Selector, Vertical Divider, Time Horizon Pills, Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-main/40 pt-3">
              {/* Left Date + Horizon Pills */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Dropdown */}
                <div className="relative" ref={datePickerRef}>
                  <button
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-text-main hover:text-accent-cyan transition-colors cursor-pointer font-mono"
                  >
                    <span>{formattedReferenceDate}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-main" />
                  </button>

                  {isDatePickerOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-surface-main border border-border-main rounded-xl shadow-2xl p-2 z-40 text-xs font-sans space-y-1 animate-in fade-in duration-150">
                      <button
                        onClick={() => {
                          setCurrentDate(new Date(2026, 8, 26));
                          setTimeHorizon('TODAY');
                          setIsDatePickerOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-hover text-text-main flex items-center justify-between font-semibold"
                      >
                        <span>Jump to Today</span>
                        <span className="text-[10px] text-muted-main font-mono">Sep 26</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentDate(new Date(2026, 8, 28));
                          setTimeHorizon('UPCOMING');
                          setIsDatePickerOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-hover text-text-main flex items-center justify-between font-semibold"
                      >
                        <span>Jump to Next Week</span>
                        <span className="text-[10px] text-muted-main font-mono">Sep 28</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <span className="text-border-strong font-light hidden sm:inline" aria-hidden="true">|</span>

                {/* Time Horizon Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Today Pill */}
                  <button
                    onClick={() => setTimeHorizon('TODAY')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                      timeHorizon === 'TODAY'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'border border-border-main hover:border-text-main bg-surface-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {timeHorizon === 'TODAY' && <Check className="w-3.5 h-3.5" />}
                    <span>Today</span>
                  </button>

                  {/* Upcoming Pill */}
                  <button
                    onClick={() => setTimeHorizon('UPCOMING')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                      timeHorizon === 'UPCOMING'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'border border-border-main hover:border-text-main bg-surface-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {timeHorizon === 'UPCOMING' && <Check className="w-3.5 h-3.5" />}
                    <span>Upcoming</span>
                  </button>

                  {/* This week Pill */}
                  <button
                    onClick={() => setTimeHorizon('THIS_WEEK')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                      timeHorizon === 'THIS_WEEK'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'border border-border-main hover:border-text-main bg-surface-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {timeHorizon === 'THIS_WEEK' && <Check className="w-3.5 h-3.5" />}
                    <span>This week</span>
                  </button>

                  {/* Last week Pill */}
                  <button
                    onClick={() => setTimeHorizon('LAST_WEEK')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs',
                      timeHorizon === 'LAST_WEEK'
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'border border-border-main hover:border-text-main bg-surface-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {timeHorizon === 'LAST_WEEK' && <Check className="w-3.5 h-3.5" />}
                    <span>Last week</span>
                  </button>
                </div>
              </div>

              {/* Right: Counter text + View Mode Toggle */}
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <span className="text-xs text-muted-main font-mono">
                  Displaying {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'}
                </span>

                {/* View Switcher: Agenda vs Month Grid */}
                <div className="flex items-center border border-border-main rounded-lg p-0.5 bg-surface-hover/40">
                  <button
                    onClick={() => setCalendarViewMode('AGENDA')}
                    className={cn(
                      'p-1.5 rounded text-xs transition-colors cursor-pointer',
                      calendarViewMode === 'AGENDA'
                        ? 'bg-surface-main text-text-main shadow-2xs font-bold'
                        : 'text-muted-main hover:text-text-main'
                    )}
                    title="Meetings Agenda View"
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('GRID')}
                    className={cn(
                      'p-1.5 rounded text-xs transition-colors cursor-pointer',
                      calendarViewMode === 'GRID'
                        ? 'bg-surface-main text-text-main shadow-2xs font-bold'
                        : 'text-muted-main hover:text-text-main'
                    )}
                    title="Month Grid View"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN VIEW CONTENT: AGENDA LIST OR MONTH GRID */}
          {calendarViewMode === 'AGENDA' ? (
            /* AGENDA / MEETINGS LIST VIEW */
            <div className="space-y-3">
              {filteredMeetings.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {filteredMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className="bg-surface-main border border-border-main hover:border-text-main rounded-2xl p-5 transition-all shadow-xs group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-surface-hover border border-border-main text-[11px] font-mono font-bold text-text-main">
                            {meeting.projectCode}
                          </span>
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                              meeting.source === 'CALENDLY'
                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                                : meeting.source === 'GOOGLE'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            )}
                          >
                            {meeting.source === 'CALENDLY'
                              ? 'Calendly Booking'
                              : meeting.source === 'GOOGLE'
                              ? 'Google Calendar'
                              : 'Studio Scheduled'}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                            {meeting.type}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                            {meeting.title}
                          </h3>
                          <p className="text-xs text-muted-main mt-0.5">
                            Client: <span className="text-text-main font-medium">{meeting.client}</span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-main font-medium pt-1">
                          <span className="flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                            <span>
                              {meeting.date} ({meeting.startTime} - {meeting.endTime})
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted-main" />
                            <span className="truncate max-w-xs">{meeting.location}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-muted-main" />
                            <span>{meeting.attendees.length} Attendees</span>
                          </span>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2.5 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-border-main/50">
                        {meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1.5 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Call</span>
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMeeting(meeting);
                          }}
                          className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main hover:bg-surface-hover text-xs font-semibold text-text-main transition-all shadow-2xs"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* EMPTY STATE MATCHING ZERO MEETINGS */
                <div className="bg-surface-main border border-border-main rounded-2xl p-12 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-surface-hover border border-border-main mx-auto flex items-center justify-center text-muted-main">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-main">Displaying 0 meetings</h3>
                    <p className="text-xs text-muted-main max-w-sm mx-auto mt-1">
                      No meetings or briefings found matching the active time horizon ({timeHorizon.toLowerCase()}) or filter criteria.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setTimeHorizon('TODAY');
                        setSelectedTypeFilter('ALL');
                        setSearchQuery('');
                        setSourceSegment('ALL');
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold transition-all"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Meeting</span>
                    </button>
                    {selectedCalendarSource === 'Google Calendar' && (
                      <button
                        onClick={handleSyncGoogleCalendar}
                        disabled={isSyncing}
                        className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync Gmail Account'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* MONTH GRID VIEW */
            <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-7 shadow-xs">
              {/* Calendar Controls (Month Switcher + Sync Notice) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border-main/40 pb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePrevMonth}
                    className="text-muted-main hover:text-text-main transition-colors p-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-base font-bold text-text-main min-w-[180px] font-mono">
                    {MONTH_NAMES[month]} {year}
                  </h2>
                  <button
                    onClick={handleNextMonth}
                    className="text-muted-main hover:text-text-main transition-colors p-1 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSyncGoogleCalendar}
                    disabled={isSyncing}
                    className={`flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      isGoogleSynced
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-surface-main border-border-main hover:border-text-main text-text-main'
                    }`}
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : isGoogleSynced ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <CalendarIcon className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isSyncing
                        ? 'Syncing...'
                        : isGoogleSynced
                        ? isLiveGoogle
                          ? 'Live Synced'
                          : 'Demo Synced'
                        : 'Fetch Events'}
                    </span>
                  </button>

                  {isGoogleSynced && (
                    <div className="text-xs text-muted-main font-semibold flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                      <span>{connectedAccount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted-main border-b border-border-main/40 pb-3 mb-4 font-mono">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Month Day Grid */}
              <div className="grid grid-cols-7 gap-3 font-mono">
                {daysGrid.map((cell, idx) => {
                  const daySyncedEvents = cell.isCurrentMonth
                    ? syncedEvents.filter((e) => e.day === cell.number)
                    : [];

                  const dayMeetings = cell.isCurrentMonth
                    ? meetings.filter((m) => m.date === cell.fullDate)
                    : [];

                  const isSelectedToday = cell.isCurrentMonth && cell.number === 26 && month === 8;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'min-h-[110px] sm:min-h-[135px] border rounded-xl p-3 flex flex-col justify-between transition-all',
                        cell.isCurrentMonth
                          ? isSelectedToday
                            ? 'bg-surface-main border-accent-cyan ring-1 ring-accent-cyan/30'
                            : 'bg-surface-main border-border-main/80 hover:border-text-main'
                          : 'bg-surface-hover/20 text-muted-main/30 border-border-main/30'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-xs sm:text-sm font-bold',
                            cell.isCurrentMonth ? 'text-text-main' : 'text-muted-main/40'
                          )}
                        >
                          {cell.number}
                        </span>
                        {isSelectedToday && (
                          <span className="text-[9px] font-sans font-bold px-1.5 py-0.5 rounded bg-accent-cyan/20 text-accent-cyan">
                            TODAY
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 font-sans">
                        {/* Architectural studio meetings chips */}
                        {dayMeetings.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedMeeting(m)}
                            className={cn(
                              'p-1.5 rounded text-[10px] font-semibold truncate cursor-pointer transition-all border',
                              m.source === 'CALENDLY'
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                                : 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan/20'
                            )}
                            title={m.title}
                          >
                            <span className="font-mono mr-1">[{m.startTime.split(' ')[0]}]</span>
                            <span>{m.title}</span>
                          </div>
                        ))}

                        {/* Synced Google Calendar Events */}
                        {daySyncedEvents.map((evt) => (
                          <div
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 p-1.5 rounded text-[10px] font-semibold truncate cursor-pointer hover:bg-emerald-500/20 transition-all flex items-center gap-1 shadow-2xs"
                            title="Click to view event details"
                          >
                            <span>📅</span>
                            <span className="truncate">{evt.summary}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: TASKS VIEW */}
      {activeTab === 'TASKS' && (
        <div className="bg-surface-main border border-border-main rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-main font-mono">
              Tasks Queue ({tasks.length})
            </h2>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-5 border border-border-main rounded-xl bg-surface-hover/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-text-main">{t.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main font-mono">
                        {t.taskType}
                      </span>
                    </div>
                    {t.description && <p className="text-xs text-muted-main">{t.description}</p>}
                    <div className="text-[11px] text-muted-main font-semibold pt-1 flex gap-4 font-mono">
                      <span>Phase: {t.projectPhase}</span>
                      <span>Assigned: {t.assignedMember}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-3 py-1 rounded tracking-wide self-start sm:self-center font-mono ${
                      t.priority === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                        : t.priority === 'MEDIUM'
                        ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                        : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {t.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <p className="text-xs text-muted-main italic">
                No tasks currently in queue.
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 border border-border-strong text-xs font-semibold rounded-xl hover:bg-surface-hover active:scale-[0.98] transition-all cursor-pointer shadow-xs flex items-center gap-1.5 mx-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MEETING DETAILS MODAL */}
      {selectedMeeting && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMeeting(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl relative text-text-main cursor-default my-auto max-h-[90dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border-main pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-surface-hover border border-border-main text-[11px] font-mono font-bold">
                    {selectedMeeting.projectCode}
                  </span>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-semibold border',
                      selectedMeeting.source === 'CALENDLY'
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {selectedMeeting.source === 'CALENDLY' ? 'Calendly' : 'Studio'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-text-main tracking-tight leading-tight">
                  {selectedMeeting.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="w-7 h-7 rounded-full bg-surface-hover hover:bg-border-main text-muted-main hover:text-text-main flex items-center justify-center transition-colors text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Meta Grid */}
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-surface-hover/60 p-3.5 sm:p-4 rounded-xl border border-border-main font-mono">
                <div>
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5 font-sans">
                    Date & Time
                  </span>
                  <span className="font-bold text-text-main text-xs">
                    {selectedMeeting.date}
                  </span>
                  <p className="text-[11px] text-muted-main mt-0.5">
                    {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5 font-sans">
                    Client / Organizer
                  </span>
                  <span className="font-bold text-text-main text-xs font-sans">
                    {selectedMeeting.client}
                  </span>
                  <p className="text-[11px] text-emerald-500 font-sans mt-0.5 capitalize">
                    ● {selectedMeeting.status}
                  </p>
                </div>
                <div className="col-span-full pt-2 border-t border-border-main/50 font-sans">
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5">
                    Location / Platform
                  </span>
                  <span className="font-medium text-text-main inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>{selectedMeeting.location}</span>
                  </span>
                </div>
              </div>

              {/* Meeting Link & Copy Link Section */}
              <div className="space-y-1.5 font-sans">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                  Virtual Meeting Link / Booking URL
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface-hover/70 border border-border-main rounded-xl overflow-hidden text-xs">
                    <Video className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                    <input
                      type="text"
                      readOnly
                      value={selectedMeeting.meetingLink || `${typeof window !== 'undefined' ? window.location.origin : ''}/calendar?meeting=${selectedMeeting.id}`}
                      placeholder="https://meet.google.com/ark-..."
                      className="bg-transparent border-0 outline-none w-full text-xs font-mono text-text-main truncate select-all cursor-pointer"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const linkToCopy = selectedMeeting.meetingLink || `${window.location.origin}/calendar?meeting=${selectedMeeting.id}`;
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(linkToCopy);
                        setCopiedMeetingLinkId(selectedMeeting.id);
                        showToast('✓ Meeting link copied to clipboard!');
                        setTimeout(() => setCopiedMeetingLinkId(null), 2500);
                      }
                    }}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border shadow-2xs active:scale-95',
                      copiedMeetingLinkId === selectedMeeting.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'bg-surface-main border-border-main hover:border-text-main text-text-main hover:bg-surface-hover'
                    )}
                    title="Copy Meeting Link"
                  >
                    {copiedMeetingLinkId === selectedMeeting.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Attendees List */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                  Attendees ({selectedMeeting.attendees.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMeeting.attendees.map((attendee, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border-main text-[11px] font-medium text-text-main"
                    >
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>

              {/* Agenda & Notes */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                  Meeting Brief & Agenda
                </span>
                <div className="p-3 rounded-xl bg-surface-hover/60 border border-border-main text-text-main text-xs leading-relaxed whitespace-pre-wrap">
                  {selectedMeeting.description}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-border-main pt-3.5">
              {selectedMeeting.meetingLink ? (
                <a
                  href={selectedMeeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-accent-cyan text-black font-bold text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all shadow-2xs"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Launch Call</span>
                </a>
              ) : (
                <span className="text-xs text-muted-main italic">In-person site meeting</span>
              )}
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isScheduleModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsScheduleModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-lg w-full p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-2xl relative text-text-main cursor-default my-auto max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Schedule Studio Meeting
                </h3>
                <p className="text-xs text-muted-main mt-0.5">
                  Set up a design review, site inspection, or client consultation
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-surface-hover hover:bg-border-main text-muted-main hover:text-text-main flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              {/* Meeting Title */}
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Meeting Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMeetingTitle}
                  onChange={(e) => {
                    setNewMeetingTitle(e.target.value);
                    if (scheduleErrors.title) {
                      setScheduleErrors((prev) => ({ ...prev, title: '' }));
                    }
                  }}
                  placeholder="e.g. Schematic Design Review - Facade Details"
                  className={cn(
                    'w-full px-3.5 py-2 rounded-xl bg-surface-hover/60 border text-xs text-text-main outline-hidden transition-all',
                    scheduleErrors.title
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-border-main focus:border-text-main'
                  )}
                />
                {scheduleErrors.title && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                    ⚠ {scheduleErrors.title}
                  </p>
                )}
              </div>

              {/* Client & Project Code Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Client / Lead Attendee <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMeetingClient}
                    onChange={(e) => {
                      setNewMeetingClient(e.target.value);
                      if (scheduleErrors.client) {
                        setScheduleErrors((prev) => ({ ...prev, client: '' }));
                      }
                    }}
                    placeholder="e.g. Ayala Horizon Dev"
                    className={cn(
                      'w-full px-3.5 py-2 rounded-xl bg-surface-hover/60 border text-xs text-text-main outline-hidden transition-all',
                      scheduleErrors.client
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-border-main focus:border-text-main'
                    )}
                  />
                  {scheduleErrors.client && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                      ⚠ {scheduleErrors.client}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Project Reference
                  </label>
                  <select
                    value={newMeetingProject}
                    onChange={(e) => setNewMeetingProject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden font-mono"
                  >
                    <option value="MT-2024">MT-2024 (Makati Tower)</option>
                    <option value="CV-2024">CV-2024 (Casa Verde)</option>
                    <option value="BCP-2024">BCP-2024 (BGC Pavilion)</option>
                    <option value="TRH-2024">TRH-2024 (Tagaytay Ridge)</option>
                    <option value="SEV-2023">SEV-2023 (Siargao Villa)</option>
                  </select>
                </div>
              </div>

              {/* Date, Start Time & End Time Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-text-main block mb-1 font-mono">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-main block mb-1 font-mono">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={newMeetingStart}
                    onChange={(e) => setNewMeetingStart(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-text-main block mb-1 font-mono">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={newMeetingEnd}
                    onChange={(e) => setNewMeetingEnd(e.target.value)}
                    placeholder="11:30 AM"
                    className="w-full px-2.5 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Category Type & Source */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Category Type
                  </label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as StudioMeeting['type'])}
                    className="w-full px-3 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden"
                  >
                    <option value="Client Review">Client Review</option>
                    <option value="Site Inspection">Site Inspection</option>
                    <option value="Design Coordination">Design Coordination</option>
                    <option value="Permitting">Permitting & Zoning</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Booking Channel
                  </label>
                  <select
                    value={newMeetingSource}
                    onChange={(e) => setNewMeetingSource(e.target.value as 'STUDIO' | 'CALENDLY')}
                    className="w-full px-3 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden"
                  >
                    <option value="STUDIO">Studio Master Schedule</option>
                    <option value="CALENDLY">Calendly Link Booking</option>
                  </select>
                </div>
              </div>

              {/* Location or Meeting Link */}
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Location or Video Meeting Link
                </label>
                <input
                  type="text"
                  value={newMeetingLocation}
                  onChange={(e) => setNewMeetingLocation(e.target.value)}
                  placeholder="e.g. Studio Boardroom / https://meet.google.com/xyz"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden"
                />
              </div>

              {/* Notes / Agenda */}
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Briefing Notes & Key Milestones
                </label>
                <textarea
                  rows={2}
                  value={newMeetingNotes}
                  onChange={(e) => setNewMeetingNotes(e.target.value)}
                  placeholder="Key topics to discuss, drawing sheets to review..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border-main hover:bg-surface-hover text-xs font-semibold text-muted-main hover:text-text-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALENDAR & INTEGRATION SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Calendar & Integration Settings
                </h3>
                <p className="text-xs text-muted-main mt-0.5">
                  Configure Calendly links, Google Calendar sync, and meeting defaults
                </p>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-surface-hover hover:bg-border-main text-muted-main hover:text-text-main flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Calendly Booking URL */}
              <div className="space-y-1">
                <label className="font-semibold text-text-main block">
                  Studio Calendly Booking Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue="https://calendly.com/estudio-arkipelago"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden font-mono"
                  />
                  <button
                    onClick={() => showToast('✓ Calendly URL saved!')}
                    className="px-3.5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Google Calendar & Gmail Sync */}
              <div className="p-4 rounded-xl bg-surface-hover/50 border border-border-main space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', isGoogleSynced ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-amber-600 dark:bg-amber-500')} />
                    <span className="font-bold text-text-main">Sync Your Gmail Account (Google Calendar)</span>
                  </div>
                  <span className={cn('text-[11px] font-mono font-semibold', isGoogleSynced ? 'text-text-main' : 'text-amber-600 dark:text-amber-400')}>
                    {isGoogleSynced ? 'Connected & Active' : 'Ready to Sync'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-main">
                  {isGoogleSynced
                    ? `Synchronized with ${connectedAccount}. Studio meetings, client reviews, and scheduled invites from your Gmail & Google Calendar are reflected in real time.`
                    : 'Connect your Gmail account to synchronize Google Calendar events, site inspections, and client consultations.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleSyncGoogleCalendar}
                    disabled={isSyncing}
                    className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                  <button
                    onClick={handleConnectGmail}
                    className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                  >
                    {isGoogleSynced ? 'Change Gmail Account' : 'Connect Gmail Account'}
                  </button>
                  {isGoogleSynced && (
                    <button
                      onClick={() => {
                        setIsGoogleSynced(false);
                        setIsLiveGoogle(false);
                        setSyncedEvents([]);
                        showToast('✓ Disconnected Gmail account');
                      }}
                      className="px-3 py-1.5 text-xs text-muted-main hover:text-rose-500 font-semibold transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>

              {/* Default Durations & Timezone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Default Consultation
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs text-text-main outline-hidden font-mono">
                    <option>45 Minutes</option>
                    <option>30 Minutes</option>
                    <option>60 Minutes</option>
                    <option>90 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Studio Timezone
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-surface-hover/60 border border-border-main text-xs font-mono text-text-main">
                    Asia/Manila (GMT+8)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end border-t border-border-main pt-4">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYNCED GOOGLE EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl relative text-text-main cursor-default my-auto max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-border-main pb-3.5">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border border-border-main bg-surface-hover text-text-main">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                  {selectedEvent.source}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-text-main tracking-tight leading-tight">
                  {selectedEvent.summary}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-7 h-7 rounded-full bg-surface-hover hover:bg-border-main text-muted-main hover:text-text-main flex items-center justify-center transition-colors text-xs font-bold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 bg-surface-hover/60 p-3.5 sm:p-4 rounded-xl border border-border-main">
                <div>
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5 font-sans">
                    Date
                  </span>
                  <span className="font-bold text-text-main text-xs sm:text-sm">
                    {MONTH_NAMES[month]} {selectedEvent.day}, {year}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5 font-sans">
                    Time
                  </span>
                  <span className="font-bold text-text-main text-xs sm:text-sm">
                    {selectedEvent.start
                      ? `${new Date(selectedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'All Day Event'}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div className="col-span-full pt-2 border-t border-border-main/50 font-sans">
                    <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block mb-0.5">
                      Location / Platform
                    </span>
                    <span className="font-semibold text-accent-cyan break-all inline-flex items-center gap-1">
                      📍 {selectedEvent.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Event Link & Copy Action */}
              <div className="space-y-1.5 font-sans">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                  Event Reference Link
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface-hover/70 border border-border-main rounded-xl overflow-hidden text-xs">
                    <Link2 className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                    <input
                      type="text"
                      readOnly
                      value={selectedEvent.location?.includes('http') ? selectedEvent.location : `https://calendar.google.com/calendar/u/0/r/eventedit/${selectedEvent.id}`}
                      placeholder="https://calendar.google.com/..."
                      className="bg-transparent border-0 outline-none w-full text-xs font-mono text-text-main truncate select-all cursor-pointer"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const linkToCopy = selectedEvent.location?.includes('http') ? selectedEvent.location : `https://calendar.google.com/calendar/u/0/r/eventedit/${selectedEvent.id}`;
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(linkToCopy);
                        setCopiedMeetingLinkId(selectedEvent.id);
                        showToast('✓ Event link copied to clipboard!');
                        setTimeout(() => setCopiedMeetingLinkId(null), 2500);
                      }
                    }}
                    className={cn(
                      'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border shadow-2xs active:scale-95',
                      copiedMeetingLinkId === selectedEvent.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'bg-surface-main border-border-main hover:border-text-main text-text-main hover:bg-surface-hover'
                    )}
                    title="Copy Event Link"
                  >
                    {copiedMeetingLinkId === selectedEvent.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1 font-sans">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                  Description & Notes
                </span>
                <div className="p-3 rounded-xl bg-surface-hover/60 border border-border-main text-text-main text-xs leading-relaxed whitespace-pre-wrap min-h-[60px]">
                  {selectedEvent.description || 'No detailed description provided for this calendar event.'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border-main pt-3.5 font-sans">
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
              >
                <span>Open in Google Calendar</span> ↗
              </a>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons Widget Stack - desktop only to avoid mobile viewport overlay */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col space-y-2.5">
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover active:scale-[0.95] transition-all cursor-pointer"
          title="Schedule Studio Meeting"
        >
          <CalendarIcon className="w-5 h-5 text-accent-cyan" />
        </button>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover active:scale-[0.95] transition-all cursor-pointer"
          title="Create Task"
        >
          <FileText className="w-5 h-5 text-emerald-500" />
        </button>
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.origin + '/calendar');
              setCopiedLinkNotice(true);
              showToast('✓ Calendar link copied to clipboard!');
              setTimeout(() => setCopiedLinkNotice(false), 2500);
            }
          }}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover active:scale-[0.95] transition-all relative cursor-pointer"
          title="Copy Studio Calendar Link"
        >
          {copiedLinkNotice ? <Check className="w-5 h-5 text-emerald-500" /> : <Link2 className="w-5 h-5" />}
        </button>
        <button
          onClick={() => router.push('/chat')}
          className="w-11 h-11 bg-surface-main border border-border-main rounded-xl shadow-lg flex items-center justify-center text-text-main hover:bg-surface-hover active:scale-[0.95] transition-all cursor-pointer"
          title="Open Chat"
        >
          <MessageSquare className="w-5 h-5 text-amber-500" />
        </button>
      </div>
    </div>
  );
}
