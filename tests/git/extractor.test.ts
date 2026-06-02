import { describe, it, expect } from 'vitest';
import { GitExtractor } from '../../src/git/extractor.js';

describe('GitExtractor Parser', () => {
  it('should correctly parse raw git log output into CommitRecord objects', () => {
    const extractor = new GitExtractor('.') as any;

    const mockRawOutput = [
      'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2|Alice|1717329600|feat: initial commit',
      'src/auth.ts',
      'src/utils.ts',
      'b2c3d4e5f6b2c3d4e5f6b2c3d4e5f6b2c3d4e5f6|Bob|1717333200|fix: layout',
      'src/styles.css',
    ].join('\n');

    const result = extractor.parseRawLog(mockRawOutput);

    expect(result).toHaveLength(2);
    expect(result[0].author).toBe('Alice');
    expect(result[1].author).toBe('Bob');
  });

  it('should handle empty file lists gracefully', () => {
    const extractor = new GitExtractor('.') as any;
    // Use a clean 40-character hash
    const hash = 'f'.repeat(40);
    const mockOutput = `${hash}|Charlie|1717336800|chore: empty commit`;

    const result = extractor.parseRawLog(mockOutput);

    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Charlie');
    expect(result[0].files).toHaveLength(0);
  });
});
