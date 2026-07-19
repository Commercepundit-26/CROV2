# CRAWLER_AGENT

## Purpose
Navigate target URLs and extract DOM evidence.

## Scope
To be documented.

## Background
To be documented.

## Business Context
To be documented.

## Dependencies
None.

## Inputs
`clientUrl`, `maxPages`

## Outputs
`CrawlResult[]` (DOM strings, screenshots, URLs).

## Workflow
Browserless connect -> Navigate -> Wait for network idle -> Extract DOM.

## Decision Logic
To be documented.

## Rules
To be documented.

## Edge Cases
To be documented.

## Error Handling
Timeout after 30s. Returns partial data if limit reached.

## Examples
N/A

## Acceptance Criteria
To be documented.

## Related Documents
[EVIDENCE_ENGINE](../06_ENGINES/EVIDENCE_ENGINE.md)

## Implementation Notes
To be documented.

## Future Improvements
To be documented.

## Version History
- **v1.0.0**: Initial Enterprise Documentation.
