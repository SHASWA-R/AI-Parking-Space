import React, { useState, useRef, useEffect } from 'react';
import { Waves, FileText, AlertTriangle, Layers, Download, HelpCircle, Sun, Moon, LayoutDashboard, Compass, ChevronDown, Database } from 'lucide-react';

interface HeaderProps {
  isBackendLive: boolean;
  onOpenLimitations: () => void;
  onOpenReport: () => void;
  onOpenSamples: () => void;
  onOpenShortcuts: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentView: 'portal' | 'console';
  onSelectView: (view: 'portal' | 'console') => void;
}

export const Header: React.FC<HeaderProps> = ({
  isBackendLive,
  onOpenLimitations,
  onOpenReport,
  onOpenSamples,
  onOpenShortcuts,
  isDark,
  onToggleTheme,
  currentView,
  onSelectView
}) => {
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const downloadsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadsRef.current && !downloadsRef.current.contains(event.target as Node)) {
        setIsDownloadsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header className="border-b sticky top-0 z-30 px-4 py-3 backdrop-blur transition-colors duration-200 bg-[#070f1e]/90 border-slate-800 text-slate-100 dark:bg-[#070f1e]/90 dark:border-slate-800 dark:text-slate-100 light:bg-white/90 light:border-slate-200 light:text-slate-900">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-4 md:px-8 lg:px-12 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Branding */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectView('portal')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Waves className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-wide">MARINE AI INTELLIGENCE</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
              Ministry of Earth Sciences · Acoustic Geometric Regularity Engine
            </p>
          </div>
        </div>

        {/* Center View Navigation Pills (Mission Portal vs Tactical Console) */}
        <div className="flex items-center p-1 rounded-xl font-mono text-xs border bg-slate-900/90 border-slate-800 dark:bg-slate-900/90 dark:border-slate-800 light:bg-slate-100 light:border-slate-300">
          <button
            onClick={() => onSelectView('portal')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
              currentView === 'portal'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-white light:text-cyan-700 light:border-cyan-300'
                : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Mission Portal</span>
          </button>

          <button
            onClick={() => onSelectView('console')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
              currentView === 'console'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-300 light:bg-white light:text-emerald-700 light:border-emerald-300'
                : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Tactical Sonar Console</span>
          </button>
        </div>

        {/* Action Controls & Theme Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Connection Status Badge */}
          <div
            className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isBackendLive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
            />
            <span>{isBackendLive ? 'Spring Boot 3 API' : 'Acoustic Simulator'}</span>
          </div>

          {/* Dataset Hub Switcher Button */}
          <button
            onClick={onOpenSamples}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 dark:bg-slate-800 dark:text-slate-200 light:bg-slate-100 light:text-slate-700 light:border-slate-300 light:hover:bg-slate-200"
            title="Open Dataset Explorer & Benchmark Hub (12 Transects)"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dataset Hub (12)</span>
          </button>

          {/* Limitations Button */}
          <button
            onClick={onOpenLimitations}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 light:bg-amber-50 light:text-amber-800 light:border-amber-200"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Nyquist Advisor</span>
          </button>

          {/* Downloads Dropdown Menu */}
          <div className="relative border-l pl-2 border-slate-700 dark:border-slate-700 light:border-slate-300" ref={downloadsRef}>
            <button
              onClick={() => setIsDownloadsOpen(!isDownloadsOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm transition"
              title="Download Official Technical Reports"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Downloads</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isDownloadsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDownloadsOpen && (
              <div className="absolute right-0 mt-2 w-84 rounded-xl shadow-2xl p-3.5 z-50 space-y-3 bg-[#0c182c] border border-cyan-500/40 text-slate-100 dark:bg-[#0c182c] dark:border-cyan-500/40 dark:text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 pb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 dark:text-cyan-400 light:text-cyan-700 font-bold">
                    Official SIH 2026 Documentation
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    PDF & DOCX
                  </span>
                </div>

                {/* Doc 1: Tech Stack Report */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      Technology Stack Report
                    </span>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/80 dark:bg-cyan-950/80 light:bg-cyan-100 light:text-cyan-800 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      SPECS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 leading-snug">
                    React 18, Spring Boot 3, Java 21 LTS, OpenCV C++ bindings, Python physics simulator, and 130ms pipeline benchmarks.
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href="/downloads/Marine_AI_TechStack_Report.pdf"
                      download="Marine_AI_TechStack_Report.pdf"
                      onClick={() => setIsDownloadsOpen(false)}
                      className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold shadow-sm transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF (4.3 KB)</span>
                    </a>
                    <a
                      href="/downloads/Marine_AI_TechStack_Report.docx"
                      download="Marine_AI_TechStack_Report.docx"
                      onClick={() => setIsDownloadsOpen(false)}
                      className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-sm transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Word DOCX</span>
                    </a>
                  </div>
                </div>

                {/* Doc 2: Project Progress Report */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-slate-700/60 dark:border-slate-700/60 light:border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      Project Progress Report
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 dark:bg-emerald-950/80 light:bg-emerald-100 light:text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      MoES SIH
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 leading-snug">
                    Why ghost nets elude sonar, 5 geometric regularity signatures, 0% FP natural seabed validation, and UI system roadmap.
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <a
                      href="/downloads/Marine_AI_Project_Report.pdf"
                      download="Marine_AI_Project_Report.pdf"
                      onClick={() => setIsDownloadsOpen(false)}
                      className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold shadow-sm transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF (6.4 KB)</span>
                    </a>
                    <a
                      href="/downloads/Marine_AI_Project_Report.docx"
                      download="Marine_AI_Project_Report.docx"
                      onClick={() => setIsDownloadsOpen(false)}
                      className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-sm transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Word DOCX</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mission Debrief Modal Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>

          {/* Shortcuts Guide Button */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg border transition bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700 dark:bg-slate-800 dark:border-slate-700 light:bg-slate-100 light:text-slate-600 light:border-slate-300"
            title="Keyboard Shortcuts & Guide (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg border transition bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-300 light:bg-slate-100 light:border-slate-300 light:text-slate-700 hover:scale-105"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
