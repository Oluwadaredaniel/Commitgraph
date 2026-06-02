import { GitExtractor } from './git/extractor.js';
import { HotspotAnalyzer } from './analyzers/hotspots.js';

async function main() {
  const repoPath = process.cwd();
  const extractor = new GitExtractor(repoPath);
  
  console.log('🚀 CommitGraph: Analyzing repository...');

  try {
    // 1. Extract the raw data
    const commits = await extractor.extractLog();
    
    // 2. Run the analysis
    const analyzer = new HotspotAnalyzer();
    const hotspots = analyzer.analyze(commits);

    // 3. Output the results
    console.log('\n🔥 Top Code Hotspots:');
    console.table(
      hotspots.slice(0, 10).map(h => ({
        File: h.file,
        Changes: h.changeCount,
        'Risk Score': h.score
      }))
    );

  } catch (error) {
    console.error('❌ Error analyzing repository:', error);
    process.exit(1);
  }
}

main();