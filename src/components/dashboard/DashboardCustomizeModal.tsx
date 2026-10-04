'use client';

import React from 'react';
import {
  SlidersHorizontal,
  X,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Check,
  Layout,
  Briefcase,
  Compass,
  FileCheck,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DashboardSectionKey =
  | 'draftingBoard'
  | 'weekSchedule'
  | 'timeTracker'
  | 'activeProjects'
  | 'messagesPreview'
  | 'tasks'
  | 'clearances';

export interface DashboardSectionConfig {
  id: DashboardSectionKey;
  label: string;
  category: 'Review & Schedule' | 'Operations' | 'Projects & Delivery';
  description: string;
  iconName: 'Compass' | 'Calendar' | 'Clock' | 'Layers' | 'FileCheck' | 'Briefcase' | 'Layout';
  visible: boolean;
}

export const DEFAULT_DASHBOARD_SECTIONS: DashboardSectionConfig[] = [
  {
    id: 'draftingBoard',
    label: 'Schematic Pinboard & Drawing Review',
    category: 'Review & Schedule',
    description: 'High-res CAD & architectural schematic markup viewer with structural & MEP callouts.',
    iconName: 'Compass',
    visible: true,
  },
  {
    id: 'weekSchedule',
    label: "This Week's Schedule & To-Dos",
    category: 'Review & Schedule',
    description: '7-day agenda with site inspection buffers, client reviews, and direct task checkboxes.',
    iconName: 'Calendar',
    visible: true,
  },
  {
    id: 'timeTracker',
    label: 'Biometric Attendance & Time Tracker',
    category: 'Operations',
    description: 'Real-time studio hours logging, project allocation, and Philippine labor compliant tracking.',
    iconName: 'Clock',
    visible: true,
  },
  {
    id: 'activeProjects',
    label: 'Active Projects Bento & Milestones',
    category: 'Projects & Delivery',
    description: '5-stage architectural billing progress, site locations, and client contract values (₱).',
    iconName: 'Layers',
    visible: true,
  },
  {
    id: 'messagesPreview',
    label: 'Studio Comms & Live Message Preview',
    category: 'Projects & Delivery',
    description: 'Live studio thread previews, unread message indicators, and direct chat navigation.',
    iconName: 'Layout',
    visible: true,
  },
  {
    id: 'tasks',
    label: 'Studio Deliverables & Task Checklist',
    category: 'Projects & Delivery',
    description: 'Active design deliverables, drafting status, priority badges, and quick completion.',
    iconName: 'FileCheck',
    visible: true,
  },
  {
    id: 'clearances',
    label: 'Clearances & Studio Approvals',
    category: 'Operations',
    description: 'Partner and Senior Architect reviews for drawings, OT, site visits, and leaves.',
    iconName: 'Briefcase',
    visible: true,
  },
];


interface DashboardCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: DashboardSectionConfig[];
  onSave: (sections: DashboardSectionConfig[]) => void;
}

export function DashboardCustomizeModal({
  isOpen,
  onClose,
  sections,
  onSave,
}: DashboardCustomizeModalProps) {
  const [localSections, setLocalSections] = React.useState<DashboardSectionConfig[]>(sections);

  React.useEffect(() => {
    setLocalSections(sections);
  }, [sections, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (id: DashboardSectionKey) => {
    setLocalSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localSections.length) return;

    const updated = [...localSections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setLocalSections(updated);
  };

  const handleResetToDefault = () => {
    setLocalSections(DEFAULT_DASHBOARD_SECTIONS);
  };

  const handleApplyPreset = (preset: 'architect' | 'manager' | 'minimal') => {
    if (preset === 'architect') {
      // Focus on drawings & week schedule & tasks
      setLocalSections([
        { ...DEFAULT_DASHBOARD_SECTIONS[0], visible: true }, // draftingBoard
        { ...DEFAULT_DASHBOARD_SECTIONS[1], visible: true }, // weekSchedule
        { ...DEFAULT_DASHBOARD_SECTIONS[4], visible: true }, // tasks
        { ...DEFAULT_DASHBOARD_SECTIONS[3], visible: true }, // activeProjects
        { ...DEFAULT_DASHBOARD_SECTIONS[2], visible: false }, // timeTracker
        { ...DEFAULT_DASHBOARD_SECTIONS[5], visible: false }, // clearances
      ]);
    } else if (preset === 'manager') {
      // Focus on projects, schedule, time tracking & clearances
      setLocalSections([
        { ...DEFAULT_DASHBOARD_SECTIONS[1], visible: true }, // weekSchedule
        { ...DEFAULT_DASHBOARD_SECTIONS[3], visible: true }, // activeProjects
        { ...DEFAULT_DASHBOARD_SECTIONS[4], visible: true }, // tasks
        { ...DEFAULT_DASHBOARD_SECTIONS[5], visible: true }, // clearances
        { ...DEFAULT_DASHBOARD_SECTIONS[2], visible: true }, // timeTracker
        { ...DEFAULT_DASHBOARD_SECTIONS[0], visible: false }, // draftingBoard
      ]);
    } else {
      // Minimal
      setLocalSections([
        { ...DEFAULT_DASHBOARD_SECTIONS[0], visible: true },
        { ...DEFAULT_DASHBOARD_SECTIONS[1], visible: true },
        { ...DEFAULT_DASHBOARD_SECTIONS[2], visible: false },
        { ...DEFAULT_DASHBOARD_SECTIONS[3], visible: false },
        { ...DEFAULT_DASHBOARD_SECTIONS[4], visible: true },
        { ...DEFAULT_DASHBOARD_SECTIONS[5], visible: false },
      ]);
    }
  };

  const handleSaveAndClose = () => {
    onSave(localSections);
    onClose();
  };

  const renderIcon = (name: DashboardSectionConfig['iconName']) => {
    switch (name) {
      case 'Compass':
        return <Compass className="w-4 h-4 text-accent-cyan" />;
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'FileCheck':
        return <FileCheck className="w-4 h-4 text-purple-400" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4 text-rose-400" />;
      default:
        return <Layout className="w-4 h-4 text-text-main" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-surface-main border border-border-main rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-dashboard-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-main flex items-center justify-between shrink-0 bg-surface-main/80 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center text-accent-cyan">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="customize-dashboard-title"
                className="text-sm font-bold text-text-main font-sans tracking-tight"
              >
                Customize Studio Dashboard
              </h2>
              <p className="text-[11px] text-muted-main font-mono">
                Toggle visibility, reorder sections, and tailor your workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-main hover:text-text-main hover:bg-surface-hover transition-colors"
            aria-label="Close customizer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="px-6 py-2.5 bg-surface-hover/50 border-b border-border-main/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] font-mono text-muted-main font-medium">Quick Presets:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleApplyPreset('architect')}
              className="px-2.5 py-1 text-[11px] font-mono rounded-md border border-border-main bg-surface-main hover:bg-surface-hover text-text-main transition-colors"
            >
              Drafting Lead
            </button>
            <button
              onClick={() => handleApplyPreset('manager')}
              className="px-2.5 py-1 text-[11px] font-mono rounded-md border border-border-main bg-surface-main hover:bg-surface-hover text-text-main transition-colors"
            >
              Project Lead
            </button>
            <button
              onClick={() => handleApplyPreset('minimal')}
              className="px-2.5 py-1 text-[11px] font-mono rounded-md border border-border-main bg-surface-main hover:bg-surface-hover text-text-main transition-colors"
            >
              Focused
            </button>
          </div>
        </div>

        {/* Section List (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-2.5 divide-y divide-border-main/40">
          {localSections.map((section, index) => {
            const isFirst = index === 0;
            const isLast = index === localSections.length - 1;

            return (
              <div
                key={section.id}
                className={cn(
                  'pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-xl border transition-all',
                  section.visible
                    ? 'bg-surface-hover/30 border-border-main'
                    : 'bg-surface-main/30 border-border-main/40 opacity-60'
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface-main border border-border-main flex items-center justify-center shrink-0 mt-0.5">
                    {renderIcon(section.iconName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-sans text-text-main truncate">
                        {section.label}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-hover border border-border-main text-muted-main shrink-0">
                        {section.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-main font-sans mt-0.5 line-clamp-1">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Move Up/Down */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => handleMove(index, 'up')}
                      className={cn(
                        'p-1 rounded text-muted-main hover:text-text-main transition-colors',
                        isFirst && 'opacity-20 cursor-not-allowed'
                      )}
                      aria-label={`Move ${section.label} up`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => handleMove(index, 'down')}
                      className={cn(
                        'p-1 rounded text-muted-main hover:text-text-main transition-colors',
                        isLast && 'opacity-20 cursor-not-allowed'
                      )}
                      aria-label={`Move ${section.label} down`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleToggle(section.id)}
                    className={cn(
                      'p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-mono',
                      section.visible
                        ? 'border-border-main bg-surface-main text-text-main hover:bg-surface-hover'
                        : 'border-border-main/50 bg-surface-hover/20 text-muted-main'
                    )}
                    aria-label={`Toggle visibility of ${section.label}`}
                  >
                    {section.visible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                        <span className="hidden sm:inline">Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-muted-main" />
                        <span className="hidden sm:inline">Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-main bg-surface-main/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-muted-main hover:text-text-main transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-muted-main hover:text-text-main transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
