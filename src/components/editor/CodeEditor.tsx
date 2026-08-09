import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode, Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { ASTParser } from '../../engine/truth-engine/ASTParser';
import { HashVerifier } from '../../engine/truth-engine/HashVerifier';

interface CodeEditorProps {
  filePath: string;
  content: string;
  onChangeContent: (newContent: string) => void;
  onRunInlineEdit: (instruction: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  filePath,
  content,
  onChangeContent,
  onRunInlineEdit
}) => {
  const [showCmdKModal, setShowCmdKModal] = useState(false);
  const [cmdKPrompt, setCmdKPrompt] = useState('');
  const [proposedDiff, setProposedDiff] = useState<string | null>(null);

  const language = ASTParser.detectLanguage(filePath);
  const currentHash = HashVerifier.computeHashSync(content);

  const handleTriggerCmdK = () => {
    if (!cmdKPrompt.trim()) return;
    onRunInlineEdit(cmdKPrompt);
    const patch = `// Cmd+K Edit Applied: "${cmdKPrompt}"\n${content}`;
    setProposedDiff(patch);
  };

  const handleAcceptDiff = () => {
    if (proposedDiff) {
      onChangeContent(proposedDiff);
      setProposedDiff(null);
      setShowCmdKModal(false);
      setCmdKPrompt('');
    }
  };

  const handleRejectDiff = () => {
    setProposedDiff(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Editor Header & Tab Bar */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border-t-2 border-indigo-500 text-xs font-mono text-slate-200">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>{filePath}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setShowCmdKModal(true)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Cmd+K Edit</span>
          </button>

          <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hash: <strong className="text-slate-200">{currentHash.slice(0, 8)}</strong></span>
          </div>
        </div>
      </div>

      {/* Cmd+K Modal Floating Overlay */}
      {showCmdKModal && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 w-[500px] bg-slate-900 border border-indigo-500/40 rounded-xl shadow-2xl p-3 space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Inline Transformation (Cmd+K)</span>
            </div>
            <button onClick={() => setShowCmdKModal(false)} className="text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="e.g. Make function async with error handling..."
            value={cmdKPrompt}
            onChange={(e) => setCmdKPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTriggerCmdK()}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
              className="px-3 py-1 rounded bg-indigo-600 text-white font-medium hover:bg-indigo-500"
            >
              Generate Patch
            </button>
          </div>
        </div>
      )}

      {/* Proposed Diff Acceptance Banner */}
      {proposedDiff && (
        <div className="bg-indigo-950/90 border-b border-indigo-500/40 px-4 py-2 flex items-center justify-between text-xs text-indigo-200 z-20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Proposed Edit Ready for Review. Compare diff before accepting into Project Truth.</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleAcceptDiff}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Patch</span>
            </button>
            <button
              onClick={handleRejectDiff}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-200"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full h-full">
        <Editor
          height="100%"
          language={language === 'typescript' ? 'typescript' : language === 'javascript' ? 'javascript' : 'python'}
          theme="vs-dark"
          value={proposedDiff || content}
          onChange={(val) => {
            if (!proposedDiff && val !== undefined) {
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
      </div>
    </div>
  );
};
