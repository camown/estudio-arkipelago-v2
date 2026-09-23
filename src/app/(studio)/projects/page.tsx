'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  FolderKanban, Plus, Folder, Search, Edit3, 
  ChevronDown, ChevronRight, X, MessageSquare, 
  PenTool, FileText, Upload, Eye, 
  HardHat, Box, Palette, ArrowRight
} from 'lucide-react';
import { Project } from '@/types';
import { useTasks } from '@/lib/hooks/useTasks';

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
    title: 'GROUND FLOOR PLAN & MASSING',
    category: 'ARCHITECTURAL',
    revision: 'REV 02 - FOR APPROVAL',
    updatedAt: '2026-09-21',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  },
  {
    id: 'dwg-2',
    projectId: '1',
    sheetNumber: 'A-201',
    title: 'NORTH & EAST ELEVATIONS',
    category: 'ARCHITECTURAL',
    revision: 'REV 01 - SCHEMATIC',
    updatedAt: '2026-09-20',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
  },
  {
    id: 'dwg-3',
    projectId: '1',
    sheetNumber: 'S-101',
    title: 'FOUNDATION BEAM FRAMING',
    category: 'STRUCTURAL',
    revision: 'REV 01 - DRAFT',
    updatedAt: '2026-09-19',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f7?w=600&q=80',
  },
  {
    id: 'dwg-4',
    projectId: '1',
    sheetNumber: '3D-01',
    title: 'EXTERIOR DAYLIGHT MASSING PERSPECTIVE',
    category: 'RENDERS',
    revision: 'REV 02 - FINAL RENDER',
    updatedAt: '2026-09-22',
    previewUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  },
  {
    id: 'dwg-5',
    projectId: '2',
    sheetNumber: 'MAT-01',
    title: 'ITALIAN CARRARA MARBLE & DARK OAK SPEC',
    category: 'MATERIALS',
    revision: 'REV 01 - SAMPLE APPROVED',
    updatedAt: '2026-09-21',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=600&q=80',
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { tasks } = useTasks();

  const [activeTab, setActiveTab] = useState<'FLAT' | 'TYPE' | 'FOLDER'>('FOLDER');
  const [workingProject, setWorkingProject] = useState(MOCK_PROJECTS[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditFoldersModalOpen, setIsEditFoldersModalOpen] = useState(false);
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<Project | null>(null);

  // Drawing Vault State
  const [drawings, setDrawings] = useState<DrawingSheet[]>(INITIAL_DRAWINGS);
  const [vaultCategory, setVaultCategory] = useState<'ALL' | 'ARCHITECTURAL' | 'STRUCTURAL' | 'RENDERS' | 'MATERIALS'>('ALL');
  const [isUploadSheetModalOpen, setIsUploadSheetModalOpen] = useState(false);
  const [newSheetNumber, setNewSheetNumber] = useState('');
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [newSheetCategory, setNewSheetCategory] = useState<DrawingSheet['category']>('ARCHITECTURAL');
  const [newSheetRevision, setNewSheetRevision] = useState('REV 01 - SCHEMATIC');
  const [newSheetFileUrl, setNewSheetFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folderOpenStates, setFolderOpenStates] = useState<Record<string, boolean>>({
    IMPORTANT: true,
    IN_PROGRESS: true,
    DRAFTS: false,
    REVIEWS: false,
    TESTING: false,
    UNCLASSIFIED: true,
  });

  const [projectsList, setProjectsList] = useState<Project[]>(MOCK_PROJECTS);

  // New Project State
  const [newProjName, setNewProjName] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjFolder, setNewProjFolder] = useState('IN_PROGRESS');

  // Custom Folders State
  const [customFolders, setCustomFolders] = useState<string[]>([
    'IMPORTANT',
    'IN_PROGRESS',
    'DRAFTS',
    'REVIEWS',
    'TESTING',
    'UNCLASSIFIED',
  ]);
  const [newFolderName, setNewFolderName] = useState('');

  // Handle URL deep-linking (?project=CV-2024)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const projParam = params.get('project') || params.get('code');
    if (projParam) {
      const match = projectsList.find(
        (p) => p.code.toLowerCase() === projParam.toLowerCase() || p.id === projParam
      );
      if (match) {
        setSelectedProjectForDetail(match);
      }
    }
  }, [projectsList]);

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
      alert('PROJECT NAME AND CODE ARE REQUIRED.');
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

  const handleSheetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setNewSheetFileUrl(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddDrawingSheet = () => {
    if (!newSheetNumber.trim() || !newSheetTitle.trim() || !selectedProjectForDetail) {
      alert('SHEET NUMBER AND TITLE ARE REQUIRED.');
      return;
    }

    const newDwg: DrawingSheet = {
      id: 'dwg-' + Date.now(),
      projectId: selectedProjectForDetail.id,
      sheetNumber: newSheetNumber.trim().toUpperCase(),
      title: newSheetTitle.trim().toUpperCase(),
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
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-text-main flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-accent-cyan" />
            PROJECTS MANAGEMENT
          </h1>
          <p className="text-xs text-muted-main uppercase tracking-widest mt-1">
            EXPLORE STUDIO FOLDERS, BLUEPRINTS, SCHEMATICS, AND MATERIAL BOARDS
          </p>
        </div>
        <Button
          onClick={() => setIsAddProjectModalOpen(true)}
          className="rounded-lg bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider font-bold text-xs py-2.5 px-4 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          NEW PROJECT
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT FOLDERS SIDEBAR */}
        <div className="lg:col-span-4 bg-surface-main border border-border-main rounded-xl p-5 shadow-xs space-y-6">
          {/* GROUP PROJECTS BY */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-main uppercase tracking-widest">
              GROUP PROJECTS BY
            </label>
            <div className="grid grid-cols-3 bg-surface-hover/70 p-1 rounded-xl border border-border-main text-xs font-extrabold">
              {(['FLAT', 'TYPE', 'FOLDER'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'py-1.5 uppercase rounded-lg text-[11px] transition-all',
                    activeTab === tab
                      ? 'bg-surface-main text-text-main shadow-xs'
                      : 'text-muted-main hover:text-text-main'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* FOLDERS HEADER ROW with EDIT & + ADD */}
          <div className="flex items-center justify-between border-b border-border-main/50 pb-2">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              FOLDERS ({customFolders.length})
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
              <button
                onClick={() => setIsEditFoldersModalOpen(true)}
                className="hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> EDIT
              </button>
              <button
                onClick={() => setIsAddFolderModalOpen(true)}
                className="hover:underline flex items-center gap-1"
              >
                + ADD
              </button>
            </div>
          </div>

          {/* WHAT PROJECT ARE YOU WORKING ON? Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-main uppercase tracking-widest">
                WHAT PROJECT ARE YOU WORKING ON?
              </label>
              <Search className="w-3.5 h-3.5 text-muted-main" />
            </div>
            <div className="relative">
              <select
                value={workingProject}
                onChange={(e) => {
                  setWorkingProject(e.target.value);
                  const p = projectsList.find((item) => item.id === e.target.value);
                  if (p) setSelectedProjectForDetail(p);
                }}
                className="w-full bg-surface-hover/70 border border-border-main p-3 text-xs font-extrabold uppercase tracking-wider rounded-xl appearance-none pr-10 focus:outline-none focus:border-text-main text-text-main"
              >
                <option value="">-- WORKING PROJECT --</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-muted-main pointer-events-none" />
            </div>
          </div>

          {/* FOLDERS LIST STACK */}
          <div className="space-y-3 pt-2">
            {customFolders.map((folderKey) => {
              const isOpen = folderOpenStates[folderKey];
              const formattedName = folderKey.replace(/_/g, ' ');
              return (
                <div key={folderKey} className="space-y-1.5">
                  <button
                    onClick={() => toggleFolder(folderKey)}
                    className="w-full p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider hover:bg-emerald-500/20 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {formattedName}
                    </span>
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {isOpen && (
                    <div className="pl-6 text-[10px] text-muted-main uppercase py-1 space-y-1">
                      {folderKey === 'IN_PROGRESS' || folderKey === 'IMPORTANT' ? (
                        projectsList.slice(0, 2).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedProjectForDetail(p)}
                            className="text-xs font-bold text-text-main hover:text-accent-cyan cursor-pointer truncate"
                          >
                            • [{p.code}] {p.name}
                          </div>
                        ))
                      ) : (
                        <div className="italic text-muted-main/60">EMPTY FOLDER</div>
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
              placeholder="SEARCH PROJECTS BY NAME OR CODE..."
              className="w-full bg-surface-main border border-border-main rounded-xl py-3 pl-10 pr-4 text-xs font-mono uppercase text-text-main focus:outline-none focus:border-text-main shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projectsList
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.code.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectForDetail(project)}
                  className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-5 hover:border-accent-cyan transition-all gap-4 shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-surface-hover border border-border-main rounded text-xs font-bold text-text-main font-mono group-hover:border-accent-cyan">
                      {project.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold uppercase text-text-main tracking-wider group-hover:text-accent-cyan transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-main font-sans mt-0.5">{project.clientName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded font-mono uppercase text-xs px-3 py-1 font-bold border',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono overflow-y-auto">
          <div className="bg-surface-main border border-border-main w-full max-w-4xl rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-text-main relative my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border-main pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-xs font-extrabold rounded">
                    {selectedProjectForDetail.code}
                  </span>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:opacity-80"
                    onClick={() => handleToggleProjectStatus(selectedProjectForDetail.id)}
                  >
                    STATUS: {selectedProjectForDetail.status.toUpperCase()} (CLICK TO CHANGE)
                  </Badge>
                </div>
                <h2 className="text-xl font-black uppercase tracking-wide text-text-main mt-2">
                  {selectedProjectForDetail.name}
                </h2>
                <p className="text-xs text-muted-main mt-0.5">CLIENT: {selectedProjectForDetail.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                className="w-8 h-8 rounded-full border border-border-main hover:bg-surface-hover flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Architectural Milestones Progression */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase">
              <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span>PHASE 1</span>
                <p className="font-extrabold text-xs mt-0.5">SCHEMATIC</p>
                <span className="text-[9px] text-emerald-500">COMPLETE</span>
              </div>
              <div className="p-2.5 rounded-xl border border-accent-cyan bg-accent-cyan/15 text-accent-cyan">
                <span>PHASE 2</span>
                <p className="font-extrabold text-xs mt-0.5">DESIGN DEV</p>
                <span className="text-[9px] text-accent-cyan">IN PROGRESS</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border-main bg-surface-hover text-muted-main">
                <span>PHASE 3</span>
                <p className="font-extrabold text-xs mt-0.5">DOCUMENTS</p>
                <span className="text-[9px]">QUEUED</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border-main bg-surface-hover text-muted-main">
                <span>PHASE 4</span>
                <p className="font-extrabold text-xs mt-0.5">CONSTRUCTION</p>
                <span className="text-[9px]">PENDING</span>
              </div>
            </div>

            {/* ARCHITECTURAL DRAWINGS & BLUEPRINTS VAULT */}
            <div className="space-y-4 border border-border-main bg-surface-hover/30 p-4 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-text-main flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-cyan" />
                    BLUEPRINT & DRAWING SETS VAULT
                  </h3>
                  <p className="text-[10px] text-muted-main uppercase">
                    OFFICIAL DRAWING REPOSITORY & SPECIFICATION SHEETS
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadSheetModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>UPLOAD SHEET</span>
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] font-bold uppercase">
                {(['ALL', 'ARCHITECTURAL', 'STRUCTURAL', 'RENDERS', 'MATERIALS'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setVaultCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap',
                      vaultCategory === cat
                        ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                        : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {cat}
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
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-surface-hover border border-border-main rounded text-text-main">
                            {sheet.sheetNumber}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded truncate">
                            {sheet.revision}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold uppercase text-text-main truncate mt-1">
                          {sheet.title}
                        </h4>
                        <span className="text-[9px] text-muted-main">{sheet.updatedAt}</span>
                      </div>

                      {/* One-Click Redline in Sketch Action */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleRedlineInSketch(sheet)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-colors shadow-2xs"
                          title="Open blueprint as background in Sketch Studio to draw revisions"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>REDLINE IN SKETCH</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Linked Tasks */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-main">LINKED TASKS & DELIVERABLES</h4>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {tasks.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-border-main bg-surface-hover flex items-center justify-between text-xs"
                  >
                    <span className="font-bold uppercase truncate">{t.name}</span>
                    <span className="text-[10px] font-extrabold text-accent-cyan uppercase">{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border-main">
              <button
                onClick={() => {
                  setSelectedProjectForDetail(null);
                  router.push(`/chat?thread=${selectedProjectForDetail.code}`);
                }}
                className="py-3 bg-surface-hover hover:bg-surface-main border border-border-main rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-accent-cyan" />
                <span>OPEN PROJECT CHAT</span>
              </button>

              <button
                onClick={() => {
                  setSelectedProjectForDetail(null);
                  router.push(`/sketch`);
                }}
                className="py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 shadow-sm"
              >
                <PenTool className="w-4 h-4" />
                <span>OPEN SKETCHBOARD</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DRAWING SHEET MODAL */}
      {isUploadSheetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-main flex items-center gap-2">
                <Upload className="w-4 h-4 text-accent-cyan" />
                UPLOAD DRAWING SHEET / SPEC
              </h3>
              <button onClick={() => setIsUploadSheetModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase block mb-1">
                  SHEET NUMBER *
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-102, S-201, 3D-02"
                  value={newSheetNumber}
                  onChange={(e) => setNewSheetNumber(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2.5 text-xs font-mono text-text-main uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase block mb-1">
                  SHEET TITLE *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SECOND FLOOR FRAMING & CANTILEVER"
                  value={newSheetTitle}
                  onChange={(e) => setNewSheetTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2.5 text-xs font-mono text-text-main uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-main uppercase block mb-1">
                    CATEGORY
                  </label>
                  <select
                    value={newSheetCategory}
                    onChange={(e) => setNewSheetCategory(e.target.value as DrawingSheet['category'])}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main uppercase"
                  >
                    <option value="ARCHITECTURAL">ARCHITECTURAL</option>
                    <option value="STRUCTURAL">STRUCTURAL</option>
                    <option value="RENDERS">3D RENDERS</option>
                    <option value="MATERIALS">MATERIALS</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-main uppercase block mb-1">
                    REVISION
                  </label>
                  <input
                    type="text"
                    value={newSheetRevision}
                    onChange={(e) => setNewSheetRevision(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase block mb-1">
                  ATTACH DRAWING FILE / PDF / IMAGE
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleSheetFileUpload}
                  accept="image/*,.pdf"
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-black file:text-white dark:file:bg-white dark:file:text-black cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddDrawingSheet}
                className="py-2.5 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:opacity-90"
              >
                SAVE TO VAULT
              </button>
              <button
                onClick={() => setIsUploadSheetModalOpen(false)}
                className="py-2.5 bg-surface-hover border border-border-main text-xs font-bold uppercase rounded-xl"
              >
                CANCEL
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
              <h3 className="text-xs font-bold uppercase tracking-widest">EDIT STUDIO FOLDERS</h3>
              <button onClick={() => setIsEditFoldersModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {customFolders.map((f) => (
                <div
                  key={f}
                  className="flex items-center justify-between p-2.5 bg-surface-hover rounded-lg border border-border-main text-xs font-bold uppercase"
                >
                  <span>{f.replace(/_/g, ' ')}</span>
                  <button
                    onClick={() => handleDeleteFolder(f)}
                    className="text-accent-red hover:underline text-[10px]"
                  >
                    DELETE
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsEditFoldersModalOpen(false)}
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold uppercase"
            >
              DONE
            </button>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-7 space-y-6 text-text-main relative">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-main">ADD NEW FOLDER</h3>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="p-1 text-muted-main hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-main uppercase tracking-wider block">
                FOLDER NAME
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="E.G. ARCHIVED SCHEMATICS"
                className="w-full bg-surface-hover border-2 border-accent-cyan p-3 text-xs font-mono text-text-main rounded-xl focus:outline-none uppercase tracking-wider placeholder:text-muted-main/60"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddFolder}
                className="py-3 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                CREATE
              </button>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="py-3 bg-surface-hover border border-border-main text-text-main font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-border-main/40 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-7 space-y-5 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-main">
                INITIALIZE NEW PROJECT
              </h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="p-1 text-muted-main hover:text-text-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase tracking-wider block mb-1">
                  PROJECT NAME *
                </label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="E.G. CEBU TOWER COMPLEX"
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-3 text-xs font-mono text-text-main rounded-xl focus:outline-none uppercase placeholder:text-muted-main/60"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase tracking-wider block mb-1">
                  PROJECT CODE *
                </label>
                <input
                  type="text"
                  value={newProjCode}
                  onChange={(e) => setNewProjCode(e.target.value)}
                  placeholder="E.G. CTC-2026"
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-3 text-xs font-mono text-text-main rounded-xl focus:outline-none uppercase placeholder:text-muted-main/60"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase tracking-wider block mb-1">
                  CLIENT NAME
                </label>
                <input
                  type="text"
                  value={newProjClient}
                  onChange={(e) => setNewProjClient(e.target.value)}
                  placeholder="E.G. CEBU HOLDINGS"
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-3 text-xs font-mono text-text-main rounded-xl focus:outline-none uppercase placeholder:text-muted-main/60"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-main uppercase tracking-wider block mb-1">
                  ASSIGN TO FOLDER
                </label>
                <select
                  value={newProjFolder}
                  onChange={(e) => setNewProjFolder(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main focus:border-accent-cyan p-3 text-xs font-mono text-text-main rounded-xl focus:outline-none uppercase font-bold"
                >
                  {customFolders.map((f) => (
                    <option key={f} value={f} className="bg-surface-main text-text-main">
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCreateProject}
                className="py-3 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                INITIALIZE
              </button>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="py-3 bg-surface-hover border border-border-main text-text-main font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-border-main/40 transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
