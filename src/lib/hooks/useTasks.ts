'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskItem } from '@/types';
export type { TaskItem };
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

const TASKS_STORAGE_KEY = 'arkipelago_unified_tasks';
const TASKS_EVENT_NAME = 'arkipelago_tasks_updated';
const TASKS_CHANNEL_NAME = 'arkipelago_tasks_channel';
const TASKS_REALTIME_CHANNEL = 'realtime:tasks';


const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-001',
    name: 'MAKATI TOWER SCHEMATIC DESIGN SET',
    projectId: '1',
    description: 'Prepare complete 3D massing drawings and schematic floorplans for client review.',
    projectPhase: 'SCHEMATIC',
    deliverables: ['3D Massing Renders', 'Schematic Plans', 'Section Drawings'],
    taskType: 'DELIVERABLE',
    priority: 'HIGH',
    assignedMember: 'Arch. Carlos Mendoza',
    startDate: '2026-09-20',
    endDate: '2026-09-25',
    timeNeeded: '24h',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'task-002',
    name: 'CASA VERDE RESIDENCE MATERIAL BOARD',
    projectId: '2',
    description: 'Review Italian marble and timber veneer samples with structural engineer.',
    projectPhase: 'DESIGN DEVELOPMENT',
    deliverables: ['Physical Material Board', 'Supplier Specification Sheets'],
    taskType: 'WORKSHOP',
    priority: 'HIGH',
    assignedMember: 'Arch. Sofia Reyes',
    startDate: '2026-09-22',
    endDate: '2026-09-26',
    timeNeeded: '16h',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-003',
    name: 'BGC CULTURAL PAVILION SITE SURVEY',
    projectId: '3',
    description: 'Foundation soil test verification and city structural permit submission.',
    projectPhase: 'CONTRACT DOCUMENTS',
    deliverables: ['Soil Test Report', 'Permit Stamp Package'],
    taskType: 'SITE_VISIT',
    priority: 'MEDIUM',
    assignedMember: 'Engr. Aris Mendoza',
    startDate: '2026-09-23',
    endDate: '2026-09-28',
    timeNeeded: '12h',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  },
];

function getStoredTasks(): TaskItem[] {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tasks from localStorage', e);
    return INITIAL_TASKS;
  }
}

function persistTasks(tasks: TaskItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error persisting tasks', e);
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  const syncTasks = useCallback(() => {
    setTasks(getStoredTasks());
  }, []);

  useEffect(() => {
    syncTasks();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === TASKS_STORAGE_KEY) syncTasks();
    };
    const handleCustom = () => syncTasks();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(TASKS_EVENT_NAME, handleCustom);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel(TASKS_CHANNEL_NAME);
        bc.onmessage = () => syncTasks();
      } catch (e) {
        console.error('BroadcastChannel error', e);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(TASKS_EVENT_NAME, handleCustom);
      if (bc) bc.close();
    };
  }, [syncTasks]);


  // Supabase Cloud Sync & Realtime
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const fetchSupabaseTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: TaskItem[] = data.map((t) => ({
          id: t.id,
          name: t.name,
          projectId: t.project_id || '',
          description: t.description || '',
          projectPhase: t.project_phase || 'SCHEMATIC',
          deliverables: Array.isArray(t.deliverables) ? t.deliverables : [],
          taskType: t.task_type || 'DELIVERABLE',
          priority: (t.priority as TaskItem['priority']) || 'MEDIUM',
          assignedMember: t.assigned_member || 'UNASSIGNED',
          startDate: t.start_date || undefined,
          endDate: t.end_date || undefined,
          timeNeeded: t.time_needed || undefined,
          status: (t.status as TaskItem['status']) || 'PENDING',
          createdAt: t.created_at,
        }));
        setTasks(mapped);
        persistTasks(mapped);
      }
    };

    fetchSupabaseTasks();

    try {
      const channel = supabase
        .channel(TASKS_REALTIME_CHANNEL)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
          fetchSupabaseTasks();
        })
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore cleanup errors
        }
      };
    } catch (err) {
      console.warn('Realtime tasks subscription notice:', err);
    }

  }, []);

  const addTask = useCallback(async (newTaskData: Partial<TaskItem>) => {
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

    const current = getStoredTasks();
    const updated = [created, ...current];
    persistTasks(updated);
    setTasks(updated);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(TASKS_EVENT_NAME));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(TASKS_CHANNEL_NAME);
        bc.postMessage('tasks_updated');
        bc.close();
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tasks').insert([
          {
            name: created.name,
            description: created.description,
            project_phase: created.projectPhase,
            deliverables: created.deliverables,
            task_type: created.taskType,
            priority: created.priority,
            assigned_member: created.assignedMember,
            start_date: created.startDate || null,
            end_date: created.endDate || null,
            time_needed: created.timeNeeded || null,
            status: created.status,
          },
        ]);
      } catch (err) {
        console.warn('Supabase task write skipped/queued locally:', err);
      }
    }

    return created;
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskItem['status']) => {
    const current = getStoredTasks();
    const updated = current.map((t) => (t.id === taskId ? { ...t, status } : t));
    persistTasks(updated);
    setTasks(updated);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(TASKS_EVENT_NAME));
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(TASKS_CHANNEL_NAME);
        bc.postMessage('tasks_updated');
        bc.close();
      }
    }

    if (isSupabaseConfigured && supabase && !taskId.startsWith('task-')) {
      try {
        await supabase.from('tasks').update({ status }).eq('id', taskId);
      } catch (err) {
        console.warn('Supabase task status update skipped/queued locally:', err);
      }
    }
  }, []);


  return {
    tasks,
    addTask,
    updateTaskStatus,
    refreshTasks: syncTasks,
  };
}

