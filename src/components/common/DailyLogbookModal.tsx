'use client';

import React, { useState } from 'react';
import { DailyLogEntry, DailyLogCategory } from '@/types';
import { 
  BookOpen, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Tag, 
  User, 
  X, 
  FileText,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyLogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string; role: string };
}

const CATEGORIES: { label: DailyLogCategory; name: string; icon: LucideIcon; badgeClass: string }[] = [
  { label: 'EMAIL', name: 'Email Correspondence', icon: Mail, badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30' },
  { label: 'CLIENT_UPDATE', name: 'Client Update', icon: MessageSquare, badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' },
  { label: 'MEETING_NOTES', name: 'Meeting Notes', icon: FileText, badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30' },
  { label: 'PROJECT_PROGRESS', name: 'Project Progress', icon: CheckCircle2, badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' },
  { label: 'URGENT_ISSUE', name: 'Urgent Issue / Blocker', icon: AlertTriangle, badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' },
  { label: 'GENERAL', name: 'General Note', icon: Tag, badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30' },
];

export function DailyLogbookModal({
  isOpen,
  onClose,
  currentUser = { name: 'Arch. Carlos Mendoza', role: 'Lead Architect' }
}: DailyLogbookModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | DailyLogCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Studio logs state
  const [logs, setLogs] = useState<DailyLogEntry[]>([
    {
      id: 'log-1',
      date: '2026-09-29',
      category: 'PROJECT_PROGRESS',
      projectName: 'Makati Tower Phase 2',
      subject: 'Curtain Wall Facade Joint Clearance Cleared by Structural Consultant',
      content: 'Met with facade engineers regarding thermal expansion joints between Level 14 and 16. Approved shop drawings to be issued tomorrow morning.',
      authorName: 'Arch. Carlos Mendoza',
      authorRole: 'Senior Architect',
      createdAt: '09:45 AM'
    },
    {
      id: 'log-2',
      date: '2026-09-29',
      category: 'CLIENT_UPDATE',
      projectName: 'Casa Verde Residence',
      subject: 'Client Approved Italian Carrara Marble Spec',
      content: 'Verde family confirmed Italian Carrara selection for powder room vanity and main kitchen island slab. Sample signoff archived in RFA records.',
      authorName: 'Arch. Sofia Reyes',
      authorRole: 'Project Architect',
      createdAt: '09:15 AM'
    },
    {
      id: 'log-3',
      date: '2026-09-28',
      category: 'URGENT_ISSUE',
      projectName: 'Tagaytay Ridge House',
      subject: 'City Zoning Ordinance Verification Delayed',
      content: 'Awaiting revised height clearance from zoning bureau due to new ridge setback guidelines. Construction mobilization postponed by 4 days.',
      authorName: 'Arch. Leandro Locsin',
      authorRole: 'Partner',
      createdAt: '04:30 PM'
    }
  ]);

  // Form states
  const [newCategory, setNewCategory] = useState<DailyLogCategory>('PROJECT_PROGRESS');
  const [newProject, setNewProject] = useState('Makati Tower Phase 2');
  const [newSubject, setNewSubject] = useState('');
  const [newContent, setNewContent] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = log.subject.toLowerCase().includes(q);
      const matchCont = log.content.toLowerCase().includes(q);
      const matchProj = log.projectName?.toLowerCase().includes(q) || false;
      if (!matchSub && !matchCont && !matchProj) return false;
    }
    return true;
  });

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newContent.trim()) return;

    const entry: DailyLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      projectName: newProject,
      subject: newSubject.trim(),
      content: newContent.trim(),
      authorName: currentUser.name,
      authorRole: currentUser.role,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLogs([entry, ...logs]);
    setNewSubject('');
    setNewContent('');
    setIsAddOpen(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150 cursor-pointer"
    >
      <div className="bg-surface-main border border-border-main w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl p-6 flex flex-col text-text-main cursor-default">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border-main pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <span>Studio Daily Logbook</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover border border-border-main text-muted-main">
                  Live Operations
                </span>
              </h3>
              <p className="text-xs text-muted-main">
                Centralized architectural activity, client correspondence, and site progress briefs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Entry</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="py-3 border-b border-border-main shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by keyword, project, or author..."
                className="w-full bg-surface-hover border border-border-main rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-text-main font-sans"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap',
                selectedCategory === 'ALL'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
              )}
            >
              All Logs ({logs.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = logs.filter(l => l.category === cat.label).length;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-1',
                    selectedCategory === cat.label
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logs Feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-main text-xs space-y-1">
              <BookOpen className="w-8 h-8 mx-auto opacity-30" />
              <p>No logbook entries found matching your criteria.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const catConfig = CATEGORIES.find(c => c.label === log.category) || CATEGORIES[5];
              const Icon = catConfig.icon;
              return (
                <div
                  key={log.id}
                  className="bg-surface-hover/30 border border-border-main rounded-xl p-4 space-y-2 hover:border-text-main/30 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-border-main/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1', catConfig.badgeClass)}>
                        <Icon className="w-3 h-3" />
                        <span>{log.category.replace(/_/g, ' ')}</span>
                      </span>
                      {log.projectName && (
                        <span className="text-xs font-bold text-accent-cyan font-sans">
                          [{log.projectName}]
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-main">
                      <span>{log.date}</span>
                      <span>•</span>
                      <span>{log.createdAt}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-text-main font-sans">{log.subject}</h4>
                  <p className="text-xs text-text-main leading-relaxed font-sans">{log.content}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-border-main/40 text-[10px] text-muted-main font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Logged by: <strong className="text-text-main font-sans">{log.authorName}</strong> ({log.authorRole})
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal: New Log Entry Form */}
        {isAddOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddOpen(false);
            }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
          >
            <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
              <div className="flex items-center justify-between border-b border-border-main pb-3">
                <h3 className="text-xs font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-cyan" />
                  <span>New Studio Log Entry</span>
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleCreateLog} className="space-y-3 font-sans">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-main block mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as DailyLogCategory)}
                      className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.label} value={c.label}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-main block mb-1">Project</label>
                    <input
                      type="text"
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Subject / Brief *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Facade joint inspection cleared"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Detailed Content *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the update, email thread, or site outcome..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    Publish Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
