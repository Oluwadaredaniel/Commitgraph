import { describe, it, expect } from 'vitest';
import { HotspotAnalyzer } from '../../src/analyzers/hotspots.js';
import { CommitRecord } from '../../src/types/index.js';

describe('HotspotAnalyzer', () => {
  const analyzer = new HotspotAnalyzer();

  it('should correctly rank files by change frequency', () => {
    const mockCommits: CommitRecord[] = [
      { hash: '1', author: 'A', timestamp: 1, message: 'm1', files: ['file1.ts', 'file2.ts'] },
      { hash: '2', author: 'B', timestamp: 2, message: 'm2', files: ['file1.ts'] },
      { hash: '3', author: 'C', timestamp: 3, message: 'm3', files: ['file1.ts', 'file3.ts'] },
    ];

    const results = analyzer.analyze(mockCommits);

    expect(results[0].file).toBe('file1.ts');
    expect(results[0].changeCount).toBe(3);
    expect(results[0].score).toBe(10); // Max changes should be score 10
    expect(results).toHaveLength(3);
  });

  it('should return an empty array when no commits are provided', () => {
    expect(analyzer.analyze([])).toEqual([]);
  });
});