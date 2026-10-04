'use client';

import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, FolderKanban, MessageSquare, PenTool, 
  Calendar, FileText, HardHat, Moon, Sun, Clock,
  ArrowRight, X, Command, Plus, BookUser
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_PROJECTS } from '@/lib/constants';
import { useTheme } from '@/lib/themeContext';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'PROJECTS' | 'DRAWING SHEETS' | 'COMMS & THREADS' | 'STUDIO ACTIONS';
  icon: React.ComponentType<{ className?: string }>;
  searchKey: string;
  action: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const { themeMode, toggleThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  // Listen for open/close events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open_command_palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open_command_palette', handleCustomOpen);
    };
  }, []);


  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [isOpen]);

  // Pre-index command items with memoization
  const items: CommandItem[] = useMemo(() => {
    return [
      // Projects
      ...MOCK_PROJECTS.map((p) => {
        const client = p.clientName || 'Studio Project';
        return {
          id: `proj-${p.id}`,
          title: p.name,
          subtitle: `[${p.code}] - Client: ${client}`,
          category: 'PROJECTS' as const,
          icon: FolderKanban,
          searchKey: `${p.name} ${p.code} ${client} projects`.toLowerCase(),
          action: () => {
            setIsOpen(false);
            router.push(`/projects?project=${p.code}`);
          },
        };
      }),
      // Drawing Sheets
      {
        id: 'dwg-a101',
        title: 'A-101 Ground Floor Plan & Massing',
        subtitle: 'Makati Tower Schematic Drawing Set (Rev 02)',
        category: 'DRAWING SHEETS' as const,
        icon: FileText,
        searchKey: 'a-101 ground floor plan massing makati tower schematic drawing sets rev 02'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/projects?project=MT-2024');
        },
      },
      {
        id: 'dwg-s101',
        title: 'S-101 Foundation Beam Framing',
        subtitle: 'Structural Engineering Package',
        category: 'DRAWING SHEETS' as const,
        icon: HardHat,
        searchKey: 's-101 foundation beam framing structural engineering package'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/projects?project=MT-2024');
        },
      },
      {
        id: 'dwg-mat01',
        title: 'MAT-01 Material Spec Board',
        subtitle: 'Casa Verde Italian Carrara Marble Specs',
        category: 'DRAWING SHEETS' as const,
        icon: FileText,
        searchKey: 'mat-01 material spec board casa verde italian carrara marble specs'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/projects?project=CV-2024');
        },
      },
      // Comms Threads
      {
        id: 'thread-mt',
        title: '[MT-2024] Schematic Revision & Massing',
        subtitle: 'Active Studio Project Discussion Room',
        category: 'COMMS & THREADS' as const,
        icon: MessageSquare,
        searchKey: 'mt-2024 schematic revision massing discussion room comms'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/chat?thread=thread-001');
        },
      },
      {
        id: 'thread-cv',
        title: '[CV-2024] Material Board & Marble Specs',
        subtitle: 'Material Selection & Coordination',
        category: 'COMMS & THREADS' as const,
        icon: MessageSquare,
        searchKey: 'cv-2024 material board marble specs coordination comms'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/chat?thread=thread-002');
        },
      },
      {
        id: 'dm-maria',
        title: 'Direct Chat: Arch. Maria Cruz',
        subtitle: 'Senior Architect Coordination Channel',
        category: 'COMMS & THREADS' as const,
        icon: MessageSquare,
        searchKey: 'direct chat maria cruz senior architect coordination channel comms'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/chat?dm=Arch.%20Testing2');
        },
      },
      // Studio Actions
      {
        id: 'act-new-task',
        title: 'Initialize New Studio Task',
        subtitle: 'Create a deliverable, workshop or site visit assignment',
        category: 'STUDIO ACTIONS' as const,
        icon: Plus,
        searchKey: 'initialize new studio task create deliverable workshop site visit'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          window.dispatchEvent(new CustomEvent('open-task-modal'));
        },
      },
      {
        id: 'act-directory',
        title: 'Open Studio Staff Directory',
        subtitle: 'Architect roster, consultants, and contractors',
        category: 'STUDIO ACTIONS' as const,
        icon: BookUser,
        searchKey: 'open studio staff directory architect roster consultants contractors'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/directory');
        },
      },
      {
        id: 'act-sketch',
        title: 'Launch Sketch Studio & Redline Board',
        subtitle: 'High-Fidelity Architectural Ideation Canvas',
        category: 'STUDIO ACTIONS' as const,
        icon: PenTool,
        searchKey: 'launch sketch studio redline board ideation canvas cad drawing'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/sketch');
        },
      },
      {
        id: 'act-calendar',
        title: 'Open Studio Calendar & Site Visits',
        subtitle: 'Google Calendar Sync & Project Deadlines',
        category: 'STUDIO ACTIONS' as const,
        icon: Calendar,
        searchKey: 'open studio calendar site visits google calendar sync deadlines'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/calendar');
        },
      },
      {
        id: 'act-hr',
        title: 'File HR Request / Overtime / Reimbursement',
        subtitle: 'Attendance Ledgers & Partner Clearances',
        category: 'STUDIO ACTIONS' as const,
        icon: Clock,
        searchKey: 'file hr request overtime reimbursement attendance ledgers partner clearances'.toLowerCase(),
        action: () => {
          setIsOpen(false);
          router.push('/hr');
        },
      },
      {
        id: 'act-theme',
        title: `Switch Theme to ${themeMode === 'light' ? 'Night Light Mode' : 'Day Light Mode'}`,
        subtitle: 'Toggle Studio Color Scheme',
        category: 'STUDIO ACTIONS' as const,
        icon: themeMode === 'light' ? Moon : Sun,
        searchKey: 'switch theme night day dark mode color scheme'.toLowerCase(),
        action: () => {
          toggleThemeMode();
          setIsOpen(false);
        },
      },
    ];
  }, [router, themeMode, toggleThemeMode]);

  // Fast deferred filtering with precomputed index
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => item.searchKey.includes(normalizedQuery));
  }, [items, normalizedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-xs font-mono"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="bg-surface-main border-2 border-border-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-text-main transform-gpu will-change-transform">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-border-main flex items-center gap-3 bg-surface-hover/40">
          <Search className="w-5 h-5 text-accent-cyan shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="command-palette-search"
            name="command-palette-search"
            aria-label="Search studio command palette"
            placeholder="Search studio: projects, drawings, chats, actions..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-text-main placeholder:text-muted-main/60 font-semibold"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main">
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-muted-main hover:text-text-main cursor-pointer"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-border-main/20">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-main uppercase tracking-wider italic">
              No matching studio commands or drawings found
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-semibold'
                      : 'hover:bg-surface-hover text-text-main'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white dark:bg-black/20 dark:border-black/30 dark:text-black'
                          : 'bg-surface-hover border-border-main text-muted-main'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{item.title}</div>
                      {item.subtitle && (
                        <div
                          className={cn(
                            'text-[10px] truncate',
                            isSelected ? 'text-white/80 dark:text-black/80' : 'text-muted-main'
                          )}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        'text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase',
                        isSelected
                          ? 'bg-white/20 border-white/40 text-white dark:bg-black/20 dark:border-black/40 dark:text-black'
                          : 'bg-surface-hover border-border-main text-muted-main'
                      )}
                    >
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="p-3 border-t border-border-main bg-surface-hover/30 flex items-center justify-between text-[10px] text-muted-main uppercase font-bold">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3 text-accent-cyan" />
            <span>Studio Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
}
