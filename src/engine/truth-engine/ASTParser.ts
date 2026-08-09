import type { CodeSymbol, LanguageType } from './types';

export class ASTParser {
  /**
   * Extracts language-aware symbols from source code.
   * Includes native Qwythos language constructs (agent, truth, intent, struct, fn).
   */
  public static parseSymbols(filePath: string, content: string, language: LanguageType): CodeSymbol[] {
    const symbols: CodeSymbol[] = [];
    const lines = content.split('\n');

    if (language === 'typescript' || language === 'javascript') {
      this.parseJSOrTS(filePath, lines, symbols);
    } else if (language === 'python') {
      this.parsePython(filePath, lines, symbols);
    } else if (language === 'go') {
      this.parseGo(filePath, lines, symbols);
    } else if (language === 'qwythos') {
      this.parseQwythos(filePath, lines, symbols);
    } else {
      this.parseGeneric(filePath, lines, symbols);
    }

    return symbols;
  }

  private static parseQwythos(filePath: string, lines: string[], symbols: CodeSymbol[]) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Qwythos 'agent' construct
      const agentMatch = trimmed.match(/^(?:pub\s+)?agent\s+([A-Za-z0-9_]+)/);
      if (agentMatch) {
        symbols.push({
          id: `${filePath}#agent#${agentMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: agentMatch[1],
          kind: 'agent',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(agentMatch[1]), endColumn: line.indexOf(agentMatch[1]) + agentMatch[1].length },
          signature: `agent ${agentMatch[1]}`
        });
      }

      // Qwythos 'truth' construct
      const truthMatch = trimmed.match(/^(?:pub\s+)?truth\s+([A-Za-z0-9_]+)/);
      if (truthMatch) {
        symbols.push({
          id: `${filePath}#truth#${truthMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: truthMatch[1],
          kind: 'truth',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(truthMatch[1]), endColumn: line.indexOf(truthMatch[1]) + truthMatch[1].length },
          signature: `truth ${truthMatch[1]}`
        });
      }

      // Qwythos 'intent' or 'fn' construct
      const intentMatch = trimmed.match(/^(?:pub\s+)?(?:intent|fn)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/);
      if (intentMatch) {
        symbols.push({
          id: `${filePath}#intent#${intentMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: intentMatch[1],
          kind: 'intent',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(intentMatch[1]), endColumn: line.indexOf(intentMatch[1]) + intentMatch[1].length },
          signature: `intent ${intentMatch[1]}(${intentMatch[2]})`
        });
      }
    });
  }

  private static parseJSOrTS(filePath: string, lines: string[], symbols: CodeSymbol[]) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      const classMatch = trimmed.match(/^(?:export\s+)?(?:default\s+)?class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        symbols.push({
          id: `${filePath}#class#${classMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: classMatch[1],
          kind: 'class',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(classMatch[1]), endColumn: line.indexOf(classMatch[1]) + classMatch[1].length },
          signature: line.trim()
        });
      }

      const interfaceMatch = trimmed.match(/^(?:export\s+)?interface\s+([A-Za-z0-9_]+)/);
      if (interfaceMatch) {
        symbols.push({
          id: `${filePath}#interface#${interfaceMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: interfaceMatch[1],
          kind: 'interface',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(interfaceMatch[1]), endColumn: line.indexOf(interfaceMatch[1]) + interfaceMatch[1].length },
          signature: line.trim()
        });
      }

      const funcMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s*([A-Za-z0-9_]+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        symbols.push({
          id: `${filePath}#function#${funcMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: funcMatch[1],
          kind: 'function',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(funcMatch[1]), endColumn: line.indexOf(funcMatch[1]) + funcMatch[1].length },
          signature: `function ${funcMatch[1]}(${funcMatch[2]})`
        });
      }

      const arrowMatch = trimmed.match(/^(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
      if (arrowMatch) {
        symbols.push({
          id: `${filePath}#function#${arrowMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: arrowMatch[1],
          kind: 'function',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(arrowMatch[1]), endColumn: line.indexOf(arrowMatch[1]) + arrowMatch[1].length },
          signature: line.trim()
        });
      }

      const importMatch = trimmed.match(/^import\s+.*?from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        symbols.push({
          id: `${filePath}#import#${importMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: importMatch[1],
          kind: 'import',
          location: { startLine: lineNum, endLine: lineNum, startColumn: 0, endColumn: line.length },
          signature: line.trim()
        });
      }
    });
  }

  private static parsePython(filePath: string, lines: string[], symbols: CodeSymbol[]) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      const classMatch = trimmed.match(/^class\s+([A-Za-z0-9_]+)/);
      if (classMatch) {
        symbols.push({
          id: `${filePath}#class#${classMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: classMatch[1],
          kind: 'class',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(classMatch[1]), endColumn: line.indexOf(classMatch[1]) + classMatch[1].length },
          signature: line.trim()
        });
      }

      const defMatch = trimmed.match(/^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/);
      if (defMatch) {
        symbols.push({
          id: `${filePath}#function#${defMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: defMatch[1],
          kind: trimmed.startsWith('def ') && line.startsWith('  ') ? 'method' : 'function',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(defMatch[1]), endColumn: line.indexOf(defMatch[1]) + defMatch[1].length },
          signature: `def ${defMatch[1]}(${defMatch[2]})`
        });
      }
    });
  }

  private static parseGo(filePath: string, lines: string[], symbols: CodeSymbol[]) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      const funcMatch = trimmed.match(/^func\s+(?:\([^)]+\)\s+)?([A-Za-z0-9_]+)\s*\(/);
      if (funcMatch) {
        symbols.push({
          id: `${filePath}#function#${funcMatch[1]}#${lineNum}`,
          fileId: filePath,
          filePath,
          name: funcMatch[1],
          kind: 'function',
          location: { startLine: lineNum, endLine: lineNum, startColumn: line.indexOf(funcMatch[1]), endColumn: line.indexOf(funcMatch[1]) + funcMatch[1].length },
          signature: line.trim()
        });
      }
    });
  }

  private static parseGeneric(filePath: string, lines: string[], symbols: CodeSymbol[]) {
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('function ') || trimmed.startsWith('pub fn ') || trimmed.startsWith('def ')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const name = parts[1].split('(')[0];
          symbols.push({
            id: `${filePath}#symbol#${name}#${lineNum}`,
            fileId: filePath,
            filePath,
            name,
            kind: 'function',
            location: { startLine: lineNum, endLine: lineNum, startColumn: 0, endColumn: line.length }
          });
        }
      }
    });
  }

  public static detectLanguage(filePath: string): LanguageType {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'qw':
      case 'qwythos':
        return 'qwythos';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'py':
        return 'python';
      case 'go':
        return 'go';
      case 'rs':
        return 'rust';
      case 'cpp':
      case 'h':
      case 'hpp':
      case 'c':
        return 'cpp';
      case 'json':
        return 'json';
      case 'html':
        return 'html';
      case 'css':
      case 'scss':
        return 'css';
      case 'md':
        return 'markdown';
      default:
        return 'unknown';
    }
  }
}
