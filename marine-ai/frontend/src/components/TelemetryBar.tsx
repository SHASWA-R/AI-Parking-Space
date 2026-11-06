import React from 'react';
import { Statistics } from '../types/sonar';
import { Target, Filter, ShieldCheck, Compass, Gauge } from 'lucide-react';
import { NumberTicker } from './ui/number-ticker';

interface TelemetryBarProps {
  stats: Statistics;
  currentFilename: string;
  filteredOutCurrent: number;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  stats,
  currentFilename,
  filteredOutCurrent
}) => {
  const cardStyle = "border rounded-xl p-3 flex flex-col justify-between transition shadow-sm bg-[#091528] border-slate-800 text-slate-100 dark:bg-[#091528] dark:border-slate-800 dark:text-slate-100 light:bg-white light:border-slate-200 light:text-slate-900";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-2">
      {/* Active Scan */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Active Transect</span>
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 font-mono text-sm font-semibold truncate" title={currentFilename}>
          {currentFilename}
        </div>
        <div className="text-[10px] text-slate-400">2048 x 1024 · Slant Range</div>
      </div>

      {/* Anthropogenic Detections */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Confirmed Debris</span>
          <Target className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-emerald-400">
          <NumberTicker value={stats.totalDetections} decimalPlaces={0} />
        </div>
        <div className="text-[10px] text-slate-400">Classified manufactured targets</div>
      </div>

      {/* Critical / High Risk */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>High Risk Hazards</span>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-red-500">
          <NumberTicker value={stats.highRiskCount} decimalPlaces={0} />
        </div>
        <div className="text-[10px] text-slate-400">Ghost nets & entanglement traps</div>
      </div>

      {/* Natural Features Rejection */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Natural Rejections</span>
          <Filter className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-amber-500">
          <NumberTicker value={filteredOutCurrent} decimalPlaces={0} />{' '}
          <span className="text-xs text-slate-400 font-normal">
            (<NumberTicker value={stats.naturalFeaturesFiltered} decimalPlaces={0} /> total)
          </span>
        </div>
        <div className="text-[10px] text-slate-400">Rocks & coral heads filtered</div>
      </div>

      {/* Confidence */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Avg Confidence</span>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1 font-mono text-xl font-bold text-cyan-500">
          <NumberTicker value={stats.averageConfidence} decimalPlaces={1} suffix="%" />
        </div>
        <div className="text-[10px] text-slate-400">Acoustic signature validation</div>
      </div>

      {/* Sonar Acquisition Parameters */}
      <div className={cardStyle}>
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Acoustic Geometry</span>
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="mt-1 font-mono text-xs font-semibold">
          H: 3.5m · R_max: 20m
        </div>
        <div className="text-[10px] text-emerald-500 font-mono font-bold">
          Res: ~2.0 cm/px (Passes Nyquist)
        </div>
      </div>
    </div>
  );
};
