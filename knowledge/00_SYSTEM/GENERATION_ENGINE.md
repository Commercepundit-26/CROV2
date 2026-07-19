# Generation Engine

## Purpose
Defines the workflow for auto-generating new knowledge files.

## When to Create Files
Files are created dynamically when the Antigravity Loop detects a missing component (e.g., a new AI prompt is found in the codebase but has no corresponding markdown file in `08_PROMPTS`).

## Auto-Generation Workflow
1. Read Repository Codebase.
2. Read Master Controller & Master Index.
3. Audit Repository for missing coverage.
4. Create Missing Folder (if necessary).
5. Create Missing File strictly following `DOCUMENT_TEMPLATE.md`.
6. Cross-link via `CROSS_REFERENCE_ENGINE.md`.
7. Update `MASTER_INDEX.md`.

## Naming Standards
- All folders MUST be UPPERCASE and prefixed with a two-digit number (e.g., `07_AGENTS`).
- All files MUST be UPPERCASE with underscores (e.g., `CRAWLER_AGENT.md`).

## Folder Standards
Folders must only contain Markdown (`.md`) files. No code or media unless inside a specific `_assets` sub-directory.