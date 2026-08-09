import React from 'react';
import { Cpu, Shield, RefreshCw, Activity, Layers, HardDrive, Download } from 'lucide-react';
import type { TruthEngineStats } from '../../engine/truth-engine/types';

interface HeaderProps {
  stats: TruthEngineStats;
  onRebuildIntelligence: () => void;
  onRunDoctor: () => void;
  onOpenModelManager: () => void;
  onOpenDashboard: () => void;
  onDownloadZip: () => void;
  isPrivacyMode: boolean;
  onTogglePrivacyMode: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  workspaceName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onRebuildIntelligence,
  onRunDoctor,
  onOpenModelManager,
  onOpenDashboard,
  onDownloadZip,
  isPrivacyMode,
  onTogglePrivacyMode,
  selectedModel,
  onSelectModel,
  workspaceName = 'sample-project'
}) => {
  return (
    <header className="h-12 bg-[#070a12] border-b border-slate-800/80 text-slate-200 px-4 flex items-center justify-between select-none font-sans">
      {/* Brand & Workspace */}
      <div className="flex items-center space-x-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs tracking-tight text-white">Antigravity AI IDE</span>
            <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-800/50">
              Truth Engine v1.0
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 flex items-center space-x-1">
            <span>Workspace:</span>
            <span className="font-mono text-indigo-300 font-medium">{workspaceName}</span>
          </p>
        </div>
      </div>

      {/* Sync Status Badge */}
      <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1 rounded-md border border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[11px] font-mono text-emerald-300">Synchronized</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800"></div>
        <div className="text-[11px] text-slate-400 flex items-center space-x-2 font-mono">
          <span>Files: <strong className="text-slate-200">{stats.totalFiles}</strong></span>
          <span>Symbols: <strong className="text-indigo-400">{stats.totalSymbols}</strong></span>
          <span>Stale: <strong className={stats.staleFiles > 0 ? "text-amber-400" : "text-slate-400"}>{stats.staleFiles}</strong></span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Download Workspace ZIP Button */}
        <button
          onClick={onDownloadZip}
          title="Download Workspace as ZIP Archive"
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 text-[11px] font-mono transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ZIP</span>
        </button>

        {/* Privacy Toggle */}
        <button
          onClick={onTogglePrivacyMode}
          title={isPrivacyMode ? "Privacy Mode: Local Models Only" : "Cloud Fallback Allowed"}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
            isPrivacyMode
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
              : 'bg-slate-900 text-slate-300 border-slate-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isPrivacyMode ? 'LOCAL ONLY' : 'CLOUD'}</span>
        </button>

        {/* Model Selector */}
        <select
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
          className="bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px] rounded px-2.5 py-1 font-mono focus:outline-none focus:border-indigo-500"
        >
          <option value="qwythos-max-reasoning">Qwythos: Max Reasoning (Native Local)</option>
          <option value="qwythos-1">Qwythos-1 (Flagship Local)</option>
          <option value="qwen2.5-coder:latest">Local: Qwen 2.5 Coder (MLX)</option>
          <option value="deepseek-coder-v2">Local: DeepSeek Coder V2</option>
          <option value="gpt-4o">Cloud: OpenAI GPT-4o</option>
          <option value="claude-3-5-sonnet">Cloud: Claude 3.5 Sonnet</option>
        </select>

        {/* Rebuild Intelligence /scan button */}
        <button
          onClick={onRebuildIntelligence}
          title="Rebuild Project Intelligence (/scan)"
          className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <RefreshCw className="w-3 h-3 text-indigo-400" />
          <span>/scan</span>
        </button>

        {/* Doctor button */}
        <button
          onClick={onRunDoctor}
          title="Diagnose Index Corruption (/doctor)"
          className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
        >
          <Activity className="w-3 h-3 text-purple-400" />
          <span>/doctor</span>
        </button>

        {/* Model Manager modal button */}
        <button
          onClick={onOpenModelManager}
          title="AI Model & Hardware Manager"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Cpu className="w-3.5 h-3.5" />
        </button>

        {/* Dashboard button */}
        <button
          onClick={onOpenDashboard}
          title="Project Intelligence Dashboard"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <HardDrive className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
