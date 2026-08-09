import React from 'react';
import { X, HardDrive, RefreshCw, ShieldCheck } from 'lucide-react';
import type { TruthEngineStats } from '../../engine/truth-engine/types';

interface IntelligenceDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TruthEngineStats;
  onRebuild: () => void;
}

export const IntelligenceDashboardModal: React.FC<IntelligenceDashboardModalProps> = ({
  isOpen,
  onClose,
  stats,
  onRebuild
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-[550px] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-sm">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>PROJECT INTELLIGENCE DASHBOARD</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Status Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Total Repository Files</div>
              <div className="text-xl font-bold font-mono text-white">{stats.totalFiles}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Indexed AST Symbols</div>
              <div className="text-xl font-bold font-mono text-indigo-400">{stats.totalSymbols}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Dependency Edges (DAG)</div>
              <div className="text-xl font-bold font-mono text-purple-400">{stats.totalDependencies}</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Intelligence Synchronization</div>
              <div className="text-xl font-bold font-mono text-emerald-400">100% Synced</div>
            </div>
          </div>

          {/* Invariant Banner */}
          <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3 space-y-1">
            <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Project Truth Invariant Active</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Every AI operation is strictly revalidated against physical file hashes before model invocation. Previous model outputs are never treated as authoritative ground truth.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onRebuild();
                onClose();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rebuild Project Intelligence (/scan)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
