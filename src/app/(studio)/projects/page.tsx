'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { 
  FolderKanban, Plus, Folder, Search, Edit3, 
  ChevronDown, ChevronRight, X, MessageSquare, 
  PenTool, FileText, Upload, 
  HardHat, ArrowRight, UploadCloud, CheckCircle2,
  LayoutGrid, List,
  MapPin, Users, Layers, ShieldCheck,
  TrendingUp, Sparkles, FolderOpen
} from 'lucide-react';
import { Project } from '@/types';
import { useTasks } from '@/lib/hooks/useTasks';
import { useAuth } from '@/lib/hooks/useAuth';
import { uploadStudioAsset } from '@/lib/supabase/storage';

export interface EnrichedProject extends Project {
  heroImage?: string;
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
  {
    id: 'proj-001',
    name: 'Casa Verde Residence',
    code: 'CV-2024',
    status: 'active',
    clientName: 'Verde Family Estate',
    location: 'Batangas Coastal Ridge',
    phase: 'Phase 4: Construction',
    phaseStep: 'Framing & MEP Rough-in',
    progress: 72,
    sheetCount: 18,
    leadArchitect: 'Arch. Leandro Locsin',
    teamMembers: ['L. Locsin', 'C. Mendoza', 'Engr. Cruz'],
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    folderCategory: 'IN_PROGRESS',
  },
  {
    id: 'proj-002',
    name: 'Makati Tower Phase 2',
    code: 'MT-2024',
    status: 'active',
    clientName: 'Ayala Horizon Dev',
    location: 'Ayala Ave, Makati City',
    phase: 'Phase 2: Design Development',
    phaseStep: 'Curtain Wall Facade & Core',
    progress: 58,
    sheetCount: 32,
    leadArchitect: 'Arch. Carlos Mendoza',
    teamMembers: ['C. Mendoza', 'Elena G.', 'Mark Tan'],
    heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
    folderCategory: 'IMPORTANT',
  },
  {
    id: 'proj-003',
    name: 'BGC Cultural Pavilion',
    code: 'BCP-2024',
    status: 'active',
    clientName: 'Metro Arts Foundation',
    location: 'Bonifacio Global City, Taguig',
    phase: 'Phase 1: Schematic Design',
    phaseStep: 'Massing & Acoustic Studies',
    progress: 35,
    sheetCount: 14,
    leadArchitect: 'Arch. Sofia Reyes',
    teamMembers: ['S. Reyes', 'Acoustics Lead'],
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    folderCategory: 'IMPORTANT',
  },
  {
    id: 'proj-004',
    name: 'Siargao Eco Villa Complex',
    code: 'SEV-2023',
    status: 'completed',
    clientName: 'Pacific Sol Resorts',
    location: 'General Luna, Siargao',
    phase: 'Phase 5: Final Turnover',
    phaseStep: 'As-Built Drawings Approved',
    progress: 100,
    sheetCount: 24,
    leadArchitect: 'Arch. Carlos Mendoza',
    teamMembers: ['C. Mendoza', 'Danilo F.'],
    heroImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
    folderCategory: 'REVIEWS',
  },
  {
    id: 'proj-005',
    name: 'Tagaytay Ridge House',
    code: 'TRH-2024',
    status: 'on-hold',
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

  // View mode and filters
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'on-hold' | 'completed'>('ALL');
  const [sortBy, setSortBy] = useState<'UPDATED' | 'CODE' | 'PROGRESS' | 'NAME'>('UPDATED');
  const [activeFolderFilter, setActiveFolderFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
  const activeFocusProject = useMemo(() => {
    return visibleProjects.find((p) => p.id === workingProject) || visibleProjects[0] || null;
  }, [visibleProjects, workingProject]);

  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<EnrichedProject | null>(null);

  // Folder tree open states
  const [folderOpenStates, setFolderOpenStates] = useState<Record<string, boolean>>({
    IMPORTANT: true,
    IN_PROGRESS: true,
    DRAFTS: false,
    REVIEWS: false,
    TESTING: false,
    UNCLASSIFIED: false,
  });

  const [customFolders, setCustomFolders] = useState<string[]>([
    'IMPORTANT',
    'IN_PROGRESS',
    'DRAFTS',
    'REVIEWS',
    'TESTING',
    'UNCLASSIFIED',
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
  const [newProjName, setNewProjName] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjLocation, setNewProjLocation] = useState('Metro Manila');
  const [newProjFolder, setNewProjFolder] = useState('IN_PROGRESS');
  const [newFolderName, setNewFolderName] = useState('');
  const [folderError, setFolderError] = useState('');
  const [projErrors, setProjErrors] = useState<{ name?: string; code?: string }>({});
  const [sheetErrors, setSheetErrors] = useState<{ number?: string; title?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isUploadSheetModalOpen) setIsUploadSheetModalOpen(false);
        else if (isAddProjectModalOpen) setIsAddProjectModalOpen(false);
        else if (isAddFolderModalOpen) setIsAddFolderModalOpen(false);
        else if (isEditFoldersModalOpen) setIsEditFoldersModalOpen(false);
        else if (selectedProjectForDetail) setSelectedProjectForDetail(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isUploadSheetModalOpen,
    isAddProjectModalOpen,
    isAddFolderModalOpen,
    isEditFoldersModalOpen,
    selectedProjectForDetail,
  ]);

  const toggleFolder = (folderKey: string) => {
    setFolderOpenStates((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    return visibleProjects
      .filter((project) => {
        // Status filter
        if (statusFilter !== 'ALL' && project.status !== statusFilter) {
          return false;
        }

        // Folder filter
        if (activeFolderFilter && project.folderCategory !== activeFolderFilter) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            project.name.toLowerCase().includes(q) ||
            project.code.toLowerCase().includes(q) ||
            (project.clientName && project.clientName.toLowerCase().includes(q)) ||
            (project.location && project.location.toLowerCase().includes(q)) ||
            (project.phase && project.phase.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'CODE') return a.code.localeCompare(b.code);
        if (sortBy === 'NAME') return a.name.localeCompare(b.name);
        if (sortBy === 'PROGRESS') return (b.progress || 0) - (a.progress || 0);
        return 0; // default order
      });
  }, [visibleProjects, statusFilter, activeFolderFilter, searchQuery, sortBy]);

  // Project Creation
  const handleCreateProject = () => {
    const errors: { name?: string; code?: string } = {};
    if (!newProjName.trim()) errors.name = 'Project name is required.';
    if (!newProjCode.trim()) errors.code = 'Project code is required.';

    if (Object.keys(errors).length > 0) {
      setProjErrors(errors);
      return;
    }
    setProjErrors({});

    const created: EnrichedProject = {
      id: 'proj-' + Date.now(),
      name: newProjName.trim(),
      code: newProjCode.trim().toUpperCase(),
      status: 'active',
      clientName: newProjClient.trim() || 'Internal Studio Client',
      location: newProjLocation.trim() || 'Metro Manila',
      phase: 'Phase 1: Schematic Design',
      phaseStep: 'Initial Site Survey & Massing',
      progress: 15,
      sheetCount: 1,
      leadArchitect: user?.name || 'Studio Principal',
      teamMembers: [user?.name || 'Studio Principal'],
      heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      folderCategory: newProjFolder,
    };

    setProjectsList((prev) => [created, ...prev]);
    setIsAddProjectModalOpen(false);
    setNewProjName('');
    setNewProjCode('');
    setNewProjClient('');
    showToast(`✓ Project "${created.name}" created successfully!`);
  };

  // Status toggle
  const handleToggleProjectStatus = (projId: string) => {
    setProjectsList((prev) =>
      prev.map((p) => {
        if (p.id === projId) {
          const nextStatus: Project['status'] =
            p.status === 'active' ? 'on-hold' : p.status === 'on-hold' ? 'completed' : 'active';
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    if (selectedProjectForDetail?.id === projId) {
      setSelectedProjectForDetail((prev) =>
        prev
          ? {
              ...prev,
              status:
                prev.status === 'active'
                  ? 'on-hold'
                  : prev.status === 'on-hold'
                  ? 'completed'
                  : 'active',
            }
          : null
      );
    }
    showToast('✓ Project status updated!');
  };

  // Add folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      setFolderError('Folder name is required.');
      return;
    }
    setFolderError('');
    const key = newFolderName.trim().toUpperCase().replace(/\s+/g, '_');
    if (customFolders.includes(key)) {
      setFolderError('A folder with this name already exists.');
      return;
    }
    setCustomFolders((prev) => [...prev, key]);
    setFolderOpenStates((prev) => ({ ...prev, [key]: true }));
    setNewFolderName('');
    setIsAddFolderModalOpen(false);
    showToast(`✓ Folder "${newFolderName.trim()}" added!`);
  };

  // File upload processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSheetFile(file);
  };

  const processSheetFile = async (file: File) => {
    setSheetFileName(file.name);
    setIsUploadingSheet(true);
    try {
      const res = await uploadStudioAsset('blueprints', file);
      setNewSheetFileUrl(res.url || URL.createObjectURL(file));
      showToast(`✓ File "${file.name}" ready to attach!`);
    } catch {
      setNewSheetFileUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingSheet(false);
    }
  };

  const handleUploadSheet = () => {
    const errors: { number?: string; title?: string } = {};
    if (!newSheetNumber.trim()) errors.number = 'Sheet number is required.';
    if (!newSheetTitle.trim()) errors.title = 'Sheet title is required.';

    if (Object.keys(errors).length > 0) {
      setSheetErrors(errors);
      return;
    }
    setSheetErrors({});

    const newDwg: DrawingSheet = {
      id: 'dwg-' + Date.now(),
      projectId: selectedProjectForDetail ? selectedProjectForDetail.id : 'proj-002',
      sheetNumber: newSheetNumber.trim().toUpperCase(),
      title: newSheetTitle.trim(),
      category: newSheetCategory,
      revision: newSheetRevision,
      updatedAt: new Date().toISOString().split('T')[0],
      previewUrl:
        newSheetFileUrl ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    };

    setDrawings((prev) => [newDwg, ...prev]);
    setIsUploadSheetModalOpen(false);
    setNewSheetNumber('');
    setNewSheetTitle('');
    setNewSheetFileUrl(null);
    setSheetFileName(null);
    showToast(`✓ Sheet [${newDwg.sheetNumber}] saved to vault!`);
  };

  const handleRedlineInSketch = (sheet: DrawingSheet) => {
    try {
      localStorage.setItem('arkipelago_pending_sketch_bg', sheet.previewUrl);
      localStorage.setItem('arkipelago_pending_sketch_title', `[${sheet.sheetNumber}] ${sheet.title}`);
    } catch {
      // ignore
    }
    setSelectedProjectForDetail(null);
    router.push('/sketch');
  };

  const currentProjectDrawings = drawings.filter((d) => {
    const isProj = selectedProjectForDetail
      ? d.projectId === selectedProjectForDetail.id || d.projectId === 'proj-002' || d.projectId === '1'
      : true;
    const isCat = vaultCategory === 'ALL' || d.category === vaultCategory;
    return isProj && isCat;
  });

  return (
    <div className="space-y-6 font-sans pb-16 relative min-h-screen text-text-main">
      {/* Toast Banner Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Title, Description & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main/50 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-accent-cyan" />
            <span>Projects Vault & Studio Portfolio</span>
          </h1>
          <p className="text-xs text-muted-main mt-1">
            {isContractor
              ? 'Contractor Portal: Assigned architectural scopes, drawing packages & site revisions.'
              : 'Architectural schematics, blueprint sets, milestone progress, and client project repositories.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isContractor ? (
            <Button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs py-2 px-3.5 shadow-xs cursor-pointer active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold flex items-center gap-2">
              <HardHat className="w-4 h-4" />
              <span>Assigned Scope Only</span>
            </div>
          )}
        </div>
      </div>

      {/* STUDIO PORTFOLIO METRICS BANNER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-border-main bg-surface-main shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-main">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Portfolio</span>
            <Layers className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-text-main">{visibleProjects.length}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {visibleProjects.filter((p) => p.status === 'active').length} Active
            </span>
          </div>
          <p className="text-[10px] text-muted-main">
            {visibleProjects.filter((p) => p.status === 'on-hold').length} on-hold · {visibleProjects.filter((p) => p.status === 'completed').length} completed
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border-main bg-surface-main shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-main">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Blueprint Vault</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-text-main">
              {visibleProjects.reduce((acc, p) => acc + (p.sheetCount || 10), 0)}
            </span>
            <span className="text-xs text-muted-main font-semibold">Drawing Sheets</span>
          </div>
          <p className="text-[10px] text-muted-main">Architectural, Structural, MEP & Renders</p>
        </div>

        <div className="p-4 rounded-xl border border-border-main bg-surface-main shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-main">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Phase Milestones</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-text-main">84%</span>
            <span className="text-xs text-emerald-500 font-semibold">On Schedule</span>
          </div>
          <p className="text-[10px] text-muted-main">2 Design Dev · 1 Construction · 1 Permit</p>
        </div>

        <div className="p-4 rounded-xl border border-border-main bg-surface-main shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-main">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Focus Project</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 truncate">
            <span className="text-xs font-mono font-bold text-accent-cyan px-1.5 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30">
              {activeFocusProject?.code || 'MT-2024'}
            </span>
            <span className="text-xs font-bold truncate text-text-main">
              {activeFocusProject?.name || 'Makati Tower'}
            </span>
          </div>
          <p className="text-[10px] text-muted-main truncate">
            {activeFocusProject?.phase || 'Design Development'}
          </p>
        </div>
      </div>

      {/* STUDIO TOOLBAR: Search, Status Pills, Sort, Counter & Dual View Toggle */}
      <div className="bg-surface-main border border-border-main rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Search Bar + Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-main" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, code, client, or phase..."
                className="w-full pl-8 pr-7 py-2 bg-surface-hover/50 border border-border-main hover:border-text-main focus:border-text-main rounded-lg text-xs font-medium text-text-main placeholder:text-muted-main outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-main hover:text-text-main cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['ALL', 'active', 'on-hold', 'completed'] as const).map((status) => {
                const count =
                  status === 'ALL'
                    ? visibleProjects.length
                    : visibleProjects.filter((p) => p.status === status).length;

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer shadow-2xs',
                      statusFilter === status
                        ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                        : 'border border-border-main hover:border-text-main bg-surface-main text-muted-main hover:text-text-main'
                    )}
                  >
                    <span>{status === 'ALL' ? 'All' : status}</span>
                    <span className="ml-1 opacity-70 font-mono text-[10px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Sort Dropdown, Count & View Switcher */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-muted-main font-semibold">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-surface-hover/60 border border-border-main text-text-main px-2.5 py-1.5 rounded-lg text-xs font-semibold outline-hidden cursor-pointer"
              >
                <option value="UPDATED">Recently Updated</option>
                <option value="CODE">Project Code (A-Z)</option>
                <option value="PROGRESS">Phase Progress</option>
                <option value="NAME">Project Title</option>
              </select>
            </div>

            {/* Project Counter */}
            <span className="text-xs text-muted-main font-mono hidden md:inline">
              Displaying {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>

            {/* View Mode Toggle: [ ⊞ Grid | ☰ Table ] */}
            <div className="flex items-center border border-border-main rounded-lg p-0.5 bg-surface-hover/40">
              <button
                onClick={() => setViewMode('GRID')}
                className={cn(
                  'p-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1',
                  viewMode === 'GRID'
                    ? 'bg-surface-main text-text-main shadow-2xs font-bold'
                    : 'text-muted-main hover:text-text-main'
                )}
                title="Visual Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={cn(
                  'p-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1',
                  viewMode === 'TABLE'
                    ? 'bg-surface-main text-text-main shadow-2xs font-bold'
                    : 'text-muted-main hover:text-text-main'
                )}
                title="Engineering Detail Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: STUDIO DIRECTORY, ACTIVE CONTEXT & FOLDERS */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Active Working Focus Card */}
          {activeFocusProject && (
            <div className="bg-surface-main border border-border-main rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-main flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Active Studio Context</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30">
                  Focused
                </span>
              </div>

              <div
                onClick={() => setSelectedProjectForDetail(activeFocusProject)}
                className="cursor-pointer group/focus"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black font-mono font-bold text-xs">
                    {activeFocusProject.code}
                  </span>
                  <h3 className="text-sm font-bold text-text-main group-hover/focus:text-accent-cyan transition-colors truncate">
                    {activeFocusProject.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-main mt-1">Client: {activeFocusProject.clientName}</p>

                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-muted-main">{activeFocusProject.phase}</span>
                    <span className="font-mono text-text-main">{activeFocusProject.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-accent-cyan h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeFocusProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-border-main/50">
                <button
                  onClick={() => setSelectedProjectForDetail(activeFocusProject)}
                  className="flex-1 py-1.5 px-2 bg-surface-hover hover:bg-border-main/50 border border-border-main rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Open Vault</span>
                </button>
                <button
                  onClick={() => router.push(`/chat?thread=${activeFocusProject.code}`)}
                  className="py-1.5 px-3 bg-surface-hover hover:bg-border-main/50 border border-border-main rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Project Chat Room"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          )}

          {/* FOLDERS & ARCHITECTURAL CATEGORIES */}
          <div className="bg-surface-main border border-border-main rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border-main/50 pb-2.5">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-text-main">
                  Studio Folders ({customFolders.length})
                </span>
              </div>
              {!isContractor && (
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <button
                    onClick={() => setIsEditFoldersModalOpen(true)}
                    className="text-muted-main hover:text-text-main flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <span className="text-border-main">·</span>
                  <button
                    onClick={() => setIsAddFolderModalOpen(true)}
                    className="text-accent-cyan hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>

            {/* Folder Filter Reset (if active) */}
            {activeFolderFilter && (
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg text-xs">
                <span className="font-semibold text-accent-cyan truncate">
                  Filtered by: {activeFolderFilter.replace(/_/g, ' ')}
                </span>
                <button
                  onClick={() => setActiveFolderFilter(null)}
                  className="text-muted-main hover:text-text-main font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Folder Tree Items */}
            <div className="space-y-2">
              {customFolders.map((folderKey) => {
                const isOpen = folderOpenStates[folderKey];
                const formattedName = folderKey.replace(/_/g, ' ');
                const folderProjects = visibleProjects.filter(
                  (p) => p.folderCategory === folderKey
                );
                const isFilterActive = activeFolderFilter === folderKey;

                return (
                  <div key={folderKey} className="space-y-1">
                    <div
                      className={cn(
                        'w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer shadow-2xs',
                        isFilterActive
                          ? 'border-accent-cyan bg-accent-cyan/15 text-accent-cyan font-bold'
                          : 'border-border-main hover:border-text-main bg-surface-hover/60 hover:bg-surface-hover text-text-main'
                      )}
                    >
                      <button
                        onClick={() => {
                          setActiveFolderFilter(isFilterActive ? null : folderKey);
                        }}
                        className="flex-1 text-left flex items-center gap-2 cursor-pointer truncate"
                      >
                        <Folder className={cn('w-4 h-4', isFilterActive ? 'text-accent-cyan' : 'text-muted-main')} />
                        <span className="capitalize">{formattedName.toLowerCase()}</span>
                        <span className="text-[10px] font-mono text-muted-main opacity-80">
                          ({folderProjects.length})
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFolder(folderKey);
                        }}
                        className="p-1 hover:text-text-main text-muted-main cursor-pointer"
                      >
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="pl-6 text-xs text-muted-main py-1 space-y-1 animate-in fade-in duration-150">
                        {folderProjects.length > 0 ? (
                          folderProjects.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setWorkingProject(p.id);
                                setSelectedProjectForDetail(p);
                              }}
                              className="text-xs font-semibold text-text-main hover:text-accent-cyan cursor-pointer truncate py-0.5 flex items-center gap-1.5 group"
                            >
                              <span className="text-[10px] font-mono text-muted-main group-hover:text-accent-cyan">
                                [{p.code}]
                              </span>
                              <span className="truncate">{p.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="italic text-muted-main/60 py-0.5 text-[11px]">No projects assigned</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN PROJECTS LISTING (GRID OR TABLE) */}
        <div className="lg:col-span-8 space-y-4">
          
          {filteredProjects.length > 0 ? (
            viewMode === 'GRID' ? (
              /* MODE A: VISUAL PROJECT CARD GRID */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setWorkingProject(project.id);
                      setSelectedProjectForDetail(project);
                    }}
                    className="bg-surface-main border border-border-main hover:border-text-main rounded-2xl overflow-hidden transition-all shadow-xs group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Hero Preview Image with Blueprint Overlay */}
                    <div className="relative h-36 w-full bg-surface-hover overflow-hidden">
                      {project.heroImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.heroImage}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-black/85 text-white font-mono font-bold text-xs shadow-md border border-white/10 backdrop-blur-xs">
                          {project.code}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded font-mono capitalize text-[10px] px-2.5 py-0.5 font-bold border backdrop-blur-xs shadow-md',
                            project.status === 'active'
                              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/70'
                              : project.status === 'on-hold'
                              ? 'border-amber-500/50 text-amber-400 bg-amber-950/70'
                              : 'border-slate-500/50 text-slate-300 bg-slate-900/70'
                          )}
                        >
                          {project.status}
                        </Badge>
                      </div>

                      {/* Bottom Banner Title */}
                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h3 className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors truncate drop-shadow-sm">
                          {project.name}
                        </h3>
                        <p className="text-[11px] text-slate-200/90 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-accent-cyan" />
                          <span>{project.location || project.clientName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Card Body & Milestone Progress */}
                    <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                      {/* Architectural Phase Progress Track */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-text-main truncate text-[11px]">
                            {project.phase || 'Phase 1: Schematic'}
                          </span>
                          <span className="font-mono font-bold text-accent-cyan text-xs">
                            {project.progress || 35}%
                          </span>
                        </div>
                        <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-accent-cyan h-full rounded-full transition-all duration-500"
                            style={{ width: `${project.progress || 35}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-main truncate">
                          Next: {project.phaseStep || 'Milestone coordination review'}
                        </p>
                      </div>

                      {/* Assets Strip: Drawing Sheets, Team Avatars */}
                      <div className="flex items-center justify-between pt-2 border-t border-border-main/50 text-xs text-muted-main font-medium">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>{project.sheetCount || 12} Sheets</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-muted-main" />
                          <span className="text-[11px] font-sans truncate max-w-[120px]">
                            {project.leadArchitect?.replace('Arch. ', '') || 'Lead Arch'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Button */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-accent-cyan group-hover:underline flex items-center gap-1">
                          <span>Inspect Blueprints & Vault</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* MODE B: ENGINEERING DETAIL TABLE / DENSE LIST */
              <div className="grid grid-cols-1 gap-3">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setWorkingProject(project.id);
                      setSelectedProjectForDetail(project);
                    }}
                    className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-4 hover:border-accent-cyan transition-all gap-4 shadow-xs cursor-pointer group"
                  >
                    {/* Left: Code, Name, Client */}
                    <div className="flex items-center gap-3.5 min-w-[240px]">
                      <span className="px-2.5 py-1 bg-surface-hover border border-border-main rounded text-xs font-bold text-text-main font-mono group-hover:border-accent-cyan shrink-0">
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

                    {/* Center: Phase & Progress */}
                    <div className="flex-1 max-w-xs space-y-1 hidden sm:block">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-muted-main truncate">{project.phase}</span>
                        <span className="font-mono text-accent-cyan font-bold">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-accent-cyan h-full rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Right: Sheets, Status Badge, Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded bg-surface-hover border border-border-main text-[11px] font-mono font-semibold text-text-main hidden md:inline">
                        📐 {project.sheetCount || 12} dwgs
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded font-mono capitalize text-xs px-3 py-1 font-semibold border',
                          project.status === 'active'
                            ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : project.status === 'on-hold'
                            ? 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                            : 'border-slate-500/50 text-slate-500 bg-slate-500/10'
                        )}
                      >
                        {project.status}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-main group-hover:text-accent-cyan group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ZERO MATCHES EMPTY STATE */
            <div className="bg-surface-main border border-border-main rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-surface-hover border border-border-main mx-auto flex items-center justify-center text-muted-main">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main">No projects found</h3>
                <p className="text-xs text-muted-main max-w-sm mx-auto mt-1">
                  No projects match your current search &quot;{searchQuery}&quot; or filter criteria.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setActiveFolderFilter(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  + Create New Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE ARCHITECTURAL PROJECT DETAILS & BLUEPRINT VAULT MODAL */}
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
                    className="cursor-pointer hover:opacity-80 capitalize"
                    onClick={() => handleToggleProjectStatus(selectedProjectForDetail.id)}
                  >
                    Status: {selectedProjectForDetail.status} (Click to toggle)
                  </Badge>
                  {selectedProjectForDetail.phase && (
                    <span className="text-[10px] font-sans font-semibold text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 px-2 py-0.5 rounded">
                      {selectedProjectForDetail.phase}
                    </span>
                  )}
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

            {/* Architectural Milestones Progression */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
              <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="text-[10px] text-muted-main">Phase 1</span>
                <p className="font-bold mt-0.5">Schematic</p>
                <span className="text-[10px] text-emerald-500">Complete</span>
              </div>
              <div className="p-2.5 rounded-xl border border-accent-cyan bg-accent-cyan/15 text-accent-cyan">
                <span className="text-[10px] text-muted-main">Phase 2</span>
                <p className="font-bold mt-0.5">Design Dev</p>
                <span className="text-[10px] text-accent-cyan">In Progress</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border-main bg-surface-hover text-muted-main">
                <span className="text-[10px] text-muted-main">Phase 3</span>
                <p className="font-bold mt-0.5">Documents</p>
                <span className="text-[10px]">Queued</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border-main bg-surface-hover text-muted-main">
                <span className="text-[10px] text-muted-main">Phase 4</span>
                <p className="font-bold mt-0.5">Construction</p>
                <span className="text-[10px]">Pending</span>
              </div>
            </div>

            {/* ARCHITECTURAL DRAWINGS & BLUEPRINTS VAULT */}
            <div className="space-y-4 border border-border-main bg-surface-hover/30 p-4 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-cyan" />
                    <span>Blueprint & Drawing Sets Vault</span>
                  </h3>
                  <p className="text-[11px] text-muted-main">
                    Official drawing repository & material specification sheets
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadSheetModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center gap-1 self-start sm:self-auto shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Sheet</span>
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
                {(['ALL', 'ARCHITECTURAL', 'STRUCTURAL', 'RENDERS', 'MATERIALS'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setVaultCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer capitalize',
                      vaultCategory === cat
                        ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                        : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {cat.toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Drawing Sheets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {currentProjectDrawings.map((sheet) => (
                  <div
                    key={sheet.id}
                    className="p-3 bg-surface-main border border-border-main rounded-xl flex gap-3 hover:border-accent-cyan transition-all shadow-2xs group"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-border-main relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={sheet.previewUrl} alt={sheet.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-surface-hover border border-border-main rounded text-text-main font-mono">
                            {sheet.sheetNumber}
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded truncate">
                            {sheet.revision}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-text-main truncate mt-1 font-sans">
                          {sheet.title}
                        </h4>
                        <span className="text-[10px] text-muted-main font-mono">{sheet.updatedAt}</span>
                      </div>

                      {/* One-Click Redline in Sketch Action */}
                      {!isContractor && (
                        <div className="pt-2 flex items-center gap-2 font-sans">
                          <button
                            onClick={() => handleRedlineInSketch(sheet)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Open blueprint as background in Sketch Studio to draw revisions"
                          >
                            <PenTool className="w-3 h-3" />
                            <span>Redline in Sketch</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Tasks */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-main font-sans">Linked Tasks & Deliverables</h4>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {tasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-border-main bg-surface-hover flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold truncate font-sans">{t.name}</span>
                    <span className="text-[10px] font-bold text-accent-cyan font-mono">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className={cn(
              "grid gap-3 pt-2 border-t border-border-main font-sans",
              isContractor ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
            )}>
              <button
                onClick={() => {
                  setSelectedProjectForDetail(null);
                  router.push(`/chat?thread=${selectedProjectForDetail.code}`);
                }}
                className="py-2.5 bg-surface-hover hover:bg-surface-main border border-border-main rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-accent-cyan" />
                <span>Open Project Chat</span>
              </button>

              {!isContractor && (
                <button
                  onClick={() => {
                    setSelectedProjectForDetail(null);
                    router.push(`/sketch`);
                  }}
                  className="py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-sm cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Open Sketchboard</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DRAWING SHEET MODAL WITH INTERACTIVE DRAG-AND-DROP */}
      {isUploadSheetModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUploadSheetModalOpen(false);
          }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Upload className="w-4 h-4 text-accent-cyan" />
                <span>Upload Architectural Sheet</span>
              </h3>
              <button
                onClick={() => setIsUploadSheetModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Sheet Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-102"
                  value={newSheetNumber}
                  onChange={(e) => {
                    setNewSheetNumber(e.target.value);
                    if (sheetErrors.number) setSheetErrors((prev) => ({ ...prev, number: undefined }));
                  }}
                  className={cn(
                    "w-full bg-surface-hover p-2.5 border rounded-xl text-xs uppercase focus:outline-none",
                    sheetErrors.number ? "border-rose-500" : "border-border-main focus:border-text-main"
                  )}
                />
                {sheetErrors.number && <p className="text-[10px] text-rose-500 mt-1">⚠ {sheetErrors.number}</p>}
              </div>

              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Sheet Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Second Floor Reflected Ceiling Plan"
                  value={newSheetTitle}
                  onChange={(e) => {
                    setNewSheetTitle(e.target.value);
                    if (sheetErrors.title) setSheetErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  className={cn(
                    "w-full bg-surface-hover p-2.5 border rounded-xl text-xs focus:outline-none",
                    sheetErrors.title ? "border-rose-500" : "border-border-main focus:border-text-main"
                  )}
                />
                {sheetErrors.title && <p className="text-[10px] text-rose-500 mt-1">⚠ {sheetErrors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main block mb-1">Category</label>
                  <select
                    value={newSheetCategory}
                    onChange={(e) => setNewSheetCategory(e.target.value as DrawingSheet['category'])}
                    className="w-full bg-surface-hover border border-border-main p-2 text-xs rounded-xl focus:outline-none"
                  >
                    <option value="ARCHITECTURAL">Architectural</option>
                    <option value="STRUCTURAL">Structural</option>
                    <option value="RENDERS">3D Renders</option>
                    <option value="MATERIALS">Materials Spec</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-text-main block mb-1">Revision Tag</label>
                  <input
                    type="text"
                    value={newSheetRevision}
                    onChange={(e) => setNewSheetRevision(e.target.value)}
                    placeholder="Rev 01"
                    className="w-full bg-surface-hover border border-border-main p-2 text-xs rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* TACTILE DRAG-AND-DROP ZONE */}
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Blueprint / Render File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsSheetDropActive(true);
                  }}
                  onDragLeave={() => setIsSheetDropActive(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsSheetDropActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) await processSheetFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                    isSheetDropActive
                      ? "border-accent-cyan bg-accent-cyan/15 scale-[1.01]"
                      : "border-border-main hover:border-text-main bg-surface-hover/40"
                  )}
                >
                  {isUploadingSheet ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted-main">Uploading sheet to vault...</span>
                    </div>
                  ) : sheetFileName ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-1">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[200px]">{sheetFileName}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSheetFileName(null);
                          setNewSheetFileUrl(null);
                        }}
                        className="text-muted-main hover:text-rose-500 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-6 h-6 mx-auto text-muted-main group-hover:text-text-main" />
                      <p className="text-xs font-semibold text-text-main">
                        Drag &amp; drop architectural sheet, or <span className="text-accent-cyan underline">browse</span>
                      </p>
                      <p className="text-[10px] text-muted-main">Supports PNG, JPG, CAD export images &amp; PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
              <button
                onClick={() => setIsUploadSheetModalOpen(false)}
                className="px-3.5 py-1.5 border border-border-main rounded-xl hover:bg-surface-hover text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSheet}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                Save Sheet to Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW PROJECT MODAL */}
      {isAddProjectModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddProjectModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Plus className="w-4 h-4 text-accent-cyan" />
                <span>Initialize Architectural Project</span>
              </h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alabang Villa Modern"
                  value={newProjName}
                  onChange={(e) => {
                    setNewProjName(e.target.value);
                    if (projErrors.name) setProjErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={cn(
                    "w-full bg-surface-hover p-2.5 border rounded-xl text-xs focus:outline-none",
                    projErrors.name ? "border-rose-500" : "border-border-main focus:border-text-main"
                  )}
                />
                {projErrors.name && <p className="text-[10px] text-rose-500 mt-1">⚠ {projErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-text-main block mb-1">
                    Project Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AVM-2026"
                    value={newProjCode}
                    onChange={(e) => {
                      setNewProjCode(e.target.value);
                      if (projErrors.code) setProjErrors((prev) => ({ ...prev, code: undefined }));
                    }}
                    className={cn(
                      "w-full bg-surface-hover p-2.5 border rounded-xl text-xs uppercase focus:outline-none",
                      projErrors.code ? "border-rose-500" : "border-border-main focus:border-text-main"
                    )}
                  />
                  {projErrors.code && <p className="text-[10px] text-rose-500 mt-1">⚠ {projErrors.code}</p>}
                </div>

                <div>
                  <label className="font-semibold text-text-main block mb-1">Assign Folder</label>
                  <select
                    value={newProjFolder}
                    onChange={(e) => setNewProjFolder(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main p-2.5 text-xs rounded-xl focus:outline-none"
                  >
                    {customFolders.map((f) => (
                      <option key={f} value={f}>
                        {f.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-text-main block mb-1">Client Name / Entity</label>
                <input
                  type="text"
                  placeholder="e.g. Ayala Land Premier / Private Client"
                  value={newProjClient}
                  onChange={(e) => setNewProjClient(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main p-2.5 text-xs rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-text-main block mb-1">Site Location</label>
                <input
                  type="text"
                  placeholder="e.g. Alabang, Muntinlupa City"
                  value={newProjLocation}
                  onChange={(e) => setNewProjLocation(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main p-2.5 text-xs rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="px-3.5 py-1.5 border border-border-main rounded-xl hover:bg-surface-hover text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FOLDER MODAL */}
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
                <Folder className="w-4 h-4 text-accent-cyan" />
                <span>Create Project Category</span>
              </h3>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-text-main block mb-1">
                  Folder / Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TENDER_DOCUMENTS"
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    if (folderError) setFolderError('');
                  }}
                  className={cn(
                    "w-full bg-surface-hover p-2.5 border rounded-xl text-xs uppercase focus:outline-none",
                    folderError ? "border-rose-500" : "border-border-main focus:border-text-main"
                  )}
                />
                {folderError && <p className="text-[10px] text-rose-500 mt-1 font-semibold">⚠ {folderError}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="px-3.5 py-1.5 border border-border-main rounded-xl hover:bg-surface-hover text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFolder}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer active:scale-[0.98] transition-all"
              >
                Save Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FOLDERS MODAL */}
      {isEditFoldersModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditFoldersModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono cursor-pointer animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4 text-text-main cursor-default">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-accent-cyan" />
                <span>Manage Folders</span>
              </h3>
              <button
                onClick={() => setIsEditFoldersModalOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {customFolders.map((f) => (
                <div
                  key={f}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface-hover border border-border-main"
                >
                  <span className="font-semibold text-text-main truncate">{f.replace(/_/g, ' ')}</span>
                  {customFolders.length > 1 && (
                    <button
                      onClick={() => {
                        setCustomFolders((prev) => prev.filter((item) => item !== f));
                        showToast(`✓ Removed folder "${f.replace(/_/g, ' ')}"`);
                      }}
                      className="text-muted-main hover:text-rose-500 font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-border-main">
              <button
                onClick={() => setIsEditFoldersModalOpen(false)}
                className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
