import React, { useEffect, useState } from 'react';
import { Waves, Radio, ArrowDown, Sparkles } from 'lucide-react';

interface AppEntranceDiveProps {
  onComplete: () => void;
  theme?: 'dark' | 'light';
}

export const AppEntranceDive: React.FC<AppEntranceDiveProps> = ({
  onComplete,
  theme = 'dark',
}) => {
  const [phase, setPhase] = useState<'outer' | 'diving' | 'entering'>('outer');
  const [depthCounter, setDepthCounter] = useState<number>(0);

  // Synthesize realistic acoustic chirp ping
  const playPing = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1020, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.41);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    // Attempt sound ping
    playPing();

    // Phase 1 -> 2: Begin high-speed dive inward
    const timer1 = setTimeout(() => {
      setPhase('diving');
    }, 450);

    // Depth gauge counter simulation
    const interval = setInterval(() => {
      setDepthCounter((prev) => {
        if (prev < 42.5) {
          return Math.min(42.5, +(prev + 4.2).toFixed(1));
        }
        return prev;
      });
    }, 80);

    // Phase 2 -> 3: Entering live dashboard
    const timer2 = setTimeout(() => {
      setPhase('entering');
    }, 1250);

    // Phase 3 -> Complete: Smooth finish
    const timer3 = setTimeout(() => {
      onComplete();
    }, 1550);

    const handleKeyDown = () => {
      onComplete();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer transition-opacity duration-500 ${
        phase === 'entering' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      } ${
        theme === 'dark'
          ? 'bg-[#020617] text-white'
          : 'bg-[#030d1a] text-slate-100'
      }`}
      style={{ perspective: '1200px' }}
      title="Click or press any key to enter immediately"
    >
      {/* Background Volumetric Water Caustics & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#02182b] to-[#010b14] opacity-95" />

      {/* Acoustic Concentric Sonar Pulse Rings Radiating Outward */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div
          className={`w-[450px] h-[450px] rounded-full border border-[#00e5ff]/40 ${
            phase === 'diving' ? 'animate-sonar-ring-1' : 'opacity-30'
          }`}
        />
        <div
          className={`absolute w-[650px] h-[650px] rounded-full border border-[#00ff88]/30 ${
            phase === 'diving' ? 'animate-sonar-ring-2' : 'opacity-20'
          }`}
        />
        <div
          className={`absolute w-[850px] h-[850px] rounded-full border border-[#00e5ff]/20 ${
            phase === 'diving' ? 'animate-sonar-ring-3' : 'opacity-10'
          }`}
        />
      </div>

      {/* 3D Dive Warp Tunnel Effect */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-700 ease-out transform ${
          phase === 'outer'
            ? 'scale-90 opacity-90'
            : phase === 'diving'
            ? 'scale-110 opacity-100'
            : 'scale-125 opacity-0'
        }`}
      >
        {/* Radar Aperture & Sonar Sweep Indicator */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-[#00ff88]/40 flex items-center justify-center bg-[#00ff88]/5 shadow-[0_0_50px_rgba(0,255,136,0.25)]">
            {/* Rotating sonar sweep line */}
            <div className="absolute inset-0 rounded-full animate-radar border-t-2 border-[#00ff88]" />
            
            {/* Inner Ping Core */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00ff88]/20 border border-[#00ff88] flex items-center justify-center shadow-[0_0_20px_#00ff88]">
              <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-[#00ff88] animate-pulse" />
            </div>
          </div>

          {/* Tactical Target Reticle Corners */}
          <div className="absolute -top-3 -left-3 w-4 h-4 border-t-2 border-l-2 border-[#00e5ff]" />
          <div className="absolute -top-3 -right-3 w-4 h-4 border-t-2 border-r-2 border-[#00e5ff]" />
          <div className="absolute -bottom-3 -left-3 w-4 h-4 border-b-2 border-l-2 border-[#00e5ff]" />
          <div className="absolute -bottom-3 -right-3 w-4 h-4 border-b-2 border-r-2 border-[#00e5ff]" />
        </div>

        {/* Tactical Title & Status */}
        <div className="space-y-3 max-w-lg px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-[#00ff88]">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />
            <span>
              {phase === 'outer'
                ? 'INITIALIZING SATELLITE TO SUBSEA LINK'
                : phase === 'diving'
                ? 'DIVING FROM SURFACE TO BENTHIC GRID'
                : 'ENTERING SEATRACE WORKBENCH'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-brand font-black uppercase tracking-tight text-white leading-none">
            SEA<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#00e5ff] to-white">TRACE</span>
          </h1>

          <p className="text-xs sm:text-sm font-mono text-neutral-400 tracking-wider">
            AUTONOMOUS ACOUSTIC VISION FOR MARINE DEBRIS ERADICATION
          </p>
        </div>

        {/* Live Depth Descent Telemetry */}
        <div className="mt-8 flex items-center gap-8 py-3 px-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md font-mono text-xs text-neutral-300">
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase">Target Depth</span>
            <span className="text-base sm:text-lg font-bold text-[#00ff88]">
              -{depthCounter.toFixed(1)}m
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase">Sonar Freq</span>
            <span className="text-base sm:text-lg font-bold text-[#00e5ff]">
              455 / 900 kHz
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div>
            <span className="text-[10px] text-neutral-500 block uppercase">Sensor Grid</span>
            <span className="text-base sm:text-lg font-bold text-amber-400">
              SYNCHRONIZED
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-mono text-neutral-500">
        <span>Click anywhere or press Space to enter immediately</span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#00ff88]" />
      </div>
    </div>
  );
};

export default AppEntranceDive;
