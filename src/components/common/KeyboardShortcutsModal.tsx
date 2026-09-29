'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Command, Keyboard, Sparkles, Navigation, PenTool, Layout, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ShortcutGroup {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: {
    keys: string[];
    description: string;
    actionHint?: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: 'Global & Navigation',
    icon: Navigation,
    shortcuts: [
      { keys: ['Ctrl', 'K'], description: 'Open Command Palette & Global Search' },
      { keys: ['?'], description: 'Open Keyboard Shortcuts Cheatsheet' },
      { keys: ['G', 'D'], description: 'Go to Studio Dashboard' },
      { keys: ['G', 'P'], description: 'Go to Project Dashboard & Blueprint Vault' },
      { keys: ['G', 'C'], description: 'Go to Calendar & Schedules' },
      { keys: ['G', 'S'], description: 'Go to Sketching & CAD Studio' },
      { keys: ['G', 'H'], description: 'Go to Human Resources (HR) & Timesheets' },
      { keys: ['G', 'W'], description: 'Go to Estudio Wall & Chat' },
      { keys: ['Esc'], description: 'Close any active modal, popover, or drawer' },
    ],
  },
  {
    category: 'Sketching & CAD Drafting',
    icon: PenTool,
    shortcuts: [
      { keys: ['P'], description: 'Activate Freehand Pen Tool' },
      { keys: ['L'], description: 'Activate Orthogonal / Line Tool' },
      { keys: ['R'], description: 'Activate Rectangle Tool' },
      { keys: ['C'], description: 'Activate Circle / Radius Tool' },
      { keys: ['O'], description: 'Toggle Ortho Snap Lock (0° / 45° / 90°)' },
      { keys: ['G'], description: 'Cycle Grid Mode (Square → Dots → Isometric → None)' },
      { keys: ['Space', 'Drag'], description: 'Pan Canvas Viewport' },
      { keys: ['Ctrl', 'Z'], description: 'Undo last stroke' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo stroke' },
    ],
  },
  {
    category: 'Studio Operations & Actions',
    icon: Layout,
    shortcuts: [
      { keys: ['Alt', 'T'], description: 'Initialize New Studio Task' },
      { keys: ['Alt', 'R'], description: 'Log New Contractor RFI' },
      { keys: ['Alt', 'S'], description: 'Log New Material Submittal' },
      { keys: ['Alt', 'N'], description: 'Toggle Night Mode / Day Mode Theme' },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Escape Key Listener to dismiss modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return SHORTCUT_GROUPS;
    const q = searchQuery.toLowerCase();

    return SHORTCUT_GROUPS.map((group) => {
      const matched = group.shortcuts.filter(
        (s) =>
          s.description.toLowerCase().includes(q) ||
          s.keys.some((k) => k.toLowerCase().includes(q))
      );
      return {
        ...group,
        shortcuts: matched,
      };
    }).filter((group) => group.shortcuts.length > 0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        className="bg-surface-main border border-border-strong w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-text-main cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border-main bg-surface-hover/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan shrink-0">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-main font-sans flex items-center gap-2">
                <span>Studio Keyboard Shortcuts</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main">
                  Hotkeys
                </span>
              </h3>
              <p className="text-xs text-muted-main font-sans">
                Accelerate drafting, CAD navigation, and studio operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-border-main hover:bg-surface-hover flex items-center justify-center text-muted-main hover:text-text-main cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-3 border-b border-border-main/60 bg-surface-hover/20">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
            <input
              type="text"
              placeholder="Search shortcut by name or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-main border border-border-main rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
            />
          </div>
        </div>

        {/* Shortcuts Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {filteredGroups.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.category} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-main uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{group.category}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-hover/40 border border-border-main/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="font-sans text-text-main/90 font-medium">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 bg-surface-main border border-border-strong rounded-lg text-[11px] font-mono font-bold text-text-main shadow-2xs"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredGroups.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-main">
              No shortcuts found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border-main bg-surface-hover/30 flex items-center justify-between text-[11px] text-muted-main font-sans">
          <span>Tip: Press <kbd className="font-mono bg-surface-main border border-border-main px-1.5 py-0.5 rounded text-text-main">?</kbd> anywhere to bring up this cheatsheet</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
