import { describe, it, expect, beforeEach } from 'vitest';
import { GitExtractor } from '../../src/git/extractor.js';

describe('GitExtractor Parser', () => {
  let extractor: GitExtractor;

  beforeEach(() => {
    extractor = new GitExtractor('./');
  });

  it('should correctly parse raw git log output into CommitRecord objects', () => {
    const mockRawOutput = [
      'hash1|Author One|1717336800|feat: first commit',
      'file1.ts',
      'file2.ts',
      '',
      'hash2|Author Two|1717336900|fix: second commit',
      'file1.ts'
    ].join('\n');

    const result = extractor.parseLog(mockRawOutput);

    expect(result).toHaveLength(2);
    expect(result[0].author).toBe('Author One');
    expect(result[0].files).toContain('file1.ts');
  });

  it('should handle empty file lists gracefully', () => {
    const mockOutput = `hash3|Charlie|1717337000|chore: empty commit`;
    const result = extractor.parseLog(mockOutput);
    // Since our logic requires at least one file to count as a commit
    expect(result).toHaveLength(0);
  });
});