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

export interface WallComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

export interface WallPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
  likes?: number;
  likedBy?: string[];
  comments?: WallComment[];
}

// ============================================================
// Preset Login Accounts
// ============================================================

export interface PresetAccount {
  id?: string;
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

// ============================================================
// Sketch & CAD Studio Types
// ============================================================

export type SketchToolMode =
  | 'select'
  | 'pan'
  | 'pen'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'arrow'
  | 'cloud'
  | 'measure'
  | 'callout'
  | 'stamp'
  | 'text'
  | 'eraser';

export type SketchGridType = 'none' | 'square' | 'dots' | 'isometric';

export interface SketchPoint {
  x: number;
  y: number;
}

export interface SketchShapeItem {
  id: string;
  type: SketchToolMode;
  points: SketchPoint[];
  color: string;
  size: number;
  opacity: number;
  layerId?: string;
  text?: string;
  fontSize?: number;
  measureLengthMeters?: number;
  scaleRatio?: number;
  stampType?: string;
  calloutText?: string;
}

export interface SketchLayer {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
}

export interface PresetBlueprint {
  id: string;
  sheetNo: string;
  title: string;
  projectCode: string;
  projectName: string;
  scale: string;
  revision: string;
  previewUrl: string;
}

// ============================================================
// RFI (Request for Information) & Submittal Types
// ============================================================

export type RFIStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESPONDED' | 'CLOSED';
export type RFICategory = 'STRUCTURAL' | 'ARCHITECTURAL' | 'MEP' | 'SITE_CIVIL' | 'FINISHES';
export type RFIPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RFIItem {
  id: string;
  rfiNumber: string;
  projectId: string;
  projectCode: string;
  subject: string;
  category: RFICategory;
  question: string;
  response?: string;
  status: RFIStatus;
  priority: RFIPriority;
  submittedBy: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  respondedAt?: string;
  costImpact?: boolean;
  scheduleImpact?: boolean;
  attachmentUrl?: string;
  attachmentTitle?: string;
}

export type SubmittalType = 'SHOP_DRAWING' | 'MATERIAL_SAMPLE' | 'PRODUCT_DATA' | 'TEST_REPORT';
export type SubmittalStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISE_RESUBMIT' | 'REJECTED';

export interface SubmittalItem {
  id: string;
  submittalNumber: string;
  projectId: string;
  projectCode: string;
  title: string;
  specSection: string;
  type: SubmittalType;
  status: SubmittalStatus;
  submittedBy: string;
  reviewedBy?: string;
  actionNotes?: string;
  sampleDate: string;
  createdAt: string;
  previewUrl?: string;
}

