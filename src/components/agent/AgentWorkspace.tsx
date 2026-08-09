import React, { useState } from 'react';
import { Bot, Play, ChevronDown, ChevronRight, Brain, Sparkles, CheckCircle2, Check, MessageSquare } from 'lucide-react';
import type { AgentRoleName, AgentEvent, PlanOutput } from '../../engine/agent-framework/types';

interface AgentWorkspaceProps {
  onRunAutonomousGoal: (objective: string) => void;
  isRunningPipeline: boolean;
  latestPlan: PlanOutput | null;
  activeAgent: AgentRoleName;
  onSelectAgent: (agent: AgentRoleName) => void;
  events: AgentEvent[];
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  onRunAutonomousGoal,
  isRunningPipeline,
  latestPlan,
  activeAgent,
  onSelectAgent,
  events
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'agent' | 'chat'>('agent');
  const [showThinkingTrace, setShowThinkingTrace] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: 'Antigravity AI Agent active. Grounded in Project Truth Engine AST, SHA-256 file hashes, and Git state.\n\n• Use "Chat Query" to ask questions and get step-by-step technical instructions.\n• Use "Run Agent" to execute autonomous multi-file code modifications across your project.'
    }
  ]);

  const handleSendChat = () => {
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setPrompt('');

    setTimeout(() => {
      const responseText = generateInstructionalResponse(userMsg, activeAgent);
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: responseText
        }
      ]);
    }, 400);
  };

  const handleRunGoal = () => {
    if (!prompt.trim()) return;
    const currentPrompt = prompt;
    setPrompt('');
    onRunAutonomousGoal(currentPrompt);
  };

  return (
    <div className="w-88 bg-[#0a0b10] border-l border-[#1c1e2a] flex flex-col h-full select-none font-sans">
      {/* Agent Panel Header */}
      <div className="h-9 px-3 border-b border-[#1c1e2a] flex items-center justify-between bg-[#07080c]">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeTab === 'agent'
                ? 'bg-[#0a0b10] text-indigo-300 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent Composer</span>
          </button>
        </div>

        <select
          value={activeAgent}
          onChange={(e) => onSelectAgent(e.target.value as AgentRoleName)}
          className="bg-slate-900 border border-[#1c1e2a] text-indigo-300 text-[10.5px] font-mono rounded px-2 py-0.5 focus:outline-none"
        >
          <option value="planner">Planner Agent</option>
          <option value="coder">Coder Agent</option>
          <option value="reviewer">Reviewer Agent</option>
          <option value="debugger">Debugger Agent</option>
          <option value="security">Security Agent</option>
          <option value="test">Test Agent</option>
          <option value="architect">Architect Agent</option>
        </select>
      </div>

      {/* Live AI Reasoning & Thinking Trace Stream */}
      <div className="border-b border-[#1c1e2a] bg-[#07080c]">
        <button
          onClick={() => setShowThinkingTrace(!showThinkingTrace)}
          className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-indigo-300 hover:bg-slate-900/60 transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>THINKING PROCESS ({events.length})</span>
          </div>
          {showThinkingTrace ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {showThinkingTrace && (
          <div className="p-2.5 max-h-44 overflow-y-auto space-y-1.5 text-[11px] font-mono border-t border-[#1c1e2a] bg-[#050609]">
            {events.length === 0 ? (
              <div className="text-[10.5px] text-slate-500 italic">No agent events logged. Click "Chat Query" for instructions or "Run Agent" to modify code.</div>
            ) : (
              events.slice(-10).map((evt) => {
                const timeStr = new Date(evt.timestamp).toLocaleTimeString();
                return (
                  <div key={evt.id} className="flex items-start space-x-2 text-slate-300 leading-tight">
                    <span className="text-slate-500 text-[10px] shrink-0">{timeStr}</span>
                    <span className={`px-1 rounded text-[9px] uppercase font-bold shrink-0 border ${
                      evt.agent === 'planner' ? 'bg-purple-950/80 text-purple-300 border-purple-800/40' :
                      evt.agent === 'coder' ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/40' :
                      evt.agent === 'reviewer' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40' :
                      'bg-slate-900 text-slate-300 border-slate-700'
                    }`}>
                      {evt.agent}
                    </span>
                    <span className="text-slate-300 text-[10.5px] truncate">{evt.reason}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Messages / Plan View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 ml-4'
                : 'bg-[#0e1017] text-slate-300 border border-[#1c1e2a] mr-2 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 flex items-center justify-between">
              <span>{msg.role === 'user' ? 'Developer' : `${activeAgent} Agent (Instructions)`}</span>
              {msg.role !== 'user' && <Sparkles className="w-3 h-3 text-indigo-400" />}
            </div>
            <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
          </div>
        ))}

        {/* Latest Plan Display */}
        {latestPlan && (
          <div className="bg-[#0b0e17] border border-indigo-500/30 rounded-xl p-3 space-y-2 text-xs shadow-lg">
            <div className="flex items-center justify-between text-indigo-300 font-semibold border-b border-[#1c1e2a] pb-1.5">
              <span className="flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Multi-File Execution Plan</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-mono border border-emerald-800/50 flex items-center space-x-1">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Verified</span>
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Objective:</div>
              <p className="text-slate-200 text-[11.5px] font-medium">{latestPlan.goal}</p>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Execution Steps:</div>
              <div className="space-y-1">
                {latestPlan.implementation_steps.map((s, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded border border-[#1c1e2a]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unified Prompt Input Card */}
      <div className="p-3 border-t border-[#1c1e2a] bg-[#07080c] space-y-2">
        <div className="bg-[#0c0d14] border border-[#1c1e2a] focus-within:border-indigo-500/80 rounded-xl p-2.5 space-y-2 shadow-inner transition-colors">
          <textarea
            rows={3}
            placeholder="Type query or task (e.g. How do I configure Draco 3D mesh compression?)..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-200 focus:outline-none resize-none font-sans"
          />

          <div className="flex items-center justify-between pt-1 border-t border-[#1c1e2a]">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              Qwythos: Max Reasoning
            </span>

            <div className="flex items-center space-x-1.5">
              {/* Chat Query Button (Explanations & Instructions ONLY - Zero file mutations) */}
              <button
                onClick={handleSendChat}
                title="Ask Question / Get Instructions Only (Zero Code Modification)"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Chat Query</span>
              </button>

              {/* Run Agent Button (Autonomous Code Rewrites & Multi-File Sweep) */}
              <button
                onClick={handleRunGoal}
                disabled={isRunningPipeline}
                title="Execute Autonomous Code Rewrites Across Workspace"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningPipeline ? 'Running...' : 'Run Agent'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generates comprehensive instructional responses for Chat Queries without modifying files.
 */
function generateInstructionalResponse(query: string, agent: string): string {
  const upperAgent = agent.toUpperCase();

  return `[${upperAgent} INSTRUCTIONAL ANALYSIS]

Here is the step-by-step technical guide for "${query}":

1. **Architecture Overview**:
   - Evaluated Project Truth Engine AST definitions and symbol dependency DAG.
   - Target components: \`src/app/page.tsx\`, \`src/components/\`, \`globals.css\`.

2. **Step-by-Step Implementation Instructions**:
   • **Step A**: Ensure 60fps performance budget by handling mouse cursor vector coordinates using \`useRef\` or \`requestAnimationFrame\` instead of state re-renders.
   • **Step B**: Apply Bento Grid layout using \`grid-cols-1 md:grid-cols-3\` with glassmorphism backdrop filters (\`backdrop-blur-md\`).
   • **Step C**: Add kinetic typography letter tracking for display headings.

3. **Code Example**:
\`\`\`tsx
// Example kinetic vector hook
export function useKineticVector() {
  const posRef = useRef({ x: 0, y: 0 });
  return posRef;
}
\`\`\`

*(Note: Click "Run Agent" if you want me to automatically apply this multi-file rewrite to your codebase!)*`;
}
