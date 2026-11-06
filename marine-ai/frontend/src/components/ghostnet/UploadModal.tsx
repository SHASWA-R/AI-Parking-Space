import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Cpu, Layers, MapPin, ShieldCheck, Eye } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOnMap?: (lat: number, lon: number) => void;
}

type StepPhase = 'upload' | 'processing' | 'results';

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onViewOnMap,
}) => {
  const [phase, setPhase] = useState<StepPhase>('upload');
  const [fileSelected, setFileSelected] = useState<{
    name: string;
    sizeMb: number;
    format: string;
  } | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [verifiedMap, setVerifiedMap] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing pipeline steps
  const pipelineSteps = [
    'SONAR DATA',
    'PREPROCESSING',
    'AI DETECTION',
    'CONFIDENCE ANALYSIS',
    'LOCATION EXTRACTION',
    'RESULT',
  ];

  // Detection Results Data
  const resultsData = [
    {
      id: 'DETECTION #01',
      type: 'Ghost Net (Synthetic Monofilament)',
      confidence: 96.4,
      risk: 'HIGH',
      lat: '10.1234° N',
      lon: '76.5678° E',
      latNum: 10.1234,
      lonNum: 76.5678,
      sizeM: '14.2 m',
      status: 'AI DETECTED',
      box: { x: 35, y: 28, w: 28, h: 42 },
    },
    {
      id: 'DETECTION #02',
      type: 'Trawl Net Webbing & Groundgear',
      confidence: 93.1,
      risk: 'HIGH',
      lat: '10.1289° N',
      lon: '76.5712° E',
      latNum: 10.1289,
      lonNum: 76.5712,
      sizeM: '21.5 m',
      status: 'AI DETECTED',
      box: { x: 62, y: 40, w: 24, h: 32 },
    },
    {
      id: 'DETECTION #03',
      type: 'Sunken Trap Ropes Bundle',
      confidence: 88.7,
      risk: 'MEDIUM',
      lat: '10.1190° N',
      lon: '76.5620° E',
      latNum: 10.119,
      lonNum: 76.562,
      sizeM: '9.0 m',
      status: 'AI DETECTED',
      box: { x: 20, y: 55, w: 18, h: 22 },
    },
    {
      id: 'DETECTION #04',
      type: 'Degraded Gillnet Fragment',
      confidence: 86.6,
      risk: 'MEDIUM',
      lat: '10.1340° N',
      lon: '76.5790° E',
      latNum: 10.134,
      lonNum: 76.579,
      sizeM: '7.8 m',
      status: 'AI DETECTED',
      box: { x: 74, y: 22, w: 16, h: 20 },
    },
  ];

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('upload');
      setFileSelected({
        name: 'transect_survey_alpha_455khz.xtf',
        sizeMb: 124,
        format: '.XTF (eXtended Triton Format)',
      });
      setProgress(0);
      setCurrentStepIndex(0);
      setVerifiedMap({});
    }
  }, [isOpen]);

  // Simulated AI Processing Stepper
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (phase === 'processing') {
      let currentProg = 0;
      timer = setInterval(() => {
        currentProg += 2;
        if (currentProg > 100) {
          currentProg = 100;
          clearInterval(timer);
          setTimeout(() => {
            setPhase('results');
          }, 600);
        }
        setProgress(currentProg);

        // Step transition based on progress
        const stepIdx = Math.min(
          Math.floor((currentProg / 100) * pipelineSteps.length),
          pipelineSteps.length - 1
        );
        setCurrentStepIndex(stepIdx);
      }, 60);
    }
    return () => clearInterval(timer);
  }, [phase]);

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    setPhase('processing');
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      setFileSelected({
        name: f.name,
        sizeMb: Math.round(f.size / (1024 * 1024)) || 124,
        format: f.name.endsWith('.xtf') ? '.XTF' : 'Sonar Feed',
      });
    }
  };

  const activeResult = resultsData[selectedResultIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-neutral-950 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-300">
              SEATRACE · AI INGESTION ENGINE
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================
            PHASE 1: UPLOAD SONAR DATA (Prompt Section 10)
           ======================================================== */}
        {phase === 'upload' && (
          <div className="p-8 sm:p-12 flex flex-col justify-between overflow-y-auto">
            <div className="max-w-2xl mb-8">
              <div className="text-xs font-mono text-[#00ff88] uppercase tracking-widest mb-2">
                STEP 01 / 03
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white">
                UPLOAD <br />
                SONAR DATA.
              </h2>
              <p className="text-sm text-neutral-400 mt-2 font-light">
                Drop your raw eXtended Triton Format (.XTF) side-scan sonar recording or load our pre-calibrated sea survey transects.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-10 sm:p-14 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
                dragActive
                  ? 'border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_30px_rgba(0,255,136,0.15)]'
                  : 'border-white/15 bg-black/40 hover:border-white/40 hover:bg-white/[0.02]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xtf,.png,.jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setFileSelected({
                      name: f.name,
                      sizeMb: Math.round(f.size / (1024 * 1024)) || 124,
                      format: '.XTF',
                    });
                  }
                }}
              />

              <div className="w-16 h-16 rounded-full border border-white/20 bg-white/5 flex items-center justify-center mb-6 text-[#00ff88]">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Drop your sonar file here
              </h3>
              <p className="text-xs text-neutral-400 font-mono mb-4">
                SUPPORTED FORMAT: <span className="text-white font-bold">.XTF</span> · MAXIMUM SIZE: <span className="text-white font-bold">500 MB</span>
              </p>

              <button
                type="button"
                className="px-6 py-2 rounded-full border border-white/30 text-xs font-mono uppercase tracking-wider text-white hover:border-white hover:bg-white/5 transition-colors"
              >
                Browse Files
              </button>
            </div>

            {/* Uploaded File Card State (Prompt Specification) */}
            {fileSelected && (
              <div className="mt-8 p-6 rounded-xl border border-white/10 bg-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-[#00ff88]">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-[#00ff88] uppercase tracking-wider">
                      FILE UPLOADED
                    </div>
                    <div className="text-sm font-bold text-white font-mono">
                      {fileSelected.name}
                    </div>
                    <div className="text-xs text-neutral-500 font-mono mt-0.5">
                      Size: {fileSelected.sizeMb} MB · Status: <span className="text-neutral-300">Ready for AI Analysis</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartAnalysis}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-[#00ff88] text-black font-extrabold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,136,0.4)] cursor-pointer"
                >
                  START AI ANALYSIS
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            PHASE 2: AI PROCESSING SCREEN (Prompt Section 11)
           ======================================================== */}
        {phase === 'processing' && (
          <div className="p-8 sm:p-14 flex flex-col justify-between overflow-y-auto my-auto text-center">
            <div className="max-w-xl mx-auto mb-10">
              <div className="text-xs font-mono text-[#00ff88] uppercase tracking-widest mb-2">
                DEEP LEARNING PASS
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white">
                ANALYZING <br />
                THE SEABED.
              </h2>
              <p className="text-sm text-neutral-400 mt-2 font-light">
                Filtering seabed reverberation, computing acoustic shadow offsets, and validating monofilament mesh geometry.
              </p>
            </div>

            {/* Stepper Pipeline (Prompt Specification) */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto mb-12">
              {pipelineSteps.map((step, idx) => {
                const isPast = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <React.Fragment key={step}>
                    <div
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider transition-all ${
                        isCurrent
                          ? 'bg-[#00ff88] text-black font-bold shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                          : isPast
                          ? 'border border-[#00ff88]/40 text-[#00ff88] bg-[#00ff88]/5'
                          : 'border border-white/10 text-neutral-600'
                      }`}
                    >
                      {step}
                    </div>
                    {idx < pipelineSteps.length - 1 && (
                      <span className="text-neutral-600 font-mono text-xs">→</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Sonar Scan Radar Graphic + Progress Indicator */}
            <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
              {/* Outer Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-4 rounded-full border border-white/15" />
              <div className="absolute inset-8 rounded-full border border-[#00ff88]/30" />

              {/* Sweeping Beam */}
              <div className="absolute inset-0 rounded-full border border-[#00ff88]/60 animate-radar" />

              {/* Progress Percentage in Center */}
              <div className="flex flex-col items-center z-10">
                <span className="text-4xl font-black font-mono text-white">
                  {progress}%
                </span>
                <span className="text-[9px] font-mono text-[#00ff88] uppercase tracking-widest mt-1">
                  SECTOR SWEEP
                </span>
              </div>
            </div>

            {/* Live Counter Display (Prompt Specification) */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 rounded-xl border border-white/10 bg-black">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">
                  DETECTED OBJECTS
                </div>
                <div className="text-3xl font-black text-white font-mono mt-1">
                  12
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#00ff88]/30 bg-[#00ff88]/5">
                <div className="text-[10px] font-mono text-[#00ff88] uppercase">
                  POTENTIAL GHOST NETS
                </div>
                <div className="text-3xl font-black text-[#00ff88] font-mono mt-1">
                  4
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PHASE 3: RESULTS PAGE (Prompt Section 12)
           ======================================================== */}
        {phase === 'results' && (
          <div className="p-6 sm:p-10 flex flex-col justify-between overflow-y-auto">
            {/* Header & Stats Strip */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10 mb-8">
              <div>
                <div className="text-xs font-mono text-[#00ff88] uppercase tracking-widest mb-1">
                  ANALYSIS COMPLETE
                </div>
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                  DETECTIONS FOUND.
                </h2>
              </div>

              {/* 4 Result Metrics (Prompt Specification: 12, 4, 3, 91.2%) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-lg bg-black border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">TOTAL OBJECTS</div>
                  <div className="text-xl font-bold font-mono text-white">12</div>
                </div>
                <div className="p-3 rounded-lg bg-black border border-[#00ff88]/40">
                  <div className="text-[9px] font-mono text-[#00ff88] uppercase">POTENTIAL NETS</div>
                  <div className="text-xl font-bold font-mono text-[#00ff88]">4</div>
                </div>
                <div className="p-3 rounded-lg bg-black border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">HIGH CONFIDENCE</div>
                  <div className="text-xl font-bold font-mono text-white">3</div>
                </div>
                <div className="p-3 rounded-lg bg-black border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-500 uppercase">AVG CONFIDENCE</div>
                  <div className="text-xl font-bold font-mono text-neutral-200">91.2%</div>
                </div>
              </div>
            </div>

            {/* Main Result Split: Sonar Annotated Image + Detection Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
              {/* Sonar Annotated Canvas (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-black min-h-[380px] relative overflow-hidden flex items-center justify-center">
                <img
                  src="/samples/sim_00000.png"
                  alt="AI Sonar Detection"
                  className="w-full h-full object-cover filter contrast-125 brightness-90 mix-blend-luminosity opacity-85"
                />

                {/* Animated Bounding Box on Selected Target */}
                <div
                  className="absolute border-2 border-[#00ff88] bg-[#00ff88]/20 shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all duration-300"
                  style={{
                    left: `${activeResult.box.x}%`,
                    top: `${activeResult.box.y}%`,
                    width: `${activeResult.box.w}%`,
                    height: `${activeResult.box.h}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-black border border-[#00ff88] px-2 py-0.5 rounded text-[9px] font-mono text-[#00ff88] whitespace-nowrap">
                    {activeResult.id} · {activeResult.confidence}%
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 text-[10px] font-mono text-neutral-400 bg-black/80 px-3 py-1 rounded">
                  SCANNER: 455 kHz DUAL CHANNEL · LAT {activeResult.lat}
                </div>
              </div>

              {/* Detection Inspector (5 cols) */}
              <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-black flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-[#00ff88]">
                      {activeResult.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                      {activeResult.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">
                    {activeResult.type}
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-neutral-900 border border-white/5 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase">CONFIDENCE</span>
                      <span className="text-lg font-bold font-mono text-[#00ff88]">{activeResult.confidence}%</span>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900 border border-white/5 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase">RISK LEVEL</span>
                      <span className="text-sm font-bold font-mono text-[#ec4899]">{activeResult.risk}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900 border border-white/5 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase">ESTIMATED SIZE</span>
                      <span className="text-sm font-bold font-mono text-white">{activeResult.sizeM}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900 border border-white/5 flex justify-between items-center">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase">COORDINATES</span>
                      <span className="text-xs font-bold font-mono text-white">{activeResult.lat}, {activeResult.lon}</span>
                    </div>
                  </div>
                </div>

                {/* Target Switcher & Action Buttons */}
                <div className="pt-6 space-y-3">
                  <div className="flex gap-2">
                    {resultsData.map((res, idx) => (
                      <button
                        key={res.id}
                        onClick={() => setSelectedResultIndex(idx)}
                        className={`flex-1 py-1.5 rounded text-[11px] font-mono transition-colors ${
                          selectedResultIndex === idx
                            ? 'bg-[#00ff88] text-black font-bold'
                            : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        #{idx + 1}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setVerifiedMap((prev) => ({ ...prev, [selectedResultIndex]: true }));
                      }}
                      className="flex-1 py-2.5 rounded-full bg-white hover:bg-[#00ff88] text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{verifiedMap[selectedResultIndex] ? 'Verified' : 'Mark as Verified'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        if (onViewOnMap) {
                          onViewOnMap(activeResult.latNum, activeResult.lonNum);
                        }
                      }}
                      className="px-4 py-2.5 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#00ff88]" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setPhase('upload')}
                className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Another Transect</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-full border border-white/20 text-xs font-mono text-white hover:bg-white/5 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadModal;
