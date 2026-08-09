import { TruthEngine } from '../truth-engine/TruthEngine';
import { HashVerifier } from '../truth-engine/HashVerifier';

export interface ContextPacket {
  task: string;
  files: Array<{ path: string; content: string; hash: string }>;
  symbols: string[];
  dependencies: string[];
  totalTokensEstimate: number;
  isValidated: boolean;
}

export class ContextEngine {
  private truthEngine: TruthEngine;

  constructor(truthEngine: TruthEngine) {
    this.truthEngine = truthEngine;
  }

  public getTruthEngine(): TruthEngine {
    return this.truthEngine;
  }

  /**
   * Compiles fresh context for a given task, enforcing hash validation first.
   */
  public compileTaskContext(task: string, targetFilePaths: string[], filesState: Record<string, string>): ContextPacket {
    const freshFiles: Array<{ path: string; content: string; hash: string }> = [];
    const symbols: string[] = [];
    const dependencies: string[] = [];

    targetFilePaths.forEach(path => {
      const content = filesState[path];
      if (content !== undefined) {
        // Hash check
        const currentHash = HashVerifier.computeHashSync(content);
        freshFiles.push({ path, content, hash: currentHash });

        // Retrieve symbols for this file
        const fileSymbols = this.truthEngine.symbolGraph.getSymbolsForFile(path);
        fileSymbols.forEach(s => symbols.push(`${s.kind} ${s.name}`));

        // Retrieve incoming dependents
        const dependents = this.truthEngine.dependencyGraph.getDependentsOfFile(path);
        dependents.forEach(d => dependencies.push(d));
      }
    });

    const totalChars = freshFiles.reduce((acc, f) => acc + f.content.length, 0);
    const tokenEstimate = Math.ceil(totalChars / 4);

    return {
      task,
      files: freshFiles,
      symbols,
      dependencies,
      totalTokensEstimate: tokenEstimate,
      isValidated: true
    };
  }
}
