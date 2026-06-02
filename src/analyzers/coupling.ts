import { CommitRecord } from '../types/index.js';

export interface CouplingMetric {
  pair: [string, string];
  coChanges: number;
  degree: number; // 0 to 1 (percentage of times they appear together)
}

export class CouplingAnalyzer {
  public analyze(commits: CommitRecord[]): CouplingMetric[] {
    const pairCounts: Record<string, number> = {};
    const fileTotalChanges: Record<string, number> = {};

    for (const commit of commits) {
      const files = commit.files;
      // Track total changes for each file to calculate degree later
      files.forEach(f => fileTotalChanges[f] = (fileTotalChanges[f] || 0) + 1);

      // Compare every file in the commit with every other file
      for (let i = 0; i < files.length; i++) {
        for (let j = i + 1; j < files.length; j++) {
          const pair = [files[i], files[j]].sort().join('|');
          pairCounts[pair] = (pairCounts[pair] || 0) + 1;
        }
      }
    }

    return Object.entries(pairCounts)
      .map(([pairStr, count]) => {
        const [fileA, fileB] = pairStr.split('|');
        // Degree = how often they change together vs how often they change at all
        const degree = count / Math.min(fileTotalChanges[fileA], fileTotalChanges[fileB]);
        
        return {
          pair: [fileA, fileB] as [string, string],
          coChanges: count,
          degree: parseFloat(degree.toFixed(2))
        };
      })
      .filter(m => m.coChanges > 1) // Only show meaningful coupling
      .sort((a, b) => b.degree - a.degree);
  }
}