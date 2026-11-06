import React from 'react';
import { Globe3D } from './Globe3D';
import { Globe2, Shield, Sparkles, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-28 md:py-36 bg-black text-white dark:bg-black dark:text-white light:bg-slate-100 light:text-slate-900 tech-grid-dark dark:tech-grid-dark light:tech-grid-light border-t border-white/10 dark:border-white/10 light:border-slate-200 overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-[#00ff88]" />
          <span className="text-xs font-mono tracking-widest text-[#00ff88] uppercase">
            OUR PURPOSE
          </span>
        </div>

        {/* Massive Editorial Heading */}
        <div className="mb-16 md:mb-24">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white dark:text-white light:text-slate-950 max-w-4xl">
            WE ARE ALL <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#a3e635] to-white dark:to-white light:to-emerald-800">
              IN THIS
            </span> <br />
            TOGETHER.
          </h2>
        </div>

        {/* Narrative Grid with 3D Globe Visual Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: 3D Visual Preview (5 cols) */}
          <div className="lg:col-span-5 relative h-[380px] sm:h-[450px] rounded-3xl border border-white/10 dark:border-white/10 light:border-slate-300 bg-neutral-950 dark:bg-neutral-950 light:bg-slate-900 overflow-hidden flex items-center justify-center shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <Globe3D className="w-full h-full scale-110" />

            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/80 px-4 py-2 rounded-xl border border-white/10">
              <span className="text-white">PLANETARY WATER COVERAGE</span>
              <span className="text-[#00ff88]">71.2% OCEANS</span>
            </div>
          </div>

          {/* Right: Editorial Storytelling (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <p className="text-xl sm:text-2xl font-light text-neutral-200 dark:text-neutral-200 light:text-slate-800 leading-relaxed">
              SeaTrace uses artificial intelligence and side-scan sonar data to identify locations where abandoned fishing gear may be hidden beneath the ocean.
            </p>

            <div className="space-y-4 text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
              <p>
                Every year, hundreds of thousands of commercial fishing nets are cut loose, snagged on bottom obstacles, or discarded. These synthetic traps drift invisibly across underwater canyons, suffocating marine wildlife and devastating fragile coral reef habitats.
              </p>
              <p>
                By training high-precision neural networks on acoustic backscatter and geometric shadow signatures, we enable oceanographers, government ministries, and autonomous robotics to pinpoint submerged debris in minutes rather than months.
              </p>
            </div>

            {/* 3 Core Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-white shadow-sm">
                <Shield className="w-5 h-5 text-[#00ff88] mb-2" />
                <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-950 uppercase tracking-wider">Open Science</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-slate-600 font-light mt-1">
                  Standardized sonar datasets freely shared with global marine research institutions.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-white shadow-sm">
                <Sparkles className="w-5 h-5 text-[#ec4899] mb-2" />
                <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-950 uppercase tracking-wider">Zero False Alarms</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-slate-600 font-light mt-1">
                  5-Signature geometric validation prevents expensive false diver deployments.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-white shadow-sm">
                <Globe2 className="w-5 h-5 text-[#a3e635] mb-2" />
                <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-950 uppercase tracking-wider">Public Good</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 light:text-slate-600 font-light mt-1">
                  Accessible to fishing communities, NGOs, and municipal harbor authorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default AboutSection;
