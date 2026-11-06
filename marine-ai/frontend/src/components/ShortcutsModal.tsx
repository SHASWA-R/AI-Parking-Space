import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'M', desc: 'Toggle Metric Distance Measurement Ruler' },
    { key: 'G', desc: 'Toggle Ground Truth bounding boxes comparison' },
    { key: 'P', desc: 'Cycle Acoustic Color Palettes (Amber, Phosphor, Copper, Cyan, Gray)' },
    { key: 'F', desc: 'Fit Sonar image to Canvas screen' },
    { key: '+ / -', desc: 'Zoom in / Zoom out' },
    { key: 'Space', desc: 'Pause / Resume Live AUV Cruise Scanning Sweep' },
    { key: 'Scroll Wheel', desc: 'Zoom smoothly toward cursor location' },
    { key: 'Drag Canvas', desc: 'Pan across full 2048x1024 sonar swath' },
    { key: 'Click Box', desc: 'Inspect target 5 geometric signatures & XAI reasoning' },
    { key: '?', desc: 'Open / Close this keyboard shortcuts guide' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border transition bg-[#081224] border-slate-700 text-slate-200 dark:bg-[#081224] dark:border-slate-700 dark:text-slate-200 light:bg-white light:border-slate-200 light:text-slate-800">
        <div className="flex items-center justify-between border-b pb-3 border-slate-800 dark:border-slate-800 light:border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500 border border-cyan-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Operator Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Quick tactical controls for hydrographic survey analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border transition bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-slate-700 dark:bg-slate-800 dark:border-slate-700 light:bg-slate-100 light:text-slate-600 light:border-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y text-xs divide-slate-800/80 dark:divide-slate-800/80 light:divide-slate-200">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <span>{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg border font-mono font-bold shadow-inner bg-slate-900 border-slate-700 text-cyan-400 dark:bg-slate-900 dark:border-slate-700 light:bg-slate-100 light:border-slate-300 light:text-cyan-700">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
