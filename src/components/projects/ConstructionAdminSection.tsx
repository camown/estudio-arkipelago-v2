'use client';

import React, { useState } from 'react';
import { 
  RFIItem, 
  RFAItem, 
  WRIItem, 
  SiteDeliveryItem, 
  SiteBulletinItem
} from '@/types';
import { 
  CheckCircle2, 
  Plus, 
  Truck, 
  FileQuestion, 
  FileCheck2, 
  Building2,
  User,
  Layers,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConstructionAdminSectionProps {
  projectId: string;
  projectCode: string;
  projectName?: string;
  isContractor?: boolean;
}

export function ConstructionAdminSection({
  projectId,
  projectCode,
  isContractor = false
}: ConstructionAdminSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'RFI' | 'RFA' | 'WRI' | 'DELIVERIES' | 'BULLETINS'>('RFI');

  // 1. RFIs State
  const [rfis, setRfis] = useState<RFIItem[]>([
    {
      id: 'rfi-1',
      projectId,
      rfiNumber: 'RFI-001',
      title: 'Structural Footing Rebar Spacing at Grid C-4',
      assignedTo: 'Engr. Cruz',
      dateReceived: '2026-09-22',
      dateRequired: '2026-09-28',
      dateAnswered: '2026-09-25',
      status: 'ANSWERED',
      question: 'Discrepancy noted between S-101 and S-103 regarding tie bar spacing around main column pedestals.',
      response: 'Follow detail 3/S-103 (100mm on-center for first 5 ties, 150mm thereafter). Certified by lead SE.'
    },
    {
      id: 'rfi-2',
      projectId,
      rfiNumber: 'RFI-002',
      title: 'Plumbing Penetration Clash with Transfer Girder TG-2',
      assignedTo: 'Arch. Carlos Mendoza',
      dateReceived: '2026-09-26',
      dateRequired: '2026-10-02',
      status: 'UNDER_REVIEW',
      question: 'Sanitary main 100mm dia stack conflicts with concrete bottom rebar cage of TG-2.',
    }
  ]);

  // 2. RFAs State
  const [rfas, setRfas] = useState<RFAItem[]>([
    {
      id: 'rfa-1',
      projectId,
      rfaNumber: 'RFA-001',
      title: 'Honed Travertine Cladding (Level 1 Lobby)',
      submittalType: 'MATERIAL_SAMPLE',
      supplier: 'EuroStone International',
      dateSubmitted: '2026-09-18',
      decision: 'APPROVED',
      reviewerNotes: 'Color tone matching approved architectural spec. Proceed with 600x1200mm slabs.',
      specSection: '09 30 00 - Tiling'
    },
    {
      id: 'rfa-2',
      projectId,
      rfaNumber: 'RFA-002',
      title: 'Structural Steel Canopy Shop Drawings',
      submittalType: 'SHOP_DRAWING',
      supplier: 'Apex Metal Fabrication',
      dateSubmitted: '2026-09-24',
      decision: 'APPROVED_WITH_COMMENTS',
      reviewerNotes: 'Increase weld size from 6mm to 8mm fillet at cantilever joint #4.',
      specSection: '05 12 00 - Structural Metal'
    }
  ]);

  // 3. WRIs State
  const [wris, setWris] = useState<WRIItem[]>([
    {
      id: 'wri-1',
      projectId,
      wriNumber: 'WRI-001',
      title: 'Foundation Slab Rebar Inspection & Pre-Pour Walkthrough',
      date: '2026-09-23',
      inspector: 'Arch. Leandro Locsin',
      agenda: 'Verification of vapor barrier, chair supports, and electrical conduit sleeves.',
      observations: 'Chair spacing verified at 800mm intervals. Conduit sleeves routed clear of main tension bars.',
      actionItems: 'General contractor cleared to schedule ready-mix batching for Thursday 06:00 AM.',
      severity: 'ROUTINE'
    }
  ]);

  // 4. Site Deliveries
  const [deliveries, setDeliveries] = useState<SiteDeliveryItem[]>([
    {
      id: 'del-1',
      projectId,
      finishCode: 'MAT-STEEL-01',
      itemDescription: 'Grade 60 Deformed Rebars (16mm, 20mm, 25mm)',
      supplierContact: 'SteelAsia Sales (+63 917 555 1234)',
      quantityOrdered: '18 Metric Tons',
      quantityDelivered: '18 Metric Tons',
      deliveryDate: '2026-09-20',
      status: 'COMPLETE'
    },
    {
      id: 'del-2',
      projectId,
      finishCode: 'MAT-TILE-04',
      itemDescription: 'Lobby Travertine Tiles (600x1200mm)',
      supplierContact: 'EuroStone (+63 918 222 9876)',
      quantityOrdered: '450 sq.m.',
      quantityDelivered: '200 sq.m.',
      deliveryDate: '2026-09-27',
      status: 'PARTIAL'
    }
  ]);

  // 5. Site Bulletins
  const [bulletins, setBulletins] = useState<SiteBulletinItem[]>([
    {
      id: 'bul-1',
      projectId,
      bulletinNumber: 'SB-01',
      subject: 'Exterior Cladding Detail Alignment at Grid 3-A',
      description: 'Minor shift of expansion joint reveal to accommodate thermal movement per facade consultant review.',
      drawingsAffected: ['A-201 Rev 02', 'A-402 Rev 01'],
      issuedDate: '2026-09-24'
    }
  ]);

  // Modal creation states
  const [isAddRfiOpen, setIsAddRfiOpen] = useState(false);
  const [newRfiTitle, setNewRfiTitle] = useState('');
  const [newRfiQuestion, setNewRfiQuestion] = useState('');
  const [newRfiAssigned, setNewRfiAssigned] = useState('Arch. Carlos Mendoza');

  const [isAddRfaOpen, setIsAddRfaOpen] = useState(false);
  const [newRfaTitle, setNewRfaTitle] = useState('');
  const [newRfaType, setNewRfaType] = useState<RFAItem['submittalType']>('MATERIAL_SAMPLE');
  const [newRfaSupplier, setNewRfaSupplier] = useState('');
  const [newRfaNotes, setNewRfaNotes] = useState('');

  const [isAddWriOpen, setIsAddWriOpen] = useState(false);
  const [newWriTitle, setNewWriTitle] = useState('');
  const [newWriAgenda, setNewWriAgenda] = useState('');
  const [newWriObservations, setNewWriObservations] = useState('');
  const [newWriSeverity, setNewWriSeverity] = useState<WRIItem['severity']>('ROUTINE');

  const handleCreateRfi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfiTitle.trim()) return;
    const num = `RFI-00${rfis.length + 1}`;
    const item: RFIItem = {
      id: `rfi-${Date.now()}`,
      projectId,
      rfiNumber: num,
      title: newRfiTitle.trim(),
      assignedTo: newRfiAssigned,
      dateReceived: new Date().toISOString().split('T')[0],
      status: 'PENDING',
      question: newRfiQuestion.trim(),
    };
    setRfis([item, ...rfis]);
    setNewRfiTitle('');
    setNewRfiQuestion('');
    setIsAddRfiOpen(false);
  };

  const handleCreateRfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRfaTitle.trim()) return;
    const num = `RFA-00${rfas.length + 1}`;
    const item: RFAItem = {
      id: `rfa-${Date.now()}`,
      projectId,
      rfaNumber: num,
      title: newRfaTitle.trim(),
      submittalType: newRfaType,
      supplier: newRfaSupplier.trim() || undefined,
      dateSubmitted: new Date().toISOString().split('T')[0],
      decision: 'PENDING',
      reviewerNotes: newRfaNotes.trim() || undefined,
    };
    setRfas([item, ...rfas]);
    setNewRfaTitle('');
    setNewRfaSupplier('');
    setNewRfaNotes('');
    setIsAddRfaOpen(false);
  };

  const handleCreateWri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWriTitle.trim()) return;
    const num = `WRI-00${wris.length + 1}`;
    const item: WRIItem = {
      id: `wri-${Date.now()}`,
      projectId,
      wriNumber: num,
      title: newWriTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      inspector: 'Studio Inspection Lead',
      agenda: newWriAgenda.trim(),
      observations: newWriObservations.trim(),
      severity: newWriSeverity
    };
    setWris([item, ...wris]);
    setNewWriTitle('');
    setNewWriAgenda('');
    setNewWriObservations('');
    setIsAddWriOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              CONSTRUCTION ADMIN (CA)
            </span>
            <span className="text-xs font-mono text-muted-main">{projectCode}</span>
          </div>
          <h3 className="text-sm font-bold text-text-main mt-1">Site Administration & Contractor Records</h3>
        </div>

        {/* Sub-Tabs Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('RFI')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'RFI'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>RFIs</span>
            <span className="ml-1 text-[10px] opacity-80">({rfis.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('RFA')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'RFA'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>RFAs</span>
            <span className="ml-1 text-[10px] opacity-80">({rfas.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('WRI')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'WRI'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Walkthroughs</span>
            <span className="ml-1 text-[10px] opacity-80">({wris.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DELIVERIES')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'DELIVERIES'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Deliveries</span>
            <span className="ml-1 text-[10px] opacity-80">({deliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('BULLETINS')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5',
              activeSubTab === 'BULLETINS'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-muted-main hover:text-text-main hover:bg-surface-hover'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulletins</span>
            <span className="ml-1 text-[10px] opacity-80">({bulletins.length})</span>
          </button>
        </div>
      </div>

      {/* 1. RFIs (Request for Information) Tab */}
      {activeSubTab === 'RFI' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-main">
              Formal inquiries regarding plan details, architectural clearances, and structural tolerances.
            </p>
            <button
              onClick={() => setIsAddRfiOpen(true)}
              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue RFI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {rfis.map((rfi) => (
              <div 
                key={rfi.id}
                className="bg-surface-main border border-border-main rounded-xl p-4 space-y-3 hover:border-text-main/30 transition-all shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
                      {rfi.rfiNumber}
                    </span>
                    <h4 className="text-xs font-bold text-text-main">{rfi.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider',
                        rfi.status === 'ANSWERED'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : rfi.status === 'UNDER_REVIEW'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                      )}
                    >
                      {rfi.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-muted-main font-mono">
                      Recv: {rfi.dateReceived}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-text-main bg-surface-hover/50 p-2.5 rounded-lg border border-border-main/40">
                    <span className="font-semibold text-muted-main block text-[10px] uppercase tracking-wider mb-1">
                      Inquiry / Site Observation:
                    </span>
                    <p className="leading-relaxed">{rfi.question}</p>
                  </div>

                  {rfi.response && (
                    <div className="text-text-main bg-emerald-500/5 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Architectural Direction / Response:
                        </span>
                        <span className="text-[10px] text-muted-main font-mono">
                          Answered: {rfi.dateAnswered}
                        </span>
                      </div>
                      <p className="text-xs text-text-main leading-relaxed">{rfi.response}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-main font-mono border-t border-border-main/40">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Assigned: <strong className="text-text-main font-sans">{rfi.assignedTo || 'Unassigned'}</strong>
                  </span>
                  {rfi.status !== 'ANSWERED' && !isContractor && (
                    <button
                      onClick={() => {
                        const answer = prompt('Enter studio architectural response:');
                        if (answer) {
                          setRfis(rfis.map(item => item.id === rfi.id ? { ...item, status: 'ANSWERED', response: answer, dateAnswered: new Date().toISOString().split('T')[0] } : item));
                        }
                      }}
                      className="text-xs text-accent-cyan hover:underline cursor-pointer font-semibold font-sans"
                    >
                      Answer RFI
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. RFAs (Request for Approval) Tab */}
      {activeSubTab === 'RFA' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-main">
              Material mockups, finish samples, and shop drawing submittals awaiting studio clearance.
            </p>
            <button
              onClick={() => setIsAddRfaOpen(true)}
              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit RFA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rfas.map((rfa) => (
              <div 
                key={rfa.id}
                className="bg-surface-main border border-border-main rounded-xl p-4 space-y-3 hover:border-text-main/30 transition-all shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                      {rfa.rfaNumber}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider',
                        rfa.decision === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : rfa.decision === 'APPROVED_WITH_COMMENTS'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : rfa.decision === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      )}
                    >
                      {rfa.decision.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-text-main">{rfa.title}</h4>

                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-main font-mono">
                    <span className="bg-surface-hover px-2 py-0.5 rounded border border-border-main/50">
                      Type: {rfa.submittalType.replace(/_/g, ' ')}
                    </span>
                    {rfa.supplier && (
                      <span className="bg-surface-hover px-2 py-0.5 rounded border border-border-main/50">
                        Vendor: {rfa.supplier}
                      </span>
                    )}
                  </div>

                  {rfa.reviewerNotes && (
                    <div className="bg-surface-hover/50 p-2.5 rounded-lg border border-border-main/40 text-xs">
                      <span className="text-[10px] font-semibold text-muted-main uppercase block mb-0.5">
                        Architectural Reviewer Notes:
                      </span>
                      <p className="text-text-main text-[11px] leading-relaxed">{rfa.reviewerNotes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border-main/40 flex items-center justify-between text-[10px] text-muted-main font-mono">
                  <span>Sub: {rfa.dateSubmitted}</span>
                  {!isContractor && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRfas(rfas.map(item => item.id === rfa.id ? { ...item, decision: 'APPROVED' } : item));
                        }}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt('Enter comments for approval:');
                          if (note !== null) {
                            setRfas(rfas.map(item => item.id === rfa.id ? { ...item, decision: 'APPROVED_WITH_COMMENTS', reviewerNotes: note } : item));
                          }
                        }}
                        className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-sans text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        With Comments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WRIs (Walkthrough & Inspection) Tab */}
      {activeSubTab === 'WRI' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-main">
              Formal site walkthrough records, structural inspections, and architect field directives.
            </p>
            <button
              onClick={() => setIsAddWriOpen(true)}
              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Walkthrough</span>
            </button>
          </div>

          <div className="space-y-3">
            {wris.map((wri) => (
              <div 
                key={wri.id}
                className="bg-surface-main border border-border-main rounded-xl p-4 space-y-3 hover:border-text-main/30 transition-all shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-main/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                      {wri.wriNumber}
                    </span>
                    <h4 className="text-xs font-bold text-text-main">{wri.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-main">
                    <span>Date: {wri.date}</span>
                    <span>•</span>
                    <span>Inspector: {wri.inspector}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-surface-hover/40 p-3 rounded-lg border border-border-main/40 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                      Inspection Agenda
                    </span>
                    <p className="text-text-main text-[11px] leading-relaxed">{wri.agenda}</p>
                  </div>
                  <div className="bg-surface-hover/40 p-3 rounded-lg border border-border-main/40 space-y-1">
                    <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider block">
                      Field Observations & Notes
                    </span>
                    <p className="text-text-main text-[11px] leading-relaxed">{wri.observations}</p>
                  </div>
                </div>

                {wri.actionItems && (
                  <div className="bg-amber-500/10 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20 text-xs">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-0.5">
                      Required Action Items:
                    </span>
                    <p className="text-text-main text-[11px] leading-relaxed">{wri.actionItems}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Site Deliveries Tab */}
      {activeSubTab === 'DELIVERIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-main">
              Material batch shipments, steel tonnage, tile pallets, and MEP equipment delivered to the site.
            </p>
          </div>

          <div className="overflow-x-auto border border-border-main rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover/60 border-b border-border-main text-[10px] font-mono uppercase tracking-wider text-muted-main">
                <tr>
                  <th className="py-2.5 px-3">Finish Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Supplier Contact</th>
                  <th className="py-2.5 px-3">Ordered</th>
                  <th className="py-2.5 px-3">Delivered</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/50">
                {deliveries.map((del) => (
                  <tr key={del.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-accent-cyan">
                      {del.finishCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-text-main">
                      {del.itemDescription}
                    </td>
                    <td className="py-2.5 px-3 text-muted-main font-mono text-[11px]">
                      {del.supplierContact || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-main">
                      {del.quantityOrdered}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-text-main">
                      {del.quantityDelivered}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider',
                          del.status === 'COMPLETE'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : del.status === 'PARTIAL'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                        )}
                      >
                        {del.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => {
                          const newDelivered = prompt('Enter updated quantity delivered:', del.quantityDelivered);
                          if (newDelivered) {
                            setDeliveries(deliveries.map(d => d.id === del.id ? { 
                              ...d, 
                              quantityDelivered: newDelivered,
                              status: newDelivered === d.quantityOrdered ? 'COMPLETE' : 'PARTIAL' 
                            } : d));
                          }
                        }}
                        className="text-[10px] text-accent-cyan hover:underline cursor-pointer font-semibold"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Site Bulletins Tab */}
      {activeSubTab === 'BULLETINS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-main">
              Site Bulletins (SB) issued to inform all contractors of drawing clarifications or revision adjustments.
            </p>
          </div>

          <div className="space-y-3">
            {bulletins.map((b) => (
              <div 
                key={b.id}
                className="bg-surface-main border border-border-main rounded-xl p-4 space-y-2 hover:border-text-main/30 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-border-main/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30">
                      {b.bulletinNumber}
                    </span>
                    <h4 className="text-xs font-bold text-text-main">{b.subject}</h4>
                  </div>
                  <span className="text-[10px] text-muted-main font-mono">Issued: {b.issuedDate}</span>
                </div>
                <p className="text-xs text-text-main leading-relaxed">{b.description}</p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-muted-main uppercase font-mono">
                    Affected Sheets:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {b.drawingsAffected.map((sh, idx) => (
                      <span key={idx} className="bg-surface-hover px-2 py-0.5 rounded text-[10px] font-mono text-text-main border border-border-main/50">
                        {sh}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Issue RFI */}
      {/* ========================================================= */}
      {isAddRfiOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddRfiOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-accent-cyan" />
                <span>Issue Request For Information (RFI)</span>
              </h3>
              <button
                onClick={() => setIsAddRfiOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfi} className="space-y-3 font-sans">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Subject / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balcony Waterproofing Detail at Grid 2"
                  value={newRfiTitle}
                  onChange={(e) => setNewRfiTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Assign Studio Lead</label>
                <select
                  value={newRfiAssigned}
                  onChange={(e) => setNewRfiAssigned(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                >
                  <option value="Arch. Carlos Mendoza">Arch. Carlos Mendoza (Lead)</option>
                  <option value="Arch. Sofia Reyes">Arch. Sofia Reyes (Project Arch)</option>
                  <option value="Arch. Leandro Locsin">Arch. Leandro Locsin (Partner)</option>
                  <option value="Engr. Cruz">Engr. Cruz (Structural SE)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Question / Clarification *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the discrepancy or item needing architectural instruction..."
                  value={newRfiQuestion}
                  onChange={(e) => setNewRfiQuestion(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddRfiOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Submit RFI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Submit RFA */}
      {/* ========================================================= */}
      {isAddRfaOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddRfaOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-accent-cyan" />
                <span>Submit Request For Approval (RFA)</span>
              </h3>
              <button
                onClick={() => setIsAddRfaOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfa} className="space-y-3 font-sans">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Submittal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Timber Louver Finish Coating Spec"
                  value={newRfaTitle}
                  onChange={(e) => setNewRfaTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Type</label>
                  <select
                    value={newRfaType}
                    onChange={(e) => setNewRfaType(e.target.value as RFAItem['submittalType'])}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main cursor-pointer"
                  >
                    <option value="MATERIAL_SAMPLE">Material Sample</option>
                    <option value="SHOP_DRAWING">Shop Drawing</option>
                    <option value="PRODUCT_DATA">Product Data</option>
                    <option value="MOCKUP">Site Mockup</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-main block mb-1">Supplier / Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Pacific Woods PH"
                    value={newRfaSupplier}
                    onChange={(e) => setNewRfaSupplier(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Additional context, color codes, or standard compliance..."
                  value={newRfaNotes}
                  onChange={(e) => setNewRfaNotes(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddRfaOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: Record WRI */}
      {/* ========================================================= */}
      {isAddWriOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddWriOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono animate-in fade-in duration-150"
        >
          <div className="bg-surface-main border border-border-main w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent-cyan" />
                <span>Log Walkthrough & Inspection (WRI)</span>
              </h3>
              <button
                onClick={() => setIsAddWriOpen(false)}
                className="w-6 h-6 rounded-full border border-border-main flex items-center justify-center hover:bg-surface-hover text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateWri} className="space-y-3 font-sans">
              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Inspection Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd Floor Beam Rebar Inspection"
                  value={newWriTitle}
                  onChange={(e) => setNewWriTitle(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Agenda / Scope</label>
                <input
                  type="text"
                  placeholder="e.g. Beam stirrup spacing and sleeve clearance"
                  value={newWriAgenda}
                  onChange={(e) => setNewWriAgenda(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-main block mb-1">Observations & Findings</label>
                <textarea
                  rows={3}
                  placeholder="Field condition, contractor presence, items cleared or requiring fix..."
                  value={newWriObservations}
                  onChange={(e) => setNewWriObservations(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-lg px-3 py-2 text-xs text-text-main focus:outline-none focus:border-text-main resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-main">
                <button
                  type="button"
                  onClick={() => setIsAddWriOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-border-main text-xs font-semibold hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 cursor-pointer shadow-xs"
                >
                  Save Walkthrough
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
