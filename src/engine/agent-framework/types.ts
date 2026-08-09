export type AgentRoleName = 'planner' | 'coder' | 'reviewer' | 'debugger' | 'architect' | 'security' | 'test';

export interface AgentEvent {
  id: string;
  timestamp: number;
  agent: AgentRoleName;
  action: string;
  file?: string;
  beforeHash?: string;
  afterHash?: string;
  reason: string;
  result: 'success' | 'failure' | 'in_progress';
  details?: string;
}

export interface PlanOutput {
  goal: string;
  files: string[];
  dependencies: string[];
  implementation_steps: string[];
  risks: string[];
  tests: string[];
}

export interface ReviewOutput {
  approved: boolean;
  securityStatus: 'PASS' | 'WARN' | 'FAIL';
  testStatus: 'PASS' | 'FAIL';
  comments: string[];
}
