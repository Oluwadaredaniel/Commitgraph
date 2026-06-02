import { CommitRecord } from '../types/index.js';

export interface HotspotMetric {
  file: string;
  changeCount: number;
  score: number; // Normalized score 0-10
}

export class HotspotAnalyzer {
  public analyze(commits: CommitRecord[]): HotspotMetric[] {
    const fileCounts: Record<string, number> = {};

    // 1. Count occurrences of each file
    commits.forEach(commit => {
      commit.files.forEach(file => {
        fileCounts[file] = (fileCounts[file] || 0) + 1;
      });
    });

    // 2. Convert to array and find max changes for scoring
    const metrics = Object.entries(fileCounts).map(([file, count]) => ({
      file,
      changeCount: count
    }));

    const maxChanges = Math.max(...metrics.map(m => m.changeCount), 1);

    // 3. Return sorted results with scores
    return metrics
      .map(m => ({
        ...m,
        score: parseFloat(((m.changeCount / maxChanges) * 10).toFixed(2))
      }))
      .sort((a, b) => b.changeCount - a.changeCount);
  }
}