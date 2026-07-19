# Master Controller

## Purpose
Defines how the CRO-X Knowledge System thinks, plans, and executes the documentation generation loop.

## How the System Thinks
- **Knowledge over Code:** Application code executes behavior; Knowledge defines behavior.
- **Rule-Based Execution:** AI Agents never make business decisions; they follow rules documented in this repository.
- **Continuous Validation:** The system constantly audits itself to ensure 100% knowledge coverage.

## Generation Order
1. 00_SYSTEM (The Brain)
2. 01_PRODUCT & 02_ARCHITECTURE (The Foundation)
3. 09_SCHEMAS & 11_API (The Contracts)
4. 04_RULES & 03_CRO (The Business Logic)
5. 06_ENGINES & 07_AGENTS (The Executors)
6. 08_PROMPTS (The AI Interfaces)
7. 13_WORKFLOWS & 10_DATABASE (The State & Pipelines)
8. 12_UI, 14_IMPLEMENTATION, 15_REFERENCE (The Front-end & Extras)

## Folder Priorities
Folders 00 through 04 are **Priority 1 (Critical)**.
Folders 05 through 11 are **Priority 2 (High)**.
Folders 12 through 15 are **Priority 3 (Standard)**.

## Dependencies
- MASTER_INDEX.md
- VALIDATION_ENGINE.md

## Validation Gates
Before a generation loop completes:
1. Is every JSON schema documented?
2. Are there any orphaned prompts?
3. Does every document follow the `DOCUMENT_TEMPLATE.md`?

## Completion Criteria
Knowledge Coverage = 100% (No undocumented APIs, Prompts, Agents, Rules, or Workflows).