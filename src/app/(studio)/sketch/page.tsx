'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PenTool, Undo2, Redo2, Trash2, 
  Upload, Save, FileDown, Info, Eraser, 
  Square, Circle, MoveRight, Type, Grid3X3,
  MessageSquare, Check, Sparkles, Layers,
  Eye, EyeOff, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

type ToolMode = 'pen' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser';
type GridType = 'none' | 'square' | 'dots' | 'isometric';

interface Point {
  x: number;
  y: number;
}

interface ShapeItem {
  id: string;
  type: ToolMode;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
  layerId?: string;
  text?: string;
  fontSize?: number;
}

interface SketchLayer {
  id: string;
  name: string;
  visible: boolean;
}

interface SavedSketch {
  id: string;
  title: string;
  timestamp: number;
  dataUrl: string;
  shapes?: ShapeItem[];
  bgImage?: string | null;
}

const ARCHITECT_COLORS = [
  '#000000', '#1E293B', '#DC2626', '#EA580C', 
  '#D97706', '#16A34A', '#0284C7', '#4F46E5', 
  '#9333EA', '#E11D48', '#FFFFFF', '#64748B'
];

const BRUSH_SIZES = [
  { label: 'Fine (1.5px)', value: 1.5 },
  { label: 'Pen (3px)', value: 3 },
  { label: 'Mark (6px)', value: 6 },
  { label: 'Bold (12px)', value: 12 },
  { label: 'Chisel (24px)', value: 24 },
];

const INITIAL_LAYERS: SketchLayer[] = [
  { id: 'layer-1', name: 'Layer 1 (Base Drawing)', visible: true },
  { id: 'layer-2', name: 'Layer 2 (Redlines & Markups)', visible: true },
  { id: 'layer-3', name: 'Layer 3 (Annotations)', visible: true },
];

export default function SketchingStudioPage() {
  const router = useRouter();
  const { user } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool & Canvas State
  const [activeTool, setActiveTool] = useState<ToolMode>('pen');
  const [gridType, setGridType] = useState<GridType>('square');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(3);
  const [opacity, setOpacity] = useState(100);
  const [orthoLock, setOrthoLock] = useState(false);

  // Layers State
  const [layers, setLayers] = useState<SketchLayer[]>(INITIAL_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');

  // Background Tracing Image
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(60);

  // Drawing History & Stacks
  const [shapes, setShapes] = useState<ShapeItem[]>([]);
  const [redoStack, setRedoStack] = useState<ShapeItem[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  // Text Tool Modal / Input
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textCoord, setTextCoord] = useState<Point | null>(null);
  const [textFontSize, setTextFontSize] = useState(16);

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

  const [activeTab, setActiveTab] = useState<'archive' | 'layers'>('archive');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [sketchTitle, setSketchTitle] = useState('Schematic Redline - Rev 01');

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
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

  // Render Grid onto Canvas
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, type: GridType) => {
    if (type === 'none') return;

    ctx.save();
    if (type === 'square') {
      const gridSize = 25;
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 0.75;

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
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'isometric') {
      const spacing = 30;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 0.5;
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

  // Render all shape elements with layer visibility
  const redrawCanvas = useCallback((shapesToDraw: ShapeItem[], previewShape?: ShapeItem | null) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // 1. Fill White Canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Render Architectural Grid Overlay
    drawGrid(ctx, canvas.width, canvas.height, gridType);

    // 3. Render Background Tracing Image (Floorplan / Blueprint)
    if (bgImage) {
      ctx.save();
      ctx.globalAlpha = bgOpacity / 100;
      const hRatio = canvas.width / bgImage.width;
      const vRatio = canvas.height / bgImage.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (canvas.width - bgImage.width * ratio) / 2;
      const centerShiftY = (canvas.height - bgImage.height * ratio) / 2;
      ctx.drawImage(
        bgImage,
        0, 0, bgImage.width, bgImage.height,
        centerShiftX, centerShiftY, bgImage.width * ratio, bgImage.height * ratio
      );
      ctx.restore();
    }

    const visibleLayerIds = new Set(layers.filter((l) => l.visible).map((l) => l.id));
    const allShapes = previewShape ? [...shapesToDraw, previewShape] : shapesToDraw;
    const shapesToRender = allShapes.filter((s) => !s.layerId || visibleLayerIds.has(s.layerId));

    // 4. Render All Drawn Vector Shapes
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
      } else if (s.type === 'text' && s.text && s.points.length > 0) {
        const p = s.points[0];
        ctx.fillStyle = hexToRgba(s.color, s.opacity);
        ctx.font = `bold ${s.fontSize || 16}px 'Courier New', monospace`;
        ctx.fillText(s.text, p.x, p.y);
      }

      ctx.restore();
    });
  }, [bgImage, bgOpacity, gridType, layers]);

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

  // Check for incoming redline blueprint from Projects Vault or Chat
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const pendingBg = localStorage.getItem('arkipelago_pending_sketch_bg');
      const pendingTitle = localStorage.getItem('arkipelago_pending_sketch_title');
      if (pendingBg) {
        const img = new Image();
        img.onload = () => {
          setBgImage(img);
          setBgImageUrl(pendingBg);
          setColor('#DC2626');
          setActiveTool('pen');
          if (pendingTitle) setSketchTitle(pendingTitle);
          redrawCanvas(shapes);
          showNotice('Redline mode: Blueprint loaded for markup');
        };
        img.src = pendingBg;
        localStorage.removeItem('arkipelago_pending_sketch_bg');
        localStorage.removeItem('arkipelago_pending_sketch_title');
      }
    } catch {
      // ignore
    }
  }, [redrawCanvas, shapes]);

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent): Point | null => {
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

    let x = clientX - rect.left;
    let y = clientY - rect.top;

    if (orthoLock && startPoint && (activeTool === 'line' || activeTool === 'arrow')) {
      const dx = x - startPoint.x;
      const dy = y - startPoint.y;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      x = startPoint.x + dist * Math.cos(snappedAngle);
      y = startPoint.y + dist * Math.sin(snappedAngle);
    }

    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === 'text') {
      setTextCoord(coords);
      setIsTextModalOpen(true);
      return;
    }

    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentPoints([coords]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !startPoint) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (activeTool === 'pen' || activeTool === 'eraser') {
      const nextPoints = [...currentPoints, coords];
      setCurrentPoints(nextPoints);

      const preview: ShapeItem = {
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
      const preview: ShapeItem = {
        id: 'preview',
        type: activeTool,
        points: [startPoint, coords],
        color,
        size,
        opacity,
        layerId: activeLayerId,
      };
      redrawCanvas(shapes, preview);
    }
  };

  const stopDrawing = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();
    if (!isDrawing || !startPoint) return;

    setIsDrawing(false);

    let finalPoints = currentPoints;
    if (activeTool !== 'pen' && activeTool !== 'eraser' && currentPoints.length > 0) {
      finalPoints = [startPoint, currentPoints[currentPoints.length - 1] || startPoint];
    }

    if (finalPoints.length > 0) {
      const newShape: ShapeItem = {
        id: 'shape-' + Date.now(),
        type: activeTool,
        points: finalPoints,
        color,
        size,
        opacity,
        layerId: activeLayerId,
      };
      const updated = [...shapes, newShape];
      setShapes(updated);
      setRedoStack([]);
      redrawCanvas(updated);
    }

    setStartPoint(null);
    setCurrentPoints([]);
  }, [isDrawing, startPoint, currentPoints, activeTool, color, size, opacity, activeLayerId, shapes, redrawCanvas]);

  const handleAddTextAnnotation = () => {
    if (!textInput.trim() || !textCoord) return;

    const newShape: ShapeItem = {
      id: 'text-' + Date.now(),
      type: 'text',
      points: [textCoord],
      color,
      size,
      opacity,
      layerId: activeLayerId,
      text: textInput.trim(),
      fontSize: textFontSize,
    };

    const updated = [...shapes, newShape];
    setShapes(updated);
    setRedoStack([]);
    redrawCanvas(updated);

    setIsTextModalOpen(false);
    setTextInput('');
    setTextCoord(null);
    showNotice('Text callout placed');
  };

  const handleUndo = () => {
    if (shapes.length === 0) return;
    const next = [...shapes];
    const popped = next.pop();
    if (popped) {
      setShapes(next);
      setRedoStack([popped, ...redoStack]);
      redrawCanvas(next);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const [first, ...rest] = redoStack;
    const next = [...shapes, first];
    setShapes(next);
    setRedoStack(rest);
    redrawCanvas(next);
  };

  const handleClear = () => {
    if (confirm('Clear entire canvas and all drawings?')) {
      setShapes([]);
      setRedoStack([]);
      setBgImage(null);
      setBgImageUrl(null);
      redrawCanvas([]);
      showNotice('Canvas cleared');
    }
  };

  // Toggle Layer Visibility
  const toggleLayerVisibility = (layerId: string) => {
    const nextLayers = layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l));
    setLayers(nextLayers);
  };

  // Add New Layer
  const handleAddLayer = () => {
    const newLayerId = `layer-${Date.now()}`;
    const newLayerName = `Layer ${layers.length + 1}`;
    const nextLayers = [...layers, { id: newLayerId, name: newLayerName, visible: true }];
    setLayers(nextLayers);
    setActiveLayerId(newLayerId);
    showNotice(`Added ${newLayerName}`);
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
        redrawCanvas(shapes);
        showNotice(`Imported blueprint: ${file.name}`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveToArchive = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const newSketch: SavedSketch = {
      id: 'sketch-' + Date.now(),
      title: sketchTitle || 'Architectural Schematic',
      timestamp: Date.now(),
      dataUrl,
      shapes,
      bgImage: bgImageUrl,
    };

    const updated = [newSketch, ...savedSketches];
    setSavedSketches(updated);
    try {
      localStorage.setItem('arkipelago_sketches', JSON.stringify(updated));
    } catch {
      // quota safeguard
    }
    showNotice('Sketch saved to studio archive');
  };

  const handleLoadSavedSketch = (sketch: SavedSketch) => {
    if (sketch.shapes && sketch.shapes.length > 0) {
      setShapes(sketch.shapes);
      setRedoStack([]);
      setSketchTitle(sketch.title);

      if (sketch.bgImage) {
        const img = new Image();
        img.onload = () => {
          setBgImage(img);
          setBgImageUrl(sketch.bgImage || null);
          redrawCanvas(sketch.shapes || []);
        };
        img.src = sketch.bgImage;
      } else {
        setBgImage(null);
        setBgImageUrl(null);
        redrawCanvas(sketch.shapes);
      }
    } else {
      const img = new Image();
      img.onload = () => {
        setBgImage(img);
        setBgImageUrl(sketch.dataUrl);
        setShapes([]);
        redrawCanvas([]);
      };
      img.src = sketch.dataUrl;
    }
    showNotice(`Loaded archive: ${sketch.title}`);
  };

  const handleExportStampedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const expCanvas = document.createElement('canvas');
    const titleBlockHeight = 80;
    expCanvas.width = canvas.width;
    expCanvas.height = canvas.height + titleBlockHeight;
    const ctx = expCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(canvas, 0, 0);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, canvas.height, expCanvas.width, titleBlockHeight);

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(expCanvas.width, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px Courier New, monospace';
    ctx.fillText(`ESTUDIO ARKIPELAGO — ${sketchTitle}`, 20, canvas.height + 30);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Courier New, monospace';
    ctx.fillText(
      `Author: ${user?.name || 'Architect'}  |  Date: ${new Date().toLocaleDateString()}  |  Scale: NTS  |  Status: Schematic Redline`,
      20,
      canvas.height + 55
    );

    const link = document.createElement('a');
    link.download = `${sketchTitle.toLowerCase().replace(/\s+/g, '_')}_stamped.png`;
    link.href = expCanvas.toDataURL('image/png');
    link.click();
    showNotice('Exported high-res stamped blueprint');
  };

  const handleSendToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    try {
      localStorage.setItem('arkipelago_pending_chat_attachment', dataUrl);
    } catch {
      // ignore
    }
    router.push('/chat?thread=thread-001&attached=sketch');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-bg-main text-text-main font-mono overflow-hidden transition-colors border border-border-main rounded-xl shadow-sm relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      {/* Text Annotation Placement Modal */}
      {isTextModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-main border border-border-main rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Type className="w-4 h-4 text-accent-cyan" />
                <span>Add Text Callout</span>
              </h3>
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="text-muted-main hover:text-text-main text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Annotation Text / Room Label / Dimension
                </label>
                <input
                  type="text"
                  placeholder="e.g. Living Area 4.50m x 6.20m, El. +3.50m..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-4 py-2.5 text-xs font-mono text-text-main focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-main block mb-1">
                  Font Size: {textFontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="32"
                  value={textFontSize}
                  onChange={(e) => setTextFontSize(Number(e.target.value))}
                  className="w-full accent-accent-cyan cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsTextModalOpen(false)}
                className="px-4 py-2 border border-border-main rounded-lg text-xs font-semibold hover:bg-surface-hover cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTextAnnotation}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 shadow-sm cursor-pointer"
              >
                Place Callout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Toast Notice */}
      {feedbackNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <Check className="w-3.5 h-3.5 text-accent-cyan" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-main bg-surface-main shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-surface-hover border border-border-main flex items-center justify-center">
            <PenTool className="w-4 h-4 text-accent-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sketchTitle}
                onChange={(e) => setSketchTitle(e.target.value)}
                className="bg-transparent font-bold text-xs text-text-main focus:outline-none focus:border-b border-accent-cyan max-w-[240px] sm:max-w-xs"
              />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Drafting Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Send to Chat Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendToChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/40 hover:bg-accent-cyan/25 text-xs font-semibold transition-colors cursor-pointer"
            title="Share sketch with project chat room"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send to Chat</span>
          </button>
          <button
            onClick={handleExportStampedImage}
            className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:opacity-90 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Stamped</span>
          </button>
        </div>
      </div>

      {/* Secondary Dynamic Tool Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-border-main bg-surface-hover/50 gap-2 shrink-0">
        {/* Tool Mode Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => setActiveTool('pen')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'pen'
                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Freehand Pen"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Pen</span>
          </button>

          <button
            onClick={() => setActiveTool('line')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'line'
                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Straight Line Tool"
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Line</span>
          </button>

          <button
            onClick={() => setActiveTool('rectangle')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'rectangle'
                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Rectangle / Wall Tool"
          >
            <Square className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rect</span>
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'circle'
                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Circle / Column Tool"
          >
            <Circle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Circle</span>
          </button>

          <button
            onClick={() => setActiveTool('arrow')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'arrow'
                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Arrow / Dimension Leader"
          >
            <MoveRight className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden md:inline">Leader</span>
          </button>

          <button
            onClick={() => setActiveTool('text')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'text'
                ? 'bg-black text-white dark:bg-white dark:text-black border-text-main shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Text Callout"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Text</span>
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer',
              activeTool === 'eraser'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : 'bg-surface-main border-border-main text-muted-main hover:text-text-main'
            )}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Eraser</span>
          </button>

          {/* Ortho Lock Toggle */}
          <button
            onClick={() => setOrthoLock(!orthoLock)}
            className={cn(
              'ml-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer',
              orthoLock
                ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan'
                : 'bg-surface-main border-border-main text-muted-main'
            )}
            title="Snap angles to 0°, 45°, 90°"
          >
            Ortho: {orthoLock ? 'On' : 'Off'}
          </button>
        </div>

        {/* Grid Selector & Undo / Redo Controls */}
        <div className="flex items-center gap-2">
          {/* Grid Type Toggle */}
          <div className="flex items-center gap-1 bg-surface-main p-1 rounded-lg border border-border-main">
            <Grid3X3 className="w-3.5 h-3.5 text-muted-main ml-1" />
            {(['none', 'square', 'dots', 'isometric'] as GridType[]).map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGridType(g);
                  redrawCanvas(shapes);
                }}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-semibold capitalize rounded cursor-pointer',
                  gridType === g ? 'bg-surface-hover text-text-main font-bold' : 'text-muted-main'
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-border-main mx-1" />

          <button
            onClick={handleUndo}
            disabled={shapes.length === 0}
            className={cn('p-1.5 rounded border border-border-main cursor-pointer', shapes.length === 0 ? 'opacity-40' : 'hover:bg-surface-hover')}
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className={cn('p-1.5 rounded border border-border-main cursor-pointer', redoStack.length === 0 ? 'opacity-40' : 'hover:bg-surface-hover')}
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded border border-border-main text-rose-600 hover:bg-rose-500/10 cursor-pointer"
            title="Clear Board"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Saved Sketches & Layers Tabs */}
        <div className="hidden md:flex w-56 border-r border-border-main bg-surface-main flex-col shrink-0">
          <div className="flex border-b border-border-main">
            <button
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold text-center border-r border-border-main transition-colors cursor-pointer',
                activeTab === 'archive' ? 'bg-surface-hover text-accent-cyan font-bold' : 'text-muted-main'
              )}
              onClick={() => setActiveTab('archive')}
            >
              Archive ({savedSketches.length})
            </button>
            <button
              className={cn(
                'flex-1 py-2.5 text-xs font-semibold text-center transition-colors cursor-pointer',
                activeTab === 'layers' ? 'bg-surface-hover text-accent-cyan font-bold' : 'text-muted-main'
              )}
              onClick={() => setActiveTab('layers')}
            >
              Layers ({layers.length})
            </button>
          </div>

          {activeTab === 'archive' ? (
            <>
              <div className="p-2.5 border-b border-border-main flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider">Saved Sheets</span>
                <Info className="w-3.5 h-3.5 text-muted-main" />
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
                {savedSketches.length === 0 ? (
                  <div className="text-muted-main text-xs text-center mt-10 italic">
                    No saved sheets
                  </div>
                ) : (
                  savedSketches.map((sketch) => (
                    <div
                      key={sketch.id}
                      onClick={() => handleLoadSavedSketch(sketch)}
                      className="border border-border-main bg-surface-hover p-2 rounded-xl group hover:border-accent-cyan cursor-pointer transition-all shadow-2xs"
                      title="Click to resume editing on canvas"
                    >
                      <div className="aspect-video bg-white w-full rounded-lg overflow-hidden relative mb-1.5 border border-border-main">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sketch.dataUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-xs font-semibold text-text-main truncate">
                        {sketch.title}
                      </div>
                      <div className="text-[10px] text-muted-main">
                        {new Date(sketch.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Layers Manager View */}
              <div className="p-2.5 border-b border-border-main flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider">Layer Hierarchy</span>
                <button
                  onClick={handleAddLayer}
                  className="p-1 rounded hover:bg-surface-hover text-accent-cyan cursor-pointer"
                  title="Add new drawing layer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {layers.map((layer) => {
                  const isActive = activeLayerId === layer.id;
                  const shapeCount = shapes.filter((s) => s.layerId === layer.id).length;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => setActiveLayerId(layer.id)}
                      className={cn(
                        'p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all',
                        isActive
                          ? 'bg-surface-hover border-text-main font-semibold'
                          : 'border-border-main hover:bg-surface-hover/50'
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Layers className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-accent-cyan' : 'text-muted-main')} />
                        <div className="overflow-hidden">
                          <p className="text-xs truncate">{layer.name}</p>
                          <span className="text-[10px] text-muted-main">{shapeCount} elements</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                        className="p-1 rounded hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer shrink-0"
                        title={layer.visible ? 'Hide layer' : 'Show layer'}
                      >
                        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-muted-main/60" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Center Panel (Interactive Canvas) */}
        <div className="flex-1 flex flex-col relative bg-surface-main overflow-hidden">
          <div ref={containerRef} className="flex-1 w-full h-full relative bg-white cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 touch-none"
            />

            {/* Floating Palette & Brush Customizer */}
            <div className="absolute top-4 right-4 bg-surface-main/95 backdrop-blur-md border border-border-main p-4 rounded-2xl shadow-2xl w-64 space-y-3.5 z-20 font-mono text-text-main">
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-main uppercase tracking-wider">
                <span>Architectural Palette</span>
                <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-6 gap-2">
                {ARCHITECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-7 h-7 rounded-full border border-border-strong transition-transform hover:scale-110 shrink-0 shadow-xs cursor-pointer',
                      color === c ? 'ring-2 ring-accent-cyan scale-110' : ''
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* Opacity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-muted-main font-semibold">
                  <span>Ink Opacity</span>
                  <span className="text-text-main font-bold">{opacity}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                  />
                </div>
              </div>

              {/* Stroke Width Selector */}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-main">Pen Thickness</div>
                <div className="grid grid-cols-5 gap-1">
                  {BRUSH_SIZES.map((b) => (
                    <button
                      key={b.label}
                      onClick={() => setSize(b.value)}
                      className={cn(
                        'py-1 text-[10px] font-semibold rounded border transition-all cursor-pointer',
                        size === b.value
                          ? 'bg-text-main text-bg-main border-text-main shadow-xs font-bold'
                          : 'bg-surface-hover border-border-main text-muted-main hover:text-text-main'
                      )}
                    >
                      {b.value}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Blueprint Tracing Opacity Slider if background active */}
              {bgImage && (
                <div className="pt-2 border-t border-border-main space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-accent-cyan">
                    <span>Blueprint Tracing</span>
                    <span>{bgOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={bgOpacity}
                    onChange={(e) => {
                      setBgOpacity(Number(e.target.value));
                      redrawCanvas(shapes);
                    }}
                    className="w-full accent-accent-cyan cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Studio Context Controls */}
        <div className="hidden lg:flex w-56 border-l border-border-main bg-surface-main p-4 flex-col gap-3 shrink-0">
          <span className="text-[10px] font-semibold text-muted-main uppercase tracking-wider">
            Studio Actions
          </span>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 border border-border-main bg-surface-hover/60 hover:bg-surface-hover rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs text-text-main cursor-pointer"
          >
            <Upload className="w-4 h-4 text-accent-cyan" />
            <span>Import Blueprint</span>
          </button>

          <button
            onClick={handleSaveToArchive}
            className="w-full py-2.5 px-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-opacity cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save to Archive</span>
          </button>

          <button
            onClick={handleExportStampedImage}
            className="w-full py-2.5 px-3 border border-border-main bg-surface-hover/60 hover:bg-surface-hover rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors text-text-main cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-muted-main" />
            <span>Export PNG Sheet</span>
          </button>

          <button
            onClick={handleClear}
            className="w-full py-2 px-3 border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-auto cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
