import React, { useState } from 'react';
import { 
  HelpCircle, Eye, EyeOff, Sparkles, CheckCircle2, XCircle, 
  Waves, AlertTriangle, ArrowRight, BookOpen, Layers, Shield 
} from 'lucide-react';

interface BeginnerEducationSectionProps {
  theme?: 'dark' | 'light';
  onOpenAssistantWithTopic?: (topic: string) => void;
  onTryInteractiveSonar?: () => void;
}

export const BeginnerEducationSection: React.FC<BeginnerEducationSectionProps> = ({
  theme = 'dark',
}) => {
  // Slider state for Human Eye vs AI Sonar Vision (0% = Human Eye, 100% = AI Sonar)
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Mini-Game Quiz State
  const [selectedQuizOption, setSelectedQuizOption] = useState<'rock' | 'net' | 'sand' | null>(null);

  // Jargon popup state
  const [activeJargon, setActiveJargon] = useState<string | null>(null);

  const jargonList = [
    {
      term: 'Side-Scan Sonar',
      simple: 'Underwater Echolocation',
      analogy: 'Think of how bats or dolphins navigate in the dark by squeaking and listening to the echo. A towfish sends high-frequency sound waves to the sea floor and records how strongly they bounce back.',
    },
    {
      term: 'Acoustic Shadow',
      simple: 'Sound-Blocking Silhouette',
      analogy: 'When sound waves hit a tall object (like a net standing off the seabed), the area directly behind it receives no sound echo. This creates a black shadow. The longer the shadow, the taller the net!',
    },
    {
      term: 'Ghost Net',
      simple: 'Abandoned Nylon Trap',
      analogy: 'Commercial fishing nets made of synthetic plastic that were torn, lost, or cut free. They do not rot, and drift for centuries continuously trapping turtles and fish with nobody to ever harvest them.',
    },
    {
      term: 'XTF File',
      simple: 'Digital Sonar Recording',
      analogy: 'eXtended Triton Format (.XTF) is the standard raw recording format for side-scan sonar, combining the sound wave echoes with GPS ship coordinates and water depth.',
    },
    {
      term: 'Benthic Habitat',
      simple: 'Seafloor Ecosystem',
      analogy: 'The lowest ecological zone in the ocean, including coral reefs, sea-grass meadows, and underwater sediment beds where crabs, rays, and bottom fish live.',
    },
  ];

  return (
    <section
      id="learn"
      className={`relative py-24 md:py-32 overflow-hidden border-t select-none transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-black text-white tech-grid-dark border-white/10'
          : 'bg-[#f8fafc] text-slate-900 tech-grid-light border-slate-200'
      }`}
    >
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-8 h-[1px] bg-[#00ff88]" />
          <span className="text-xs font-mono tracking-widest text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase font-bold">
            BEGINNER KNOWLEDGE HUB · MARINE DEBRIS & ANOMALIES 101
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase tracking-tighter leading-none text-white dark:text-white light:text-slate-950">
              WHAT LIES BENEATH? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] via-[#a3e635] to-white dark:to-white light:to-slate-800">
                AND HOW CAN AI REVEAL IT?
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm sm:text-base text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
            The ocean floor hides objects that conventional vision cannot easily see. Discover how SeaTrace combines Side-Scan Sonar and AI to uncover underwater debris, analyze hidden anomalies, and turn acoustic data into actionable intelligence.
          </p>
        </div>

        {/* ========================================================
            PART 1: 3-STEP STORY CARDS (JARGON-FREE)
           ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-white light:shadow-sm flex flex-col justify-between group hover:border-amber-400/50 transition-all duration-300 interactive-card-zoom cursor-pointer">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                01
              </div>
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-950 mb-2">
                THE HIDDEN OCEAN
              </h3>
              <p className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-4 font-semibold">
                WHAT LIES BENEATH
              </p>
              <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
                From abandoned fishing gear and plastic waste to tires, containers, metal objects, and lost equipment, underwater debris can accumulate across vast areas of the seafloor—creating environmental and operational hazards that are difficult to observe from the surface.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 dark:border-white/5 light:border-slate-100 text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500">
              HIDDEN OBJECTS • VAST SEAFLOOR • COMPLEX ENVIRONMENTS
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-white light:shadow-sm flex flex-col justify-between group hover:border-[#ec4899]/50 transition-all duration-300 interactive-card-zoom cursor-pointer">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#ec4899]/10 border border-[#ec4899]/30 flex items-center justify-center text-[#ec4899] mb-6 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                02
              </div>
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-950 mb-2">
                THE DETECTION CHALLENGE
              </h3>
              <p className="text-xs font-mono text-[#ec4899] uppercase tracking-wider mb-4 font-semibold">
                WHY FINDING IT IS DIFFICULT
              </p>
              <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
                Deep water, darkness, turbidity, and massive survey areas make conventional underwater inspection challenging. Manually examining acoustic imagery takes time and can make it difficult to consistently identify every suspicious object or anomaly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 dark:border-white/5 light:border-slate-100 text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500">
              DARKNESS • TURBIDITY • SCALE • MANUAL EFFORT
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950/80 dark:bg-neutral-950/80 light:bg-white light:shadow-sm flex flex-col justify-between group hover:border-[#00ff88]/50 transition-all duration-300 interactive-card-zoom cursor-pointer">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] mb-6 font-mono font-bold text-lg group-hover:scale-110 transition-transform">
                03
              </div>
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-950 mb-2">
                ACOUSTIC INTELLIGENCE
              </h3>
              <p className="text-xs font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase tracking-wider mb-4 font-semibold">
                HOW SEATRACE REVEALS THE UNKNOWN
              </p>
              <p className="text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light leading-relaxed">
                Side-Scan Sonar converts underwater sound echoes into detailed acoustic imagery. SeaTrace uses AI-powered computer vision to analyze these images, identify potential marine debris and anomalies, evaluate their significance, and map their locations for investigation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 dark:border-white/5 light:border-slate-100 text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500">
              DETECT • ANALYZE • ASSESS • GEOLOCATE
            </div>
          </div>
        </div>

        {/* ========================================================
            PART 2: INTERACTIVE VISION COMPARISON SLIDER
           ======================================================== */}
        <div className="rounded-3xl border border-white/15 dark:border-white/15 light:border-slate-200 bg-neutral-950 dark:bg-neutral-950 light:bg-white light:shadow-sm p-6 md:p-10 mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 dark:border-white/10 light:border-slate-200 mb-6">
            <div>
              <div className="text-[10px] font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase tracking-widest mb-1 font-bold">
                INTERACTIVE DEMO
              </div>
              <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-950">
                Human Eyes vs. AI Sonar Vision
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light mt-0.5">
                Drag the slider across to see why normal cameras fail underwater and how acoustic AI unveils the hidden net.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <EyeOff className="w-4 h-4 text-amber-400" /> Human Eye / Camera
              </span>
              <span className="text-neutral-600">vs</span>
              <span className="flex items-center gap-1.5 text-[#00ff88] font-bold">
                <Eye className="w-4 h-4 text-[#00ff88]" /> AI Acoustic Vision
              </span>
            </div>
          </div>

          {/* Interactive Split Viewer Container */}
          <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-white/10 select-none">
            {/* Background Layer: Real Sonar AI Vision */}
            <div className="absolute inset-0 bg-neutral-950 flex items-center justify-center">
              <img
                src="/samples/sim_00000.png"
                alt="AI Sonar View"
                className="w-full h-full object-cover filter contrast-135 brightness-95"
              />

              {/* Glowing AI Bounding Box on Sonar Net */}
              <div className="absolute top-[28%] left-[36%] w-[28%] h-[42%] border-2 border-[#00ff88] bg-[#00ff88]/20 shadow-[0_0_30px_rgba(0,255,136,0.5)] flex flex-col justify-between p-2">
                <div className="bg-black/90 border border-[#00ff88] px-2 py-0.5 rounded text-[10px] font-mono text-[#00ff88] self-start flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-ping" />
                  <span>GHOST NET DETECTED · 96.4%</span>
                </div>
                <div className="text-[9px] font-mono text-neutral-300 bg-black/80 px-2 py-0.5 rounded self-end">
                  SHADOW OFFSET: 4.2m HEIGHT
                </div>
              </div>

              {/* HUD Tag */}
              <div className="absolute bottom-4 right-6 bg-black/80 px-3 py-1.5 rounded-lg border border-[#00ff88]/40 text-xs font-mono text-[#00ff88]">
                AI ACOUSTIC SONAR (CLEAR VISION)
              </div>
            </div>

            {/* Foreground Layer: Murky Dark Water (Clipped by slider position) */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-slate-900 to-cyan-950 flex items-center justify-center overflow-hidden transition-all duration-75"
              style={{ width: `${sliderPosition}%` }}
            >
              {/* Murky Turbid Water Simulation Texture */}
              <div className="absolute inset-0 opacity-90 bg-black/75 backdrop-blur-[6px]" />
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(6,78,59,0.5) 0%, rgba(2,6,23,0.95) 80%)',
                }}
              />

              <div className="relative z-10 p-6 text-center max-w-xs">
                <EyeOff className="w-10 h-10 text-neutral-500 mx-auto mb-3 opacity-60" />
                <h4 className="text-base font-bold text-neutral-300">
                  Total Underwater Darkness
                </h4>
                <p className="text-xs text-neutral-400 font-light mt-1">
                  At 48m depth, light cannot penetrate. Divers and underwater cameras see only pitch black water and floating silt.
                </p>
              </div>

              {/* HUD Tag */}
              <div className="absolute bottom-4 left-6 bg-black/80 px-3 py-1.5 rounded-lg border border-white/20 text-xs font-mono text-neutral-400">
                HUMAN EYE / OPTICAL CAMERA (0% VISIBILITY)
              </div>
            </div>

            {/* Draggable Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30 flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.8)] text-xs">
                ↔
              </div>
            </div>
          </div>

          {/* Slider Range Input */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-xs font-mono text-neutral-400">Human Eye (Murky)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="flex-1 accent-[#00ff88] cursor-pointer"
            />
            <span className="text-xs font-mono text-[#00ff88] font-bold">AI Sonar Vision (Crystal Clear)</span>
          </div>
        </div>

        {/* ========================================================
            PART 3: INTERACTIVE MINI-GAME: "SPOT THE NET"
           ======================================================== */}
        <div className="p-8 md:p-10 rounded-3xl border border-white/15 dark:border-white/15 light:border-slate-200 bg-neutral-950 dark:bg-neutral-950 light:bg-white light:shadow-sm mb-20">
          <div className="max-w-2xl mb-8">
            <div className="text-[10px] font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase tracking-widest mb-1 font-bold">
              TRY IT YOURSELF · 30-SECOND CHALLENGE
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white dark:text-white light:text-slate-950">
              Can You Spot the Ghost Net on Sonar?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-light mt-1">
              Our AI analyzes acoustic sound reflectivity. Click on the card below that you think shows a human-made ghost net.
            </p>
          </div>

          {/* 3 Sonar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Option 1: Natural Rock */}
            <div
              onClick={() => setSelectedQuizOption('rock')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[240px] ${
                selectedQuizOption === 'rock'
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50 hover:border-white/30 light:hover:border-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase mb-3">
                  SAMPLE PATTERN A
                </div>
                {/* Visual Diagram Representation of a Rock */}
                <div className="h-28 rounded-xl bg-neutral-900 dark:bg-neutral-900 light:bg-slate-200 border border-white/5 dark:border-white/5 light:border-slate-300 relative overflow-hidden flex items-center justify-center p-4">
                  <div className="w-16 h-12 rounded-full bg-neutral-400/30 border border-neutral-400/50 transform rotate-12" />
                  <div className="absolute right-4 w-12 h-14 bg-black/80 rounded" />
                </div>
                <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 mt-4">
                  Irregular Lump with Jagged Shadow
                </h4>
              </div>
              <button className="w-full mt-4 py-2 rounded-full border border-white/20 dark:border-white/20 light:border-slate-300 text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-slate-700">
                Choose Pattern A
              </button>
            </div>

            {/* Option 2: Sand Ripples */}
            <div
              onClick={() => setSelectedQuizOption('sand')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[240px] ${
                selectedQuizOption === 'sand'
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50 hover:border-white/30 light:hover:border-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase mb-3">
                  SAMPLE PATTERN B
                </div>
                {/* Visual Diagram Representation of Sand Waves */}
                <div className="h-28 rounded-xl bg-neutral-900 dark:bg-neutral-900 light:bg-slate-200 border border-white/5 dark:border-white/5 light:border-slate-300 relative overflow-hidden flex flex-col justify-around p-3">
                  <div className="h-1 bg-neutral-500/40 rounded-full w-full" />
                  <div className="h-1 bg-neutral-500/40 rounded-full w-4/5" />
                  <div className="h-1 bg-neutral-500/40 rounded-full w-full" />
                  <div className="h-1 bg-neutral-500/40 rounded-full w-3/4" />
                </div>
                <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 mt-4">
                  Smooth Repeating Ocean Waves
                </h4>
              </div>
              <button className="w-full mt-4 py-2 rounded-full border border-white/20 dark:border-white/20 light:border-slate-300 text-xs font-mono text-neutral-300 dark:text-neutral-300 light:text-slate-700">
                Choose Pattern B
              </button>
            </div>

            {/* Option 3: Ghost Net (CORRECT) */}
            <div
              onClick={() => setSelectedQuizOption('net')}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[240px] ${
                selectedQuizOption === 'net'
                  ? 'border-[#00ff88] bg-[#00ff88]/10 shadow-[0_0_30px_rgba(0,255,136,0.2)]'
                  : 'border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50 hover:border-[#00ff88]/50'
              }`}
            >
              <div>
                <div className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 uppercase mb-3">
                  SAMPLE PATTERN C
                </div>
                {/* Visual Diagram Representation of a Ghost Net */}
                <div className="h-28 rounded-xl bg-neutral-900 dark:bg-neutral-900 light:bg-slate-200 border border-white/5 dark:border-white/5 light:border-slate-300 relative overflow-hidden flex items-center justify-center p-3">
                  {/* Mesh Lattice Lines */}
                  <div className="w-20 h-16 border-2 border-[#00ff88] bg-[#00ff88]/20 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5">
                    <div className="border border-[#00ff88]/40" />
                    <div className="border border-[#00ff88]/40" />
                    <div className="border border-[#00ff88]/40" />
                    <div className="border border-[#00ff88]/40" />
                    <div className="border border-[#00ff88]/40" />
                    <div className="border border-[#00ff88]/40" />
                  </div>
                  {/* Acoustic Shadow behind */}
                  <div className="w-14 h-20 bg-black/90 ml-2" />
                </div>
                <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 mt-4">
                  Straight Mesh Grid + Tall Shadow
                </h4>
              </div>
              <button className="w-full mt-4 py-2 rounded-full bg-[#00ff88] text-black font-bold text-xs font-mono shadow-sm">
                Choose Pattern C
              </button>
            </div>
          </div>

          {/* Interactive Quiz Result Explanation */}
          {selectedQuizOption && (
            <div className="mt-8 p-6 rounded-2xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black dark:bg-black light:bg-slate-50 animate-in fade-in shadow-sm">
              {selectedQuizOption === 'net' ? (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-[#00ff88]/20 text-[#00ff88] shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700">
                      Spot On! You Identified the Ghost Net!
                    </h4>
                    <p className="text-xs text-neutral-300 dark:text-neutral-300 light:text-slate-700 font-light leading-relaxed mt-1">
                      Human-made fishing nets have straight geometric lines and regular square lattice mesh (Pattern C) that never occurs naturally in ocean geology. The long dark patch behind it is the <strong>acoustic shadow</strong>, revealing that the net is standing upright in the water column ready to trap passing sea life.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-amber-400 dark:text-amber-400 light:text-amber-700">
                      Not quite — That is a natural seabed formation!
                    </h4>
                    <p className="text-xs text-neutral-300 dark:text-neutral-300 light:text-slate-700 font-light leading-relaxed mt-1">
                      {selectedQuizOption === 'rock' 
                        ? 'Pattern A is a natural boulder. Rocks have irregular rough edges and lack repeating parallel grid lines.'
                        : 'Pattern B is a series of gentle sand ripples formed by ocean currents. Notice how they smoothly fade across the seabed without casting tall acoustic shadows.'}
                      <br />
                      <strong>Look at Pattern C:</strong> The straight grid mesh and prominent shadow are the tell-tale signature of an abandoned ghost net.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            PART 4: JARGON BUSTER (PLAIN-ENGLISH ANALOGIES)
           ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase tracking-widest font-bold">
                GLOSSARY
              </div>
              <h3 className="text-2xl font-bold text-white dark:text-white light:text-slate-950">
                Ocean Jargon Buster
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 hidden sm:inline">
              CLICK ANY TERM TO VIEW PLAIN-ENGLISH ANALOGY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {jargonList.map((j) => (
              <div
                key={j.term}
                onClick={() => setActiveJargon(activeJargon === j.term ? null : j.term)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                  activeJargon === j.term
                    ? 'border-[#00ff88] dark:border-[#00ff88] light:border-emerald-500 bg-[#00ff88]/10 dark:bg-[#00ff88]/10 light:bg-emerald-50'
                    : 'border-white/10 dark:border-white/10 light:border-slate-200 bg-neutral-950 dark:bg-neutral-950 light:bg-white light:shadow-sm hover:border-white/30 light:hover:border-slate-400'
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase block mb-1 font-bold">
                    {j.simple}
                  </span>
                  <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-950">
                    {j.term}
                  </h4>
                </div>
                <div className="mt-3 text-[10px] font-mono text-neutral-500 dark:text-neutral-500 light:text-slate-500 flex items-center justify-between">
                  <span>{activeJargon === j.term ? 'COLLAPSE' : 'EXPLAIN'}</span>
                  <span>{activeJargon === j.term ? '▲' : '▼'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded Jargon Explanation Box */}
          {activeJargon && (
            <div className="mt-4 p-6 rounded-2xl border border-[#00ff88]/40 dark:border-[#00ff88]/40 light:border-emerald-400 bg-neutral-950 dark:bg-neutral-950 light:bg-emerald-50/70 animate-in fade-in shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 mb-1 font-bold">
                <BookOpen className="w-4 h-4" />
                <span>WHAT DOES "{activeJargon.toUpperCase()}" MEAN IN SIMPLE WORDS?</span>
              </div>
              <p className="text-sm text-neutral-200 dark:text-neutral-200 light:text-slate-800 font-light leading-relaxed mt-2">
                {jargonList.find((j) => j.term === activeJargon)?.analogy}
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
export default BeginnerEducationSection;
