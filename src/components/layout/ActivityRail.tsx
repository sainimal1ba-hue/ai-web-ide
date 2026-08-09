import React from 'react';
import { Files, Search, GitBranch, Bot, Settings, SlidersHorizontal } from 'lucide-react';

interface ActivityRailProps {
  activeView: 'explorer' | 'search' | 'git' | 'ai' | 'settings';
  onSelectView: (view: 'explorer' | 'search' | 'git' | 'ai' | 'settings') => void;
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  activeView,
  onSelectView
}) => {
  return (
    <aside className="w-12 bg-[#07080c] border-r border-[#1c1e2a] flex flex-col justify-between items-center py-3 select-none z-20">
      {/* Top Activity Icons */}
      <div className="flex flex-col space-y-3 items-center w-full">
        {/* Explorer Icon */}
        <button
          onClick={() => onSelectView('explorer')}
          title="Explorer (Cmd+Shift+E)"
          className={`p-2 rounded-lg transition-all relative ${
            activeView === 'explorer'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
          }`}
        >
          <Files className="w-5 h-5" />
          {activeView === 'explorer' && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        {/* Global Search Icon */}
        <button
          onClick={() => onSelectView('search')}
          title="Search (Cmd+Shift+F)"
          className={`p-2 rounded-lg transition-all relative ${
            activeView === 'search'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
          }`}
        >
          <Search className="w-5 h-5" />
          {activeView === 'search' && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        {/* Git Source Control Icon */}
        <button
          onClick={() => onSelectView('git')}
          title="Source Control (Cmd+Shift+G)"
          className={`p-2 rounded-lg transition-all relative ${
            activeView === 'git'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
          }`}
        >
          <GitBranch className="w-5 h-5" />
          {activeView === 'git' && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>

        {/* AI Agent Composer Icon */}
        <button
          onClick={() => onSelectView('ai')}
          title="Antigravity AI Agent (Cmd+I)"
          className={`p-2 rounded-lg transition-all relative ${
            activeView === 'ai'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
          }`}
        >
          <Bot className="w-5 h-5" />
          {activeView === 'ai' && (
            <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 rounded-r" />
          )}
        </button>
      </div>

      {/* Bottom Activity Icons */}
      <div className="flex flex-col space-y-3 items-center w-full">
        <button
          onClick={() => onSelectView('settings')}
          title="Settings & Models"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectView('settings')}
          title="Preferences"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
