import JSZip from 'jszip';

/**
 * Packs all active workspace files into a downloadable .zip archive.
 */
export async function downloadWorkspaceZip(
  files: Record<string, string>,
  zipFilename: string = 'portfolio-workspace.zip'
): Promise<void> {
  const zip = new JSZip();

  // Add every file in workspace to zip structure
  for (const [filePath, content] of Object.entries(files)) {
    const cleanPath = filePath.replace(/^\/+/, '');
    zip.file(cleanPath, content);
  }

  // Generate blob archive
  const blob = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
