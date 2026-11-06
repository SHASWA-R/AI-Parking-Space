import React, { useState } from 'react';
import { Detection } from '../types/sonar';
import { Activity, CheckCircle2 } from 'lucide-react';

interface ExplainableAIPanelProps {
  detection: Detection | null;
}

export const ExplainableAIPanel: React.FC<ExplainableAIPanelProps> = ({ detection }) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'spectrum' | 'shadow'>('radar');

  if (!detection) {
    return (
      <div className="h-full border rounded-2xl p-6 flex flex-col items-center justify-center text-center transition bg-[#070f1e] border-slate-800 text-slate-400 dark:bg-[#070f1e] dark:border-slate-800 light:bg-white light:border-slate-200 light:text-slate-500 shadow-sm">
        <Activity className="w-12 h-12 text-slate-500 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-200 dark:text-slate-200 light:text-slate-800">Acoustic Signature Inspector</h3>
        <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 max-w-xs mt-1">
          Click or select any target bounding box on the sonar canvas to inspect its 5 geometric signatures and explainable AI decision reasoning.
        </p>
      </div>
    );
  }

  const {
    id,
    className,
    signature,
    naturalScore,
    signatureScores = {},
    risk,
    meshPitchCm,
    inferredGearType,
    estimatedLengthM,
    estimatedWidthM,
    estimatedHeightM,
    overrideReason,
    evidence = []
  } = detection;

  const axes = [
    { key: 'periodicity', label: 'Periodicity' },
    { key: 'linearity', label: 'Linearity' },
    { key: 'circularity', label: 'Circularity' },
    { key: 'angularity', label: 'Angularity' },
    { key: 'irregularity', label: 'Irregularity' }
  ];

  const radarRadius = 70;
  const radarCenter = 95;

  const getCoordinates = (index: number, score: number) => {
    const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
    const r = score * radarRadius;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = axes.map((axis, i) => {
    const score = Math.max(0.05, Math.min(1.0, signatureScores[axis.key] || 0));
    const { x, y } = getCoordinates(i, score);
    return `${x},${y}`;
  }).join(' ');

  const naturalThreshold = naturalScore || 0.25;
  const naturalPoints = axes.map((_, i) => {
    const { x, y } = getCoordinates(i, naturalThreshold);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-full border rounded-2xl p-4 overflow-y-auto space-y-4 flex flex-col justify-between transition shadow-sm bg-[#070f1e] border-slate-800 text-slate-200 dark:bg-[#070f1e] dark:border-slate-800 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-800">
      <div className="space-y-4">
        {/* Header Badge */}
        <div className="flex items-start justify-between border-b pb-3 border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded font-bold border bg-slate-800 text-cyan-400 border-slate-700 dark:bg-slate-800 dark:text-cyan-400 light:bg-slate-100 light:text-cyan-700 light:border-slate-300">
                {id}
              </span>
              <h3 className="text-sm font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">{className}</h3>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
              <span>Primary: <strong className="text-emerald-500 uppercase font-mono">{signature}</strong></span>
              <span>·</span>
              <span>Confidence: <strong className="font-mono">{(detection.confidence * 100).toFixed(0)}%</strong></span>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded text-xs font-bold border ${
              risk === 'CRITICAL'
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm'
                : risk === 'HIGH'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-500 border-cyan-500/40'
            }`}
          >
            {risk} RISK
          </span>
        </div>

        {/* Override Alert if Periodicity triggered */}
        {overrideReason && (
          <div className="p-2.5 rounded-xl border text-xs flex items-start space-x-2 bg-cyan-950/60 border-cyan-500/40 text-cyan-300 dark:bg-cyan-950/60 dark:text-cyan-300 light:bg-cyan-50 light:border-cyan-200 light:text-cyan-900">
            <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">XAI Periodicity Override</strong>
              <span>{overrideReason}</span>
            </div>
          </div>
        )}

        {/* Inspector Mode Tabs */}
        <div className="flex rounded-xl p-1 border text-xs font-mono bg-slate-900/90 border-slate-800 dark:bg-slate-900/90 dark:border-slate-800 light:bg-slate-100 light:border-slate-200">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex-1 py-1 rounded-lg transition text-center font-bold ${
              activeTab === 'radar'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-white light:text-cyan-700 light:border-cyan-200'
                : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
            }`}
          >
            5-Axis Radar
          </button>
          <button
            onClick={() => setActiveTab('spectrum')}
            className={`flex-1 py-1 rounded-lg transition text-center font-bold ${
              activeTab === 'spectrum'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-white light:text-cyan-700 light:border-cyan-200'
                : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
            }`}
          >
            FFT Spectrum
          </button>
          <button
            onClick={() => setActiveTab('shadow')}
            className={`flex-1 py-1 rounded-lg transition text-center font-bold ${
              activeTab === 'shadow'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-white light:text-cyan-700 light:border-cyan-200'
                : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
            }`}
          >
            Acoustic Shadow
          </button>
        </div>

        {/* Tab 1: SVG 5-Axis Spider Radar Chart */}
        {activeTab === 'radar' && (
          <div className="border rounded-2xl p-3 flex flex-col items-center bg-[#040812] border-slate-800/80 dark:bg-[#040812] dark:border-slate-800/80 light:bg-slate-50 light:border-slate-200">
            <div className="w-full flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>● Target Regularity</span>
              <span className="text-amber-500">--- Seabed Irregularity Threshold</span>
            </div>

            <svg width="210" height="190" className="overflow-visible">
              {[0.25, 0.5, 0.75, 1.0].map((r, idx) => (
                <circle
                  key={idx}
                  cx={radarCenter}
                  cy={radarCenter}
                  r={r * radarRadius}
                  fill="none"
                  stroke="rgba(100, 116, 139, 0.3)"
                  strokeWidth="1"
                />
              ))}

              {axes.map((axis, i) => {
                const { x, y } = getCoordinates(i, 1.0);
                const labelCoord = getCoordinates(i, 1.28);
                return (
                  <g key={axis.key}>
                    <line
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={x}
                      y2={y}
                      stroke="rgba(100, 116, 139, 0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={labelCoord.x}
                      y={labelCoord.y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              })}

              <polygon
                points={naturalPoints}
                fill="rgba(245, 158, 11, 0.08)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              <polygon
                points={polygonPoints}
                fill="rgba(0, 255, 136, 0.2)"
                stroke="#00ff88"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        {/* Tab 2: 2D FFT Power Spectrum Curve */}
        {activeTab === 'spectrum' && (
          <div className="border rounded-2xl p-3 space-y-2 bg-[#040812] border-slate-800/80 dark:bg-[#040812] dark:border-slate-800/80 light:bg-slate-50 light:border-slate-200">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-cyan-500 font-bold">Spatial Frequency Power (Whitened)</span>
              <span className="text-slate-400">{meshPitchCm ? `${meshPitchCm.toFixed(1)} cm pitch` : 'Aperiodic'}</span>
            </div>

            <div className="relative h-32 w-full rounded-xl border flex items-end px-2 pt-4 pb-1 bg-[#030610] border-slate-800 dark:bg-[#030610] dark:border-slate-800 light:bg-white light:border-slate-200">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 80">
                <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(100, 116, 139, 0.2)" strokeDasharray="2 2" />
                <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(100, 116, 139, 0.2)" strokeDasharray="2 2" />
                <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(100, 116, 139, 0.2)" strokeDasharray="2 2" />

                <line x1="160" y1="0" x2="160" y2="80" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="162" y="12" fill="#ef4444" fontSize="7" fontFamily="monospace">Nyquist Limit</text>

                <rect x="40" y="0" width="110" height="80" fill="rgba(0, 229, 255, 0.05)" />

                {meshPitchCm ? (
                  <path
                    d="M 5 75 Q 30 72, 50 65 Q 70 50, 95 14 Q 105 16, 120 62 Q 150 72, 195 76"
                    fill="none"
                    stroke="#00e5ff"
                    strokeWidth="2.5"
                  />
                ) : (
                  <path
                    d="M 5 70 Q 50 68, 90 71 Q 130 69, 195 74"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                  />
                )}

                {meshPitchCm && (
                  <g>
                    <circle cx="95" cy="14" r="3.5" fill="#00ff88" />
                    <text x="95" y="8" fill="#059669" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                      {meshPitchCm.toFixed(1)} cm
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0.5 m (Coarse)</span>
              <span className="text-cyan-500 font-bold">Commercial Passband (2–18 cm)</span>
              <span>1 cm (Fine)</span>
            </div>
          </div>
        )}

        {/* Tab 3: 2.5D Acoustic Shadow Ray-Trace */}
        {activeTab === 'shadow' && (
          <div className="border rounded-2xl p-3 space-y-2 bg-[#040812] border-slate-800/80 dark:bg-[#040812] dark:border-slate-800/80 light:bg-slate-50 light:border-slate-200">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-indigo-400 font-bold">Grazing Shadow Profile</span>
              <span className="text-emerald-500 font-bold">Relief: +{estimatedHeightM?.toFixed(2) || '0.54'}m</span>
            </div>

            <svg viewBox="0 0 240 90" className="w-full h-24 rounded-xl border bg-[#030610] border-slate-800 dark:bg-[#030610] dark:border-slate-800 light:bg-white light:border-slate-200">
              <line x1="10" y1="75" x2="230" y2="75" stroke="#64748b" strokeWidth="1.5" />
              <text x="10" y="85" fill="#64748b" fontSize="8" fontFamily="monospace">Seabed</text>

              <circle cx="30" cy="20" r="4" fill="#00e5ff" />
              <text x="30" y="12" fill="#0284c7" fontSize="8" fontFamily="monospace" textAnchor="middle">Towfish (H=3.5m)</text>

              <rect x="110" y="58" width="18" height="17" fill="#10b981" rx="2" />
              <text x="119" y="52" fill="#059669" fontSize="8" fontFamily="monospace" textAnchor="middle">Object</text>

              <line x1="30" y1="20" x2="110" y2="58" stroke="rgba(0, 229, 255, 0.6)" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="30" y1="20" x2="170" y2="75" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" strokeDasharray="3 3" />

              <rect x="128" y="73" width="42" height="4" fill="#0284c7" opacity="0.9" />
              <text x="149" y="86" fill="#0284c7" fontSize="8" fontFamily="monospace" textAnchor="middle">Acoustic Shadow</text>
            </svg>

            <div className="text-[10px] font-mono text-slate-400 text-center">
              Formula: H_rel = Altitude * L_shadow / (R_slant + L_shadow)
            </div>
          </div>
        )}

        {/* Specialized Gear & Metric Stats */}
        {inferredGearType && (
          <div className="border rounded-xl p-2.5 flex items-center justify-between text-xs font-mono bg-[#051124] border-cyan-800/40 dark:bg-[#051124] dark:border-cyan-800/40 light:bg-cyan-50 light:border-cyan-200">
            <div>
              <span className="text-[10px] text-slate-400 block">Inferred Commercial Gear</span>
              <strong className="text-emerald-500 text-sm">{inferredGearType}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Acoustic Dimensions</span>
              <span className="font-bold">
                {estimatedLengthM?.toFixed(1) || '11.8'}m × {estimatedWidthM?.toFixed(1) || '4.3'}m
              </span>
            </div>
          </div>
        )}

        {/* Evidence Trail */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold block text-slate-300 dark:text-slate-300 light:text-slate-700">Classifier Evidence Audit Trail</span>
          <ul className="space-y-1 text-xs p-2.5 rounded-xl border bg-[#040812] border-slate-800/80 dark:bg-[#040812] dark:border-slate-800/80 light:bg-slate-50 light:border-slate-200">
            {evidence.length > 0 ? (
              evidence.map((ev, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 text-[11px]">No specific evidence items recorded.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
