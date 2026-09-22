'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import Logo from '@/components/ui/Logo';
import CalendarGrid from '@/components/dashboard/CalendarGrid';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
import { TaskItem } from '@/types';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  BookUser,
  Mail,
  ArrowRight,
  Clock,
  Pencil,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const userName = user?.name ? user.name.toUpperCase() : 'TESTING3';
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const handleTaskCreated = (newTaskData: Partial<TaskItem>) => {
    const created: TaskItem = {
      id: 'task-' + Date.now(),
      name: newTaskData.name || 'UNTITLED TASK',
      projectId: newTaskData.projectId || '',
      description: newTaskData.description || '',
      projectPhase: newTaskData.projectPhase || 'SCHEMATIC',
      deliverables: newTaskData.deliverables || [],
      taskType: newTaskData.taskType || 'WORKSHOP',
      priority: newTaskData.priority || 'MEDIUM',
      assignedMember: newTaskData.assignedMember || 'UNASSIGNED',
      startDate: newTaskData.startDate,
      endDate: newTaskData.endDate,
      timeNeeded: newTaskData.timeNeeded,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [created, ...prev]);
  };

  return (
    <div className="space-y-8 font-mono pb-12">
      {/* Task Initialization Modal */}
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* 1. Header Banner with Studio Logo & Welcome Message (Matching Image 3) */}
      <div className="flex flex-col items-center justify-center text-center py-6 space-y-3 relative">
        <Logo size={56} className="text-text-main" />
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.2em] uppercase text-text-main">
            ESTUDIO ARKIPELAGO
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-muted-main uppercase">
            WELCOME, {userName}!
          </p>
        </div>

        {/* Task Initialization Quick Action Button */}
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="mt-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 rounded-lg shadow-sm hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          INITIALIZE TASK
        </button>
      </div>

      {/* 2. Quotation / Weekly Studio Inspiration Box (Matching Image 3) */}
      <div className="max-w-2xl mx-auto bg-surface-main border border-border-main p-6 sm:p-8 rounded-xl shadow-sm text-center space-y-3">
        <p className="italic text-sm sm:text-base font-serif text-text-main leading-relaxed">
          &quot;I am the master of my fate, I am the captain of my soul.&quot; - William Ernest Henley
        </p>
        <div className="text-[11px] font-bold text-muted-main uppercase tracking-widest flex items-center justify-center gap-1.5 pt-2 border-t border-border-main/50">
          <span>WEEKLY STUDIO INSPIRATION</span>
          <Pencil className="w-3 h-3" />
        </div>
      </div>

      {/* 3. Navigation Cards Row (Matching Image 3 Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Dashboard */}
        <Link href="/dashboard" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <LayoutDashboard className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-border-strong text-muted-main rounded uppercase tracking-wider">
                PROD
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-main mb-1">
                DASHBOARD
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Review shared tasks, check the project calendar and schedules.
              </p>
            </div>
            <div className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 uppercase tracking-widest pt-2">
              ACCESS <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Card 2: Projects Management */}
        <Link href="/projects" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <FolderKanban className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 rounded uppercase tracking-wider">
                ACTIVE
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-main mb-1">
                PROJECTS MANAGEMENT
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Explore folders, schematics, and material boards.
              </p>
            </div>
            <div className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 uppercase tracking-widest pt-2">
              ACCESS <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Card 3: Estudio Wall & Chat */}
        <Link href="/chat" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <MessageSquare className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-amber-500/50 text-amber-600 dark:text-amber-400 rounded uppercase tracking-wider">
                COMMS
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-main mb-1">
                ESTUDIO WALL & CHAT
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Connect with team members or start threads & group messages.
              </p>
            </div>
            <div className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 uppercase tracking-widest pt-2">
              ACCESS <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Card 4: Specialty Directory */}
        <Link href="/directory" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <BookUser className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-rose-500/50 text-rose-600 dark:text-rose-400 rounded uppercase tracking-wider">
                TEAM
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-main mb-1">
                SPECIALTY DIRECTORY
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Find consultants, engineers, suppliers, and site builders.
              </p>
            </div>
            <div className="text-xs font-bold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 uppercase tracking-widest pt-2">
              ACCESS <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </div>

      {/* 4. Two-Column Calendar & Task Queue Section (Matching Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Calendar Preview - 7 cols) */}
        <div className="lg:col-span-7">
          <CalendarGrid />
        </div>

        {/* Right Column (Priority Task Queue - 5 cols) */}
        <div className="lg:col-span-5 bg-surface-main border border-border-main rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-main pb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-main">
                PRIORITY TASK QUEUE
              </h3>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="text-[11px] font-bold text-accent-cyan hover:underline transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              + NEW TASK
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border border-border-main bg-surface-hover/60 rounded-lg space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase text-text-main truncate">
                      {task.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                          : task.priority === 'MEDIUM'
                          ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-[11px] text-muted-main line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-muted-main font-bold pt-1 uppercase border-t border-border-main/40">
                    <span>TYPE: {task.taskType}</span>
                    <span>PHASE: {task.projectPhase}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-xs text-muted-main italic tracking-wide uppercase">
                NO ACTIVE HIGH-PRIORITY TASKS IN YOUR QUEUE
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 border border-border-strong hover:border-text-main text-xs font-bold uppercase rounded tracking-wider transition-all"
              >
                + INITIALIZE FIRST TASK
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Gmail Inbox Section (Matching Image 3) */}
      <div className="bg-surface-main border border-border-main rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border-main pb-4 mb-6">
          <Mail className="w-4 h-4 text-text-main" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-main">
            GMAIL INBOX
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-10 space-y-4 max-w-md mx-auto">
          <Mail className="w-10 h-10 text-muted-main/40" strokeWidth={1.5} />
          <p className="text-xs text-muted-main uppercase tracking-wider leading-relaxed">
            CONNECT YOUR GMAIL ACCOUNT TO VIEW YOUR INBOX DIRECTLY FROM THE DASHBOARD.
          </p>
          <button className="px-6 py-3 border-2 border-border-strong hover:border-text-main bg-surface-hover hover:bg-surface-main transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-2 rounded-lg shadow-xs">
            <span className="font-serif italic font-bold text-base leading-none">G</span>
            CONNECT GMAIL
          </button>
        </div>
      </div>
    </div>
  );
}
