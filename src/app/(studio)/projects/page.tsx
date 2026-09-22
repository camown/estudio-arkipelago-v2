'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { FolderKanban, Plus, Folder, Search, Edit3, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Project } from '@/types';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<'FLAT' | 'TYPE' | 'FOLDER'>('FOLDER');
  const [workingProject, setWorkingProject] = useState(MOCK_PROJECTS[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  
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
        {/* LEFT FOLDERS SIDEBAR matching Screenshot 4 */}
        <div className="lg:col-span-4 bg-surface-main border border-border-main rounded-xl p-5 shadow-xs space-y-6">
          {/* GROUP PROJECTS BY (Matching Screenshot 4) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-main uppercase tracking-widest">
              GROUP PROJECTS BY
            </label>
            <div className="grid grid-cols-3 bg-surface-hover/70 p-1 rounded-xl border border-border-main text-xs font-extrabold">
              <button
                onClick={() => setActiveTab('FLAT')}
                className={cn(
                  'py-1.5 uppercase rounded-lg text-[11px] transition-all',
                  activeTab === 'FLAT'
                    ? 'bg-surface-main text-text-main shadow-xs'
                    : 'text-muted-main hover:text-text-main'
                )}
              >
                FLAT
              </button>
              <button
                onClick={() => setActiveTab('TYPE')}
                className={cn(
                  'py-1.5 uppercase rounded-lg text-[11px] transition-all',
                  activeTab === 'TYPE'
                    ? 'bg-surface-main text-text-main shadow-xs'
                    : 'text-muted-main hover:text-text-main'
                )}
              >
                TYPE
              </button>
              <button
                onClick={() => setActiveTab('FOLDER')}
                className={cn(
                  'py-1.5 uppercase rounded-lg text-[11px] transition-all',
                  activeTab === 'FOLDER'
                    ? 'bg-surface-main text-text-main shadow-xs'
                    : 'text-muted-main hover:text-text-main'
                )}
              >
                FOLDER
              </button>
            </div>
          </div>

          {/* FOLDERS HEADER ROW with EDIT & + ADD (Matching Screenshot 4) */}
          <div className="flex items-center justify-between border-b border-border-main/50 pb-2">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              FOLDERS
            </span>
            <div className="flex items-center space-x-3 text-[11px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400">
              <button className="hover:underline flex items-center gap-1">
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

          {/* WHAT PROJECT ARE YOU WORKING ON? Dropdown (Matching Screenshot 4) */}
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
                onChange={(e) => setWorkingProject(e.target.value)}
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

          {/* FOLDERS LIST STACK matching Screenshot 4 */}
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
                      {formattedName} (0)
                    </span>
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="pl-6 text-[10px] text-muted-main italic uppercase py-1">
                      EMPTY FOLDER
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
                  className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-5 hover:border-text-main transition-all gap-4 shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-surface-hover border border-border-main rounded text-xs font-bold text-text-main font-mono">
                      {project.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold uppercase text-text-main tracking-wider">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-main font-sans mt-0.5">
                        {project.clientName}
                      </p>
                    </div>
                  </div>

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
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Add Folder Modal */}
      {isAddFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-[#262626] border border-[#3F3F46] w-full max-w-md rounded-2xl shadow-2xl p-7 space-y-6 text-white relative">
            <div className="flex items-center justify-between border-b border-[#3F3F46] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#E4E4E7]">
                ADD NEW FOLDER
              </h3>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block">
                FOLDER NAME
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="E.G. ARCHIVED SCHEMATICS"
                className="w-full bg-[#18181B] border-2 border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase tracking-wider placeholder-[#52525B]"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddFolder}
                className="py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-md"
              >
                CREATE
              </button>
              <button
                onClick={() => setIsAddFolderModalOpen(false)}
                className="py-3 bg-[#3F3F46]/60 border border-[#52525B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-[#3F3F46] transition-colors"
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
          <div className="bg-[#262626] border border-[#3F3F46] w-full max-w-md rounded-2xl shadow-2xl p-7 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#3F3F46] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#E4E4E7]">
                INITIALIZE NEW PROJECT
              </h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  PROJECT NAME *
                </label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="E.G. CEBU TOWER COMPLEX"
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  PROJECT CODE *
                </label>
                <input
                  type="text"
                  value={newProjCode}
                  onChange={(e) => setNewProjCode(e.target.value)}
                  placeholder="E.G. CTC-2026"
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">CLIENT NAME</label>
                <input
                  type="text"
                  value={newProjClient}
                  onChange={(e) => setNewProjClient(e.target.value)}
                  placeholder="E.G. CEBU HOLDINGS"
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">ASSIGN TO FOLDER</label>
                <select
                  value={newProjFolder}
                  onChange={(e) => setNewProjFolder(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase font-bold"
                >
                  {customFolders.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleCreateProject}
                className="py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-md"
              >
                INITIALIZE
              </button>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="py-3 bg-[#3F3F46]/60 border border-[#52525B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-[#3F3F46] transition-colors"
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
