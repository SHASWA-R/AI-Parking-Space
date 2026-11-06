import React from 'react';
import { AnalysisResult } from '../types/sonar';
import { X, Printer, Download, ShieldCheck, Waves } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, analysis }) => {
  if (!isOpen || !analysis) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto print:p-0 print:m-0 print:max-h-none print:shadow-none print:border-none">
        {/* Top Controls (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3 print:hidden">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Official Survey Debrief & Download Center
            </span>
            <span className="text-[11px] text-slate-400">
              Download complete project specifications in PDF or DOCX format
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Proposed Solution Downloads */}
            <div className="flex items-center space-x-1 bg-emerald-50 p-1 rounded-lg border border-emerald-300">
              <span className="text-[10px] font-mono font-bold text-emerald-800 px-1.5 uppercase">Solution:</span>
              <a
                href="/downloads/Marine_AI_Proposed_Solution_Report.pdf"
                download="Marine_AI_Proposed_Solution_Report.pdf"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition shadow-sm"
                title="Download Proposed Solution Report (PDF)"
              >
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </a>
              <a
                href="/downloads/Marine_AI_Proposed_Solution_Report.docx"
                download="Marine_AI_Proposed_Solution_Report.docx"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-sm"
                title="Download Proposed Solution Report (DOCX)"
              >
                <Download className="w-3 h-3" />
                <span>DOCX</span>
              </a>
            </div>

            {/* Tech Stack Downloads */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-600 px-1.5 uppercase">Tech Stack:</span>
              <a
                href="/downloads/Marine_AI_TechStack_Report.pdf"
                download="Marine_AI_TechStack_Report.pdf"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition shadow-sm"
                title="Download Tech Stack Report (PDF)"
              >
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </a>
              <a
                href="/downloads/Marine_AI_TechStack_Report.docx"
                download="Marine_AI_TechStack_Report.docx"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-sm"
                title="Download Tech Stack Report (DOCX)"
              >
                <Download className="w-3 h-3" />
                <span>DOCX</span>
              </a>
            </div>

            {/* Project Report Downloads */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[10px] font-mono font-bold text-slate-600 px-1.5 uppercase">Project:</span>
              <a
                href="/downloads/Marine_AI_Project_Report.pdf"
                download="Marine_AI_Project_Report.pdf"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition shadow-sm"
                title="Download Project Report (PDF)"
              >
                <Download className="w-3 h-3" />
                <span>PDF</span>
              </a>
              <a
                href="/downloads/Marine_AI_Project_Report.docx"
                download="Marine_AI_Project_Report.docx"
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-sm"
                title="Download Project Report (DOCX)"
              >
                <Download className="w-3 h-3" />
                <span>DOCX</span>
              </a>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Center Banners (Hidden when printing) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
          {/* Card 1: Proposed Solution */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-200/80 px-2 py-0.5 rounded">
                  PROPOSED SOLUTION
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">MoES / SIH</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                Unique Proposed Solution Report
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Competitive matrix vs other apps, 5-channel regularity physics, multi-class debris scope, and 0% rock false alarm engine.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <a
                href="/downloads/Marine_AI_Proposed_Solution_Report.pdf"
                download="Marine_AI_Proposed_Solution_Report.pdf"
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF (5.1 KB)</span>
              </a>
              <a
                href="/downloads/Marine_AI_Proposed_Solution_Report.docx"
                download="Marine_AI_Proposed_Solution_Report.docx"
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOCX (38.5 KB)</span>
              </a>
            </div>
          </div>

          {/* Card 2: Tech Stack */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-700 uppercase bg-cyan-100 px-2 py-0.5 rounded">
                  TECH STACK
                </span>
                <span className="text-[10px] font-mono text-slate-500">v1.0 (MoES/SIH)</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                Technology Stack Architecture
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                React 18, Spring Boot 3 (Java 21), Python forward simulator, OpenCV C++ bindings, and latency profiles.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <a
                href="/downloads/Marine_AI_TechStack_Report.pdf"
                download="Marine_AI_TechStack_Report.pdf"
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF (4.3 KB)</span>
              </a>
              <a
                href="/downloads/Marine_AI_TechStack_Report.docx"
                download="Marine_AI_TechStack_Report.docx"
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOCX (37.7 KB)</span>
              </a>
            </div>
          </div>

          {/* Card 3: Project Progress */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  PROJECT SPEC
                </span>
                <span className="text-[10px] font-mono text-slate-500">SIH 2026</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1">
                Comprehensive Progress Report
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Problem statement, ghost net detection physics, 5 geometric regularity signatures, and system roadmap.
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <a
                href="/downloads/Marine_AI_Project_Report.pdf"
                download="Marine_AI_Project_Report.pdf"
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF (6.4 KB)</span>
              </a>
              <a
                href="/downloads/Marine_AI_Project_Report.docx"
                download="Marine_AI_Project_Report.docx"
                className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOCX (38.5 KB)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Official Report Header */}
        <div className="border-b-2 border-slate-900 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Waves className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  ACOUSTIC MARINE DEBRIS INSPECTION CERTIFICATE
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  Ministry of Earth Sciences · Smart India Hackathon (SIH 2026)
                </p>
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <span className="block font-bold text-slate-900">REF: {analysis.analysisId}</span>
              <span>{new Date(analysis.createdAt).toLocaleDateString()} · {new Date(analysis.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Survey & Telemetry Summary */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Transect File</span>
            <span className="font-mono font-bold text-slate-900 truncate block">{analysis.sourceImage}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Identified Targets</span>
            <span className="font-mono font-bold text-emerald-600 text-sm">{analysis.detections.length} Anthropogenic</span>
          </div>
          <div>
            <span className="text-slate-500 block">Natural Rejections</span>
            <span className="font-mono font-bold text-amber-600 text-sm">{analysis.filteredOut} Features</span>
          </div>
          <div>
            <span className="text-slate-500 block">Survey Geometry</span>
            <span className="font-mono text-slate-900">H: 3.5m · R_max: 20m (2cm/px)</span>
          </div>
        </div>

        {/* Targets Catalog Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Confirmed Anthropogenic Debris Manifest
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-2.5">ID</th>
                <th className="p-2.5">Debris Classification</th>
                <th className="p-2.5">Acoustic Signature</th>
                <th className="p-2.5">Metric Dimensions</th>
                <th className="p-2.5">Confidence</th>
                <th className="p-2.5">Entanglement Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {analysis.detections.map(det => (
                <tr key={det.id}>
                  <td className="p-2.5 font-mono font-bold">{det.id}</td>
                  <td className="p-2.5 font-medium">
                    {det.className}
                    {det.inferredGearType && (
                      <span className="block text-[10px] text-slate-500 font-mono">
                        Type: {det.inferredGearType}
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 capitalize font-mono text-slate-600">{det.signature}</td>
                  <td className="p-2.5 font-mono">
                    {det.meshPitchCm ? (
                      <strong>{det.meshPitchCm.toFixed(1)} cm mesh pitch</strong>
                    ) : det.estimatedLengthM ? (
                      <span>{det.estimatedLengthM.toFixed(1)}m length</span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="p-2.5 font-mono font-bold">{(det.confidence * 100).toFixed(0)}%</td>
                  <td className="p-2.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        det.risk === 'CRITICAL'
                          ? 'bg-red-100 text-red-700'
                          : det.risk === 'HIGH'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {det.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Environmental Assessment & Recommendations */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs leading-relaxed">
          <h4 className="font-bold text-slate-900 uppercase">
            MoES Environmental Hazard & Salvage Directive
          </h4>
          <p className="text-slate-700">
            Detected abandoned, lost, or otherwise discarded fishing gear (ALDFG) poses severe ongoing mortality risks to benthic marine life, commercial finfish stocks, and sea turtles via ghost fishing. 
            Targets classified with <strong>CRITICAL</strong> entanglement hazard should be scheduled for prioritized ROV grapple retrieval or diver intervention within the upcoming survey cycle.
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-200">
            <span>Algorithm: Geometric Regularity v1.0 (MoES/SIH-2026)</span>
            <span>Authentication: AUTOMATED_VALIDATED</span>
          </div>
        </div>

        {/* Signature Box */}
        <div className="pt-4 flex justify-between items-end text-xs text-slate-500 border-t border-slate-200">
          <div>
            <span>Survey Vessel / Autonomous Underwater Vehicle:</span>
            <span className="block font-bold text-slate-800">AUV Sagar Nidhi / Hydrographic Unit #4</span>
          </div>
          <div className="text-right">
            <div className="w-40 border-b border-slate-400 mb-1" />
            <span>Chief Hydrographer / AI Signature Analyst</span>
          </div>
        </div>
      </div>
    </div>
  );
};
