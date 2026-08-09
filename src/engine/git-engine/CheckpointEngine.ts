import type { AICheckpoint } from './types';

export class CheckpointEngine {
  private checkpoints: AICheckpoint[] = [];

  /**
   * Creates an atomic AI checkpoint before agents modify code.
   */
  public createCheckpoint(
    label: string,
    agentName: string,
    affectedFiles: string[],
    currentFilesState: Record<string, string>,
    branch: string = 'main'
  ): AICheckpoint {
    const filesBefore: Record<string, string> = {};
    affectedFiles.forEach(path => {
      if (currentFilesState[path] !== undefined) {
        filesBefore[path] = currentFilesState[path];
      }
    });

    const checkpoint: AICheckpoint = {
      id: `ckpt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      label,
      branch,
      agentName,
      filesBefore,
      affectedFiles
    };

    this.checkpoints.unshift(checkpoint); // Newest first
    return checkpoint;
  }

  /**
   * Rolls back the filesystem to a specific checkpoint state.
   * Returns the restored files map.
   */
  public rollbackCheckpoint(checkpointId: string): Record<string, string> | null {
    const cp = this.checkpoints.find(c => c.id === checkpointId);
    if (!cp) return null;

    return { ...cp.filesBefore };
  }

  public getCheckpoints(): AICheckpoint[] {
    return this.checkpoints;
  }

  public getLatestCheckpoint(): AICheckpoint | null {
    return this.checkpoints[0] || null;
  }
}
