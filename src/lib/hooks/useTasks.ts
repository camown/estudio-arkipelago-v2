'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskItem } from '@/types';

const STORAGE_KEY = 'arkipelago_unified_tasks';
const EVENT_NAME = 'arkipelago_tasks_updated';

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
    assignedMember: 'Arch. Maria Cruz',
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
    assignedMember: 'Arch. Testing3',
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
    assignedMember: 'Engr. Testing4',
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tasks from localStorage', e);
    return INITIAL_TASKS;
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>(getStoredTasks);

  const syncTasks = useCallback(() => {
    setTasks(getStoredTasks());
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncTasks();
    };
    const handleCustom = () => syncTasks();

    window.addEventListener('storage', handleStorage);
    window.addEventListener(EVENT_NAME, handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(EVENT_NAME, handleCustom);
    };
  }, [syncTasks]);

  const addTask = useCallback((newTaskData: Partial<TaskItem>) => {
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error('Error saving task', e);
    }
    setTasks(updated);
    return created;
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskItem['status']) => {
    const current = getStoredTasks();
    const updated = current.map((t) => (t.id === taskId ? { ...t, status } : t));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error('Error updating task', e);
    }
    setTasks(updated);
  }, []);

  return {
    tasks,
    addTask,
    updateTaskStatus,
    refreshTasks: syncTasks,
  };
}
