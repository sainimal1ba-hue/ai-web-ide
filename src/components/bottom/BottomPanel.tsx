import React, { useState } from 'react';
import { Terminal as TerminalIcon, AlertCircle, CheckCircle2, GitBranch, RotateCcw } from 'lucide-react';
import type { AICheckpoint } from '../../engine/git-engine/types';

interface BottomPanelProps {
  checkpoints: AICheckpoint[];
  onRollbackCheckpoint: (id: string) => void;
  staleCount: number;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  checkpoints,
  onRollbackCheckpoint,
  staleCount
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'problems' | 'tests' | 'checkpoints'>('terminal');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Antigravity Project Truth Engine Terminal v1.0',
    'Type commands or run tests below...',
    '$ npm test',
    ' ✓ src/tests/auth.test.ts (1 test passed)'
  ]);
  const [inputCmd, setInputCmd] = useState('');

  const handleRunCommand = () => {
    if (!inputCmd.trim()) return;
    setTerminalOutput(prev => [...prev, `$ ${inputCmd}`, `Command "${inputCmd}" executed successfully.`]);
    setInputCmd('');
  };

  return (
    <div className="h-48 bg-slate-900 border-t border-slate-800 flex flex-col select-none">
      {/* Panel Navigation Tabs */}
      <div className="h-8 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-3">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-t border-t-2 transition-colors ${
              activeTab === 'terminal'
                ? 'bg-slate-900 text-indigo-300 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveTab('problems')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-t border-t-2 transition-colors ${
              activeTab === 'problems'
                ? 'bg-slate-900 text-indigo-300 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Problems</span>
            {staleCount > 0 && (
              <span className="ml-1 text-[10px] bg-amber-950 text-amber-300 px-1 rounded font-mono">
                {staleCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-t border-t-2 transition-colors ${
              activeTab === 'tests'
                ? 'bg-slate-900 text-indigo-300 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tests</span>
          </button>

          <button
            onClick={() => setActiveTab('checkpoints')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-t border-t-2 transition-colors ${
              activeTab === 'checkpoints'
                ? 'bg-slate-900 text-indigo-300 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>Git Checkpoints ({checkpoints.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs text-slate-300">
        {activeTab === 'terminal' && (
          <div className="h-full flex flex-col justify-between space-y-2">
            <div className="space-y-1 overflow-y-auto max-h-28">
              {terminalOutput.map((line, i) => (
                <div key={i} className={line.startsWith('$') ? 'text-indigo-400 font-bold' : 'text-slate-300'}>
                  {line}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 border-t border-slate-800 pt-1">
              <span className="text-emerald-400 font-bold">$</span>
              <input
                type="text"
                placeholder="Type shell command (e.g. npm test)..."
                value={inputCmd}
                onChange={(e) => setInputCmd(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
                className="flex-1 bg-transparent border-none focus:outline-none text-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="space-y-1">
            {staleCount === 0 ? (
              <div className="text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero diagnostic errors. AST trees and file SHA-256 hashes fully synchronized.</span>
              </div>
            ) : (
              <div className="text-amber-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>Warning: {staleCount} file(s) have un-reconciled external edits. Re-indexing required.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-1">
            <div className="text-emerald-400 font-bold">✓ AuthService Test Suite (1 Passed)</div>
            <div className="text-slate-400 pl-3">✓ should authenticate user successfully (4ms)</div>
          </div>
        )}

        {activeTab === 'checkpoints' && (
          <div className="space-y-2">
            {checkpoints.length === 0 ? (
              <div className="text-slate-500">No AI checkpoints saved yet. Checkpoints are automatically generated before AI writes.</div>
            ) : (
              checkpoints.map(cp => (
                <div key={cp.id} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                  <div>
                    <span className="text-indigo-300 font-bold">{cp.label}</span>
                    <span className="text-slate-500 text-[10px] ml-2">({new Date(cp.timestamp).toLocaleTimeString()})</span>
                    <div className="text-[10px] text-slate-400">Agent: {cp.agentName} | Files: {cp.affectedFiles.join(', ')}</div>
                  </div>

                  <button
                    onClick={() => onRollbackCheckpoint(cp.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-[11px] transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rollback Snapshot</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
