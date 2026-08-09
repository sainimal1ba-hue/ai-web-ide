/**
 * Computes line addition (+) and deletion (-) statistics between two file content strings.
 */
export interface DiffStats {
  additions: number;
  deletions: number;
}

export function computeLineDiffStats(oldContent: string = '', newContent: string = ''): DiffStats {
  if (!oldContent && !newContent) return { additions: 0, deletions: 0 };
  if (!oldContent) return { additions: newContent.split('\n').length, deletions: 0 };
  if (!newContent) return { additions: 0, deletions: oldContent.split('\n').length };

  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  let additions = 0;
  let deletions = 0;

  for (const line of newLines) {
    if (!oldSet.has(line)) additions++;
  }

  for (const line of oldLines) {
    if (!newSet.has(line)) deletions++;
  }

  return { additions, deletions };
}
