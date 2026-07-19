# Master Controller

## Section 1: Executive Summary
The Master Controller is the operating system for the CRO-X platform. It serves as the single source of truth for the entire architecture, governing how the meta-knowledge system thinks, plans, executes, and validates the autonomous generation of all documentation and code behaviors.

## Section 2: Vision, Mission, Goals
- **Vision:** To automate the $100B Conversion Rate Optimization (CRO) consulting industry using AI.
- **Mission:** Deliver enterprise-grade, heuristic-based CRO audits autonomously via headless crawlers and LLMs.
- **Goals:** 100% test coverage, 100% knowledge coverage, zero hardcoded business logic in application code, and instantaneous dynamic PPT generation.

## Section 3: Product Definition
CRO-X is an AI-powered B2B SaaS platform that accepts a client URL, crawls the site, evaluates the DOM against a strict set of UX/UI heuristics, discovers competitors, and outputs a branded PowerPoint deck of actionable recommendations.

## Section 4: Business Requirements
- Must generate audits in under 60 seconds.
- Must eliminate subjective AI bias by strictly binding LLM outputs to predefined heuristics.
- Must provide visual proof (screenshots) and competitor benchmarks for every broken rule.

## Section 5: Functional Requirements
- Headless crawling of client URLs.
- DOM and Visual Evidence extraction.
- AI-driven heuristic evaluation.
- Dynamic `.pptx` generation and cloud storage delivery.
- Asynchronous background job queue processing.

## Section 6: Non Functional Requirements
- **Scalability:** Vercel Serverless + Upstash QStash.
- **Performance:** Browserless WebSocket connections to prevent Vercel memory limits.
- **Maintainability:** Meta-Knowledge Repository architecture.

## Section 7: Complete User Flow
1. User enters URL on Next.js Dashboard.
2. User submits audit request (`/api/audit`).
3. User sees polling loading screen (`/api/audit/status`).
4. System finishes job; User clicks "Download PPT".

## Section 8: System Architecture
- **Frontend:** Next.js 14 App Router, TailwindCSS, shadcn/ui.
- **Backend:** Next.js Serverless API routes.
- **Queue/State:** Upstash QStash & Redis.
- **Storage:** Supabase Storage (PostgreSQL).

## Section 9: AI Architecture
OpenAI (GPT-4o) acts strictly as a reasoning engine, not a decision-maker. It is fed specific prompts, the raw DOM, and strict JSON schemas, and must return structured data outlining how a specific rule was violated.

## Section 10: Agent Architecture
Agents (Crawler, Evaluator, Competitor) are modular, stateless executors. They receive inputs, execute their specific domain task via APIs, and return payloads. They do not own rules.

## Section 11: Knowledge Architecture
Knowledge is separated from code. Application code merely executes the rules defined in `04_RULES`. The Meta-Knowledge System forces business logic to be documented in markdown before it can be implemented in code.

## Section 12: Folder Structure
- `00_SYSTEM/`
- `01_PRODUCT/` through `04_RULES/`
- `05_AI/` through `09_SCHEMAS/`
- `10_DATABASE/` through `15_REFERENCE/`

## Section 13: Knowledge Generation Engine
The Antigravity Loop automatically audits the repository, finds missing components, and dynamically generates the missing markdown documentation based on the Universal Template.

## Section 14: Document Generation Rules
All generated files must map 1:1 to an actual system component, must be cross-linked, and must be placed in their respective numbered directories.

## Section 15: Document Templates
Every document must follow `DOCUMENT_TEMPLATE.md`, including Scope, Dependencies, Workflow, Edge Cases, and Validation logic.

## Section 16: Validation Engine
QA gates prevent generation loops from concluding until 100% of APIs, Schemas, Agents, and Rules are thoroughly documented and cross-linked.

## Section 17: Cross Reference Engine
Duplicate knowledge is forbidden. If Agent A uses Rule B, Agent A's documentation must link to Rule B using a relative markdown link. It cannot redefine Rule B.

## Section 18: Version Control
Semantic Versioning (vMajor.Minor.Patch) is enforced. Breaking changes to `09_SCHEMAS` force version bumps in dependent Engine documents. Deprecation uses `> [!WARNING]` alerts.

## Section 19: Quality Standards
Writing must be concise, factual, and active-voice. Code examples use proper syntax highlighting. Acceptance requires new engineers to understand the implementation without asking questions.

## Section 20: Rule Library Standards
Rules (`04_RULES`) are the atomic units of business logic. They dictate what makes a UI element "good" or "bad" (e.g., contrast ratios, fold positioning).

## Section 21: Prompt Standards
Prompts (`08_PROMPTS`) must strictly define Input context variables and Output JSON schemas. They must instruct the AI to adhere to the Rule Library.

## Section 22: Screenshot Engine
Browserless integration via Playwright. Standardized to 1920x1080 viewports. Screenshots are captured to provide visual proof for the PPT generator.

## Section 23: Evidence Engine
No rule can be marked violated without evidence. Evidence includes DOM mapping (selectors) and Visual Mapping (Screenshots).

## Section 24: Competitor Discovery
Uses AI and SERP APIs to identify top industry competitors, extracting missing features from the client URL to form a Competitor Gap Analysis.

## Section 25: Recommendation Engine
AI generates actionable recommendations based *strictly* on the violated heuristic rule and the extracted evidence.

## Section 26: PPT Engine
`PptxGenJS` rebuilds the UniformSport template dynamically. Generates Master Slides, Issue Slides, and Tables, injecting the Base64 screenshots and AI recommendations.

## Section 27: Workflow Definitions
Outlines asynchronous processes (e.g., QStash webhook delivery, retry logic on 500 errors, Redis state management).

## Section 28: JSON Contracts
Strict TypeScript interfaces and JSON schemas that dictate inter-agent communication. Ensures data consistency between the Crawler, AI, and PPT Engines.

## Section 29: Acceptance Criteria
The system is complete when Knowledge Coverage = 100%, and 0 orphan references exist across the 15 directories.

## Section 30: Autonomous Knowledge Generation Workflow
Read Repository -> Audit -> Find Missing -> Generate strictly via Template -> Cross-link -> Validate -> Update Master Index -> Repeat.