import React from 'react';
import { Compass, Gauge, Radio, Play, Pause, Anchor } from 'lucide-react';

interface AuvMissionHudProps {
  isStreaming: boolean;
  onToggleStream: () => void;
  headingDeg: number;
  speedKnots: number;
  altitudeM: number;
  depthM: number;
  pingRateHz: number;
}

export const AuvMissionHud: React.FC<AuvMissionHudProps> = ({
  isStreaming,
  onToggleStream,
  headingDeg = 42,
  speedKnots = 3.2,
  altitudeM = 3.5,
  depthM = 48.2,
  pingRateHz = 15
}) => {
  return (
    <div className="backdrop-blur border rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-sm transition bg-[#070f1e]/90 border-slate-800 text-slate-200 dark:bg-[#070f1e]/90 dark:border-slate-800 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-800">
      {/* Left: Mission & Simulation Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            {isStreaming && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isStreaming ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
          </span>
          <span className="font-bold tracking-wider">
            {isStreaming ? 'AUV CRUISE SWEEP ACTIVE' : 'AUV STANDBY'}
          </span>
        </div>

        <button
          onClick={onToggleStream}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-semibold transition ${
            isStreaming
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm'
          }`}
          title="Toggle real-time AUV ping scanning sweep (Space)"
        >
          {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isStreaming ? 'Pause Cruise' : 'Simulate Cruise'}</span>
        </button>
      </div>

      {/* Right: Live AUV Telemetry Readouts */}
      <div className="flex items-center flex-wrap gap-4">
        <div className="flex items-center space-x-1.5" title="Vessel Heading">
          <Compass className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-slate-400">HDG:</span>
          <span className="font-bold">{headingDeg.toString().padStart(3, '0')}°</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Survey Speed">
          <Gauge className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-400">SPD:</span>
          <span className="font-bold">{speedKnots.toFixed(1)} kn</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Towfish Altitude above seabed">
          <Radio className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-slate-400">ALT:</span>
          <span className="font-bold text-amber-500">{altitudeM.toFixed(1)}m</span>
        </div>

        <div className="flex items-center space-x-1.5" title="Water Depth">
          <Anchor className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-slate-400">DEPTH:</span>
          <span className="font-bold">{depthM.toFixed(1)}m</span>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5" title="Acoustic Ping Frequency">
          <span className="text-slate-400">PING:</span>
          <span className="text-cyan-500 font-bold">{pingRateHz} Hz</span>
        </div>
      </div>
    </div>
  );
};
