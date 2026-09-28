import { diffLines } from 'diff';

/**
 * Computes line addition (+) and deletion (-) statistics between two file content strings.
 *
 * This uses an actual line diff instead of comparing sets of lines. Set-based comparison
 * loses duplicate lines and can therefore report incorrect statistics when a line is
 * repeated or moved.
 */
export interface DiffStats {
  additions: number;
  deletions: number;
}

export function computeLineDiffStats(
  oldContent: string = '',
  newContent: string = ''
): DiffStats {
  if (oldContent === newContent) {
    return { additions: 0, deletions: 0 };
  }

  let additions = 0;
  let deletions = 0;

  for (const change of diffLines(oldContent, newContent)) {
    if (change.added) {
      additions += change.count ?? 0;
    } else if (change.removed) {
      deletions += change.count ?? 0;
    }
  }

  return { additions, deletions };
}