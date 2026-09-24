'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  FolderKanban, Plus, Folder, Search, Edit3, 
  ChevronDown, ChevronRight, X, MessageSquare, 
  PenTool, FileText, Upload, 
  HardHat, ArrowRight
} from 'lucide-react';
import { Project } from '@/types';
import { useTasks } from '@/lib/hooks/useTasks';
import { useAuth } from '@/lib/hooks/useAuth';
import { uploadStudioAsset } from '@/lib/supabase/storage';

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
    projectId: '1',
    sheetNumber: 'A-101',
    title: 'Ground Floor Plan & Massing',
    category: 'ARCHITECTURAL',
    revision: 'Rev 02 - For Approval',
    updatedAt: '2026-09-21',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
  {
    id: 'dwg-2',
    projectId: '1',
    sheetNumber: 'A-201',
    title: 'North & East Elevations',
    category: 'ARCHITECTURAL',
    revision: 'Rev 01 - Schematic',
    updatedAt: '2026-09-20',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
  },
  {
    id: 'dwg-3',
    projectId: '1',
    sheetNumber: 'S-101',
    title: 'Foundation Beam Framing',
    category: 'STRUCTURAL',
    revision: 'Rev 01 - Draft',
    updatedAt: '2026-09-19',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
  },
  {
    id: 'dwg-4',
    projectId: '1',
    sheetNumber: '3D-01',
    title: 'Exterior Daylight Massing Perspective',
    category: 'RENDERS',
    revision: 'Rev 02 - Final Render',
    updatedAt: '2026-09-22',
    previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  },
  {
    id: 'dwg-5',
    projectId: '2',
    sheetNumber: 'MAT-01',
    title: 'Italian Carrara Marble & Dark Oak Spec',
    category: 'MATERIALS',
    revision: 'Rev 01 - Sample Approved',
    updatedAt: '2026-09-21',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tasks } = useTasks();

  const isContractor = user?.role === 'contractor';
  const assignedCodes = useMemo(() => user?.assignedProjectCodes || [], [user?.assignedProjectCodes]);

  const [activeTab, setActiveTab] = useState<'FLAT' | 'TYPE' | 'FOLDER'>('FOLDER');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditFoldersModalOpen, setIsEditFoldersModalOpen] = useState(false);

  const [projectsList, setProjectsList] = useState<Project[]>(MOCK_PROJECTS);

  const visibleProjects = useMemo(() => {
    if (!isContractor) return projectsList;
    return projectsList.filter((p) => assignedCodes.includes(p.code));
  }, [isContractor, assignedCodes, projectsList]);

  const [workingProject, setWorkingProject] = useState<string>('');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);

  const [folderOpenStates, setFolderOpenStates] = useState<Record<string, boolean>>({
    IMPORTANT: true,
    IN_PROGRESS: true,
    DRAFTS: false,
    REVIEWS: false,
    TESTING: false,
    UNCLASSIFIED: false,
  });

  const [drawings, setDrawings] = useState<DrawingSheet[]>(INITIAL_DRAWINGS);
  const [vaultCategory, setVaultCategory] = useState<'ALL' | 'ARCHITECTURAL' | 'STRUCTURAL' | 'RENDERS' | 'MATERIALS'>('ALL');
  const [isUploadSheetModalOpen, setIsUploadSheetModalOpen] = useState(false);
  const [newSheetNumber, setNewSheetNumber] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCategory, setNewSheetCategory] = useState<DrawingSheet['category']>('ARCHITECTURAL');
  const [newSheetRevision, setNewSheetRevision] = useState('Rev 01');
  const [newSheetFileUrl, setNewSheetFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProjName, setNewProjName] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjFolder, setNewProjFolder] = useState('IN_PROGRESS');

  const [customFolders, setCustomFolders] = useState<string[]>([
    'IMPORTANT',
    'IN_PROGRESS',
    'DRAFTS',
    'REVIEWS',
    'TESTING',
    'UNCLASSIFIED',
  ]);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderKey: string) => {
    setFolderOpenStates((prev) => ({
      ...prev,
      [folderKey]: !prev[folderKey],
    }));
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const clean = newFolderName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!customFolders.includes(clean)) {
      setCustomFolders((prev) => [...prev, clean]);
      setFolderOpenStates((prev) => ({ ...prev, [clean]: true }));
    }
    setNewFolderName('');
    setIsAddFolderModalOpen(false);
  };

  const handleDeleteFolder = (fName: string) => {
    setCustomFolders((prev) => prev.filter((f) => f !== fName));
  };

  const handleCreateProject = () => {
    if (!newProjName.trim() || !newProjCode.trim()) {
      alert('Project name and code are required.');
      return;
    }
    const created: Project = {
      id: 'proj-' + Date.now(),
      name: newProjName.trim(),
      code: newProjCode.trim().toUpperCase(),
      status: 'active',
      clientName: newProjClient.trim() || 'Internal Studio',
    };
    setProjectsList((prev) => [created, ...prev]);
    setIsAddProjectModalOpen(false);
    setNewProjName('');
    setNewProjCode('');
    setNewProjClient('');
  };

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
  };

  const handleSheetFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadStudioAsset('blueprints', file);
    if (result.url) {
      setNewSheetFileUrl(result.url);
    }
  };

  const handleAddDrawingSheet = () => {
    if (!newSheetNumber.trim() || !newSheetTitle.trim() || !selectedProjectForDetail) {
      alert('Sheet number and title are required.');
      return;
    }

    const newDwg: DrawingSheet = {
      id: 'dwg-' + Date.now(),
      projectId: selectedProjectForDetail.id,
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
      ? d.projectId === selectedProjectForDetail.id || d.projectId === '1'
      : true;
    const isCat = vaultCategory === 'ALL' || d.category === vaultCategory;
    return isProj && isCat;
  });

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-accent-cyan" />
            <span>Projects Management</span>
          </h1>
          <p className="text-xs text-muted-main mt-1">
            {isContractor
              ? 'Contractor Portal: Assigned project vaults & blueprints only'
              : 'Explore studio folders, architectural schematics, drawing sets, and material boards.'}
          </p>
        </div>
        {!isContractor ? (
          <Button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs py-2 px-4 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>New Project</span>
          </Button>
        ) : (
          <div className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold flex items-center gap-2">
            <HardHat className="w-4 h-4" />
            <span>Assigned Scope Only</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT FOLDERS SIDEBAR */}
        <div className="lg:col-span-4 bg-surface-main border border-border-main rounded-xl p-5 shadow-xs space-y-5">
          {/* GROUP PROJECTS BY */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-main">
              Group Projects By
            </label>
            <div className="grid grid-cols-3 bg-surface-hover/70 p-1 rounded-xl border border-border-main text-xs font-semibold">
              {(['FLAT', 'TYPE', 'FOLDER'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'py-1.5 capitalize rounded-lg text-xs transition-all cursor-pointer',
                    activeTab === tab
                      ? 'bg-surface-main text-text-main font-bold shadow-xs'
                      : 'text-muted-main hover:text-text-main'
                  )}
                >
                  {tab.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* FOLDERS HEADER ROW with EDIT & + ADD */}
          <div className="flex items-center justify-between border-b border-border-main/50 pb-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              Folders ({customFolders.length})
            </span>
            {!isContractor && (
              <div className="flex items-center space-x-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <button
                  onClick={() => setIsEditFoldersModalOpen(true)}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setIsAddFolderModalOpen(true)}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  + Add
                </button>
              </div>
            )}
          </div>

          {/* WHAT PROJECT ARE YOU WORKING ON? Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-main">
                Active Working Project
              </label>
              <Search className="w-3.5 h-3.5 text-muted-main" />
            </div>
            <div className="relative">
              <select
                value={workingProject}
                onChange={(e) => {
                  setWorkingProject(e.target.value);
                  const p = visibleProjects.find((item) => item.id === e.target.value);
                  if (p) setSelectedProjectForDetail(p);
                }}
                className="w-full bg-surface-hover/70 border border-border-main p-2.5 text-xs font-semibold rounded-xl appearance-none pr-10 focus:outline-none focus:border-text-main text-text-main"
              >
                <option value="">-- Select Project --</option>
                {visibleProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-muted-main pointer-events-none" />
            </div>
          </div>

          {/* FOLDERS LIST STACK */}
          <div className="space-y-2.5 pt-1">
            {customFolders.map((folderKey) => {
              const isOpen = folderOpenStates[folderKey];
              const formattedName = folderKey.replace(/_/g, ' ');
              return (
                <div key={folderKey} className="space-y-1.5">
                  <button
                    onClick={() => toggleFolder(folderKey)}
                    className="w-full p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-semibold text-xs hover:bg-emerald-500/20 transition-colors cursor-pointer capitalize"
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      <span>{formattedName.toLowerCase()}</span>
                    </span>
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {isOpen && (
                    <div className="pl-6 text-xs text-muted-main py-1 space-y-1">
                      {folderKey === 'IN_PROGRESS' || folderKey === 'IMPORTANT' ? (
                        visibleProjects.slice(0, 2).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProjectForDetail(p)}
                            className="text-xs font-semibold text-text-main hover:text-accent-cyan cursor-pointer truncate"
                          >
                            • [{p.code}] {p.name}
                          </div>
                        ))
                      ) : (
                        <div className="italic text-muted-main/60">Empty folder</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PROJECTS LIST COLUMN */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-main" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name or code..."
              className="w-full bg-surface-main border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-text-main focus:outline-none focus:border-text-main shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {visibleProjects
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.code.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectForDetail(project)}
                  className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-4 sm:p-5 hover:border-accent-cyan transition-all gap-4 shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="px-2.5 py-1 bg-surface-hover border border-border-main rounded text-xs font-bold text-text-main font-mono group-hover:border-accent-cyan">
                      {project.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-text-main group-hover:text-accent-cyan transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-main font-sans mt-0.5">{project.clientName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* COMPREHENSIVE ARCHITECTURAL PROJECT DETAILS & BLUEPRINT VAULT MODAL */}
      {selectedProjectForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono overflow-y-auto">
          <div className="bg-surface-main border border-border-main w-full max-w-4xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-text-main relative my-auto">
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
                </div>
                <h2 className="text-xl font-bold text-text-main mt-2">
                  {selectedProjectForDetail.name}
                </h2>
                <p className="text-xs text-muted-main mt-0.5">Client: {selectedProjectForDetail.clientName}</p>
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
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-surface-hover border border-border-main rounded text-text-main">
                            {sheet.sheetNumber}
                          </span>
                          <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded truncate">
                            {sheet.revision}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-text-main truncate mt-1">
                          {sheet.title}
                        </h4>
                        <span className="text-[10px] text-muted-main">{sheet.updatedAt}</span>
                      </div>

                      {/* One-Click Redline in Sketch Action */}
                      {!isContractor && (
                        <div className="pt-2 flex items-center gap-2">
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
              <h4 className="text-xs font-semibold text-muted-main">Linked Tasks & Deliverables</h4>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {tasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-border-main bg-surface-hover flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold truncate">{t.name}</span>
                    <span className="text-[10px] font-bold text-accent-cyan">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className={cn(
              "grid gap-3 pt-2 border-t border-border-main",
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

      {/* UPLOAD DRAWING SHEET MODAL */}
      {isUploadSheetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Upload className="w-4 h-4 text-accent-cyan" />
                <span>Upload Drawing Sheet / Spec</span>
              </h3>
              <button onClick={() => setIsUploadSheetModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Sheet Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-102, S-201, 3D-02"
                  value={newSheetNumber}
                  onChange={(e) => setNewSheetNumber(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Sheet Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Second Floor Framing & Cantilever"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-main block mb-1">
                    Category
                  </label>
                  <select
                    value={newSheetCategory}
                    onChange={(e) => setNewSheetCategory(e.target.value as DrawingSheet['category'])}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main"
                  >
                    <option value="ARCHITECTURAL">Architectural</option>
                    <option value="STRUCTURAL">Structural</option>
                    <option value="RENDERS">3D Renders</option>
                    <option value="MATERIALS">Materials</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-main block mb-1">
                    Revision
                  </label>
                  <input
                    type="text"
                    value={newSheetRevision}
                    onChange={(e) => setNewSheetRevision(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Attach Drawing File / Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSheetFileUpload}
                  accept="image/*,.pdf"
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white dark:file:bg-white dark:file:text-black cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddDrawingSheet}
                className="py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 cursor-pointer"
              >
                Save to Vault
              </button>
              <button
                onClick={() => setIsUploadSheetModalOpen(false)}
                className="py-2.5 bg-surface-hover border border-border-main text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Folders Modal */}
      {isEditFoldersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main">Edit Studio Folders</h3>
              <button onClick={() => setIsEditFoldersModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customFolders.map((f) => (
                <div
                  key={f}
                  className="flex items-center justify-between p-2.5 bg-surface-hover rounded-lg border border-border-main text-xs font-semibold capitalize"
                >
                  <span>{f.replace(/_/g, ' ').toLowerCase()}</span>
                  <button
                    onClick={() => handleDeleteFolder(f)}
                    className="text-rose-600 hover:underline text-[11px] cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsEditFoldersModalOpen(false)}
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 text-text-main relative">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main">Add New Folder</h3>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="p-1 text-muted-main hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-main block">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Archived Schematics"
                className="w-full bg-surface-hover border border-border-main p-2.5 text-xs font-mono text-text-main rounded-xl focus:outline-none focus:border-accent-cyan placeholder:text-muted-main/60"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddFolder}
                className="py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Create
              </button>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="py-2.5 bg-surface-hover border border-border-main text-text-main font-semibold text-xs rounded-xl hover:bg-surface-main transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-7 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main">
                Initialize New Project
              </h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="p-1 text-muted-main hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Cebu Tower Complex"
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-2.5 text-xs font-mono text-text-main rounded-xl focus:outline-none placeholder:text-muted-main/60"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Project Code *
                </label>
                <input
                  type="text"
                  value={newProjCode}
                  onChange={(e) => setNewProjCode(e.target.value)}
                  placeholder="e.g. CTC-2026"
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-2.5 text-xs font-mono text-text-main rounded-xl focus:outline-none uppercase placeholder:text-muted-main/60"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={newProjClient}
                  onChange={(e) => setNewProjClient(e.target.value)}
                  placeholder="e.g. Cebu Holdings Corp."
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-2.5 text-xs font-mono text-text-main rounded-xl focus:outline-none placeholder:text-muted-main/60"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Assign to Folder
                </label>
                <select
                  value={newProjFolder}
                  onChange={(e) => setNewProjFolder(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-2.5 text-xs font-mono text-text-main rounded-xl focus:outline-none capitalize"
                >
                  {customFolders.map((f) => (
                    <option key={f} value={f} className="bg-surface-main text-text-main">
                      {f.replace(/_/g, ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-main">
              <button
                onClick={handleCreateProject}
                className="py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Initialize
              </button>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="py-2.5 bg-surface-hover border border-border-main text-text-main font-semibold text-xs rounded-xl hover:bg-surface-main transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
