import { spawn } from 'child_process';
import { CommitRecord } from '../types';

export class GitExtractor {
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
  }

  public async extractLog(): Promise<CommitRecord[]> {
    return new Promise((resolve, reject) => {
      const git = spawn('git', [
        'log',
        '--pretty=format:%H|%an|%at|%s',
        '--name-only',
      ], { cwd: this.repoPath });

      let rawOutput = '';
      let errorOutput = '';

      git.stdout.on('data', (data) => {
        rawOutput += data.toString();
      });

      git.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      git.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Git failed: ${errorOutput}`));
          return;
        }
        resolve(this.parseRawLog(rawOutput));
      });
    });
  }

  private parseRawLog(raw: string): CommitRecord[] {
    const lines = raw.split(/\r?\n/);
    const commits: CommitRecord[] = [];
    let currentCommit: CommitRecord | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const parts = trimmedLine.split('|');
      
      // If the line has 4 parts and the first part looks like a hex hash
      if (parts.length >= 4 && /^[0-9a-f]+$/i.test(parts[0])) {
        currentCommit = {
          hash: parts[0],
          author: parts[1],
          timestamp: parseInt(parts[2], 10),
          message: parts[3],
          files: []
        };
        commits.push(currentCommit);
      } else if (currentCommit) {
        currentCommit.files.push(trimmedLine);
      }
    }

    return commits;
  }
}