import React from 'react';
import { Waves, ArrowRight, ShieldCheck, Compass, Radio, Target, FileText, Download, AlertTriangle, Layers, Cpu } from 'lucide-react';

interface MissionPortalProps {
  onLaunchConsole: () => void;
  onOpenLimitations: () => void;
  onOpenReport: () => void;
  onOpenSamples: () => void;
  isDark: boolean;
}

export const MissionPortal: React.FC<MissionPortalProps> = ({
  onLaunchConsole,
  onOpenLimitations,
  onOpenReport,
  onOpenSamples,
  isDark
}) => {
  return (
    <div className="space-y-10 py-6 w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 md:px-8 lg:px-12">
      {/* Hero Section with Acoustic Bathymetry Radar Sphere */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border transition-all duration-300 shadow-2xl bg-gradient-to-b from-[#071326] to-[#040914] border-slate-800 text-slate-100 dark:from-[#071326] dark:to-[#040914] dark:border-slate-800 light:from-white light:to-slate-50 light:border-slate-200 light:text-slate-900">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-sonar-dark opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Mission Directives */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SIH 2026 · MINISTRY OF EARTH SCIENCES (MoES)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              NATIONAL ACOUSTIC MARINE DEBRIS INTELLIGENCE
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-slate-300 dark:text-slate-300 light:text-slate-600 max-w-2xl">
              An advanced, explainable hydrographic intelligence platform designed to detect, classify, and isolate abandoned ghost fishing gear (ALDFG), submerged cables, and hazardous containers from high-frequency side-scan sonar imagery with <strong>0% false alarms on natural reefs</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onLaunchConsole}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] transition transform hover:-translate-y-0.5"
              >
                <span>Launch Tactical Sonar Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenLimitations}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition border bg-slate-800/80 hover:bg-slate-800 text-amber-300 border-amber-500/30 dark:bg-slate-800/80 dark:text-amber-300 dark:border-amber-500/30 light:bg-amber-50 light:text-amber-800 light:border-amber-200 light:hover:bg-amber-100"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Survey Nyquist Advisor</span>
              </button>

              <button
                onClick={onOpenSamples}
                className="flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition border bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 light:bg-white light:text-slate-700 light:border-slate-300 light:hover:bg-slate-100"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Transect Catalog</span>
              </button>
            </div>

            {/* Direct Official Report Downloads */}
            <div className="pt-2 flex items-center space-x-3 text-xs font-mono text-slate-400 dark:text-slate-400 light:text-slate-500">
              <span>Official Debrief:</span>
              <a
                href="/downloads/Marine_AI_Project_Report.pdf"
                download="Marine_AI_Project_Report.pdf"
                className="flex items-center space-x-1 text-red-400 hover:underline font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </a>
              <span>·</span>
              <a
                href="/downloads/Marine_AI_Project_Report.docx"
                download="Marine_AI_Project_Report.docx"
                className="flex items-center space-x-1 text-blue-400 hover:underline font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Word (DOCX)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Original Interactive Acoustic Radar Sphere */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 sm:w-88 sm:h-88 rounded-full flex items-center justify-center p-4 border border-cyan-500/30 bg-[#030914]/80 backdrop-blur shadow-[0_0_50px_rgba(0,229,255,0.15)]">
              {/* Concentric Sonar Range Rings */}
              <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-12 rounded-full border border-cyan-500/25" />
              <div className="absolute inset-20 rounded-full border border-cyan-500/30" />
              <div className="absolute inset-28 rounded-full border border-cyan-500/40" />

              {/* Crosshair Axes */}
              <div className="absolute w-full h-[1px] bg-cyan-500/20" />
              <div className="absolute h-full w-[1px] bg-cyan-500/20" />

              {/* Rotating Radar Sweep Beam */}
              <div className="absolute inset-0 rounded-full animate-radar origin-center pointer-events-none">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-tl-full" />
              </div>

              {/* Simulated Detected Debris Blips */}
              <div className="absolute top-1/4 right-1/4 flex items-center space-x-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/80 text-red-300 border border-red-500/40">
                  D-001 (Ghost Net)
                </span>
              </div>

              <div className="absolute bottom-1/3 left-1/4 flex items-center space-x-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/80 text-amber-300 border border-amber-500/40">
                  D-002 (Cable)
                </span>
              </div>

              {/* Center Towfish Icon */}
              <div className="relative z-10 w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                <Waves className="w-6 h-6 animate-pulse" />
              </div>

              {/* Outer Telemetry Tags */}
              <div className="absolute bottom-2 left-6 font-mono text-[10px] text-cyan-400 bg-black/60 px-2 py-0.5 rounded border border-cyan-900/60">
                FREQ: 900 kHz
              </div>
              <div className="absolute top-2 right-6 font-mono text-[10px] text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-900/60">
                NYQUIST: 2.0 cm/px
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* National Survey Telemetry Metrics (4 Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border transition shadow-sm bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>COASTAL TRANSECTS SURVEYED</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">
            1,480.5 km²
          </div>
          <div className="text-xs text-slate-400 mt-1">High-frequency acoustic coverage</div>
        </div>

        <div className="p-5 rounded-2xl border transition shadow-sm bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>CONFIRMED GHOST NETS</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            382 Units
          </div>
          <div className="text-xs text-slate-400 mt-1">Classified with 2D FFT Periodicity</div>
        </div>

        <div className="p-5 rounded-2xl border transition shadow-sm bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>NATURAL SEABED REJECTIONS</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            1,240 Formations
          </div>
          <div className="text-xs text-slate-400 mt-1">Rocks & coral heads filtered (0% FP)</div>
        </div>

        <div className="p-5 rounded-2xl border transition shadow-sm bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>SALVAGE FLEET READINESS</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black font-mono text-indigo-400">
            98.4%
          </div>
          <div className="text-xs text-slate-400 mt-1">AUV Sagar Nidhi / ROV Units Active</div>
        </div>
      </section>

      {/* Interactive 4-Stage Scientific Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-900">
              Acoustic Scientific Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              From raw sonar backscatter to autonomous salvage directives
            </p>
          </div>
          <button
            onClick={onLaunchConsole}
            className="text-xs font-mono font-bold text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <span>Live Interactive Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl border transition space-y-2.5 bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
            <span className="font-mono text-xs font-bold text-cyan-400 block">STAGE 01</span>
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-800">
              Acoustic Sonar Acquisition
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Towed side-scan sonar sweeps swaths at 2cm/pixel ground resolution. Slant-range waterfall geometry captures intensity and shadows across port and starboard channels.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl border transition space-y-2.5 bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
            <span className="font-mono text-xs font-bold text-emerald-400 block">STAGE 02</span>
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-800">
              CLAHE & Speckle Normalization
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Contrast Limited Adaptive Histogram Equalization suppresses Rayleigh speckle noise while enhancing faint net twines and grazing-angle shadow boundaries.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl border transition space-y-2.5 bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
            <span className="font-mono text-xs font-bold text-indigo-400 block">STAGE 03</span>
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-800">
              5-Signature Regularity Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tests candidates for Periodicity (FFT mesh pitch), Linearity (SVD straightness), Circularity, and Angularity. Natural rocks score high on Irregularity and are rejected.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl border transition space-y-2.5 bg-[#081326] border-slate-800 text-slate-200 dark:bg-[#081326] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-900">
            <span className="font-mono text-xs font-bold text-amber-400 block">STAGE 04</span>
            <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-800">
              Autonomous Salvage Directive
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates official Ministry inspection manifests, gear classification (Trawl, Gillnet), relief height estimation, and prioritizes ROV grapple retrieval operations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
