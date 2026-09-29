import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  FolderKanban,
  MessageSquare,
  BookUser,
  PenTool,
  UserCog,
} from 'lucide-react';
import type { NavItem, Project, HRRequestTypeOption, WallPost, PresetAccount } from '@/types';

export const APP_NAME = 'ESTUDIO ARKIPELAGO';
export const APP_DESCRIPTION = 'Studio Operations System';

export enum ROLES {
  PARTNER = 'partner',
  SENIOR_ARCHITECT = 'senior_architect',
  JUNIOR_ARCHITECT = 'junior_architect',
  CONTRACTOR = 'contractor',
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    iconName: 'LayoutDashboard',
    minRole: ROLES.CONTRACTOR,
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: CalendarDays,
    iconName: 'CalendarDays',
    minRole: ROLES.CONTRACTOR,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    iconName: 'FolderKanban',
    minRole: ROLES.CONTRACTOR,
  },
  {
    label: 'Chat & Threads',
    href: '/chat',
    icon: MessageSquare,
    iconName: 'MessageSquare',
    minRole: ROLES.CONTRACTOR,
  },
  {
    label: 'Directory',
    href: '/directory',
    icon: BookUser,
    iconName: 'BookUser',
    minRole: ROLES.JUNIOR_ARCHITECT,
  },
  {
    label: 'Human Resources',
    href: '/hr',
    icon: Clock,
    iconName: 'Clock',
    minRole: ROLES.JUNIOR_ARCHITECT,
  },
  {
    label: 'Sketch Studio',
    href: '/sketch',
    icon: PenTool,
    iconName: 'PenTool',
    minRole: ROLES.JUNIOR_ARCHITECT,
  },
  {
    label: 'Profile Settings',
    href: '/settings',
    icon: UserCog,
    iconName: 'UserCog',
    minRole: ROLES.CONTRACTOR,
  },
];

export const NAVIGATION_ITEMS = NAV_ITEMS;

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Casa Verde Residence',
    code: 'CV-2024',
    status: 'active',
    clientName: 'Verde Family Estate',
  },
  {
    id: 'proj-002',
    name: 'Makati Tower Phase 2',
    code: 'MT-2024',
    status: 'active',
    clientName: 'Ayala Horizon Dev',
  },
  {
    id: 'proj-003',
    name: 'BGC Cultural Pavilion',
    code: 'BCP-2024',
    status: 'active',
    clientName: 'Metro Arts Foundation',
  },
  {
    id: 'proj-004',
    name: 'Siargao Eco Villa Complex',
    code: 'SEV-2023',
    status: 'completed',
    clientName: 'Pacific Sol Resorts',
  },
  {
    id: 'proj-005',
    name: 'Tagaytay Ridge House',
    code: 'TRH-2024',
    status: 'on-hold',
    clientName: 'Montenegro Holdings',
  },
];

// ============================================================
// HR Request Type Options (matching reference UI)
// ============================================================

export const HR_REQUEST_TYPES: HRRequestTypeOption[] = [
  { type: 'overtime', label: 'Overtime', icon: 'Clock' },
  { type: 'leave', label: 'Leave', icon: 'Calendar' },
  { type: 'schedule_adjustment', label: 'Schedule Adjustment', icon: 'Clock' },
  { type: 'official_business', label: 'Official Business', icon: 'Briefcase' },
  { type: 'certificate_of_attendance', label: 'Certificate of Attendance', icon: 'FileText' },
  { type: 'reimbursement', label: 'Reimbursement', icon: 'DollarSign' },
  { type: 'project_hours_adjustment', label: 'Project Hours Adjustment', icon: 'Clock' },
  { type: 'submit_complaint', label: 'Submit Complaint', icon: 'AlertTriangle', isDestructive: true },
];

// ============================================================
// Preset Login Accounts
// ============================================================

export const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    id: 'usr-partner-001',
    email: 'partner@arkipelago.com',
    name: 'Arch. Leandro Locsin',
    role: 'partner',
    description: 'Partner Management — Full studio clearance, ledgers, approvals',
    accessLevel: 'ADMIN',
  },
  {
    id: 'usr-senior-002',
    email: 'senior@arkipelago.com',
    name: 'Arch. Carlos Mendoza',
    role: 'senior_architect',
    description: 'Senior Architect / Lead — HR review, team oversight, project lead',
    accessLevel: 'LEAD',
  },
  {
    id: 'usr-junior-003',
    email: 'junior@arkipelago.com',
    name: 'Arch. Sofia Reyes',
    role: 'junior_architect',
    description: 'Junior Architect / Staff — Clock-in, wall posting, own HR requests',
    accessLevel: 'STAFF',
  },
  {
    id: 'usr-contractor-004',
    email: 'contractor@arkipelago.com',
    name: 'Engr. Aris Mendoza',
    role: 'contractor',
    description: 'Consultant / External — Scoped strictly to assigned projects (CV-2024, BCP-2024)',
    accessLevel: 'EXTERNAL',
    assignedProjectCodes: ['CV-2024', 'BCP-2024'],
  },
];

// ============================================================
// Seed Wall Posts
// ============================================================

export const SEED_WALL_POSTS: WallPost[] = [
  {
    id: 'wall-seed-001',
    authorId: 'usr-partner-001',
    authorName: 'Arch. Leandro Locsin',
    authorRole: 'partner',
    content: `Thursday Office Activity & Design Review:

We live worried about our deadlines and submissions, but as architects, we should never lose our dream of making the world a better place to live!

So, to keep you refreshed, we will be trying to do more design activities that help you grow as architects and give further purpose to our practice.

Estudio will be joining a design competition, and we want the whole office to be involved with the design/concept process.

Thursday 25:
10:00 AM - Briefing
10:30 AM - Office to be divided into 4 teams, each with their own approach.
05:00 PM - Concept presentations (20 mins each team)
07:00 PM - Wrap up and decide direction

It will be a full day activity. Meanwhile, Arch. Carlos and I will be doing evaluations. We expect everyone to be at the studio on time!

Thanks!`,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 4,
    likedBy: ['usr-senior-002', 'usr-junior-003', 'usr-contractor-004'],
    comments: [
      {
        id: 'c-001',
        authorId: 'usr-senior-002',
        authorName: 'Arch. Carlos Mendoza',
        authorRole: 'senior_architect',
        content: 'Looking forward to this! I will prepare the presentation templates and criteria sheets.',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'c-002',
        authorId: 'usr-junior-003',
        authorName: 'Arch. Sofia Reyes',
        authorRole: 'junior_architect',
        content: 'Excited for the charette! Will set up the studio plotters and sample boards.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
  },
  {
    id: 'wall-seed-002',
    authorId: 'usr-senior-002',
    authorName: 'Arch. Carlos Mendoza',
    authorRole: 'senior_architect',
    content: `Quick reminder team — all Makati Tower Phase 2 site visit photos need to be uploaded to the project folder by EOD Friday. Please include geo-tagged shots of the structural work on floors 12-15. 

Also, the client requested an updated material board for the lobby. @Arch. Sofia Reyes can you handle this? Let me know if you need the supplier contacts from the Directory.`,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 2,
    likedBy: ['usr-partner-001'],
    comments: [
      {
        id: 'c-003',
        authorId: 'usr-junior-003',
        authorName: 'Arch. Sofia Reyes',
        authorRole: 'junior_architect',
        content: 'Got it Arch. Carlos. I have already reached out to the Carrara stone supplier and will put together the board tomorrow morning.',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      }
    ],
  },
];
