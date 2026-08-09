import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Loader2, FileCode } from 'lucide-react';
import type { AgentEvent } from '../../engine/agent-framework/types';

interface AgentTimelineProps {
  events: AgentEvent[];
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ events }) => {
  return (
    <div className="flex-1 bg-slate-950 p-3 overflow-y-auto font-sans space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium pb-1 border-b border-slate-800">
        <span className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>REAL-TIME AGENT TIMELINE STREAM</span>
        </span>
        <span className="text-[10px] font-mono text-slate-500">{events.length} Events</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-xs text-slate-500 py-6">
          No agent events recorded yet. Run an autonomous pipeline or AI chat query to log events.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((evt) => {
            const timeStr = new Date(evt.timestamp).toLocaleTimeString();
            return (
              <div
                key={evt.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1 text-xs transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] text-slate-500">{timeStr}</span>
                    <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/50">
                      {evt.agent}
                    </span>
                    <span className="font-medium text-slate-200">{evt.action}</span>
                  </div>

                  <div>
                    {evt.result === 'success' && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                        <CheckCircle className="w-3 h-3" />
                        <span>SUCCESS</span>
                      </span>
                    )}
                    {evt.result === 'in_progress' && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>RUNNING</span>
                      </span>
                    )}
                    {evt.result === 'failure' && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                        <AlertTriangle className="w-3 h-3" />
                        <span>FAILED</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-400 text-[11px] pl-1 border-l-2 border-slate-800">{evt.reason}</p>

                {evt.file && (
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">
                    <FileCode className="w-3 h-3 text-indigo-400" />
                    <span>File: {evt.file}</span>
                    {evt.beforeHash && evt.afterHash && (
                      <span className="text-slate-400">
                        ({evt.beforeHash.slice(0, 6)} → <strong className="text-emerald-400">{evt.afterHash.slice(0, 6)}</strong>)
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
