import { Issue } from '../lib/schemas';
import { Rule } from './rules';

export interface AIInput {
  issue: Issue;
  evidence: Record<string, any>;
  rule: Rule;
}

export interface AIOutput {
  title: string;
  description: string;
  businessImpact: string;
  recommendation: string;
  confidence: number;
}
