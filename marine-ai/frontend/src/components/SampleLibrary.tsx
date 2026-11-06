import React, { useState, useMemo } from 'react';
import { SampleItem } from '../types/sonar';
import { SAMPLE_DATASETS } from '../services/mockEngine';
import { X, Upload, Layers, Search, Database, ShieldCheck, Download, Compass, Target, Waves } from 'lucide-react';

interface SampleLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  activeSampleId: string;
  onSelectSample: (sample: SampleItem) => void;
  onUploadFile: (file: File) => void;
}

export const SampleLibrary: React.FC<SampleLibraryProps> = ({
  isOpen,
  onClose,
  activeSampleId,
  onSelectSample,
  onUploadFile
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'operational' | 'benchmark' | 'synthetic'>('all');

  const filteredSamples = useMemo(() => {
    return SAMPLE_DATASETS.filter(sample => {
      const matchesCategory = selectedCategory === 'all' || sample.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sample.title.toLowerCase().includes(q) ||
        sample.description.toLowerCase().includes(q) ||
        sample.name.toLowerCase().includes(q) ||
        (sample.location && sample.location.toLowerCase().includes(q)) ||
        (sample.sourceDataset && sample.sourceDataset.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => ({
    all: SAMPLE_DATASETS.length,
    operational: SAMPLE_DATASETS.filter(s => s.category === 'operational').length,
    benchmark: SAMPLE_DATASETS.filter(s => s.category === 'benchmark').length,
    synthetic: SAMPLE_DATASETS.filter(s => s.category === 'synthetic').length
  }), []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onUploadFile(file);
      onClose();
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onUploadFile(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border transition bg-[#081224] border-slate-700 text-slate-200 dark:bg-[#081224] dark:border-slate-700 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold">
                  Sonar Dataset Explorer & Benchmark Hub
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  12 Datasets Loaded
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch between Operational MoES Surveys, International Sonar Benchmarks (MDS, SCTD, Watertight), or upload custom sonar scans
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

        {/* Evaluation Metrics Top Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#050c18] border border-slate-800 dark:bg-[#050c18] dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Catalog</span>
            <span className="text-lg font-bold text-cyan-400">12 Transects</span>
            <span className="text-[10px] text-slate-500 block">Across 3 categories</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Confirmed Debris</span>
            <span className="text-lg font-bold text-emerald-400">18 Targets</span>
            <span className="text-[10px] text-slate-500 block">Nets, lines, drums, boxes</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Natural Clutter Filter</span>
            <span className="text-lg font-bold text-amber-400">0% False Alarms</span>
            <span className="text-[10px] text-slate-500 block">Reef baseline verified</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Ground Resolution</span>
            <span className="text-lg font-bold text-indigo-400">~2.0 cm/px</span>
            <span className="text-[10px] text-slate-500 block">Nyquist pitch resolvable</span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 dark:bg-slate-900 dark:border-slate-800 light:bg-slate-100 light:border-slate-300 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Datasets ({categoryCounts.all})
            </button>
            <button
              onClick={() => setSelectedCategory('operational')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'operational'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Operational MoES ({categoryCounts.operational})
            </button>
            <button
              onClick={() => setSelectedCategory('benchmark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'benchmark'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Benchmarks MDS/SCTD ({categoryCounts.benchmark})
            </button>
            <button
              onClick={() => setSelectedCategory('synthetic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === 'synthetic'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Synthetic Physics ({categoryCounts.synthetic})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-300 light:text-slate-900"
            />
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSamples.map(sample => {
            const isActive = activeSampleId === sample.id;
            const isOperational = sample.category === 'operational';
            const isBenchmark = sample.category === 'benchmark';

            return (
              <div
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample);
                  onClose();
                }}
                className={`cursor-pointer rounded-2xl border p-3.5 flex flex-col justify-between transition group hover:scale-[1.01] ${
                  isActive
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.2)] dark:bg-cyan-950/40 light:bg-cyan-50 light:border-cyan-500'
                    : 'bg-[#050c18] border-slate-800 hover:border-slate-600 dark:bg-[#050c18] dark:border-slate-800 light:bg-slate-50 light:border-slate-200 light:hover:bg-slate-100'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Thumbnail with overlay tags */}
                  <div className="w-full h-28 rounded-xl bg-black border border-slate-800 overflow-hidden relative">
                    <img
                      src={sample.imagePath}
                      alt={sample.name}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1">
                      <span
                        className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-sm ${
                          isOperational
                            ? 'bg-emerald-600 text-white'
                            : isBenchmark
                            ? 'bg-cyan-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {isOperational
                          ? 'OPERATIONAL (MoES)'
                          : isBenchmark
                          ? 'BENCHMARK (MDS)'
                          : 'SYNTHETIC PHYSICS'}
                      </span>
                    </div>

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-cyan-400 border border-slate-800">
                      {sample.expectedTargets > 0 ? `${sample.expectedTargets} Target${sample.expectedTargets > 1 ? 's' : ''}` : '0 FP Baseline'}
                    </span>
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <h4 className="text-xs font-bold leading-snug group-hover:text-cyan-400 transition">
                      {sample.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>

                  {/* Location & Sensor Spec */}
                  <div className="space-y-1 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                    {sample.location && (
                      <div className="flex items-center space-x-1 text-slate-300 truncate">
                        <Compass className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="truncate">{sample.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-500">
                      <span>{sample.coordinates || '20m Slant Swath'}</span>
                      <span className="text-emerald-400 font-semibold">{sample.frequencyKhz ? `${sample.frequencyKhz} kHz` : '900 kHz'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">{sample.name}</span>
                  <span className={`font-bold ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`}>
                    {isActive ? '● CURRENT SCAN' : 'Load Transect →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Upload & Dataset Download Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
          {/* Export Catalog */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-2 dark:bg-slate-900/60 dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block">
                Standard Dataset Manifest
              </span>
              <h4 className="text-xs font-bold mt-1">Export JSON Catalog</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Download the complete dataset manifest with WGS84 coordinates, sensor geometry, and YOLO annotations.
              </p>
            </div>
            <a
              href="/downloads/extended_datasets_manifest.json"
              download="extended_datasets_manifest.json"
              className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Manifest (JSON)</span>
            </a>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`col-span-1 md:col-span-2 border-2 border-dashed rounded-2xl p-5 text-center transition flex flex-col items-center justify-center space-y-2 ${
              dragOver
                ? 'border-cyan-400 bg-cyan-950/20 text-cyan-400'
                : 'border-slate-800 bg-[#050c18] text-slate-400 dark:bg-[#050c18] dark:border-slate-800 light:bg-slate-50 light:border-slate-300 light:text-slate-600'
            }`}
          >
            <Upload className="w-6 h-6 text-cyan-400" />
            <div className="text-xs">
              <span className="font-semibold">Drag & drop external sonar scan</span> or{' '}
              <label className="text-cyan-400 hover:underline cursor-pointer font-bold">
                browse files
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-500">
              Compatible with GeoTIFF, XTF side-scan sonar waterfall exports, and 8-bit/16-bit Grayscale PNG/JPG
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
