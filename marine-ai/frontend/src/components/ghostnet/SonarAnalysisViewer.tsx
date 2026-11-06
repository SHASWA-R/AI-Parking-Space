import React, { useState } from 'react';
import { Eye, ShieldCheck, MapPin, Sparkles, CheckCircle, Sliders, Maximize2, AlertTriangle, Bot, Palette } from 'lucide-react';

interface SonarAnalysisViewerProps {
  onViewOnMap?: (lat: number, lon: number) => void;
  onOpenAssistantWithTarget?: (targetQuery: string) => void;
}

export const SonarAnalysisViewer: React.FC<SonarAnalysisViewerProps> = ({ 
  onViewOnMap,
  onOpenAssistantWithTarget,
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'detection'>('detection');
  const [colormap, setColormap] = useState<'phosphor' | 'amber' | 'cyan' | 'grayscale'>('phosphor');
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const targets = [
    {
      id: 'GN-TARGET-01',
      type: 'Ghost Net (Gillnet)',
      confidence: 94.7,
      riskLevel: 'HIGH',
      estimatedSize: '12.4 m',
      lat: '10.1234° N',
      lon: '76.5678° E',
      latNum: 10.1234,
      lonNum: 76.5678,
      depth: '48.2 m',
      acousticShadow: 'Prominent 4.2m acoustic shadow offset',
      entanglementRisk: 'Severe (high profile in water column)',
      box: { x: 38, y: 32, w: 26, h: 36 },
      points: 'Polygon: [ (142, 98), (188, 110), (175, 162), (128, 145) ]',
    },
    {
      id: 'GN-TARGET-02',
      type: 'Trawl Net Webbing',
      confidence: 91.8,
      riskLevel: 'HIGH',
      estimatedSize: '18.6 m',
      lat: '15.4021° N',
      lon: '73.8015° E',
      latNum: 15.4021,
      lonNum: 73.8015,
      depth: '34.0 m',
      acousticShadow: 'Continuous diffuse shadow pattern',
      entanglementRisk: 'Critical (snagged on rocky outcrop)',
      box: { x: 55, y: 45, w: 22, h: 28 },
      points: 'Polygon: [ (210, 140), (252, 148), (240, 185), (202, 175) ]',
    },
    {
      id: 'GN-TARGET-03',
      type: 'Monofilament Longline Cluster',
      confidence: 88.5,
      riskLevel: 'MEDIUM',
      estimatedSize: '8.2 m',
      lat: '13.0827° N',
      lon: '80.2707° E',
      latNum: 13.0827,
      lonNum: 80.2707,
      depth: '26.5 m',
      acousticShadow: 'Linear interrupted shadow trail',
      entanglementRisk: 'Moderate (partially buried in sediment)',
      box: { x: 22, y: 58, w: 20, h: 24 },
      points: 'Polygon: [ (80, 180), (120, 190), (110, 220), (75, 210) ]',
    },
  ];

  const currentTarget = targets[selectedTargetIndex];

  return (
    <section id="technology" className="relative py-28 md:py-36 bg-black text-white dark:bg-black dark:text-white light:bg-slate-50 light:text-slate-900 tech-grid-dark dark:tech-grid-dark light:tech-grid-light border-t border-white/10 dark:border-white/10 light:border-slate-200 transition-colors duration-300">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-[#00ff88]" />
          <span className="text-xs font-mono tracking-widest text-[#00ff88] uppercase">
            AI SONAR VISION
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white dark:text-white light:text-slate-950">
              TEACHING MACHINES <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-600 dark:from-white dark:via-neutral-300 dark:to-neutral-600 light:from-slate-900 light:via-slate-700 light:to-slate-500">
                TO SEE UNDERWATER.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
            Side-scan sonar acoustic echoes are converted into real-time probability masks, separating synthetic fibers from natural bathymetry.
          </p>
        </div>

        {/* Interactive Sonar Analysis Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: High-Resolution Sonar Image Panel (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-300 bg-neutral-950 dark:bg-neutral-950 light:bg-slate-900 shadow-sm overflow-hidden relative group">
            {/* Sonar Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 backdrop-blur-sm z-20">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-xs font-mono text-neutral-300 tracking-wider">
                  RAW ACOUSTIC WATERFALL · TRANSECT_001.XTF
                </span>
              </div>

              {/* Middle: Colormap Switcher */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
                <Palette className="w-3.5 h-3.5 text-neutral-400 ml-2 mr-1" />
                {(['phosphor', 'amber', 'cyan', 'grayscale'] as const).map((cm) => (
                  <button
                    key={cm}
                    onClick={() => setColormap(cm)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      colormap === cm
                        ? cm === 'phosphor'
                          ? 'bg-[#00ff88] text-black font-bold'
                          : cm === 'amber'
                          ? 'bg-amber-400 text-black font-bold'
                          : cm === 'cyan'
                          ? 'bg-cyan-400 text-black font-bold'
                          : 'bg-white text-black font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cm === 'phosphor' ? 'Phosphor' : cm === 'amber' ? 'Amber' : cm === 'cyan' ? 'Cyan' : 'Mono'}
                  </button>
                ))}
              </div>

              {/* Toggle: [ Original ] vs [ AI Detection ] */}
              <div className="flex items-center p-1 rounded-full bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === 'original'
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Original
                </button>
                <button
                  onClick={() => setViewMode('detection')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                    viewMode === 'detection'
                      ? 'bg-[#00ff88] text-black font-bold shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  AI Detection
                </button>
              </div>
            </div>

            {/* Sonar Canvas Container */}
            <div className="relative flex-1 min-h-[440px] md:min-h-[520px] bg-neutral-950 flex items-center justify-center overflow-hidden">
              {/* Synthetic Sonar Texture Background (Acoustic seafloor sand ripple simulation) */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(2, 6, 23, 0.9) 100%),
                    repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 6px),
                    repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 3px, transparent 3px, transparent 12px)
                  `,
                }}
              />

              {/* Real Sample Sonar Waterfall Image */}
              <img
                src="/samples/sim_00000.png"
                alt="Side-Scan Sonar Imagery"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                style={{
                  filter:
                    colormap === 'phosphor'
                      ? 'contrast(140%) brightness(95%) sepia(100%) hue-rotate(85deg) saturate(320%)'
                      : colormap === 'amber'
                      ? 'contrast(135%) brightness(90%) sepia(100%) hue-rotate(345deg) saturate(380%)'
                      : colormap === 'cyan'
                      ? 'contrast(135%) brightness(95%) sepia(85%) hue-rotate(145deg) saturate(300%)'
                      : 'contrast(125%) brightness(90%) grayscale(100%)',
                  opacity: 0.9,
                }}
              />

              {/* Nadir Water Column Gap (Center line of side-scan sonar) */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-black/90 border-x border-white/5 flex items-center justify-center z-10 pointer-events-none">
                <span className="rotate-90 text-[9px] font-mono text-neutral-600 uppercase tracking-widest whitespace-nowrap">
                  NADIR PATH
                </span>
              </div>

              {/* Animated Sonar Scanline Sweep */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00ff88]/80 to-transparent shadow-[0_0_15px_#00ff88] animate-scanline z-10 pointer-events-none" />

              {/* AI Detection Annotations Overlay (Rendered when in 'detection' mode) */}
              {viewMode === 'detection' && (
                <div className="absolute inset-0 z-15 pointer-events-none">
                  {/* Bounding Box on Active Target */}
                  <div
                    className="absolute border-2 border-[#00ff88] bg-[#00ff88]/15 shadow-[0_0_20px_rgba(0,255,136,0.35)] transition-all duration-300 pointer-events-auto cursor-pointer"
                    style={{
                      left: `${currentTarget.box.x}%`,
                      top: `${currentTarget.box.y}%`,
                      width: `${currentTarget.box.w}%`,
                      height: `${currentTarget.box.h}%`,
                    }}
                  >
                    {/* Bounding Box Corner Brackets */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />

                    {/* Floating HUD Tag on Bounding Box */}
                    <div className="absolute -top-7 left-0 bg-black/90 border border-[#00ff88] px-2 py-0.5 rounded text-[10px] font-mono text-[#00ff88] flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                      <span>{currentTarget.type.toUpperCase()} · {currentTarget.confidence}%</span>
                    </div>

                    {/* Acoustic Shadow Offset Line */}
                    <div className="absolute top-1/2 -right-12 w-12 border-t border-dashed border-[#a3e635]/80 flex items-center justify-end">
                      <span className="text-[9px] font-mono text-[#a3e635] bg-black/80 px-1">SHADOW</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Telemetry Overlay */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 z-20">
                <div className="flex items-center gap-4">
                  <span>SCALE: 0.25 m/px</span>
                  <span>·</span>
                  <span>RANGE: 75 m PER CHANNEL</span>
                  <span>·</span>
                  <span className="text-white">BEARING: 042° TRUE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                  <span className="text-[#00ff88]">AI ENGINE 2.4 ONLINE</span>
                </div>
              </div>
            </div>

            {/* Target Selector Tabs Below Sonar Image */}
            <div className="px-6 py-3 border-t border-white/10 bg-black flex items-center justify-between gap-4 overflow-x-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-400 uppercase mr-2">
                  TRANSECT TARGETS:
                </span>
                {targets.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTargetIndex(idx);
                      setIsVerified(false);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer ${
                      selectedTargetIndex === idx
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    TARGET #{idx + 1}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                {selectedTargetIndex + 1} OF {targets.length} DETECTED
              </span>
            </div>
          </div>

          {/* Right Column: AI Analysis Inspector Card (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950 dark:bg-neutral-950 light:bg-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
            {/* Subtle Neon Top Border */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00ff88] via-[#a3e635] to-[#ec4899]" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10 dark:border-white/10 light:border-slate-200 mb-6">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest block">
                    AI CLASSIFICATION REPORT
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-white dark:text-white light:text-slate-950 mt-1">
                    {currentTarget.id}
                  </h3>
                </div>
                <div className="p-2.5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Target Data Fields */}
              <div className="space-y-4">
                {/* Object Detected */}
                <div>
                  <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-wider">
                    OBJECT DETECTED
                  </div>
                  <div className="text-lg font-bold text-white dark:text-white light:text-slate-900 flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                    <span>{currentTarget.type}</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50">
                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase">CONFIDENCE</div>
                    <div className="text-2xl font-black text-[#00ff88] font-mono mt-1">
                      {currentTarget.confidence}%
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50">
                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase">RISK LEVEL</div>
                    <div className="text-2xl font-black text-[#ec4899] font-mono mt-1 flex items-center gap-1.5">
                      <span>{currentTarget.riskLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Size & Depth */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50">
                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase">ESTIMATED SIZE</div>
                    <div className="text-base font-bold text-neutral-200 dark:text-neutral-200 light:text-slate-800 font-mono mt-1">
                      {currentTarget.estimatedSize}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50">
                    <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase">WATER DEPTH</div>
                    <div className="text-base font-bold text-neutral-200 dark:text-neutral-200 light:text-slate-800 font-mono mt-1">
                      {currentTarget.depth}
                    </div>
                  </div>
                </div>

                {/* Detection Coordinates */}
                <div className="p-4 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50">
                  <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase mb-1">
                    DETECTION COORDINATES (WGS84)
                  </div>
                  <div className="text-sm font-bold text-neutral-100 dark:text-neutral-100 light:text-slate-900 font-mono flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00ff88]" />
                    <span>{currentTarget.lat} , {currentTarget.lon}</span>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="p-4 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">STATUS</div>
                    <div className="text-xs font-mono font-bold tracking-wider mt-0.5">
                      {isVerified ? (
                        <span className="text-[#00ff88] flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> VERIFIED BY HYDROGRAPHER
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> AWAITING VERIFICATION
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-3">
              <button
                onClick={() => setIsVerified(true)}
                className={`w-full py-3 rounded-full text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  isVerified
                    ? 'bg-[#00ff88]/20 border border-[#00ff88] text-[#00ff88]'
                    : 'bg-white hover:bg-[#00ff88] text-black hover:shadow-[0_0_20px_rgba(0,255,136,0.4)]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerified ? 'Detection Verified' : 'Verify Detection'}</span>
              </button>

              <a
                href="#map"
                onClick={() => {
                  if (onViewOnMap) {
                    onViewOnMap(currentTarget.latNum, currentTarget.lonNum);
                  }
                }}
                className="w-full py-3 rounded-full border border-white/30 hover:border-white text-white hover:bg-white/5 text-xs uppercase tracking-wider font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[#00ff88]" />
                <span>View on Map</span>
              </a>

              {onOpenAssistantWithTarget && (
                <button
                  onClick={() =>
                    onOpenAssistantWithTarget(
                      `Please assess ${currentTarget.id} (${currentTarget.type}): depth ${currentTarget.depth}, estimated size ${currentTarget.estimatedSize}, confidence ${currentTarget.confidence}%. What is the recommended salvage protocol?`
                    )
                  }
                  className="w-full py-2.5 rounded-full bg-white/5 border border-white/20 hover:border-[#00ff88]/60 text-white hover:text-[#00ff88] text-xs font-mono tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-[#00ff88]" />
                  <span>Ask AI to Assess This Target</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default SonarAnalysisViewer;
