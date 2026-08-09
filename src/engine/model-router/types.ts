export type ModelRole = 'planner' | 'coder' | 'reviewer' | 'debugger' | 'architect' | 'security' | 'test' | 'fast';

export interface ModelCapabilities {
  maxContextTokens: number;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  isLocal: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCalls?: ToolCallPayload[];
  toolCallId?: string;
}

export interface ToolCallPayload {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  tools?: any[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  id: string;
  content: string;
  toolCalls?: ToolCallPayload[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  id: string;
  name: string;
  getCapabilities(modelId: string): Promise<ModelCapabilities>;
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest, onChunk: (chunk: string) => void): Promise<ChatResponse>;
}

export interface HFModelMetadata {
  id: string;
  name: string;
  org: string;
  sizeGb: number;
  recommendedQuant: 'Q4_K_M' | 'Q8_0' | 'FP16';
  minRamGb: number;
  isCompatibleWithMac: boolean;
  downloads: number;
  likes: number;
}
