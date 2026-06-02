import { spawn } from 'child_process';
import { CommitRecord } from '../types/index.js';

export class GitExtractor {
  private readonly ignoredFiles = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    '.eslintrc.json',
    'eslint.config.mjs',
    '.gitignore'
  ];

  constructor(private repoPath: string) {}

  public async extractLog(): Promise<CommitRecord[]> {
    return new Promise((resolve, reject) => {
      const git = spawn('git', ['log', '--name-only', '--pretty=format:%H|%an|%at|%s'], {
        cwd: this.repoPath,
      });

      let output = '';
      git.stdout.on('data', (data) => (output += data.toString()));
      git.on('close', () => resolve(this.parseLog(output)));
      git.on('error', reject);
    });
  }

  // Changed from private to public so tests can access it
  public parseLog(rawLog: string): CommitRecord[] {
    const commits: CommitRecord[] = [];
    const blocks = rawLog.split('\n\n');

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 1) continue;

      const [hash, author, timestamp, message] = lines[0].split('|');
      if (!hash) continue;

      const files = lines.slice(1).filter(f => !this.ignoredFiles.includes(f.trim()));

      if (files.length > 0) {
        commits.push({
          hash,
          author,
          timestamp: parseInt(timestamp, 10),
          message,
          files,
        });
      }
    }
    return commits;
  }
}