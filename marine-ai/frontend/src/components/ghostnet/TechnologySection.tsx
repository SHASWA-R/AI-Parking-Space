import { Cpu, Eye, Radio, Globe, Layers, ShieldCheck, Waves } from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const pipeline = [
    {
      title: 'SONAR DATA',
      desc: 'Raw dual-channel 455/900 kHz acoustic waterfall ingestion (.XTF format).',
      metric: '40 MB/min',
    },
    {
      title: 'IMAGE PREPROCESSING',
      desc: 'Slant-range geometric correction, Rayleigh speckle filtering, and TVG equalization.',
      metric: '12ms Latency',
    },
    {
      title: 'AI / COMPUTER VISION',
      desc: 'Multi-scale convolutional feature extractor trained on marine acoustic backscatter.',
      metric: 'YOLOv8 + ResNet',
    },
    {
      title: 'OBJECT DETECTION',
      desc: 'Segmentation of synthetic linear mesh boundaries against sand and coral seafloor.',
      metric: 'Sub-Pixel Mask',
    },
    {
      title: 'CONFIDENCE SCORING',
      desc: '5-signature geometric decomposition validating shadow height and highlight ratios.',
      metric: '94.7% Precision',
    },
    {
      title: 'GEOLOCATION',
      desc: 'Projection of towfish layback and USBL telemetry into WGS84 coordinates.',
      metric: '±0.8m Accuracy',
    },
    {
      title: 'MARINE RESPONSE',
      desc: 'Automated dispatch protocols for autonomous salvage ROVs and recovery divers.',
      metric: 'Live GeoJSON',
    },
  ];

  const technologies = [
    {
      name: 'Computer Vision',
      detail: 'Convolutional feature pyramids optimized for low-contrast acoustic backscatter textures.',
      icon: Eye,
      color: 'text-[#00ff88]',
    },
    {
      name: 'Deep Learning',
      detail: 'Lightweight neural weights deployable on edge-compute Nvidia Jetson AUV pods.',
      icon: Cpu,
      color: 'text-[#a3e635]',
    },
    {
      name: 'Side-Scan Sonar',
      detail: 'High-frequency acoustic beamforming bypassing water turbidity and particulate noise.',
      icon: Waves,
      color: 'text-white',
    },
    {
      name: 'Geospatial Analysis',
      detail: 'Layback tracking, vessel motion compensation, and WGS84 bathymetric anchoring.',
      icon: Globe,
      color: 'text-[#ec4899]',
    },
    {
      name: 'AI Object Detection',
      detail: 'Real-time instance segmentation identifying snagged webbing, ropes, and groundline.',
      icon: Layers,
      color: 'text-[#8b5cf6]',
    },
    {
      name: 'Interactive Mapping',
      detail: 'Real-time WebGL vector tiles displaying planetary debris hot zones and mission paths.',
      icon: ShieldCheck,
      color: 'text-[#00ff88]',
    },
  ];

  return (
    <section id="technology" className="relative py-28 md:py-36 bg-black text-white dark:bg-black dark:text-white light:bg-slate-50 light:text-slate-900 tech-grid-dark dark:tech-grid-dark light:tech-grid-light border-t border-white/10 dark:border-white/10 light:border-slate-200 overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        {/* Section Tag */}
        <div className="flex items-center gap-3 mb-8">
          <span className="w-8 h-[1px] bg-[#00ff88]" />
          <span className="text-xs font-mono tracking-widest text-[#00ff88] uppercase">
            COMPUTATIONAL STACK
          </span>
        </div>

        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-24">
          <div>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-white dark:text-white light:text-slate-950">
              TECHNOLOGY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-300 to-neutral-600 dark:from-white dark:via-neutral-300 dark:to-neutral-600 light:from-slate-900 light:via-slate-700 light:to-slate-500">
                ARCHITECTURE.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
            An end-to-end autonomous pipeline engineered to turn noisy acoustic pings into verified recovery coordinates with microsecond precision.
          </p>
        </div>

        {/* Technical Architecture Pipeline Diagram (Prompt Section 14) */}
        <div className="mb-20">
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest mb-6">
            DETERMINISTIC PROCESSING PIPELINE
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            {pipeline.map((stage, idx) => (
              <div
                key={stage.title}
                className="relative p-5 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-white flex flex-col justify-between group hover:border-[#00ff88] light:hover:border-emerald-500 shadow-sm transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-500 light:text-slate-400 mb-3">
                    <span className="text-[10px] font-mono">0{idx + 1}</span>
                    {idx < pipeline.length - 1 && (
                      <span className="hidden lg:inline text-neutral-600 dark:text-neutral-600 light:text-slate-400 font-mono text-xs">→</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-wider text-white dark:text-white light:text-slate-950 group-hover:text-[#00ff88] light:group-hover:text-emerald-600 transition-colors mb-2">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 dark:border-white/5 light:border-slate-100 text-[9px] font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600 font-bold tracking-widest">
                  {stage.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Core Technology Capabilities */}
        <div>
          <div className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase tracking-widest mb-6">
            CORE CAPABILITIES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 dark:bg-white/10 dark:border-white/10 light:bg-slate-200 light:border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {technologies.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.name}
                  className="bg-black dark:bg-black light:bg-white p-8 flex flex-col justify-between hover:bg-neutral-950 dark:hover:bg-neutral-950 light:hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white dark:text-white light:text-slate-950 group-hover:text-[#00ff88] light:group-hover:text-emerald-600 transition-colors">
                        {t.name}
                      </h3>
                      <Icon className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
                      {t.detail}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 dark:border-white/5 light:border-slate-100 flex justify-between text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-400">
                    <span>STATUS</span>
                    <span className="text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600 font-bold">DEPLOYED</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
export default TechnologySection;
