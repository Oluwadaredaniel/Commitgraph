import { CommitRecord } from '../types/index.js';

export interface FileOwnership {
  file: string;
  owners: { author: string; percentage: number }[];
  totalCommits: number;
}

export class KnowledgeAnalyzer {
  public analyze(commits: CommitRecord[]): FileOwnership[] {
    const fileStats: Record<string, Record<string, number>> = {};

    // 1. Map authorship per file
    commits.forEach(commit => {
      commit.files.forEach(file => {
        if (!fileStats[file]) fileStats[file] = {};
        fileStats[file][commit.author] = (fileStats[file][commit.author] || 0) + 1;
      });
    });

    // 2. Calculate percentages
    return Object.entries(fileStats).map(([file, authors]) => {
      const totalCommits = Object.values(authors).reduce((a, b) => a + b, 0);
      const owners = Object.entries(authors)
        .map(([author, count]) => ({
          author,
          percentage: parseFloat(((count / totalCommits) * 100).toFixed(1))
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return { file, owners, totalCommits };
    });
  }
}