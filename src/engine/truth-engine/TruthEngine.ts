import { FileScanner } from './FileScanner';
import { SymbolGraph } from './SymbolGraph';
import { DependencyGraph } from './DependencyGraph';
import { ASTParser } from './ASTParser';
import type { TruthEngineStats } from './types';

export class TruthEngine {
  public scanner: FileScanner = new FileScanner();
  public symbolGraph: SymbolGraph = new SymbolGraph();
  public dependencyGraph: DependencyGraph = new DependencyGraph();
  private lastScanTimestamp: number = 0;
  private isScanning: boolean = false;

  /**
   * Main entry point to index or re-index a single file.
   * Ensures filesystem truth, AST refresh, symbol update, and dependency graph synchronization.
   */
  public async processFile(filePath: string, content: string): Promise<void> {
    // 1. Index file & compute SHA-256 hash
    const meta = await this.scanner.indexFile(filePath, content);

    // 2. Parse AST symbols
    const symbols = ASTParser.parseSymbols(filePath, content, meta.language);
    this.symbolGraph.updateFileSymbols(filePath, symbols);

    // 3. Extract imports & update dependency graph
    const imports = symbols
      .filter(s => s.kind === 'import')
      .map(s => s.name);
    this.dependencyGraph.updateFileDependencies(filePath, imports);
  }

  /**
   * Performs full repository scan `/scan`
   */
  public async rebuildFullIntelligence(filesMap: Record<string, string>): Promise<TruthEngineStats> {
    this.isScanning = true;
    this.symbolGraph.clear();
    this.dependencyGraph.clear();

    const fileEntries = Object.entries(filesMap);
    for (const [path, content] of fileEntries) {
      await this.processFile(path, content);
    }

    this.lastScanTimestamp = Date.now();
    this.isScanning = false;

    return this.getStats();
  }

  /**
   * Incremental refresh scan `/refresh` for changed files
   */
  public async incrementalRefresh(changedFilesMap: Record<string, string>): Promise<TruthEngineStats> {
    for (const [path, content] of Object.entries(changedFilesMap)) {
      await this.processFile(path, content);
    }
    this.lastScanTimestamp = Date.now();
    return this.getStats();
  }

  /**
   * Diagnoses project index corruption `/doctor`
   */
  public diagnoseIndexIntegrity(): { status: 'healthy' | 'corrupted'; issues: string[] } {
    const issues: string[] = [];
    const files = this.scanner.getAllFiles();

    files.forEach(f => {
      if (f.isStale) {
        issues.push(`Stale file hash detected for ${f.path}`);
      }
      if (f.size === 0) {
        issues.push(`Empty file indexed at ${f.path}`);
      }
    });

    return {
      status: issues.length === 0 ? 'healthy' : 'corrupted',
      issues
    };
  }

  public getStats(): TruthEngineStats {
    return {
      totalFiles: this.scanner.getAllFiles().length,
      totalSymbols: this.symbolGraph.getTotalSymbolCount(),
      totalDependencies: this.dependencyGraph.getTotalDependencyCount(),
      staleFiles: this.scanner.getStaleCount(),
      lastScanTimestamp: this.lastScanTimestamp,
      indexingProgress: this.isScanning ? 50 : 100,
      gitState: 'clean'
    };
  }
}
