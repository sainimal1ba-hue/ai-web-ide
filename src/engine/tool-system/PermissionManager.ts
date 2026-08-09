import type { CommandPermissionLevel } from './types';

export class PermissionManager {
  private static SAFE_COMMANDS = ['ls', 'git status', 'git diff', 'npm test', 'pytest', 'cat', 'pwd', 'echo'];
  private static DANGEROUS_PATTERNS = ['rm -rf', 'sudo', 'mkfs', 'dd', 'chmod 777', '> /dev/', 'git reset --hard'];

  public static classifyCommand(command: string): CommandPermissionLevel {
    const trimmed = command.trim().toLowerCase();

    // Check dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (trimmed.includes(pattern)) {
        return 'DANGEROUS';
      }
    }

    // Check safe patterns
    for (const safe of this.SAFE_COMMANDS) {
      if (trimmed === safe || trimmed.startsWith(`${safe} `)) {
        return 'SAFE';
      }
    }

    return 'REQUIRES_CONFIRMATION';
  }

  /**
   * Sanitizes relative paths to ensure no path traversal outside workspace.
   */
  public static sanitizePath(path: string): { safePath: string; isValid: boolean } {
    if (path.includes('..') && (path.startsWith('../') || path.includes('/../'))) {
      return { safePath: path, isValid: false };
    }
    return { safePath: path.replace(/^\/+/, ''), isValid: true };
  }
}
