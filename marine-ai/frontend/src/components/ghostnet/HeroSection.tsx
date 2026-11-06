import React, { useState } from 'react';
import { RealisticOceanGlobe3D } from './RealisticOceanGlobe3D';
import { ArrowDown, BookOpen, Eye, Bot, Volume2, Waves, Sparkles } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { NumberTicker } from '../ui/number-ticker';

interface HeroSectionProps {
  theme?: 'dark' | 'light';
  onOpenAssistant?: () => void;
  onOpenUpload?: () => void;
  onSwitchToConsole?: () => void;
  onReplayDive?: () => void;
  entranceTrigger?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  theme = 'dark',
  onOpenAssistant,
  onOpenUpload,
  onSwitchToConsole,
  onReplayDive,
  entranceTrigger,
}) => {
  const [isPlayingPing, setIsPlayingPing] = useState(false);

  // Play realistic acoustic sonar ping chirp using Web Audio API
  const playSonarChirp = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
      setIsPlayingPing(true);
      setTimeout(() => setIsPlayingPing(false), 400);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  return (
    <section
      key={entranceTrigger}
      className={`relative min-h-screen w-full flex flex-col justify-between pt-24 pb-8 px-6 sm:px-10 lg:px-14 overflow-hidden select-none transition-colors duration-300 animate-entrance-zoom ${
        theme === 'dark'
          ? 'bg-[#020617] text-white ocean-bathymetry-dark'
          : 'bg-[#f8fafc] text-slate-900 ocean-bathymetry-light'
      }`}
    >
      {/* Oceanic Soundwave & Subsea Bathymetric Atmosphere (NO graph grid, NO stars) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35 dark:opacity-30 light:opacity-40">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Subsea Light Rays / Volumetric Ocean Caustics */}
            <linearGradient id="ocean-caustic-cyan" x1="0%" y1="0%" x2="40%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.08" />
              <stop offset="60%" stopColor="#00e5ff" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ocean-caustic-emerald" x1="0%" y1="0%" x2="30%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.06" />
              <stop offset="50%" stopColor="#00ff88" stopOpacity="0.015" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subsea Sunlight / Light Shafts filtering through deep ocean */}
          <polygon points="180,0 340,0 480,900 120,900" fill="url(#ocean-caustic-cyan)" />
          <polygon points="680,0 860,0 1080,900 600,900" fill="url(#ocean-caustic-emerald)" />
          <polygon points="1050,0 1200,0 1400,900 950,900" fill="url(#ocean-caustic-cyan)" />

          {/* Acoustic Sonar Pulse Rings Radiating from Subsea Scan Source */}
          <circle cx="72%" cy="45%" r="160" stroke="#00e5ff" strokeWidth="1" strokeDasharray="6 8" opacity="0.3" />
          <circle cx="72%" cy="45%" r="280" stroke="#00ff88" strokeWidth="1.2" opacity="0.22" />
          <circle cx="72%" cy="45%" r="420" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 12" opacity="0.18" />
          <circle cx="72%" cy="45%" r="580" stroke="#00ff88" strokeWidth="0.8" opacity="0.12" />
          <circle cx="72%" cy="45%" r="760" stroke="#00e5ff" strokeWidth="0.8" strokeDasharray="8 16" opacity="0.08" />

          {/* Fluid Nautical Depth Contour Waves & Pelagic Currents */}
          <path
            d="M-100,210 C280,140 580,310 980,190 C1280,110 1480,260 1620,230"
            stroke="#00e5ff"
            strokeWidth="1.5"
            opacity="0.35"
          />
          <path
            d="M-100,390 C220,330 520,470 920,360 C1220,270 1420,430 1620,400"
            stroke="#00ff88"
            strokeWidth="1.5"
            strokeDasharray="8 10"
            opacity="0.28"
          />
          <path
            d="M-100,570 C360,510 710,650 1110,530 C1360,450 1510,590 1620,560"
            stroke="#00e5ff"
            strokeWidth="1.2"
            opacity="0.22"
          />
          <path
            d="M-100,750 C260,690 610,830 1060,720 C1310,630 1510,770 1620,740"
            stroke="#00ff88"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            opacity="0.18"
          />
        </svg>
      </div>

      {/* Deep Oceanic Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/5 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00e5ff]/6 dark:bg-[#00e5ff]/6 light:bg-sky-400/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-[#00ff88]/5 dark:bg-[#00ff88]/5 light:bg-emerald-400/8 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Telemetry Strip (Full-Width Desktop) */}
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto flex flex-wrap justify-between items-center py-2 text-xs tracking-normal text-neutral-400 dark:text-neutral-400 light:text-slate-500 border-b border-white/10 dark:border-white/10 light:border-slate-200 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-neutral-200 dark:text-neutral-200 light:text-slate-800 font-semibold">
            SeaTrace · Marine Acoustic Intelligence Online
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-neutral-400 dark:text-neutral-400 light:text-slate-600 text-xs">
          <span>Lakshadweep Basin: 10.12° N, 76.56° E</span>
          <span>·</span>
          <span>Depth: -42.5m</span>
          <span>·</span>
          <span className="text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 font-semibold">Sensor Grid Active</span>
        </div>
      </div>

      {/* Split-Screen Hero: Expanded Desktop 50/50 Layout */}
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto my-auto py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-center">
        
        {/* Left Column: Brand, Mission, Plain-English Story & Actions */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-6 text-left z-20 animate-entrance-left">
          
          {/* Mission Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 dark:bg-white/5 dark:border-white/15 dark:text-neutral-300 light:bg-white light:border-slate-300 light:text-slate-700 light:shadow-sm text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
            <span>Ministry of Earth Sciences · Autonomous Marine AI</span>
          </div>

          {/* Main Title: Iconic 2-Line Stacked Brand Title from User Screenshot */}
          <div>
            <h1 className="text-6xl sm:text-7xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-brand font-black uppercase tracking-tight text-white dark:text-white light:text-slate-950 leading-[0.88]">
              SEA<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-white dark:to-white light:to-slate-800">
                TRACE
              </span>
            </h1>
            <div className="text-xs sm:text-sm font-mono tracking-widest text-[#00e5ff] dark:text-[#00e5ff] light:text-sky-600 uppercase mt-3 flex items-center gap-2 font-semibold min-h-[1.75rem]">
              <Waves className="w-4 h-4 text-[#00ff88] flex-shrink-0" />
              <TypewriterText
                words={[
                  'AUTONOMOUS ACOUSTIC VISION FOR MULTI-CLASS MARINE DEBRIS',
                  'SIDE-SCAN SONAR DEBRIS & ANOMALY DETECTION (455/900 kHz)',
                  'ACOUSTIC SHADOW ANALYSIS & 3D BENTHIC RELIEF PROFILING',
                  '0% FALSE ALARM REJECTION ON NATURAL SEABED REEFS & ROCKS',
                  'SUB-METER WGS84 GPS TOWFISH GEOLOCATION FOR SALVAGE',
                ]}
                typingSpeed={48}
                deletingSpeed={24}
                pauseDuration={2300}
                cursorClassName="text-[#00ff88]"
              />
            </div>
          </div>

          {/* Clear Subtitle & Plain-English Explanation */}
          <div className="space-y-3.5 max-w-xl">
            <p className="text-lg sm:text-xl font-medium text-neutral-100 dark:text-neutral-100 light:text-slate-800 leading-snug">
              Turning underwater sound waves into precise GPS coordinates to detect and locate marine debris, helping protect our oceans.
            </p>
            <p className="text-sm text-neutral-300 dark:text-neutral-300 light:text-slate-600 font-normal leading-relaxed">
              Our oceans hide millions of debris objects beneath the surface, where darkness and poor visibility make detection extremely difficult. SeaTrace uses <strong className="font-semibold text-white dark:text-white light:text-slate-900">AI-powered Side-Scan Sonar</strong> to see through the darkness, automatically detect underwater debris, and pinpoint its location for faster response.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#learn"
              className="px-6 py-3 rounded-full font-semibold text-xs transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,136,0.35)] flex items-center gap-2 shadow-sm bg-[#00ff88] text-black hover:bg-[#00ff88]/90 font-bold cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Learn in 30 Seconds</span>
            </a>

            <a
              href="#map"
              className="px-6 py-3 rounded-full border font-semibold text-xs transition-all duration-200 flex items-center gap-2 shadow-sm dark:border-white/20 dark:hover:border-white dark:text-white dark:hover:bg-white/5 light:border-slate-300 light:text-slate-900 light:bg-white light:hover:border-slate-900 light:hover:bg-slate-100 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#00e5ff] dark:text-[#00e5ff] light:text-sky-600" />
              <span>Dive into Map</span>
            </a>

            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="px-5 py-3 rounded-full border font-semibold text-xs transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-2 dark:bg-[#00ff88]/10 dark:border-[#00ff88]/40 dark:text-[#00ff88] dark:hover:bg-[#00ff88] dark:hover:text-black light:bg-emerald-50 light:border-emerald-400 light:text-emerald-700 light:hover:bg-emerald-600 light:hover:text-white shadow-sm"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </button>
            )}

            {/* Optional Sonar Ping Audio Synthesizer */}
            <button
              onClick={playSonarChirp}
              className={`p-3 rounded-full border transition-all duration-200 cursor-pointer ${
                isPlayingPing
                  ? 'border-[#00ff88] bg-[#00ff88]/20 text-[#00ff88] shadow-[0_0_15px_#00ff88]'
                  : 'dark:border-white/20 dark:hover:border-white dark:text-neutral-400 dark:hover:text-white light:border-slate-300 light:text-slate-700 light:bg-white light:hover:bg-slate-100'
              }`}
              title="Click to hear acoustic sonar ping chime"
              aria-label="Play Sonar Chirp"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Replay Outside-to-Inside Entrance Dive */}
            {onReplayDive && (
              <button
                onClick={onReplayDive}
                className="p-3 rounded-full border transition-all duration-200 cursor-pointer hover:scale-105 dark:border-white/20 dark:hover:border-[#00e5ff] dark:text-[#00e5ff] dark:bg-[#00e5ff]/5 dark:hover:bg-[#00e5ff]/15 light:border-slate-300 light:text-sky-600 light:bg-sky-50 light:hover:bg-sky-100"
                title="Replay outside-to-inside entrance dive animation"
                aria-label="Replay Entrance Dive"
              >
                <Sparkles className="w-4 h-4 text-[#00e5ff]" />
              </button>
            )}
          </div>

          {/* 3 Quick Metric Badges (Multi-Class Marine Debris: Option 2) */}
          <div className="grid grid-cols-3 gap-3 pt-4 max-w-xl border-t border-white/10 dark:border-white/10 light:border-slate-200 animate-entrance-bottom">
            <div className="p-3.5 rounded-xl bg-white/[0.03] dark:bg-white/[0.03] light:bg-white light:border light:border-slate-200 light:shadow-sm interactive-card-zoom cursor-pointer group">
              <div className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-950 font-display group-hover:text-[#00ff88] transition-colors">
                <NumberTicker value={4} decimalPlaces={0} delay={0.2} suffix=" Classes" />
              </div>
              <div className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-500 font-medium mt-0.5">Debris Categories</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-500 light:text-slate-400 font-mono mt-0.5 truncate" title="Nets · Cables/Pipes · Drums · Cargo Crates">
                Nets · Cables · Drums · Crates
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] dark:bg-white/[0.03] light:bg-white light:border light:border-slate-200 light:shadow-sm interactive-card-zoom cursor-pointer group">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 font-display">
                <NumberTicker value={94.7} decimalPlaces={1} suffix="%" delay={0.3} />
              </div>
              <div className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-500 font-medium mt-0.5">Acoustic Precision</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-500 light:text-slate-400 font-mono mt-0.5 truncate" title="Dual-Frequency 455/900 kHz Sonar">
                455 / 900 kHz Sonar
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.03] dark:bg-white/[0.03] light:bg-white light:border light:border-slate-200 light:shadow-sm interactive-card-zoom cursor-pointer group">
              <div className="text-2xl sm:text-3xl font-extrabold text-white dark:text-white light:text-slate-950 font-display group-hover:text-[#00e5ff] transition-colors">
                <NumberTicker value={0.8} decimalPlaces={1} prefix="±" suffix="m" delay={0.4} />
              </div>
              <div className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-500 font-medium mt-0.5">WGS84 Geolocation</div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-500 light:text-slate-400 font-mono mt-0.5 truncate" title="Sub-Meter Towfish Layback Precision">
                Sub-Meter Pinpoint
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Realistic Ocean Globe (Expanded for Desktop) */}
        <div className="lg:col-span-6 xl:col-span-7 flex items-center justify-center relative z-20">
          <div className="w-full max-w-[650px] xl:max-w-[760px] 2xl:max-w-[840px]">
            <RealisticOceanGlobe3D theme={theme} entranceTrigger={entranceTrigger} />
          </div>
        </div>

      </div>

      {/* Bottom Indicator */}
      <div className="w-full flex justify-center py-2 text-neutral-400 dark:text-neutral-400 light:text-slate-500 hover:text-neutral-200 dark:hover:text-neutral-200 light:hover:text-slate-800 transition-colors z-20">
        <a href="#learn" className="flex items-center gap-2 text-xs font-medium">
          <span>Explore how AI detects ghost nets 101</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
