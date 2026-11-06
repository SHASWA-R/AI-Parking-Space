import React from 'react';
import { ArrowUp, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black text-white dark:bg-black dark:text-white light:bg-slate-50 light:text-slate-900 tech-grid-dark border-t border-white/10 dark:border-white/10 light:border-slate-200 pt-20 pb-12 overflow-hidden select-none transition-colors duration-200">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Massive Brand Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-16 border-b border-white/10 dark:border-white/10 light:border-slate-200 gap-8">
          <div>
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tighter leading-none text-white dark:text-white light:text-slate-900">
              SEA<span className="text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600">TRACE</span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light mt-4 max-w-md">
              Tracing the invisible beneath the sea · Autonomous Sonar Intelligence to Protect Marine Life.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="self-start lg:self-end flex items-center gap-3 p-4 rounded-full border border-white/20 hover:border-white text-xs font-mono uppercase tracking-widest text-neutral-300 hover:text-white dark:border-white/20 dark:hover:border-white dark:text-neutral-300 dark:hover:text-white light:border-slate-300 light:text-slate-700 light:hover:border-slate-900 light:hover:text-slate-900 transition-colors cursor-pointer"
          >
            <span>BACK TO SURFACE</span>
            <ArrowUp className="w-4 h-4 text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600" />
          </button>
        </div>

        {/* Links & Information Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-8 py-12 border-b border-white/10 dark:border-white/10 light:border-slate-200 text-xs font-mono">
          <div>
            <span className="text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest block mb-4">EXPLORE</span>
            <ul className="space-y-2.5 text-neutral-400 dark:text-neutral-400 light:text-slate-600">
              <li><a href="#learn" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">Learn 101</a></li>
              <li><a href="#how-it-works" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">How It Works</a></li>
              <li><a href="#technology" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">Interactive Sonar</a></li>
              <li><a href="#impact" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">Impact</a></li>
              <li><a href="#map" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">Global Map</a></li>
            </ul>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest block mb-4">PLATFORM</span>
            <ul className="space-y-2.5 text-neutral-400 dark:text-neutral-400 light:text-slate-600">
              <li><a href="#technology" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">Side-Scan Sonar</a></li>
              <li><a href="#technology" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">XTF Ingestion</a></li>
              <li><a href="#technology" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">XAI Verification</a></li>
              <li><a href="#technology" className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors">WGS84 Coordinates</a></li>
            </ul>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest block mb-4">COLLABORATION</span>
            <ul className="space-y-2.5 text-neutral-400 dark:text-neutral-400 light:text-slate-600">
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Hydrographic Labs</span></li>
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Recovery Divers</span></li>
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Autonomous AUVs</span></li>
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Polymer Recyclers</span></li>
            </ul>
          </div>

          <div>
            <span className="text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest block mb-4">LEGAL</span>
            <ul className="space-y-2.5 text-neutral-400 dark:text-neutral-400 light:text-slate-600">
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Open Access License</span></li>
              <li><span className="hover:text-white dark:hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer">Security Protocol</span></li>
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-2 space-y-3">
            <span className="text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest block mb-2">GOVERNMENT OF INDIA INITIATIVE</span>
            <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
              Smart India Hackathon (SIH 2026) · Ministry of Earth Sciences (MoES). Automated Marine Debris & Ghost Net Detection from Side-Scan Sonar Imagery.
            </p>
            {/* Quick Download Badges */}
            <div className="pt-1 flex flex-wrap gap-2">
              <a
                href="/downloads/Marine_AI_TechStack_Report.pdf"
                download="Marine_AI_TechStack_Report.pdf"
                className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold transition"
              >
                Tech Stack (PDF)
              </a>
              <a
                href="/downloads/Marine_AI_TechStack_Report.docx"
                download="Marine_AI_TechStack_Report.docx"
                className="px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] font-bold transition"
              >
                Tech Stack (DOCX)
              </a>
              <a
                href="/downloads/Marine_AI_Project_Report.pdf"
                download="Marine_AI_Project_Report.pdf"
                className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white text-[10px] font-bold transition"
              >
                Project Report (PDF)
              </a>
              <a
                href="/downloads/Marine_AI_Project_Report.docx"
                download="Marine_AI_Project_Report.docx"
                className="px-2.5 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] font-bold transition"
              >
                Project Report (DOCX)
              </a>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600 pt-1 font-mono font-semibold">
              <Radio className="w-3.5 h-3.5" />
              <span>SENSOR HYDROGRAPHY TELEMETRY ONLINE</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 gap-4">
          <div>
            © 2026 SeaTrace · Autonomous Ocean Sonar Intelligence · SIH 2026. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>ACCELERATING SDG 14: LIFE BELOW WATER</span>
            <span>·</span>
            <span className="text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600 font-bold">STATUS: OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
