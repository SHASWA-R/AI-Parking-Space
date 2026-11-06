import React from 'react';
import { AlertCircle, Clock, ShieldX, EyeOff, Layers, Sparkles } from 'lucide-react';

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      number: '01',
      icon: Clock,
      title: 'Centuries Underwater',
      desc: 'Synthetic monofilament nylon nets resist biodegradation, remaining intact on the seafloor for up to 600 years.',
      accent: 'text-neutral-400',
    },
    {
      number: '02',
      icon: ShieldX,
      title: 'Perpetual Ghost Fishing',
      desc: 'Abandoned gillnets continue an unbroken cycle of catching marine mammals, turtles, and fish without human harvest.',
      accent: 'text-[#ec4899]',
    },
    {
      number: '03',
      icon: AlertCircle,
      title: 'Benthic Smothering',
      desc: 'Weighted ground lines drag across deep-water corals and sea-grass beds, obliterating irreplaceable benthic habitats.',
      accent: 'text-neutral-400',
    },
    {
      number: '04',
      icon: EyeOff,
      title: 'Zero Optical Visibility',
      desc: 'Beyond 15-20 meters depth, seawater turbidity and darkness blind optical cameras; acoustic sonar is the only viable eye.',
      accent: 'text-[#00ff88]',
    },
    {
      number: '05',
      icon: Layers,
      title: 'Acoustic Data Overload',
      desc: 'A single 6-hour AUV side-scan transect yields over 40 GB of acoustic waterfall imagery riddled with reverberation.',
      accent: 'text-neutral-400',
    },
    {
      number: '06',
      icon: Sparkles,
      title: 'Human Fatigue & Missed Targets',
      desc: 'Human hydrographers face severe visual fatigue; subtle low-contrast net shadows are frequently overlooked.',
      accent: 'text-[#a3e635]',
    },
  ];

  return (
    <section id="problem" className="relative py-28 md:py-36 bg-black text-white dark:bg-black dark:text-white light:bg-slate-50 light:text-slate-900 tech-grid-dark dark:tech-grid-dark light:tech-grid-light overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-[#ec4899]" />
          <span className="text-xs font-mono tracking-widest text-[#ec4899] uppercase">
            THE CRISIS
          </span>
        </div>

        {/* Massive Editorial Heading */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-20 md:mb-28">
          <div className="lg:col-span-8">
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white dark:text-white light:text-slate-950">
              THE OCEAN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 via-neutral-400 to-neutral-600 dark:from-neutral-200 dark:via-neutral-400 dark:to-neutral-600 light:from-slate-900 light:via-slate-700 light:to-slate-500">
                REMEMBERS
              </span> <br />
              WHAT WE LOSE.
            </h2>
          </div>

          <div className="lg:col-span-4 lg:pt-4 space-y-6">
            <p className="text-lg sm:text-xl font-light text-neutral-300 dark:text-neutral-300 light:text-slate-700 leading-relaxed">
              Ghost nets are abandoned, lost, or discarded fishing gear that continues to trap marine life long after it leaves the hands of fishermen.
            </p>
            <div className="p-4 border-l-2 border-[#00ff88] dark:border-[#00ff88] light:border-emerald-600 bg-white/[0.02] dark:bg-white/[0.02] light:bg-emerald-50/70 rounded-r-xl">
              <p className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-700 uppercase tracking-wider leading-relaxed">
                640,000 metric tons of gear enter oceans yearly, accounting for 10% of all marine litter and 70% of floating microplastics.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Problem Cards in Minimal Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 dark:bg-white/10 dark:border-white/10 light:bg-slate-200 light:border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {problems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.number}
                className="bg-black dark:bg-black light:bg-white p-8 sm:p-10 flex flex-col justify-between hover:bg-neutral-950/80 dark:hover:bg-neutral-950/80 light:hover:bg-slate-50 transition-all duration-300 group interactive-card-zoom cursor-pointer hover:z-10"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-400 tracking-wider">
                      {item.number}
                    </span>
                    <Icon className={`w-5 h-5 ${item.accent} transition-transform group-hover:scale-110`} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white dark:text-white light:text-slate-950 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 dark:border-white/5 light:border-slate-100 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-400">
                  <span>STATUS</span>
                  <span className="text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-semibold">CRITICAL IMPACT</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default ProblemSection;
