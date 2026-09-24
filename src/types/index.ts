import type { ComponentType } from 'react';

export type Role = 'partner' | 'senior_architect' | 'junior_architect' | 'contractor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  assignedProjectCodes?: string[]; // Scoped projects for contractors
}

export interface Project {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'on-hold' | 'completed';
  clientName?: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  durationFormatted?: string;
  note?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconName?: string;
  minRole?: Role;
}

// ============================================================
// HR Request System Types
// ============================================================

export type HRRequestType =
  | 'overtime'
  | 'leave'
  | 'schedule_adjustment'
  | 'official_business'
  | 'certificate_of_attendance'
  | 'reimbursement'
  | 'project_hours_adjustment'
  | 'submit_complaint';

export type HRRequestStatus = 'pending' | 'approved' | 'rejected';
export type ComplaintStatus = 'submitted' | 'under_review' | 'investigating' | 'resolved' | 'dismissed';

export interface HRRequest {
  id: string;
  type: HRRequestType;
  userId: string;
  userName: string;
  calendarDate?: string;
  clockIn?: string;
  clockOut?: string;
  reason: string;
  status: HRRequestStatus;
  complaintStatus?: ComplaintStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNotes?: string;
  investigatorNotes?: string;
  isConfidential?: boolean;
  details?: Record<string, unknown>;
  // Leave-specific
  leaveType?: 'vacation' | 'sick' | 'personal' | 'emergency';
  dateFrom?: string;
  dateTo?: string;
  // Reimbursement-specific
  amount?: number;
  // Complaint-specific
  category?: string;
}

export interface HRRequestTypeOption {
  type: HRRequestType;
  label: string;
  icon: string;
  isDestructive?: boolean;
}

// ============================================================
// Estudio Wall Types
// ============================================================

export interface WallPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
  attachments?: string[];
  likes?: number;
}

// ============================================================
// Preset Login Accounts
// ============================================================

export interface PresetAccount {
  email: string;
  name: string;
  role: Role;
  description: string;
  accessLevel: string;
  assignedProjectCodes?: string[];
}

// ============================================================
// Task Initialization & Management Types
// ============================================================

export type ProjectPhase =
  | 'SCHEMATIC'
  | 'DESIGN DEVELOPMENT'
  | 'CONTRACT DOCUMENTS'
  | 'CONSTRUCTION ADMINISTRATION'
  | 'COMPLETION';

export type TaskType =
  | 'MEETING'
  | 'WORKSHOP'
  | 'PRESENTATION'
  | 'DEADLINE'
  | 'DELIVERABLE'
  | 'SITE_VISIT';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskItem {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  projectPhase?: ProjectPhase;
  deliverables?: string[];
  taskType: TaskType;
  priority: TaskPriority;
  assignedMember?: string;
  startDate?: string;
  endDate?: string;
  timeNeeded?: string;
  status: TaskStatus;
  createdAt: string;
}

