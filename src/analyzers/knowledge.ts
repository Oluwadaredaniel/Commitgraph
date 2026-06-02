import { CommitRecord } from '../types/index.js';

export interface FileOwnership {
  file: string;
  owners: { author: string; percentage: number }[];
  totalCommits: number;
}

export class KnowledgeAnalyzer {
  public analyze(commits: CommitRecord[]): FileOwnership[] {
    const fileStats: Record<string, Record<string, number>> = {};

    commits.forEach(commit => {
      commit.files.forEach(file => {
        if (!fileStats[file]) fileStats[file] = {};
        const authorName = commit.author || 'Unknown';
        fileStats[file][authorName] = (fileStats[file][authorName] || 0) + 1;
      });
    });

    return Object.entries(fileStats).map(([file, authors]) => {
      const totalCommits = Object.values(authors).reduce((a, b) => a + b, 0);
      const owners = Object.entries(authors)
        .map(([author, count]) => ({
          author,
          percentage: Math.round((count / totalCommits) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);

      return { file, owners, totalCommits };
    }).sort((a, b) => b.totalCommits - a.totalCommits);
  }
}