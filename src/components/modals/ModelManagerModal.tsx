import React, { useState } from 'react';
import { X, Cpu, Download, Search, HardDrive } from 'lucide-react';
import { HFIntegrator } from '../../engine/model-router/HFIntegrator';

interface ModelManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelManagerModal: React.FC<ModelManagerModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const hardware = HFIntegrator.evaluateHardwareSuitability(16);
  const models = HFIntegrator.searchModels(searchQuery);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-[650px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-sm">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>AI Model & Apple Silicon Infrastructure Manager</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Hardware Advisor */}
          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-lg p-3 space-y-1">
            <div className="flex items-center space-x-2 text-indigo-300 font-medium">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              <span>{hardware.chipEstimate} Profiler</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div>Available Unified RAM: <strong className="text-emerald-400">{hardware.availableMemoryGb} GB</strong></div>
              <div>Recommended Quantization: <strong className="text-indigo-300">Q4_K_M</strong></div>
              <div>Top Feasible Local Model: <strong className="text-purple-300">{hardware.recommendedModel}</strong></div>
              <div>Max Supported Model Size: <strong className="text-slate-200">{hardware.maxSupportedModelSizeGb} GB</strong></div>
            </div>
          </div>

          {/* Search Hugging Face */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Hugging Face Model Registry Integration</div>
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search Hugging Face models (e.g. Qwen2.5-Coder, DeepSeek)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Model List */}
          <div className="space-y-2">
            {models.map((m) => (
              <div key={m.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-indigo-300 flex items-center space-x-2">
                    <span>{m.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {m.recommendedQuant}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Org: {m.org} | Size: {m.sizeGb} GB | Min RAM: {m.minRamGb} GB
                  </div>
                </div>

                <button
                  onClick={() => alert(`Starting local download of ${m.name} into MLX runtime...`)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pull Model</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
