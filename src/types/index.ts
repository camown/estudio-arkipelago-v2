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
// Construction Administration (CA) Types
// ============================================================

export type RFIStatus = 'PENDING' | 'UNDER_REVIEW' | 'ANSWERED' | 'CLOSED';

export interface RFIItem {
  id: string;
  projectId: string;
  rfiNumber: string;
  title: string;
  assignedTo?: string;
  dateReceived: string;
  dateRequired?: string;
  dateAnswered?: string;
  status: RFIStatus;
  question: string;
  response?: string;
  attachments?: string[];
}

export type RFADecision = 'APPROVED' | 'APPROVED_WITH_COMMENTS' | 'REVISE_RESUBMIT' | 'REJECTED' | 'PENDING';

export interface RFAItem {
  id: string;
  projectId: string;
  rfaNumber: string;
  title: string;
  submittalType: 'MATERIAL_SAMPLE' | 'SHOP_DRAWING' | 'PRODUCT_DATA' | 'MOCKUP';
  supplier?: string;
  dateSubmitted: string;
  decision: RFADecision;
  reviewerNotes?: string;
  specSection?: string;
}

export interface WRIItem {
  id: string;
  projectId: string;
  wriNumber: string;
  title: string;
  date: string;
  inspector: string;
  agenda: string;
  observations: string;
  actionItems?: string;
  severity: 'ROUTINE' | 'ADVISORY' | 'CRITICAL';
}

export interface SiteDeliveryItem {
  id: string;
  projectId: string;
  finishCode: string;
  itemDescription: string;
  supplierContact?: string;
  quantityOrdered: string;
  quantityDelivered: string;
  deliveryDate?: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'PARTIAL' | 'COMPLETE';
}

export interface SiteBulletinItem {
  id: string;
  projectId: string;
  bulletinNumber: string;
  subject: string;
  description: string;
  drawingsAffected: string[];
  issuedDate: string;
}

// ============================================================
// Pre-Design & Site Feasibility
// ============================================================

export type PreliminaryDocStatus = 'RECEIVED' | 'REQUESTED' | 'NOT_APPLICABLE' | 'PENDING';

export interface PreliminaryCheckItem {
  id: string;
  projectId: string;
  title: string;
  category: 'LEGAL' | 'ZONING' | 'ENVIRONMENTAL' | 'TECHNICAL';
  status: PreliminaryDocStatus;
  notes?: string;
  updatedAt: string;
}

export interface ClientSpaceProgramItem {
  id: string;
  projectId: string;
  spaceName: string;
  targetAreaSqM: number;
  occupancyCount?: number;
  specialRequirements?: string;
}

// ============================================================
// Schematic Design Area Tabulation
// ============================================================

export interface SchematicAreaItem {
  id: string;
  projectId: string;
  level: string;
  spaceName: string;
  areaSqM: number;
  notes?: string;
}

// ============================================================
// Architectural & Engineering Drawing Disciplines
// ============================================================

export type DrawingDiscipline = 
  | 'A-000 GENERAL / SITE'
  | 'A-100 PLANS'
  | 'A-200 ELEVATIONS'
  | 'A-300 SECTIONS'
  | 'A-400 BLOW-UPS & DETAILS'
  | 'A-500 SCHEDULES'
  | 'S-100 STRUCTURAL'
  | 'M-100 MECHANICAL'
  | 'E-100 ELECTRICAL'
  | 'P-100 PLUMBING';

export interface ArchitecturalSheet {
  id: string;
  projectId: string;
  code: string;
  title: string;
  discipline: DrawingDiscipline;
  planType: 'BID' | 'PERMIT' | 'BOTH' | 'CONSTRUCTION';
  assignedTo?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  revision: string;
  updatedAt: string;
}

// ============================================================
// Two-Sided Contract & Phase Billing Stepper
// ============================================================

export type ContractPhaseKey = 'PRE_DESIGN' | 'SCHEMATIC' | 'DESIGN_DEV' | 'CONSTRUCTION_DOCS' | 'CONSTRUCTION';

export interface ContractPhaseStep {
  phaseKey: ContractPhaseKey;
  phaseLabel: string;
  companyContractSent: boolean;
  companyContractDate?: string;
  companyInvoiceSent: boolean;
  companyInvoiceNumber?: string;
  clientContractSigned: boolean;
  clientSignedDate?: string;
  clientPaymentReceived: boolean;
  clientPaymentRef?: string;
  amount?: string;
  isUnlocked: boolean;
}

// ============================================================
// Client Meeting Minutes
// ============================================================

export interface MeetingMinute {
  id: string;
  projectId: string;
  title: string;
  date: string;
  location?: string;
  attendees: string[];
  agendaSummary: string;
  notes: string;
  actionItems: Array<{ task: string; assignee: string; dueDate?: string; done: boolean }>;
}

// ============================================================
// Studio Daily Logbook
// ============================================================

export type DailyLogCategory = 'EMAIL' | 'CLIENT_UPDATE' | 'MEETING_NOTES' | 'PROJECT_PROGRESS' | 'URGENT_ISSUE' | 'GENERAL';

export interface DailyLogEntry {
  id: string;
  date: string;
  category: DailyLogCategory;
  projectId?: string;
  projectName?: string;
  subject: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

// ============================================================
// Sticky Notes
// ============================================================

export interface WorkspaceStickyNote {
  id: string;
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'amber';
  x: number;
  y: number;
  minimized?: boolean;
}

