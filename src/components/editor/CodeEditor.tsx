import React, { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { FileCode, Sparkles, Check, X, ShieldCheck, Columns, Code2, FolderInput, Plus, Layers, Cpu, Terminal as TerminalIcon } from 'lucide-react';
import { ASTParser } from '../../engine/truth-engine/ASTParser';
import { HashVerifier } from '../../engine/truth-engine/HashVerifier';

interface CodeEditorProps {
  filePath: string;
  content: string;
  openTabs: string[];
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
  onChangeContent: (newContent: string) => void;
  onRunInlineEdit: (instruction: string) => void;
  onOpenFolder?: () => void;
  onCreateFile?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filePath,
  content,
  openTabs,
  onSelectTab,
  onCloseTab,
  onChangeContent,
  onRunInlineEdit,
  onOpenFolder,
  onCreateFile
}) => {
  const [showCmdKModal, setShowCmdKModal] = useState(false);
  const [cmdKPrompt, setCmdKPrompt] = useState('');
  const [proposedDiff, setProposedDiff] = useState<string | null>(null);
  const [isDiffModeView, setIsDiffModeView] = useState(false);

  const language = filePath ? ASTParser.detectLanguage(filePath) : 'typescript';
  const currentHash = content ? HashVerifier.computeHashSync(content) : '';

  const handleTriggerCmdK = () => {
    if (!cmdKPrompt.trim()) return;
    onRunInlineEdit(cmdKPrompt);
    const patch = `// AI Transformation: "${cmdKPrompt}"\n${content}`;
    setProposedDiff(patch);
    setIsDiffModeView(true);
  };

  const handleAcceptDiff = () => {
    if (proposedDiff) {
      onChangeContent(proposedDiff);
      setProposedDiff(null);
      setShowCmdKModal(false);
      setCmdKPrompt('');
      setIsDiffModeView(false);
    }
  };

  const handleRejectDiff = () => {
    setProposedDiff(null);
    setIsDiffModeView(false);
  };

  // Render Splash Welcome Screen when no file/workspace is active
  if (!filePath || content === undefined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#070a12] text-slate-300 p-8 select-none font-sans">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30">
            <Layers className="w-9 h-9 text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Antigravity AI IDE</h1>
            <p className="text-xs text-slate-400 mt-1">
              Project Truth Engine Grounded AI Development Environment
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={onOpenFolder}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
            >
              <FolderInput className="w-4 h-4" />
              <span>Open Local Folder</span>
            </button>

            <button
              onClick={onCreateFile}
              className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New File</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono text-left bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span><strong className="text-slate-200">Cmd+K</strong> AI Inline Edit</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span><strong className="text-slate-200">Qwythos-1</strong> Local Inference</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span><strong className="text-slate-200">SHA-256</strong> Truth Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span><strong className="text-slate-200">Git</strong> Push & Commit</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden font-sans">
      {/* VS Code / Cursor Style Tab Bar */}
      <div className="h-9 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-2 select-none">
        {/* Tab List */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-[70%]">
          {openTabs.map((tabPath) => {
            const isActive = tabPath === filePath;
            const tabName = tabPath.split('/').pop() || tabPath;
            return (
              <div
                key={tabPath}
                onClick={() => onSelectTab(tabPath)}
                className={`group flex items-center space-x-2 px-3 py-1 text-xs font-mono rounded-t cursor-pointer border-t-2 transition-all ${
                  isActive
                    ? 'bg-slate-950 text-indigo-300 border-indigo-500 font-semibold'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="truncate max-w-[120px]">{tabName}</span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tabPath);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2 text-xs">
          {/* Toggle Live Side-by-Side Diff View */}
          <button
            onClick={() => setIsDiffModeView(!isDiffModeView)}
            title={isDiffModeView ? 'Switch to Normal Code Editor' : 'Switch to Live Side-by-Side Diff View'}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              isDiffModeView
                ? 'bg-purple-950 text-purple-300 border-purple-800'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            {isDiffModeView ? <Code2 className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
            <span>{isDiffModeView ? 'Normal View' : 'Split Diff'}</span>
          </button>

          {/* Cmd+K Inline Edit */}
          <button
            onClick={() => setShowCmdKModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-[11px] shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cmd+K Edit</span>
          </button>

          {/* Hash Integrity Badge */}
          <div className="flex items-center space-x-1 text-slate-500 font-mono text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Hash: <strong className="text-slate-300">{currentHash.slice(0, 8)}</strong></span>
          </div>
        </div>
      </div>

      {/* Floating Cmd+K Modal Overlay */}
      {showCmdKModal && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 w-[520px] bg-slate-900 border border-indigo-500/50 rounded-xl shadow-2xl p-3.5 space-y-2.5 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Real-Time Code Transformation (Cmd+K)</span>
            </div>
            <button onClick={() => setShowCmdKModal(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="e.g. Refactor function to use async/await with try-catch block..."
            value={cmdKPrompt}
            onChange={(e) => setCmdKPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTriggerCmdK()}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
            autoFocus
          />

          <div className="flex justify-end space-x-2 text-xs">
            <button
              onClick={() => setShowCmdKModal(false)}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleTriggerCmdK}
              className="px-3.5 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500"
            >
              Generate Live Diff
            </button>
          </div>
        </div>
      )}

      {/* Proposed Diff Acceptance Banner */}
      {proposedDiff && (
        <div className="bg-indigo-950/95 border-b border-indigo-500/50 px-4 py-2 flex items-center justify-between text-xs text-indigo-200 z-30 shadow-md">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>AI Proposed Code Changes. Review live side-by-side diff before accepting into Project Truth.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAcceptDiff}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Patch</span>
            </button>
            <button
              onClick={handleRejectDiff}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-800/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Code View or Real-time Side-by-Side Diff View */}
      <div className="flex-1 w-full h-full">
        {isDiffModeView || proposedDiff ? (
          <DiffEditor
            height="100%"
            language={language === 'qwythos' ? 'python' : language === 'typescript' ? 'typescript' : 'javascript'}
            theme="vs-dark"
            original={content}
            modified={proposedDiff || content}
            options={{
              fontSize: 13,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
              minimap: { enabled: false },
              automaticLayout: true,
              renderSideBySide: true,
              readOnly: false
            }}
          />
        ) : (
          <Editor
            height="100%"
            language={language === 'qwythos' ? 'python' : language === 'typescript' ? 'typescript' : 'javascript'}
            theme="vs-dark"
            value={content}
            onChange={(val) => {
              if (val !== undefined) {
                onChangeContent(val);
              }
            }}
            options={{
              fontSize: 13,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth'
            }}
          />
        )}
      </div>
    </div>
  );
};
