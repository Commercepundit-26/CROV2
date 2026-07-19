# Validation Engine

## Purpose
Defines the QA rules and validation gates required for Knowledge Coverage.

## QA Rules
1. **Agents:** Every AI agent must have documentation in `07_AGENTS`.
2. **APIs:** Every API must have documentation in `11_API`.
3. **Prompts:** Every prompt must have documentation in `08_PROMPTS`.
4. **Schemas:** Every JSON schema must exist in `09_SCHEMAS`.
5. **Workflows:** Every workflow must exist in `13_WORKFLOWS`.
6. **Cross-Linking:** Every document must be cross-linked. Orphaned documents are invalid.
7. **Formatting:** Every document must pass the `DOCUMENT_TEMPLATE.md` strict structure.

## Execution
Validation runs at the end of every Antigravity Loop. If validation fails, the loop repeats to fix the discrepancies.