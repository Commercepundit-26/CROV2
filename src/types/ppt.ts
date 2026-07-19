import { Issue } from '../lib/schemas';
import { AIOutput } from './ai';

export interface AIEnrichedIssue extends Issue {
  ai: AIOutput;
  pageType?: string;
}

export interface AuditSlideData {
  clientUrl: string;
  issues: AIEnrichedIssue[];
  missingFeatures: any[];
  recommendations: string[];
}
