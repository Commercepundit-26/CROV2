# Version Control

## Purpose
Defines how knowledge is updated, versioned, and deprecated over time.

## Versioning
- Use Semantic Versioning (vMajor.Minor.Patch) at the bottom of every document under `Version History`.
- **Major:** Structural change to a workflow or engine.
- **Minor:** Addition of a new rule or prompt.
- **Patch:** Fixing typos or clarifying text.

## Deprecation & Migration
- Do not delete old knowledge immediately. Mark the header with `> [!WARNING] DEPRECATED` and link to the new standard.
- Migration guides must be placed in `14_IMPLEMENTATION`.

## Breaking Changes
Any change to `09_SCHEMAS` or `11_API` that breaks backward compatibility must trigger an automatic update to the dependent `07_AGENTS` documents.