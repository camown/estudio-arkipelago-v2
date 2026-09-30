'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  Plus, Search, 
  X, MessageSquare, 
  PenTool, FileText,
  HardHat, UploadCloud, CheckCircle2,
  LayoutGrid, List, Columns, SlidersHorizontal,
  FolderOpen, FolderKanban, Folder, ChevronRight,
  HelpCircle, AlertTriangle, DollarSign,
  Clock, Check, Stamp, Download
} from 'lucide-react';
import { 
  Project, 
  RFIItem, 
  SubmittalItem, 
  RFIStatus, 
  RFICategory, 
  RFIPriority, 
  SubmittalStatus, 
  SubmittalType 
} from '@/types';
import { useAuth } from '@/lib/hooks/useAuth';
import { uploadStudioAsset } from '@/lib/supabase/storage';
import { ConstructionAdminSection } from '@/components/projects/ConstructionAdminSection';
import { PreDesignSection } from '@/components/projects/PreDesignSection';
import { DrawingSetsSection } from '@/components/projects/DrawingSetsSection';
import { ContractBillingStepper } from '@/components/projects/ContractBillingStepper';
import { MeetingMinutesSection } from '@/components/projects/MeetingMinutesSection';

export type ProjectStage = 'INQUIRIES' | 'DESIGN' | 'DOCUMENTATION' | 'CONSTRUCTION' | 'ON_HOLD';

export interface StageColumnConfig {
  id: ProjectStage;
  label: string;
  badgeLabel: string;
  badgeColor: string;
}

export const STAGE_COLUMNS: StageColumnConfig[] = [
  {
    id: 'INQUIRIES',
    label: 'New Inquiries',
    badgeLabel: 'New',
    badgeColor: 'bg-sky-500/15 text-sky-950 dark:text-sky-200 border border-sky-500/40 font-bold',
  },
  {
    id: 'DESIGN',
    label: 'Active Design',
    badgeLabel: 'In Design',
    badgeColor: 'bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-500/40 font-bold',
  },
  {
    id: 'DOCUMENTATION',
    label: 'Documentation',
    badgeLabel: 'In Documentation',
    badgeColor: 'bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border border-indigo-500/40 font-bold',
  },
  {
    id: 'CONSTRUCTION',
    label: 'Construction',
    badgeLabel: 'In Construction',
    badgeColor: 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border border-emerald-500/40 font-bold',
  },
  {
    id: 'ON_HOLD',
    label: 'On Hold',
    badgeLabel: 'On Hold',
    badgeColor: 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50 border border-zinc-400 dark:border-zinc-500 font-black shadow-2xs',
  },
];

export interface EnrichedProject extends Project {
  heroImage?: string;
  stage?: ProjectStage;
  budget?: string;
  phase?: string;
  phaseStep?: string;
  progress?: number;
  sheetCount?: number;
  leadArchitect?: string;
  teamMembers?: string[];
  location?: string;
  folderCategory?: string;
}

interface DrawingSheet {
  id: string;
  projectId: string;
  sheetNumber: string;
  title: string;
  category: 'ARCHITECTURAL' | 'STRUCTURAL' | 'RENDERS' | 'MATERIALS';
  revision: string;
  updatedAt: string;
  previewUrl: string;
}

const INITIAL_DRAWINGS: DrawingSheet[] = [
  {
    id: 'dwg-1',
    projectId: 'proj-002',
    sheetNumber: 'A-101',
    title: 'Ground Floor Plan & Massing',
    category: 'ARCHITECTURAL',
    revision: 'Rev 02 - For Approval',
    updatedAt: '2026-09-21',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
  {
    id: 'dwg-2',
    projectId: 'proj-002',
    sheetNumber: 'A-201',
    title: 'North & East Elevations',
    category: 'ARCHITECTURAL',
    revision: 'Rev 01 - Schematic',
    updatedAt: '2026-09-20',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
  },
  {
    id: 'dwg-3',
    projectId: 'proj-002',
    sheetNumber: 'S-101',
    title: 'Foundation Beam Framing',
    category: 'STRUCTURAL',
    revision: 'Rev 01 - Draft',
    updatedAt: '2026-09-19',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
  },
  {
    id: 'dwg-4',
    projectId: 'proj-002',
    sheetNumber: '3D-01',
    title: 'Exterior Daylight Massing Perspective',
    category: 'RENDERS',
    revision: 'Rev 02 - Final Render',
    updatedAt: '2026-09-22',
    previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  },
  {
    id: 'dwg-5',
    projectId: 'proj-002',
    sheetNumber: 'MAT-01',
    title: 'Italian Carrara Marble & Dark Oak Spec',
    category: 'MATERIALS',
    revision: 'Rev 01 - Sample Approved',
    updatedAt: '2026-09-21',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
  },
];

const INITIAL_RFIS: RFIItem[] = [
  {
    id: 'rfi-001',
    rfiNumber: 'RFI-MT2024-001',
    projectId: 'proj-002',
    projectCode: 'MT-2024',
    subject: 'Cantilever Shear Wall Rebar Clearance on Grid 4-C',
    category: 'STRUCTURAL',
    priority: 'HIGH',
    status: 'OPEN',
    question: 'Rebar spacing between the main 32mm shear wall reinforcement and post-tensioned beam tendons conflicts with the MEP 4-inch sleeve duct on Level 14. Requesting engineer clearance for sleeve relocation 150mm north.',
    submittedBy: 'Foreman Danilo (Site Contractor)',
    assignedTo: 'Engr. Roberto Cruz / Arch. Carlos Mendoza',
    dueDate: '2026-10-02',
    createdAt: '2026-09-26',
    costImpact: false,
    scheduleImpact: true,
    attachmentUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
    attachmentTitle: 'Shear Wall Rebar Detail - Section 4-C',
  },
  {
    id: 'rfi-002',
    rfiNumber: 'RFI-MT2024-002',
    projectId: 'proj-002',
    projectCode: 'MT-2024',
    subject: 'Curtain Wall Mullion Expansion Joint Anchor Depth',
    category: 'ARCHITECTURAL',
    priority: 'MEDIUM',
    status: 'RESPONDED',
    question: 'Anchor embedment depth for south facade double-glazed curtain wall requires 120mm into perimeter beam edge. Architectural detail specifies 100mm. Please clarify if 120mm is approved without structural rebars clash.',
    response: 'Approved for 120mm embedment depth. Structural rebar clearance verified with Engr. Cruz. Stamped revision issued on Sheet A-201.',
    submittedBy: 'Pacific Glass & Aluminum Tech',
    assignedTo: 'Arch. Carlos Mendoza',
    dueDate: '2026-09-28',
    createdAt: '2026-09-22',
    respondedAt: '2026-09-24',
    costImpact: false,
    scheduleImpact: false,
    attachmentUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
    attachmentTitle: 'Mullion Anchor Detail A-201',
  },
  {
    id: 'rfi-003',
    rfiNumber: 'RFI-CV2024-001',
    projectId: 'proj-001',
    projectCode: 'CV-2024',
    subject: 'Italian Carrara Marble Subfloor Moisture Barrier Spec',
    category: 'FINISHES',
    priority: 'MEDIUM',
    status: 'OPEN',
    question: 'Requesting confirmation on waterproof penetrating sealant brand and acoustic underlay matting thickness for 2nd-floor master suite Carrara marble flooring.',
    submittedBy: 'BuildCore General Contractors',
    assignedTo: 'Arch. Leandro Locsin',
    dueDate: '2026-10-05',
    createdAt: '2026-09-25',
    costImpact: true,
    scheduleImpact: false,
    attachmentUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
    attachmentTitle: 'Master Suite Slab Layout MAT-01',
  },
  {
    id: 'rfi-004',
    rfiNumber: 'RFI-BCP2024-001',
    projectId: 'proj-003',
    projectCode: 'BCP-2024',
    subject: 'Parametric Roof Cast Steel Node Welding Inspection',
    category: 'STRUCTURAL',
    priority: 'HIGH',
    status: 'UNDER_REVIEW',
    question: 'Ultrasound weld inspection protocol required for tree column cast steel nodes prior to crane lifting. Requesting approved testing laboratory certification endorsement.',
    submittedBy: 'AMJ Structural Engineering',
    assignedTo: 'Arch. Sofia Reyes',
    dueDate: '2026-10-01',
    createdAt: '2026-09-24',
    costImpact: false,
    scheduleImpact: true,
    attachmentUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    attachmentTitle: 'Node Detail S-101',
  },
];

const INITIAL_SUBMITTALS: SubmittalItem[] = [
  {
    id: 'sub-001',
    submittalNumber: 'SUB-MT2024-001',
    projectId: 'proj-002',
    projectCode: 'MT-2024',
    title: 'Curtain Wall Double-Glazed Thermal Break Unit Sample',
    specSection: '08 44 00 - Curtain Wall & Glazed Assemblies',
    type: 'MATERIAL_SAMPLE',
    status: 'UNDER_REVIEW',
    submittedBy: 'Pacific Glass & Aluminum Tech',
    sampleDate: '2026-09-22',
    createdAt: '2026-09-22',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
  },
  {
    id: 'sub-002',
    submittalNumber: 'SUB-MT2024-002',
    projectId: 'proj-002',
    projectCode: 'MT-2024',
    title: 'Post-Tensioned Tendon Anchor Shop Drawings',
    specSection: '03 38 00 - Post-Tensioned Concrete',
    type: 'SHOP_DRAWING',
    status: 'APPROVED',
    submittedBy: 'Prime Builders PH',
    reviewedBy: 'Arch. Carlos Mendoza',
    actionNotes: 'Approved as submitted. Rebar tie clearances verified with Rev 02 drawings.',
    sampleDate: '2026-09-18',
    createdAt: '2026-09-18',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
  },
  {
    id: 'sub-003',
    submittalNumber: 'SUB-CV2024-001',
    projectId: 'proj-001',
    projectCode: 'CV-2024',
    title: 'Honed Italian Carrara Marble 20mm Slab Sample',
    specSection: '09 30 33 - Stone Tiling & Slabs',
    type: 'MATERIAL_SAMPLE',
    status: 'APPROVED',
    submittedBy: 'MarbleStone Imports',
    reviewedBy: 'Arch. Leandro Locsin',
    actionNotes: 'Approved bookmatched veining sample for foyer and master bath.',
    sampleDate: '2026-09-20',
    createdAt: '2026-09-20',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
  },
  {
    id: 'sub-004',
    submittalNumber: 'SUB-BCP2024-001',
    projectId: 'proj-003',
    projectCode: 'BCP-2024',
    title: 'Acoustic Baffle Perforated Timber Product Data',
    specSection: '09 84 00 - Acoustic Room Components',
    type: 'PRODUCT_DATA',
    status: 'REVISE_RESUBMIT',
    submittedBy: 'Acoustic Arts Ltd',
    reviewedBy: 'Arch. Sofia Reyes',
    actionNotes: 'Resubmit with certified Class A fire rating test certificate (ASTM E84).',
    sampleDate: '2026-09-15',
    createdAt: '2026-09-15',
    previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  },
];

const INITIAL_ENRICHED_PROJECTS: EnrichedProject[] = [
  {
    id: 'proj-006',
    name: 'Oak Street Residence',
    code: 'OSR-2024',
    status: 'active',
    stage: 'INQUIRIES',
    budget: '₱750k',
    clientName: 'The Oakwood Trust',
    location: 'Oak Street, Valley Heights',
    phase: 'Phase 1: Concept & Zoning Inquiries',
    phaseStep: 'Topographic & Solar Orientation Survey',
    progress: 15,
    sheetCount: 6,
    leadArchitect: 'Arch. Sofia Reyes',
    teamMembers: ['S. Reyes', 'C. Mendoza'],
    heroImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    folderCategory: 'IN_PROGRESS',
  },
  {
    id: 'proj-007',
    name: 'Lakeside Villa',
    code: 'LV-2024',
    status: 'active',
    stage: 'INQUIRIES',
    budget: '₱1.2M',
    clientName: 'Laguna Escapes Corp',
    location: 'Lakeside Ridge, Caliraya',
    phase: 'Phase 1: Inquiries & Site Feasibility',
    phaseStep: 'Shoreline Setback Verification',
    progress: 20,
    sheetCount: 8,
    leadArchitect: 'Arch. Carlos Mendoza',
    teamMembers: ['C. Mendoza'],
    heroImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    folderCategory: 'IMPORTANT',
  },
  {
    id: 'proj-008',
    name: 'Smith Residence',
    code: 'SR-2024',
    status: 'active',
    stage: 'DESIGN',
    budget: '₱1.8M',
    clientName: 'David & Claire Smith',
    location: 'Forbes Park, Makati',
    phase: 'Phase 2: Schematic Massing',
    phaseStep: 'Daylight Simulation & Material Board',
    progress: 45,
    sheetCount: 16,
    leadArchitect: 'Arch. Leandro Locsin',
    teamMembers: ['L. Locsin', 'Engr. Cruz'],
    heroImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    folderCategory: 'IN_PROGRESS',
  },
  {
    id: 'proj-002',
    name: 'Makati Tower Phase 2',
    code: 'MT-2024',
    status: 'active',
    stage: 'DESIGN',
    budget: '₱5.4M',
    clientName: 'Ayala Horizon Dev',
    location: 'Ayala Ave, Makati City',
    phase: 'Phase 2: Design Development',
    phaseStep: 'Curtain Wall Facade & Core Framing',
    progress: 58,
    sheetCount: 32,
    leadArchitect: 'Arch. Carlos Mendoza',
    teamMembers: ['C. Mendoza', 'Elena G.', 'Mark Tan'],
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    folderCategory: 'IMPORTANT',
  },
  {
    id: 'proj-009',
    name: 'Downtown Cafe & Gallery',
    code: 'DCG-2024',
    status: 'active',
    stage: 'DESIGN',
    budget: '₱850k',
    clientName: 'Artisan Beans PH',
    location: 'Legaspi Village, Makati',
    phase: 'Phase 2: Interior Concept',
    phaseStep: 'Timber Joinery & Acoustic Ceiling',
    progress: 40,
    sheetCount: 12,
    leadArchitect: 'Arch. Sofia Reyes',
    teamMembers: ['S. Reyes'],
    heroImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    folderCategory: 'DRAFTS',
  },
  {
    id: 'proj-003',
    name: 'Riverside Office & Pavilion',
    code: 'ROP-2024',
    status: 'active',
    stage: 'DOCUMENTATION',
    budget: '₱2.3M',
    clientName: 'Metro Arts Foundation',
    location: 'Bonifacio Global City, Taguig',
    phase: 'Phase 3: Construction Documentation',
    phaseStep: 'Structural Beam Schedules & City Permits',
    progress: 70,
    sheetCount: 28,
    leadArchitect: 'Arch. Sofia Reyes',
    teamMembers: ['S. Reyes', 'Engr. Cruz'],
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    folderCategory: 'IMPORTANT',
  },
  {
    id: 'proj-010',
    name: 'Pinecrest Home',
    code: 'PCH-2024',
    status: 'active',
    stage: 'DOCUMENTATION',
    budget: '₱900k',
    clientName: 'Perez Family Holdings',
    location: 'Tagaytay Highlands',
    phase: 'Phase 3: Working Drawings',
    phaseStep: 'MEP Electrical & Plumbing Rough-in Plans',
    progress: 65,
    sheetCount: 22,
    leadArchitect: 'Arch. Leandro Locsin',
    teamMembers: ['L. Locsin'],
    heroImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    folderCategory: 'REVIEWS',
  },
  {
    id: 'proj-011',
    name: 'Hilltop Residence',
    code: 'HR-2024',
    status: 'active',
    stage: 'CONSTRUCTION',
    budget: '₱750k',
    clientName: 'Tan-Lim Family',
    location: 'Antipolo Hills',
    phase: 'Phase 4: Structural Pouring',
    phaseStep: 'Level 2 Slab & Retaining Wall Anchor',
    progress: 80,
    sheetCount: 24,
    leadArchitect: 'Arch. Carlos Mendoza',
    teamMembers: ['C. Mendoza', 'Foreman Danilo'],
    heroImage: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80',
    folderCategory: 'IN_PROGRESS',
  },
  {
    id: 'proj-012',
    name: 'Central Library Addition',
    code: 'CLA-2024',
    status: 'active',
    stage: 'CONSTRUCTION',
    budget: '₱5.4M',
    clientName: 'City Heritage Council',
    location: 'Intramuros, Manila',
    phase: 'Phase 4: Glazing & Cladding',
    phaseStep: 'Perforated Bronze Screen Installation',
    progress: 88,
    sheetCount: 42,
    leadArchitect: 'Arch. Leandro Locsin',
    teamMembers: ['L. Locsin', 'Engr. Cruz'],
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    folderCategory: 'IMPORTANT',
  },
  {
    id: 'proj-001',
    name: 'Casa Verde Residence',
    code: 'CV-2024',
    status: 'active',
    stage: 'CONSTRUCTION',
    budget: '₱1.8M',
    clientName: 'Verde Family Estate',
    location: 'Batangas Coastal Ridge',
    phase: 'Phase 4: Site Construction',
    phaseStep: 'Framing, Glazing & MEP Rough-in',
    progress: 72,
    sheetCount: 18,
    leadArchitect: 'Arch. Leandro Locsin',
    teamMembers: ['L. Locsin', 'C. Mendoza', 'Engr. Cruz'],
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    folderCategory: 'IN_PROGRESS',
  },
  {
    id: 'proj-013',
    name: 'Sunset Pavilion',
    code: 'SP-2024',
    status: 'on-hold',
    stage: 'ON_HOLD',
    budget: '₱750k',
    clientName: 'Coastal Hospitality Ltd',
    location: 'Nasugbu Coast',
    phase: 'Phase 1: Environmental Clearance',
    phaseStep: 'DENR Coastal Impact Assessment Pending',
    progress: 10,
    sheetCount: 6,
    leadArchitect: 'Arch. Carlos Mendoza',
    teamMembers: ['C. Mendoza'],
    heroImage: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&q=80',
    folderCategory: 'DRAFTS',
  },
  {
    id: 'proj-014',
    name: 'Broadway Retail Complex',
    code: 'BRC-2024',
    status: 'on-hold',
    stage: 'ON_HOLD',
    budget: '₱1.1M',
    clientName: 'Metro Urban Retailers',
    location: 'Quezon City Avenue',
    phase: 'Phase 2: Commercial Review',
    phaseStep: 'Anchor Tenant Layout Re-alignment',
    progress: 25,
    sheetCount: 14,
    leadArchitect: 'Arch. Sofia Reyes',
    teamMembers: ['S. Reyes'],
    heroImage: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80',
    folderCategory: 'REVIEWS',
  },
  {
    id: 'proj-005',
    name: 'Tagaytay Ridge House',
    code: 'TRH-2024',
    status: 'on-hold',
    stage: 'ON_HOLD',
    budget: '₱750k',
    clientName: 'Montenegro Holdings',
    location: 'Tagaytay Highland Ridge',
    phase: 'Phase 2: Permitting & Grading',
    phaseStep: 'Awaiting City Zoning Clearance',
    progress: 20,
    sheetCount: 8,
    leadArchitect: 'Arch. Leandro Locsin',
    teamMembers: ['L. Locsin', 'Engr. Cruz'],
    heroImage: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80',
    folderCategory: 'IN_PROGRESS',
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const isContractor = user?.role === 'contractor';
  const assignedCodes = useMemo(() => user?.assignedProjectCodes || [], [user?.assignedProjectCodes]);

  // View mode and filters
  const [viewMode, setViewMode] = useState<'BOARD' | 'GRID' | 'TABLE'>('BOARD');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStage>('ALL');
  const [sortBy, setSortBy] = useState<'UPDATED' | 'CODE' | 'BUDGET' | 'NAME'>('UPDATED');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isCreateRFIModalOpen, setIsCreateRFIModalOpen] = useState(false);
  const [isCreateSubmittalModalOpen, setIsCreateSubmittalModalOpen] = useState(false);

  // Projects list
  const [projectsList, setProjectsList] = useState<EnrichedProject[]>(INITIAL_ENRICHED_PROJECTS);

  const visibleProjects = useMemo(() => {
    if (!isContractor) return projectsList;
    return projectsList.filter((p) => assignedCodes.includes(p.code));
  }, [isContractor, assignedCodes, projectsList]);

  // Active working project context & Project Detail Modal
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<EnrichedProject | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'DRAWINGS' | 'CA_ADMIN' | 'PRE_DESIGN' | 'CONTRACTS' | 'MINUTES'>('DRAWINGS');

  const [customFolders, setCustomFolders] = useState<string[]>([
    'IMPORTANT',
    'IN_PROGRESS',
    'DRAFTS',
    'REVIEWS',
  ]);

  // Blueprint drawings state
  const [drawings, setDrawings] = useState<DrawingSheet[]>(INITIAL_DRAWINGS);
  const [vaultCategory, setVaultCategory] = useState<'ALL' | 'ARCHITECTURAL' | 'STRUCTURAL' | 'RENDERS' | 'MATERIALS'>('ALL');
  const [isUploadSheetModalOpen, setIsUploadSheetModalOpen] = useState(false);
  const [newSheetNumber, setNewSheetNumber] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCategory, setNewSheetCategory] = useState<DrawingSheet['category']>('ARCHITECTURAL');
  const [newSheetRevision, setNewSheetRevision] = useState('Rev 01');
  const [newSheetFileUrl, setNewSheetFileUrl] = useState<string | null>(null);
  const [sheetFileName, setSheetFileName] = useState<string | null>(null);
  const [isSheetDropActive, setIsSheetDropActive] = useState(false);
  const [isUploadingSheet, setIsUploadingSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RFI & Submittal State
  const [rfis, setRfis] = useState<RFIItem[]>(INITIAL_RFIS);
  const [submittals, setSubmittals] = useState<SubmittalItem[]>(INITIAL_SUBMITTALS);
  const [rfiStatusFilter, setRfiStatusFilter] = useState<'ALL' | RFIStatus>('ALL');
  const [rfiCategoryFilter, setRfiCategoryFilter] = useState<'ALL' | RFICategory>('ALL');
  const [expandedRfiId, setExpandedRfiId] = useState<string | null>(null);
  const [rfiResponseInputs, setRfiResponseInputs] = useState<Record<string, string>>({});

  // Submittal Filters & Review State
  const [submittalTypeFilter, setSubmittalTypeFilter] = useState<'ALL' | SubmittalType>('ALL');
  const [submittalStatusFilter, setSubmittalStatusFilter] = useState<'ALL' | SubmittalStatus>('ALL');
  const [expandedSubmittalId, setExpandedSubmittalId] = useState<string | null>(null);
  const [submittalReviewNotes, setSubmittalReviewNotes] = useState<Record<string, string>>({});

  // New RFI Form
  const [newRFISubject, setNewRFISubject] = useState('');
  const [newRFICategory, setNewRFICategory] = useState<RFICategory>('STRUCTURAL');
  const [newRFIPriority, setNewRFIPriority] = useState<RFIPriority>('MEDIUM');
  const [newRFIQuestion, setNewRFIQuestion] = useState('');
  const [newRFIDueDate, setNewRFIDueDate] = useState('2026-10-05');
  const [newRFICostImpact, setNewRFICostImpact] = useState(false);
  const [newRFIScheduleImpact, setNewRFIScheduleImpact] = useState(false);

  // New Submittal Form
  const [newSubmittalTitle, setNewSubmittalTitle] = useState('');
  const [newSubmittalSpec, setNewSubmittalSpec] = useState('08 44 00 - Curtain Wall & Glazing');
  const [newSubmittalType, setNewSubmittalType] = useState<SubmittalType>('MATERIAL_SAMPLE');

  // New Project Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectStage, setNewProjectStage] = useState<ProjectStage>('INQUIRIES');
  const [newProjectBudget, setNewProjectBudget] = useState('₱1.0M');
  const [newProjectFolder, setNewProjectFolder] = useState('IN_PROGRESS');
  const [newFolderName, setNewFolderName] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export Projects to CSV
  const exportProjectsToCSV = () => {
    const headers = ['Project Code', 'Project Name', 'Client', 'Location', 'Stage', 'Budget', 'Progress (%)', 'Sheet Count'];
    const rows = filteredProjects.map((p) => [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.clientName || '').replace(/"/g, '""')}"`,
      `"${(p.location || '').replace(/"/g, '""')}"`,
      p.stage || 'DESIGN',
      `"${p.budget || '₱1.0M'}"`,
      p.progress || 0,
      p.sheetCount || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `estudio_projects_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Project ledger exported to CSV!');
  };

  // Export Project RFIs to CSV
  const exportRFIsToCSV = () => {
    if (!selectedProjectForDetail) return;
    const projectRfisList = rfis.filter((r) => r.projectCode === selectedProjectForDetail.code);
    const headers = ['RFI Number', 'Project Code', 'Subject', 'Category', 'Priority', 'Status', 'Submitted By', 'Due Date', 'Cost Impact', 'Schedule Impact', 'Response'];
    const rows = projectRfisList.map((r) => [
      r.rfiNumber,
      r.projectCode || selectedProjectForDetail.code,
      `"${(r.subject || r.title || '').replace(/"/g, '""')}"`,
      r.category || 'ARCHITECTURAL',
      r.priority || 'MEDIUM',
      r.status,
      `"${(r.submittedBy || r.assignedTo || '').replace(/"/g, '""')}"`,
      r.dueDate || '',
      r.costImpact ? 'YES' : 'NO',
      r.scheduleImpact ? 'YES' : 'NO',
      `"${(r.response || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `estudio_rfis_${selectedProjectForDetail.code}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ RFIs for ${selectedProjectForDetail.code} exported to CSV!`);
  };

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target as Node)) {
        setIsFilterPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    return visibleProjects
      .filter((project) => {
        if (statusFilter !== 'ALL' && project.stage !== statusFilter) return false;
        if (activeFolderFilter && project.folderCategory !== activeFolderFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = project.name.toLowerCase().includes(q);
          const matchCode = project.code.toLowerCase().includes(q);
          const matchClient = project.clientName?.toLowerCase().includes(q) || false;
          const matchLoc = project.location?.toLowerCase().includes(q) || false;
          const matchPhase = project.phase?.toLowerCase().includes(q) || false;
          return matchName || matchCode || matchClient || matchLoc || matchPhase;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'CODE') return a.code.localeCompare(b.code);
        if (sortBy === 'NAME') return a.name.localeCompare(b.name);
        if (sortBy === 'BUDGET') return (b.budget || '').localeCompare(a.budget || '');
        return 0;
      });
  }, [visibleProjects, statusFilter, activeFolderFilter, searchQuery, sortBy]);

  // Open specific project or modal if query parameters provided
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const actionParam = params.get('action');

    if (actionParam === 'new-rfi') {
      setIsCreateRFIModalOpen(true);
    } else if (actionParam === 'new-submittal') {
      setIsCreateSubmittalModalOpen(true);
    }

    if (codeParam) {
      const match = visibleProjects.find((p) => p.code.toLowerCase() === codeParam.toLowerCase());
      if (match) {
        const timer = setTimeout(() => {
          setSelectedProjectForDetail(match);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [visibleProjects]);

  // Listen for custom modal events (dispatched by global shortcuts)
  useEffect(() => {
    const handleOpenRFI = () => setIsCreateRFIModalOpen(true);
    const handleOpenSubmittal = () => setIsCreateSubmittalModalOpen(true);
    window.addEventListener('open-new-rfi-modal', handleOpenRFI);
    window.addEventListener('open-new-submittal-modal', handleOpenSubmittal);
    return () => {
      window.removeEventListener('open-new-rfi-modal', handleOpenRFI);
      window.removeEventListener('open-new-submittal-modal', handleOpenSubmittal);
    };
  }, []);

  // Universal Escape & Shortcut Key Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (!isInput) {
        if (e.altKey && e.key.toLowerCase() === 'r') {
          e.preventDefault();
          setIsCreateRFIModalOpen(true);
          return;
        }
        if (e.altKey && e.key.toLowerCase() === 's') {
          e.preventDefault();
          setIsCreateSubmittalModalOpen(true);
          return;
        }
      }

      if (e.key === 'Escape') {
        if (isCreateRFIModalOpen) {
          setIsCreateRFIModalOpen(false);
        } else if (isCreateSubmittalModalOpen) {
          setIsCreateSubmittalModalOpen(false);
        } else if (isUploadSheetModalOpen) {
          setIsUploadSheetModalOpen(false);
        } else if (isAddProjectModalOpen) {
          setIsAddProjectModalOpen(false);
        } else if (isAddFolderModalOpen) {
          setIsAddFolderModalOpen(false);
        } else if (isFilterPopoverOpen) {
          setIsFilterPopoverOpen(false);
        } else if (selectedProjectForDetail) {
          setSelectedProjectForDetail(null);
        } else if (activeFolderFilter) {
          setActiveFolderFilter(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCreateRFIModalOpen,
    isCreateSubmittalModalOpen,
    isUploadSheetModalOpen,
    isAddProjectModalOpen,
    isAddFolderModalOpen,
    isFilterPopoverOpen,
    selectedProjectForDetail,
    activeFolderFilter
  ]);

  // Handle Sheet File Selection
  const handleSheetFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSheetFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setNewSheetFileUrl(objectUrl);
  };

  // Handle Drag & Drop Sheet Upload
  const handleSheetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsSheetDropActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSheetFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setNewSheetFileUrl(objectUrl);
  };

  // Submit Upload Drawing Sheet
  const handleSubmitNewSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetNumber.trim() || !newSheetTitle.trim() || !selectedProjectForDetail) {
      showToast('⚠ Please provide a sheet number and title.');
      return;
    }

    setIsUploadingSheet(true);
    let finalUrl = newSheetFileUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';

    try {
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const uploaded = await uploadStudioAsset('blueprints', file, selectedProjectForDetail.code);
        if (uploaded?.url) finalUrl = uploaded.url;
      }
    } catch (err) {
      console.warn('Storage upload fallback:', err);
    }

    const newSheet: DrawingSheet = {
      id: `dwg-${Date.now()}`,
      projectId: selectedProjectForDetail.id,
      sheetNumber: newSheetNumber.toUpperCase(),
      title: newSheetTitle,
      category: newSheetCategory,
      revision: newSheetRevision,
      updatedAt: new Date().toISOString().split('T')[0],
      previewUrl: finalUrl,
    };

    setDrawings((prev) => [newSheet, ...prev]);
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === selectedProjectForDetail.id
          ? { ...p, sheetCount: (p.sheetCount || 0) + 1 }
          : p
      )
    );

    setIsUploadingSheet(false);
    setIsUploadSheetModalOpen(false);
    setNewSheetNumber('');
    setNewSheetTitle('');
    setNewSheetFileUrl(null);
    setSheetFileName(null);
    showToast(`✓ Sheet ${newSheet.sheetNumber} uploaded to Vault!`);
  };

  // Redline in Sketch Studio link
  const handleRedlineInSketch = (sheet: DrawingSheet | { previewUrl: string; sheetNumber?: string; title: string }) => {
    try {
      localStorage.setItem('arkipelago_pending_sketch_bg', sheet.previewUrl);
      localStorage.setItem('arkipelago_pending_sketch_title', `[${sheet.sheetNumber || 'RFI'}] ${sheet.title}`);
    } catch {
      // fallback
    }
    router.push('/sketch');
  };

  // Handle Submit New RFI
  const handleCreateRFI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRFISubject.trim() || !newRFIQuestion.trim() || !selectedProjectForDetail) {
      showToast('⚠ Subject and Contractor Question are required.');
      return;
    }

    const nextIndex = rfis.filter((r) => r.projectCode === selectedProjectForDetail.code).length + 1;
    const paddedIndex = String(nextIndex).padStart(3, '0');
    const rfiNum = `RFI-${selectedProjectForDetail.code.replace(/[^A-Z0-9]/g, '')}-${paddedIndex}`;

    const newRfi: RFIItem = {
      id: `rfi-${Date.now()}`,
      rfiNumber: rfiNum,
      projectId: selectedProjectForDetail.id,
      projectCode: selectedProjectForDetail.code,
      subject: newRFISubject.trim(),
      category: newRFICategory,
      priority: newRFIPriority,
      status: 'OPEN',
      question: newRFIQuestion.trim(),
      submittedBy: user?.name ? `${user.name} (${user.role.replace('_', ' ')})` : 'Foreman Danilo (Contractor)',
      assignedTo: 'Studio Architect & Structural Lead',
      dueDate: newRFIDueDate,
      createdAt: new Date().toISOString().split('T')[0],
      costImpact: newRFICostImpact,
      scheduleImpact: newRFIScheduleImpact,
      attachmentUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
      attachmentTitle: `Site Attachment for ${rfiNum}`,
    };

    setRfis((prev) => [newRfi, ...prev]);
    setIsCreateRFIModalOpen(false);
    setNewRFISubject('');
    setNewRFIQuestion('');
    setNewRFICostImpact(false);
    setNewRFIScheduleImpact(false);
    showToast(`✓ ${newRfi.rfiNumber} logged successfully!`);
  };

  // Handle RFI Architect Response
  const handleRespondRFI = (rfiId: string, nextStatus: RFIStatus = 'RESPONDED') => {
    const respText = rfiResponseInputs[rfiId];
    if (!respText && nextStatus === 'RESPONDED') {
      showToast('⚠ Please type an official architect response.');
      return;
    }

    setRfis((prev) =>
      prev.map((r) => {
        if (r.id !== rfiId) return r;
        return {
          ...r,
          response: respText || r.response,
          status: nextStatus,
          respondedAt: new Date().toISOString().split('T')[0],
        };
      })
    );

    showToast(`✓ RFI status updated to ${nextStatus}!`);
  };

  // Handle Submit New Material Submittal
  const handleCreateSubmittal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubmittalTitle.trim() || !selectedProjectForDetail) {
      showToast('⚠ Submittal title is required.');
      return;
    }

    const nextIndex = submittals.filter((s) => s.projectCode === selectedProjectForDetail.code).length + 1;
    const paddedIndex = String(nextIndex).padStart(3, '0');
    const subNum = `SUB-${selectedProjectForDetail.code.replace(/[^A-Z0-9]/g, '')}-${paddedIndex}`;

    const newSub: SubmittalItem = {
      id: `sub-${Date.now()}`,
      submittalNumber: subNum,
      projectId: selectedProjectForDetail.id,
      projectCode: selectedProjectForDetail.code,
      title: newSubmittalTitle.trim(),
      specSection: newSubmittalSpec,
      type: newSubmittalType,
      status: 'SUBMITTED',
      submittedBy: user?.name ? `${user.name} (${user.role.replace('_', ' ')})` : 'Supplier Consultant',
      sampleDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
    };

    setSubmittals((prev) => [newSub, ...prev]);
    setIsCreateSubmittalModalOpen(false);
    setNewSubmittalTitle('');
    showToast(`✓ Submittal ${newSub.submittalNumber} logged for review!`);
  };

  // Handle Stamping Submittal
  const handleStampSubmittal = (submittalId: string, newStatus: SubmittalStatus) => {
    const notes = submittalReviewNotes[submittalId];
    setSubmittals((prev) =>
      prev.map((s) => {
        if (s.id !== submittalId) return s;
        return {
          ...s,
          status: newStatus,
          reviewedBy: user?.name || 'Lead Project Architect',
          actionNotes: notes || s.actionNotes || `Stamped ${newStatus} on ${new Date().toLocaleDateString()}`,
        };
      })
    );

    showToast(`✓ Submittal stamped: ${newStatus.replace('_', ' ')}`);
  };

  // Add Project Submit
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectCode.trim()) {
      showToast('⚠ Project Name and Code are required.');
      return;
    }

    const stageMap: Record<ProjectStage, string> = {
      INQUIRIES: 'Phase 1: Inquiries & Concept',
      DESIGN: 'Phase 2: Schematic Design',
      DOCUMENTATION: 'Phase 3: Construction Documents',
      CONSTRUCTION: 'Phase 4: Site Construction',
      ON_HOLD: 'Phase 1: Project On Hold',
    };

    const newProj: EnrichedProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      code: newProjectCode.trim().toUpperCase(),
      status: newProjectStage === 'ON_HOLD' ? 'on-hold' : 'active',
      stage: newProjectStage,
      budget: newProjectBudget.trim() || '₱1.0M',
      clientName: newProjectClient.trim() || 'Private Client',
      location: newProjectLocation.trim() || 'Metro Manila',
      phase: stageMap[newProjectStage],
      phaseStep: 'Initial studio kickoff & milestone setup',
      progress: newProjectStage === 'INQUIRIES' ? 10 : newProjectStage === 'DESIGN' ? 40 : newProjectStage === 'DOCUMENTATION' ? 65 : newProjectStage === 'CONSTRUCTION' ? 80 : 0,
      sheetCount: 0,
      leadArchitect: user?.name || 'Arch. Leandro Locsin',
      teamMembers: [user?.name?.split(' ').pop() || 'Lead'],
      heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      folderCategory: newProjectFolder,
    };

    setProjectsList((prev) => [newProj, ...prev]);
    setIsAddProjectModalOpen(false);
    setNewProjectName('');
    setNewProjectCode('');
    setNewProjectClient('');
    setNewProjectLocation('');
    setNewProjectBudget('₱1.0M');
    showToast(`✓ Project "${newProj.name}" created!`);
  };

  // Helpers
  const getStageConfig = (stage?: ProjectStage): StageColumnConfig => {
    return STAGE_COLUMNS.find((c) => c.id === stage) || STAGE_COLUMNS[1];
  };

  const projectRfis = useMemo(() => {
    if (!selectedProjectForDetail) return [];
    return rfis.filter((r) => r.projectCode === selectedProjectForDetail.code);
  }, [selectedProjectForDetail, rfis]);

  const projectSubmittals = useMemo(() => {
    if (!selectedProjectForDetail) return [];
    return submittals.filter((s) => s.projectCode === selectedProjectForDetail.code);
  }, [selectedProjectForDetail, submittals]);

  const openRfiCount = useMemo(() => {
    return projectRfis.filter((r) => r.status === 'OPEN' || r.status === 'UNDER_REVIEW').length;
  }, [projectRfis]);

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-3">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
            <FolderKanban className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main font-sans">
            Project Dashboard
          </h1>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-hover text-muted-main border border-border-main hidden sm:inline-block">
            {filteredProjects.length} Projects
          </span>
        </div>

        {/* Top-Right Utility Actions: Search, Filter, Export CSV, View Modes, + New Project */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Search Control */}
          <div className="relative">
            <div
              className={cn(
                'flex items-center bg-surface-main border border-border-main rounded-xl transition-all',
                isSearchExpanded
                  ? 'w-56 sm:w-64 px-3 py-1.5 ring-1 ring-border-main shadow-2xs'
                  : 'w-9 h-9 justify-center cursor-pointer hover:bg-surface-hover'
              )}
            >
              <button
                type="button"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                title="Search projects"
                className="text-muted-main hover:text-text-main cursor-pointer p-0.5"
              >
                <Search className="w-4 h-4 shrink-0" />
              </button>
              {isSearchExpanded && (
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none text-xs text-text-main placeholder:text-muted-main focus:outline-none ml-2"
                />
              )}
              {isSearchExpanded && searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-muted-main hover:text-text-main cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Popover Button */}
          <div className="relative" ref={filterPopoverRef}>
            <button
              onClick={() => setIsFilterPopoverOpen(!isFilterPopoverOpen)}
              className={cn(
                'w-9 h-9 rounded-xl border border-border-main flex items-center justify-center text-text-main hover:bg-surface-hover transition-colors cursor-pointer',
                statusFilter !== 'ALL' || activeFolderFilter
                  ? 'bg-accent-cyan/15 border-accent-cyan text-accent-cyan'
                  : 'bg-surface-main'
              )}
              title="Filter by Stage or Studio Folder"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Filter Dropdown Popover */}
            {isFilterPopoverOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-surface-main border border-border-main rounded-2xl shadow-2xl p-4 z-40 space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-border-main pb-2">
                  <span className="text-xs font-bold text-text-main">Filter & Organize</span>
                  <button
                    onClick={() => {
                      setStatusFilter('ALL');
                      setActiveFolderFilter(null);
                    }}
                    className="text-[10px] text-muted-main hover:text-text-main underline cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>

                {/* Filter by Stage */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-muted-main">Stage Status</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={cn(
                        'px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer',
                        statusFilter === 'ALL'
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                          : 'bg-surface-hover/70 hover:bg-surface-hover text-muted-main hover:text-text-main'
                      )}
                    >
                      All Stages
                    </button>
                    {STAGE_COLUMNS.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setStatusFilter(st.id)}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer truncate',
                          statusFilter === st.id
                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                            : 'bg-surface-hover/70 hover:bg-surface-hover text-muted-main hover:text-text-main'
                        )}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter by Studio Folder */}
                <div className="space-y-1.5 pt-2 border-t border-border-main/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-main">Studio Folders</span>
                    <button
                      onClick={() => {
                        setIsFilterPopoverOpen(false);
                        setIsAddFolderModalOpen(true);
                      }}
                      className="text-[10px] text-accent-cyan hover:underline cursor-pointer"
                    >
                      + Add Folder
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {customFolders.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFolderFilter(activeFolderFilter === f ? null : f)}
                        className={cn(
                          'px-2 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer',
                          activeFolderFilter === f
                            ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                            : 'bg-surface-hover text-muted-main hover:text-text-main border border-border-main'
                        )}
                      >
                        {f.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Option */}
                <div className="space-y-1.5 pt-2 border-t border-border-main/50">
                  <span className="text-[11px] font-semibold text-muted-main">Sort Projects</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full bg-surface-hover border border-border-main text-text-main px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-hidden cursor-pointer"
                  >
                    <option value="UPDATED">Milestone Progress</option>
                    <option value="CODE">Project Code (A-Z)</option>
                    <option value="BUDGET">Budget Size</option>
                    <option value="NAME">Project Title</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Export Projects Ledger Button */}
          <button
            onClick={exportProjectsToCSV}
            className="w-9 h-9 rounded-xl border border-border-main bg-surface-main hover:bg-surface-hover flex items-center justify-center text-muted-main hover:text-text-main transition-colors shadow-2xs cursor-pointer"
            title="Export Projects Ledger to CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* View Switcher */}
          <div className="flex items-center border border-border-main rounded-xl p-0.5 bg-surface-main">
            <button
              onClick={() => setViewMode('BOARD')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'BOARD'
                  ? 'bg-surface-hover text-text-main shadow-2xs font-bold'
                  : 'text-muted-main hover:text-text-main'
              )}
              title="Pipeline Columns View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'GRID'
                  ? 'bg-surface-hover text-text-main shadow-2xs font-bold'
                  : 'text-muted-main hover:text-text-main'
              )}
              title="Full-Width Visual Grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'TABLE'
                  ? 'bg-surface-hover text-text-main shadow-2xs font-bold'
                  : 'text-muted-main hover:text-text-main'
              )}
              title="Engineering Detail Table"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons: + Folder & + New Project */}
          {!isContractor ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                onClick={() => setIsAddFolderModalOpen(true)}
                className="rounded-xl border-border-main hover:bg-surface-hover text-text-main font-semibold text-xs py-2 px-3 shadow-2xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
                title="Create a new studio organization folder"
              >
                <FolderOpen className="w-4 h-4 text-accent-cyan" />
                <span className="hidden sm:inline">Add Folder</span>
              </Button>

              <Button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs py-2 px-3.5 shadow-xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold flex items-center gap-1.5">
              <HardHat className="w-4 h-4" />
              <span>Assigned Scope</span>
            </div>
          )}
        </div>
      </div>

      {/* VISIBLE STUDIO FOLDERS DIRECTORY EXPLORER */}
      <div className="bg-surface-main/80 border border-border-main/70 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-accent-cyan" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-main font-sans">
              Studio Project Folders
            </h2>
            <span className="text-[10px] text-muted-main hidden sm:inline">
              ({customFolders.length} categories)
            </span>
          </div>
          <div className="flex items-center gap-3">
            {activeFolderFilter && (
              <button
                onClick={() => setActiveFolderFilter(null)}
                className="text-xs font-semibold text-accent-cyan hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All Projects</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {!isContractor && (
              <button
                onClick={() => setIsAddFolderModalOpen(true)}
                className="text-xs font-semibold text-muted-main hover:text-text-main cursor-pointer"
              >
                + New Folder
              </button>
            )}
          </div>
        </div>

        {/* Folder Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <button
            onClick={() => setActiveFolderFilter(null)}
            className={cn(
              'p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
              activeFolderFilter === null
                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                : 'bg-surface-main border-border-main hover:border-text-main/50 hover:bg-surface-hover'
            )}
          >
            <div className="flex items-center justify-between w-full mb-1.5">
              <FolderOpen className={cn('w-4 h-4', activeFolderFilter === null ? 'text-accent-cyan' : 'text-muted-main')} />
              <span className={cn('text-[10px] font-mono font-bold px-1.5 py-0.5 rounded', activeFolderFilter === null ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-surface-hover text-muted-main border border-border-main')}>
                {visibleProjects.length}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold truncate">All Projects</p>
              <p className={cn('text-[10px]', activeFolderFilter === null ? 'opacity-80' : 'text-muted-main')}>
                Complete studio index
              </p>
            </div>
          </button>

          {customFolders.map((folder) => {
            const count = visibleProjects.filter((p) => (p.folderCategory || 'IN_PROGRESS') === folder).length;
            const isSelected = activeFolderFilter === folder;

            return (
              <button
                key={folder}
                onClick={() => setActiveFolderFilter(isSelected ? null : folder)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer',
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                    : 'bg-surface-main border-border-main hover:border-text-main/50 hover:bg-surface-hover'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <Folder className={cn('w-4 h-4', isSelected ? 'text-accent-cyan' : 'text-accent-cyan/80')} />
                  <span className={cn('text-[10px] font-mono font-bold px-1.5 py-0.5 rounded', isSelected ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' : 'bg-surface-hover text-muted-main border border-border-main')}>
                    {count}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold truncate" title={folder.replace(/_/g, ' ')}>
                    {folder.replace(/_/g, ' ')}
                  </p>
                  <p className={cn('text-[10px]', isSelected ? 'opacity-80' : 'text-muted-main')}>
                    {count} {count === 1 ? 'project' : 'projects'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE FOLDER OR STAGE FILTER INDICATOR BAR */}
      {(statusFilter !== 'ALL' || activeFolderFilter || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-muted-main">Active filters:</span>
          {statusFilter !== 'ALL' && (
            <span className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border-main text-text-main font-semibold flex items-center gap-1.5">
              <span>Stage: {STAGE_COLUMNS.find((c) => c.id === statusFilter)?.label}</span>
              <button onClick={() => setStatusFilter('ALL')} className="hover:text-rose-500 cursor-pointer">
                ✕
              </button>
            </span>
          )}
          {activeFolderFilter && (
            <span className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border-main text-text-main font-semibold flex items-center gap-1.5">
              <span>Folder: {activeFolderFilter.replace(/_/g, ' ')}</span>
              <button onClick={() => setActiveFolderFilter(null)} className="hover:text-rose-500 cursor-pointer">
                ✕
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 rounded-lg bg-surface-hover border border-border-main text-text-main font-semibold flex items-center gap-1.5">
              <span>Search: &quot;{searchQuery}&quot;</span>
              <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 cursor-pointer">
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 1: STAGE PIPELINE COLUMNS VIEW */}
      {/* ============================================================== */}
      {viewMode === 'BOARD' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start pt-1">
          {STAGE_COLUMNS.map((col) => {
            const colProjects = filteredProjects.filter((p) => (p.stage || 'DESIGN') === col.id);

            return (
              <div key={col.id} className="flex flex-col space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-muted-main">
                    {col.label}
                  </h2>
                  <span className="text-[11px] font-mono text-muted-main font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border-main/60">
                    {colProjects.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colProjects.map((project) => {
                    const projectActiveRfis = rfis.filter(
                      (r) => r.projectCode === project.code && (r.status === 'OPEN' || r.status === 'UNDER_REVIEW')
                    );
                    const projectActiveSubs = submittals.filter(
                      (s) => s.projectCode === project.code && (s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW')
                    );

                    return (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProjectForDetail(project)}
                        className="bg-surface-main border border-border-main hover:border-text-main rounded-2xl p-3 space-y-3 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-hover/80 shrink-0">
                          {project.heroImage && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.heroImage}
                              alt={project.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          {/* Live Coordination Badges on Card */}
                          <div className="absolute top-1.5 right-1.5 flex flex-col gap-1 items-end">
                            {projectActiveRfis.length > 0 && (
                              <span className="bg-rose-600/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-bold shadow-xs flex items-center gap-1">
                                <HelpCircle className="w-2.5 h-2.5" />
                                <span>{projectActiveRfis.length} RFI</span>
                              </span>
                            )}
                            {projectActiveSubs.length > 0 && (
                              <span className="bg-amber-600/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-bold shadow-xs flex items-center gap-1">
                                <Stamp className="w-2.5 h-2.5" />
                                <span>{projectActiveSubs.length} Sub</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors line-clamp-1 leading-snug">
                            {project.name}
                          </h3>
                          <p className="text-xs text-muted-main font-sans">
                            Budget: <span className="font-semibold text-text-main/90">{project.budget || '₱1.2M'}</span>
                          </p>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
                              col.badgeColor
                            )}
                          >
                            {col.badgeLabel}
                          </span>
                          <span className="text-[10px] font-mono text-muted-main">
                            {project.code}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {colProjects.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-border-main/50 rounded-2xl text-center">
                      <p className="text-[11px] text-muted-main font-mono">No projects in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: FULL-WIDTH CLEAN VISUAL GRID VIEW */}
      {/* ============================================================== */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-1">
          {filteredProjects.map((project) => {
            const stageConfig = getStageConfig(project.stage);
            const projectActiveRfis = rfis.filter(
              (r) => r.projectCode === project.code && (r.status === 'OPEN' || r.status === 'UNDER_REVIEW')
            );

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectForDetail(project)}
                className="bg-surface-main border border-border-main hover:border-text-main rounded-2xl p-3 space-y-3 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-hover/80 shrink-0">
                  {project.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.heroImage}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {projectActiveRfis.length > 0 && (
                    <div className="absolute top-1.5 right-1.5 bg-rose-600/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs font-bold shadow-xs">
                      {projectActiveRfis.length} Open RFI
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors line-clamp-1 leading-snug">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-main font-sans">
                    Budget: <span className="font-semibold text-text-main/90">{project.budget || '₱1.2M'}</span>
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight',
                      stageConfig.badgeColor
                    )}
                  >
                    {stageConfig.badgeLabel}
                  </span>
                  <span className="text-[10px] font-mono text-muted-main">
                    {project.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: ENGINEERING DETAIL TABLE */}
      {/* ============================================================== */}
      {viewMode === 'TABLE' && (
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {filteredProjects.map((project) => {
            const stageConfig = getStageConfig(project.stage);
            const rfiCount = rfis.filter((r) => r.projectCode === project.code).length;
            const subCount = submittals.filter((s) => s.projectCode === project.code).length;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectForDetail(project)}
                className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-3.5 hover:border-text-main transition-all gap-4 shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span className="px-2.5 py-1 bg-surface-hover border border-border-main rounded text-xs font-bold text-text-main font-mono shrink-0">
                    {project.code}
                  </span>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-main font-sans mt-0.5 truncate">
                      {project.clientName} · <span className="text-text-main/70">{project.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight',
                      stageConfig.badgeColor
                    )}
                  >
                    {stageConfig.badgeLabel}
                  </span>
                  <span className="font-mono text-text-main font-bold">
                    {project.budget || '₱1.0M'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-main">
                  <span className="font-mono text-[11px]">
                    {rfiCount} RFIs · {subCount} Subs
                  </span>
                  <span className="text-[11px] font-semibold text-accent-cyan group-hover:underline">
                    Open Project Hub ↗
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BLUEPRINT VAULT & RFI / SUBMITTAL TRACKING HUB MODAL */}
      {/* ============================================================== */}
      {selectedProjectForDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProjectForDetail(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 font-mono overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-4xl rounded-2xl shadow-2xl p-5 sm:p-8 space-y-6 text-text-main relative my-auto cursor-default max-h-[90dvh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border-main pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded">
                    {selectedProjectForDetail.code}
                  </span>
                  {(() => {
                    const stageCol = STAGE_COLUMNS.find((c) => c.id === selectedProjectForDetail.stage);
                    return (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono uppercase font-bold tracking-wider',
                          stageCol?.badgeColor || 'bg-surface-hover text-text-main border border-border-strong'
                        )}
                      >
                        {stageCol?.badgeLabel || selectedProjectForDetail.status}
                      </span>
                    );
                  })()}
                  <span className="text-xs font-mono font-bold text-accent-cyan">
                    Budget: {selectedProjectForDetail.budget || '₱1.2M'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-text-main mt-2 font-sans">
                  {selectedProjectForDetail.name}
                </h2>
                <p className="text-xs text-muted-main mt-0.5 font-sans">
                  Client: {selectedProjectForDetail.clientName} · Location: {selectedProjectForDetail.location || 'Metro Manila'}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="w-8 h-8 rounded-full border border-border-main hover:bg-surface-hover flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Architectural Modules Navigation Tabs */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-1 border-b border-border-main">
              <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActiveDetailTab('DRAWINGS')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                  activeDetailTab === 'DRAWINGS'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Drawing Sets Vault</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('CA_ADMIN')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                  activeDetailTab === 'CA_ADMIN'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <HardHat className="w-3.5 h-3.5 text-amber-500" />
                <span>Construction Admin (RFI/RFA)</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('PRE_DESIGN')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                  activeDetailTab === 'PRE_DESIGN'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <FolderOpen className="w-3.5 h-3.5 text-cyan-500" />
                <span>Pre-Design & Program</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('CONTRACTS')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                  activeDetailTab === 'CONTRACTS'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Contracts & Billing</span>
              </button>

              <button
                onClick={() => setActiveDetailTab('MINUTES')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
                  activeDetailTab === 'MINUTES'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                <span>Client Minutes</span>
              </button>
            </div>

            {/* Chat room shortcut */}
            <button
              onClick={() => router.push(`/chat?thread=${selectedProjectForDetail.code}`)}
              className="px-3 py-1.5 rounded-lg bg-surface-hover border border-border-main text-xs font-semibold flex items-center gap-1.5 hover:text-accent-cyan cursor-pointer shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />
              <span className="hidden sm:inline">Chat Thread</span>
            </button>
          </div>

            {/* TAB CONTENT: 1. DRAWING SETS VAULT */}
            {activeDetailTab === 'DRAWINGS' && (
              <DrawingSetsSection
                projectId={selectedProjectForDetail.id}
                projectCode={selectedProjectForDetail.code}
                onRedline={(sheet) => {
                  setSelectedProjectForDetail(null);
                  router.push(`/sketch?project=${selectedProjectForDetail.code}&sheet=${encodeURIComponent(sheet.code)}`);
                }}
              />
            )}

            {/* TAB CONTENT: 2. CONSTRUCTION ADMIN */}
            {activeDetailTab === 'CA_ADMIN' && (
              <ConstructionAdminSection
                projectId={selectedProjectForDetail.id}
                projectCode={selectedProjectForDetail.code}
                projectName={selectedProjectForDetail.name}
                isContractor={isContractor}
              />
            )}

            {/* TAB CONTENT: 3. PRE-DESIGN */}
            {activeDetailTab === 'PRE_DESIGN' && (
              <PreDesignSection
                projectId={selectedProjectForDetail.id}
                projectCode={selectedProjectForDetail.code}
                location={selectedProjectForDetail.location}
              />
            )}

            {/* TAB CONTENT: 4. CONTRACTS & BILLING */}
            {activeDetailTab === 'CONTRACTS' && (
              <ContractBillingStepper
                projectId={selectedProjectForDetail.id}
                projectCode={selectedProjectForDetail.code}
                projectName={selectedProjectForDetail.name}
              />
            )}

            {/* TAB CONTENT: 5. CLIENT MINUTES */}
            {activeDetailTab === 'MINUTES' && (
              <MeetingMinutesSection
                projectId={selectedProjectForDetail.id}
                projectCode={selectedProjectForDetail.code}
                projectName={selectedProjectForDetail.name}
              />
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-border-main pt-4">
              <Button
                variant="outline"
                onClick={() => setSelectedProjectForDetail(null)}
                className="text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Project Hub
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CREATE NEW RFI MODAL */}
      {/* ============================================================== */}
      {isCreateRFIModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateRFIModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-rose-500" />
                <span>Submit Contractor RFI (Request for Info)</span>
              </h3>
              <button
                onClick={() => setIsCreateRFIModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateRFI} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Subject / Question Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beam tendon and MEP sleeve clash on Level 14"
                  value={newRFISubject}
                  onChange={(e) => setNewRFISubject(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Category</label>
                  <select
                    value={newRFICategory}
                    onChange={(e) => setNewRFICategory(e.target.value as RFICategory)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    <option value="STRUCTURAL">Structural</option>
                    <option value="ARCHITECTURAL">Architectural</option>
                    <option value="MEP">MEP Engineering</option>
                    <option value="SITE_CIVIL">Site Civil</option>
                    <option value="FINISHES">Finishes & Specs</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Priority</label>
                  <select
                    value={newRFIPriority}
                    onChange={(e) => setNewRFIPriority(e.target.value as RFIPriority)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Detailed Question & Site Context *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe location, grid lines, conflicting drawing sheets, and specific clearance needed from architect/engineer..."
                  value={newRFIQuestion}
                  onChange={(e) => setNewRFIQuestion(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg p-2.5 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRFICostImpact}
                    onChange={(e) => setNewRFICostImpact(e.target.checked)}
                    className="rounded border-border-main text-accent-cyan"
                  />
                  <span>Potential Cost Impact (₱₱)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRFIScheduleImpact}
                    onChange={(e) => setNewRFIScheduleImpact(e.target.checked)}
                    className="rounded border-border-main text-accent-cyan"
                  />
                  <span>Schedule Impact (Delay)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsCreateRFIModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Submit RFI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. CREATE NEW MATERIAL SUBMITTAL MODAL */}
      {/* ============================================================== */}
      {isCreateSubmittalModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateSubmittalModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <Stamp className="w-4 h-4 text-amber-500" />
                <span>Log Material Submittal / Shop Drawing</span>
              </h3>
              <button
                onClick={() => setIsCreateSubmittalModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmittal} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Submittal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carrara Marble Sample Slab for Master Suite"
                  value={newSubmittalTitle}
                  onChange={(e) => setNewSubmittalTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Spec Section</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09 30 33 - Stone Tiling"
                    value={newSubmittalSpec}
                    onChange={(e) => setNewSubmittalSpec(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Submittal Type</label>
                  <select
                    value={newSubmittalType}
                    onChange={(e) => setNewSubmittalType(e.target.value as SubmittalType)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    <option value="MATERIAL_SAMPLE">Material Sample</option>
                    <option value="SHOP_DRAWING">Shop Drawing</option>
                    <option value="PRODUCT_DATA">Product Data Sheet</option>
                    <option value="TEST_REPORT">Lab / Test Report</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsCreateSubmittalModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Save Submittal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. UPLOAD DRAWING SHEET MODAL */}
      {/* ============================================================== */}
      {isUploadSheetModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUploadSheetModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-cyan" />
                <span>Upload Blueprint Sheet</span>
              </h3>
              <button
                onClick={() => setIsUploadSheetModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsSheetDropActive(true);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsSheetDropActive(false);
                }
              }}
              onDrop={handleSheetDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors',
                isSheetDropActive
                  ? 'border-accent-cyan bg-accent-cyan/10'
                  : 'border-border-main hover:border-text-main bg-surface-hover/30'
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleSheetFileSelect}
                accept="image/*,.pdf,.dwg"
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-accent-cyan mx-auto mb-2" />
              <p className="text-xs font-semibold text-text-main">
                {sheetFileName ? `Selected: ${sheetFileName}` : 'Drop PDF or drawing image here, or click to browse'}
              </p>
              <p className="text-[10px] text-muted-main mt-1">Supports high-res DWG exports, PNG, JPG, PDF</p>
            </div>

            <form onSubmit={handleSubmitNewSheet} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Sheet Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-102"
                    value={newSheetNumber}
                    onChange={(e) => setNewSheetNumber(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Category</label>
                  <select
                    value={newSheetCategory}
                    onChange={(e) => setNewSheetCategory(e.target.value as typeof newSheetCategory)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    <option value="ARCHITECTURAL">Architectural</option>
                    <option value="STRUCTURAL">Structural</option>
                    <option value="RENDERS">3D Renders</option>
                    <option value="MATERIALS">Materials Spec</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Sheet Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mezzanine Floor & Stair Details"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsUploadSheetModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingSheet}
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isUploadingSheet ? 'Uploading...' : 'Add to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. CREATE NEW PROJECT MODAL */}
      {/* ============================================================== */}
      {isAddProjectModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddProjectModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-accent-cyan" />
                <span>Initialize Studio Project</span>
              </h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alabang Luxury Residence"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Project Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ALR-2024"
                    value={newProjectCode}
                    onChange={(e) => setNewProjectCode(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Target Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₱1.5M"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Lifecycle Stage</label>
                  <select
                    value={newProjectStage}
                    onChange={(e) => setNewProjectStage(e.target.value as ProjectStage)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    {STAGE_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ayala Land"
                    value={newProjectClient}
                    onChange={(e) => setNewProjectClient(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Muntinlupa City, Metro Manila"
                    value={newProjectLocation}
                    onChange={(e) => setNewProjectLocation(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-sans text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-muted-main">Studio Folder</label>
                    <button
                      type="button"
                      onClick={() => setIsAddFolderModalOpen(true)}
                      className="text-[10px] text-accent-cyan hover:underline cursor-pointer"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    value={newProjectFolder}
                    onChange={(e) => setNewProjectFolder(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    {customFolders.map((f) => (
                      <option key={f} value={f}>
                        {f.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. ADD STUDIO FOLDER MODAL */}
      {/* ============================================================== */}
      {isAddFolderModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddFolderModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-accent-cyan" />
                <span>Add Studio Folder</span>
              </h3>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Folder Name *</label>
                <input
                  type="text"
                  placeholder="e.g. RESIDENTIAL_COMMERCIAL"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newFolderName.trim()) {
                    showToast('⚠ Folder name is required');
                    return;
                  }
                  const formatted = newFolderName.trim().toUpperCase().replace(/\s+/g, '_');
                  if (!customFolders.includes(formatted)) {
                    setCustomFolders((prev) => [...prev, formatted]);
                    showToast(`✓ Folder "${formatted}" created!`);
                  }
                  setIsAddFolderModalOpen(false);
                  setNewFolderName('');
                }}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
              >
                Save Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
