# Architecture: CommitGraph

## Design Philosophy
CommitGraph uses a **Pipe-and-Filter** architecture. 

1. **Extraction Layer (Git):** Uses `child_process.spawn` to stream raw git logs.
2. **Normalization Layer:** Converts raw logs into a `CommitRecord` interface.
3. **Analysis Engine:** A collection of pure functions that process `CommitRecord[]`.
4. **Scoring Engine:** Aggregates analyzer outputs into a weighted health score.
5. **Reporting Layer:** Formats the final data for the CLI, JSON, or Markdown.

## Data Contract
All analyzers must adhere to the `CommitRecord` interface:
- hash: string
- author: string
- timestamp: number
- files: string[]
- message: string

## Security Boundaries
- **No Shell:** `exec()` is forbidden. All Git calls must use `spawn`.
- **Stateless:** The core logic must not write to the file system except for requested reports.