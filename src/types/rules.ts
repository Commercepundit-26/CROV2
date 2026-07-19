export interface RuleCheck {
  id: string;
  type: 'code' | 'nlp';
  rule: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Rule {
  id: string;
  version: string;
  description: string;
  checks: RuleCheck[];
  required_evidence: string[];
  ai_prompt_template: string;
}
