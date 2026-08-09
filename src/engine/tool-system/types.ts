export type CommandPermissionLevel = 'SAFE' | 'REQUIRES_CONFIRMATION' | 'DANGEROUS';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  permissionLevel: CommandPermissionLevel;
}

export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
}

export interface ToolResult {
  toolCallId: string;
  success: boolean;
  output: string;
  error?: string;
  fileModified?: string;
  beforeHash?: string;
  afterHash?: string;
}
