import { GitExtractor } from './git/extractor.js';
import { HotspotAnalyzer } from './analyzers/hotspots.js';
import { KnowledgeAnalyzer } from './analyzers/knowledge.js';
import { CouplingAnalyzer } from './analyzers/coupling.js'; // Added

async function main() {
  const repoPath = process.cwd();
  const extractor = new GitExtractor(repoPath);
  
  console.log('🚀 CommitGraph: Analyzing repository...');

  try {
    const commits = await extractor.extractLog();
    
    const hotspotResults = new HotspotAnalyzer().analyze(commits);
    const knowledgeResults = new KnowledgeAnalyzer().analyze(commits);
    const couplingResults = new CouplingAnalyzer().analyze(commits); // Added

    console.log('\n🔥 Top Code Hotspots:');
    console.table(hotspotResults.slice(0, 5));

    console.log('\n🧠 Knowledge Distribution:');
    knowledgeResults.slice(0, 5).forEach(item => {
      console.log(`${item.file}: ${item.owners[0].author} (${item.owners[0].percentage}%)`);
    });

    console.log('\n🔗 Logical Coupling (Hidden Dependencies):');
    if (couplingResults.length === 0) {
      console.log('No significant coupling detected yet.');
    } else {
      couplingResults.slice(0, 5).forEach(c => {
        console.log(`[${c.pair[0]}] + [${c.pair[1]}] (${(c.degree * 100).toFixed(0)}% together)`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();