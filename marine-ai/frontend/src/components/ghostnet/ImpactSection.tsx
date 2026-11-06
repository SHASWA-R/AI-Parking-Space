import React from 'react';
import { ArrowUpRight, Anchor, Recycle, HeartHandshake } from 'lucide-react';
import { NumberTicker } from '../ui/number-ticker';

export const ImpactSection: React.FC = () => {
  const recoveryPillars = [
    {
      icon: Anchor,
      title: 'Autonomous Pinpoint Navigation',
      desc: 'AI geolocations guide autonomous ROVs directly to the target, eliminating expensive multi-day search operations.',
    },
    {
      icon: HeartHandshake,
      title: 'Certified Diver Networks',
      desc: 'Partnered with international technical diving organizations and marine law enforcement for safe benthic extraction.',
    },
    {
      icon: Recycle,
      title: 'Closed-Loop Circularity',
      desc: 'Recovered nylon and polypropylene polymers are decontaminated and transformed into sustainable industrial materials.',
    },
  ];

  return (
    <section id="impact" className="relative py-28 md:py-36 bg-black text-white dark:bg-black dark:text-white light:bg-slate-50 light:text-slate-900 tech-grid-dark dark:tech-grid-dark light:tech-grid-light border-t border-white/10 dark:border-white/10 light:border-slate-200 overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-[#ec4899]" />
          <span className="text-xs font-mono tracking-widest text-[#ec4899] uppercase">
            CONSERVATION IMPACT
          </span>
        </div>

        {/* Section Massive Typography Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-20 md:mb-24">
          <div className="lg:col-span-8">
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white dark:text-white light:text-slate-950">
              EVERY DETECTION <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-600 dark:from-white dark:via-neutral-300 dark:to-neutral-600 light:from-slate-900 light:via-slate-700 light:to-slate-500">
                CAN BECOME
              </span> <br />
              A RECOVERY.
            </h2>
          </div>

          <div className="lg:col-span-4 lg:pt-4 space-y-6">
            <p className="text-lg font-light text-neutral-300 dark:text-neutral-300 light:text-slate-700 leading-relaxed">
              SeaTrace does not remove ghost nets itself. Instead, it connects AI-powered detection with organizations and professionals capable of investigating and recovering underwater debris.
            </p>
            <div className="p-4 border-l-2 border-[#ec4899] bg-white/[0.02] dark:bg-white/[0.02] light:bg-pink-50/70 rounded-r-xl">
              <p className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-700 uppercase tracking-wider leading-relaxed">
                By collapsing survey interpretation time from weeks to seconds, marine response units can act before seasonal monsoons relocate drift gear.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Numbers Display (Prompt Specification) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 dark:bg-white/10 dark:border-white/10 light:bg-slate-200 light:border-slate-200 rounded-3xl overflow-hidden mb-16 shadow-sm">
          <div className="bg-black dark:bg-black light:bg-white p-10 flex flex-col justify-between">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-400 uppercase tracking-widest">
              ACOUSTIC TARGET IDENTIFICATION
            </span>
            <div className="my-8">
              <div className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-white dark:text-white light:text-slate-950">
                <NumberTicker value={358} decimalPlaces={0} delay={0.2} />
              </div>
              <div className="text-base font-bold text-neutral-200 dark:text-neutral-200 light:text-slate-800 mt-2 uppercase tracking-tight">
                Potential Ghost Nets Detected
              </div>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-500 light:text-slate-400 font-mono">
              VERIFIED VIA 5-SIGNATURE XAI ENGINE
            </div>
          </div>

          <div className="bg-black dark:bg-black light:bg-white p-10 flex flex-col justify-between">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-400 uppercase tracking-widest">
              GLOBAL MARITIME JURISDICTIONS
            </span>
            <div className="my-8">
              <div className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-white dark:text-white light:text-slate-950">
                <NumberTicker value={9} decimalPlaces={0} prefix="0" delay={0.3} />
              </div>
              <div className="text-base font-bold text-neutral-200 dark:text-neutral-200 light:text-slate-800 mt-2 uppercase tracking-tight">
                Countries Reached
              </div>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-500 light:text-slate-400 font-mono">
              INDIAN OCEAN · ARABIAN SEA · ATLANTIC
            </div>
          </div>

          <div className="bg-black dark:bg-black light:bg-white p-10 flex flex-col justify-between">
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-400 uppercase tracking-widest">
              COMMUNITY & FIELD ENGAGEMENT
            </span>
            <div className="my-8">
              <div className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-white dark:text-white light:text-slate-950">
                <NumberTicker value={457} decimalPlaces={0} delay={0.4} />
              </div>
              <div className="text-base font-bold text-neutral-200 dark:text-neutral-200 light:text-slate-800 mt-2 uppercase tracking-tight">
                Hours Contributed
              </div>
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-500 light:text-slate-400 font-mono">
              HYDROGRAPHY LABS & DIVE UNITS
            </div>
          </div>
        </div>

        {/* 3 Recovery Ecosystem Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recoveryPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950/60 dark:bg-neutral-950/60 light:bg-white hover:border-white/30 light:hover:border-emerald-300 shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-full border border-white/20 dark:border-white/20 light:border-slate-200 flex items-center justify-center mb-6 text-[#00ff88] group-hover:border-[#00ff88] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-950 mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default ImpactSection;
