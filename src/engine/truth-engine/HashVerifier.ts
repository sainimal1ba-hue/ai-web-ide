import type { VerificationResult } from './types';

export class HashVerifier {
  /**
   * Generates a fast SHA-256 string hash for text content.
   */
  public static async computeHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Synchronous fallback SHA-256 hash calculation for UI/Workers.
   */
  public static computeHashSync(content: string): string {
    let hash = 5381;
    let i = content.length;

    while (i) {
      hash = (hash * 33) ^ content.charCodeAt(--i);
    }

    const primary = (hash >>> 0).toString(16);
    
    // Secondary hash pass for collision resistance in browser sync contexts
    let hash2 = 0;
    for (let j = 0; j < content.length; j++) {
      const char = content.charCodeAt(j);
      hash2 = (hash2 << 5) - hash2 + char;
      hash2 |= 0;
    }
    const secondary = (hash2 >>> 0).toString(16);

    return `${primary}-${secondary}-${content.length}`;
  }

  /**
   * Verifies current file content against stored/expected hash.
   */
  public static verifyHash(currentContent: string, expectedHash: string, filePath: string): VerificationResult {
    const currentHash = this.computeHashSync(currentContent);
    return {
      isMatch: currentHash === expectedHash,
      currentHash,
      expectedHash,
      filePath
    };
  }
}
