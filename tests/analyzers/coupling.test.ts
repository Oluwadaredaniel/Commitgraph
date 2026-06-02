import { describe, it, expect } from 'vitest';
import { CouplingAnalyzer } from '../../src/analyzers/coupling.js';
import { CommitRecord } from '../../src/types/index.js';

describe('CouplingAnalyzer', () => {
  const analyzer = new CouplingAnalyzer();

  it('should identify files that are frequently committed together', () => {
    const mockCommits: CommitRecord[] = [
      // File A and B are committed together twice
      { hash: '1', author: 'A', timestamp: 1, message: 'm1', files: ['src/service.ts', 'tests/service.test.ts'] },
      { hash: '2', author: 'A', timestamp: 2, message: 'm2', files: ['src/service.ts', 'tests/service.test.ts', 'README.md'] },
      // File C is solo
      { hash: '3', author: 'A', timestamp: 3, message: 'm3', files: ['package.json'] },
    ];

    const results = analyzer.analyze(mockCommits);

    // Find the pairing for service and its test
    const coupling = results.find(r => r.pair.includes('src/service.ts') && r.pair.includes('tests/service.test.ts'));

    expect(coupling).toBeDefined();
    expect(coupling?.coChanges).toBe(2);
    expect(coupling?.degree).toBe(1); // They always appeared together when touched
  });

  it('should filter out pairs that only changed together once', () => {
    const mockCommits: CommitRecord[] = [
      { hash: '1', author: 'A', timestamp: 1, message: 'm1', files: ['file1.ts', 'file2.ts'] },
    ];

    const results = analyzer.analyze(mockCommits);
    expect(results).toHaveLength(0); // Because of our .filter(m => m.coChanges > 1)
  });
});