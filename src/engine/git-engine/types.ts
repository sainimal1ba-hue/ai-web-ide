export interface AICheckpoint {
  id: string;
  timestamp: number;
  label: string;
  branch: string;
  agentName: string;
  filesBefore: Record<string, string>; // File path -> Content before modification
  affectedFiles: string[];
}

export interface GitStatus {
  branch: string;
  stagedFiles: string[];
  unstagedFiles: string[];
  untrackedFiles: string[];
  clean: boolean;
}
