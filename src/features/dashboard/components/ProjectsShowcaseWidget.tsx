'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/types';
import { PROJECT_METADATA } from '@/types/dashboardCanvas';
import {
  FolderKanban,
  Split,
  MoveLeft,
  MoveRight,
  Plus,
  Pin,
  FileText,
  Save,
  Check,
  ChevronDown,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_PINNED_PROJECTS_KEY = 'arkipelago_dashboard_pinned_projects';
const STORAGE_PROJECT_NOTES_KEY = 'arkipelago_dashboard_project_notes';

interface ProjectsShowcaseWidgetProps {
  activeProjectsSorted: Project[];
  isEditMode: boolean;
  onSplit: () => void;
  onMoveLeft: (projectId: string) => void;
  onMoveRight: (projectId: string) => void;
  onPopOut: (projectId: string) => void;
}

export function ProjectsShowcaseWidget({
  activeProjectsSorted,
  isEditMode,
  onSplit,
  onMoveLeft,
  onMoveRight,
  onPopOut,
}: ProjectsShowcaseWidgetProps) {
  // Pinned projects state (architects want priority projects first)
  const [pinnedProjectIds, setPinnedProjectIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return ['proj-001'];
    try {
      const saved = localStorage.getItem(STORAGE_PINNED_PROJECTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return ['proj-001'];
  });

  // Project Note Management: architects can keep sticky memos on projects
  const [projectNotes, setProjectNotes] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_PROJECT_NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'proj-001': 'Client requested Italian Carrara marble sample board review on Thursday at 2:00 PM.',
      'proj-002': '14th floor shear wall sleeve clearance approved with Engr. Cruz.',
    };
  });

  const [activeNoteModalProjectId, setActiveNoteModalProjectId] = useState<string | null>(null);
  const [currentNoteDraft, setCurrentNoteDraft] = useState('');
  const [savedNoteNotice, setSavedNoteNotice] = useState(false);

  const togglePinProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPinnedProjectIds((prev) => {
      const next = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [projectId, ...prev];
      try {
        localStorage.setItem(STORAGE_PINNED_PROJECTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleOpenNoteModal = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveNoteModalProjectId(projectId);
    setCurrentNoteDraft(projectNotes[projectId] || '');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteModalProjectId) return;

    setProjectNotes((prev) => {
      const next = { ...prev, [activeNoteModalProjectId]: currentNoteDraft.trim() };
      try {
        localStorage.setItem(STORAGE_PROJECT_NOTES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    setSavedNoteNotice(true);
    setTimeout(() => {
      setSavedNoteNotice(false);
      setActiveNoteModalProjectId(null);
    }, 900);
  };

  const handleDeleteNote = (projectId: string) => {
    setProjectNotes((prev) => {
      const next = { ...prev };
      delete next[projectId];
      try {
        localStorage.setItem(STORAGE_PROJECT_NOTES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setCurrentNoteDraft('');
    setActiveNoteModalProjectId(null);
  };

  // Sort: pinned projects appear first, preserving architect order
  const projectsWithPinnedFirst = React.useMemo(() => {
    return [...activeProjectsSorted].sort((a, b) => {
      const aPinned = pinnedProjectIds.includes(a.id);
      const bPinned = pinnedProjectIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [activeProjectsSorted, pinnedProjectIds]);

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/40 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-sans font-bold text-text-main">
              Active Projects
            </h2>
            {pinnedProjectIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Pin className="w-3 h-3 fill-current" />
                <span>{pinnedProjectIds.length} Pinned</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">

          {isEditMode && (
            <button
              type="button"
              onClick={onSplit}
              className="px-2.5 py-1 rounded-lg border border-border-main bg-surface-hover hover:border-text-main text-[11px] font-mono text-accent-cyan flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Split into individual 1-by-1 project cards on canvas"
            >
              <Split className="w-3 h-3" />
              <span>Split</span>
            </button>
          )}
          <Link
            href="/projects"
            className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1 shrink-0 font-mono"
          >
            <span>All Projects ({activeProjectsSorted.length}) →</span>
          </Link>
        </div>
      </div>

      {/* Project Cards (Arranged 1 by 1 with Pinned & Note Features) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projectsWithPinnedFirst.map((p, idx) => {
          const meta = PROJECT_METADATA[p.id] || {
            img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            phase: 'Active Phase',
            progress: 50,
          };
          const isPinned = pinnedProjectIds.includes(p.id);
          const noteText = projectNotes[p.id];

          return (
            <div
              key={p.id}
              className={cn(
                'rounded-2xl border bg-surface-main overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-xs relative',
                isPinned
                  ? 'border-accent-cyan/60 shadow-sm ring-1 ring-accent-cyan/20'
                  : 'border-border-main/70 hover:border-text-main/80'
              )}
            >
              {/* Media Thumbnail */}
              <div className="aspect-16/9 relative overflow-hidden bg-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.img}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Project Code Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <FolderKanban className="w-3 h-3 text-accent-cyan" />
                  <span>{p.code}</span>
                </div>

                {/* Right Badges: Status and Pin Toggle */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => togglePinProject(p.id, e)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors cursor-pointer backdrop-blur-md',
                      isPinned
                        ? 'bg-accent-cyan text-black shadow-sm font-bold'
                        : 'bg-black/60 text-white hover:bg-black/80 opacity-80 group-hover:opacity-100'
                    )}
                    title={isPinned ? 'Unpin project from top' : 'Pin project to top for quick access'}
                  >
                    <Pin className={cn('w-3.5 h-3.5', isPinned && 'fill-current')} />
                  </button>

                  <div className="px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs">
                    {p.status}
                  </div>
                </div>

                {/* 1-by-1 Arrange Controls inside Bento when in Edit Mode */}
                {isEditMode && (
                  <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-lg bg-black/85 backdrop-blur-md flex items-center justify-between gap-1 text-[10px] font-mono text-white border border-white/10 z-10">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onMoveLeft(p.id)}
                        disabled={idx === 0}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5"
                        title="Move project left"
                      >
                        <MoveLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveRight(p.id)}
                        disabled={idx === projectsWithPinnedFirst.length - 1}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-0.5"
                        title="Move project right"
                      >
                        <MoveRight className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPopOut(p.id)}
                      className="px-2 py-0.5 rounded bg-accent-cyan text-black font-bold hover:opacity-90 flex items-center gap-1 cursor-pointer"
                      title="Pin as standalone card on canvas"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Pop Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm sm:text-base font-bold text-text-main group-hover:text-accent-cyan transition-colors truncate">
                      {p.name}
                    </h3>
                    <Link
                      href={`/projects?code=${p.code}`}
                      className="text-[11px] text-muted-main hover:text-accent-cyan font-mono shrink-0 ml-2"
                    >
                      Workspace →
                    </Link>
                  </div>
                  <p className="text-xs text-muted-main font-sans line-clamp-1">
                    {p.clientName}
                  </p>
                </div>

                {/* Sticky Architectural Note Card / Preview */}
                <div className="pt-1">
                  {noteText ? (
                    <div
                      onClick={(e) => handleOpenNoteModal(p.id, e)}
                      className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-colors space-y-1 text-left"
                      title="Click to edit architectural notes"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Architectural Note</span>
                        </span>
                        <span className="text-[9px] underline">Edit</span>
                      </div>
                      <p className="text-[11px] text-text-main font-sans line-clamp-2 leading-relaxed">
                        {noteText}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleOpenNoteModal(p.id, e)}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-dashed border-border-main hover:border-accent-cyan text-[11px] font-mono text-muted-main hover:text-accent-cyan flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>+ Add Project Note</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-muted-main">{meta.phase}</span>
                    <span className="text-accent-cyan font-bold">{meta.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-cyan rounded-full transition-all duration-500"
                      style={{ width: `${meta.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Architectural Note Management Modal */}
      {activeNoteModalProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-main border border-border-strong rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-main">
                    Architectural Note Management
                  </h3>
                  <p className="text-[10px] text-muted-main">
                    Project:{' '}
                    {activeProjectsSorted.find((p) => p.id === activeNoteModalProjectId)?.name ||
                      'Project'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveNoteModalProjectId(null)}
                className="text-muted-main hover:text-text-main text-xs font-mono p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-main font-semibold">
                  Site Notes, Design Directives, or Client Decisions:
                </label>
                <textarea
                  rows={4}
                  autoFocus
                  value={currentNoteDraft}
                  onChange={(e) => setCurrentNoteDraft(e.target.value)}
                  placeholder="e.g. Concrete mix verification pending approval for cantilever core. Client confirmed Italian marble sample on Oct 4."
                  className="w-full bg-surface-hover/50 border border-border-main rounded-xl p-3 text-xs text-text-main font-sans placeholder:text-muted-main focus:outline-none focus:border-accent-cyan resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {projectNotes[activeNoteModalProjectId] ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(activeNoteModalProjectId)}
                    className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Note</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveNoteModalProjectId(null)}
                    className="px-3 py-1.5 rounded-lg border border-border-main text-muted-main hover:text-text-main text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    {savedNoteNotice ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface StandaloneProjectCardWidgetProps {
  project: Project;
  onViewProject?: () => void;
}

export function StandaloneProjectCardWidget({ project }: StandaloneProjectCardWidgetProps) {
  const meta = PROJECT_METADATA[project.id] || {
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    phase: 'Active Phase',
    progress: 50,
  };

  const [notes] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_PROJECT_NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const note = notes[project.id];

  return (
    <div className="rounded-2xl border border-border-main/70 bg-surface-main overflow-hidden flex flex-col justify-between hover:border-text-main/80 transition-all duration-300 group shadow-xs h-full">
      <div className="aspect-16/9 relative overflow-hidden bg-black/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.img}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1.5">
          <FolderKanban className="w-3 h-3 text-accent-cyan" />
          <span>{project.code}</span>
        </div>
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[9px] font-bold uppercase tracking-wider">
          {project.status}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-text-main group-hover:text-accent-cyan transition-colors">
              {project.name}
            </h3>
            <Link
              href={`/projects?code=${project.code}`}
              className="text-[11px] text-muted-main hover:text-accent-cyan font-mono"
            >
              Workspace →
            </Link>
          </div>
          <p className="text-xs text-muted-main font-sans line-clamp-1">
            {project.clientName}
          </p>
        </div>

        {note && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-text-main font-sans line-clamp-2">
            📝 {note}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-muted-main">{meta.phase}</span>
            <span className="text-accent-cyan font-bold">{meta.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-500"
              style={{ width: `${meta.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
