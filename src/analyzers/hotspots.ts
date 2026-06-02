import { CommitRecord } from '../types/index.js';
import fs from 'fs';
import path from 'path';

export interface HotspotMetric {
  file: string;
  changeCount: number;
  sloc: number;
  score: number;
}

export class HotspotAnalyzer {
  private getSLOC(filePath: string): number {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) return 0;
      const content = fs.readFileSync(fullPath, 'utf-8');
      return content.split('\n').length;
    } catch {
      return 0;
    }
  }

  public analyze(commits: CommitRecord[]): HotspotMetric[] {
    const fileCounts: Record<string, number> = {};

    commits.forEach(commit => {
      commit.files.forEach(file => {
        fileCounts[file] = (fileCounts[file] || 0) + 1;
      });
    });

    const metrics = Object.entries(fileCounts).map(([file, count]) => {
      const sloc = this.getSLOC(file);
      // Risk = Churn * Logarithmic Complexity
      // We use Log10 so that a 1000-line file is weighted significantly but doesn't 
      // completely break the scale compared to a 100-line file.
      const score = count * (sloc > 0 ? Math.log10(sloc + 1) : 1);

      return {
        file,
        changeCount: count,
        sloc,
        score: parseFloat(score.toFixed(2))
      };
    });

    return metrics.sort((a, b) => b.score - a.score);
  }
}