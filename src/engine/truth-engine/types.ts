export type LanguageType = 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'cpp' | 'json' | 'html' | 'css' | 'markdown' | 'qwythos' | 'unknown';

export interface FileMetadata {
  id: string;
  path: string;
  hash: string;
  size: number;
  mtime: number;
  language: LanguageType;
  astVersion: number;
  isStale: boolean;
  content?: string;
}

export type SymbolKind = 'class' | 'function' | 'method' | 'interface' | 'variable' | 'type' | 'import' | 'export' | 'agent' | 'truth' | 'intent';

export interface SymbolLocation {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
}

export interface CodeSymbol {
  id: string;
  fileId: string;
  filePath: string;
  name: string;
  kind: SymbolKind;
  location: SymbolLocation;
  signature?: string;
  docstring?: string;
  parentSymbolId?: string;
}

export interface DependencyEdge {
  sourceFilePath: string;
  targetFilePath: string;
  importStatement: string;
  specifier: string;
}

export interface SemanticChunk {
  id: string;
  filePath: string;
  chunkHash: string;
  startLine: number;
  endLine: number;
  content: string;
  embedding?: number[];
}

export interface TruthEngineStats {
  totalFiles: number;
  totalSymbols: number;
  totalDependencies: number;
  staleFiles: number;
  lastScanTimestamp: number;
  indexingProgress: number; // 0 to 100
  gitState: 'clean' | 'modified' | 'untracked' | 'error';
}

export interface VerificationResult {
  isMatch: boolean;
  currentHash: string;
  expectedHash: string;
  filePath: string;
}
