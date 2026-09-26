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
  ArrowLeft,
  PenTool,
  MessageSquare,
  Calendar,
  Clock,
  ChevronRight,
  BookUser,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StudioStep = 'focus' | 'schematics' | 'projects' | 'comms';

const STUDIO_STEPS: { id: StudioStep; number: string; title: string; subtitle: string }[] = [
  { id: 'focus', number: '01', title: 'Focus & Deliverables', subtitle: 'Priority tasks & daily actions' },
  { id: 'schematics', number: '02', title: 'Schematics & Redlines', subtitle: 'Drawings, blueprints & markups' },
  { id: 'projects', number: '03', title: 'Active Projects', subtitle: 'Studio pipeline & milestones' },
  { id: 'comms', number: '04', title: 'Studio Pulse & Comms', subtitle: 'Discussions & operational ledger' },
];

const FEATURED_SHEETS = [
  {
    id: 'dwg-1',
    sheetNo: 'A-101',
    title: 'Ground Floor Plan & Massing',
    project: 'Makati Tower Phase 2',
    projectCode: 'MT-2024',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    revision: 'Rev 02 - For Approval',
  },
  {
    id: 'dwg-2',
    sheetNo: 'MAT-01',
    title: 'Italian Carrara Marble & Timber Spec',
    project: 'Casa Verde Residence',
    projectCode: 'CV-2024',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
    revision: 'Rev 01 - Sample Approved',
  },
  {
    id: 'dwg-3',
    sheetNo: 'S-101',
    title: 'Foundation Soil & Beam Framing',
    project: 'BGC Cultural Pavilion',
    projectCode: 'BCP-2024',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
    revision: 'Rev 01 - Site Test',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const { requests } = useHRRequests();
  const { posts } = useWallPosts();
  const { isClocked, elapsedTime, todayEntries } = useClockIn();

  const [activeStep, setActiveStep] = useState<StudioStep>('focus');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const displayName = user?.name || 'Architect';

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    updateTaskStatus(taskId, nextStatus);
  };

  const handleRedlineInSketch = (sheet: typeof FEATURED_SHEETS[0]) => {
    try {
      localStorage.setItem('arkipelago_pending_sketch_bg', sheet.previewUrl);
      localStorage.setItem('arkipelago_pending_sketch_title', `[${sheet.sheetNo}] ${sheet.title}`);
    } catch {
      // ignore
    }
    router.push('/sketch');
  };

  const activeProjects = MOCK_PROJECTS.filter((p) => p.status === 'active');
  const pendingClearances = requests.filter((r) => r.type !== 'submit_complaint' && r.status === 'pending');
  const activeGrievances = requests.filter(
    (r) => r.type === 'submit_complaint' && r.complaintStatus !== 'resolved' && r.complaintStatus !== 'dismissed'
  );

  const inProgressTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  // Step Navigation Helper
  const currentStepIndex = STUDIO_STEPS.findIndex((s) => s.id === activeStep);
  const nextStep = () => {
    if (currentStepIndex < STUDIO_STEPS.length - 1) {
      setActiveStep(STUDIO_STEPS[currentStepIndex + 1].id);
    } else {
      setActiveStep(STUDIO_STEPS[0].id);
    }
  };
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setActiveStep(STUDIO_STEPS[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6 font-mono pb-24 text-text-main transition-colors">
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* 1. THE STUDIO HORIZON (Minimalist Editorial Hero) */}
      <section className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border-main/50 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Logo size={42} />
              <div className="h-4 w-px bg-border-main" />
              <span className="text-[11px] font-semibold text-muted-main uppercase tracking-widest">
                Estudio Arkipelago Atelier
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-text-main">
                Welcome back, {displayName}.
              </h1>
              <p className="text-xs sm:text-sm text-muted-main mt-1 leading-relaxed">
                Here is your curated studio sequence for today. Select a stage or walk step-by-step.
              </p>
            </div>
          </div>

          {/* Quiet Monospace Telemetry Strip */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-main bg-surface-main text-xs text-muted-main shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-text-main">
                {isClocked ? `Tracking: ${elapsedTime}` : `${todayEntries.length} Sessions Logged`}
              </span>
            </div>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-1.5 shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initialize Task</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. THE ATELIER STEPPER BAR (Taste Skill Step-by-Step Architecture) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-main tracking-wider uppercase">
            Studio Progression Sequence
          </span>
          <span className="text-xs font-mono text-muted-main">
            Step {STUDIO_STEPS[currentStepIndex].number} of 04
          </span>
        </div>

        {/* Tactile Horizontal Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {STUDIO_STEPS.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  'p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-24',
                  isActive
                    ? 'bg-surface-main border-text-main shadow-xs'
                    : 'bg-surface-hover/40 border-border-main/60 hover:bg-surface-hover text-muted-main hover:text-text-main'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      'text-xs font-bold font-mono',
                      isActive ? 'text-accent-cyan' : 'text-muted-main'
                    )}
                  >
                    {step.number}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                  )}
                </div>

                <div>
                  <h2 className="text-xs font-bold text-text-main leading-tight">
                    {step.title}
                  </h2>
                  <p className="text-[10px] text-muted-main truncate mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. STEP CONTENT WORKSPACE (Curated, Uncluttered Stage Focus) */}
      <section className="min-h-[380px] bg-surface-main border border-border-main rounded-2xl p-6 sm:p-8 shadow-xs relative">
        {/* STAGE 01: FOCUS & DELIVERABLES */}
        {activeStep === 'focus' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/50 pb-4">
              <div>
                <span className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wider block">
                  Stage 01 — Architectural Deliverables
                </span>
                <h3 className="text-lg font-serif font-bold text-text-main mt-0.5">
                  Priority Tasks Due & Active Review
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-main">
                  {inProgressTasks.length} pending • {completedTasks.length} completed
                </span>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Task</span>
                </button>
              </div>
            </div>

            {/* Curated Task List */}
            <div className="space-y-2.5">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTaskStatus(task.id, task.status)}
                    className="p-4 rounded-xl border border-border-main/60 bg-surface-hover/40 hover:bg-surface-hover transition-colors flex items-start justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button className="mt-0.5 text-muted-main group-hover:text-text-main transition-colors">
                        <Circle className="w-4 h-4 text-muted-main" />
                      </button>
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-bold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                          {task.name}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-main line-clamp-1 font-sans">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-muted-main font-mono pt-0.5">
                          <span>Phase: {task.projectPhase}</span>
                          <span>•</span>
                          <span>Assigned: {task.assignedMember}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded border',
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
                <div className="py-12 text-center space-y-2 border border-dashed border-border-main rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-text-main">All priority deliverables completed.</p>
                  <p className="text-[11px] text-muted-main">Initialize a new task or advance to the drawing board.</p>
                </div>
              )}
            </div>

            {/* Completed Drawer Preview */}
            {completedTasks.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-muted-main">
                  ✓ {completedTasks.length} task(s) completed today
                </span>
              </div>
            )}
          </div>
        )}

        {/* STAGE 02: SCHEMATICS & REDLINES */}
        {activeStep === 'schematics' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/50 pb-4">
              <div>
                <span className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wider block">
                  Stage 02 — Drafting & Visual Markups
                </span>
                <h3 className="text-lg font-serif font-bold text-text-main mt-0.5">
                  Current Schematics & Drawing Sets
                </h3>
              </div>

              <Link
                href="/sketch"
                className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Open Sketch Studio</span>
              </Link>
            </div>

            {/* Featured Drawing Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEATURED_SHEETS.map((sheet) => (
                <div
                  key={sheet.id}
                  className="rounded-xl border border-border-main/70 bg-surface-hover/30 overflow-hidden flex flex-col justify-between hover:border-text-main transition-all group"
                >
                  <div className="aspect-video bg-white overflow-hidden relative border-b border-border-main/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sheet.previewUrl}
                      alt={sheet.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-102"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[9px] font-bold">
                      {sheet.sheetNo}
                    </div>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-muted-main uppercase font-semibold">
                        {sheet.projectCode} • {sheet.project}
                      </span>
                      <h4 className="text-xs font-bold text-text-main mt-0.5 line-clamp-1">
                        {sheet.title}
                      </h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                        {sheet.revision}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRedlineInSketch(sheet)}
                      className="w-full mt-2 py-2 rounded-lg border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Redline in Sketch</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 03: ACTIVE PROJECTS */}
        {activeStep === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/50 pb-4">
              <div>
                <span className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wider block">
                  Stage 03 — Architecture Pipeline
                </span>
                <h3 className="text-lg font-serif font-bold text-text-main mt-0.5">
                  Active Projects & Construction Milestones
                </h3>
              </div>

              <Link
                href="/projects"
                className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Clean Architectural Bento List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeProjects.map((p, idx) => (
                <Link
                  key={p.id}
                  href="/projects"
                  className="p-5 rounded-xl border border-border-main/70 bg-surface-hover/30 hover:border-text-main hover:bg-surface-hover/50 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-hover border border-border-main text-text-main">
                        {p.code}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-xs text-muted-main font-sans">{p.clientName}</p>
                  </div>

                  {/* Architectural Milestone Pill */}
                  <div className="pt-3 border-t border-border-main/40 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-main font-mono">
                      <span>Phase: {idx === 0 ? 'Design Dev' : idx === 1 ? 'Schematic' : 'Permits'}</span>
                      <span>{idx === 0 ? '65%' : idx === 1 ? '40%' : '80%'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-border-main/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-text-main rounded-full"
                        style={{ width: idx === 0 ? '65%' : idx === 1 ? '40%' : '80%' }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 04: STUDIO PULSE & COMMS */}
        {activeStep === 'comms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-main/50 pb-4">
              <div>
                <span className="text-[10px] font-semibold text-accent-cyan uppercase tracking-wider block">
                  Stage 04 — Team Discourse & Ledger
                </span>
                <h3 className="text-lg font-serif font-bold text-text-main mt-0.5">
                  Studio Wall & Operational Clearances
                </h3>
              </div>

              <Link
                href="/chat"
                className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Chat & Threads</span>
              </Link>
            </div>

            {/* Operational Warning Alert if pending items */}
            {(pendingClearances.length > 0 || activeGrievances.length > 0) && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-text-main">
                    <strong className="font-semibold">{pendingClearances.length} submittals</strong> awaiting management audit.
                  </span>
                </div>
                <Link
                  href="/hr"
                  className="text-amber-700 dark:text-amber-400 font-semibold hover:underline shrink-0"
                >
                  Open Ledger →
                </Link>
              </div>
            )}

            {/* Recent Wall Posts Stream */}
            <div className="space-y-3">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href="/chat"
                  className="block p-4 rounded-xl border border-border-main/60 bg-surface-hover/30 hover:bg-surface-hover transition-colors space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                      {post.authorName}
                    </span>
                    <span className="text-[10px] text-muted-main">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-main font-sans line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stepper Navigation Footer (Step-by-Step Flow Controls) */}
        <div className="mt-8 pt-5 border-t border-border-main/50 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={cn(
              'px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer',
              currentStepIndex === 0
                ? 'opacity-30 cursor-not-allowed text-muted-main'
                : 'hover:bg-surface-hover text-text-main'
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Stage</span>
          </button>

          <button
            onClick={nextStep}
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-2xs cursor-pointer"
          >
            <span>
              {currentStepIndex < STUDIO_STEPS.length - 1
                ? `Next: ${STUDIO_STEPS[currentStepIndex + 1].title}`
                : 'Return to Focus 01'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4. PROGRESSIVE UTILITY DOCK (Quiet Secondary Atelier Access) */}
      <section className="space-y-4 pt-4">
        <span className="text-xs font-semibold text-muted-main tracking-wider uppercase">
          Studio Portals & Quick References
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/calendar"
            className="p-4 rounded-xl border border-border-main/70 bg-surface-main hover:border-text-main transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-accent-cyan">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                  Studio Calendar
                </h4>
                <p className="text-[10px] text-muted-main">Site surveys & deadlines</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/directory"
            className="p-4 rounded-xl border border-border-main/70 bg-surface-main hover:border-text-main transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-emerald-500">
                <BookUser className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                  Specialty Directory
                </h4>
                <p className="text-[10px] text-muted-main">Engineers, suppliers, consultants</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/hr"
            className="p-4 rounded-xl border border-border-main/70 bg-surface-main hover:border-text-main transition-colors flex items-center justify-between group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-amber-500">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                  Human Resources
                </h4>
                <p className="text-[10px] text-muted-main">Timesheets, submittals & ledger</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
