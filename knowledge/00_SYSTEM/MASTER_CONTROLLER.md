# Master Controller

## Section 1: Executive Overview
The Master Controller is the supreme brain of the CRO-X Knowledge Repository. It dictates how the meta-knowledge system thinks, plans, executes, and validates the auto-generation of all other documentation. The system is designed to reach 100% knowledge coverage autonomously.

## Section 2: Product Vision
CRO-X automates the manual, subjective, and expensive CRO consulting industry. The platform uses Playwright crawlers, AI heuristic analysis, and dynamic PPT generation to deliver enterprise-grade conversion rate optimization audits at scale. The knowledge repository serves as the unadulterated source of truth for all business logic powering this vision.

## Section 3: Architecture
The architecture separates execution from decision-making:
- **Application Code:** Next.js Serverless Functions, Upstash QStash/Redis, Browserless.
- **Meta-Knowledge System:** Markdown files acting as the business brain, overriding code assumptions.

## Section 4: Knowledge Principles
1. Knowledge lives in markdown.
2. Code executes knowledge.
3. Agents never own business logic; they only execute tasks.
4. Rules own business decisions.
5. Evidence validates rules.

## Section 5: Generation Engine
Defines the triggers for file creation. Missing files are detected during the Antigravity Loop audit and auto-generated strictly according to predefined templates and naming standards.

## Section 6: Validation Engine
QA gates that prevent a generation loop from completing until:
- 100% of Agents, APIs, Prompts, and Schemas are documented.
- All documents contain valid cross-references.
- The Master Index is accurate.

## Section 7: Folder Standards
Folders are numbered for priority and dependency order:
- `00_SYSTEM` (Brain)
- `01_PRODUCT` to `04_RULES` (Core Logic)
- `05_AI` to `11_API` (Executors)
- `12_UI` to `15_REFERENCE` (Front-end & Meta)

## Section 8: Document Standards
Every document strictly adheres to `DOCUMENT_TEMPLATE.md`. No exceptions. Missing sections must explicitly state "N/A" rather than being deleted.

## Section 9: Cross References
Duplicate knowledge is strictly forbidden. Documents must link via relative markdown links to the authoritative source file (e.g., Agents link to Rules; they do not redefine Rules).

## Section 10: AI Agent Rules
Agents must remain blind executors. They receive inputs (DOM, URLs) and schemas, and return structured JSON. An agent cannot unilaterally decide if a button is "good" or "bad" without citing a specific Rule from `04_RULES`.

## Section 11: Screenshot Rules
Screenshots capture visual evidence of heuristic violations.
- Viewport must be standardized (1920x1080).
- Fallback storage must exist if Base64 memory bloating occurs.
- Highlight bounding boxes must map to DOM coordinates.

## Section 12: Evidence Rules
No rule can be marked as violated without Evidence. Evidence includes:
- DOM mapping (XPath/Selectors).
- Visual Mapping (Screenshots).
- Competitor Mapping (Missing features compared to SERP results).

## Section 13: Rule Library Standards
Rules reside in `04_RULES`. They are the atomic units of business logic (e.g., "Primary CTA Contrast must be > 4.5"). Rules define the threshold, severity, and associated AI Prompt for generating a recommendation.

## Section 14: Prompt Standards
Prompts live in `08_PROMPTS`. They must document Inputs (context variables) and Outputs (JSON schemas). Prompts must instruct the LLM to follow the Rule Library, not its own subjective training data.

## Section 15: Schema Standards
JSON Contracts govern all inter-agent and API communication. Any change to a schema in `09_SCHEMAS` forces a version bump in dependent Engine and Agent documents.

## Section 16: Versioning
Semantic versioning is strictly applied to the repository. Deprecated knowledge is flagged via GitHub alerts (`> [!WARNING] DEPRECATED`) rather than silently deleted, ensuring migration tracking.

## Section 17: Quality Standards
Writing must be concise, factual, active-voice, and business-driven. Code snippets must use proper language tags. Acceptance requires that a new engineer can build the feature using only the document.

## Section 18: Generation Workflow
The Antigravity Loop:
Read Repository -> Read Master Controller -> Read Master Index -> Audit Repository -> Find Missing Knowledge -> Create Missing Folder -> Create Missing Files -> Cross-link -> Validate -> Update Master Index -> Repeat.

## Section 19: Acceptance Criteria
The system is complete when Knowledge Coverage = 100% in the `MASTER_INDEX.md`, and 0 orphan references exist across the 15 directories.

## Section 20: Appendices
- [Master Index](./MASTER_INDEX.md)
- [Document Template](./DOCUMENT_TEMPLATE.md)