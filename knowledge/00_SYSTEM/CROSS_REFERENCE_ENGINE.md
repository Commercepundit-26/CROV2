# Cross Reference Engine

## Purpose
Defines how documents reference each other to prevent duplicate knowledge.

## Dependency Graph
- `00_SYSTEM` is the root.
- `01_PRODUCT` depends on `00_SYSTEM`.
- `07_AGENTS` depends on `08_PROMPTS` and `04_RULES`.
- `06_ENGINES` depends on `09_SCHEMAS` and `11_API`.

## Navigation Rules
- Links must use relative paths (e.g., `[Crawler Agent](../07_AGENTS/CRAWLER_AGENT.md)`).
- Links must point to the specific topic; avoid vague "read more here" links.

## Knowledge Ownership
- If a rule defines how an Agent works, the Rule belongs in `04_RULES`, and the Agent doc merely references it.
- **Agents DO NOT own rules.** They only execute them.

## Duplicate Prevention
If two documents explain the same concept, the text must be removed from one and replaced with a direct link to the authoritative source document.