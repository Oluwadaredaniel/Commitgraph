# PROJECT_SPEC.md

## 1. The Problem
Every Git repository accumulates historical data, but `git log` is unreadable noise. Engineering teams and solo developers struggle to quickly answer critical codebase health questions:
* Which files break the most frequently?
* Which areas of the codebase are abandoned?
* Who truly owns what module?
* Where should refactoring efforts be prioritized?

Currently, answering these requires manual analysis of thousands of commits. CommitGraph automates this to provide immediate, actionable codebase intelligence.

## 2. Target Users
* **Solo Developers:** Auditing personal projects before major refactors.
* **Engineering Leads:** Reviewing repository health and risk distribution during sprint planning.
* **Onboarding Developers:** Rapidly understanding architectural hotspots and finding subject matter experts.
* **Freelancers/Consultants:** Performing objective technical audits for new clients.
* **CI/CD Pipelines:** Tracking codebase health metrics automatically over time.

## 3. Success Criteria
* **Zero Config:** A user can run `npx commitgraph` in any Git repository and receive insights immediately.
* **Actionable Output:** The tool must prescribe insights (e.g., "Refactor `auth.ts`") rather than just dumping raw data (e.g., "120 commits here").
* **Local-First:** 100% of data extraction and analysis must happen on the user's machine.
* **Speed:** Must be able to parse and analyze 10,000+ commits in under 5 seconds.

## 4. V1 Scope (Features & Architecture)
* **Git Data Extractor:** Safe, memory-efficient extraction of commit history (hashes, authors, timestamps, files, messages).
* **Analyzers:**
  * **Hotspots:** Frequently changed files correlated with bug-fix keywords.
  * **Dead Zones:** Areas of the codebase untouched in 6+ months.
  * **Ownership Map:** Percentage-based breakdown of who contributes most to specific files/directories.
  * **Refactor Candidates:** Prioritized list of fragile files based on activity and author count.
* **Scoring Engine:** A deterministic algorithm calculating an overall "Repository Health Score" (0-100).
* **Reporting Layer:** Output support for Terminal (colored, formatted), JSON (for CI/CD), and Markdown (for documentation).

### CLI Commands (V1 Surface Area)
The CLI will have a strictly minimal surface area.

* `commitgraph analyze [path]`
    * **Description:** Runs the full analysis suite on the specified Git repository. Defaults to `.` (current directory).
    * **Options:**
        * `-f, --format <type>`: Output format. Options: `terminal` (default), `json`, `markdown`.
        * `-s, --since <time>`: Limit analysis to a timeframe (e.g., `90d`, `6m`, `1y`). Default: `all`.
* `commitgraph --version`
    * **Description:** Outputs the current installed version.
* `commitgraph --help`
    * **Description:** Outputs usage instructions and available flags.

## 5. Non-Goals (Strictly Excluded from V1)
* ❌ Plugin system or third-party analyzer execution.
* ❌ External API calls or telemetry tracking.
* ❌ Web-based dashboards or GUIs.
* ❌ GitHub/GitLab integration (API auth, PR reviews).
* ❌ Historical trend storage (no database, stateless execution only).

## 6. Security Requirements
* **No `exec()`:** All Git shell commands must use `child_process.spawn()` with strict argument arrays to prevent command injection.
* **Path Traversal Protection:** The Repo Validator must reject symlinks or paths resolving outside the `.git` root.
* **Supply Chain Minimization:** Prefer Node.js built-ins (`fs`, `crypto`, `child_process`). External dependencies must be strictly audited and kept to an absolute minimum.
* **Sandboxed Execution:** No dynamic code evaluation or arbitrary file execution.

## 7. Performance Targets
* **Memory Management:** Implement stream-based or chunked parsing for Git histories to prevent `ERR_SET_SIZE_EXCEEDED` on massive monorepos.
* **Parallelization:** Independent analyzers (e.g., Ownership vs. Dead Zones) should execute concurrently.

## 8. Milestones
* **v0.1.0 (Foundation):** CLI scaffolding, safe Git extraction, and basic repo stats (commit count, authors, files).
* **v0.2.0 (Core Analysis):** Implementation of Hotspots and Dead Zones analyzers based on internal `CommitRecord` data contract.
* **v0.3.0 (Advanced Analysis):** Ownership Maps, Refactor Candidates, and the Scoring Engine.
* **v0.4.0 (Reporting):** Multi-format output (Terminal, JSON, Markdown).
* **v1.0.0 (Release Candidate):** Full test coverage (Unit/Integration/Snapshot), security audit, CI/CD pipeline integration, and public npm release.