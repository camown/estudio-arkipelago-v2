'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Layers, MapPin, Info, PenTool, ArrowRight } from 'lucide-react';

export interface SchematicPin {
  id: string;
  x: number; // percentage
  y: number; // percentage
  tag: string;
  title: string;
  note: string;
  type: 'structural' | 'facade' | 'mep';
}

export interface SchematicSheet {
  id: string;
  sheetNo: string;
  title: string;
  project: string;
  projectCode: string;
  previewUrl: string;
  scale: string;
  revision: string;
  pins: SchematicPin[];
}

export const SCHEMATIC_SHEETS: SchematicSheet[] = [
  {
    id: 'dwg-1',
    sheetNo: 'A-101',
    title: 'Ground Floor Plan & Structural Massing',
    project: 'Makati Tower Phase 2',
    projectCode: 'MT-2024',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    scale: '1:100 @ A1',
    revision: 'Rev 02 • Approved',
    pins: [
      {
        id: 'pin-1',
        x: 34,
        y: 42,
        tag: 'STR-01',
        title: 'Cantilever Reinforcement',
        note: 'Reinforce rebar ties ASTM A615 Grade 60 at shear wall intersection.',
        type: 'structural',
      },
      {
        id: 'pin-2',
        x: 68,
        y: 32,
        tag: 'FAC-04',
        title: 'Curtain Wall Mullion',
        note: 'Double-glazed thermal break unit; verify expansion joints on south facade.',
        type: 'facade',
      },
      {
        id: 'pin-3',
        x: 52,
        y: 68,
        tag: 'MEP-02',
        title: 'HVAC Core Riser Shaft',
        note: 'Ensure 2-hr fire dampers installed at floor slab penetration.',
        type: 'mep',
      },
    ],
  },
  {
    id: 'dwg-2',
    sheetNo: 'MAT-01',
    title: 'Italian Carrara Marble & Timber Finishes',
    project: 'Casa Verde Residence',
    projectCode: 'CV-2024',
    previewUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&q=80',
    scale: 'NTS • Spec',
    revision: 'Rev 01 • Approved',
    pins: [
      {
        id: 'pin-4',
        x: 36,
        y: 38,
        tag: 'MAT-A',
        title: 'Honed Carrara Slab',
        note: '20mm bookmatched honed Carrara marble with breathable penetrating sealant.',
        type: 'facade',
      },
      {
        id: 'pin-5',
        x: 74,
        y: 56,
        tag: 'TIM-01',
        title: 'Smoked Oak Battens',
        note: 'Fire-retardant treated FSC-certified white oak slats with acoustic underlay.',
        type: 'structural',
      },
    ],
  },
  {
    id: 'dwg-3',
    sheetNo: 'E-302',
    title: 'Substation Single-Line & MEP Distribution',
    project: 'BGC Corporate Pavilion',
    projectCode: 'BGC-2023',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=1200&q=80',
    scale: '1:50 @ A1',
    revision: 'Rev 03 • Approved',
    pins: [
      {
        id: 'pin-6',
        x: 45,
        y: 50,
        tag: 'ELEC-01',
        title: 'Transformer Primary Feed',
        note: '34.5kV incoming Meralco substation feeder with SF6 gas circuit breaker.',
        type: 'mep',
      },
      {
        id: 'pin-7',
        x: 62,
        y: 40,
        tag: 'GEN-02',
        title: 'Emergency Generator Tie-In',
        note: 'Automatic transfer switch with 10-second start sequence for life safety systems.',
        type: 'mep',
      },
    ],
  },
];

export function SchematicPinboardWidget() {
  const router = useRouter();
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedPinId, setSelectedPinId] = useState<string | null>('pin-1');

  const activeSheet = SCHEMATIC_SHEETS[activeSheetIndex];
  const selectedPin =
    activeSheet.pins.find((p) => p.id === selectedPinId) || activeSheet.pins[0];

  const handleRedlineInSketch = (sheet: SchematicSheet) => {
    try {
      localStorage.setItem('arkipelago_pending_sketch_bg', sheet.previewUrl);
      localStorage.setItem(
        'arkipelago_pending_sketch_title',
        `[${sheet.sheetNo}] ${sheet.title}`
      );
    } catch {
      // ignore
    }
    router.push('/sketch');
  };

  return (
    <div className="bg-surface-main border border-border-main rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden group h-full">
      <div className="space-y-4">
        {/* Header with Drawing Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-main/50 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-hover border border-border-main text-accent-cyan uppercase tracking-wider font-mono">
                Drawings
              </span>
              <span className="text-[10px] text-muted-main font-mono">
                {activeSheet.scale}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-sans font-bold text-text-main">
              {activeSheet.title}
            </h2>
          </div>

          {/* Sheet Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {SCHEMATIC_SHEETS.map((sheet, idx) => {
              const isSelected = activeSheetIndex === idx;
              return (
                <button
                  key={sheet.id}
                  onClick={() => {
                    setActiveSheetIndex(idx);
                    setSelectedPinId(sheet.pins[0]?.id || null);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[32px] flex items-center gap-1.5 border',
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs font-bold'
                      : 'bg-surface-hover/70 hover:bg-surface-hover text-muted-main hover:text-text-main border-border-main'
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                  )}
                  <span>{sheet.sheetNo}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Viewport with Pins */}
        <div className="relative rounded-xl overflow-hidden border border-border-main bg-black/5 dark:bg-black/40 aspect-video select-none group/canvas">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSheet.previewUrl}
            alt={activeSheet.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/canvas:scale-[1.02] filter contrast-[1.05]"
          />

          {/* Coordinate Overlay */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold flex items-center gap-2 border border-white/10 shadow-xs">
            <Layers className="w-3 h-3 text-accent-cyan" />
            <span>{activeSheet.projectCode} • {activeSheet.sheetNo}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400">{activeSheet.revision}</span>
          </div>

          {/* Pins */}
          {activeSheet.pins.map((pin) => {
            const isSelected = selectedPin?.id === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => setSelectedPinId(pin.id)}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-300 z-20 group/pin p-2 after:absolute after:-inset-2',
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                )}
                title={pin.title}
                aria-label={`${pin.tag}: ${pin.title}`}
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span
                    className={cn(
                      'relative inline-flex rounded-full h-5 w-5 items-center justify-center text-[9px] font-bold text-white shadow-md border border-white/60',
                      pin.type === 'structural'
                        ? 'bg-rose-600'
                        : pin.type === 'facade'
                        ? 'bg-sky-600'
                        : 'bg-amber-600'
                    )}
                  >
                    <MapPin className="w-3 h-3" />
                  </span>
                </span>

                <span
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 -bottom-5 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-tighter whitespace-nowrap shadow-xs transition-opacity',
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black opacity-100'
                      : 'bg-black/75 text-white opacity-0 group-hover/pin:opacity-100'
                  )}
                >
                  {pin.tag}
                </span>
              </button>
            );
          })}

          {/* Pin Inspection Strip */}
          {selectedPin && (
            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl border border-border-main/80 bg-surface-main/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center shrink-0 text-accent-cyan">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-main font-mono">
                      [{selectedPin.tag}] {selectedPin.title}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded border border-border-main bg-surface-main text-muted-main">
                      {selectedPin.type}
                    </span>
                  </div>
                  <p className="text-muted-main font-sans text-xs leading-relaxed">
                    {selectedPin.note}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRedlineInSketch(activeSheet)}
                className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-[11px] font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <PenTool className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Open in Sketch</span>
                <ArrowRight className="w-3 h-3 text-muted-main" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
