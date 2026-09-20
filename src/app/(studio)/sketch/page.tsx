'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  PenTool, Maximize2, X, Menu, ChevronDown, 
  Undo2, Redo2, Trash2, Copy, MoreVertical, 
  Upload, Trash, Save, FileDown, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  size: number;
  opacity: number;
}

interface SavedSketch {
  id: string;
  timestamp: number;
  dataUrl: string;
}

const COLORS = [
  '#000000', '#444444', '#FFFFFF', '#C084FC', '#A855F7', '#EC4899',
  '#3B82F6', '#06B6D4', '#F97316', '#EF4444', '#38BDF8', '#F43F5E',
  '#22C55E', '#14B8A6', '#84CC16', '#EAB308', '#FB923C', '#FBBF24'
];

const BRUSH_SIZES = [
  { label: 'S', value: 2 },
  { label: 'M', value: 5 },
  { label: 'L', value: 10 },
  { label: 'XL', value: 20 },
];

export default function SketchingStudioPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  
  const [activeTab, setActiveTab] = useState<'archive' | 'pdf'>('archive');
  const [savedSketches, setSavedSketches] = useState<SavedSketch[]>([]);

  // Load saved sketches
  useEffect(() => {
    const raw = localStorage.getItem('arkipelago_sketches');
    if (raw) {
      try {
        setSavedSketches(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse sketches', e);
      }
    }
  }, []);

  // Resize canvas dynamically
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    redrawCanvas(history);
  }, [history]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const hexToRgba = (hex: string, alphaPercent: number) => {
    const alpha = alphaPercent / 100;
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(char => char + char).join('');
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const redrawCanvas = useCallback((strokesToDraw: Stroke[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesToDraw.forEach(stroke => {
      if (stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.strokeStyle = hexToRgba(stroke.color, stroke.opacity);
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }, []);

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

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [coords],
      color,
      size,
      opacity
    };
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentStroke) return;

    const coords = getCanvasCoords(e);
    if (!coords) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, coords]
    };
    setCurrentStroke(updatedStroke);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      const lastPoint = currentStroke.points[currentStroke.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = hexToRgba(color, opacity);
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();
    if (!isDrawing || !currentStroke) return;
    
    setIsDrawing(false);
    const newHistory = [...history, currentStroke];
    setHistory(newHistory);
    setRedoStack([]);
    setCurrentStroke(null);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDrawing) stopDrawing();
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDrawing, currentStroke]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const popped = newHistory.pop();
    if (popped) {
      setHistory(newHistory);
      setRedoStack([...redoStack, popped]);
      redrawCanvas(newHistory);
    }
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const newRedoStack = [...redoStack];
    const popped = newRedoStack.pop();
    if (popped) {
      setRedoStack(newRedoStack);
      const newHistory = [...history, popped];
      setHistory(newHistory);
      redrawCanvas(newHistory);
    }
  };

  const handleClear = () => {
    setHistory([]);
    setRedoStack([]);
    redrawCanvas([]);
  };

  const handleSaveToArchive = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const newSketch: SavedSketch = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      dataUrl
    };

    const updated = [newSketch, ...savedSketches];
    setSavedSketches(updated);
    localStorage.setItem('arkipelago_sketches', JSON.stringify(updated));
    alert('SKETCH SAVED TO ARCHIVE!');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-bg-main text-text-main font-mono overflow-hidden transition-colors border border-border-main rounded-xl shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-main bg-surface-main">
        <div className="flex items-center gap-3">
          <PenTool className="w-4 h-4 text-accent-cyan" />
          <h1 className="font-extrabold tracking-wider text-xs uppercase">SKETCHING STUDIO</h1>
          <span className="text-muted-main text-[11px] uppercase hidden md:inline">HIGH-FIDELITY ARCHITECTURAL IDEATION BOARD</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded hover:bg-surface-hover text-muted-main hover:text-text-main">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-surface-hover text-muted-main hover:text-text-main">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-main bg-surface-hover/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-surface-hover border border-border-main flex items-center justify-center">
            <PenTool className="w-3.5 h-3.5 text-text-main" />
          </div>
          <h2 className="font-bold text-xs uppercase">DESIGN SKETCHING STUDIO</h2>
          <span className="text-muted-main text-[10px] uppercase hidden sm:inline">- HIGH-FIDELITY ARCHITECTURAL IDEATION BOARD</span>
        </div>
        <div className="border border-accent-cyan/60 px-2 py-0.5 text-accent-cyan text-[10px] font-bold tracking-wider rounded uppercase">
          BOARD ACTIVE
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-48 border-r border-border-main bg-surface-main flex flex-col shrink-0">
          <div className="flex border-b border-border-main">
            <button 
              className={cn("flex-1 py-2.5 text-xs font-bold text-center border-r border-border-main uppercase tracking-wider", activeTab === 'archive' ? "bg-surface-hover text-accent-cyan" : "text-muted-main hover:text-text-main")}
              onClick={() => setActiveTab('archive')}
            >
              ARCHIVE
            </button>
            <button 
              className={cn("flex-1 py-2.5 text-xs font-bold text-center uppercase tracking-wider", activeTab === 'pdf' ? "bg-surface-hover text-accent-cyan" : "text-muted-main hover:text-text-main")}
              onClick={() => setActiveTab('pdf')}
            >
              PDF PAGES
            </button>
          </div>
          
          <div className="p-3 border-b border-border-main flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-muted-main">SKETCH LOGS</span>
            <Info className="w-3.5 h-3.5 text-muted-main" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {savedSketches.length === 0 ? (
              <div className="text-muted-main text-[11px] text-center mt-10 uppercase italic">EMPTY ARCHIVE</div>
            ) : (
              savedSketches.map(sketch => (
                <div key={sketch.id} className="border border-border-main bg-surface-hover p-1.5 rounded-lg group hover:border-text-main cursor-pointer">
                  <div className="aspect-video bg-white w-full rounded overflow-hidden relative mb-1 border border-border-main">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sketch.dataUrl} alt="Sketch thumbnail" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-[9px] text-muted-main text-center">
                    {new Date(sketch.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Panel (Canvas) */}
        <div className="flex-1 flex flex-col relative bg-surface-main overflow-hidden">
          
          {/* Toolbar */}
          <div className="h-10 border-b border-border-main bg-surface-hover/30 flex items-center px-3 shrink-0">
            <button className="p-1 hover:bg-surface-hover text-text-main rounded">
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border-main mx-2" />
            
            <button className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-surface-hover text-xs font-bold text-text-main rounded">
              Page 1 <ChevronDown className="w-3 h-3 text-muted-main" />
            </button>
            
            <div className="w-px h-4 bg-border-main mx-2" />
            
            <button 
              className={cn("p-1.5 rounded", history.length === 0 ? "text-muted-main/40 cursor-not-allowed" : "text-text-main hover:bg-surface-hover")}
              onClick={handleUndo}
              disabled={history.length === 0}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              className={cn("p-1.5 rounded", redoStack.length === 0 ? "text-muted-main/40 cursor-not-allowed" : "text-text-main hover:bg-surface-hover")}
              onClick={handleRedo}
              disabled={redoStack.length === 0}
            >
              <Redo2 className="w-4 h-4" />
            </button>
            
            <div className="w-px h-4 bg-border-main mx-2" />
            
            <button className="p-1.5 hover:bg-surface-hover text-accent-red rounded" onClick={handleClear} title="Clear Canvas">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-surface-hover text-text-main rounded">
              <Copy className="w-4 h-4" />
            </button>
            
            <div className="ml-auto">
              <button className="p-1.5 hover:bg-surface-hover text-text-main rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area */}
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

            {/* Color Palette Floating Panel */}
            <div className="absolute top-4 right-4 bg-surface-main/95 backdrop-blur border border-border-main p-4 rounded-xl shadow-lg w-64 space-y-3 z-20">
              <div className="text-[10px] font-bold text-muted-main uppercase tracking-wider">
                BRUSH & COLOR PALETTE
              </div>
              
              <div className="grid grid-cols-6 gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-7 h-7 rounded-full border border-border-strong transition-transform hover:scale-110",
                      color === c ? "ring-2 ring-accent-cyan scale-110" : ""
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] text-muted-main uppercase font-bold">
                  <span>OPACITY</span>
                  <span>{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>

              <div className="flex items-center justify-between gap-1 pt-1">
                {BRUSH_SIZES.map((b) => (
                  <button
                    key={b.label}
                    onClick={() => setSize(b.value)}
                    className={cn(
                      "flex-1 py-1 text-xs font-bold uppercase rounded border transition-colors",
                      size === b.value
                        ? "bg-black text-white dark:bg-white dark:text-black border-text-main"
                        : "bg-surface-hover border-border-main text-muted-main hover:text-text-main"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-56 border-l border-border-main bg-surface-main p-4 flex flex-col gap-3 shrink-0">
          <span className="text-[10px] font-bold text-muted-main uppercase tracking-wider">STUDIO CONTROLS</span>
          
          <button className="w-full py-3 px-3 border border-border-main bg-surface-hover/50 hover:bg-surface-hover rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
            <Upload className="w-4 h-4 text-muted-main" />
            IMPORT CONTEXT
          </button>
          
          <button onClick={handleClear} className="w-full py-3 px-3 border border-border-main bg-surface-hover/50 hover:bg-surface-hover rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
            <Trash className="w-4 h-4 text-accent-red" />
            CLEAR BOARD
          </button>
          
          <button onClick={handleSaveToArchive} className="w-full py-3 px-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-opacity">
            <Save className="w-4 h-4" />
            SAVE TO ARCHIVE
          </button>
          
          <button className="w-full py-3 px-3 border border-border-main bg-surface-hover/50 hover:bg-surface-hover rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mt-auto">
            <FileDown className="w-4 h-4 text-muted-main" />
            SAVE PDF TO...
          </button>
        </div>

      </div>
    </div>
  );
}
