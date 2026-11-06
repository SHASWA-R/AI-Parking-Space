import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Detection, TargetGroundTruth } from '../types/sonar';
import { ZoomIn, ZoomOut, Maximize2, Ruler, Eye, Crosshair, Palette, Sliders, RotateCcw } from 'lucide-react';

export type ColormapTheme = 'amber' | 'phosphor' | 'copper' | 'cyan' | 'grayscale';

export interface SonarCanvasHandle {
  centerOn: (x: number, y: number, zoomLevel?: number) => void;
  cycleTheme: () => void;
  fitToScreen: () => void;
}

interface SonarCanvasProps {
  imageSrc: string;
  detections: Detection[];
  groundTruthTargets?: TargetGroundTruth[];
  selectedDetection: Detection | null;
  onSelectDetection: (detection: Detection) => void;
  showGroundTruth: boolean;
  onToggleGroundTruth: (show: boolean) => void;
  isAuvSweeping?: boolean;
}

interface MeasurePoint {
  x: number;
  y: number;
}

export const SonarCanvas = forwardRef<SonarCanvasHandle, SonarCanvasProps>(({
  imageSrc,
  detections,
  groundTruthTargets = [],
  selectedDetection,
  onSelectDetection,
  showGroundTruth,
  onToggleGroundTruth,
  isAuvSweeping = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Pan & Zoom state
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Measurement Ruler state
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measureStart, setMeasureStart] = useState<MeasurePoint | null>(null);
  const [measureEnd, setMeasureEnd] = useState<MeasurePoint | null>(null);

  // Hover detection
  const [hoveredDetection, setHoveredDetection] = useState<Detection | null>(null);

  // Colormap Theme & Image adjustments
  const [theme, setTheme] = useState<ColormapTheme>('amber');
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(115);
  const [brightness, setBrightness] = useState<number>(100);

  // AUV Sweep animation line position
  const [sweepY, setSweepY] = useState<number>(0);

  const METERS_PER_PX_ACROSS = 0.01953;
  const METERS_PER_PX_ALONG = 0.02000;

  const handleFitToScreen = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;
    const container = containerRef.current;
    const img = imageRef.current;

    const scaleX = (container.clientWidth - 20) / img.naturalWidth;
    const scaleY = (container.clientHeight - 20) / img.naturalHeight;
    const initialScale = Math.min(scaleX, scaleY, 1);

    const initialOffsetX = (container.clientWidth - img.naturalWidth * initialScale) / 2;
    const initialOffsetY = (container.clientHeight - img.naturalHeight * initialScale) / 2;

    setScale(initialScale);
    setOffset({ x: initialOffsetX, y: initialOffsetY });
  }, []);

  const centerOn = useCallback((imgX: number, imgY: number, targetScale: number = 1.8) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const newScale = targetScale;
    const newOffsetX = container.clientWidth / 2 - imgX * newScale;
    const newOffsetY = container.clientHeight / 2 - imgY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, []);

  const cycleTheme = useCallback(() => {
    const themes: ColormapTheme[] = ['amber', 'phosphor', 'copper', 'cyan', 'grayscale'];
    setTheme(current => {
      const nextIdx = (themes.indexOf(current) + 1) % themes.length;
      return themes[nextIdx];
    });
  }, []);

  useImperativeHandle(ref, () => ({
    centerOn,
    cycleTheme,
    fitToScreen: handleFitToScreen
  }), [centerOn, cycleTheme, handleFitToScreen]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      handleFitToScreen();
    };
  }, [imageSrc, handleFitToScreen]);

  useEffect(() => {
    if (!isAuvSweeping) return;
    let animId: number;
    let lastTime = performance.now();

    const updateSweep = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;
      setSweepY(prev => {
        const next = prev + (dt * 0.18);
        return next > 1024 ? 0 : next;
      });
      animId = requestAnimationFrame(updateSweep);
    };

    animId = requestAnimationFrame(updateSweep);
    return () => cancelAnimationFrame(animId);
  }, [isAuvSweeping]);

  const screenToImage = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;
      return {
        x: (canvasX - offset.x) / scale,
        y: (canvasY - offset.y) / scale
      };
    },
    [offset, scale]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (containerRef.current) {
      if (canvas.width !== containerRef.current.clientWidth || canvas.height !== containerRef.current.clientHeight) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    }

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = imageRef.current;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 1. Render Sonar Waterfall Image
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    let filterString = `contrast(${contrast}%) brightness(${brightness}%)`;
    if (theme === 'amber') {
      filterString += ' sepia(90%) hue-rotate(345deg) saturate(240%)';
    } else if (theme === 'phosphor') {
      filterString += ' sepia(100%) hue-rotate(85deg) saturate(320%)';
    } else if (theme === 'copper') {
      filterString += ' sepia(100%) hue-rotate(320deg) saturate(260%) contrast(130%)';
    } else if (theme === 'cyan') {
      filterString += ' sepia(100%) hue-rotate(150deg) saturate(280%)';
    } else if (theme === 'grayscale') {
      filterString += ' grayscale(100%)';
    }
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0, imgW, imgH);
    ctx.restore();

    // 2. Nadir Line
    const nadirX = imgW / 2;
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = theme === 'amber' ? 'rgba(255, 180, 0, 0.5)' : 'rgba(0, 229, 255, 0.45)';
    ctx.lineWidth = 1.5 / scale;
    ctx.beginPath();
    ctx.moveTo(nadirX, 0);
    ctx.lineTo(nadirX, imgH);
    ctx.stroke();

    const waterColumnSpan = (3.5 / 20.0) * (imgW / 2);
    ctx.fillStyle = 'rgba(0, 10, 25, 0.35)';
    ctx.fillRect(nadirX - waterColumnSpan, 0, waterColumnSpan * 2, imgH);
    ctx.restore();

    // 3. Ground Truth
    if (showGroundTruth && groundTruthTargets.length > 0) {
      ctx.save();
      groundTruthTargets.forEach(gt => {
        const [x1, y1, x2, y2] = gt.bbox_xyxy;
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2 / scale;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

        ctx.fillStyle = '#c084fc';
        ctx.font = `${Math.max(10 / scale, 8)}px monospace`;
        ctx.fillText(`GROUND TRUTH: ${gt.gear_type || gt.style}`, x1 + 4, y1 - 4 / scale);
      });
      ctx.restore();
    }

    // 4. AI Detections
    detections.forEach(det => {
      const isSelected = selectedDetection?.id === det.id;
      const isHovered = hoveredDetection?.id === det.id;
      const { x1, y1, x2, y2 } = det.bbox;
      const w = x2 - x1;
      const h = y2 - y1;

      let strokeColor = '#00e5ff';
      let fillColor = 'rgba(0, 229, 255, 0.12)';
      if (det.risk === 'CRITICAL') {
        strokeColor = '#ef4444';
        fillColor = 'rgba(239, 68, 68, 0.22)';
      } else if (det.risk === 'HIGH') {
        strokeColor = '#f59e0b';
        fillColor = 'rgba(245, 158, 11, 0.18)';
      } else if (det.risk === 'MEDIUM') {
        strokeColor = '#eab308';
        fillColor = 'rgba(234, 179, 8, 0.15)';
      }

      ctx.save();
      ctx.fillStyle = isSelected ? fillColor.replace(/[\d.]+\)$/, '0.38)') : fillColor;
      ctx.fillRect(x1, y1, w, h);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = (isSelected ? 3.5 : isHovered ? 2.5 : 1.8) / scale;
      ctx.setLineDash([]);
      ctx.strokeRect(x1, y1, w, h);

      const bracketLen = Math.min(16, w / 4, h / 4);
      ctx.lineWidth = (isSelected ? 4.5 : 2.5) / scale;
      ctx.beginPath();
      ctx.moveTo(x1, y1 + bracketLen); ctx.lineTo(x1, y1); ctx.lineTo(x1 + bracketLen, y1);
      ctx.moveTo(x2 - bracketLen, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + bracketLen);
      ctx.moveTo(x2, y2 - bracketLen); ctx.lineTo(x2, y2); ctx.lineTo(x2 - bracketLen, y2);
      ctx.moveTo(x1 + bracketLen, y2); ctx.lineTo(x1, y2); ctx.lineTo(x1, y2 - bracketLen);
      ctx.stroke();

      ctx.fillStyle = strokeColor;
      const fontSize = Math.max(11 / scale, 9);
      ctx.font = `bold ${fontSize}px monospace`;
      const labelText = `[${det.id}] ${det.className} (${Math.round(det.confidence * 100)}%)`;
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = 'rgba(5, 11, 20, 0.88)';
      ctx.fillRect(x1, y1 - fontSize - 6 / scale, textWidth + 10 / scale, fontSize + 5 / scale);
      ctx.fillStyle = strokeColor;
      ctx.fillText(labelText, x1 + 5 / scale, y1 - 4 / scale);
      ctx.restore();
    });

    // 5. AUV Sweep Line
    if (isAuvSweeping) {
      ctx.save();
      const grad = ctx.createLinearGradient(0, sweepY - 14, 0, sweepY + 4);
      grad.addColorStop(0, 'rgba(0, 255, 136, 0.0)');
      grad.addColorStop(0.7, 'rgba(0, 255, 136, 0.25)');
      grad.addColorStop(1, 'rgba(0, 255, 136, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, sweepY - 14, imgW, 14);

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(imgW, sweepY);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Metric Ruler
    if (measureStart && measureEnd) {
      ctx.save();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2.5 / scale;
      ctx.beginPath();
      ctx.moveTo(measureStart.x, measureStart.y);
      ctx.lineTo(measureEnd.x, measureEnd.y);
      ctx.stroke();

      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(measureStart.x, measureStart.y, 4 / scale, 0, Math.PI * 2);
      ctx.arc(measureEnd.x, measureEnd.y, 4 / scale, 0, Math.PI * 2);
      ctx.fill();

      const dPxAcross = Math.abs(measureEnd.x - measureStart.x);
      const dPxAlong = Math.abs(measureEnd.y - measureStart.y);
      const dMetersAcross = dPxAcross * METERS_PER_PX_ACROSS;
      const dMetersAlong = dPxAlong * METERS_PER_PX_ALONG;
      const totalMeters = Math.sqrt(dMetersAcross * dMetersAcross + dMetersAlong * dMetersAlong);

      const midX = (measureStart.x + measureEnd.x) / 2;
      const midY = (measureStart.y + measureEnd.y) / 2;
      const tagText = `${totalMeters.toFixed(2)} m (ΔX: ${dMetersAcross.toFixed(2)}m, ΔY: ${dMetersAlong.toFixed(2)}m)`;

      ctx.font = `bold ${Math.max(12 / scale, 10)}px monospace`;
      const tagW = ctx.measureText(tagText).width;
      ctx.fillStyle = 'rgba(7, 13, 24, 0.92)';
      ctx.fillRect(midX - tagW / 2 - 6 / scale, midY - 14 / scale, tagW + 12 / scale, 20 / scale);
      ctx.strokeStyle = '#00ff88';
      ctx.strokeRect(midX - tagW / 2 - 6 / scale, midY - 14 / scale, tagW + 12 / scale, 20 / scale);
      ctx.fillStyle = '#00ff88';
      ctx.fillText(tagText, midX - tagW / 2, midY + 1 / scale);
      ctx.restore();
    }

    ctx.restore();

    // 7. Minimap
    ctx.save();
    const miniW = 120;
    const miniH = 60;
    const miniX = canvas.width - miniW - 12;
    const miniY = 42;

    ctx.fillStyle = 'rgba(5, 11, 20, 0.85)';
    ctx.fillRect(miniX, miniY, miniW, miniH);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(miniX, miniY, miniW, miniH);

    detections.forEach(det => {
      const mx = miniX + (det.bbox.cx || 0) / imgW * miniW;
      const my = miniY + (det.bbox.cy || 0) / imgH * miniH;
      ctx.fillStyle = det.risk === 'CRITICAL' ? '#ef4444' : '#00e5ff';
      ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);
    });

    const viewImgX1 = Math.max(0, -offset.x / scale);
    const viewImgY1 = Math.max(0, -offset.y / scale);
    const viewImgW = canvas.width / scale;
    const viewImgH = canvas.height / scale;

    const vpX = miniX + (viewImgX1 / imgW) * miniW;
    const vpY = miniY + (viewImgY1 / imgH) * miniH;
    const vpW = Math.min(miniW, (viewImgW / imgW) * miniW);
    const vpH = Math.min(miniH, (viewImgH / imgH) * miniH);

    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
    ctx.fillStyle = 'rgba(0, 255, 136, 0.12)';
    ctx.fillRect(vpX, vpY, vpW, vpH);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px monospace';
    ctx.fillText('SWATH MINIMAP', miniX + 4, miniY + 10);
    ctx.restore();

    // 8. Channels Demarcation
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(12, 12, 115, 24);
    ctx.fillRect(canvas.width - 260, 12, 115, 24);
    ctx.fillStyle = '#00e5ff';
    ctx.font = '11px monospace';
    ctx.fillText('◀ PORT CHANNEL', 18, 28);
    ctx.fillText('STARBOARD ▶', canvas.width - 250, 28);
    ctx.restore();

  }, [
    offset,
    scale,
    detections,
    groundTruthTargets,
    selectedDetection,
    hoveredDetection,
    measureMode,
    measureStart,
    measureEnd,
    showGroundTruth,
    theme,
    contrast,
    brightness,
    isAuvSweeping,
    sweepY
  ]);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.max(0.2, Math.min(8.0, scale * zoomFactor));

    setOffset({
      x: mouseX - (mouseX - offset.x) * (newScale / scale),
      y: mouseY - (mouseY - offset.y) * (newScale / scale)
    });
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = screenToImage(e.clientX, e.clientY);

    if (measureMode) {
      setMeasureStart(coords);
      setMeasureEnd(coords);
    } else {
      const clicked = detections.find(d => {
        return (
          coords.x >= d.bbox.x1 &&
          coords.x <= d.bbox.x2 &&
          coords.y >= d.bbox.y1 &&
          coords.y <= d.bbox.y2
        );
      });

      if (clicked) {
        onSelectDetection(clicked);
      } else {
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = screenToImage(e.clientX, e.clientY);

    if (measureMode && measureStart) {
      setMeasureEnd(coords);
    } else if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      const hovered = detections.find(d => {
        return (
          coords.x >= d.bbox.x1 &&
          coords.x <= d.bbox.x2 &&
          coords.y >= d.bbox.y1 &&
          coords.y <= d.bbox.y2
        );
      });
      setHoveredDetection(hovered || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative flex flex-col h-full rounded-2xl overflow-hidden shadow-xl border transition-colors duration-200 bg-[#030712] border-slate-800 dark:bg-[#030712] dark:border-slate-800 light:bg-slate-900 light:border-slate-300">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 text-xs z-10 flex-wrap gap-2 border-b bg-[#070f1e] border-slate-800 text-slate-200 dark:bg-[#070f1e] dark:border-slate-800 light:bg-slate-100 light:border-slate-200 light:text-slate-800">
        <div className="flex items-center space-x-2">
          {/* Zoom Indicator */}
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded font-mono border bg-slate-900 border-slate-700 text-slate-300 dark:bg-slate-900 dark:border-slate-700 light:bg-white light:border-slate-300 light:text-slate-700">
            <Crosshair className="w-3 h-3 text-cyan-500" />
            <span>{(scale * 100).toFixed(0)}%</span>
          </div>

          {/* Metric Ruler Toggle */}
          <button
            onClick={() => setMeasureMode(!measureMode)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition ${
              measureMode
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 dark:bg-slate-800 dark:text-slate-300 light:bg-white light:text-slate-700 light:border-slate-300'
            }`}
            title="Click & drag on canvas to measure metric distances (M)"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Ruler {measureMode ? '(Active)' : ''}</span>
          </button>

          {/* Colormap Switcher */}
          <div className="flex items-center space-x-1 p-0.5 rounded border bg-slate-800/80 border-slate-700 dark:bg-slate-800/80 dark:border-slate-700 light:bg-white light:border-slate-300">
            <Palette className="w-3.5 h-3.5 text-amber-400 ml-1.5" />
            {(['amber', 'phosphor', 'copper', 'cyan', 'grayscale'] as ColormapTheme[]).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize transition ${
                  theme === t
                    ? 'bg-slate-700 text-white font-bold dark:bg-slate-700 light:bg-slate-200 light:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Image Adjustments Popover Toggle */}
          <button
            onClick={() => setShowAdjustments(!showAdjustments)}
            className={`p-1.5 rounded border transition ${
              showAdjustments
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 dark:bg-slate-800 dark:text-slate-300 light:bg-white light:text-slate-700 light:border-slate-300'
            }`}
            title="Image Enhancement Sliders (Contrast & Brightness)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Ground Truth Toggle */}
          {groundTruthTargets.length > 0 && (
            <button
              onClick={() => onToggleGroundTruth(!showGroundTruth)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded font-medium transition ${
                showGroundTruth
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 dark:bg-slate-800 dark:text-slate-300 light:bg-white light:text-slate-700 light:border-slate-300'
              }`}
              title="Toggle Ground Truth comparison boxes (G)"
            >
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>Ground Truth</span>
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setScale(s => Math.min(8.0, s * 1.25))}
            className="p-1.5 rounded border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 dark:bg-slate-800 dark:text-slate-300 light:bg-white light:text-slate-700 light:border-slate-300"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(0.2, s * 0.8))}
            className="p-1.5 rounded border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 dark:bg-slate-800 dark:text-slate-300 light:bg-white light:text-slate-700 light:border-slate-300"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-1.5 rounded border bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 dark:bg-slate-800 dark:text-slate-300 light:bg-white light:text-slate-700 light:border-slate-300"
            title="Fit to Screen (F)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Adjustments Dropdown HUD */}
      {showAdjustments && (
        <div className="absolute top-12 left-3 z-20 backdrop-blur border rounded-xl p-3 text-xs space-y-2 shadow-2xl font-mono w-64 bg-[#070f1e]/95 border-slate-700 text-slate-200 dark:bg-[#070f1e]/95 dark:border-slate-700 light:bg-white/95 light:border-slate-200 light:text-slate-800">
          <div className="flex items-center justify-between font-bold text-cyan-500 border-b pb-1 border-slate-800 dark:border-slate-800 light:border-slate-200">
            <span>Acoustic Image Controls</span>
            <button
              onClick={() => {
                setContrast(115);
                setBrightness(100);
              }}
              className="text-slate-400 hover:text-cyan-500"
              title="Reset Adjustments"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Contrast</span>
              <span className="font-bold">{contrast}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="220"
              value={contrast}
              onChange={e => setContrast(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
              <span>Brightness</span>
              <span className="font-bold">{brightness}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="160"
              value={brightness}
              onChange={e => setBrightness(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[460px] cursor-crosshair overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Bottom Sonar Range Scale Bar */}
        <div className="absolute bottom-3 left-3 backdrop-blur px-3 py-1.5 rounded border font-mono text-[11px] flex items-center space-x-3 pointer-events-none bg-[#070f1e]/85 border-slate-800 text-slate-300 dark:bg-[#070f1e]/85 dark:border-slate-800 light:bg-white/85 light:border-slate-200 light:text-slate-700">
          <span className="text-cyan-500 font-bold">Nadir: 0.0m</span>
          <span>Port: -20.0m</span>
          <span>Starboard: +20.0m</span>
          <span className="text-emerald-500 font-bold">Swath Length: ~20.5m</span>
        </div>
      </div>
    </div>
  );
});
