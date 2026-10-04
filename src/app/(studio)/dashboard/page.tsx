'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';
import { useHRRequests } from '@/lib/hooks/useHRRequests';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { MOCK_PROJECTS } from '@/lib/constants';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { ThisWeekScheduleWidget } from '@/components/dashboard/ThisWeekScheduleWidget';
import { DraggableWidgetCard } from '@/components/dashboard/DraggableWidgetCard';
import {
  DashboardCustomizeModal,
  DashboardSectionConfig,
  DEFAULT_DASHBOARD_SECTIONS,
} from '@/components/dashboard/DashboardCustomizeModal';
import {
  DashboardWidgetConfig,
  DashboardWidgetId,
  DEFAULT_CANVAS_WIDGETS,
  WidgetColSpan,
  getProjectIdFromWidget,
} from '@/types/dashboardCanvas';
import {
  DashboardHero,
} from '@/features/dashboard/components/DashboardHero';
import {
  SchematicPinboardWidget,
} from '@/features/dashboard/components/SchematicPinboardWidget';
import {
  BiometricAttendanceWidget,
} from '@/features/dashboard/components/BiometricAttendanceWidget';
import {
  ProjectsShowcaseWidget,
  StandaloneProjectCardWidget,
} from '@/features/dashboard/components/ProjectsShowcaseWidget';
import {
  DashboardMessagesPreviewWidget,
} from '@/features/dashboard/components/DashboardMessagesPreviewWidget';
import {
  TasksKanbanWidget,
} from '@/features/dashboard/components/TasksKanbanWidget';

import {
  ClearanceLedgerWidget,
} from '@/features/dashboard/components/ClearanceLedgerWidget';
import {
  LayoutGrid,
  Split,
  Plus,
  Eye,
  CheckCircle2,
  Check,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const { requests } = useHRRequests();
  const {
    isClocked,
    startTime,
    elapsedTime,
    clockIn,
    clockOut,
    todayEntries,
    selectedProjectId,
    setSelectedProjectId,
  } = useClockIn();


  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [sections, setSections] = useState<DashboardSectionConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_DASHBOARD_SECTIONS;
    try {
      const saved = localStorage.getItem('arkipelago_dashboard_layout_preferences_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultMap = new Map(DEFAULT_DASHBOARD_SECTIONS.map((s) => [s.id, s]));
          const merged: DashboardSectionConfig[] = [];
          for (const item of parsed) {
            const def = defaultMap.get(item.id);
            if (def) {
              merged.push({ ...def, visible: item.visible ?? def.visible });
              defaultMap.delete(item.id);
            }
          }
          for (const remaining of defaultMap.values()) {
            merged.push(remaining);
          }
          return merged;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_DASHBOARD_SECTIONS;
  });

  // Canvas Workbench Drag & Drop and Resizing State
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<DashboardWidgetId | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<DashboardWidgetId | null>(null);

  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_CANVAS_WIDGETS;
    try {
      const saved = localStorage.getItem('arkipelago_dashboard_canvas_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultMap = new Map(DEFAULT_CANVAS_WIDGETS.map((w) => [w.id, w]));
          const merged: DashboardWidgetConfig[] = [];
          for (const item of parsed) {
            const def = defaultMap.get(item.id);
            if (def) {
              merged.push({
                ...def,
                colSpan: item.colSpan ?? def.colSpan,
                visible: item.visible ?? def.visible,
              });
              defaultMap.delete(item.id);
            } else if (item.id && typeof item.id === 'string' && item.id.startsWith('project-')) {
              merged.push(item);
            }
          }
          for (const remaining of defaultMap.values()) {
            merged.push(remaining);
          }
          return merged;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_CANVAS_WIDGETS;
  });

  const saveWidgets = (updated: DashboardWidgetConfig[]) => {
    setWidgets(updated);
    try {
      localStorage.setItem('arkipelago_dashboard_canvas_v3', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const visibleWidgets = useMemo(() => widgets.filter((w) => w.visible), [widgets]);
  const hiddenWidgets = useMemo(() => widgets.filter((w) => !w.visible), [widgets]);

  const handleWidthChange = (id: DashboardWidgetId, colSpan: WidgetColSpan) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, colSpan } : w));
    saveWidgets(updated);
  };

  const handleToggleHide = (id: DashboardWidgetId) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    saveWidgets(updated);
    setToastNotice({ message: 'Instrument moved to staging tray. Click to restore anytime.' });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleRestoreWidget = (id: DashboardWidgetId) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, visible: true } : w));
    saveWidgets(updated);
    setToastNotice({ message: 'Instrument restored to dashboard canvas.' });
    setTimeout(() => setToastNotice(null), 2500);
  };

  const handleResetCanvas = () => {
    saveWidgets(DEFAULT_CANVAS_WIDGETS);
    setToastNotice({ message: 'Dashboard canvas reset to studio default layout.' });
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Project Ordering & Individual Project Cards Management
  const [projectOrder, setProjectOrder] = useState<string[]>(() => {
    if (typeof window === 'undefined') return MOCK_PROJECTS.map((p) => p.id);
    try {
      const saved = localStorage.getItem('arkipelago_projects_order');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_PROJECTS.map((p) => p.id);
  });

  const saveProjectOrder = (order: string[]) => {
    setProjectOrder(order);
    try {
      localStorage.setItem('arkipelago_projects_order', JSON.stringify(order));
    } catch {
      // ignore
    }
  };

  const handleMoveProjectInBento = (projectId: string, direction: 'left' | 'right') => {
    const currentList = [...activeProjectsSorted];
    const index = currentList.findIndex((p) => p.id === projectId);
    if (index === -1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const [moved] = currentList.splice(index, 1);
    currentList.splice(targetIndex, 0, moved);
    saveProjectOrder(currentList.map((p) => p.id));
    setToastNotice({ message: `Reordered ${moved.name}.` });
    setTimeout(() => setToastNotice(null), 2000);
  };

  const handleAddProjectWidget = (projectId: string) => {
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    if (!project) return;
    const widgetId: DashboardWidgetId = `project-${projectId}`;
    const exists = widgets.find((w) => w.id === widgetId);
    if (exists) {
      if (!exists.visible) {
        handleRestoreWidget(widgetId);
      } else {
        setToastNotice({ message: `Project "${project.name}" is already placed on canvas.` });
        setTimeout(() => setToastNotice(null), 2500);
      }
      return;
    }

    const newWidget: DashboardWidgetConfig = {
      id: widgetId,
      label: `Project: ${project.name}`,
      category: 'Projects',
      colSpan: 4,
      visible: true,
      projectId,
    };

    saveWidgets([...widgets, newWidget]);
    setToastNotice({ message: `Placed "${project.name}" onto canvas.` });
    setTimeout(() => setToastNotice(null), 2500);
  };

  const handleSplitProjectsToIndividualCards = () => {
    let updated = widgets.map((w) => (w.id === 'activeProjects' ? { ...w, visible: false } : w));
    for (const p of activeProjectsSorted) {
      const widgetId: DashboardWidgetId = `project-${p.id}`;
      const existing = updated.find((w) => w.id === widgetId);
      if (existing) {
        updated = updated.map((w) => (w.id === widgetId ? { ...w, visible: true } : w));
      } else {
        updated.push({
          id: widgetId,
          label: `Project: ${p.name}`,
          category: 'Projects',
          colSpan: 4,
          visible: true,
          projectId: p.id,
        });
      }
    }
    saveWidgets(updated);
    setToastNotice({ message: 'Projects unbundled into 1-by-1 canvas cards!' });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const handleBundleProjectsToBento = () => {
    const updated = widgets.map((w) => {
      if (w.id === 'activeProjects') return { ...w, visible: true };
      if (w.id.startsWith('project-')) return { ...w, visible: false };
      return w;
    });
    saveWidgets(updated);
    setToastNotice({ message: 'Bundled project cards back into single Projects Bento.' });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const hasIndividualProjectWidgets = useMemo(
    () => widgets.some((w) => w.id.startsWith('project-') && w.visible),
    [widgets]
  );

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: DashboardWidgetId) => {
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, id: DashboardWidgetId) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: DashboardWidgetId) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    const currentList = [...widgets];
    const sourceIdx = currentList.findIndex((w) => w.id === draggedWidgetId);
    const targetIdx = currentList.findIndex((w) => w.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [draggedItem] = currentList.splice(sourceIdx, 1);
      currentList.splice(targetIdx, 0, draggedItem);
      saveWidgets(currentList);
      setToastNotice({ message: `Positioned ${draggedItem.label}.` });
      setTimeout(() => setToastNotice(null), 2500);
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleMoveStep = (id: DashboardWidgetId, direction: 'up' | 'down') => {
    const list = [...visibleWidgets];
    const index = list.findIndex((w) => w.id === id);
    if (index === -1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const fullList = [...widgets];
    const hidden = fullList.filter((w) => !w.visible);
    const reordered = [...list, ...hidden];
    saveWidgets(reordered);
  };

  const handleSaveSections = (newSections: DashboardSectionConfig[]) => {
    setSections(newSections);
    const sectionMap = new Map(newSections.map((s, idx) => [s.id, { visible: s.visible, order: idx }]));
    const updated = [...widgets].map((w) => {
      const match = sectionMap.get(w.id as DashboardSectionConfig['id']);
      return match ? { ...w, visible: match.visible } : w;
    });
    saveWidgets(updated);
    try {
      localStorage.setItem('arkipelago_dashboard_layout_preferences_v2', JSON.stringify(newSections));
      setToastNotice({
        message: 'Dashboard layout preferences updated!',
      });
      setTimeout(() => setToastNotice(null), 3000);
    } catch {
      // ignore
    }
  };

  const isPartner = user?.role === 'partner';
  const isSenior = user?.role === 'senior_architect';
  const isContractor = user?.role === 'contractor';
  const assignedCodes = user?.assignedProjectCodes;
  const userId = user?.id;
  const userName = user?.name;
  const canReviewRequests = isPartner || isSenior;

  const availableProjects = useMemo(() => {
    if (isContractor && assignedCodes) {
      return MOCK_PROJECTS.filter((p) => assignedCodes.includes(p.code));
    }
    return MOCK_PROJECTS;
  }, [isContractor, assignedCodes]);

  const inProgressTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const activeProjects = availableProjects.filter((p) => p.status === 'active');
  const activeProjectsSorted = useMemo(() => {
    const list = [...activeProjects];
    return list.sort((a, b) => {
      const idxA = projectOrder.indexOf(a.id);
      const idxB = projectOrder.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [activeProjects, projectOrder]);

  const pendingReviewRequests = useMemo(() => {
    if (!canReviewRequests) return [];
    return requests.filter(
      (r) => r.type !== 'submit_complaint' && r.status === 'pending' && r.userId !== userId
    );
  }, [canReviewRequests, requests, userId]);

  const myPendingRequests = useMemo(() => {
    if (canReviewRequests || isContractor) return [];
    return requests.filter(
      (r) =>
        r.type !== 'submit_complaint' &&
        r.status === 'pending' &&
        (r.userId === userId || (userName && r.userName?.toLowerCase() === userName.toLowerCase()))
    );
  }, [canReviewRequests, isContractor, requests, userId, userName]);

  const displayName = useMemo(() => {
    if (!user?.name) return 'Architect';
    const cleanName = user.name.replace(/^(Arch\.|Engr\.|Foreman)\s+/i, '');
    return cleanName.split(' ')[0] || 'Architect';
  }, [user?.name]);

  const [taskToConfirm, setTaskToConfirm] = useState<{
    task: (typeof tasks)[0];
    action: 'complete' | 'reopen';
  } | null>(null);

  const [toastNotice, setToastNotice] = useState<{
    message: string;
    undoTask?: (typeof tasks)[0];
    undoAction?: 'complete' | 'reopen';
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && taskToConfirm) {
        setTaskToConfirm(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskToConfirm]);

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
    setToastNotice({
      message: `Task "${newTaskData.name}" created successfully!`,
    });
    setTimeout(() => {
      setToastNotice(null);
    }, 4000);
  };

  const handleInitiateTaskToggle = (task: (typeof tasks)[0]) => {
    if (task.status !== 'COMPLETED') {
      setTaskToConfirm({ task, action: 'complete' });
    } else {
      setTaskToConfirm({ task, action: 'reopen' });
    }
  };

  const handleConfirmTaskToggle = () => {
    if (!taskToConfirm) return;
    const { task, action } = taskToConfirm;
    const nextStatus = action === 'complete' ? 'COMPLETED' : 'IN_PROGRESS';
    updateTaskStatus(task.id, nextStatus);

    setToastNotice({
      message: action === 'complete'
        ? `Task "${task.name}" marked as completed!`
        : `Task "${task.name}" reopened to active list.`,
      undoTask: task,
      undoAction: action,
    });
    setTaskToConfirm(null);

    setTimeout(() => {
      setToastNotice((prev) => (prev?.undoTask?.id === task.id ? null : prev));
    }, 5000);
  };

  const handleUndoTaskToggle = () => {
    if (!toastNotice?.undoTask) return;
    const originalStatus = toastNotice.undoAction === 'complete' ? 'IN_PROGRESS' : 'COMPLETED';
    updateTaskStatus(toastNotice.undoTask.id, originalStatus);
    setToastNotice(null);
  };

  const renderWidgetContent = (id: DashboardWidgetId) => {
    if (id.startsWith('project-')) {
      const projId = getProjectIdFromWidget(id);
      const project = availableProjects.find((p) => p.id === projId);
      if (!project) return null;
      return <StandaloneProjectCardWidget project={project} />;
    }

    switch (id) {
      case 'draftingBoard':
        return <SchematicPinboardWidget />;
      case 'weekSchedule':
        return (
          <ThisWeekScheduleWidget
            tasks={tasks}
            onInitiateTaskToggle={handleInitiateTaskToggle}
            onOpenTaskModal={() => setIsTaskModalOpen(true)}
          />
        );
      case 'timeTracker':
        return (
          <BiometricAttendanceWidget
            isClocked={isClocked}
            startTime={startTime}
            elapsedTime={elapsedTime}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            clockIn={clockIn}
            clockOut={clockOut}
            availableProjects={availableProjects}
            todayEntries={todayEntries}
          />

        );
      case 'activeProjects':
        return (
          <ProjectsShowcaseWidget
            activeProjectsSorted={activeProjectsSorted}
            isEditMode={isEditMode}
            onSplit={handleSplitProjectsToIndividualCards}
            onMoveLeft={(id) => handleMoveProjectInBento(id, 'left')}
            onMoveRight={(id) => handleMoveProjectInBento(id, 'right')}
            onPopOut={(id) => handleAddProjectWidget(id)}
          />
        );
      case 'messagesPreview':
        return <DashboardMessagesPreviewWidget />;
      case 'tasks':
        return (

          <TasksKanbanWidget
            inProgressTasks={inProgressTasks}
            completedTasks={completedTasks}
            onInitiateTaskToggle={handleInitiateTaskToggle}
            onOpenTaskModal={() => setIsTaskModalOpen(true)}
          />
        );
      case 'clearances':
        return (
          <ClearanceLedgerWidget
            canReviewRequests={canReviewRequests}
            isContractor={isContractor}
            pendingReviewRequests={pendingReviewRequests}
            myPendingRequests={myPendingRequests}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-7 py-2 font-sans pb-20 text-text-main px-3 sm:px-6 lg:px-8">
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <DashboardCustomizeModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        sections={sections}
        onSave={handleSaveSections}
      />

      {/* 1. HERO HORIZON */}
      <DashboardHero
        displayName={displayName}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onResetDefault={handleResetCanvas}
        onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
        inProgressTasksCount={inProgressTasks.length}
        activeProjectsCount={activeProjects.length}
        isClocked={isClocked}
        pendingReviewCount={pendingReviewRequests.length}
      />

      {/* 2. DYNAMIC WORKBENCH CANVAS EDIT TOOLBAR */}
      {isEditMode && (
        <div className="p-3.5 rounded-xl border border-accent-cyan/40 bg-accent-cyan/5 text-xs font-mono space-y-3 text-text-main animate-fade-in shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-accent-cyan shrink-0" />
              <span>
                <strong>Canvas Edit Mode Active:</strong> Drag widgets via <span className="font-bold">⠿</span> handle or drag borders to resize freely.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-xs hover:opacity-90 self-start md:self-auto cursor-pointer shadow-xs"
            >
              Done Editing
            </button>
          </div>

          {/* Quick Toolbar: Add Project 1-by-1, and Bento Bundle/Unbundle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-accent-cyan/20">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-main font-sans">
                Drag cards via <span className="font-bold font-mono">⠿</span> or drag borders to resize columns freely.
              </span>
            </div>

            {/* Right: Add Project 1-by-1 dropdown & Group/Ungroup */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Project 1-by-1 Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-main">Put Project 1-by-1:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddProjectWidget(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  aria-label="Choose project to put on canvas"
                  className="bg-surface-main border border-border-main text-text-main px-2.5 py-1 text-xs font-mono rounded-lg focus:outline-none focus:border-accent-cyan cursor-pointer"
                >
                  <option value="" disabled>+ Choose Project...</option>
                  {MOCK_PROJECTS.map((proj) => {
                    const isPlaced = visibleWidgets.some((w) => w.id === `project-${proj.id}`);
                    return (
                      <option key={proj.id} value={proj.id} disabled={isPlaced}>
                        {proj.code} — {proj.name} {isPlaced ? '(On Canvas)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {hasIndividualProjectWidgets ? (
                <button
                  type="button"
                  onClick={handleBundleProjectsToBento}
                  className="px-2.5 py-1 rounded-lg border border-border-main bg-surface-main hover:bg-surface-hover text-xs font-mono text-muted-main hover:text-text-main transition-colors cursor-pointer"
                  title="Bundle all individual project cards back into a single card"
                >
                  Bundle
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSplitProjectsToIndividualCards}
                  className="px-2.5 py-1 rounded-lg border border-border-main bg-surface-main hover:bg-surface-hover text-xs font-mono text-accent-cyan hover:underline transition-colors cursor-pointer flex items-center gap-1"
                  title="Split into individual 1-by-1 project cards"
                >
                  <Split className="w-3 h-3" />
                  <span>Split</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. BENTO GRID CANVAS */}
      <div className="relative">
        {/* Visual Alignment Container Boundary (Shown strictly while moving/dragging widgets) */}
        {Boolean(draggedWidgetId) && (
          <div
            data-testid="container-guide"
            className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-7xl border-2 border-dashed border-accent-cyan/30 rounded-2xl pointer-events-none -z-0 transition-opacity"
            aria-hidden="true"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
          {visibleWidgets.map((w, index) => (
            <DraggableWidgetCard
              key={w.id}
              widget={w}
              isEditMode={isEditMode}
              isDragging={draggedWidgetId === w.id}
              isDragOver={dragOverWidgetId === w.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onWidthChange={handleWidthChange}
              onToggleHide={handleToggleHide}
              onMoveUp={() => handleMoveStep(w.id, 'up')}
              onMoveDown={() => handleMoveStep(w.id, 'down')}
              canMoveUp={index > 0}
              canMoveDown={index < visibleWidgets.length - 1}
            >
              {renderWidgetContent(w.id)}
            </DraggableWidgetCard>
          ))}
        </div>
      </div>

      {/* 4. HIDDEN INSTRUMENTS STAGING TRAY */}
      {isEditMode && hiddenWidgets.length > 0 && (
        <div className="p-4 rounded-2xl border border-dashed border-border-main bg-surface-main/60 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-main flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-accent-cyan" />
              Staged Instruments &amp; Projects ({hiddenWidgets.length}) — Click to restore to canvas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map((hw) => (
              <button
                key={hw.id}
                type="button"
                onClick={() => handleRestoreWidget(hw.id)}
                className="px-3 py-1.5 rounded-lg border border-border-main bg-surface-hover hover:border-text-main text-xs font-mono flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              >
                <Plus className="w-3.5 h-3.5 text-accent-cyan" />
                <span>{hw.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. TASK COMPLETION CONFIRMATION MODAL */}
      {taskToConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setTaskToConfirm(null);
          }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="bg-surface-main border border-border-main rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative text-text-main font-mono cursor-default animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-main">
                  {taskToConfirm.action === 'complete' ? 'Mark Task as Completed?' : 'Reopen Task?'}
                </h3>
                <p className="text-xs text-muted-main leading-relaxed">
                  {taskToConfirm.action === 'complete'
                    ? 'Are you sure you want to sign off and mark this task as completed?'
                    : 'Are you sure you want to move this task back to In Progress?'}
                </p>
              </div>
            </div>

            {/* Task summary capsule */}
            <div className="p-3.5 rounded-xl border border-border-main bg-surface-hover/50 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-text-main truncate">
                  {taskToConfirm.task.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-main border border-border-main text-muted-main shrink-0">
                  {taskToConfirm.task.priority}
                </span>
              </div>
              <div className="text-[11px] text-muted-main flex items-center gap-3">
                <span>Phase: {taskToConfirm.task.projectPhase}</span>
                <span>•</span>
                <span>Assignee: {taskToConfirm.task.assignedMember}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setTaskToConfirm(null)}
                className="py-2.5 rounded-xl border border-border-main hover:bg-surface-hover active:scale-[0.98] transition-all text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTaskToggle}
                className="py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs active:scale-[0.98] transition-all shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{taskToConfirm.action === 'complete' ? 'Confirm & Complete' : 'Reopen Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FLOATING ACTION TOAST WITH UNDO */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-[120] max-w-sm w-full bg-surface-main border border-border-strong rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-3 text-text-main animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-xs font-semibold truncate">{toastNotice.message}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {toastNotice.undoTask && (
              <button
                onClick={handleUndoTaskToggle}
                className="text-xs font-bold text-accent-cyan hover:underline px-1 cursor-pointer"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => setToastNotice(null)}
              className="p-1 rounded-lg text-muted-main hover:text-text-main cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
