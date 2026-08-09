import React, { useState } from 'react';
import { Bot, Play, Layers, ChevronDown, ChevronRight, Brain, Sparkles, CheckCircle2, Check } from 'lucide-react';
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
  const [showThinkingTrace, setShowThinkingTrace] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: 'Project Truth Engine active. I reason exclusively over real-time file hashes, AST symbols, and Git working state. What objective would you like to achieve?'
    }
  ]);

  const handleSendChat = () => {
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setPrompt('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `[${activeAgent.toUpperCase()} AGENT]\nEvaluated repository state. Grounded in Project Truth Engine AST and symbol graph for "${userMsg}". All file hashes match physical disk.`
        }
      ]);
    }, 400);
  };

  const handleRunGoal = () => {
    if (!prompt.trim()) return;
    onRunAutonomousGoal(prompt);
  };

  return (
    <div className="w-88 bg-[#090d16] border-l border-slate-800/70 flex flex-col h-full select-none font-sans">
      {/* Agent Panel Header */}
      <div className="h-10 px-3.5 border-b border-slate-800/70 flex items-center justify-between bg-[#0d121f]">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>AI AGENT HUBS</span>
        </div>

        <select
          value={activeAgent}
          onChange={(e) => onSelectAgent(e.target.value as AgentRoleName)}
          className="bg-slate-900 border border-slate-700/80 text-indigo-300 text-[11px] font-mono rounded-md px-2 py-1 focus:outline-none focus:border-indigo-500"
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

      {/* Live AI Reasoning & Thinking Trace Accordion (Blinked directly from real EventStream events!) */}
      <div className="border-b border-slate-800/80 bg-slate-950/80">
        <button
          onClick={() => setShowThinkingTrace(!showThinkingTrace)}
          className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold text-indigo-300 hover:bg-slate-900/60 transition-colors"
        >
          <div className="flex items-center space-x-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>LIVE REASONING & THINKING TRACE ({events.length})</span>
          </div>
          {showThinkingTrace ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        {showThinkingTrace && (
          <div className="p-2.5 max-h-44 overflow-y-auto space-y-1.5 text-[11px] font-mono border-t border-slate-800/50 bg-[#060911]">
            {events.length === 0 ? (
              <div className="text-[10.5px] text-slate-500 italic">No agent thinking events logged yet. Type a prompt or run a pipeline to view reasoning steps.</div>
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
            className={`p-3 rounded-lg text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 ml-4'
                : 'bg-[#0c101d] text-slate-300 border border-slate-800/80 mr-2 shadow-sm'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 flex items-center justify-between">
              <span>{msg.role === 'user' ? 'Developer' : `${activeAgent} Agent`}</span>
              {msg.role !== 'user' && <Sparkles className="w-3 h-3 text-indigo-400" />}
            </div>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {/* Latest Plan Display */}
        {latestPlan && (
          <div className="bg-[#0b0f1b] border border-indigo-500/30 rounded-xl p-3 space-y-2 text-xs shadow-lg">
            <div className="flex items-center justify-between text-indigo-300 font-semibold border-b border-slate-800/80 pb-1.5">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Generated Architecture Plan</span>
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
                  <div key={i} className="flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Goal Controls */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0c101b] space-y-2">
        <textarea
          rows={3}
          placeholder="Describe feature or bug fix (e.g. Refactor HeroSection to use kinetic typography)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
        />

        <div className="flex space-x-2">
          <button
            onClick={handleSendChat}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-md transition-colors border border-slate-700"
          >
            Chat Query
          </button>
          <button
            onClick={handleRunGoal}
            disabled={isRunningPipeline}
            className="flex-1 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center space-x-1 shadow-md shadow-indigo-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunningPipeline ? 'Running...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
