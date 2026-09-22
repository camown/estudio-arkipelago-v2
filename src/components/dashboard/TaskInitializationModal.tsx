'use client';

import React, { useState } from 'react';
import { X, ChevronDown, Sun, Moon } from 'lucide-react';
import { MOCK_PROJECTS, PRESET_ACCOUNTS } from '@/lib/constants';
import { TaskItem, TaskType, TaskPriority, ProjectPhase } from '@/types';
import { useTheme } from '@/lib/themeContext';

interface TaskInitializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: (task: Partial<TaskItem>) => void;
}

const PROJECT_PHASES: ProjectPhase[] = [
  'SCHEMATIC',
  'DESIGN DEVELOPMENT',
  'CONTRACT DOCUMENTS',
  'CONSTRUCTION ADMINISTRATION',
  'COMPLETION',
];

const DELIVERABLE_OPTIONS = [
  'SITE ANALYSIS & ZONING REPORT',
  'CONCEPTUAL FLOOR PLANS',
  '3D MASSING MODEL & RENDERS',
  'MATERIAL SELECTION BOARD',
  'STRUCTURAL & MEP COORDINATION',
  'CONSTRUCTION DRAWINGS SET',
  'BILL OF QUANTITIES (BOQ)',
  'SITE INSPECTION REPORT',
];

const TASK_TYPES: { id: TaskType; label: string; color: string }[] = [
  { id: 'MEETING', label: 'MEETING', color: 'bg-amber-400' },
  { id: 'WORKSHOP', label: 'WORKSHOP', color: 'bg-emerald-500' },
  { id: 'PRESENTATION', label: 'PRESENTATION', color: 'bg-rose-500' },
  { id: 'DEADLINE', label: 'DEADLINE', color: 'bg-orange-500' },
  { id: 'DELIVERABLE', label: 'DELIVERABLE', color: 'bg-blue-500' },
  { id: 'SITE_VISIT', label: 'SITE VISIT', color: 'bg-teal-600' },
];

const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'LOW', label: 'LOW', color: 'bg-amber-400' },
  { id: 'MEDIUM', label: 'MEDIUM', color: 'bg-orange-500' },
  { id: 'HIGH', label: 'HIGH', color: 'bg-rose-500' },
];

export function TaskInitializationModal({
  isOpen,
  onClose,
  onTaskCreated,
}: TaskInitializationModalProps) {
  const { themeMode, setThemeMode } = useTheme();
  const [taskName, setTaskName] = useState('');
  const [projectId, setProjectId] = useState(MOCK_PROJECTS[0]?.id || '');
  const [description, setDescription] = useState('');
  const [projectPhase, setProjectPhase] = useState<ProjectPhase>('SCHEMATIC');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [deliverablesQueueText, setDeliverablesQueueText] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('WORKSHOP');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedMember, setAssignedMember] = useState('NONE ASSIGNED');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');
  const [timeNeeded, setTimeNeeded] = useState('');
  const [isDeliverableDropdownOpen, setIsDeliverableDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const toggleDeliverable = (item: string) => {
    let updated: string[];
    if (selectedDeliverables.includes(item)) {
      updated = selectedDeliverables.filter((d) => d !== item);
    } else {
      updated = [...selectedDeliverables, item];
    }
    setSelectedDeliverables(updated);
    setDeliverablesQueueText(updated.join('\n'));
  };

  const handleCheckAllDeliverables = () => {
    if (selectedDeliverables.length === DELIVERABLE_OPTIONS.length) {
      setSelectedDeliverables([]);
      setDeliverablesQueueText('');
    } else {
      setSelectedDeliverables([...DELIVERABLE_OPTIONS]);
      setDeliverablesQueueText(DELIVERABLE_OPTIONS.join('\n'));
    }
  };

  const handleAssignToMe = () => {
    const currentUserStr = localStorage.getItem('arkipelago_user');
    if (currentUserStr) {
      try {
        const u = JSON.parse(currentUserStr);
        setAssignedMember(u.name.toUpperCase());
      } catch {
        setAssignedMember('CURRENT USER');
      }
    } else {
      setAssignedMember('CURRENT USER');
    }
  };

  const handleInitializeTask = () => {
    const newTask: Partial<TaskItem> = {
      name: taskName || 'UNTITLED TASK',
      projectId,
      description,
      projectPhase,
      deliverables: deliverablesQueueText
        ? deliverablesQueueText.split('\n').filter(Boolean)
        : selectedDeliverables,
      taskType,
      priority,
      assignedMember,
      startDate,
      endDate,
      timeNeeded,
      status: 'PENDING',
    };

    if (onTaskCreated) {
      onTaskCreated(newTask);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono overflow-y-auto">
      <div className="bg-[#262626] text-white border border-[#3F3F46] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#3F3F46]">
          <div className="flex items-center space-x-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E4E4E7]">
              TASK INITIALIZATION
            </h2>

            {/* Day Light / Night Light Mode Selector Switcher */}
            <div className="flex items-center bg-[#18181B] border border-[#3F3F46] rounded-lg p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`px-2 py-0.5 rounded-md flex items-center space-x-1 uppercase transition-all ${
                  themeMode === 'light'
                    ? 'bg-[#262626] text-white shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
                title="Switch to Day Light"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>DAY</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`px-2 py-0.5 rounded-md flex items-center space-x-1 uppercase transition-all ${
                  themeMode === 'dark'
                    ? 'bg-[#262626] text-white shadow-xs'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
                title="Switch to Night Light"
              >
                <Moon className="w-3 h-3 text-cyan-400" />
                <span>NIGHT</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TASK NAME */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
              TASK NAME
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="E.G. SITE SURVEY ANALYSIS"
              className="w-full bg-[#18181B] border-2 border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase tracking-wider placeholder-[#52525B]"
            />
          </div>

          {/* PROJECT */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
              PROJECT
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl appearance-none pr-10 focus:outline-none uppercase font-bold"
              >
                {MOCK_PROJECTS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#18181B] text-white">
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-[#A1A1AA] pointer-events-none" />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
              DESCRIPTION
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about the task..."
              className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none resize-none placeholder-[#52525B]"
            />
          </div>

          {/* PROJECT PHASE & DELIVERABLES ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PROJECT PHASE */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                PROJECT PHASE
              </label>
              <div className="relative">
                <select
                  value={projectPhase}
                  onChange={(e) => setProjectPhase(e.target.value as ProjectPhase)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl appearance-none pr-10 focus:outline-none uppercase font-bold"
                >
                  {PROJECT_PHASES.map((phase) => (
                    <option key={phase} value={phase} className="bg-[#18181B] text-white">
                      {phase}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-[#A1A1AA] pointer-events-none" />
              </div>
            </div>

            {/* DELIVERABLES (DROPDOWN MULTI-SELECT) */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                  DELIVERABLES
                </label>
                <button
                  type="button"
                  onClick={handleCheckAllDeliverables}
                  className="text-[10px] font-extrabold uppercase text-cyan-400 hover:underline"
                >
                  CHECK ALL
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDeliverableDropdownOpen(!isDeliverableDropdownOpen)}
                className="w-full bg-[#18181B] border border-[#3F3F46] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl flex items-center justify-between font-bold"
              >
                <span className="truncate">
                  {selectedDeliverables.length > 0
                    ? `${selectedDeliverables.length} SELECTED`
                    : '-- CLICK TO TOGGLE SELECTION --'}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 text-[#A1A1AA]" />
              </button>

              {/* Multi-select dropdown popover */}
              {isDeliverableDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#18181B] border border-[#3F3F46] z-20 max-h-48 overflow-y-auto p-2 shadow-2xl rounded-xl space-y-1">
                  {DELIVERABLE_OPTIONS.map((item) => (
                    <label
                      key={item}
                      className="flex items-center space-x-2 text-[11px] font-bold p-2 hover:bg-[#262626] rounded-lg cursor-pointer uppercase text-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDeliverables.includes(item)}
                        onChange={() => toggleDeliverable(item)}
                        className="rounded border-[#3F3F46] text-cyan-400 focus:ring-0"
                      />
                      <span className="truncate">{item}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SELECTED DELIVERABLES QUEUE (ONE PER LINE) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
              SELECTED DELIVERABLES QUEUE (ONE PER LINE)
            </label>
            <textarea
              rows={3}
              value={deliverablesQueueText}
              onChange={(e) => setDeliverablesQueueText(e.target.value)}
              placeholder="SELECT ITEMS FROM DROPDOWN ABOVE, OR TYPE CUSTOM ONES HERE..."
              className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none resize-none placeholder-[#52525B]"
            />
          </div>

          {/* TASK TYPE & PRIORITY ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* TASK TYPE GRID */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                TASK TYPE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TASK_TYPES.map((t) => {
                  const isSelected = taskType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTaskType(t.id)}
                      className={`flex items-center space-x-2 px-3 py-2 border text-[10px] font-extrabold uppercase transition-all rounded-xl ${
                        isSelected
                          ? 'border-[#0284C7] bg-[#0284C7]/20 text-white'
                          : 'border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${t.color}`} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIORITY GRID */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                PRIORITY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`flex items-center justify-center space-x-1.5 px-2 py-2 border text-[10px] font-extrabold uppercase transition-all rounded-xl ${
                        isSelected
                          ? 'border-[#0284C7] bg-[#0284C7]/20 text-white'
                          : 'border-[#3F3F46] bg-[#18181B] text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${p.color}`} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ASSIGNED MEMBER */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                ASSIGNED MEMBER
              </label>
              <button
                type="button"
                onClick={handleAssignToMe}
                className="text-[10px] font-extrabold uppercase text-cyan-400 hover:underline"
              >
                (ASSIGN TO ME)
              </button>
            </div>
            <div className="relative">
              <select
                value={assignedMember}
                onChange={(e) => setAssignedMember(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl appearance-none pr-10 focus:outline-none uppercase font-bold"
              >
                <option value="NONE ASSIGNED" className="bg-[#18181B] text-white">NONE ASSIGNED</option>
                {PRESET_ACCOUNTS.map((acc) => (
                  <option key={acc.email} value={acc.name.toUpperCase()} className="bg-[#18181B] text-white">
                    {acc.name.toUpperCase()} ({acc.role.replace('_', ' ').toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-[#A1A1AA] pointer-events-none" />
            </div>
          </div>

          {/* DATES CONFIGURATION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#3F3F46] pb-1">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                DATES CONFIGURATION
              </label>
              <span className="text-[10px] font-bold border border-[#3F3F46] px-2 py-0.5 uppercase bg-[#18181B] text-[#A1A1AA] rounded-md">
                SINGLE DATE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* START DATE */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#A1A1AA] uppercase">
                  START DATE
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] p-2.5 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase"
                />
              </div>

              {/* END DATE (OPTIONAL) */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#A1A1AA] uppercase">
                  END DATE (OPTIONAL)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] p-2.5 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase"
                />
              </div>

              {/* TIME NEEDED */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#A1A1AA] uppercase">
                  TIME NEEDED
                </label>
                <input
                  type="time"
                  value={timeNeeded}
                  onChange={(e) => setTimeNeeded(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] p-2.5 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 border-t border-[#3F3F46] bg-[#262626] grid grid-cols-2 gap-4">
          <button
            onClick={handleInitializeTask}
            className="py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-md"
          >
            CREATE
          </button>
          <button
            onClick={onClose}
            className="py-3 bg-[#3F3F46]/60 border border-[#52525B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-[#3F3F46] transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
