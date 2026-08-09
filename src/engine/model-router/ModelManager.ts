import type { AIProvider, ModelRole } from './types';
import { LocalOllamaProvider } from './LocalOllamaProvider';

export class ModelManager {
  private providers: Map<string, AIProvider> = new Map();
  private roleAssignments: Map<ModelRole, { providerId: string; modelId: string }> = new Map();
  private isLocalOnlyPrivacyMode: boolean = true;

  constructor() {
    const defaultLocal = new LocalOllamaProvider();
    this.providers.set(defaultLocal.id, defaultLocal);

    const defaultAssignment = { providerId: defaultLocal.id, modelId: 'qwen2.5-coder:latest' };
    this.roleAssignments.set('planner', defaultAssignment);
    this.roleAssignments.set('coder', defaultAssignment);
    this.roleAssignments.set('reviewer', defaultAssignment);
    this.roleAssignments.set('debugger', defaultAssignment);
    this.roleAssignments.set('architect', defaultAssignment);
    this.roleAssignments.set('security', defaultAssignment);
    this.roleAssignments.set('test', defaultAssignment);
    this.roleAssignments.set('fast', defaultAssignment);
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public assignModelToRole(role: ModelRole, providerId: string, modelId: string): void {
    this.roleAssignments.set(role, { providerId, modelId });
  }

  public getProviderForRole(role: ModelRole): { provider: AIProvider; modelId: string } {
    const assignment = this.roleAssignments.get(role);
    if (!assignment) {
      const fallbackProvider = this.providers.get('local-ollama')!;
      return { provider: fallbackProvider, modelId: 'qwen2.5-coder:latest' };
    }

    const provider = this.providers.get(assignment.providerId) || this.providers.get('local-ollama')!;
    return { provider, modelId: assignment.modelId };
  }

  public setLocalOnlyPrivacyMode(enabled: boolean): void {
    this.isLocalOnlyPrivacyMode = enabled;
  }

  public getLocalOnlyPrivacyMode(): boolean {
    return this.isLocalOnlyPrivacyMode;
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}
