import {
  Home,
  LayoutDashboard,
  Clock,
  FolderKanban,
  CalendarDays,
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
    label: 'Homepage',
    href: '/dashboard',
    icon: Home,
    iconName: 'Home',
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
    minRole: ROLES.CONTRACTOR,
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
    email: 'partner@arkipelago.com',
    name: 'Arch. Felipe Santos',
    role: 'partner',
    description: 'Full admin access — HR approvals, financials, all projects',
    accessLevel: 'ADMIN',
  },
  {
    email: 'senior@arkipelago.com',
    name: 'Arch. Maria Cruz',
    role: 'senior_architect',
    description: 'Project lead — HR requests, wall posting, team oversight',
    accessLevel: 'LEAD',
  },
  {
    email: 'junior@arkipelago.com',
    name: 'Arch. Diego Reyes',
    role: 'junior_architect',
    description: 'Staff architect — Clock-in, wall posting, assigned projects',
    accessLevel: 'STAFF',
  },
  {
    email: 'contractor@arkipelago.com',
    name: 'Engr. Ana Villanueva',
    role: 'contractor',
    description: 'External — Clock-in, assigned project chat only',
    accessLevel: 'EXTERNAL',
  },
];

// ============================================================
// Seed Wall Posts
// ============================================================

export const SEED_WALL_POSTS: WallPost[] = [
  {
    id: 'wall-seed-001',
    authorId: 'system',
    authorName: 'ESTUDIO ARKIPELAGO',
    authorRole: 'partner',
    content: `Thursday Office Activity: Social/Affordable Housing Design!

We Live Worried About Our Deadlines and Submissions, but as Architects, We Should Never Lose Our Dream of Making the World a Better Place to Live. A Cool One...

So, to Keep You Away for 1 Day of Your Tasks, We Will Be Trying to Do More Activities That Help You Grow as Architects and Give Further Purpose to Our Practice.

Estudio Will Be Joining a Design Competition, and We Want the Whole Office to Be Involved With the Design/Concept Process.

Thursday 25.
10am- Briefing
10:30am- Office to Be Divided Into 4 Teams, Each of Them Will Have Their Own Approach.
5pm – Concept Presentations 20/30 Mint Each Team
7pm – Wrap Up, Decide Direction

It Will Be a Full Day Activity, and Meanwhile, Endika and Felipe Will Be Doing the Evaluations.
So We Expect Everyone To Be at the Office on Time.

Thanks!`,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'wall-seed-002',
    authorId: 'system',
    authorName: 'Arch. Maria Cruz',
    authorRole: 'senior_architect',
    content: `Quick reminder team — all Makati Tower Phase 2 site visit photos need to be uploaded to the project folder by EOD Friday. Please include geo-tagged shots of the structural work on floors 12-15. 

Also, the client requested an updated material board for the lobby. @Diego can you handle this? Let me know if you need the supplier contacts from the Directory.`,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
