#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { GitExtractor } from './git/extractor.js';
import { HotspotAnalyzer } from './analyzers/hotspots.js';
import { KnowledgeAnalyzer } from './analyzers/knowledge.js';
import { CouplingAnalyzer } from './analyzers/coupling.js';

const program = new Command();

program
  .name('commitgraph')
  .description('Git repository forensics for humans')
  .version('1.0.0')
  .argument('[path]', 'path to git repository', '.')
  .option('-j, --json', 'output results as JSON')
  .action(async (repoPathArg, options) => {
    const repoPath = path.resolve(repoPathArg);
    const extractor = new GitExtractor(repoPath);

    try {
      const commits = await extractor.extractLog();
      
      const hotspots = new HotspotAnalyzer().analyze(commits);
      const knowledge = new KnowledgeAnalyzer().analyze(commits);
      const coupling = new CouplingAnalyzer().analyze(commits);

      const fullReport = {
        meta: {
          analyzedAt: new Date().toISOString(),
          repo: repoPath,
          totalCommits: commits.length
        },
        hotspots,
        knowledge,
        coupling
      };

      // Check if user wants JSON output
      if (options.json) {
        console.log(JSON.stringify(fullReport, null, 2));
        return;
      }

      // --- OTHERWISE: Render the Pretty Terminal UI ---
      renderTerminalUI(repoPath, hotspots, knowledge, coupling);

    } catch (error) {
      console.error(chalk.red('❌ Analysis failed:'), error);
      process.exit(1);
    }
  });

function renderTerminalUI(path: string, hotspots: any[], knowledge: any[], coupling: any[]) {
  console.log(chalk.bold.cyan(`\n🚀 CommitGraph: Analyzing [${path}]...`));

  // 1. Heatmap
  console.log(chalk.bold.red('\n🔥 MAINTENANCE HEATMAP:'));
  hotspots.slice(0, 5).forEach(h => {
    const color = h.score > 25 ? chalk.red : chalk.yellow;
    console.log(`${color('●')} ${h.file.padEnd(30)} | Score: ${h.score.toFixed(1)}`);
  });

  // 2. Coverage
  console.log(chalk.bold.blue('\n👥 TEAM COVERAGE:'));
  knowledge.slice(0, 5).forEach(k => {
    console.log(`  ${k.file.padEnd(30)}: ${k.owners[0].author} (${k.owners[0].percentage}%)`);
  });

  // 3. Dependencies
  console.log(chalk.bold.magenta('\n🔗 HIDDEN DEPENDENCIES:'));
  coupling.slice(0, 5).forEach(c => {
    console.log(`  ${c.pair[0]} + ${c.pair[1]} (${(c.degree * 100).toFixed(0)}%)`);
  });

  console.log('\n');
}

program.parse();