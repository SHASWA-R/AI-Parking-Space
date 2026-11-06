import React, { useState, useMemo } from 'react';
import { Detection } from '../types/sonar';
import { Target, Search, ArrowRight, Filter, Crosshair } from 'lucide-react';

interface DetectionsTableProps {
  detections: Detection[];
  selectedDetection: Detection | null;
  onSelectDetection: (detection: Detection) => void;
  onFocusDetection?: (detection: Detection) => void;
}

export const DetectionsTable: React.FC<DetectionsTableProps> = ({
  detections,
  selectedDetection,
  onSelectDetection,
  onFocusDetection
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CRITICAL' | 'NETS' | 'LINEAR'>('ALL');

  const filtered = useMemo(() => {
    return detections.filter(d => {
      if (filterCategory === 'CRITICAL' && d.risk !== 'CRITICAL') return false;
      if (filterCategory === 'NETS' && !d.className.toLowerCase().includes('net')) return false;
      if (filterCategory === 'LINEAR' && !d.className.toLowerCase().includes('linear') && !d.className.toLowerCase().includes('cable')) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        d.id.toLowerCase().includes(term) ||
        d.className.toLowerCase().includes(term) ||
        d.signature.toLowerCase().includes(term) ||
        (d.inferredGearType && d.inferredGearType.toLowerCase().includes(term))
      );
    });
  }, [detections, searchTerm, filterCategory]);

  return (
    <div className="border rounded-2xl overflow-hidden shadow-sm transition bg-[#070f1e] border-slate-800 text-slate-200 dark:bg-[#070f1e] dark:border-slate-800 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-800">
      {/* Table Toolbar */}
      <div className="p-3.5 border-b flex flex-wrap items-center justify-between gap-3 border-slate-800 dark:border-slate-800 light:border-slate-200">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 dark:text-slate-100 light:text-slate-800">
            Anthropogenic Debris Inventory ({detections.length} Targets)
          </h3>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-1 p-1 rounded-xl border font-mono bg-slate-900 border-slate-800 dark:bg-slate-900 dark:border-slate-800 light:bg-slate-100 light:border-slate-200">
            {(['ALL', 'CRITICAL', 'NETS', 'LINEAR'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                  filterCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 dark:bg-cyan-500/20 dark:text-cyan-300 light:bg-white light:text-cyan-700 light:border-cyan-300'
                    : 'text-slate-400 hover:text-slate-200 dark:text-slate-400 light:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search targets or gear..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 w-44 sm:w-52 bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 light:bg-slate-50 light:border-slate-300 light:text-slate-800 light:placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="uppercase font-mono text-[10px] border-b bg-[#040812] border-slate-800 text-slate-400 dark:bg-[#040812] dark:border-slate-800 dark:text-slate-400 light:bg-slate-50 light:border-slate-200 light:text-slate-600">
            <tr>
              <th className="py-2.5 px-3">Target ID</th>
              <th className="py-2.5 px-3">Classification & Gear</th>
              <th className="py-2.5 px-3">Acoustic Signature</th>
              <th className="py-2.5 px-3">Dimensions / Mesh Pitch</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3">Risk Level</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y font-sans divide-slate-800/60 dark:divide-slate-800/60 light:divide-slate-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 font-mono">
                  No targets matched the active filter or search criteria.
                </td>
              </tr>
            ) : (
              filtered.map(det => {
                const isSelected = selectedDetection?.id === det.id;
                return (
                  <tr
                    key={det.id}
                    onClick={() => {
                      onSelectDetection(det);
                      if (onFocusDetection) onFocusDetection(det);
                    }}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400 dark:bg-cyan-950/40 light:bg-cyan-50 light:border-cyan-600'
                        : 'hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-500">
                      {det.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <span>{det.className}</span>
                      {det.inferredGearType && (
                        <span className="block text-[10px] text-emerald-500 font-mono font-semibold">
                          Type: {det.inferredGearType}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono capitalize">
                      <span className="px-2 py-0.5 rounded border bg-slate-800 border-slate-700 text-slate-300 dark:bg-slate-800 dark:border-slate-700 light:bg-slate-100 light:border-slate-200 light:text-slate-700">
                        {det.signature}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {det.meshPitchCm ? (
                        <span className="text-cyan-500 font-bold">{det.meshPitchCm.toFixed(1)} cm mesh pitch</span>
                      ) : det.estimatedLengthM ? (
                        <span>{det.estimatedLengthM.toFixed(1)}m × {det.estimatedWidthM?.toFixed(1)}m</span>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {(det.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          det.risk === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-500 border-red-500/30'
                            : det.risk === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30'
                        }`}
                      >
                        {det.risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectDetection(det);
                          if (onFocusDetection) onFocusDetection(det);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700 dark:bg-slate-800 dark:text-cyan-400 light:bg-slate-100 light:text-cyan-700 light:border-slate-300 light:hover:bg-slate-200"
                        title="Center Canvas on this Target and Inspect"
                      >
                        <Crosshair className="w-3 h-3 text-cyan-500" />
                        <span>Focus</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
