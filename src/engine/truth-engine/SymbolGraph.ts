import type { CodeSymbol, SymbolKind } from './types';

export class SymbolGraph {
  private symbolsByFile: Map<string, CodeSymbol[]> = new Map();
  private symbolIndexByName: Map<string, CodeSymbol[]> = new Map();

  public clear(): void {
    this.symbolsByFile.clear();
    this.symbolIndexByName.clear();
  }

  public updateFileSymbols(filePath: string, symbols: CodeSymbol[]): void {
    this.removeFileSymbols(filePath);
    
    this.symbolsByFile.set(filePath, symbols);
    symbols.forEach(sym => {
      const nameKey = sym.name.toLowerCase();
      const existing = this.symbolIndexByName.get(nameKey) || [];
      existing.push(sym);
      this.symbolIndexByName.set(nameKey, existing);
    });
  }

  public removeFileSymbols(filePath: string): void {
    const existingSymbols = this.symbolsByFile.get(filePath);
    if (existingSymbols) {
      existingSymbols.forEach(sym => {
        const nameKey = sym.name.toLowerCase();
        const list = this.symbolIndexByName.get(nameKey);
        if (list) {
          const filtered = list.filter(item => item.id !== sym.id);
          if (filtered.length > 0) {
            this.symbolIndexByName.set(nameKey, filtered);
          } else {
            this.symbolIndexByName.delete(nameKey);
          }
        }
      });
      this.symbolsByFile.delete(filePath);
    }
  }

  public findSymbolsByName(query: string): CodeSymbol[] {
    const term = query.toLowerCase().trim();
    const results: CodeSymbol[] = [];

    this.symbolIndexByName.forEach((symbols, key) => {
      if (key.includes(term)) {
        results.push(...symbols);
      }
    });

    return results;
  }

  public getSymbolsForFile(filePath: string): CodeSymbol[] {
    return this.symbolsByFile.get(filePath) || [];
  }

  public getSymbolsByKind(kind: SymbolKind): CodeSymbol[] {
    const matches: CodeSymbol[] = [];
    this.symbolsByFile.forEach(symbols => {
      symbols.forEach(s => {
        if (s.kind === kind) matches.push(s);
      });
    });
    return matches;
  }

  public getTotalSymbolCount(): number {
    let count = 0;
    this.symbolsByFile.forEach(list => {
      count += list.length;
    });
    return count;
  }
}
