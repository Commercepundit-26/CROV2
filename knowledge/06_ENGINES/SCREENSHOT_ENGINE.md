# SCREENSHOT_ENGINE

## Purpose
Capture visual evidence of heuristic violations.

## Scope
Viewport cropping, 16:9 aspect ratios, Browserless connection.

## Background
To be documented.

## Business Context
To be documented.

## Dependencies
`playwright`, `browserless.io`

## Inputs
N/A

## Outputs
N/A

## Workflow
Crawler fetches page -> Identifies coordinates -> Captures screenshot -> Returns Base64.

## Decision Logic
To be documented.

## Rules
To be documented.

## Edge Cases
Large pages causing Base64 memory bloating. Fallback to Supabase direct upload needed.

## Error Handling
Standard error handling applies.

## Examples
N/A

## Acceptance Criteria
To be documented.

## Related Documents
[CRAWLER_AGENT](../07_AGENTS/CRAWLER_AGENT.md)

## Implementation Notes
To be documented.

## Future Improvements
To be documented.

## Version History
- **v1.0.0**: Initial Enterprise Documentation.
