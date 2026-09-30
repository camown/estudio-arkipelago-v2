'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WorkspaceStickyNote } from '@/types';
import { StickyNote, Plus, Minimize2, Maximize2, Trash2, GripHorizontal, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS: Array<{ key: WorkspaceStickyNote['color']; bg: string; text: string; border: string }> = [
  { key: 'yellow', bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-950 dark:text-amber-100', border: 'border-amber-300 dark:border-amber-800' },
  { key: 'blue', bg: 'bg-sky-100 dark:bg-sky-950/80', text: 'text-sky-950 dark:text-sky-100', border: 'border-sky-300 dark:border-sky-800' },
  { key: 'green', bg: 'bg-emerald-100 dark:bg-emerald-950/80', text: 'text-emerald-950 dark:text-emerald-100', border: 'border-emerald-300 dark:border-emerald-800' },
  { key: 'pink', bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-950 dark:text-rose-100', border: 'border-rose-300 dark:border-rose-800' },
];

const DEFAULT_NOTES: WorkspaceStickyNote[] = [
  {
    id: 'note-1',
    title: 'Structural Coordination',
    content: 'Call Engr. Cruz at 2:00 PM re: Makati Tower cantilever tie-back depths.',
    color: 'yellow',
    x: 290,
    y: 90,
    minimized: false,
  }
];

export function StickyNotesOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<WorkspaceStickyNote[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_NOTES;
    try {
      const saved = localStorage.getItem('estudio_workspace_notes');
      if (saved) {
        const parsed: WorkspaceStickyNote[] = JSON.parse(saved);
        const isDesktop = window.innerWidth >= 768;
        const minX = isDesktop ? 280 : 12;
        const maxX = Math.max(minX, window.innerWidth - 270);
        return parsed.map((n) => ({
          ...n,
          x: Math.max(minX, Math.min(maxX, n.x)),
          y: Math.max(10, Math.min(window.innerHeight - 100, n.y)),
        }));
      }
      return DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  // Dragging state tracking
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragRef = useRef<{
    noteId: string;
    startX: number;
    startY: number;
    initialNoteX: number;
    initialNoteY: number;
  } | null>(null);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('estudio_workspace_notes', JSON.stringify(notes));
    } catch {
      // Ignore storage errors
    }
  }, [notes]);

  const addNote = () => {
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isDesktop = screenW >= 768;
    const minX = isDesktop ? 280 : 16;
    const maxX = Math.max(minX, screenW - 270);

    const newNote: WorkspaceStickyNote = {
      id: `sn-${Date.now()}`,
      title: 'New Memo',
      content: '',
      color: COLORS[notes.length % COLORS.length].key,
      x: Math.max(minX, Math.min(maxX, (isDesktop ? 300 : 16) + (notes.length * 15))),
      y: Math.min(screenH - 220, 110 + (notes.length * 15)),
      minimized: false,
    };
    setNotes([...notes, newNote]);
    setIsOpen(true);
  };

  const updateNote = useCallback((id: string, updates: Partial<WorkspaceStickyNote>) => {
    setNotes((prev) => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter(n => n.id !== id));
    if (confirmDeleteId === id) {
      setConfirmDeleteId(null);
    }
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent, note: WorkspaceStickyNote) => {
    // Only drag from header, ignore clicks on inputs or buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    e.preventDefault();
    setDraggingId(note.id);
    dragRef.current = {
      noteId: note.id,
      startX: e.clientX,
      startY: e.clientY,
      initialNoteX: note.x,
      initialNoteY: note.y,
    };
  };

  useEffect(() => {
    if (!draggingId) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { noteId, startX, startY, initialNoteX, initialNoteY } = dragRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      // Clamp within screen boundaries
      const maxW = typeof window !== 'undefined' ? window.innerWidth - 270 : 800;
      const maxH = typeof window !== 'undefined' ? window.innerHeight - 100 : 600;

      const newX = Math.max(10, Math.min(maxW, initialNoteX + deltaX));
      const newY = Math.max(10, Math.min(maxH, initialNoteY + deltaY));

      updateNote(noteId, { x: Math.round(newX), y: Math.round(newY) });
    };

    const handlePointerUp = () => {
      setDraggingId(null);
      dragRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingId, updateNote]);

  return (
    <>
      {/* Floating Toggle Button - positioned above BottomNav on mobile */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'p-3 rounded-full shadow-lg border transition-all cursor-pointer flex items-center gap-2',
            isOpen
              ? 'bg-amber-500 text-black border-amber-600'
              : 'bg-surface-main text-text-main border-border-main hover:border-text-main'
          )}
          title="Sticky Memos"
        >
          <StickyNote className="w-5 h-5 text-amber-500" />
          {notes.length > 0 && (
            <span className="text-xs font-mono font-bold">{notes.length}</span>
          )}
        </button>

        {isOpen && (
          <button
            onClick={addNote}
            className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-lg hover:opacity-90 transition-opacity cursor-pointer"
            title="Add Memo"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Render Sticky Notes */}
      {isOpen && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden font-mono">
          {notes.map((note) => {
            const colorCfg = COLORS.find(c => c.key === note.color) || COLORS[0];
            const isDragging = draggingId === note.id;
            const isConfirmingDelete = confirmDeleteId === note.id;

            return (
              <div
                key={note.id}
                style={{
                  transform: `translate(${note.x}px, ${note.y}px)`,
                }}
                className={cn(
                  'absolute pointer-events-auto w-64 max-w-[calc(100vw-32px)] rounded-xl shadow-lg border p-3 select-none transition-shadow',
                  colorCfg.bg,
                  colorCfg.text,
                  colorCfg.border,
                  note.minimized ? 'h-11' : 'min-h-[160px]',
                  isDragging ? 'shadow-2xl opacity-95 scale-[1.01] ring-2 ring-black/20 dark:ring-white/20' : ''
                )}
              >
                {/* Header (Draggable Handle) */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, note)}
                  className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1.5 mb-2 cursor-grab active:cursor-grabbing"
                  title="Drag note to reposition"
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-1">
                    <GripHorizontal className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => updateNote(note.id, { title: e.target.value })}
                      className="font-bold text-xs bg-transparent border-0 focus:outline-none w-full truncate cursor-text"
                      placeholder="Memo Title"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateNote(note.id, { minimized: !note.minimized })}
                      className="p-1 hover:opacity-70 cursor-pointer rounded"
                      title={note.minimized ? 'Expand' : 'Collapse'}
                    >
                      {note.minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(note.id)}
                      className="p-1 hover:text-rose-600 cursor-pointer rounded"
                      title="Delete Memo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {!note.minimized && (
                  <textarea
                    rows={4}
                    value={note.content}
                    placeholder="Type memo, reminder, or note..."
                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                    className="w-full bg-transparent text-xs resize-none focus:outline-none font-sans leading-relaxed cursor-text"
                  />
                )}

                {/* Delete Confirmation Overlay */}
                {isConfirmingDelete && (
                  <div className="absolute inset-0 bg-surface-main/95 backdrop-blur-xs p-3.5 flex flex-col justify-between rounded-xl z-20 border border-rose-500/40 text-text-main shadow-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Delete Memo?</span>
                      </div>
                      <p className="text-[11px] text-muted-main truncate">
                        &quot;{note.title || 'Untitled Memo'}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 py-1.5 px-2 border border-border-main bg-surface-hover hover:bg-border-main text-text-main rounded-lg text-xs font-semibold cursor-pointer active:scale-95 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
