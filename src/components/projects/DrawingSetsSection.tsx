'use client';

import React, { useState } from 'react';
import { 
  ArchitecturalSheet, 
  DrawingDiscipline 
} from '@/types';
import { 
  FileText, 
  Plus, 
  PenTool, 
  X,
  Search,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawingSetsSectionProps {
  projectId: string;
  projectCode: string;
  onRedline?: (sheet: ArchitecturalSheet) => void;
}

const DISCIPLINES: DrawingDiscipline[] = [
  'A-000 GENERAL / SITE',
  'A-100 PLANS',
  'A-200 ELEVATIONS',
  'A-300 SECTIONS',
  'A-400 BLOW-UPS & DETAILS',
  'A-500 SCHEDULES',
  'S-100 STRUCTURAL',
  'M-100 MECHANICAL',
  'E-100 ELECTRICAL',
  'P-100 PLUMBING'
];

export function DrawingSetsSection({
  projectId,
  projectCode,
  onRedline
}: DrawingSetsSectionProps) {
  const [selectedDiscipline, setSelectedDiscipline] = useState<DrawingDiscipline | 'ALL'>('ALL');
  const [planTypeFilter, setPlanTypeFilter] = useState<'ALL' | 'BID' | 'PERMIT' | 'CONSTRUCTION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Realistic architectural sheet sets ported from beta-estudio
  const [sheets, setSheets] = useState<ArchitecturalSheet[]>([
    // A-000 Series
    { id: 'sh-1', projectId, code: 'A-000', title: 'COVER SHEET & DRAWING INDEX', discipline: 'A-000 GENERAL / SITE', planType: 'BOTH', assignedTo: 'Arch. Sofia Reyes', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-20' },
    { id: 'sh-2', projectId, code: 'A-001', title: 'SITE DEVELOPMENT PLAN & VICINITY', discipline: 'A-000 GENERAL / SITE', planType: 'PERMIT', assignedTo: 'Arch. Carlos Mendoza', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-21' },
    
    // A-100 Series
    { id: 'sh-3', projectId, code: 'A-101', title: 'GROUND FLOOR PLAN & MASSING', discipline: 'A-100 PLANS', planType: 'BOTH', assignedTo: 'Arch. Carlos Mendoza', status: 'COMPLETED', revision: 'Rev 03', updatedAt: '2026-09-22' },
    { id: 'sh-4', projectId, code: 'A-102', title: 'SECOND FLOOR & MEZZANINE PLAN', discipline: 'A-100 PLANS', planType: 'BOTH', assignedTo: 'Arch. Carlos Mendoza', status: 'IN_PROGRESS', revision: 'Rev 01', updatedAt: '2026-09-23' },
    { id: 'sh-5', projectId, code: 'A-103', title: 'ROOF PLAN & RAINWATER DRAINAGE', discipline: 'A-100 PLANS', planType: 'PERMIT', assignedTo: 'Elena G.', status: 'IN_PROGRESS', revision: 'Rev 01', updatedAt: '2026-09-24' },
    { id: 'sh-6', projectId, code: 'A-104', title: 'REFLECTED CEILING PLANS (RCP)', discipline: 'A-100 PLANS', planType: 'CONSTRUCTION', assignedTo: 'Mark Tan', status: 'PENDING', revision: 'Rev 00', updatedAt: '2026-09-25' },

    // A-200 Series
    { id: 'sh-7', projectId, code: 'A-201', title: 'FRONT & REAR ELEVATIONS', discipline: 'A-200 ELEVATIONS', planType: 'BOTH', assignedTo: 'Arch. Sofia Reyes', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-21' },
    { id: 'sh-8', projectId, code: 'A-202', title: 'LEFT & RIGHT LONGITUDINAL ELEVATIONS', discipline: 'A-200 ELEVATIONS', planType: 'BOTH', assignedTo: 'Arch. Sofia Reyes', status: 'COMPLETED', revision: 'Rev 01', updatedAt: '2026-09-21' },

    // A-300 Series
    { id: 'sh-9', projectId, code: 'A-301', title: 'LONGITUDINAL BUILDING SECTION A-A', discipline: 'A-300 SECTIONS', planType: 'BOTH', assignedTo: 'Elena G.', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-22' },
    { id: 'sh-10', projectId, code: 'A-302', title: 'TRANSVERSE BUILDING SECTION B-B', discipline: 'A-300 SECTIONS', planType: 'BOTH', assignedTo: 'Elena G.', status: 'IN_PROGRESS', revision: 'Rev 01', updatedAt: '2026-09-23' },

    // A-400 Series
    { id: 'sh-11', projectId, code: 'A-401', title: 'STAIR BLOW-UPS & BALUSTRADE DETAILS', discipline: 'A-400 BLOW-UPS & DETAILS', planType: 'CONSTRUCTION', assignedTo: 'Mark Tan', status: 'IN_PROGRESS', revision: 'Rev 01', updatedAt: '2026-09-24' },
    { id: 'sh-12', projectId, code: 'A-402', title: 'TOILET & BATHROOM BLOW-UP PLANS', discipline: 'A-400 BLOW-UPS & DETAILS', planType: 'CONSTRUCTION', assignedTo: 'Elena G.', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-25' },

    // A-500 Series
    { id: 'sh-13', projectId, code: 'A-501', title: 'SCHEDULE OF DOORS & HARDWARE SPECS', discipline: 'A-500 SCHEDULES', planType: 'BID', assignedTo: 'Mark Tan', status: 'COMPLETED', revision: 'Rev 01', updatedAt: '2026-09-22' },
    { id: 'sh-14', projectId, code: 'A-502', title: 'SCHEDULE OF WINDOWS & GLAZING SPECS', discipline: 'A-500 SCHEDULES', planType: 'BID', assignedTo: 'Mark Tan', status: 'COMPLETED', revision: 'Rev 01', updatedAt: '2026-09-22' },

    // Engineering Series
    { id: 'sh-15', projectId, code: 'S-101', title: 'FOUNDATION & COLUMN FOOTING PLAN', discipline: 'S-100 STRUCTURAL', planType: 'BOTH', assignedTo: 'Engr. Cruz', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-19' },
    { id: 'sh-16', projectId, code: 'S-102', title: 'FLOOR FRAMING & SLAB REINFORCEMENTS', discipline: 'S-100 STRUCTURAL', planType: 'BOTH', assignedTo: 'Engr. Cruz', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-20' },
    { id: 'sh-17', projectId, code: 'M-101', title: 'HVAC AIR CONDITIONING DUCTING LAYOUT', discipline: 'M-100 MECHANICAL', planType: 'CONSTRUCTION', assignedTo: 'Engr. Alcantara', status: 'IN_PROGRESS', revision: 'Rev 01', updatedAt: '2026-09-24' },
    { id: 'sh-18', projectId, code: 'E-101', title: 'LIGHTING & POWER RECEPTACLE LAYOUT', discipline: 'E-100 ELECTRICAL', planType: 'BOTH', assignedTo: 'Engr. Santos', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-22' },
    { id: 'sh-19', projectId, code: 'P-101', title: 'POTABLE WATER SUPPLY & SANITARY RISER', discipline: 'P-100 PLUMBING', planType: 'BOTH', assignedTo: 'Engr. Dizon', status: 'COMPLETED', revision: 'Rev 02', updatedAt: '2026-09-23' },
  ]);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDiscipline, setNewDiscipline] = useState<DrawingDiscipline>('A-100 PLANS');
  const [newPlanType, setNewPlanType] = useState<ArchitecturalSheet['planType']>('BOTH');
  const [newAssignee, setNewAssignee] = useState('Arch. Carlos Mendoza');

  const filteredSheets = sheets.filter((sh) => {
    if (selectedDiscipline !== 'ALL' && sh.discipline !== selectedDiscipline) return false;
    if (planTypeFilter !== 'ALL' && sh.planType !== planTypeFilter && sh.planType !== 'BOTH') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = sh.code.toLowerCase().includes(q);
      const matchTitle = sh.title.toLowerCase().includes(q);
      const matchAssignee = (sh.assignedTo || '').toLowerCase().includes(q);
      const matchDisc = sh.discipline.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchAssignee && !matchDisc) return false;
    }
    return true;
  });

  const handleAddSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;
    const item: ArchitecturalSheet = {
      id: `sh-${Date.now()}`,
      projectId,
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim().toUpperCase(),
      discipline: newDiscipline,
      planType: newPlanType,
      assignedTo: newAssignee,
      status: 'PENDING',
      revision: 'Rev 00',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSheets([...sheets, item]);
    setNewCode('');
    setNewTitle('');
    setIsAddSheetOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setSheets(sheets.map(s => {
      if (s.id !== id) return s;
      const nextStatus = s.status === 'COMPLETED' ? 'PENDING' : s.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
      return { ...s, status: nextStatus };
    }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              BLUEPRINT DRAWING SETS
            </span>
            <span className="text-xs font-mono text-muted-main">{projectCode}</span>
          </div>
          <h3 className="text-sm font-bold text-text-main mt-1">Architectural &amp; Engineering Sheet Register</h3>
        </div>

        <button
          onClick={() => setIsAddSheetOpen(true)}
          className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sheet to Register</span>
        </button>
      </div>

      {/* Modern Compact Filter Bar (Dropdowns + Search) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-hover/40 border border-border-main p-3 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Discipline Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-surface-main border border-border-main rounded-xl px-2.5 py-1.5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
            <span className="text-[11px] font-semibold text-muted-main hidden xs:inline">Discipline:</span>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value as DrawingDiscipline | 'ALL')}
              className="bg-transparent text-xs font-mono font-bold text-text-main focus:outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
            >
              <option value="ALL" className="bg-surface-main text-text-main font-sans font-normal">
                All Disciplines ({sheets.length})
              </option>
              {DISCIPLINES.map((d) => {
                const count = sheets.filter(s => s.discipline === d).length;
                return (
                  <option key={d} value={d} className="bg-surface-main text-text-main font-sans font-normal">
                    {d} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Plan Type Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-surface-main border border-border-main rounded-xl px-2.5 py-1.5 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent-yellow shrink-0" />
            <span className="text-[11px] font-semibold text-muted-main hidden xs:inline">Plan Type:</span>
            <select
              value={planTypeFilter}
              onChange={(e) => setPlanTypeFilter(e.target.value as 'ALL' | 'BID' | 'PERMIT' | 'CONSTRUCTION')}
              className="bg-transparent text-xs font-mono font-bold text-text-main focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-surface-main text-text-main font-sans font-normal">All Sets</option>
              <option value="BID" className="bg-surface-main text-text-main font-sans font-normal">Bidding Only</option>
              <option value="PERMIT" className="bg-surface-main text-text-main font-sans font-normal">Permitting Only</option>
              <option value="CONSTRUCTION" className="bg-surface-main text-text-main font-sans font-normal">Construction Set</option>
            </select>
          </div>

          {(selectedDiscipline !== 'ALL' || planTypeFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDiscipline('ALL');
                setPlanTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-muted-main hover:text-accent-red font-semibold underline px-1 cursor-pointer transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Search Sheet Filter */}
        <div className="flex items-center gap-1.5 bg-surface-main border border-border-main rounded-xl px-2.5 py-1.5 w-full sm:w-60 shadow-2xs">
          <Search className="w-3.5 h-3.5 text-muted-main shrink-0" />
          <input
            type="text"
            placeholder="Search sheets, code, lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-text-main placeholder:text-muted-main focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-muted-main hover:text-text-main cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Showing count */}
      <div className="flex items-center justify-between text-xs text-muted-main px-0.5">
        <span>
          Showing <strong className="text-text-main">{filteredSheets.length}</strong> of {sheets.length} blueprint sheets
          {selectedDiscipline !== 'ALL' && ` in ${selectedDiscipline.split(' ')[0]}`}
        </span>
      </div>

      {/* Sheets Table */}
      <div className="overflow-x-auto border border-border-main rounded-2xl shadow-2xs scrollbar-thin scrollbar-thumb-border-main scrollbar-track-transparent">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-surface-hover/60 border-b border-border-main text-[10px] font-mono uppercase tracking-wider text-muted-main">
            <tr>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Sheet No.</th>
              <th className="py-2.5 px-3">Sheet Title</th>
              <th className="py-2.5 px-3">Discipline</th>
              <th className="py-2.5 px-3">Plan Type</th>
              <th className="py-2.5 px-3">Assigned Lead</th>
              <th className="py-2.5 px-3">Revision</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main/50">
            {filteredSheets.map((sh) => (
              <tr key={sh.id} className="hover:bg-surface-hover/30 transition-colors">
                <td className="py-2.5 px-3">
                  <button
                    onClick={() => handleToggleStatus(sh.id)}
                    className="flex items-center gap-1.5 cursor-pointer"
                    title="Click to toggle status"
                  >
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider',
                        sh.status === 'COMPLETED'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : sh.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                      )}
                    >
                      {sh.status.replace(/_/g, ' ')}
                    </span>
                  </button>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-accent-cyan">
                  {sh.code}
                </td>
                <td className="py-2.5 px-3 font-semibold text-text-main max-w-xs truncate">
                  {sh.title}
                </td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-muted-main">
                  {sh.discipline}
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-hover border border-border-main text-text-main">
                    {sh.planType}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-muted-main text-[11px]">
                  {sh.assignedTo || 'Unassigned'}
                </td>
                <td className="py-2.5 px-3 font-mono text-muted-main text-[11px]">
                  {sh.revision}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onRedline && (
                      <button
                        onClick={() => onRedline(sh)}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <PenTool className="w-2.5 h-2.5" />
                        <span>Redline</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Add Sheet */}
      {isAddSheetOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddSheetOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-cyan" />
                <span>Register Blueprint Sheet</span>
              </h3>
              <button
                onClick={() => setIsAddSheetOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAddSheet} className="space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Sheet Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-105"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Plan Type</label>
                  <select
                    value={newPlanType}
                    onChange={(e) => setNewPlanType(e.target.value as ArchitecturalSheet['planType'])}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    <option value="BOTH">Bid & Permit</option>
                    <option value="BID">Bidding Only</option>
                    <option value="PERMIT">Permitting Only</option>
                    <option value="CONSTRUCTION">Construction Set</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Sheet Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAIRCASE & ELEVATOR SHAFT DETAILS"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Discipline</label>
                <select
                  value={newDiscipline}
                  onChange={(e) => setNewDiscipline(e.target.value as DrawingDiscipline)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                >
                  {DISCIPLINES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Assigned Drafter / Architect</label>
                <input
                  type="text"
                  placeholder="e.g. Arch. Carlos Mendoza"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddSheetOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Add Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
