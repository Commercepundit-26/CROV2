import { z } from 'zod';

export const AuditJobSchema = z.object({
  id: z.string().uuid(),
  client_url: z.string().url(),
  competitor_urls: z.array(z.string().url()).optional(),
  custom_instructions: z.string().optional(),
  status: z.enum(['pending', 'crawling', 'analyzing', 'generating', 'completed', 'failed']),
  created_at: z.string()
});
export type AuditJob = z.infer<typeof AuditJobSchema>;

export const EvidenceSchema = z.object({
  screenshot_id: z.string(),
  bounding_box: z.any(),
  computed_styles: z.any().optional(),
  dom_snippet: z.string().optional()
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const IssueSchema = z.object({
  id: z.string().uuid(),
  rule_id: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  bounding_box: z.any().optional(),
  screenshot_id: z.string().optional()
});
export type Issue = z.infer<typeof IssueSchema>;
