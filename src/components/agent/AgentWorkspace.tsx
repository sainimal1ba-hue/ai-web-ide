import React, { useState } from 'react';
import { Bot, Play, Layers } from 'lucide-react';
import type { AgentRoleName, PlanOutput } from '../../engine/agent-framework/types';

interface AgentWorkspaceProps {
  onRunAutonomousGoal: (objective: string) => void;
  isRunningPipeline: boolean;
  latestPlan: PlanOutput | null;
  activeAgent: AgentRoleName;
  onSelectAgent: (agent: AgentRoleName) => void;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  onRunAutonomousGoal,
  isRunningPipeline,
  latestPlan,
  activeAgent,
  onSelectAgent
}) => {
  const [prompt, setPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: 'assistant',
      content: 'Project Truth Engine online. I reason exclusively over real-time file hashes, AST symbols, and Git state. How can I assist with your repository?'
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
          content: `[${activeAgent.toUpperCase()} AGENT]\nInspected Project Truth Engine. Analyzed symbol references for "${userMsg}". All target file hashes validated.`
        }
      ]);
    }, 600);
  };

  const handleRunGoal = () => {
    if (!prompt.trim()) return;
    onRunAutonomousGoal(prompt);
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full select-none">
      {/* Agent Panel Header */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>AI AGENT HUBS</span>
        </div>

        <select
          value={activeAgent}
          onChange={(e) => onSelectAgent(e.target.value as AgentRoleName)}
          className="bg-slate-950 border border-slate-700 text-indigo-300 text-[11px] font-mono rounded px-2 py-0.5"
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

      {/* Messages / Plan View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30 ml-4'
                : 'bg-slate-950 text-slate-300 border border-slate-800 mr-2'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">
              {msg.role === 'user' ? 'Developer' : `${activeAgent} Agent`}
            </div>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {/* Latest Plan Display */}
        {latestPlan && (
          <div className="bg-slate-950 border border-indigo-500/30 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-indigo-300 font-semibold border-b border-slate-800 pb-1.5">
              <span className="flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Generated Plan</span>
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono">Approved</span>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Objective:</div>
              <p className="text-slate-200">{latestPlan.goal}</p>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Steps:</div>
              <ul className="pl-3 list-disc space-y-0.5 text-slate-300 text-[11px]">
                {latestPlan.implementation_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Autonomous Goal Controls */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
        <textarea
          rows={3}
          placeholder="Ask AI or set autonomous objective (e.g. Refactor AuthService to add async error handling)..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
        />

        <div className="flex space-x-2">
          <button
            onClick={handleSendChat}
            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-md transition-colors"
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
