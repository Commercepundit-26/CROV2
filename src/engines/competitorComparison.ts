import { Issue } from '../lib/schemas';
import { Rule } from '../types/rules';

export interface MissingFeature {
  ruleId: string;
  competitorUrl: string;
  evidence: any;
}

export async function compareWithCompetitors(
  clientIssues: Issue[],
  competitorIssuesMap: Record<string, Issue[]>,
  rules: Rule[]
): Promise<MissingFeature[]> {
  const missingFeatures: MissingFeature[] = [];

  // A missing feature is defined as: The client failed a rule check (has an issue for a ruleId),
  // but a competitor passed it (does NOT have an issue for that ruleId).
  
  for (const clientIssue of clientIssues) {
    const ruleId = clientIssue.rule_id;
    
    for (const [competitorUrl, competitorIssues] of Object.entries(competitorIssuesMap)) {
      const competitorHasIssue = competitorIssues.some(issue => issue.rule_id === ruleId);
      
      if (!competitorHasIssue) {
        // Competitor passes where client fails!
        missingFeatures.push({
          ruleId,
          competitorUrl,
          // Since we don't store "passing evidence", we just note the missing feature
          // We could potentially store something from the competitor's crawled data in the future
          evidence: {
            note: \`Competitor \${competitorUrl} successfully implements \${ruleId}\`,
            clientFailedCheck: clientIssue.title
          }
        });
      }
    }
  }

  return missingFeatures;
}
