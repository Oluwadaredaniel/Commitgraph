export interface CommitRecord {
  hash: string;
  author: string;
  timestamp: number; // Unix timestamp
  message: string;
  files: string[];
}

export interface AnalyzerResult {
  name: string;
  score: number;
  insights: string[];
  data: unknown; // Result payload specific to the analyzer
}
