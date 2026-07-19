export interface AuditResult {
  downloadUrl: string;
  issues: any[];
}

export interface AuditJob {
  id: string;
  clientUrl: string;
  competitorUrls: string[];
  customInstructions: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: AuditResult;
  progress: number;
  createdAt: number;
}
