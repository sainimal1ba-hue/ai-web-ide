import type { DependencyEdge } from './types';

export class DependencyGraph {
  // Key: source file path, Value: outgoing dependency edges
  private outgoingEdges: Map<string, DependencyEdge[]> = new Map();
  // Key: target file path, Value: incoming dependant file paths
  private incomingDependents: Map<string, Set<string>> = new Map();

  public clear(): void {
    this.outgoingEdges.clear();
    this.incomingDependents.clear();
  }

  public updateFileDependencies(sourceFilePath: string, imports: string[]): void {
    this.removeFileDependencies(sourceFilePath);

    const edges: DependencyEdge[] = [];
    imports.forEach(imp => {
      const edge: DependencyEdge = {
        sourceFilePath,
        targetFilePath: this.resolveTarget(sourceFilePath, imp),
        importStatement: imp,
        specifier: imp
      };
      edges.push(edge);

      // Track incoming dependents
      const dependents = this.incomingDependents.get(edge.targetFilePath) || new Set();
      dependents.add(sourceFilePath);
      this.incomingDependents.set(edge.targetFilePath, dependents);
    });

    this.outgoingEdges.set(sourceFilePath, edges);
  }

  public removeFileDependencies(sourceFilePath: string): void {
    const existing = this.outgoingEdges.get(sourceFilePath);
    if (existing) {
      existing.forEach(edge => {
        const dependents = this.incomingDependents.get(edge.targetFilePath);
        if (dependents) {
          dependents.delete(sourceFilePath);
          if (dependents.size === 0) {
            this.incomingDependents.delete(edge.targetFilePath);
          }
        }
      });
      this.outgoingEdges.delete(sourceFilePath);
    }
  }

  public getDependentsOfFile(targetFilePath: string): string[] {
    const direct = Array.from(this.incomingDependents.get(targetFilePath) || []);
    return direct;
  }

  public getDirectDependenciesOfFile(sourceFilePath: string): DependencyEdge[] {
    return this.outgoingEdges.get(sourceFilePath) || [];
  }

  /**
   * Resolves relative import specifiers into likely target file paths.
   */
  private resolveTarget(sourceFilePath: string, specifier: string): string {
    if (!specifier.startsWith('.')) {
      return specifier; // External package
    }

    const parts = sourceFilePath.split('/');
    parts.pop(); // Remove file name
    const dir = parts.join('/');
    
    // Normalize relative path
    const resolved = `${dir}/${specifier}`.replace(/\/\.\//g, '/');
    return resolved;
  }

  public getTotalDependencyCount(): number {
    let count = 0;
    this.outgoingEdges.forEach(edges => {
      count += edges.length;
    });
    return count;
  }
}
