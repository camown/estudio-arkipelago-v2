'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';
import { useHRRequests } from '@/lib/hooks/useHRRequests';
import { useWallPosts } from '@/lib/hooks/useWallPosts';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { MOCK_PROJECTS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import {
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
  PenTool,
  Clock,
  Play,
  Square,
  Send,
  Calendar,
  BookUser,
  ShieldCheck,
  Maximize2,
  Layers,
  Sparkles,
  ChevronRight,
  MapPin,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SchematicPin {
  id: string;
  x: number; // percentage
  y: number; // percentage
  tag: string;
  title: string;
  note: string;
  type: 'structural' | 'facade' | 'mep';
}

interface SchematicSheet {
  id: string;
  sheetNo: string;
  title: string;
  project: string;
  projectCode: string;
  previewUrl: string;
  scale: string;
  revision: string;
  pins: SchematicPin[];
}

const SCHEMATIC_SHEETS: SchematicSheet[] = [
  {
    id: 'dwg-1',
    sheetNo: 'A-101',
    title: 'Ground Floor Plan & Structural Massing',
    project: 'Makati Tower Phase 2',
    projectCode: 'MT-2024',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=80',
    scale: '1:100 @ A1',
    revision: 'Rev 02 • Approved for Site Test',
    pins: [
      {
        id: 'pin-1',
        x: 32,
        y: 40,
        tag: 'STR-01',
        title: 'Cantilever Reinforcement',
        note: 'Reinforce rebar ties ASTM A615 Grade 60 at shear wall intersection.',
        type: 'structural',
      },
      {
        id: 'pin-2',
        x: 68,
        y: 30,
        tag: 'FAC-04',
        title: 'Curtain Wall Mullion',
        note: 'Double-glazed thermal break unit; verify expansion joints on south facade.',
        type: 'facade',
      },
      {
        id: 'pin-3',
        x: 52,
        y: 70,
        tag: 'MEP-02',
        title: 'HVAC Core Riser Shaft',
        note: 'Ensure 2-hr fire dampers installed at floor slab penetration.',
        type: 'mep',
      },
    ],
  },
  {
    id: 'dwg-2',
    sheetNo: 'MAT-01',
    title: 'Italian Carrara Marble & Timber Finishes',
    project: 'Casa Verde Residence',
    projectCode: 'CV-2024',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1000&q=80',
    scale: 'NTS • Material Spec',
    revision: 'Rev 01 • Client Approved',
    pins: [
      {
        id: 'pin-4',
        x: 38,
        y: 35,
        tag: 'MAT-A',
        title: 'Honed Carrara Slab',
        note: '20mm bookmatched honed Carrara marble with breathable penetrating sealant.',
        type: 'facade',
      },
      {
        id: 'pin-5',
        x: 72,
        y: 58,
        tag: 'TIM-01',
        title: 'Smoked Oak Battens',
        note: 'Fire-retardant treated FSC-certified white oak slats with acoustic underlay.',
        type: 'structural',
      },
    ],
  },
  {
    id: 'dwg-3',
    sheetNo: 'S-101',
    title: 'Parametric Roof Framing & Foundation Grid',
    project: 'BGC Cultural Pavilion',
    projectCode: 'BCP-2024',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=1000&q=80',
    scale: '1:50 @ A0',
    revision: 'Rev 03 • Engineer Reviewed',
    pins: [
      {
        id: 'pin-6',
        x: 34,
        y: 46,
        tag: 'COL-A1',
        title: 'Tree Column Node',
        note: 'Custom cast steel branch node; ultrasound weld inspection required.',
        type: 'structural',
      },
      {
        id: 'pin-7',
        x: 74,
        y: 50,
        tag: 'GLA-08',
        title: 'Fritted Skylight Panel',
        note: '40% ceramic frit pattern to manage solar heat gain coefficient (SHGC < 0.28).',
        type: 'facade',
      },
    ],
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const { requests } = useHRRequests();
  const { posts, addPost } = useWallPosts();
  const {
    isClocked,
    elapsedTime,
    clockIn,
    clockOut,
    todayEntries,
    selectedProjectId,
    setSelectedProjectId,
  } = useClockIn();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedPinId, setSelectedPinId] = useState<string | null>('pin-1');
  const [wallInput, setWallInput] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [activeTimerProject, setActiveTimerProject] = useState<string>(
    selectedProjectId || MOCK_PROJECTS[0]?.id || '1'
  );

  const activeSheet = SCHEMATIC_SHEETS[activeSheetIndex];
  const selectedPin =
    activeSheet.pins.find((p) => p.id === selectedPinId) || activeSheet.pins[0];

  const inProgressTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const activeProjects = MOCK_PROJECTS.filter((p) => p.status === 'active');
  const pendingClearances = requests.filter(
    (r) => r.type !== 'submit_complaint' && r.status === 'pending'
  );

  const displayName = user?.name ? user.name.split(' ')[0] : 'Architect';

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    updateTaskStatus(taskId, nextStatus);
  };

  const handleRedlineInSketch = (sheet: SchematicSheet) => {
    try {
      localStorage.setItem('arkipelago_pending_sketch_bg', sheet.previewUrl);
      localStorage.setItem(
        'arkipelago_pending_sketch_title',
        `[${sheet.sheetNo}] ${sheet.title}`
      );
    } catch {
      // ignore
    }
    router.push('/sketch');
  };

  const handleToggleClock = () => {
    if (isClocked) {
      clockOut();
    } else {
      clockIn(activeTimerProject);
    }
  };

  const handleBroadcastPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallInput.trim() || !user) return;
    setIsBroadcasting(true);
    try {
      await addPost(wallInput.trim(), user);
      setWallInput('');
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-4 font-mono pb-20 text-text-main">
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* 1. ATELIER HERO HORIZON & TELEMETRY */}
      <section className="animate-fade-in-up border-b border-border-main/60 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Logo size={36} />
              <div className="h-4 w-px bg-border-main" />
              <span className="text-[11px] font-semibold text-muted-main uppercase tracking-widest">
                Estudio Arkipelago Atelier
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                Studio Live
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-text-main">
                Mabuhay, {displayName}.
              </h1>
              <p className="text-xs sm:text-sm text-muted-main mt-0.5 leading-relaxed font-sans">
                Real-time architectural command center. Review live drawing sets, log project time, and monitor commissions.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-border-main bg-surface-main text-xs text-muted-main">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              <span>{activeProjects.length} Active Commissions</span>
            </div>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-2 shadow-2xs hover:opacity-90 hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Initialize Task</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRIMARY ATELIER INSTRUMENTS (Interactive Blueprint Viewport + Live Time Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: Interactive Blueprint & Schematic Markup Station (8 Cols) */}
        <section className="lg:col-span-8 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
            {/* Architectural Grid Watermark */}
            <div className="absolute inset-0 bg-architectural-grid opacity-60 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header with Drawing Set Selector Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-hover border border-border-main text-accent-cyan uppercase tracking-wider">
                      Interactive Drafting Table
                    </span>
                    <span className="text-[10px] text-muted-main">
                      {activeSheet.scale}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-text-main">
                    {activeSheet.title}
                  </h2>
                </div>

                {/* Drawing Sheet Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {SCHEMATIC_SHEETS.map((sheet, idx) => (
                    <button
                      key={sheet.id}
                      onClick={() => {
                        setActiveSheetIndex(idx);
                        setSelectedPinId(sheet.pins[0]?.id || null);
                      }}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activeSheetIndex === idx
                          ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                          : 'bg-surface-hover/60 hover:bg-surface-hover text-muted-main border border-border-main/40'
                      )}
                    >
                      {sheet.sheetNo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blueprint Viewport with Live Interactive Redline Pins */}
              <div className="relative rounded-xl overflow-hidden border border-border-main bg-black/5 dark:bg-black/40 aspect-video select-none group/canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSheet.previewUrl}
                  alt={activeSheet.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/canvas:scale-[1.02] filter contrast-[1.05]"
                />

                {/* Blueprint Coordinate Overlay */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold flex items-center gap-2 border border-white/10">
                  <Layers className="w-3 h-3 text-accent-cyan" />
                  <span>{activeSheet.projectCode} • {activeSheet.sheetNo}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400">{activeSheet.revision}</span>
                </div>

                {/* Interactive Redline Pins */}
                {activeSheet.pins.map((pin) => {
                  const isSelected = selectedPin?.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedPinId(pin.id)}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className={cn(
                        'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 z-20 group/pin',
                        isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                      )}
                      title={pin.title}
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
                        <span
                          className={cn(
                            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                            pin.type === 'structural'
                              ? 'bg-rose-400'
                              : pin.type === 'facade'
                              ? 'bg-accent-cyan'
                              : 'bg-amber-400'
                          )}
                        />
                        <span
                          className={cn(
                            'relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[9px] font-bold text-white shadow-md border border-white/60',
                            pin.type === 'structural'
                              ? 'bg-rose-600'
                              : pin.type === 'facade'
                              ? 'bg-sky-600'
                              : 'bg-amber-600'
                          )}
                        >
                          <MapPin className="w-3 h-3" />
                        </span>
                      </span>

                      {/* Tooltip Tag */}
                      <span
                        className={cn(
                          'absolute left-1/2 -translate-x-1/2 -bottom-5 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-tighter whitespace-nowrap shadow-xs transition-opacity',
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black opacity-100'
                            : 'bg-black/75 text-white opacity-0 group-hover/pin:opacity-100'
                        )}
                      >
                        {pin.tag}
                      </span>
                    </button>
                  );
                })}

                {/* Bottom Viewport Action Bar */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handleRedlineInSketch(activeSheet)}
                    className="px-3.5 py-1.5 rounded-lg bg-black/90 hover:bg-black text-white dark:bg-white/90 dark:hover:bg-white dark:text-black text-xs font-semibold backdrop-blur-md shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Open in Sketch & Redline Canvas</span>
                    <Maximize2 className="w-3 h-3 text-muted-main" />
                  </button>
                </div>
              </div>

              {/* Pin Inspection Strip (Interactive details for selected coordinate) */}
              {selectedPin && (
                <div className="p-3.5 rounded-xl border border-border-main/80 bg-surface-hover/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-md bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center shrink-0 text-accent-cyan">
                      <Info className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-main font-mono">
                          [{selectedPin.tag}] {selectedPin.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded border border-border-main bg-surface-main text-muted-main">
                          {selectedPin.type}
                        </span>
                      </div>
                      <p className="text-muted-main font-sans text-xs leading-relaxed">
                        {selectedPin.note}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedlineInSketch(activeSheet)}
                    className="px-3 py-1.5 rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan text-[11px] font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    <span>Annotate Note</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT: Live Studio Time Engine & Session Logger (4 Cols) */}
        <section className="lg:col-span-4 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-5">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-cyan" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text-main">
                    Studio Time Engine
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isClocked ? 'bg-emerald-500 animate-pulse' : 'bg-muted-main/40'
                    )}
                  />
                  <span className="text-[11px] font-mono text-muted-main">
                    {isClocked ? 'RECORDING' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Chronometer Digital Display */}
              <div className="p-4 rounded-xl border border-border-main bg-surface-hover/40 text-center space-y-1 relative overflow-hidden">
                <span className="text-[10px] text-muted-main uppercase tracking-widest font-semibold block">
                  {isClocked ? 'Elapsed Session Duration' : 'Ready to Track'}
                </span>
                <div
                  className={cn(
                    'text-3xl sm:text-4xl font-mono font-bold tracking-tight py-1 transition-colors',
                    isClocked ? 'text-accent-cyan' : 'text-text-main'
                  )}
                >
                  {isClocked ? elapsedTime : '00:00:00'}
                </div>
                <div className="text-[11px] text-muted-main font-sans">
                  {isClocked
                    ? `Active on ${MOCK_PROJECTS.find((p) => p.id === activeTimerProject)?.name || 'Project'}`
                    : 'Select commission to clock in'}
                </div>
              </div>

              {/* Commission Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-main font-semibold block">
                  Billable Commission:
                </label>
                <select
                  disabled={isClocked}
                  value={activeTimerProject}
                  onChange={(e) => {
                    setActiveTimerProject(e.target.value);
                    if (setSelectedProjectId) {
                      setSelectedProjectId(e.target.value);
                    }
                  }}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border border-border-main bg-surface-main text-xs font-mono text-text-main focus:ring-1 focus:ring-accent-cyan transition-colors',
                    isClocked && 'opacity-70 cursor-not-allowed bg-surface-hover/40'
                  )}
                >
                  {MOCK_PROJECTS.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      [{proj.code}] {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Big Tactile Clock In / Clock Out Button */}
              <button
                onClick={handleToggleClock}
                className={cn(
                  'w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer',
                  isClocked
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse-glow'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01]'
                )}
              >
                {isClocked ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Clock Out & Log Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Clock In to Commission</span>
                  </>
                )}
              </button>
            </div>

            {/* Today's Telemetry & Logged Sessions Preview */}
            <div className="pt-3 border-t border-border-main/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-main">Sessions Today:</span>
                <span className="font-bold text-text-main font-mono">
                  {todayEntries.length} logged
                </span>
              </div>

              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {todayEntries.length > 0 ? (
                  todayEntries.slice(0, 2).map((entry) => (
                    <div
                      key={entry.id}
                      className="px-2.5 py-1.5 rounded-lg border border-border-main/50 bg-surface-hover/30 flex items-center justify-between text-[11px]"
                    >
                      <span className="text-text-main truncate max-w-[140px]">
                        {entry.projectName}
                      </span>
                      <span className="font-mono font-semibold text-accent-cyan">
                        {entry.durationFormatted || 'Logged'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-muted-main text-center py-2 font-sans">
                    No time entries submitted today.
                  </p>
                )}
              </div>

              <Link
                href="/hr"
                className="text-[11px] text-accent-cyan hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <span>View Full Timesheet Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 3. ACTIVE COMMISSIONS VISUAL BENTO GALLERY */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-text-main">
              Active Studio Commissions
            </h2>
            <p className="text-xs text-muted-main font-sans">
              Real-time architectural milestones and physical construction progress.
            </p>
          </div>

          <Link
            href="/projects"
            className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
          >
            <span>Explore All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeProjects.map((p, idx) => {
            const projectProgress = idx === 0 ? 65 : idx === 1 ? 40 : 80;
            const projectPhase = idx === 0 ? 'Design Dev' : idx === 1 ? 'Schematic' : 'Permits';
            const projectImg =
              idx === 0
                ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80'
                : idx === 1
                ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80'
                : 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&q=80';

            return (
              <Link
                key={p.id}
                href="/projects"
                className="rounded-2xl border border-border-main/70 bg-surface-main overflow-hidden flex flex-col justify-between hover:border-text-main/80 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
              >
                {/* Visual Imagery Banner */}
                <div className="aspect-16/9 relative overflow-hidden bg-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={projectImg}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                    {p.code}
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[9px] font-bold uppercase tracking-wider">
                    {p.status}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-main font-sans line-clamp-1">
                      {p.clientName}
                    </p>
                  </div>

                  {/* Milestone Progression Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-border-main/40">
                    <div className="flex justify-between text-[11px] text-muted-main font-mono">
                      <span>Phase: {projectPhase}</span>
                      <span className="font-bold text-text-main">{projectProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-border-main/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-text-main rounded-full transition-all duration-500"
                        style={{ width: `${projectProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. WORKSPACE DELIVERABLES & STUDIO WALL LIVE DISPATCH (Dual Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Priority Deliverables & Interactive Task Board (7 Cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold font-serif text-text-main">
                  Priority Deliverables & Punch List
                </h2>
                <span className="text-[11px] text-muted-main">
                  {inProgressTasks.length} in flight • {completedTasks.length} signed off
                </span>
              </div>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-border-main bg-surface-hover/60 hover:bg-surface-hover text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Interactive Checklist */}
            <div className="space-y-2.5">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTaskStatus(task.id, task.status)}
                    className="p-3.5 rounded-xl border border-border-main/70 bg-surface-hover/30 hover:bg-surface-hover transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button className="mt-0.5 text-muted-main group-hover:text-emerald-500 transition-colors">
                        <Circle className="w-4 h-4 text-muted-main" />
                      </button>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                          {task.name}
                        </p>
                        {task.description && (
                          <p className="text-[11px] text-muted-main line-clamp-1 font-sans">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-muted-main font-mono pt-0.5">
                          <span>{task.projectPhase}</span>
                          <span>•</span>
                          <span>{task.assignedMember}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className={cn(
                          'text-[9px] font-bold px-2 py-0.5 rounded border uppercase',
                          task.priority === 'HIGH'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-surface-hover border-border-main text-muted-main'
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1.5 border border-dashed border-border-main rounded-xl">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-text-main">
                    All assigned deliverables completed!
                  </p>
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="pt-2 text-[11px] text-muted-main flex items-center justify-between">
                <span>✓ {completedTasks.length} deliverable(s) finished today</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Ahead of schedule
                </span>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Studio Wall Micro-Composer & Live Feed (5 Cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
                <h2 className="text-sm sm:text-base font-bold font-serif text-text-main">
                  Studio Pulse & Field Dispatches
                </h2>
                <Link
                  href="/chat"
                  className="text-xs text-accent-cyan hover:underline flex items-center gap-0.5"
                >
                  <span>Open Comms</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Fast Inline Wall Composer */}
              <form onSubmit={handleBroadcastPost} className="relative">
                <input
                  type="text"
                  value={wallInput}
                  onChange={(e) => setWallInput(e.target.value)}
                  placeholder="Post site note, drawing revision, or broadcast..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border-main bg-surface-hover/30 text-xs text-text-main placeholder:text-muted-main/70 focus:outline-none focus:border-accent-cyan transition-colors"
                />
                <button
                  type="submit"
                  disabled={!wallInput.trim() || isBroadcasting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>

              {/* Recent Dispatches Stream */}
              <div className="space-y-2.5 pt-1">
                {posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href="/chat"
                    className="block p-3 rounded-xl border border-border-main/60 bg-surface-hover/20 hover:bg-surface-hover/50 transition-colors space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-main font-mono group-hover:text-accent-cyan transition-colors">
                        {post.authorName}
                      </span>
                      <span className="text-[10px] text-muted-main">
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-main font-sans line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Submittal Alert if pending clearance */}
            {pendingClearances.length > 0 && (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs mt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-text-main text-[11px]">
                    <strong>{pendingClearances.length} submittals</strong> awaiting stamp.
                  </span>
                </div>
                <Link
                  href="/hr"
                  className="text-amber-700 dark:text-amber-400 font-semibold hover:underline text-[11px]"
                >
                  Audit →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 5. STUDIO DOCK & SECONDARY HUBS */}
      <section className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/calendar"
            className="p-4 rounded-xl border border-border-main/70 bg-surface-main hover:border-text-main transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-accent-cyan">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                  Site Survey Calendar
                </h3>
                <p className="text-[10px] text-muted-main">Client walkthroughs & inspections</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/directory"
            className="p-4 rounded-xl border border-border-main/70 bg-surface-main hover:border-text-main transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-emerald-500">
                <BookUser className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                  Specialty Consultants
                </h3>
                <p className="text-[10px] text-muted-main">Structural, MEP & suppliers</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/hr"
            className="p-4 rounded-xl border border-border-main/70 bg-surface-main hover:border-text-main transition-all flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-amber-500">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                  Human Resources & Ledger
                </h3>
                <p className="text-[10px] text-muted-main">Timesheet clearances & submittals</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
