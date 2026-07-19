import OpenAI from 'openai';
import { z } from 'zod';
import { AIOutput } from '../types/ai';
import { Issue } from '../lib/schemas';
import { Rule } from '../types/rules';
import { config } from '../lib/config';

const AIOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  businessImpact: z.string(),
  recommendation: z.string(),
  confidence: z.number().min(0).max(100).default(80)
});

// Simple in-memory cache keyed by issue id and rule version
const cache = new Map<string, AIOutput>();

export async function generateIssueExplanation(issue: Issue, rule: Rule, evidence: Record<string, any>): Promise<AIOutput> {
  const cacheKey = \`\${issue.id}_\${rule.version}_\${JSON.stringify(evidence)}\`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY || process.env.OPENAI_API_KEY
  });

  // Replace simple placeholders based on evidence
  let promptText = rule.ai_prompt_template || '';
  
  // Basic string replacement for common placeholders
  for (const [key, value] of Object.entries(evidence)) {
    promptText = promptText.replace(new RegExp(\`{{\${key}}}\`, 'g'), String(value));
  }
  
  // In case of more complex templates (like failed_checks), we append the raw evidence as context.
  promptText += \`\n\nIssue Details: \${JSON.stringify(issue)}\`;
  promptText += \`\nEvidence Data: \${JSON.stringify(evidence)}\`;
  promptText += \`\n\nPlease output valid JSON adhering to the following schema: { title: string, description: string, businessImpact: string, recommendation: string, confidence: number }\`;

  const systemMessage = "You are a CRO expert for Commerce Pundit. Provide concise, evidence-backed explanations.";

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = AIOutputSchema.parse(JSON.parse(content));
    
    cache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    // Retry once with a simpler prompt
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { 
            role: "user", 
            content: \`Please provide a simple JSON explanation for this issue based on rule \${rule.id}. Ensure fields match: title, description, businessImpact, recommendation, confidence.\n\n\${promptText}\` 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });
      const content = response.choices[0]?.message?.content || '{}';
      const parsed = AIOutputSchema.parse(JSON.parse(content));
      
      cache.set(cacheKey, parsed);
      return parsed;
    } catch (retryError) {
      // Fallback
      const fallback: AIOutput = {
        title: \`Issue detected for \${rule.id}\`,
        description: \`An issue was flagged but AI analysis failed.\`,
        businessImpact: \`Needs manual review to determine impact.\`,
        recommendation: \`Investigate component for compliance with rule \${rule.id}.\`,
        confidence: 0
      };
      
      cache.set(cacheKey, fallback);
      return fallback;
    }
  }
}

export async function generateExplanations(issues: Issue[], rule: Rule, evidence: Record<string, any>, concurrency: number = 1): Promise<AIOutput[]> {
  const results: AIOutput[] = [];
  
  // Sequential processing for cost control
  for (const issue of issues) {
    const result = await generateIssueExplanation(issue, rule, evidence);
    results.push(result);
  }
  
  return results;
}
