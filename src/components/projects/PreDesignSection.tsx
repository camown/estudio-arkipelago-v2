'use client';

import React, { useState } from 'react';
import { 
  PreliminaryCheckItem, 
  ClientSpaceProgramItem, 
  PreliminaryDocStatus 
} from '@/types';
import { 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Building, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreDesignSectionProps {
  projectId: string;
  projectCode: string;
  location?: string;
}

export function PreDesignSection({
  projectId,
  projectCode,
  location = 'Forbes Park, Makati City, Metro Manila'
}: PreDesignSectionProps) {
  const [activeTab, setActiveTab] = useState<'MAP' | 'PRELIMINARIES' | 'PROGRAM'>('MAP');
  const [customLocation, setCustomLocation] = useState(location);
  const [mapQuery, setMapQuery] = useState(location);

  // 1. Preliminaries checklist
  const [preliminaries, setPreliminaries] = useState<PreliminaryCheckItem[]>([
    {
      id: 'pre-1',
      projectId,
      title: 'Transfer Certificate of Title (TCT / Land Title)',
      category: 'LEGAL',
      status: 'RECEIVED',
      notes: 'Certified true copy provided by owner, clean title without encumbrances.',
      updatedAt: '2026-09-12'
    },
    {
      id: 'pre-2',
      projectId,
      title: 'Official Tax Declaration & Real Property Tax (RPT)',
      category: 'LEGAL',
      status: 'RECEIVED',
      notes: 'Current year RPT receipts verified.',
      updatedAt: '2026-09-14'
    },
    {
      id: 'pre-3',
      projectId,
      title: 'Relocation & Topographic Survey (1m Contours)',
      category: 'TECHNICAL',
      status: 'RECEIVED',
      notes: 'Geodetic survey by Engr. Alcantara completed with boundary monuments.',
      updatedAt: '2026-09-18'
    },
    {
      id: 'pre-4',
      projectId,
      title: 'Soil Boring Test & Geotechnical Investigation (3 Boreholes)',
      category: 'TECHNICAL',
      status: 'PENDING',
      notes: 'Scheduled for next Tuesday. Soil bearing capacity report pending.',
      updatedAt: '2026-09-21'
    },
    {
      id: 'pre-5',
      projectId,
      title: 'Homeowners Association (HOA) Deed of Restrictions & Height Limits',
      category: 'ZONING',
      status: 'RECEIVED',
      notes: 'Max height: 9.0m from crown of road. Setbacks: 3m front, 2m sides & rear.',
      updatedAt: '2026-09-15'
    },
    {
      id: 'pre-6',
      projectId,
      title: 'Meralco / Manila Water Utility Point-of-Entry Verification',
      category: 'TECHNICAL',
      status: 'REQUESTED',
      notes: 'Service feeder point application submitted.',
      updatedAt: '2026-09-22'
    }
  ]);

  // 2. Space Program
  const [spaceProgram, setSpaceProgram] = useState<ClientSpaceProgramItem[]>([
    {
      id: 'sp-1',
      projectId,
      spaceName: 'Master Bedroom Suite (with Walk-in & Ensuite)',
      targetAreaSqM: 55,
      occupancyCount: 2,
      specialRequirements: 'Oriented toward sunrise, private garden balcony, double vanities.'
    },
    {
      id: 'sp-2',
      projectId,
      spaceName: 'Living & High-Ceiling Dining Pavilion',
      targetAreaSqM: 80,
      occupancyCount: 12,
      specialRequirements: 'Double volume 6.5m ceiling, direct pocket door link to lap pool.'
    },
    {
      id: 'sp-3',
      projectId,
      spaceName: 'Show Kitchen & Service Kitchen (Dirty Kitchen)',
      targetAreaSqM: 40,
      occupancyCount: 4,
      specialRequirements: 'Heavy exhaust hood, prep island with sink, walk-in pantry.'
    },
    {
      id: 'sp-4',
      projectId,
      spaceName: 'Home Studio & Architectural Library',
      targetAreaSqM: 32,
      occupancyCount: 3,
      specialRequirements: 'Acoustic wall insulation, north daylight clerestory, book shelving.'
    },
    {
      id: 'sp-5',
      projectId,
      spaceName: '4-Car Covered Carport & Driver/Maid Quarters',
      targetAreaSqM: 70,
      occupancyCount: 4,
      specialRequirements: 'Secure side entrance, toilet & bath, EV charger provisions.'
    }
  ]);

  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceArea, setNewSpaceArea] = useState('');
  const [newSpaceNotes, setNewSpaceNotes] = useState('');

  const totalProgramArea = spaceProgram.reduce((sum, item) => sum + item.targetAreaSqM, 0);

  const handleUpdatePrelimStatus = (id: string, newStatus: PreliminaryDocStatus) => {
    setPreliminaries(preliminaries.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const area = parseFloat(newSpaceArea) || 20;
    const item: ClientSpaceProgramItem = {
      id: `sp-${Date.now()}`,
      projectId,
      spaceName: newSpaceName.trim(),
      targetAreaSqM: area,
      specialRequirements: newSpaceNotes.trim() || undefined
    };
    setSpaceProgram([...spaceProgram, item]);
    setNewSpaceName('');
    setNewSpaceArea('');
    setNewSpaceNotes('');
    setIsAddProgramOpen(false);
  };

  // Google Maps embed URL
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              PRE-DESIGN PHASE
            </span>
            <span className="text-xs font-mono text-muted-main">{projectCode}</span>
          </div>
          <h3 className="text-sm font-bold text-text-main mt-1">Site Feasibility, Legal Due Diligence & Program</h3>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('MAP')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'MAP'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Site Context</span>
          </button>

          <button
            onClick={() => setActiveTab('PRELIMINARIES')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'PRELIMINARIES'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Due Diligence Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('PROGRAM')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'PROGRAM'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Space Program</span>
            <span className="ml-1 text-[10px] opacity-80 font-mono font-bold">({totalProgramArea} m²)</span>
          </button>
        </div>
      </div>

      {/* 1. Map & Site Context */}
      {activeTab === 'MAP' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-hover/30 p-3 rounded-xl border border-border-main">
            <div className="flex items-center gap-2 flex-1">
              <MapPin className="w-4 h-4 text-accent-cyan shrink-0" />
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter address, lot number, or GPS coordinates..."
                className="w-full bg-surface-main border border-border-main rounded-lg px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-text-main font-sans"
              />
            </div>
            <button
              onClick={() => setMapQuery(customLocation)}
              className="px-3.5 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shrink-0 shadow-xs"
            >
              Update Map
            </button>
          </div>

          {/* Interactive Google Map iframe */}
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border-main shadow-inner bg-surface-hover/20">
            <iframe
              title="Site Location Map"
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface-main border border-border-main p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted-main uppercase tracking-wider block">
                Orientation / Sun Path
              </span>
              <p className="text-xs font-semibold text-text-main">Habitable living spaces aligned to SW-NE axis for passive breeze capture.</p>
            </div>
            <div className="bg-surface-main border border-border-main p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted-main uppercase tracking-wider block">
                Zoning & Height Allowance
              </span>
              <p className="text-xs font-semibold text-text-main">R-1 Low Density Residential (Max 3 Storeys or 10.0m ridge line).</p>
            </div>
            <div className="bg-surface-main border border-border-main p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] font-mono text-muted-main uppercase tracking-wider block">
                Topography & Drainage
              </span>
              <p className="text-xs font-semibold text-text-main">Mild 2.5% slope toward roadway curb, ideal for gravity stormwater runoff.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Preliminaries Checklist */}
      {activeTab === 'PRELIMINARIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-main">
              Mandatory legal and technical documents required before schematic drafting commences.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {preliminaries.map((item) => (
              <div
                key={item.id}
                className="bg-surface-main border border-border-main rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-text-main/30 transition-all shadow-2xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-surface-hover border border-border-main text-muted-main">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-bold text-text-main">{item.title}</h4>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-muted-main leading-relaxed pl-1">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdatePrelimStatus(item.id, e.target.value as PreliminaryDocStatus)}
                    className={cn(
                      'px-2.5 py-1 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border cursor-pointer focus:outline-none',
                      item.status === 'RECEIVED'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : item.status === 'REQUESTED'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : item.status === 'PENDING'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                        : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                    )}
                  >
                    <option value="RECEIVED">Received</option>
                    <option value="REQUESTED">Requested</option>
                    <option value="PENDING">Pending</option>
                    <option value="NOT_APPLICABLE">N/A</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Space Program Tab */}
      {activeTab === 'PROGRAM' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-main">
                Space allocation program and client requirements breakdown.
              </p>
              <span className="text-xs font-bold text-accent-cyan font-mono">
                Total Target Gross Floor Area: {totalProgramArea} sq.m.
              </span>
            </div>
            <button
              onClick={() => setIsAddProgramOpen(true)}
              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Space Item</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-border-main rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover/60 border-b border-border-main text-[10px] font-mono uppercase tracking-wider text-muted-main">
                <tr>
                  <th className="py-2.5 px-3">Space Function</th>
                  <th className="py-2.5 px-3">Target Area (m²)</th>
                  <th className="py-2.5 px-3">Occupancy</th>
                  <th className="py-2.5 px-3">Architectural Requirements</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {spaceProgram.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-text-main">
                      {item.spaceName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-accent-cyan">
                      {item.targetAreaSqM} m²
                    </td>
                    <td className="py-2.5 px-3 text-muted-main font-mono">
                      {item.occupancyCount ? `${item.occupancyCount} persons` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-muted-main text-[11px] leading-relaxed max-w-sm">
                      {item.specialRequirements || 'Standard finishes & lighting.'}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          setSpaceProgram(spaceProgram.filter(p => p.id !== item.id));
                        }}
                        className="text-[10px] text-rose-500 hover:underline cursor-pointer font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Space Program Item */}
      {isAddProgramOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddProgramOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-accent-cyan" />
                <span>Add Program Space Item</span>
              </h3>
              <button
                onClick={() => setIsAddProgramOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAddProgram} className="space-y-3 font-sans">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Space Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gallery / Foyer"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Target Area in Sq.M *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 35"
                  value={newSpaceArea}
                  onChange={(e) => setNewSpaceArea(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Special Requirements & Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Natural light, acoustic insulation, fixture needs..."
                  value={newSpaceNotes}
                  onChange={(e) => setNewSpaceNotes(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddProgramOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Add Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
