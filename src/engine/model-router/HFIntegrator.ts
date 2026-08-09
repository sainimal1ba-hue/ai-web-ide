import type { HFModelMetadata } from './types';

export class HFIntegrator {
  private static MOCK_HF_REGISTRY: HFModelMetadata[] = [
    {
      id: 'Qwen/Qwen2.5-Coder-7B-Instruct-GGUF',
      name: 'Qwen 2.5 Coder (7B Instruct)',
      org: 'Qwen',
      sizeGb: 4.68,
      recommendedQuant: 'Q4_K_M',
      minRamGb: 8,
      isCompatibleWithMac: true,
      downloads: 421000,
      likes: 12400
    },
    {
      id: 'Qwen/Qwen2.5-Coder-14B-Instruct-GGUF',
      name: 'Qwen 2.5 Coder (14B Instruct)',
      org: 'Qwen',
      sizeGb: 8.96,
      recommendedQuant: 'Q4_K_M',
      minRamGb: 16,
      isCompatibleWithMac: true,
      downloads: 189000,
      likes: 8300
    },
    {
      id: 'deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct-GGUF',
      name: 'DeepSeek Coder V2 Lite (16B)',
      org: 'deepseek-ai',
      sizeGb: 11.2,
      recommendedQuant: 'Q4_K_M',
      minRamGb: 18,
      isCompatibleWithMac: true,
      downloads: 310000,
      likes: 9500
    },
    {
      id: 'meta-llama/Llama-3.1-8B-Instruct-GGUF',
      name: 'Llama 3.1 8B Instruct',
      org: 'meta-llama',
      sizeGb: 4.92,
      recommendedQuant: 'Q4_K_M',
      minRamGb: 8,
      isCompatibleWithMac: true,
      downloads: 850000,
      likes: 24500
    }
  ];

  /**
   * Evaluates Mac hardware suitability based on Unified Memory.
   */
  public static evaluateHardwareSuitability(systemRamGb: number = 16): {
    chipEstimate: string;
    availableMemoryGb: number;
    recommendedModel: string;
    maxSupportedModelSizeGb: number;
  } {
    const usableMemory = Math.floor(systemRamGb * 0.75); // 75% for AI inference
    let recommended = 'Qwen 2.5 Coder (7B Instruct)';

    if (usableMemory >= 24) {
      recommended = 'DeepSeek Coder V2 Lite (16B)';
    } else if (usableMemory >= 12) {
      recommended = 'Qwen 2.5 Coder (14B Instruct)';
    }

    return {
      chipEstimate: 'Apple Silicon (M-Series Unified Memory)',
      availableMemoryGb: usableMemory,
      recommendedModel: recommended,
      maxSupportedModelSizeGb: usableMemory
    };
  }

  public static searchModels(query: string): HFModelMetadata[] {
    const q = query.toLowerCase();
    return this.MOCK_HF_REGISTRY.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.org.toLowerCase().includes(q) || 
      m.id.toLowerCase().includes(q)
    );
  }

  public static getFeaturedModels(): HFModelMetadata[] {
    return this.MOCK_HF_REGISTRY;
  }
}
