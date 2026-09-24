'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTasks } from '@/lib/hooks/useTasks';
import { useHRRequests } from '@/lib/hooks/useHRRequests';
import { useWallPosts } from '@/lib/hooks/useWallPosts';
import { useClockIn } from '@/lib/hooks/useClockIn';
import { MOCK_PROJECTS } from '@/lib/constants';
import Logo from '@/components/ui/Logo';
import CalendarGrid from '@/components/dashboard/CalendarGrid';
import { TaskInitializationModal } from '@/components/dashboard/TaskInitializationModal';
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
  AlertTriangle,
  Radio,
  CheckCircle2,
  Circle,
  Briefcase,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, addTask, updateTaskStatus } = useTasks();
  const { requests } = useHRRequests();
  const { posts } = useWallPosts();
  const { isClocked, elapsedTime, todayEntries } = useClockIn();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const displayName = user?.name || 'Architect';

  const handleTaskCreated = (newTaskData: Parameters<typeof addTask>[0]) => {
    addTask(newTaskData);
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    updateTaskStatus(taskId, nextStatus);
  };

  // Live real-time statistics
  const pendingClearances = requests.filter((r) => r.type !== 'submit_complaint' && r.status === 'pending');
  const activeGrievances = requests.filter(
    (r) => r.type === 'submit_complaint' && r.complaintStatus !== 'resolved' && r.complaintStatus !== 'dismissed'
  );

  const activeProjectsCount = MOCK_PROJECTS.filter((p) => p.status === 'active').length;
  const inProgressTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const recentPosts = posts.slice(0, 3);

  // Calculate total seconds logged today
  const totalSecondsLoggedToday = todayEntries.reduce((acc, entry) => acc + (entry.duration || 0), 0);
  const totalHoursFormatted = (totalSecondsLoggedToday / 3600).toFixed(1);

  return (
    <div className="space-y-8 font-mono pb-12">
      {/* Task Initialization Modal */}
      <TaskInitializationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* 1. Header Banner with Studio Logo & Welcome Message */}
      <div className="flex flex-col items-center justify-center text-center py-6 space-y-4 relative">
        <Logo size={200} />
        <div className="space-y-1">
          <p className="text-sm sm:text-base font-semibold tracking-wide text-muted-main font-mono">
            Welcome back, <span className="font-bold text-text-main">{displayName}</span>
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Studio Operations System Online • Real-Time Active</span>
          </div>
        </div>

        {/* Task Initialization Quick Action Button */}
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="mt-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-2 rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Initialize Task
        </button>
      </div>

      {/* 1.5 Real-Time Operations Stream & Clearances Strip */}
      {(pendingClearances.length > 0 || activeGrievances.length > 0) && (
        <div className="bg-surface-main border border-border-main p-4 sm:p-5 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-main tracking-wide flex items-center gap-2">
                <span>Operational Ledger Actions Pending</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-semibold">
                  {pendingClearances.length + activeGrievances.length} Pending
                </span>
              </h3>
              <p className="text-xs text-muted-main mt-0.5">
                {pendingClearances.length} HR clearances awaiting verification • {activeGrievances.length} active grievance review(s).
              </p>
            </div>
          </div>
          <Link
            href="/hr"
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold tracking-wide flex items-center gap-1.5 hover:opacity-90 shrink-0 shadow-xs"
          >
            <span>Open HR Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 2. Central Studio Overview Widgets: Tasks Due, Recent Comms, & Workload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Tasks Due & In-Progress */}
        <div className="bg-surface-main border border-border-main p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-main/60 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
              <h3 className="font-bold text-xs text-text-main tracking-wide">Tasks In Progress</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded">
              {inProgressTasks.length} Active
            </span>
          </div>

          <div className="space-y-2.5 flex-1 max-h-56 overflow-y-auto pr-1">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTaskStatus(task.id, task.status)}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg border border-border-main/50 bg-surface-hover/50 hover:bg-surface-hover transition-colors cursor-pointer group"
                >
                  <button className="mt-0.5 text-muted-main group-hover:text-text-main transition-colors">
                    {task.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-main truncate group-hover:text-accent-cyan transition-colors">
                      {task.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-main mt-0.5">
                      <span>{task.projectPhase}</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-medium">{task.priority}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-main italic py-4 text-center">All caught up! No pending tasks.</p>
            )}
          </div>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full py-2 border border-dashed border-border-strong hover:border-text-main text-xs font-semibold rounded-lg text-text-main hover:bg-surface-hover transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Task</span>
          </button>
        </div>

        {/* Widget 2: Recent Studio Wall & Comms */}
        <div className="bg-surface-main border border-border-main p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-main/60 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-xs text-text-main tracking-wide">Studio Wall & Comms</h3>
            </div>
            <Link
              href="/chat"
              className="text-[11px] font-semibold text-accent-cyan hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1 max-h-56 overflow-y-auto pr-1">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href="/chat"
                  className="block p-2.5 rounded-lg border border-border-main/50 bg-surface-hover/50 hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-text-main truncate">{post.authorName}</span>
                    <span className="text-[10px] text-muted-main">
                      {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-main line-clamp-2">{post.content}</p>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-main italic py-4 text-center">No recent studio posts.</p>
            )}
          </div>

          <Link
            href="/chat"
            className="w-full py-2 bg-surface-hover hover:bg-surface-main border border-border-main text-xs font-semibold rounded-lg text-text-main transition-all flex items-center justify-center gap-1.5 text-center"
          >
            <span>Open Studio Wall</span>
          </Link>
        </div>

        {/* Widget 3: Studio Operations & Time Logged */}
        <div className="bg-surface-main border border-border-main p-5 rounded-xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-border-main/60 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-xs text-text-main tracking-wide">Studio Metrics</h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded">
              Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 rounded-lg border border-border-main/60 bg-surface-hover/40 flex flex-col justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-muted-main text-[11px]">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Active Projects</span>
              </div>
              <p className="text-xl font-bold text-text-main">{activeProjectsCount}</p>
              <p className="text-[10px] text-muted-main">In design & construction</p>
            </div>

            <div className="p-3 rounded-lg border border-border-main/60 bg-surface-hover/40 flex flex-col justify-center space-y-1">
              <div className="flex items-center gap-1.5 text-muted-main text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Hours Today</span>
              </div>
              <p className="text-xl font-bold text-text-main">
                {isClocked ? elapsedTime : `${totalHoursFormatted}h`}
              </p>
              <p className="text-[10px] text-muted-main">
                {isClocked ? 'Session in progress' : `${todayEntries.length} logged entries`}
              </p>
            </div>
          </div>

          <Link
            href="/hr"
            className="w-full py-2 bg-surface-hover hover:bg-surface-main border border-border-main text-xs font-semibold rounded-lg text-text-main transition-all flex items-center justify-center gap-1.5 text-center"
          >
            <span>View Timesheet & Logs</span>
          </Link>
        </div>
      </div>

      {/* 3. Quotation / Weekly Studio Inspiration Box */}
      <div className="max-w-2xl mx-auto bg-surface-main border border-border-main p-6 sm:p-8 rounded-xl shadow-sm text-center space-y-3">
        <p className="italic text-sm sm:text-base font-serif text-text-main leading-relaxed">
          &quot;I am the master of my fate, I am the captain of my soul.&quot; — William Ernest Henley
        </p>
        <div className="text-[11px] font-semibold text-muted-main tracking-wide flex items-center justify-center gap-1.5 pt-2 border-t border-border-main/50">
          <span>Weekly Studio Inspiration</span>
          <Pencil className="w-3 h-3" />
        </div>
      </div>

      {/* 4. Navigation Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Dashboard */}
        <Link href="/dashboard" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <LayoutDashboard className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-border-strong text-muted-main rounded tracking-wider">
                PROD
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-main mb-1">
                Dashboard Overview
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Review shared tasks, check the project calendar and studio schedules.
              </p>
            </div>
            <div className="text-xs font-semibold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 pt-2">
              Access <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Card 2: Projects Management */}
        <Link href="/projects" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <FolderKanban className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 rounded tracking-wider">
                ACTIVE
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-main mb-1">
                Projects Management
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Explore project folders, architectural schematics, and material boards.
              </p>
            </div>
            <div className="text-xs font-semibold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 pt-2">
              Access <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Card 3: Estudio Wall & Chat */}
        <Link href="/chat" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <MessageSquare className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-amber-500/50 text-amber-600 dark:text-amber-400 rounded tracking-wider">
                COMMS
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-main mb-1">
                Studio Wall & Chat
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Connect with team members or start threads & group messages.
              </p>
            </div>
            <div className="text-xs font-semibold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 pt-2">
              Access <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>

        {/* Card 4: Specialty Directory */}
        <Link href="/directory" className="block group">
          <div className="bg-surface-main border border-border-main hover:border-text-main transition-all p-6 rounded-xl h-full flex flex-col justify-between shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <BookUser className="w-6 h-6 text-text-main" />
              <span className="text-[10px] font-bold px-2 py-0.5 border border-rose-500/50 text-rose-600 dark:text-rose-400 rounded tracking-wider">
                TEAM
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-main mb-1">
                Specialty Directory
              </h3>
              <p className="text-xs text-muted-main leading-relaxed">
                Find consultants, engineers, suppliers, and site builders.
              </p>
            </div>
            <div className="text-xs font-semibold text-text-main group-hover:text-accent-cyan transition-colors flex items-center gap-2 pt-2">
              Access <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </Link>
      </div>

      {/* 5. Two-Column Calendar & Task Queue Section */}
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
              <h3 className="font-bold text-xs text-text-main tracking-wide">
                Priority Task Queue ({tasks.length})
              </h3>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="text-xs font-semibold text-accent-cyan hover:underline transition-colors flex items-center gap-1 cursor-pointer"
            >
              + New Task
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
                    <span className="font-bold text-xs text-text-main truncate">
                      {task.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wider ${
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
                    <p className="text-xs text-muted-main line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-muted-main font-semibold pt-1 border-t border-border-main/40">
                    <span>Type: {task.taskType}</span>
                    <span>Phase: {task.projectPhase}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-xs text-muted-main italic tracking-wide">
                No active high-priority tasks in your queue
              </p>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 border border-border-strong hover:border-text-main text-xs font-semibold rounded-lg tracking-wide transition-all cursor-pointer"
              >
                + Initialize First Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Gmail Inbox Section */}
      <div className="bg-surface-main border border-border-main rounded-xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-border-main pb-4 mb-6">
          <Mail className="w-4 h-4 text-text-main" />
          <h3 className="font-bold text-xs text-text-main tracking-wide">
            Gmail Integration
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center text-center py-8 space-y-4 max-w-md mx-auto">
          <div className="p-3 rounded-full bg-surface-hover border border-border-main text-muted-main">
            <Mail className="w-8 h-8" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-text-main">Connect your Studio Gmail</h4>
            <p className="text-xs text-muted-main leading-relaxed">
              Link your architectural studio account to view client communications and notifications directly from the dashboard.
            </p>
          </div>
          <a
            href="/api/auth/google/login"
            className="px-5 py-2.5 border border-border-strong hover:border-text-main bg-surface-hover hover:bg-surface-main transition-all font-semibold text-xs tracking-wide flex items-center gap-2.5 rounded-lg shadow-xs text-text-main cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Connect Gmail</span>
          </a>
        </div>
      </div>
    </div>
  );
}
