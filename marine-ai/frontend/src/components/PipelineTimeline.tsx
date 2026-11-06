import React from 'react';
import { StageTiming } from '../types/sonar';
import { Clock, CheckCircle2, Zap } from 'lucide-react';

interface PipelineTimelineProps {
  stages: StageTiming[];
  totalLatencyMs?: number;
}

export const PipelineTimeline: React.FC<PipelineTimelineProps> = ({ stages }) => {
  const totalDuration = stages.reduce((acc, s) => acc + s.durationMs, 0);

  return (
    <div className="border rounded-2xl p-4 transition shadow-sm bg-[#070f1e] border-slate-800 text-slate-200 dark:bg-[#070f1e] dark:border-slate-800 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 dark:text-slate-100 light:text-slate-800">
            Analysis Pipeline Execution
          </h3>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span>Total Compute: <strong className="text-emerald-500 font-bold">{totalDuration.toFixed(1)} ms</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-xl border flex flex-col justify-between transition bg-[#040812] border-slate-800/90 dark:bg-[#040812] dark:border-slate-800/90 light:bg-slate-50 light:border-slate-200"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-cyan-500 font-bold">STAGE 0{idx + 1}</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            </div>
            <div className="text-[11px] font-medium leading-tight mb-2 text-slate-300 dark:text-slate-300 light:text-slate-700">
              {stage.name}
            </div>
            <div className="text-xs font-bold text-emerald-500">
              {stage.durationMs.toFixed(1)} ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
