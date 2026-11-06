import React, { useState } from 'react';
import { Waves, UploadCloud, Cpu, CheckCircle2, MapPin, Anchor } from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(2); // Default to AI ANALYSIS active

  const steps = [
    {
      number: '01',
      title: 'COLLECT',
      subtitle: 'Side-Scan Sonar Acquisition',
      desc: 'Autonomous Underwater Vehicles (AUVs) and towfish sweep the seabed with high-frequency dual-channel acoustic beams.',
      icon: Waves,
      tag: '455/900 kHz Hydrography',
    },
    {
      number: '02',
      title: 'UPLOAD',
      subtitle: 'Data Ingestion Pipeline',
      desc: 'Marine researchers and survey teams upload eXtended Triton Format (.XTF) or raw acoustic waterfall data directly to the engine.',
      icon: UploadCloud,
      tag: 'Multi-Beam & XTF Stream',
    },
    {
      number: '03',
      title: 'AI ANALYSIS',
      subtitle: 'Acoustic Deep Learning',
      desc: 'Deep neural networks inspect acoustic backscatter, distinguish sediment texture, and isolate characteristic net lattice reflections.',
      icon: Cpu,
      tag: 'YOLOv8 + ResNet Backscatter',
    },
    {
      number: '04',
      title: 'VALIDATE',
      subtitle: 'Geometric Signature Filter',
      desc: 'Detected regions are validated against 5 acoustic signatures (linear highlights, acoustic shadows, snags, and elongation ratios).',
      icon: CheckCircle2,
      tag: '5-Factor Geometric Scoring',
    },
    {
      number: '05',
      title: 'MAP',
      subtitle: 'Geographic Geotagging',
      desc: 'Confirmed acoustic targets are correlated with GPS towfish layback telemetry and projected into sub-meter WGS84 coordinates.',
      icon: MapPin,
      tag: 'Sub-Meter Lat / Lon Pinpoint',
    },
    {
      number: '06',
      title: 'RECOVER',
      subtitle: 'Salvage Intervention',
      desc: 'Certified recovery divers, ROVs, and ocean cleanup partners deploy directly to the site to hoist and responsibly recycle the gear.',
      icon: Anchor,
      tag: 'Closed-Loop Material Salvage',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-28 md:py-36 bg-black text-white dark:bg-black dark:text-white light:bg-slate-100 light:text-slate-900 tech-grid-dark dark:tech-grid-dark light:tech-grid-light border-t border-white/10 dark:border-white/10 light:border-slate-200 transition-colors duration-300">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-[#00ff88]" />
          <span className="text-xs font-mono tracking-widest text-[#00ff88] uppercase">
            OPERATIONAL ARCHITECTURE
          </span>
        </div>

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white dark:text-white light:text-slate-950">
              FROM SONAR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#a3e635] to-white dark:to-white light:to-emerald-800">
                TO DISCOVERY.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
            A continuous, deterministic 6-step loop linking hydrographic sensor physics to autonomous AI detection and on-site marine salvage.
          </p>
        </div>

        {/* 6-Step Interactive Line Process */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[300px] ${
                  isActive
                    ? 'border-[#00ff88] bg-white/[0.04] dark:bg-white/[0.04] light:bg-emerald-50/50 light:border-emerald-500 shadow-[0_0_30px_rgba(0,255,136,0.12)] light:shadow-md'
                    : 'border-white/10 bg-black/60 dark:border-white/10 dark:bg-black/60 light:border-slate-200 light:bg-white hover:border-white/30 dark:hover:border-white/30 light:hover:border-emerald-300 light:shadow-sm'
                }`}
              >
                {/* Glowing Top Indicator Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl transition-all ${
                    isActive ? 'bg-[#00ff88]' : 'bg-transparent'
                  }`}
                />

                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`text-2xl font-black font-mono tracking-tight ${
                        isActive ? 'text-[#00ff88]' : 'text-neutral-500 dark:text-neutral-500 light:text-slate-400'
                      }`}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`p-3 rounded-full border transition-colors ${
                        isActive
                          ? 'border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]'
                          : 'border-white/10 dark:border-white/10 light:border-slate-200 text-neutral-400 dark:text-neutral-400 light:text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold tracking-tight text-white dark:text-white light:text-slate-950 mb-1">
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-wider mb-4">
                    {step.subtitle}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-300 dark:text-neutral-300 light:text-slate-600 font-light leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Footer Tag */}
                <div className="mt-8 pt-4 border-t border-white/10 dark:border-white/10 light:border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider text-neutral-500 dark:text-neutral-500 light:text-slate-400 uppercase">
                    SPECIFICATION
                  </span>
                  <span
                    className={`text-[11px] font-mono tracking-wider uppercase ${
                      isActive ? 'text-[#00ff88]' : 'text-neutral-400 dark:text-neutral-400 light:text-slate-500'
                    }`}
                  >
                    {step.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Connection Flow Bar */}
        <div className="hidden lg:flex items-center justify-between mt-12 py-4 px-8 rounded-full border border-white/10 bg-black/80">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
            SYSTEM PIPELINE
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span>RAW SONAR</span>
            <span className="text-[#00ff88]">→</span>
            <span>FILTERING</span>
            <span className="text-[#00ff88]">→</span>
            <span className="text-[#00ff88] font-bold">DEEP LEARNING</span>
            <span className="text-[#00ff88]">→</span>
            <span>GEOLOCATION</span>
            <span className="text-[#00ff88]">→</span>
            <span>DIVER RECOVERY</span>
          </div>
          <span className="text-xs font-mono text-[#00ff88] tracking-widest">
            100% DETERMINISTIC
          </span>
        </div>
      </div>
    </section>
  );
};
export default WorkflowSection;
