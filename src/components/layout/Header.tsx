import React from 'react';
import { Shield, RefreshCw, Activity, Layers, Download, Search, ChevronDown, Check, Cpu } from 'lucide-react';
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
  onDownloadZip,
  isPrivacyMode,
  onTogglePrivacyMode,
  selectedModel,
  onSelectModel,
  workspaceName = 'No Folder Opened'
}) => {
  return (
    <header className="h-9 bg-[#0c0d12] border-b border-[#1c1e2a] text-slate-200 px-3 flex items-center justify-between select-none font-sans text-xs">
      {/* Left Window Control & Workspace Title */}
      <div className="flex items-center space-x-3">
        {/* macOS Window Controls */}
        <div className="flex items-center space-x-1.5 pr-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 inline-block" />
        </div>

        {/* Brand & Workspace Title */}
        <div className="flex items-center space-x-2 text-slate-300">
          <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-slate-100 text-[11.5px]">Antigravity</span>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-indigo-300 text-[11px] font-medium">{workspaceName}</span>
        </div>
      </div>

      {/* Center: Command Palette & Model Selector Pill */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 bg-[#06070a] border border-[#1c1e2a] hover:border-indigo-500/50 rounded-md px-3 py-1 text-[11px] font-mono text-slate-300 cursor-pointer shadow-inner transition-colors">
          <Search className="w-3 h-3 text-indigo-400" />
          <span>Search or type command (Cmd+P)</span>
          <span className="text-slate-600">|</span>
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            className="bg-transparent border-none text-indigo-300 font-mono text-[11px] focus:outline-none cursor-pointer"
          >
            <option value="qwythos-max-reasoning" className="bg-slate-900 text-slate-200">Qwythos: Max Reasoning</option>
            <option value="qwythos-1" className="bg-slate-900 text-slate-200">Qwythos-1 (Flagship)</option>
            <option value="qwen2.5-coder:latest" className="bg-slate-900 text-slate-200">Qwen 2.5 Coder (MLX)</option>
            <option value="deepseek-coder-v2" className="bg-slate-900 text-slate-200">DeepSeek Coder V2</option>
            <option value="gpt-4o" className="bg-slate-900 text-slate-200">OpenAI GPT-4o</option>
            <option value="claude-3-5-sonnet" className="bg-slate-900 text-slate-200">Claude 3.5 Sonnet</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>

      {/* Right Tools & Status Indicators */}
      <div className="flex items-center space-x-2">
        {/* Sync Indicator */}
        <div className="flex items-center space-x-1.5 text-[10.5px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          <Check className="w-3 h-3" />
          <span>Synchronized ({stats.totalFiles} files)</span>
        </div>

        {/* Download ZIP */}
        <button
          onClick={onDownloadZip}
          title="Download Workspace ZIP Archive"
          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#1c1e2a] text-[10.5px] font-mono transition-colors"
        >
          <Download className="w-3 h-3 text-indigo-400" />
          <span>ZIP</span>
        </button>

        {/* Privacy Toggle */}
        <button
          onClick={onTogglePrivacyMode}
          title={isPrivacyMode ? "Privacy Mode: Local Models Only" : "Cloud Fallback Allowed"}
          className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10.5px] font-mono border transition-all ${
            isPrivacyMode
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
              : 'bg-slate-900 text-slate-300 border-slate-700'
          }`}
        >
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>{isPrivacyMode ? 'LOCAL' : 'CLOUD'}</span>
        </button>

        {/* Rebuild Intelligence /scan */}
        <button
          onClick={onRebuildIntelligence}
          title="Rebuild Project Intelligence (/scan)"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Index Doctor /doctor */}
        <button
          onClick={onRunDoctor}
          title="Diagnose Index Corruption (/doctor)"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>

        {/* Model Manager modal button */}
        <button
          onClick={onOpenModelManager}
          title="AI Model & Hardware Manager"
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Cpu className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
