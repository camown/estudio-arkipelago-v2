export type DashboardWidgetId =
  | 'draftingBoard'
  | 'weekSchedule'
  | 'activeProjects'
  | 'messagesPreview'
  | 'tasks'
  | 'timeTracker'
  | 'clearances'
  | `project-${string}`;


export type WidgetColSpan = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // Flexible 12-col CAD grid widths

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  category: string;
  colSpan: WidgetColSpan;
  visible: boolean;
  projectId?: string;
}

export const isProjectWidget = (id: string): boolean => id.startsWith('project-');
export const getProjectIdFromWidget = (id: string): string => id.replace(/^project-/, '');

export const PROJECT_METADATA: Record<string, { img: string; phase: string; progress: number }> = {
  'proj-001': {
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    phase: 'Schematic Design',
    progress: 40,
  },
  'proj-002': {
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    phase: 'Design Development',
    progress: 65,
  },
  'proj-003': {
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
    phase: 'Permits & Bidding',
    progress: 80,
  },
  'proj-004': {
    img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    phase: 'Turnover & Closeout',
    progress: 100,
  },
  'proj-005': {
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    phase: 'Schematic Masterplan',
    progress: 25,
  },
};

export const DEFAULT_CANVAS_WIDGETS: DashboardWidgetConfig[] = [
  {
    id: 'draftingBoard',
    label: 'Ground Floor CAD & Drawing Review',
    category: 'Drawing Review',
    colSpan: 8,
    visible: true,
  },
  {
    id: 'weekSchedule',
    label: "This Week's Schedule & Site Visits",
    category: 'Agenda & Deliverables',
    colSpan: 4,
    visible: true,
  },
  {
    id: 'activeProjects',
    label: 'Active Projects Bento & Milestones',
    category: 'Projects',
    colSpan: 12,
    visible: true,
  },
  {
    id: 'messagesPreview',
    label: 'Studio Comms & Live Message Preview',
    category: 'Comms',
    colSpan: 6,
    visible: true,
  },
  {
    id: 'tasks',
    label: 'Studio Deliverables & Task Checklist',
    category: 'Tasks',
    colSpan: 6,
    visible: true,
  },

  {
    id: 'timeTracker',
    label: 'Biometric Attendance & Time Tracker',
    category: 'Operations',
    colSpan: 6,
    visible: true,
  },
  {
    id: 'clearances',
    label: 'Role Approvals & Permits',
    category: 'Clearances',
    colSpan: 12,
    visible: true,
  },
];
