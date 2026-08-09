import type { FileMetadata } from './types';
import { ASTParser } from './ASTParser';
import { HashVerifier } from './HashVerifier';

export class FileScanner {
  private files: Map<string, FileMetadata> = new Map();

  public getFile(path: string): FileMetadata | undefined {
    return this.files.get(path);
  }

  public getAllFiles(): FileMetadata[] {
    return Array.from(this.files.values());
  }

  /**
   * Registers or updates a file in the Truth Engine repository index.
   */
  public async indexFile(path: string, content: string): Promise<FileMetadata> {
    const hash = HashVerifier.computeHashSync(content);
    const language = ASTParser.detectLanguage(path);
    const existing = this.files.get(path);

    const fileMeta: FileMetadata = {
      id: path,
      path,
      hash,
      size: content.length,
      mtime: Date.now(),
      language,
      astVersion: existing ? existing.astVersion + 1 : 1,
      isStale: false,
      content
    };

    this.files.set(path, fileMeta);
    return fileMeta;
  }

  /**
   * Verifies if a file's current content matches its stored hash.
   * If mismatched, marks the file as stale.
   */
  public verifyFileIntegrity(path: string, currentContent: string): boolean {
    const meta = this.files.get(path);
    if (!meta) return false;

    const result = HashVerifier.verifyHash(currentContent, meta.hash, path);
    if (!result.isMatch) {
      meta.isStale = true;
    }
    return result.isMatch;
  }

  public markStale(path: string): void {
    const meta = this.files.get(path);
    if (meta) {
      meta.isStale = true;
    }
  }

  public removeFile(path: string): void {
    this.files.delete(path);
  }

  public getStaleCount(): number {
    let count = 0;
    this.files.forEach(f => {
      if (f.isStale) count++;
    });
    return count;
  }
}
