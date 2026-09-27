'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';
import { useHRRequests } from '@/lib/hooks/useHRRequests';
import { useWallPosts } from '@/lib/hooks/useWallPosts';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { MOCK_PROJECTS } from '@/lib/constants';
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
  ChevronRight,
  MapPin,
  Info,
  Check,
  MessageSquare,
  Heart,
  MessageCircle,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Share2,
  CornerDownRight
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
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    scale: '1:100 @ A1',
    revision: 'Rev 02 • Approved',
    pins: [
      {
        id: 'pin-1',
        x: 34,
        y: 42,
        tag: 'STR-01',
        title: 'Cantilever Reinforcement',
        note: 'Reinforce rebar ties ASTM A615 Grade 60 at shear wall intersection.',
        type: 'structural',
      },
      {
        id: 'pin-2',
        x: 68,
        y: 32,
        tag: 'FAC-04',
        title: 'Curtain Wall Mullion',
        note: 'Double-glazed thermal break unit; verify expansion joints on south facade.',
        type: 'facade',
      },
      {
        id: 'pin-3',
        x: 52,
        y: 68,
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
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
    scale: 'NTS • Spec',
    revision: 'Rev 01 • Approved',
    pins: [
      {
        id: 'pin-4',
        x: 36,
        y: 38,
        tag: 'MAT-A',
        title: 'Honed Carrara Slab',
        note: '20mm bookmatched honed Carrara marble with breathable penetrating sealant.',
        type: 'facade',
      },
      {
        id: 'pin-5',
        x: 74,
        y: 56,
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
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=1200&q=80',
    scale: '1:50 @ A0',
    revision: 'Rev 03 • Approved',
    pins: [
      {
        id: 'pin-6',
        x: 34,
        y: 48,
        tag: 'COL-A1',
        title: 'Tree Column Node',
        note: 'Custom cast steel branch node; ultrasound weld inspection required.',
        type: 'structural',
      },
      {
        id: 'pin-7',
        x: 72,
        y: 46,
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
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const isPartner = user?.role === 'partner';
  const isSenior = user?.role === 'senior_architect';
  const isContractor = user?.role === 'contractor';
  const assignedCodes = user?.assignedProjectCodes;
  const userId = user?.id;
  const userName = user?.name;
  const canReviewRequests = isPartner || isSenior;

  const availableProjects = useMemo(() => {
    if (isContractor && assignedCodes) {
      return MOCK_PROJECTS.filter((p) => assignedCodes.includes(p.code));
    }
    return MOCK_PROJECTS;
  }, [isContractor, assignedCodes]);

  const [activeTimerProject, setActiveTimerProject] = useState<string>(() => {
    return selectedProjectId || (isContractor && assignedCodes
      ? MOCK_PROJECTS.find(p => assignedCodes.includes(p.code))?.id || '1'
      : MOCK_PROJECTS[0]?.id || '1');
  });

  const effectiveTimerProject = availableProjects.some((p) => p.id === activeTimerProject)
    ? activeTimerProject
    : (availableProjects[0]?.id || '1');

  const activeSheet = SCHEMATIC_SHEETS[activeSheetIndex];
  const selectedPin =
    activeSheet.pins.find((p) => p.id === selectedPinId) || activeSheet.pins[0];

  const inProgressTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const activeProjects = availableProjects.filter((p) => p.status === 'active');

  // Role-aware clearance separation
  const pendingReviewRequests = useMemo(() => {
    if (!canReviewRequests) return [];
    return requests.filter(
      (r) => r.type !== 'submit_complaint' && r.status === 'pending' && r.userId !== userId
    );
  }, [canReviewRequests, requests, userId]);

  const myPendingRequests = useMemo(() => {
    if (canReviewRequests || isContractor) return [];
    return requests.filter(
      (r) =>
        r.type !== 'submit_complaint' &&
        r.status === 'pending' &&
        (r.userId === userId || (userName && r.userName?.toLowerCase() === userName.toLowerCase()))
    );
  }, [canReviewRequests, isContractor, requests, userId, userName]);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Architect';

  const [taskToConfirm, setTaskToConfirm] = useState<{
    task: (typeof tasks)[0];
    action: 'complete' | 'reopen';
  } | null>(null);

  const [toastNotice, setToastNotice] = useState<{
    message: string;
    undoTask?: (typeof tasks)[0];
    undoAction?: 'complete' | 'reopen';
  } | null>(null);

  const {
    posts: wallPosts,
    addPost: addWallPost,
    editPost: editWallPost,
    deletePost: deleteWallPost,
    toggleLike: toggleWallLike,
    addComment: addWallComment,
    deleteComment: deleteWallComment,
  } = useWallPosts();

  const [quickWallContent, setQuickWallContent] = useState('');
  const [quickWallPosting, setQuickWallPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [postMenuOpenId, setPostMenuOpenId] = useState<string | null>(null);
  const [openCommentPostIds, setOpenCommentPostIds] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handleQuickPostToWall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWallContent.trim()) return;
    setQuickWallPosting(true);
    const authorUser = user || {
      id: 'usr-default',
      name: 'Studio Architect',
      email: 'architect@arkipelago.studio',
      role: 'senior_architect',
      department: 'Architecture & Design',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    };
    await addWallPost(quickWallContent.trim(), authorUser);
    setQuickWallContent('');
    setQuickWallPosting(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && taskToConfirm) {
        setTaskToConfirm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskToConfirm]);

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
    setToastNotice({
      message: `Task "${newTaskData.name}" created successfully!`,
    });
    setTimeout(() => {
      setToastNotice(null);
    }, 4000);
  };

  const handleInitiateTaskToggle = (task: (typeof tasks)[0]) => {
    if (task.status !== 'COMPLETED') {
      setTaskToConfirm({ task, action: 'complete' });
    } else {
      setTaskToConfirm({ task, action: 'reopen' });
    }
  };

  const handleConfirmTaskToggle = () => {
    if (!taskToConfirm) return;
    const { task, action } = taskToConfirm;
    const nextStatus = action === 'complete' ? 'COMPLETED' : 'IN_PROGRESS';
    updateTaskStatus(task.id, nextStatus);

    setToastNotice({
      message: action === 'complete'
        ? `Task "${task.name}" marked as completed!`
        : `Task "${task.name}" reopened to active list.`,
      undoTask: task,
      undoAction: action,
    });
    setTaskToConfirm(null);

    setTimeout(() => {
      setToastNotice((prev) => (prev?.undoTask?.id === task.id ? null : prev));
    }, 5000);
  };

  const handleUndoTaskToggle = () => {
    if (!toastNotice?.undoTask) return;
    const originalStatus = toastNotice.undoAction === 'complete' ? 'IN_PROGRESS' : 'COMPLETED';
    updateTaskStatus(toastNotice.undoTask.id, originalStatus);
    setToastNotice(null);
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
      clockIn(effectiveTimerProject);
    }
  };

  const handleBroadcastPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallInput.trim() || !user) return;
    setIsBroadcasting(true);
    try {
      await addPost(wallInput.trim(), user);
      setWallInput('');
      setBroadcastSuccess(true);
      setTimeout(() => setBroadcastSuccess(false), 2000);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 py-2 font-sans pb-20 text-text-main">
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* 1. HERO HORIZON */}
      <section className="animate-fade-in-up border-b border-border-main/60 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif tracking-tight text-text-main">
            Mabuhay, {displayName}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-main font-sans">
            Studio overview for today.
          </p>
        </div>
      </section>

      {/* 2. PRIMARY INSTRUMENTS (Drafting Board + Time Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT / CENTER: Drafting Board (8 Cols) */}
        <section className="lg:col-span-8 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden group">
            {/* Subtle Grid Watermark */}
            <div className="absolute inset-0 bg-architectural-grid opacity-50 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Header with Drawing Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-hover border border-border-main text-accent-cyan uppercase tracking-wider">
                      Drawings
                    </span>
                    <span className="text-[10px] text-muted-main">
                      {activeSheet.scale}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-text-main">
                    {activeSheet.title}
                  </h2>
                </div>

                {/* Sheet Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {SCHEMATIC_SHEETS.map((sheet, idx) => {
                    const isSelected = activeSheetIndex === idx;
                    return (
                      <button
                        key={sheet.id}
                        onClick={() => {
                          setActiveSheetIndex(idx);
                          setSelectedPinId(sheet.pins[0]?.id || null);
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[32px] flex items-center gap-1.5 border',
                          isSelected
                            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-bold'
                            : 'bg-surface-hover/70 hover:bg-surface-hover text-muted-main hover:text-text-main border-border-main'
                        )}
                      >
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                        )}
                        <span>{sheet.sheetNo}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Viewport with Pins */}
              <div className="relative rounded-xl overflow-hidden border border-border-main bg-black/5 dark:bg-black/40 aspect-video select-none group/canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSheet.previewUrl}
                  alt={activeSheet.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/canvas:scale-[1.02] filter contrast-[1.05]"
                />

                {/* Coordinate Overlay */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold flex items-center gap-2 border border-white/10 shadow-xs">
                  <Layers className="w-3 h-3 text-accent-cyan" />
                  <span>{activeSheet.projectCode} • {activeSheet.sheetNo}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-emerald-400">{activeSheet.revision}</span>
                </div>

                {/* Pins */}
                {activeSheet.pins.map((pin) => {
                  const isSelected = selectedPin?.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedPinId(pin.id)}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      className={cn(
                        'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 z-20 group/pin p-2 after:absolute after:-inset-2',
                        isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                      )}
                      title={pin.title}
                      aria-label={`${pin.tag}: ${pin.title}`}
                    >
                      <span className="relative flex h-6 w-6 items-center justify-center">
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

                {/* Pin Inspection Strip */}
                {selectedPin && (
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl border border-border-main/80 bg-surface-main/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
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
                      className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-[11px] font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <PenTool className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Open in Sketch</span>
                      <ArrowRight className="w-3 h-3 text-muted-main" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Estudio Wall & Posting Preview (4 Cols) */}
        <section className="lg:col-span-4 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent-cyan" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-text-main font-mono">
                    Estudio Wall
                  </h2>
                </div>
                <Link
                  href="/chat?tab=wall"
                  className="text-[11px] font-mono font-semibold text-accent-cyan hover:underline flex items-center gap-1"
                >
                  <span>Open Wall ↗</span>
                </Link>
              </div>

              {/* Quick Posting Composer */}
              <form onSubmit={handleQuickPostToWall} className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={quickWallContent}
                    onChange={(e) => setQuickWallContent(e.target.value)}
                    placeholder="Share site progress, memo, or note to studio wall..."
                    className="w-full bg-surface-hover/70 border border-border-main rounded-xl p-3 text-xs font-sans text-text-main placeholder:text-muted-main focus:outline-none focus:border-text-main resize-none transition-colors"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-main font-mono">
                    Posting as {displayName}
                  </span>
                  <button
                    type="submit"
                    disabled={!quickWallContent.trim() || quickWallPosting}
                    className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <Send className="w-3 h-3" />
                    <span>{quickWallPosting ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </form>

              {/* Recent Wall Activity Stream / Preview */}
              <div className="space-y-2 pt-2 border-t border-border-main/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-muted-main uppercase tracking-wider font-mono">
                    Recent Studio Activity
                  </span>
                  <span className="text-[10px] font-mono text-muted-main">
                    {wallPosts.length} posts
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {wallPosts.slice(0, 3).map((post) => {
                    const isAuthor = user?.id === post.authorId || user?.name === post.authorName;
                    const canManage = isAuthor || user?.role === 'partner';
                    const isLiked = user?.id ? post.likedBy?.includes(user.id) : false;
                    const likeCount = post.likes ?? (post.likedBy?.length || 0);
                    const comments = post.comments || [];
                    const isCommentsOpen = !!openCommentPostIds[post.id];
                    const isEditing = editingPostId === post.id;
                    const isMenuOpen = postMenuOpenId === post.id;

                    return (
                      <div
                        key={post.id}
                        className="p-3.5 rounded-xl border border-border-main/60 bg-surface-hover/30 space-y-2.5 transition-colors hover:border-border-main relative"
                      >
                        {/* Post Author Bar & Menu */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-6 h-6 rounded-full bg-surface-hover border border-border-main flex items-center justify-center font-bold text-[9px] text-text-main shrink-0">
                              {post.authorName.charAt(0)}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-text-main truncate text-xs">
                                {post.authorName}
                              </span>
                              <span className="text-[9px] text-muted-main font-mono capitalize">
                                {post.authorRole?.replace('_', ' ') || 'Architect'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-muted-main font-mono">
                              {new Date(post.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>

                            {/* 3-Dot Settings & Share Menu */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setPostMenuOpenId(isMenuOpen ? null : post.id)}
                                className="p-1 rounded-md text-muted-main hover:text-text-main hover:bg-surface-hover cursor-pointer transition-colors"
                                title="Post settings & share"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-surface-main border border-border-main rounded-xl shadow-xl py-1 z-30 animate-in fade-in duration-100 text-xs font-sans">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (typeof window !== 'undefined') {
                                        navigator.clipboard.writeText(
                                          `${window.location.origin}/chat?tab=wall&post=${post.id}`
                                        );
                                      }
                                      setToastNotice({ message: '✓ Post link copied to clipboard' });
                                      setPostMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-muted-main" />
                                    <span>Copy Link</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (typeof window !== 'undefined') {
                                        navigator.clipboard.writeText(post.content);
                                      }
                                      setToastNotice({ message: '✓ Post text copied to clipboard' });
                                      setPostMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-1.5 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-muted-main" />
                                    <span>Copy Text</span>
                                  </button>

                                  {canManage && (
                                    <>
                                      <div className="border-t border-border-main my-1" />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPostId(post.id);
                                          setEditingPostContent(post.content);
                                          setPostMenuOpenId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-surface-hover flex items-center gap-2 text-text-main cursor-pointer"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-muted-main" />
                                        <span>Edit Post</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          deleteWallPost(post.id);
                                          setToastNotice({ message: '✓ Post deleted' });
                                          setPostMenuOpenId(null);
                                        }}
                                        className="w-full px-3 py-1.5 text-left hover:bg-red-500/10 flex items-center gap-2 text-red-500 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Delete Post</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Post Content / Inline Edit Form */}
                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              rows={2}
                              value={editingPostContent}
                              onChange={(e) => setEditingPostContent(e.target.value)}
                              className="w-full bg-surface-hover/80 border border-border-main rounded-lg p-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main resize-none"
                            />
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingPostId(null)}
                                className="px-2.5 py-1 rounded-md border border-border-main hover:bg-surface-hover text-[11px] font-semibold text-muted-main cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!editingPostContent.trim()) return;
                                  editWallPost(post.id, editingPostContent.trim());
                                  setEditingPostId(null);
                                  setToastNotice({ message: '✓ Post updated successfully' });
                                }}
                                className="px-3 py-1 rounded-md bg-black text-white dark:bg-white dark:text-black text-[11px] font-semibold hover:opacity-90 cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-text-main/90 font-sans leading-relaxed whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}

                        {post.attachments && post.attachments.length > 0 && (
                          <div className="pt-1">
                            <div className="h-16 w-24 rounded-lg overflow-hidden border border-border-main/50 bg-black/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.attachments[0]}
                                alt="Attachment preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Interactive Action Bar: Like, Reply / Comments, Share */}
                        <div className="flex items-center gap-3 pt-2 border-t border-border-main/40 text-[11px] font-medium text-muted-main">
                          <button
                            type="button"
                            onClick={() => {
                              if (!user) {
                                setToastNotice({ message: 'Please log in to like posts' });
                                return;
                              }
                              toggleWallLike(post.id, user.id);
                            }}
                            className={cn(
                              'flex items-center gap-1 py-0.5 px-2 rounded-md transition-colors cursor-pointer hover:bg-surface-hover',
                              isLiked ? 'text-red-500 font-semibold bg-red-500/10' : 'hover:text-text-main'
                            )}
                            title={isLiked ? 'Unlike' : 'Like'}
                          >
                            <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current text-red-500')} />
                            <span>{likeCount > 0 ? likeCount : 'Like'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOpenCommentPostIds((prev) => ({
                                ...prev,
                                [post.id]: !isCommentsOpen,
                              }));
                            }}
                            className={cn(
                              'flex items-center gap-1 py-0.5 px-2 rounded-md transition-colors cursor-pointer hover:bg-surface-hover',
                              isCommentsOpen ? 'text-text-main font-semibold bg-surface-hover' : 'hover:text-text-main'
                            )}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{comments.length > 0 ? `${comments.length} Replies` : 'Reply'}</span>
                          </button>
                        </div>

                        {/* Comments / Replies Drawer */}
                        {isCommentsOpen && (
                          <div className="pt-2 border-t border-border-main/40 space-y-2 animate-in fade-in duration-100">
                            {comments.length > 0 && (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                                {comments.map((comment) => {
                                  const canDeleteComment =
                                    user?.id === comment.authorId ||
                                    user?.name === comment.authorName ||
                                    user?.role === 'partner';

                                  return (
                                    <div
                                      key={comment.id}
                                      className="flex items-start justify-between gap-2 bg-surface-hover/50 rounded-lg p-2 border border-border-main/40 group text-[11px]"
                                    >
                                      <div className="flex items-start gap-1.5">
                                        <div className="w-4 h-4 rounded-full bg-surface-hover border border-border-main flex items-center justify-center font-bold text-[8px] shrink-0 mt-0.5">
                                          {comment.authorName.charAt(0)}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-text-main">
                                              {comment.authorName}
                                            </span>
                                            <span className="text-[9px] text-muted-main font-mono">
                                              {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                              })}
                                            </span>
                                          </div>
                                          <p className="text-text-main/90 font-sans mt-0.5 leading-snug">
                                            {comment.content}
                                          </p>
                                        </div>
                                      </div>

                                      {canDeleteComment && (
                                        <button
                                          type="button"
                                          onClick={() => deleteWallComment(post.id, comment.id)}
                                          className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-main hover:text-red-500 rounded transition-opacity cursor-pointer"
                                          title="Delete reply"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Quick Add Reply Input */}
                            <div className="flex items-center gap-1.5 pt-1">
                              <input
                                type="text"
                                placeholder="Write a reply..."
                                value={commentInputs[post.id] || ''}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const text = commentInputs[post.id];
                                    if (!text?.trim()) return;
                                    const authorUser = user || {
                                      id: 'usr-default',
                                      name: 'Studio Architect',
                                      email: 'architect@arkipelago.studio',
                                      role: 'senior_architect',
                                      department: 'Architecture & Design',
                                      avatarUrl:
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                                    };
                                    addWallComment(post.id, text.trim(), authorUser);
                                    setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                                  }
                                }}
                                className="flex-1 bg-surface-hover border border-border-main rounded-lg px-2.5 py-1 text-xs text-text-main placeholder:text-muted-main focus:outline-none focus:border-text-main"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const text = commentInputs[post.id];
                                  if (!text?.trim()) return;
                                  const authorUser = user || {
                                    id: 'usr-default',
                                    name: 'Studio Architect',
                                    email: 'architect@arkipelago.studio',
                                    role: 'senior_architect',
                                    department: 'Architecture & Design',
                                    avatarUrl:
                                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
                                  };
                                  addWallComment(post.id, text.trim(), authorUser);
                                  setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                                }}
                                className="p-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs hover:opacity-90 cursor-pointer shadow-xs active:scale-[0.98]"
                                title="Send reply"
                              >
                                <CornerDownRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="pt-2 border-t border-border-main/50">
              <Link
                href="/chat?tab=wall"
                className="w-full py-2 bg-surface-hover hover:bg-border-main/40 border border-border-main rounded-xl text-xs font-semibold text-text-main flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Studio Wall Feed →</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 3. PROJECTS BENTO */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-base sm:text-lg font-serif font-bold text-text-main">
              Projects
            </h2>
            <p className="text-xs text-muted-main font-sans">
              Active projects and milestones.
            </p>
          </div>

          <Link
            href="/projects"
            className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <span>All Projects →</span>
          </Link>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeProjects.map((p, idx) => {
            const projectProgress = idx === 0 ? 40 : idx === 1 ? 65 : 80;
            const projectPhase = idx === 0 ? 'Schematic Design' : idx === 1 ? 'Design Development' : 'Permits & Bidding';
            const projectImg =
              idx === 0
                ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'
                : idx === 1
                ? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'
                : 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80';

            return (
              <Link
                key={p.id}
                href="/projects"
                className="rounded-2xl border border-border-main/70 bg-surface-main overflow-hidden flex flex-col justify-between hover:border-text-main/80 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
              >
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

                <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-main font-sans line-clamp-1">
                      {p.clientName}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-border-main/40">
                    <div className="flex justify-between text-[11px] text-muted-main font-mono">
                      <span>{projectPhase}</span>
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

      {/* 4. TASKS & STUDIO WALL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Tasks (7 Cols) */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
              <div>
                <h2 className="text-base font-bold font-serif text-text-main">
                  Tasks
                </h2>
                <span className="text-[11px] text-muted-main">
                  {inProgressTasks.length} active • {completedTasks.length} completed
                </span>
              </div>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-border-main bg-surface-hover/60 hover:bg-surface-hover text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[34px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Task</span>
              </button>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.slice(0, 4).map((task) => {
                  const formattedName = task.name.length > 0 
                    ? task.name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                    : task.name;

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleInitiateTaskToggle(task)}
                      className="p-3.5 rounded-xl border border-border-main/70 bg-surface-hover/30 hover:bg-surface-hover transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiateTaskToggle(task);
                          }}
                          className="mt-0.5 text-muted-main group-hover:text-emerald-500 transition-colors p-0.5 cursor-pointer"
                          aria-label="Toggle task status"
                        >
                          <Circle className="w-4 h-4 text-muted-main" />
                        </button>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                            {formattedName}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-muted-main line-clamp-1 font-sans">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-muted-main font-mono pt-0.5">
                            <span className="capitalize">{task.projectPhase?.toLowerCase()}</span>
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
                  );
                })
              ) : (
                <div className="py-8 text-center space-y-1.5 border border-dashed border-border-main rounded-xl">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-text-main">
                    All tasks completed
                  </p>
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="pt-2 text-[11px] text-muted-main">
                <span>✓ {completedTasks.length} completed today</span>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: Studio Wall (5 Cols) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
                <h2 className="text-base font-bold font-serif text-text-main">
                  Studio Wall
                </h2>
                <Link
                  href="/chat?tab=wall"
                  className="text-xs text-accent-cyan hover:underline flex items-center gap-0.5"
                >
                  <span>View All →</span>
                </Link>
              </div>

              {/* Composer */}
              <form onSubmit={handleBroadcastPost} className="relative">
                <input
                  type="text"
                  value={wallInput}
                  onChange={(e) => setWallInput(e.target.value)}
                  placeholder="Write an update or note..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border-main bg-surface-hover/30 text-xs text-text-main placeholder:text-muted-main/70 focus:outline-none focus:border-accent-cyan transition-colors"
                />
                <button
                  type="submit"
                  disabled={!wallInput.trim() || isBroadcasting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 disabled:opacity-30 transition-opacity cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                  aria-label="Send update"
                >
                  {broadcastSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                </button>
              </form>

              {/* Feed */}
              <div className="space-y-2.5 pt-1">
                {posts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href="/chat?tab=wall"
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

            {/* Role-aware pending submittals alert */}
            {canReviewRequests && pendingReviewRequests.length > 0 && (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs mt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-text-main text-[11px]">
                    <strong>{pendingReviewRequests.length} pending submittal{pendingReviewRequests.length > 1 ? 's' : ''}</strong> awaiting review
                  </span>
                </div>
                <Link
                  href="/hr"
                  className="text-amber-700 dark:text-amber-400 font-semibold hover:underline text-[11px]"
                >
                  Review →
                </Link>
              </div>
            )}

            {!canReviewRequests && !isContractor && myPendingRequests.length > 0 && (
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-text-main text-[11px]">
                    <strong>Your {myPendingRequests[0].type.replace(/_/g, ' ')} submittal</strong> is awaiting review
                  </span>
                </div>
                <Link
                  href="/hr"
                  className="text-blue-700 dark:text-blue-400 font-semibold hover:underline text-[11px]"
                >
                  View Status →
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 5. PORTALS */}
      <section className="pt-1">
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
                  Calendar
                </h3>
                <p className="text-[10px] text-muted-main">Site visits & deadlines</p>
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
                  Directory
                </h3>
                <p className="text-[10px] text-muted-main">Consultants & contacts</p>
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
                  HR
                </h3>
                <p className="text-[10px] text-muted-main">Timesheets & requests</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-main group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* TASK COMPLETION CONFIRMATION MODAL */}
      {taskToConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setTaskToConfirm(null);
          }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative text-text-main font-mono cursor-default animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-main">
                  {taskToConfirm.action === 'complete' ? 'Mark Task as Completed?' : 'Reopen Task?'}
                </h3>
                <p className="text-xs text-muted-main leading-relaxed">
                  {taskToConfirm.action === 'complete'
                    ? 'Are you sure you want to sign off and mark this task as completed?'
                    : 'Are you sure you want to move this task back to In Progress?'}
                </p>
              </div>
            </div>

            {/* Task summary capsule */}
            <div className="p-3.5 rounded-xl border border-border-main bg-surface-hover/50 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-text-main truncate">
                  {taskToConfirm.task.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main shrink-0">
                  {taskToConfirm.task.priority}
                </span>
              </div>
              <div className="text-[11px] text-muted-main flex items-center gap-3">
                <span>Phase: {taskToConfirm.task.projectPhase}</span>
                <span>•</span>
                <span>Assignee: {taskToConfirm.task.assignedMember}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setTaskToConfirm(null)}
                className="py-2.5 rounded-xl border border-border-main hover:bg-surface-hover active:scale-[0.98] transition-all text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTaskToggle}
                className="py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs active:scale-[0.98] transition-all shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{taskToConfirm.action === 'complete' ? 'Confirm & Complete' : 'Reopen Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION TOAST WITH UNDO */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-[120] max-w-sm w-full bg-surface-main border border-border-strong rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-3 text-text-main animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs font-semibold truncate">{toastNotice.message}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {toastNotice.undoTask && (
              <button
                onClick={handleUndoTaskToggle}
                className="text-xs font-bold text-accent-cyan hover:underline px-1 cursor-pointer"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => setToastNotice(null)}
              className="p-1 rounded-lg text-muted-main hover:text-text-main cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
