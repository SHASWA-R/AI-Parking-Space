import React, { useState, useRef } from 'react';
import { Waves, Radio, AlertTriangle, ShieldCheck, MapPin, Eye, X, Volume2 } from 'lucide-react';

interface TransectItem {
  id: string;
  type: string;
  category: string;
  location: string;
  depth: number;
  confidence: number;
  frequency: string;
  hazardLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  lat: number;
  lon: number;
  reliefHeight: number;
}

const TRANSECT_DATA: TransectItem[] = [
  {
    id: 'TGT-01',
    type: 'Monofilament Ghost Net',
    category: 'Abandoned Fishing Gear',
    location: 'Lakshadweep Basin',
    depth: 42.5,
    confidence: 96.4,
    frequency: '900 kHz',
    hazardLevel: 'CRITICAL',
    lat: 10.12,
    lon: 76.56,
    reliefHeight: 2.4,
  },
  {
    id: 'TGT-02',
    type: '55-Gal Chemical Drum',
    category: 'Industrial Container',
    location: 'Goa Coastal Bank',
    depth: 28.0,
    confidence: 94.1,
    frequency: '455 kHz',
    hazardLevel: 'HIGH',
    lat: 15.40,
    lon: 73.80,
    reliefHeight: 0.9,
  },
  {
    id: 'TGT-03',
    type: 'Snagged Trawl Webbing',
    category: 'Marine Debris',
    location: 'Palk Strait Coral Shelf',
    depth: 18.2,
    confidence: 91.8,
    frequency: '900 kHz',
    hazardLevel: 'MEDIUM',
    lat: 9.85,
    lon: 79.50,
    reliefHeight: 1.8,
  },
  {
    id: 'TGT-04',
    type: 'Steel Intermodal Container',
    category: 'Lost Cargo',
    location: 'Andaman Deep Trench',
    depth: 85.0,
    confidence: 95.3,
    frequency: '455 kHz',
    hazardLevel: 'HIGH',
    lat: 11.75,
    lon: 92.65,
    reliefHeight: 2.6,
  },
  {
    id: 'TGT-05',
    type: 'Subsea Cable Armor Harness',
    category: 'Subsea Infrastructure Debris',
    location: 'Kochi Shipping Channel',
    depth: 34.8,
    confidence: 93.5,
    frequency: '455 kHz',
    hazardLevel: 'MEDIUM',
    lat: 9.93,
    lon: 76.26,
    reliefHeight: 0.6,
  },
  {
    id: 'TGT-06',
    type: 'Purse Seine Entanglement',
    category: 'Ghost Gear',
    location: 'Gujarat Coastal Shelf',
    depth: 22.4,
    confidence: 97.2,
    frequency: '900 kHz',
    hazardLevel: 'CRITICAL',
    lat: 20.91,
    lon: 70.37,
    reliefHeight: 3.1,
  },
];

interface AcousticTransectReelProps {
  theme?: 'dark' | 'light';
  onInspectTarget?: (item: TransectItem) => void;
}

export const AcousticTransectReel: React.FC<AcousticTransectReelProps> = ({
  theme = 'dark',
  onInspectTarget,
}) => {
  const [selectedItem, setSelectedItem] = useState<TransectItem | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (item: TransectItem) => {
    setSelectedItem(item);
    if (onInspectTarget) onInspectTarget(item);
  };

  const getHazardBadge = (level: TransectItem['hazardLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-[#ec4899]/15 border-[#ec4899]/40 text-[#ec4899]';
      case 'HIGH':
        return 'bg-amber-400/15 border-amber-400/40 text-amber-400';
      case 'MEDIUM':
        return 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]';
    }
  };

  // Double the dataset for seamless infinite looping
  const duplicatedList = [...TRANSECT_DATA, ...TRANSECT_DATA];

  return (
    <div
      className={`relative w-full border-y select-none transition-colors duration-300 overflow-hidden ${
        theme === 'dark'
          ? 'bg-[#010814] border-white/10 text-white'
          : 'bg-[#f1f5f9] border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Telemetry Header Strip */}
      <div className="w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto px-6 sm:px-10 lg:px-14 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono border-b border-white/5 dark:border-white/5 light:border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
          <span className="text-[#00e5ff] uppercase font-bold tracking-widest">
            ACOUSTIC TRANSECT REEL // LIVE SONAR DEBRIS STREAM
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-400 light:text-slate-500">
          <span>Speed: 3.5 kn</span>
          <span>·</span>
          <span>Swath: 150m Port & Starboard</span>
          <span>·</span>
          <span className="text-[#00ff88] font-semibold">Hover to Pause · Click to Inspect</span>
        </div>
      </div>

      {/* Outer Reel Container with Left/Right Ambient Fade Vignettes */}
      <div
        className="relative w-full py-4 overflow-hidden group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Edge Fade */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-28 z-20 pointer-events-none bg-gradient-to-r from-[#010814] dark:from-[#010814] light:from-[#f1f5f9] to-transparent" />
        
        {/* Right Edge Fade */}
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-28 z-20 pointer-events-none bg-gradient-to-l from-[#010814] dark:from-[#010814] light:from-[#f1f5f9] to-transparent" />

        {/* Continuous Scrolling Reel Track */}
        <div
          ref={scrollRef}
          className={`flex items-center gap-4 w-max ${
            isPaused ? '[animation-play-state:paused]' : ''
          }`}
          style={{
            animation: 'marqueeScroll 28s linear infinite',
          }}
        >
          {duplicatedList.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => handleCardClick(item)}
              className={`flex-shrink-0 w-72 sm:w-80 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-neutral-950/80 border-white/10 hover:border-[#00ff88]/60 hover:bg-neutral-900 shadow-md'
                  : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md'
              } hover:scale-105 hover:-translate-y-1`}
            >
              {/* Header: Target ID & Hazard Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-[#00e5ff] font-mono text-xs font-bold">
                    <Waves className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#00e5ff]">
                    {item.id}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider ${getHazardBadge(
                    item.hazardLevel
                  )}`}
                >
                  {item.hazardLevel}
                </span>
              </div>

              {/* Title & Classification */}
              <h4 className="font-bold text-sm text-white dark:text-white light:text-slate-900 truncate">
                {item.type}
              </h4>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-400 light:text-slate-500 truncate mb-3">
                {item.category}
              </p>

              {/* Telemetry Row */}
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-600 pt-2 border-t border-white/5 dark:border-white/5 light:border-slate-100">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#00ff88]" />
                  <span className="truncate max-w-[110px]">{item.location}</span>
                </div>
                <span>-{item.depth}m</span>
                <span className="text-[#00ff88] font-bold">{item.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Inspection Modal / Quick Popover */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={`relative w-full max-w-md p-6 rounded-2xl border shadow-2xl transition-all duration-300 animate-entrance-zoom ${
              theme === 'dark'
                ? 'bg-neutral-950 border-white/15 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 dark:border-white/10 light:border-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] animate-ping" />
                <span className="font-mono text-xs font-bold text-[#00ff88] uppercase tracking-wider">
                  Target Telemetry File: {selectedItem.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Close Inspection Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-3">
              <h3 className="text-xl font-bold text-white dark:text-white light:text-slate-900">
                {selectedItem.type}
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-400 light:text-slate-600">
                {selectedItem.category} detected via {selectedItem.frequency} side-scan sonar channel.
              </p>

              {/* Grid Attributes */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">Coordinates</span>
                  <span className="font-bold">{selectedItem.lat}° N, {selectedItem.lon}° E</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">Benthic Depth</span>
                  <span className="font-bold text-[#00e5ff]">-{selectedItem.depth} meters</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">AI Confidence</span>
                  <span className="font-bold text-[#00ff88]">{selectedItem.confidence}%</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">Acoustic Relief</span>
                  <span className="font-bold text-amber-400">+{selectedItem.reliefHeight}m height</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 dark:border-white/10 light:border-slate-200 flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full border text-xs font-mono font-bold ${getHazardBadge(
                  selectedItem.hazardLevel
                )}`}
              >
                HAZARD: {selectedItem.hazardLevel}
              </span>
              <a
                href="#map"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-full bg-[#00ff88] text-black font-bold text-xs hover:bg-[#00ff88]/90 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcousticTransectReel;
