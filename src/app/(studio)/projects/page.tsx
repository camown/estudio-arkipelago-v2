'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  Plus, Search, Edit3, 
  X, MessageSquare, 
  PenTool, FileText,
  HardHat, UploadCloud, CheckCircle2,
  LayoutGrid, List, Columns, SlidersHorizontal,
  FolderOpen, FolderKanban
} from 'lucide-react';
import { Project } from '@/types';
import { useTasks } from '@/lib/hooks/useTasks';
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
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  },
  {
    id: 'DESIGN',
    label: 'Active Design',
    badgeLabel: 'In Design',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
  },
  {
    id: 'DOCUMENTATION',
    label: 'Documentation',
    badgeLabel: 'In Documentation',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
  },
  {
    id: 'CONSTRUCTION',
    label: 'Construction',
    badgeLabel: 'In Construction',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
  },
  {
    id: 'ON_HOLD',
    label: 'On Hold',
    badgeLabel: 'On Hold',
    badgeColor: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
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

const INITIAL_ENRICHED_PROJECTS: EnrichedProject[] = [
  // 1. NEW INQUIRIES
  {
    id: 'proj-006',
    name: 'Oak Street Residence',
    code: 'OSR-2024',
    status: 'active',
    stage: 'INQUIRIES',
    budget: '$750k',
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
    budget: '$1.2M',
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

  // 2. ACTIVE DESIGN
  {
    id: 'proj-008',
    name: 'Smith Residence',
    code: 'SR-2024',
    status: 'active',
    stage: 'DESIGN',
    budget: '$1.8M',
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
    budget: '$5.4M',
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
    budget: '$850k',
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

  // 3. DOCUMENTATION
  {
    id: 'proj-003',
    name: 'Riverside Office & Pavilion',
    code: 'ROP-2024',
    status: 'active',
    stage: 'DOCUMENTATION',
    budget: '$2.3M',
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
    budget: '$900k',
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

  // 4. CONSTRUCTION
  {
    id: 'proj-011',
    name: 'Hilltop Residence',
    code: 'HR-2024',
    status: 'active',
    stage: 'CONSTRUCTION',
    budget: '$750k',
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
    budget: '$5.4M',
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
    budget: '$1.8M',
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

  // 5. ON HOLD
  {
    id: 'proj-013',
    name: 'Sunset Pavilion',
    code: 'SP-2024',
    status: 'on-hold',
    stage: 'ON_HOLD',
    budget: '$750k',
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
    budget: '$1.1M',
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
    budget: '$750k',
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
  const { tasks } = useTasks();

  const isContractor = user?.role === 'contractor';
  const assignedCodes = useMemo(() => user?.assignedProjectCodes || [], [user?.assignedProjectCodes]);

  // View mode and filters (Default to BOARD / Pipeline view matching Image 2!)
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
  const [isEditFoldersModalOpen, setIsEditFoldersModalOpen] = useState(false);

  // Projects list
  const [projectsList, setProjectsList] = useState<EnrichedProject[]>(INITIAL_ENRICHED_PROJECTS);

  const visibleProjects = useMemo(() => {
    if (!isContractor) return projectsList;
    return projectsList.filter((p) => assignedCodes.includes(p.code));
  }, [isContractor, assignedCodes, projectsList]);

  // Active working project context
  const [workingProject, setWorkingProject] = useState<string>('proj-002');
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

  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCode, setNewProjectCode] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectStage, setNewProjectStage] = useState<ProjectStage>('INQUIRIES');
  const [newProjectBudget, setNewProjectBudget] = useState('$1.0M');
  const [newProjectFolder, setNewProjectFolder] = useState('IN_PROGRESS');
  const [newFolderName, setNewFolderName] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
        // Stage status filter
        if (statusFilter !== 'ALL' && project.stage !== statusFilter) {
          return false;
        }

        // Folder filter
        if (activeFolderFilter && project.folderCategory !== activeFolderFilter) {
          return false;
        }

        // Search query
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

  // Open specific project if query parameter ?code= is provided
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      const match = visibleProjects.find((p) => p.code.toLowerCase() === codeParam.toLowerCase());
      if (match) {
        const timer = setTimeout(() => {
          setSelectedProjectForDetail(match);
          setWorkingProject(match.id);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [visibleProjects]);

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

  // Submit Upload Drawing Sheet to Supabase Storage & State
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
  const handleRedlineInSketch = (sheet: DrawingSheet) => {
    try {
      localStorage.setItem('arkipelago_sketch_background', sheet.previewUrl);
      localStorage.setItem('arkipelago_sketch_project', selectedProjectForDetail?.code || 'STUDIO');
      localStorage.setItem('arkipelago_sketch_sheet_title', `${sheet.sheetNumber} - ${sheet.title}`);
    } catch {
      // fallback
    }
    router.push('/sketch');
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
      budget: newProjectBudget.trim() || '$1.0M',
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
    setNewProjectBudget('$1.0M');
    showToast(`✓ Project "${newProj.name}" created!`);
  };

  // Helper for stage badge
  const getStageConfig = (stage?: ProjectStage): StageColumnConfig => {
    return STAGE_COLUMNS.find((c) => c.id === stage) || STAGE_COLUMNS[1];
  };

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER & CONTROLS (Image 2 Reference Style) */}
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

        {/* Top-Right Utility Actions: Search, Filter, View Modes, + New Project */}
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

          {/* View Switcher: Pipeline Columns (Image 2) | Grid | Table */}
          <div className="flex items-center border border-border-main rounded-xl p-0.5 bg-surface-main">
            <button
              onClick={() => setViewMode('BOARD')}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                viewMode === 'BOARD'
                  ? 'bg-surface-hover text-text-main shadow-2xs font-bold'
                  : 'text-muted-main hover:text-text-main'
              )}
              title="Pipeline Columns View (Image 2)"
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

      {/* ACTIVE FOLDER OR STAGE FILTER INDICATOR BAR (IF ACTIVE) */}
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
      {/* MODE 1: STAGE PIPELINE COLUMNS VIEW (DIRECT ADAPTATION OF IMAGE 2) */}
      {/* ============================================================== */}
      {viewMode === 'BOARD' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start pt-1">
          {STAGE_COLUMNS.map((col) => {
            const colProjects = filteredProjects.filter((p) => (p.stage || 'DESIGN') === col.id);

            return (
              <div key={col.id} className="flex flex-col space-y-3 min-w-[200px]">
                {/* Stage Column Header (Image 2 Style with studio font-mono metadata) */}
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-muted-main">
                    {col.label}
                  </h2>
                  <span className="text-[11px] font-mono text-muted-main font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border-main/60">
                    {colProjects.length}
                  </span>
                </div>

                {/* Column Project Cards Stack */}
                <div className="space-y-3">
                  {colProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setWorkingProject(project.id);
                        setSelectedProjectForDetail(project);
                      }}
                      className="bg-surface-main border border-border-main hover:border-text-main rounded-2xl p-3 space-y-3 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                    >
                      {/* 1. Architectural Render Thumbnail (Clean isolated rounded card) */}
                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-hover/80 shrink-0">
                        {project.heroImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.heroImage}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                      </div>

                      {/* 2. Project Title & Budget (1 to 2 focal points user eyes land on!) */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors line-clamp-1 leading-snug">
                          {project.name}
                        </h3>
                        <p className="text-xs text-muted-main font-sans">
                          Budget: <span className="font-semibold text-text-main/90">{project.budget || '$1.2M'}</span>
                        </p>
                      </div>

                      {/* 3. Stage Status Badge Pill (Image 2 style with studio monospace precision) */}
                      <div className="pt-1">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider',
                            col.badgeColor
                          )}
                        >
                          {col.badgeLabel}
                        </span>
                      </div>
                    </div>
                  ))}

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
            return (
              <div
                key={project.id}
                onClick={() => {
                  setWorkingProject(project.id);
                  setSelectedProjectForDetail(project);
                }}
                className="bg-surface-main border border-border-main hover:border-text-main rounded-2xl p-3 space-y-3 cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                {/* 1. Render Thumbnail */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface-hover/80 shrink-0">
                  {project.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.heroImage}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>

                {/* 2. Project Title & Budget */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors line-clamp-1 leading-snug">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-main font-sans">
                    Budget: <span className="font-semibold text-text-main/90">{project.budget || '$1.2M'}</span>
                  </p>
                </div>

                {/* 3. Stage Status Badge Pill */}
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
      {/* MODE 3: ENGINEERING DETAIL TABLE / DENSE LIST VIEW */}
      {/* ============================================================== */}
      {viewMode === 'TABLE' && (
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {filteredProjects.map((project) => {
            const stageConfig = getStageConfig(project.stage);
            return (
              <div
                key={project.id}
                onClick={() => {
                  setWorkingProject(project.id);
                  setSelectedProjectForDetail(project);
                }}
                className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-3.5 hover:border-text-main transition-all gap-4 shadow-2xs cursor-pointer group"
              >
                {/* Left: Code, Name, Client */}
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

                {/* Center: Stage & Budget */}
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
                    {project.budget || '$1.0M'}
                  </span>
                </div>

                {/* Right: Lead Architect & Sheets */}
                <div className="flex items-center gap-4 text-xs text-muted-main">
                  <span className="font-mono text-[11px]">
                    {project.sheetCount || 10} Sheets
                  </span>
                  <span className="text-[11px] font-semibold text-accent-cyan group-hover:underline">
                    Open Vault ↗
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BLUEPRINT VAULT & PROJECT DETAIL MODAL (ALL FEATURES PRESERVED) */}
      {/* ============================================================== */}
      {selectedProjectForDetail && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProjectForDetail(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono overflow-y-auto cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-4xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-text-main relative my-auto cursor-default">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border-main pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded">
                    {selectedProjectForDetail.code}
                  </span>
                  <Badge
                    variant="outline"
                    className="capitalize text-xs font-semibold"
                  >
                    {selectedProjectForDetail.stage
                      ? STAGE_COLUMNS.find((c) => c.id === selectedProjectForDetail.stage)?.label
                      : selectedProjectForDetail.status}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-accent-cyan">
                    Budget: {selectedProjectForDetail.budget || '$1.2M'}
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

            {/* Quick Actions Bar inside Project Vault */}
            <div className="flex items-center justify-between bg-surface-hover/50 border border-border-main p-3 rounded-xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-main">Project Thread:</span>
                <span className="font-bold text-text-main">#{selectedProjectForDetail.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/chat?thread=${selectedProjectForDetail.code}`)}
                  className="px-3 py-1.5 rounded-lg bg-surface-main hover:bg-surface-hover border border-border-main text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Open Chat Room</span>
                </button>
                <button
                  onClick={() => setIsUploadSheetModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Sheet</span>
                </button>
              </div>
            </div>

            {/* Architectural Modules Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border-main">
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
      {/* 5. UPLOAD DRAWING SHEET MODAL */}
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

            {/* Drag & Drop Upload Zone */}
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
      {/* 6. CREATE NEW PROJECT MODAL */}
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
                    placeholder="e.g. $1.5M"
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
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. ADD STUDIO FOLDER MODAL */}
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
