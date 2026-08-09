// Strict exclusion list for directories that contain build artifacts, caches, or dependencies
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  'turbopack',
  '.nuxt',
  '.output',
  'dist',
  'build',
  'out',
  '.vite',
  'coverage',
  '.idea',
  '.vscode',
  '.cache',
  'tmp',
  'temp',
  'bin',
  'obj'
]);

// Strict exclusion list for extensions that represent binary data, build outputs, or Turbopack caches
const IGNORED_EXTENSIONS = new Set([
  '.sst',
  '.meta',
  '.pack',
  '.idx',
  '.cache',
  '.log',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.webp',
  '.zip',
  '.tar',
  '.gz',
  '.pdf',
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.DS_Store'
]);

/**
 * Validates if a file is an authentic source code file and not a build chunk or cache artifact.
 */
export function isCleanSourceFile(filename: string, fullPath: string): boolean {
  if (!filename || filename.startsWith('.')) return false;

  // Check directory path segments
  const pathParts = fullPath.split('/');
  for (const part of pathParts) {
    if (IGNORED_DIRECTORIES.has(part.toLowerCase())) {
      return false;
    }
  }

  // Check file extension
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  if (IGNORED_EXTENSIONS.has(ext)) {
    return false;
  }

  // Check chunk & cache string patterns
  if (
    filename.includes('.chunk.') ||
    filename.includes('.bundle.') ||
    filename.endsWith('.d.ts') && fullPath.includes('.next') ||
    /^\d+\.(sst|meta)$/.test(filename)
  ) {
    return false;
  }

  return true;
}
