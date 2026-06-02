#!/usr/bin/env node
import chalk from 'chalk';
import path from 'path';
import { GitExtractor } from './git/extractor.js';
import { HotspotAnalyzer } from './analyzers/hotspots.js';
import { KnowledgeAnalyzer } from './analyzers/knowledge.js';
import { CouplingAnalyzer } from './analyzers/coupling.js';

async function main() {
  const args = process.argv.slice(2);
  const repoPath = args[0] ? path.resolve(args[0]) : process.cwd();
  const extractor = new GitExtractor(repoPath);
  
  console.log(chalk.bold.cyan(`\n🚀 CommitGraph: Analyzing Repository at [${repoPath}]...`));

  try {
    const commits = await extractor.extractLog();
    if (commits.length === 0) {
      console.log(chalk.yellow('⚠️ No commits found. Try running in a Git repository.'));
      return;
    }
    
    const hotspotResults = new HotspotAnalyzer().analyze(commits);
    const knowledgeResults = new KnowledgeAnalyzer().analyze(commits);
    const couplingResults = new CouplingAnalyzer().analyze(commits);

    // 1. Maintenance Heatmap
    console.log(chalk.bold.red('\n🔥 MAINTENANCE HEATMAP (High-Activity Areas):'));
    hotspotResults.slice(0, 7).forEach(h => {
      const riskColor = h.score > 25 ? chalk.red : h.score > 12 ? chalk.yellow : chalk.green;
      const status = h.score > 25 ? '🚨 NEEDS CLEANUP' : h.score > 12 ? '⚠️ GETTING MESSY' : '✅ STABLE';
      console.log(
        `${riskColor('●')} ${h.file.padEnd(35)} | Score: ${riskColor(h.score.toFixed(1).padEnd(5))} | ${chalk.bold(status)}`
      );
    });

    // 2. Team Coverage
    console.log(chalk.bold.blue('\n👥 TEAM COVERAGE (Knowledge Risks):'));
    knowledgeResults.slice(0, 5).forEach(item => {
      const owner = item.owners[0];
      const risk = owner.percentage > 80 ? chalk.red('Only 1 person knows this!') : chalk.green('Shared knowledge');
      console.log(`  ${item.file.padEnd(35)}: ${owner.author} (${owner.percentage}%) - ${risk}`);
    });

    // 3. Hidden Dependencies
    console.log(chalk.bold.magenta('\n🔗 HIDDEN DEPENDENCIES (Files that travel together):'));
    if (couplingResults.length === 0) {
      console.log(chalk.dim('  Files are well-separated. No "package deals" found.'));
    } else {
      couplingResults.slice(0, 5).forEach(c => {
        console.log(`  ${c.pair[0]} + ${c.pair[1]}`);
        console.log(chalk.dim(`  └─ These change together (${(c.degree * 100).toFixed(0)}%). If you change one, check the other!`));
      });
    }

    console.log(chalk.bold.cyan('\n✅ Analysis Complete.\n'));
  } catch (error) {
    console.error(chalk.red('❌ Analysis failed:'), error);
    process.exit(1);
  }
}

main();