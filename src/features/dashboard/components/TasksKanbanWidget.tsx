'use client';

import React from 'react';
import { TaskItem } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Circle, CheckCircle2 } from 'lucide-react';

interface TasksKanbanWidgetProps {
  inProgressTasks: TaskItem[];
  completedTasks: TaskItem[];
  onInitiateTaskToggle: (task: TaskItem) => void;
  onOpenTaskModal: () => void;
}

export function TasksKanbanWidget({
  inProgressTasks,
  completedTasks,
  onInitiateTaskToggle,
  onOpenTaskModal,
}: TasksKanbanWidgetProps) {
  return (
    <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-main/50 pb-3">
          <div>
            <h2 className="text-base font-bold font-sans text-text-main">
              Tasks
            </h2>
            <span className="text-[11px] text-muted-main">
              {inProgressTasks.length} active • {completedTasks.length} completed
            </span>
          </div>

          <button
            onClick={onOpenTaskModal}
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
                  onClick={() => onInitiateTaskToggle(task)}
                  className="p-3.5 rounded-xl border border-border-main/70 bg-surface-hover/30 hover:bg-surface-hover transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInitiateTaskToggle(task);
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
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-main font-mono pt-0.5 whitespace-nowrap overflow-hidden">
                        <span className="capitalize shrink-0">{task.projectPhase?.toLowerCase()}</span>
                        <span className="shrink-0">•</span>
                        <span className="truncate">{task.assignedMember}</span>
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
      </div>

      {completedTasks.length > 0 && (
        <div className="pt-2 text-[11px] text-muted-main border-t border-border-main/40 font-mono">
          <span>✓ {completedTasks.length} completed today</span>
        </div>
      )}
    </div>
  );
}
