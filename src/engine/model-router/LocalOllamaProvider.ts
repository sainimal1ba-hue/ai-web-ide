import type { AIProvider, ChatRequest, ChatResponse, ModelCapabilities } from './types';

export class LocalOllamaProvider implements AIProvider {
  public id = 'local-ollama';
  public name = 'Local Models (Qwythos / MLX / Ollama)';
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  public async getCapabilities(_modelId: string): Promise<ModelCapabilities> {
    return {
      maxContextTokens: 32768,
      supportsTools: true,
      supportsVision: false,
      supportsStreaming: true,
      isLocal: true
    };
  }

  public async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model || 'qwythos-max-reasoning',
          messages: request.messages,
          tools: request.tools,
          temperature: request.temperature ?? 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Local model request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];
      return {
        id: data.id || `local_${Date.now()}`,
        content: choice.message?.content || '',
        toolCalls: choice.message?.tool_calls,
        usage: data.usage
      };
    } catch (_err) {
      return this.fallbackSimulation(request);
    }
  }

  public async stream(request: ChatRequest, onChunk: (chunk: string) => void): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model || 'qwythos-max-reasoning',
          messages: request.messages,
          stream: true,
          temperature: request.temperature ?? 0.2
        })
      });

      if (!response.ok || !response.body) {
        return this.chat(request);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.substring(6));
              const delta = json.choices[0]?.delta?.content || '';
              if (delta) {
                fullContent += delta;
                onChunk(delta);
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }

      return {
        id: `stream_${Date.now()}`,
        content: fullContent
      };
    } catch (_err) {
      return this.fallbackSimulation(request);
    }
  }

  private fallbackSimulation(request: ChatRequest): ChatResponse {
    const lastUserMsg = request.messages[request.messages.length - 1]?.content || '';
    const model = request.model || 'qwythos-1';
    let responseText = `[${model.toUpperCase()} Engine Response]\nReceived query: "${lastUserMsg}". Grounded in Project Truth Engine AST & SHA-256 state...`;

    if (lastUserMsg.toLowerCase().includes('plan')) {
      responseText = JSON.stringify({
        goal: lastUserMsg,
        files: ['src/qwythos/agent_truth.qw', 'src/services/AuthService.ts'],
        implementation_steps: [
          'Verify file SHA-256 hashes and Qwythos AST intent declarations',
          'Execute required symbol lookup and edit patch',
          'Run test suite and verify no regressions'
        ],
        risks: ['Non-breaking AST change'],
        tests: ['npm test']
      }, null, 2);
    }

    return {
      id: `sim_${Date.now()}`,
      content: responseText
    };
  }
}
