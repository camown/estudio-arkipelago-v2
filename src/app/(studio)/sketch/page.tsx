'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PenTool, Undo2, Redo2, Trash2,
  Upload, Save, FileDown, Eraser,
  Square, Circle, MoveRight, Type, Grid3X3,
  MessageSquare, Layers, Eye, EyeOff, Plus,
  ImagePlus, Ruler, Cloud, Stamp, MessageSquarePlus,
  ZoomIn, ZoomOut, Move, Compass, FolderOpen,
  X, Sparkles, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import type {
  SketchToolMode,
  SketchGridType,
  SketchPoint,
  SketchShapeItem,
  SketchLayer,
  PresetBlueprint
} from '@/types';

// ============================================================
// Constants & Configuration
// ============================================================

const ARCHITECT_COLORS = [
  '#DC2626', // Redline Red (Default for architects)
  '#EA580C', // Amber / Warning
  '#D97706', // Gold / Revision
  '#16A34A', // Green / Approved
  '#0284C7', // Cyan / MEP
  '#4F46E5', // Indigo / Structural
  '#9333EA', // Purple / Notes
  '#18181B', // Dark Charcoal / CAD
  '#64748B', // Slate / Dim
  '#FFFFFF', // White
];

const BRUSH_SIZES = [
  { label: 'Fine (1.5px)', value: 1.5 },
  { label: 'Pen (3px)', value: 3 },
  { label: 'Mark (6px)', value: 6 },
  { label: 'Bold (12px)', value: 12 },
  { label: 'Chisel (24px)', value: 24 },
];

const SCALE_PRESETS = [
  { label: '1:20 (Detail)', ratio: 20, pxPerMeter: 100 },
  { label: '1:50 (Interior)', ratio: 50, pxPerMeter: 50 },
  { label: '1:100 (Floorplan)', ratio: 100, pxPerMeter: 25 },
  { label: '1:200 (Site)', ratio: 200, pxPerMeter: 12.5 },
  { label: '1:500 (Master)', ratio: 500, pxPerMeter: 5 },
];

const ARCHITECTURAL_STAMPS = [
  { id: 'FOR_REVISION', label: 'FOR REVISION', color: '#DC2626', text: 'REVISED • RESUBMIT' },
  { id: 'APPROVED', label: 'APPROVED BY ARCHITECT', color: '#16A34A', text: 'APPROVED • AS SUBMITTED' },
  { id: 'PRE_CONSTRUCTION', label: 'PRE-CONSTRUCTION', color: '#D97706', text: 'FOR PRICING & BID ONLY' },
  { id: 'AS_BUILT', label: 'AS-BUILT RECORD', color: '#0284C7', text: 'VERIFIED ON SITE' },
  { id: 'NOT_FOR_CONST', label: 'NOT FOR CONSTRUCTION', color: '#64748B', text: 'SCHEMATIC STUDY ONLY' },
];

const PRESET_BLUEPRINTS: PresetBlueprint[] = [
  {
    id: 'dwg-01',
    sheetNo: 'A-101',
    title: 'Ground Floor Plan & Structural Massing',
    projectCode: 'MT-2024',
    projectName: 'Makati Tower Phase 2',
    scale: '1:100 @ A1',
    revision: 'Rev 02 - For Client Approval',
    previewUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80',
  },
  {
    id: 'dwg-02',
    sheetNo: 'S-201',
    title: 'Transverse Building Section & Framing',
    projectCode: 'CV-2024',
    projectName: 'Casa Verde Residence',
    scale: '1:50 @ A1',
    revision: 'Rev 01 - Structural Coordination',
    previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80',
  },
  {
    id: 'dwg-03',
    sheetNo: 'F-01',
    title: 'Foundation Piling & Soil Footing Layout',
    projectCode: 'BCP-2024',
    projectName: 'BGC Cultural Pavilion',
    scale: '1:200 @ A1',
    revision: 'Rev 03 - City Permit Set',
    previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=1400&q=80',
  },
];

const INITIAL_LAYERS: SketchLayer[] = [
  { id: 'layer-1', name: 'Layer 1 (Base Drawing)', visible: true, locked: false },
  { id: 'layer-2', name: 'Layer 2 (Redlines & Markups)', visible: true, locked: false },
  { id: 'layer-3', name: 'Layer 3 (Annotations & Dims)', visible: true, locked: false },
];

interface SavedSketch {
  id: string;
  title: string;
  timestamp: number;
  dataUrl: string;
  sheetNo?: string;
  projectName?: string;
  scale?: string;
}

export default function SketchingStudioPage() {
  const router = useRouter();
  const { user } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool & Canvas State
  const [activeTool, setActiveTool] = useState<SketchToolMode>('pen');
  const [gridType, setGridType] = useState<SketchGridType>('square');
  const [color, setColor] = useState('#DC2626'); // Redline Red default
  const [size, setSize] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [orthoLock, setOrthoLock] = useState(false);

  // Viewport Zoom & Pan State
  const [zoom, setZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState<SketchPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<SketchPoint>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Scale Engine
  const [selectedScaleIndex, setSelectedScaleIndex] = useState(2); // 1:100 default
  const activeScale = SCALE_PRESETS[selectedScaleIndex];

  // Stamp State
  const [activeStampIndex, setActiveStampIndex] = useState(0);

  // Layers State (Prominently placed in the sidebar)
  const [layers, setLayers] = useState<SketchLayer[]>(INITIAL_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-2');

  // Background Blueprint State & Contrast Mode
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(70);
  const [contrastMode, setContrastMode] = useState<'standard' | 'blueprint' | 'grayscale' | 'invert'>('standard');

  // Drawing History & Stacks
  const [shapes, setShapes] = useState<SketchShapeItem[]>([]);
  const [redoStack, setRedoStack] = useState<SketchShapeItem[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<SketchPoint | null>(null);
  const [currentPoints, setCurrentPoints] = useState<SketchPoint[]>([]);

  // Modals
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textCoord, setTextCoord] = useState<SketchPoint | null>(null);
  const [textFontSize, setTextFontSize] = useState(16);

  const [isCalloutModalOpen, setIsCalloutModalOpen] = useState(false);
  const [calloutText, setCalloutText] = useState('');
  const [calloutCoord, setCalloutCoord] = useState<{ start: SketchPoint; end: SketchPoint } | null>(null);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Drawing Metadata
  const [sheetNo, setSheetNo] = useState('A-101');
  const [sketchTitle, setSketchTitle] = useState('Ground Floor Redline Review');
  const [projectName, setProjectName] = useState('Makati Tower Phase 2');
  const [revisionCode, setRevisionCode] = useState('Rev 02.1');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Saved Sketches Archive
  const [savedSketches, setSavedSketches] = useState<SavedSketch[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('arkipelago_sketches');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const hexToRgba = (hex: string, alphaPercent: number) => {
    const alpha = alphaPercent / 100;
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map((char) => char + char).join('');
    }
    const num = parseInt(c, 16) || 0;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Render Grid onto Canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, type: SketchGridType) => {
    if (type === 'none') return;

    ctx.save();
    if (type === 'square') {
      const gridSize = 25;
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.75 / zoom;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else if (type === 'dots') {
      const dotSpacing = 20;
      ctx.fillStyle = '#94A3B8';
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2 / zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'isometric') {
      const spacing = 30;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 0.5 / zoom;
      const angle = Math.PI / 6;
      const tan = Math.tan(angle);

      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -width * tan; y < height; y += spacing * tan * 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y + width * tan);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, y + width * tan);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // Render Scalloped AEC Revision Cloud
  const drawRevisionCloud = (ctx: CanvasRenderingContext2D, p1: SketchPoint, p2: SketchPoint, strokeColor: string, lineWidth: number) => {
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 10 || height < 10) return;

    const arcRadius = Math.max(10, Math.min(25, Math.min(width, height) / 6));
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = strokeColor.replace(')', ', 0.06)').replace('rgb', 'rgba');

    ctx.beginPath();
    for (let x = minX; x < maxX; x += arcRadius * 1.6) {
      const endX = Math.min(x + arcRadius * 1.6, maxX);
      ctx.arc((x + endX) / 2, minY, (endX - x) / 2, Math.PI, 0, false);
    }
    for (let y = minY; y < maxY; y += arcRadius * 1.6) {
      const endY = Math.min(y + arcRadius * 1.6, maxY);
      ctx.arc(maxX, (y + endY) / 2, (endY - y) / 2, -Math.PI / 2, Math.PI / 2, false);
    }
    for (let x = maxX; x > minX; x -= arcRadius * 1.6) {
      const endX = Math.max(x - arcRadius * 1.6, minX);
      ctx.arc((x + endX) / 2, maxY, (x - endX) / 2, 0, Math.PI, false);
    }
    for (let y = maxY; y > minY; y -= arcRadius * 1.6) {
      const endY = Math.max(y - arcRadius * 1.6, minY);
      ctx.arc(minX, (y + endY) / 2, (y - endY) / 2, Math.PI / 2, -Math.PI / 2, false);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  // Render Architectural Dimension / Measure Line
  const drawDimensionLine = (
    ctx: CanvasRenderingContext2D,
    p1: SketchPoint,
    p2: SketchPoint,
    strokeColor: string,
    lineWidth: number,
    pxPerMeter: number
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distancePx = Math.hypot(dx, dy);
    const distanceMeters = (distancePx / pxPerMeter).toFixed(2);
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // 45 degree architectural slash ticks
    const tickLen = 8;
    const tickAngle = Math.PI / 4;

    const drawTick = (p: SketchPoint) => {
      ctx.beginPath();
      ctx.moveTo(p.x - tickLen * Math.cos(tickAngle), p.y - tickLen * Math.sin(tickAngle));
      ctx.lineTo(p.x + tickLen * Math.cos(tickAngle), p.y + tickLen * Math.sin(tickAngle));
      ctx.stroke();
    };

    drawTick(p1);
    drawTick(p2);

    // Dimension text badge at midpoint
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const text = `${distanceMeters} m`;
    ctx.font = 'bold 12px "Courier New", monospace';
    const textWidth = ctx.measureText(text).width;

    ctx.save();
    ctx.translate(midX, midY);
    if (Math.abs(angle) > Math.PI / 2) {
      ctx.rotate(angle + Math.PI);
    } else {
      ctx.rotate(angle);
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-textWidth / 2 - 4, -14, textWidth + 8, 16);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(-textWidth / 2 - 4, -14, textWidth + 8, 16);

    ctx.fillStyle = strokeColor;
    ctx.fillText(text, -textWidth / 2, -2);
    ctx.restore();

    ctx.restore();
  };

  // Render Architectural Callout Tag with Leader Line
  const drawCallout = (
    ctx: CanvasRenderingContext2D,
    origin: SketchPoint,
    boxPos: SketchPoint,
    text: string,
    strokeColor: string,
    lineWidth: number
  ) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(boxPos.x, boxPos.y);
    ctx.stroke();

    ctx.font = 'bold 13px "Courier New", monospace';
    const lines = text.split('\n');
    const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width), 60);
    const boxHeight = lines.length * 18 + 12;
    const boxWidth = maxLineWidth + 16;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(boxPos.x, boxPos.y - 12, boxWidth, boxHeight);
    ctx.strokeRect(boxPos.x, boxPos.y - 12, boxWidth, boxHeight);

    ctx.fillStyle = strokeColor;
    lines.forEach((line, idx) => {
      ctx.fillText(line, boxPos.x + 8, boxPos.y + 4 + idx * 18);
    });

    ctx.restore();
  };

  // Render Architectural Status Stamp
  const drawStamp = (
    ctx: CanvasRenderingContext2D,
    pos: SketchPoint,
    stampType: string
  ) => {
    const stampConfig = ARCHITECTURAL_STAMPS.find((s) => s.id === stampType) || ARCHITECTURAL_STAMPS[0];
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(-Math.PI / 16);

    const width = 220;
    const height = 70;

    ctx.strokeStyle = stampConfig.color;
    ctx.fillStyle = stampConfig.color;
    ctx.lineWidth = 3;

    ctx.strokeRect(-width / 2, -height / 2, width, height);
    ctx.lineWidth = 1;
    ctx.strokeRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8);

    ctx.font = '900 13px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ESTUDIO ARKIPELAGO', 0, -height / 2 + 20);

    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(stampConfig.label, 0, -height / 2 + 38);

    ctx.font = '9px "Courier New", monospace';
    const dateStr = new Date().toISOString().split('T')[0];
    ctx.fillText(`DATE: ${dateStr} • BY: ${user?.name || 'ARCHITECT'}`, 0, -height / 2 + 54);

    ctx.restore();
  };

  // Master Redraw Canvas Engine
  const redrawCanvas = useCallback((shapesToDraw: SketchShapeItem[], previewShape?: SketchShapeItem | null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // 1. Canvas Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 2400, 1600);

    // 2. Grid
    drawGrid(ctx, 2400, 1600, gridType);

    // 3. Render Background Blueprint
    if (bgImage) {
      ctx.save();
      ctx.globalAlpha = bgOpacity / 100;

      if (contrastMode === 'grayscale') {
        ctx.filter = 'grayscale(100%) contrast(150%)';
      } else if (contrastMode === 'blueprint') {
        ctx.filter = 'invert(90%) sepia(80%) saturate(400%) hue-rotate(180deg) brightness(85%)';
      } else if (contrastMode === 'invert') {
        ctx.filter = 'invert(100%) contrast(120%)';
      }

      const hRatio = 2400 / bgImage.width;
      const vRatio = 1600 / bgImage.height;
      const ratio = Math.min(hRatio, vRatio, 1.5);
      const centerShiftX = (2400 - bgImage.width * ratio) / 2;
      const centerShiftY = (1600 - bgImage.height * ratio) / 2;

      ctx.drawImage(
        bgImage,
        0, 0, bgImage.width, bgImage.height,
        centerShiftX, centerShiftY, bgImage.width * ratio, bgImage.height * ratio
      );
      ctx.restore();
    }

    // Layer Visibility Filter
    const visibleLayerIds = new Set(layers.filter((l) => l.visible).map((l) => l.id));
    const allShapes = previewShape ? [...shapesToDraw, previewShape] : shapesToDraw;
    const shapesToRender = allShapes.filter((s) => !s.layerId || visibleLayerIds.has(s.layerId));

    // 4. Render All Shapes
    shapesToRender.forEach((s) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (s.type === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = s.size * 2;
        if (s.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(s.points[0].x, s.points[0].y);
          for (let i = 1; i < s.points.length; i++) {
            ctx.lineTo(s.points[i].x, s.points[i].y);
          }
          ctx.stroke();
        }
      } else if (s.type === 'pen') {
        ctx.strokeStyle = hexToRgba(s.color, s.opacity);
        ctx.lineWidth = s.size;
        if (s.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(s.points[0].x, s.points[0].y);
          for (let i = 1; i < s.points.length; i++) {
            ctx.lineTo(s.points[i].x, s.points[i].y);
          }
          ctx.stroke();
        }
      } else if (s.type === 'line' && s.points.length >= 2) {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        ctx.strokeStyle = hexToRgba(s.color, s.opacity);
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (s.type === 'rectangle' && s.points.length >= 2) {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        ctx.strokeStyle = hexToRgba(s.color, s.opacity);
        ctx.lineWidth = s.size;
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (s.type === 'circle' && s.points.length >= 2) {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        const radius = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        ctx.strokeStyle = hexToRgba(s.color, s.opacity);
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (s.type === 'arrow' && s.points.length >= 2) {
        const from = s.points[0];
        const to = s.points[s.points.length - 1];
        ctx.strokeStyle = hexToRgba(s.color, s.opacity);
        ctx.fillStyle = hexToRgba(s.color, s.opacity);
        ctx.lineWidth = s.size;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        const headLen = Math.max(12, s.size * 3);
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (s.type === 'cloud' && s.points.length >= 2) {
        drawRevisionCloud(ctx, s.points[0], s.points[s.points.length - 1], hexToRgba(s.color, s.opacity), s.size);
      } else if (s.type === 'measure' && s.points.length >= 2) {
        drawDimensionLine(
          ctx,
          s.points[0],
          s.points[s.points.length - 1],
          hexToRgba(s.color, s.opacity),
          s.size,
          activeScale.pxPerMeter
        );
      } else if (s.type === 'callout' && s.points.length >= 2) {
        drawCallout(
          ctx,
          s.points[0],
          s.points[s.points.length - 1],
          s.calloutText || s.text || 'NOTE',
          hexToRgba(s.color, s.opacity),
          s.size
        );
      } else if (s.type === 'stamp' && s.points.length > 0) {
        drawStamp(ctx, s.points[0], s.stampType || 'FOR_REVISION');
      } else if (s.type === 'text' && s.text && s.points.length > 0) {
        const p = s.points[0];
        ctx.fillStyle = hexToRgba(s.color, s.opacity);
        ctx.font = `bold ${s.fontSize || 16}px 'Courier New', monospace`;
        ctx.fillText(s.text, p.x, p.y);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [bgImage, bgOpacity, contrastMode, gridType, layers, panOffset, zoom, activeScale.pxPerMeter]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCanvas(shapes);
  }, [shapes, redrawCanvas]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Load pending blueprint if launched from Projects or Chat
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const pendingBg = localStorage.getItem('arkipelago_pending_sketch_bg');
      const pendingTitle = localStorage.getItem('arkipelago_pending_sketch_title');
      if (pendingBg) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setBgImage(img);
          setBgImageUrl(pendingBg);
          setColor('#DC2626');
          setActiveTool('pen');
          if (pendingTitle) setSketchTitle(pendingTitle);
          redrawCanvas(shapes);
          showNotice(`Loaded: ${pendingTitle || 'Blueprint'}`);
        };
        img.src = pendingBg;
        localStorage.removeItem('arkipelago_pending_sketch_bg');
        localStorage.removeItem('arkipelago_pending_sketch_title');
      }
    } catch {
      // ignore
    }
  }, [redrawCanvas, shapes]);

  // Transform matrix aware coordinates
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): SketchPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    let worldX = (screenX - panOffset.x) / zoom;
    let worldY = (screenY - panOffset.y) / zoom;

    if (orthoLock && startPoint && (activeTool === 'line' || activeTool === 'arrow' || activeTool === 'measure')) {
      const dx = worldX - startPoint.x;
      const dy = worldY - startPoint.y;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      worldX = startPoint.x + dist * Math.cos(snappedAngle);
      worldY = startPoint.y + dist * Math.sin(snappedAngle);
    }

    return { x: worldX, y: worldY };
  };

  // Pointer Handlers
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSpacePressed || activeTool === 'pan') {
      setIsPanning(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPanStart({ x: clientX - panOffset.x, y: clientY - panOffset.y });
      return;
    }

    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === 'stamp') {
      const stampShape: SketchShapeItem = {
        id: `stamp-${Date.now()}`,
        type: 'stamp',
        points: [coords],
        color: ARCHITECTURAL_STAMPS[activeStampIndex].color,
        size: 2,
        opacity: 100,
        layerId: activeLayerId,
        stampType: ARCHITECTURAL_STAMPS[activeStampIndex].id,
      };
      setShapes((prev) => [...prev, stampShape]);
      setRedoStack([]);
      showNotice(`Applied ${ARCHITECTURAL_STAMPS[activeStampIndex].label} stamp`);
      return;
    }

    if (activeTool === 'text') {
      setTextCoord(coords);
      setIsTextModalOpen(true);
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentPoints([coords]);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPanOffset({
        x: clientX - panStart.x,
        y: clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing || !startPoint) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === 'pen' || activeTool === 'eraser') {
      const nextPoints = [...currentPoints, coords];
      setCurrentPoints(nextPoints);

      const preview: SketchShapeItem = {
        id: 'preview',
        type: activeTool,
        points: nextPoints,
        color,
        size,
        opacity,
        layerId: activeLayerId,
      };
      redrawCanvas(shapes, preview);
    } else {
      const preview: SketchShapeItem = {
        id: 'preview',
        type: activeTool,
        points: [startPoint, coords],
        color,
        size,
        opacity,
        layerId: activeLayerId,
        stampType: ARCHITECTURAL_STAMPS[activeStampIndex].id,
      };
      redrawCanvas(shapes, preview);
    }
  };

  const handleMouseUp = (e?: React.MouseEvent | React.TouchEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing || !startPoint) return;
    setIsDrawing(false);

    let finalPoints = currentPoints;
    if (e) {
      const coords = getCanvasCoords(e);
      if (coords && activeTool !== 'pen' && activeTool !== 'eraser') {
        finalPoints = [startPoint, coords];
      }
    }

    if (activeTool === 'callout' && finalPoints.length >= 2) {
      setCalloutCoord({ start: finalPoints[0], end: finalPoints[1] });
      setIsCalloutModalOpen(true);
      return;
    }

    if (finalPoints.length > 0) {
      const newShape: SketchShapeItem = {
        id: `shape-${Date.now()}`,
        type: activeTool,
        points: finalPoints,
        color,
        size,
        opacity,
        layerId: activeLayerId,
        stampType: ARCHITECTURAL_STAMPS[activeStampIndex].id,
      };
      setShapes((prev) => [...prev, newShape]);
      setRedoStack([]);
    }

    setStartPoint(null);
    setCurrentPoints([]);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(4.0, Math.max(0.25, zoom * zoomFactor));
    setZoom(newZoom);
  };

  const handleUndo = () => {
    if (shapes.length === 0) return;
    const last = shapes[shapes.length - 1];
    setRedoStack((prev) => [last, ...prev]);
    setShapes((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setShapes((prev) => [...prev, next]);
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textCoord) return;
    const textShape: SketchShapeItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      points: [textCoord],
      color,
      size,
      opacity,
      text: textInput.trim(),
      fontSize: textFontSize,
      layerId: activeLayerId,
    };
    setShapes((prev) => [...prev, textShape]);
    setTextInput('');
    setIsTextModalOpen(false);
  };

  const handleAddCallout = () => {
    if (!calloutCoord || !calloutText.trim()) return;
    const calloutShape: SketchShapeItem = {
      id: `callout-${Date.now()}`,
      type: 'callout',
      points: [calloutCoord.start, calloutCoord.end],
      color,
      size,
      opacity,
      calloutText: calloutText.trim(),
      layerId: activeLayerId,
    };
    setShapes((prev) => [...prev, calloutShape]);
    setCalloutText('');
    setIsCalloutModalOpen(false);
    setCalloutCoord(null);
  };

  const handleSelectPresetBlueprint = (preset: PresetBlueprint) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBgImage(img);
      setBgImageUrl(preset.previewUrl);
      setSheetNo(preset.sheetNo);
      setSketchTitle(preset.title);
      setProjectName(preset.projectName);
      setRevisionCode(preset.revision);
      setIsPresetModalOpen(false);
      showNotice(`Loaded: ${preset.sheetNo} - ${preset.title}`);
    };
    img.src = preset.previewUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setBgImage(img);
        setBgImageUrl(dataUrl);
        setSketchTitle(file.name.replace(/\.[^/.]+$/, ''));
        showNotice(`Uploaded plan: ${file.name}`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const exportWithTitleBlock = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.drawImage(canvas, 0, 0, 1920, 1080);

    // Title Block Frame
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 1880, 1040);
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, 1872, 1032);

    const tbWidth = 480;
    const tbHeight = 160;
    const tbX = 1920 - 20 - tbWidth;
    const tbY = 1080 - 20 - tbHeight;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(tbX, tbY, tbWidth, tbHeight);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.strokeRect(tbX, tbY, tbWidth, tbHeight);

    ctx.beginPath();
    ctx.moveTo(tbX, tbY + 45);
    ctx.lineTo(tbX + tbWidth, tbY + 45);
    ctx.moveTo(tbX, tbY + 105);
    ctx.lineTo(tbX + tbWidth, tbY + 105);
    ctx.moveTo(tbX + 280, tbY + 45);
    ctx.lineTo(tbX + 280, tbY + tbHeight);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('ESTUDIO ARKIPELAGO', tbX + 16, tbY + 30);

    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText('PROJECT:', tbX + 16, tbY + 62);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(projectName.substring(0, 28), tbX + 16, tbY + 78);

    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText('DRAWING TITLE:', tbX + 16, tbY + 122);
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(sketchTitle.substring(0, 28), tbX + 16, tbY + 140);

    ctx.fillStyle = '#64748B';
    ctx.fillText('SHEET NO:', tbX + 292, tbY + 62);
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(sheetNo, tbX + 292, tbY + 84);

    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = '#64748B';
    ctx.fillText('SCALE:', tbX + 292, tbY + 122);
    ctx.fillStyle = '#0F172A';
    ctx.fillText(activeScale.label.split(' ')[0], tbX + 292, tbY + 140);

    const link = document.createElement('a');
    link.download = `${sheetNo}_REDLINE_${projectName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
    showNotice('Exported Drawing with Title Block');
    setIsExportModalOpen(false);
  };

  const handleSaveToArchive = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const newSaved: SavedSketch = {
      id: `sketch-${Date.now()}`,
      title: sketchTitle,
      sheetNo,
      projectName,
      scale: activeScale.label,
      timestamp: Date.now(),
      dataUrl,
    };

    const updated = [newSaved, ...savedSketches];
    setSavedSketches(updated);
    localStorage.setItem('arkipelago_sketches', JSON.stringify(updated));
    showNotice('Saved to Studio Vault');
  };

  const handleShareToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    localStorage.setItem('arkipelago_chat_pending_attachment', dataUrl);
    localStorage.setItem('arkipelago_chat_pending_caption', `[REDLINE MARKUP] ${sheetNo} - ${sketchTitle}`);
    router.push('/chat');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-bg-main text-text-main font-mono select-none overflow-hidden border-2 border-border-main shadow-xs">
      {/* Sleek Minimal Top Architectural Header */}
      <header className="flex items-center justify-between px-3 py-2 bg-surface-main border-b border-border-main shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-hover border border-border-main text-text-main text-xs font-bold">
            <Compass className="w-3.5 h-3.5 text-accent-red" />
            <span className="uppercase text-[11px] tracking-wider">SKETCH STUDIO</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-border-main text-xs">
            <span className="text-muted-main text-[11px]">SHEET</span>
            <input
              type="text"
              value={sheetNo}
              onChange={(e) => setSheetNo(e.target.value)}
              className="w-14 px-1 py-0.5 text-xs font-bold bg-bg-main border border-border-main text-accent-yellow focus:outline-none"
            />
            <input
              type="text"
              value={sketchTitle}
              onChange={(e) => setSketchTitle(e.target.value)}
              className="w-48 px-1.5 py-0.5 text-xs bg-bg-main border border-border-main text-text-main focus:outline-none truncate"
            />
          </div>
        </div>

        {/* Center Canvas View Controls */}
        <div className="flex items-center gap-1.5">
          {/* Scale Selector */}
          <div className="flex items-center gap-1 bg-bg-main border border-border-main px-2 py-0.5 text-xs">
            <Ruler className="w-3 h-3 text-accent-cyan" />
            <select
              value={selectedScaleIndex}
              onChange={(e) => setSelectedScaleIndex(Number(e.target.value))}
              className="bg-transparent text-[11px] font-bold text-text-main focus:outline-none cursor-pointer"
            >
              {SCALE_PRESETS.map((scale, idx) => (
                <option key={scale.ratio} value={idx} className="bg-surface-main text-text-main">
                  {scale.label}
                </option>
              ))}
            </select>
          </div>

          {/* Zoom */}
          <div className="flex items-center bg-bg-main border border-border-main text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.25, z - 0.15))}
              className="px-1.5 py-0.5 hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] w-8 text-center text-text-main font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(4.0, z + 0.15))}
              className="px-1.5 py-0.5 hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-l border-border-main pl-1.5">
            <button
              onClick={handleUndo}
              disabled={shapes.length === 0}
              className="p-1 hover:bg-surface-hover disabled:opacity-20 text-text-main cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1 hover:bg-surface-hover disabled:opacity-20 text-text-main cursor-pointer"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Suite */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1 bg-surface-hover hover:bg-bg-main border border-border-main text-[11px] font-bold text-text-main transition-colors cursor-pointer"
            title="Load Preset Sheet"
          >
            <FolderOpen className="w-3.5 h-3.5 text-accent-yellow" />
            <span className="hidden sm:inline">PRESETS</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-text-main text-bg-main text-[11px] font-bold transition-opacity hover:opacity-90 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>

          <button
            onClick={handleSaveToArchive}
            className="p-1.5 bg-surface-hover hover:bg-bg-main border border-border-main text-text-main cursor-pointer"
            title="Save to Studio Vault"
          >
            <Save className="w-3.5 h-3.5 text-accent-yellow" />
          </button>

          <button
            onClick={handleShareToChat}
            className="p-1.5 bg-surface-hover hover:bg-bg-main border border-border-main text-text-main cursor-pointer"
            title="Share to Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent-cyan" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 relative overflow-hidden bg-bg-main">
        {/* Left Compact Tool Rail */}
        <aside className="w-12 bg-surface-main border-r border-border-main flex flex-col items-center py-2.5 gap-1.5 shrink-0 z-10">
          {/* Pan */}
          <button
            onClick={() => setActiveTool('pan')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'pan' || isSpacePressed
                ? 'bg-accent-yellow text-slate-950 border-accent-yellow font-bold shadow-xs'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Pan (Spacebar)"
          >
            <Move className="w-3.5 h-3.5" />
          </button>

          {/* Pen */}
          <button
            onClick={() => setActiveTool('pen')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'pen' && !isSpacePressed
                ? 'bg-accent-red text-white border-accent-red font-bold shadow-xs'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          {/* Line */}
          <button
            onClick={() => setActiveTool('line')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'line'
                ? 'bg-text-main text-bg-main border-text-main font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Line"
          >
            <span className="text-xs font-bold">／</span>
          </button>

          {/* Revision Cloud */}
          <button
            onClick={() => setActiveTool('cloud')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'cloud'
                ? 'bg-accent-red text-white border-accent-red font-bold shadow-xs'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Revision Cloud"
          >
            <Cloud className="w-3.5 h-3.5" />
          </button>

          {/* Dimension Measure Ruler */}
          <button
            onClick={() => setActiveTool('measure')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'measure'
                ? 'bg-accent-cyan text-slate-950 border-accent-cyan font-bold shadow-xs'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Dimension Ruler (Meters)"
          >
            <Ruler className="w-3.5 h-3.5" />
          </button>

          {/* Rectangle */}
          <button
            onClick={() => setActiveTool('rectangle')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'rectangle'
                ? 'bg-text-main text-bg-main border-text-main font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Rectangle"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* Circle */}
          <button
            onClick={() => setActiveTool('circle')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'circle'
                ? 'bg-text-main text-bg-main border-text-main font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Circle"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          {/* Arrow */}
          <button
            onClick={() => setActiveTool('arrow')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'arrow'
                ? 'bg-text-main text-bg-main border-text-main font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Arrow"
          >
            <MoveRight className="w-3.5 h-3.5" />
          </button>

          {/* Callout */}
          <button
            onClick={() => setActiveTool('callout')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'callout'
                ? 'bg-text-main text-bg-main border-text-main font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Keynote Callout"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
          </button>

          {/* Stamp */}
          <button
            onClick={() => setActiveTool('stamp')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'stamp'
                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Architectural Stamp"
          >
            <Stamp className="w-3.5 h-3.5" />
          </button>

          {/* Text */}
          <button
            onClick={() => setActiveTool('text')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'text'
                ? 'bg-text-main text-bg-main border-text-main font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Text"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {/* Eraser */}
          <button
            onClick={() => setActiveTool('eraser')}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-all cursor-pointer border',
              activeTool === 'eraser'
                ? 'bg-surface-hover text-text-main border-border-strong font-bold'
                : 'text-muted-main hover:bg-surface-hover hover:text-text-main border-transparent'
            )}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          <div className="w-full border-t border-border-main my-1" />

          {/* Ortho Lock */}
          <button
            onClick={() => setOrthoLock(!orthoLock)}
            className={cn(
              'w-8 h-7 flex flex-col items-center justify-center text-[8px] font-bold transition-all cursor-pointer border',
              orthoLock
                ? 'bg-accent-yellow text-slate-950 border-accent-yellow'
                : 'bg-surface-hover text-muted-main hover:text-text-main border-border-main'
            )}
            title="Ortho Lock"
          >
            <span>ORTHO</span>
          </button>

          {/* Clear */}
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="w-8 h-8 mt-auto flex items-center justify-center text-muted-main hover:bg-accent-red/20 hover:text-accent-red transition-colors cursor-pointer"
            title="Clear Canvas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </aside>

        {/* Central Canvas Viewport */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          className={cn(
            'flex-1 relative overflow-hidden bg-bg-main cursor-crosshair',
            (isSpacePressed || activeTool === 'pan') && (isPanning ? 'cursor-grabbing' : 'cursor-grab')
          )}
        >
          <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full touch-none" />

          {/* Notice Feedback Toast */}
          {feedbackNotice && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-surface-main/95 border border-border-strong text-text-main shadow-md flex items-center gap-2 text-xs font-bold z-30 animate-in fade-in">
              <Sparkles className="w-3 h-3 text-accent-yellow" />
              <span>{feedbackNotice}</span>
            </div>
          )}

          {/* Minimal Bottom-Left Status HUD */}
          <div className="absolute bottom-3 left-3 bg-surface-main/90 border border-border-main px-2.5 py-1 text-[10px] text-muted-main flex items-center gap-3 z-10 pointer-events-none">
            <span>TOOL: <strong className="text-text-main uppercase">{activeTool}</strong></span>
            <span>SCALE: <strong className="text-accent-cyan">{activeScale.label}</strong></span>
            <span>ZOOM: <strong className="text-accent-yellow">{Math.round(zoom * 100)}%</strong></span>
          </div>
        </div>

        {/* Right Unified Studio Panel (LAYERS ARE DIRECTLY ACCESSIBLE & NOT HIDDEN) */}
        <aside className="w-64 bg-surface-main border-l border-border-main flex flex-col shrink-0 z-10 overflow-y-auto">
          {/* 1. LAYERS SECTION (Always Front & Center) */}
          <div className="p-3 border-b border-border-main space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-main">
                <Layers className="w-3.5 h-3.5 text-accent-cyan" />
                <span>LAYERS ({layers.length})</span>
              </div>
              <button
                onClick={() => {
                  const newId = `layer-${Date.now()}`;
                  setLayers((prev) => [...prev, { id: newId, name: `Layer ${prev.length + 1}`, visible: true }]);
                  setActiveLayerId(newId);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-surface-hover hover:bg-bg-main border border-border-main text-[10px] font-bold text-text-main cursor-pointer"
                title="Add New Layer"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 border text-xs cursor-pointer transition-all',
                    activeLayerId === layer.id
                      ? 'bg-surface-hover border-text-main text-text-main font-bold'
                      : 'bg-surface-main border-border-main text-muted-main hover:bg-surface-hover hover:text-text-main'
                  )}
                >
                  <span className="text-[11px] truncate flex-1">{layer.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLayers((prev) =>
                        prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))
                      );
                    }}
                    className="p-0.5 hover:text-accent-yellow text-muted-main ml-1.5"
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                  >
                    {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-35" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 2. INK & DRAWING PROPERTIES */}
          <div className="p-3 border-b border-border-main space-y-3">
            {/* Color Swatches */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-main font-bold uppercase tracking-wider">Redline Ink</span>
              <div className="grid grid-cols-5 gap-1.5">
                {ARCHITECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'w-full h-6 border transition-transform cursor-pointer',
                      color === c ? 'border-text-main scale-110 ring-1 ring-accent-red shadow-xs' : 'border-border-strong hover:scale-105'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Line Weight */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-muted-main font-bold">
                <span className="uppercase">Line Weight</span>
                <span className="text-accent-yellow">{size}px</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {BRUSH_SIZES.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setSize(b.value)}
                    className={cn(
                      'py-0.5 text-[9px] border text-center font-bold cursor-pointer',
                      size === b.value
                        ? 'bg-accent-yellow text-slate-950 border-accent-yellow'
                        : 'bg-surface-hover border-border-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {b.value}p
                  </button>
                ))}
              </div>
            </div>

            {/* Stamp Options (Visible when Stamp tool is selected) */}
            {activeTool === 'stamp' && (
              <div className="space-y-1.5 pt-2 border-t border-border-main">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Stamp Type</span>
                <div className="space-y-1">
                  {ARCHITECTURAL_STAMPS.map((stamp, idx) => (
                    <button
                      key={stamp.id}
                      onClick={() => setActiveStampIndex(idx)}
                      className={cn(
                        'w-full text-left px-2 py-1 border text-[10px] font-bold transition-all cursor-pointer',
                        activeStampIndex === idx
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                          : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
                      )}
                    >
                      {stamp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. GRID & BLUEPRINT TRACING */}
          <div className="p-3 space-y-3">
            {/* Architectural Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-main font-bold uppercase tracking-wider">Grid Overlay</span>
              <div className="grid grid-cols-2 gap-1">
                {(['none', 'square', 'dots', 'isometric'] as SketchGridType[]).map((gt) => (
                  <button
                    key={gt}
                    onClick={() => setGridType(gt)}
                    className={cn(
                      'py-1 text-[10px] border text-center uppercase font-bold cursor-pointer',
                      gridType === gt
                        ? 'bg-text-main text-bg-main border-text-main'
                        : 'bg-surface-hover border-border-main text-muted-main hover:text-text-main'
                    )}
                  >
                    {gt}
                  </button>
                ))}
              </div>
            </div>

            {/* Blueprint Tracing */}
            <div className="space-y-2 pt-2 border-t border-border-main">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-main font-bold uppercase tracking-wider">Blueprint Tracing</span>
                {bgImage && (
                  <button
                    onClick={() => {
                      setBgImage(null);
                      setBgImageUrl(null);
                    }}
                    className="text-accent-red hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {bgImage ? (
                <div className="space-y-2 bg-surface-hover p-2 border border-border-main text-[10px]">
                  <div className="grid grid-cols-2 gap-1">
                    {(['standard', 'blueprint', 'grayscale', 'invert'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setContrastMode(mode)}
                        className={cn(
                          'py-0.5 text-[9px] border uppercase font-bold cursor-pointer',
                          contrastMode === mode
                            ? 'bg-accent-yellow text-slate-950 border-accent-yellow'
                            : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-main pt-1">
                    <span>Opacity: {bgOpacity}%</span>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(Number(e.target.value))}
                      className="w-24 accent-accent-yellow cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-dashed border-border-strong hover:border-text-main bg-surface-hover text-muted-main hover:text-text-main flex items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Custom Plan</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL: PRESET BLUEPRINTS */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-main border-2 border-border-strong max-w-xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border-main pb-2.5">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-accent-yellow" />
                <h3 className="font-bold text-sm text-text-main uppercase">SELECT STUDIO BLUEPRINT</h3>
              </div>
              <button onClick={() => setIsPresetModalOpen(false)} className="text-muted-main hover:text-text-main cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_BLUEPRINTS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPresetBlueprint(preset)}
                  className="bg-surface-hover border border-border-main hover:border-text-main p-2.5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-accent-yellow">{preset.sheetNo}</span>
                    <h4 className="text-[11px] font-bold text-text-main leading-tight line-clamp-2">
                      {preset.title}
                    </h4>
                  </div>
                  <img
                    src={preset.previewUrl}
                    alt={preset.title}
                    className="w-full h-20 object-cover mt-2 border border-border-main"
                  />
                  <span className="text-[9px] text-muted-main mt-1.5">{preset.scale}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TEXT INPUT */}
      {isTextModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-main border-2 border-border-strong max-w-sm w-full p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-text-main text-xs uppercase flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-accent-cyan" />
              <span>INSERT TEXT NOTE</span>
            </h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter note text..."
              className="w-full h-20 bg-bg-main border border-border-main p-2 text-xs text-text-main focus:outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="px-2.5 py-1 bg-surface-hover border border-border-main text-[11px] text-muted-main cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddText}
                className="px-2.5 py-1 bg-text-main text-bg-main text-[11px] font-bold cursor-pointer"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CALLOUT INPUT */}
      {isCalloutModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-main border-2 border-border-strong max-w-sm w-full p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-text-main text-xs uppercase flex items-center gap-1.5">
              <MessageSquarePlus className="w-3.5 h-3.5 text-accent-cyan" />
              <span>SPECIFY KEYNOTE CALLOUT</span>
            </h3>
            <textarea
              value={calloutText}
              onChange={(e) => setCalloutText(e.target.value)}
              placeholder="e.g. STR-01: REINFORCE REBAR ASTM A615..."
              className="w-full h-20 bg-bg-main border border-border-main p-2 text-xs text-text-main focus:outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => {
                  setIsCalloutModalOpen(false);
                  setCalloutCoord(null);
                }}
                className="px-2.5 py-1 bg-surface-hover border border-border-main text-[11px] text-muted-main cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCallout}
                className="px-2.5 py-1 bg-text-main text-bg-main text-[11px] font-bold cursor-pointer"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT PREVIEW */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-main border-2 border-border-strong max-w-md w-full p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-text-main text-xs uppercase flex items-center gap-1.5">
              <FileDown className="w-4 h-4 text-accent-cyan" />
              <span>EXPORT REDLINE SHEET</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-muted-main font-bold text-[10px]">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full mt-0.5 p-1.5 bg-bg-main border border-border-main text-text-main text-xs"
                />
              </div>
              <div>
                <label className="text-muted-main font-bold text-[10px]">Sheet Title</label>
                <input
                  type="text"
                  value={sketchTitle}
                  onChange={(e) => setSketchTitle(e.target.value)}
                  className="w-full mt-0.5 p-1.5 bg-bg-main border border-border-main text-text-main text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-muted-main font-bold text-[10px]">Sheet No</label>
                  <input
                    type="text"
                    value={sheetNo}
                    onChange={(e) => setSheetNo(e.target.value)}
                    className="w-full mt-0.5 p-1.5 bg-bg-main border border-border-main text-accent-yellow font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-muted-main font-bold text-[10px]">Scale</label>
                  <input
                    type="text"
                    disabled
                    value={activeScale.label}
                    className="w-full mt-0.5 p-1.5 bg-bg-main border border-border-main text-muted-main text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border-main">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-3 py-1 bg-surface-hover border border-border-main text-xs text-muted-main cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={exportWithTitleBlock}
                className="px-3 py-1 bg-text-main text-bg-main text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Download Sheet PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CLEAR CANVAS */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-main border-2 border-border-strong max-w-xs w-full p-4 space-y-3 shadow-xl">
            <h3 className="font-bold text-text-main text-xs uppercase">CLEAR SHEET?</h3>
            <p className="text-[11px] text-muted-main">
              Erases all drawn markups and redlines on the current sheet.
            </p>
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-2.5 py-1 bg-surface-hover border border-border-main text-[11px] text-muted-main cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShapes([]);
                  setRedoStack([]);
                  setIsClearModalOpen(false);
                  showNotice('Cleared sheet');
                }}
                className="px-2.5 py-1 bg-accent-red text-white text-[11px] font-bold cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
