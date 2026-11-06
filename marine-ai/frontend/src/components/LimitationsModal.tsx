import React, { useState } from 'react';
import { X, AlertTriangle, Calculator, ShieldAlert, Info } from 'lucide-react';

interface LimitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LimitationsModal: React.FC<LimitationsModalProps> = ({ isOpen, onClose }) => {
  const [altitude, setAltitude] = useState<number>(3.5);
  const [slantRangeMax, setSlantRangeMax] = useState<number>(20.0);
  const [targetMeshPitchCm, setTargetMeshPitchCm] = useState<number>(8.0);

  if (!isOpen) return null;

  const width = 2048;
  const slantResM = (slantRangeMax * 2) / width;
  const midSlantR = slantRangeMax * 0.65;
  const midGroundR = Math.sqrt(Math.max(midSlantR * midSlantR - altitude * altitude, 0.01));
  const groundResAcrossM = slantResM * (midSlantR / midGroundR);
  const groundResAcrossCm = groundResAcrossM * 100;

  const samplesPerPeriod = (targetMeshPitchCm / 100) / groundResAcrossM;
  const isResolvable = samplesPerPeriod >= 2.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border transition bg-[#081224] border-slate-700 text-slate-200 dark:bg-[#081224] dark:border-slate-700 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Scientific Limitations & Survey Geometry Advisor
              </h2>
              <p className="text-xs text-slate-400">
                Honest, peer-reviewed operational constraints & interactive Nyquist resolution simulator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border transition bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700 dark:bg-slate-800 dark:border-slate-700 light:bg-slate-100 light:text-slate-600 light:border-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawback 1: The Nyquist Survey Geometry Limit */}
        <div className="rounded-2xl p-4 space-y-4 border transition bg-[#050c18] border-cyan-800/40 dark:bg-[#050c18] dark:border-cyan-800/40 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-cyan-500">
                1. Ghost Net Mesh Nyquist Resolution Limit
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded border font-mono bg-cyan-950 text-cyan-300 border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 light:bg-cyan-100 light:text-cyan-800 light:border-cyan-300">
              Interactive Physics Simulator
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Side-scan sonar cannot recover sub-pixel structures. To resolve a fishing net mesh with 2D FFT periodicity, the acoustic footprint must satisfy the <strong>Nyquist criterion (≥ 2.5 samples per period)</strong>. Standard 100m surveys at ~10 cm/px resolution cannot resolve any net mesh — <em>the system honestly flags this rather than hallucinating false detections.</em>
          </p>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">Towfish Altitude</span>
                <span className="font-bold text-cyan-500">{altitude.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="20.0"
                step="0.5"
                value={altitude}
                onChange={e => setAltitude(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">High-freq survey: ~3.5m</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">Max Slant Range</span>
                <span className="font-bold text-cyan-500">{slantRangeMax.toFixed(0)} m</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={slantRangeMax}
                onChange={e => setSlantRangeMax(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">High-freq: 20m · Standard: 100m</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400">Target Net Pitch</span>
                <span className="font-bold text-cyan-500">{targetMeshPitchCm.toFixed(1)} cm</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="18.0"
                step="0.5"
                value={targetMeshPitchCm}
                onChange={e => setTargetMeshPitchCm(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Gillnet: 3-9cm · Trawl: 9-16cm</span>
            </div>
          </div>

          {/* Real-time Calculation Result */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
              isResolvable
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 light:bg-emerald-50 light:border-emerald-300 light:text-emerald-800'
                : 'bg-red-950/40 border-red-500/40 text-red-300 dark:bg-red-950/40 dark:text-red-300 light:bg-red-50 light:border-red-300 light:text-red-800'
            }`}
          >
            <div>
              <span className="block font-bold">
                Ground Resolution: {groundResAcrossCm.toFixed(2)} cm/px · {samplesPerPeriod.toFixed(2)} samples/period
              </span>
              <span className="text-[11px] opacity-85">
                {isResolvable
                  ? '✓ RESOLVABLE: Net mesh will produce verifiable FFT periodicity peaks.'
                  : '✗ UNRESOLVABLE: Acoustic footprint too coarse. System reports Nyquist limitation.'}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase ${
                isResolvable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'
              }`}
            >
              {isResolvable ? 'Passes Nyquist' : 'Resolution Limit'}
            </span>
          </div>
        </div>

        {/* Drawback 2: Linearity & Sagging Cables */}
        <div className="rounded-2xl p-4 space-y-2 border transition bg-[#050c18] border-slate-800 dark:bg-[#050c18] dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-amber-500">
              2. Linearity Curvature Limitation
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The linearity signature calculates the RMS deviation from the principal axis via Singular Value Decomposition (SVD). While rigid pipes and taut towlines produce high linearity scores (straightness &gt; 0.8), heavily sagging or coiled discarded cables experience increased deviation.
          </p>
        </div>

        {/* Drawback 3: Physics Forward Model Disclosure */}
        <div className="rounded-2xl p-4 space-y-2 border transition bg-[#050c18] border-slate-800 dark:bg-[#050c18] dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-indigo-400">
              3. Full Disclosure on Physics-Simulated Training Data
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Currently, no public, high-resolution labelled side-scan sonar benchmark for ghost gear exists worldwide. Our dataset is generated using a <strong>first-principles acoustic forward model</strong> incorporating grazing angle modulation, Rayleigh speckle, and ray-traced shadows. Real sonar tiles are incorporated as background clutter.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
