'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Marquee } from '@/components/common/Marquee';
import { Check, SlidersHorizontal, LayoutGrid, RotateCcw } from 'lucide-react';

interface DashboardHeroProps {
  displayName: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onResetDefault: () => void;
  onOpenCustomizeModal: () => void;
  inProgressTasksCount: number;
  activeProjectsCount: number;
  isClocked: boolean;
  pendingReviewCount: number;
}

export function DashboardHero({
  displayName,
  isEditMode,
  onToggleEditMode,
  onResetDefault,
  onOpenCustomizeModal,
  inProgressTasksCount,
  activeProjectsCount,
  isClocked,
  pendingReviewCount,
}: DashboardHeroProps) {
  return (
    <section className="animate-fade-in-up border-b border-border-main/60 pb-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-text-main">
            Mabuhay, {displayName}.
          </h1>
          <p className="text-xs sm:text-sm text-muted-main font-sans">
            Studio overview for today.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isEditMode && (
            <button
              type="button"
              onClick={onResetDefault}
              className="px-3 py-1.5 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover text-xs font-mono text-muted-main hover:text-text-main transition-colors cursor-pointer"
              title="Reset dashboard widgets to default layout"
            >
              Reset Default
            </button>
          )}

          <button
            type="button"
            onClick={onToggleEditMode}
            className={cn(
              'px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-2xs cursor-pointer active:scale-[0.98]',
              isEditMode
                ? 'bg-accent-cyan text-black border-accent-cyan ring-2 ring-accent-cyan/30 font-bold'
                : 'border-border-main hover:border-text-main bg-surface-main hover:bg-surface-hover text-text-main'
            )}
            title={isEditMode ? 'Lock dashboard layout' : 'Arrange and resize widgets directly on canvas'}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Lock Layout</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Arrange Dashboard</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCustomizeModal}
            className="px-3.5 py-1.5 rounded-xl border border-border-main hover:border-text-main bg-surface-main hover:bg-surface-hover text-xs font-mono font-semibold transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
            title="Configure widget visibility and order presets"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-main" />
            <span className="hidden sm:inline">Presets</span>
          </button>
        </div>
      </div>

      {/* Real-time Studio Marquee Horizon */}
      <div className="w-full bg-surface-main/80 border border-border-main/50 rounded-xl py-1.5 px-3 overflow-hidden text-xs font-mono text-muted-main flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20 shrink-0">
          Studio Status
        </span>
        <div className="flex-1 overflow-hidden">
          <Marquee className="gap-8 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Biometric Sync: {isClocked ? 'Clocked In (Active)' : 'Standby / Idle'}</span>
            </div>
            <span className="text-border-main mx-2">|</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
              <span>Active Delivery: {activeProjectsCount} Projects on Deck</span>
            </div>
            <span className="text-border-main mx-2">|</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Deliverables: {inProgressTasksCount} Pending Tasks</span>
            </div>
            {pendingReviewCount > 0 && (
              <>
                <span className="text-border-main mx-2">|</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-rose-500 font-bold">{pendingReviewCount} HR Submittals In Review</span>
                </div>
              </>
            )}
            <span className="text-border-main mx-2">|</span>
          </Marquee>
        </div>
      </div>
    </section>
  );
}
