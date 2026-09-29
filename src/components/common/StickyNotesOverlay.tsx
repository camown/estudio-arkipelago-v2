'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceStickyNote } from '@/types';
import { StickyNote, Plus, Minimize2, Maximize2, Trash2 } from 'lucide-react';
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
    x: 30,
    y: 100,
    minimized: false,
  }
];

export function StickyNotesOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<WorkspaceStickyNote[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_NOTES;
    try {
      const saved = localStorage.getItem('estudio_workspace_notes');
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('estudio_workspace_notes', JSON.stringify(notes));
    } catch {
      // Ignore storage errors
    }
  }, [notes]);

  const addNote = () => {
    const newNote: WorkspaceStickyNote = {
      id: `sn-${Date.now()}`,
      title: 'New Memo',
      content: '',
      color: COLORS[notes.length % COLORS.length].key,
      x: 40 + (notes.length * 20),
      y: 120 + (notes.length * 20),
      minimized: false,
    };
    setNotes([...notes, newNote]);
    setIsOpen(true);
  };

  const updateNote = (id: string, updates: Partial<WorkspaceStickyNote>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
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
            return (
              <div
                key={note.id}
                style={{
                  transform: `translate(${note.x}px, ${note.y}px)`,
                }}
                className={cn(
                  'absolute pointer-events-auto w-64 rounded-xl shadow-xl border p-3 transition-all',
                  colorCfg.bg,
                  colorCfg.text,
                  colorCfg.border,
                  note.minimized ? 'h-10' : 'min-h-[160px]'
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1.5 mb-2">
                  <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateNote(note.id, { title: e.target.value })}
                    className="font-bold text-xs bg-transparent border-0 focus:outline-none w-full truncate"
                  />
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <button
                      onClick={() => updateNote(note.id, { minimized: !note.minimized })}
                      className="p-1 hover:opacity-70 cursor-pointer"
                    >
                      {note.minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:text-rose-600 cursor-pointer"
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
                    placeholder="Type memo, reminder, code snippet..."
                    onChange={(e) => updateNote(note.id, { content: e.target.value })}
                    className="w-full bg-transparent text-xs resize-none focus:outline-none font-sans leading-relaxed"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
