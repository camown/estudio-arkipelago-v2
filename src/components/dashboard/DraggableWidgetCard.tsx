'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  GripVertical,
  EyeOff,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardWidgetConfig, WidgetColSpan } from '@/types/dashboardCanvas';

interface DraggableWidgetCardProps {
  widget: DashboardWidgetConfig;
  isEditMode: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent, id: DashboardWidgetConfig['id']) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent, id: DashboardWidgetConfig['id']) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: DashboardWidgetConfig['id']) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onWidthChange: (id: DashboardWidgetConfig['id'], colSpan: WidgetColSpan) => void;
  onToggleHide: (id: DashboardWidgetConfig['id']) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  children: React.ReactNode;
}

const COL_SPAN_CLASSES: Record<number, string> = {
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12',
};

export function DraggableWidgetCard({
  widget,
  isEditMode,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  onWidthChange,
  onToggleHide,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}: DraggableWidgetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [previewColSpan, setPreviewColSpan] = useState<WidgetColSpan | null>(null);

  const activeColSpan = previewColSpan ?? widget.colSpan;
  const colClass = COL_SPAN_CLASSES[activeColSpan] || 'lg:col-span-12';

  // Interactive Drag-to-Resize Logic
  const handleResizeStart = useCallback((clientX: number) => {
    if (!cardRef.current) return;
    const cardEl = cardRef.current;
    const parentGrid = cardEl.parentElement;
    if (!parentGrid) return;

    setIsResizing(true);
    const parentRect = parentGrid.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    const colWidth = parentRect.width / 12;

    const onMove = (moveClientX: number) => {
      const currentWidth = moveClientX - cardRect.left;
      const rawCols = Math.round(currentWidth / colWidth);
      const clampedCols = Math.min(12, Math.max(3, rawCols)) as WidgetColSpan;
      setPreviewColSpan(clampedCols);
    };

    const onMouseMove = (e: MouseEvent) => {
      onMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX);
    };

    const onEnd = () => {
      setIsResizing(false);
      setPreviewColSpan((finalSpan) => {
        if (finalSpan && finalSpan !== widget.colSpan) {
          onWidthChange(widget.id, finalSpan);
        }
        return null;
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [widget.id, widget.colSpan, onWidthChange]);

  return (
    <div
      ref={cardRef}
      id={`widget-${widget.id}`}
      draggable={isEditMode && !isResizing}
      onDragStart={(e) => onDragStart(e, widget.id)}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, widget.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, widget.id)}
      onDragEnd={onDragEnd}
      className={cn(
        'transition-all duration-200 relative group flex flex-col',
        colClass,
        isEditMode && 'rounded-2xl ring-1 ring-border-main/80 hover:ring-accent-cyan/80 bg-surface-main/30',
        isDragging && 'opacity-30 scale-[0.98] ring-2 ring-accent-cyan',
        isDragOver && 'ring-2 ring-accent-cyan bg-accent-cyan/5 scale-[0.99]',
        isResizing && 'select-none ring-2 ring-accent-cyan'
      )}
    >
      {/* Sleek Minimalist Notion-style Floating Handle Pill (Visible in Edit Mode) */}
      {isEditMode && (
        <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1 bg-surface-main/95 backdrop-blur-md border border-border-main/90 shadow-md rounded-lg p-1 text-xs font-mono select-none animate-fade-in">
          {/* 6-Dot Drag Grip */}
          <div
            className="p-1 cursor-grab active:cursor-grabbing text-muted-main hover:text-accent-cyan transition-colors"
            title="Drag to reposition widget"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>

          {/* Mobile Step Arrows */}
          <div className="flex items-center md:hidden border-l border-border-main pl-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="p-0.5 text-muted-main hover:text-text-main disabled:opacity-30"
              aria-label="Move widget up"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="p-0.5 text-muted-main hover:text-text-main disabled:opacity-30 border-l border-border-main"
              aria-label="Move widget down"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Hide Button */}
          <button
            type="button"
            onClick={() => onToggleHide(widget.id)}
            className="p-1 rounded hover:bg-surface-hover text-muted-main hover:text-rose-500 transition-colors cursor-pointer border-l border-border-main"
            title="Stow instrument into staging tray"
            aria-label={`Hide ${widget.label}`}
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Actual Instrument Widget Content */}
      <div className="flex-1 w-full h-full">{children}</div>

      {/* Right Edge Interactive Drag-to-Resize Handle */}
      {isEditMode && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResizeStart(e.clientX);
          }}
          onTouchStart={(e) => {
            if (e.touches[0]) handleResizeStart(e.touches[0].clientX);
          }}
          className={cn(
            'hidden lg:flex absolute top-4 bottom-4 -right-2 w-4 cursor-col-resize z-40 items-center justify-center group/resizer transition-all',
            isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
          title="Drag horizontally to resize column width"
          aria-label="Drag to resize column width"
        >
          <div
            className={cn(
              'w-1.5 rounded-full transition-all duration-150',
              isResizing
                ? 'h-20 bg-accent-cyan ring-4 ring-accent-cyan/30 shadow-md'
                : 'h-10 bg-border-strong group-hover/resizer:bg-accent-cyan group-hover/resizer:h-16'
            )}
          />

          {/* Floating Resize Columns Tooltip while dragging */}
          {isResizing && (
            <div className="absolute right-6 px-2 py-1 rounded bg-black/90 text-white font-mono text-[10px] whitespace-nowrap shadow-lg border border-white/20">
              {Math.round((activeColSpan / 12) * 100)}%
            </div>
          )}
        </div>
      )}

      {/* Bottom-Right Corner Resize Grip Indicator */}
      {isEditMode && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResizeStart(e.clientX);
          }}
          className={cn(
            'hidden lg:block absolute bottom-1.5 right-1.5 p-1 cursor-col-resize z-30 transition-all',
            isResizing ? 'text-accent-cyan scale-125' : 'text-muted-main/40 group-hover:text-accent-cyan hover:scale-120'
          )}
          title="Drag horizontally to resize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="stroke-current">
            <line x1="8" y1="2" x2="2" y2="8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="5" x2="5" y2="9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="8" x2="8" y2="9" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
