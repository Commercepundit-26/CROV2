import { NextResponse } from 'next/server';
import { redis } from '../../../../lib/redis';
import { AuditJob } from '../../../../types/job';
import { detectPage } from '../../../../engines/detector';
import { RuleEngine } from '../../../../engines/ruleEngine';
import { generateExplanations } from '../../../../engines/aiEngine';
import { discoverCompetitors } from '../../../../engines/competitorDiscovery';
import { compareWithCompetitors } from '../../../../engines/competitorComparison';
import { AIEnrichedIssue } from '../../../../engines/pptEngine';
import { chromium } from 'playwright';
import { Client } from '@upstash/qstash';

export const maxDuration = 60;
const qstashClient = new Client({ token: process.env.QSTASH_TOKEN || '', baseUrl: process.env.QSTASH_URL || 'https://qstash-us-east-1.upstash.io' });

export async function POST(req: Request) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

  const jobStr = await redis.get(`job:${jobId}`);
  const crawlStr = await redis.get(`job:${jobId}:crawl`);
  if (!jobStr || !crawlStr) return NextResponse.json({ error: 'Data not found' }, { status: 404 });
  
  const job = (typeof jobStr === 'string' ? JSON.parse(jobStr) : jobStr) as AuditJob;
  const crawlResult = (typeof crawlStr === 'string' ? JSON.parse(crawlStr) : crawlStr) as any;

  try {
    const ruleEngine = new RuleEngine();
    let allIssues: AIEnrichedIssue[] = [];
    
    if (true) { // FORCED MOCK FOR MVP DEMONSTRATION
      console.warn("Forcing mock DOM for analysis demonstration.");
      allIssues = [{
        id: 'mock-1',
        rule_id: 'R1',
        description: 'Mock issue',
        element: 'div',
        recommendation: 'Mock fix',
        pageType: 'homepage',
        ai: {
          title: 'Mock Issue',
          description: 'A mock issue because Browserless is disabled.',
          businessImpact: 'High',
          recommendation: 'Fix it',
          confidence: 90
        }
      }];
    } else {
      const browser = await chromium.connect({ wsEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      for (const pageData of crawlResult.pages) {
        if (pageData.title === 'Mock Page') continue;
        await page.goto(pageData.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const detectedPage = await detectPage(page, pageData.url);
        const evidenceMap = new Map<string, any>(); 
        const issues = await ruleEngine.evaluateAllRulesForPage(detectedPage, evidenceMap);
        
        const aiPromises = issues.map(async (issue: any) => {
          const rule = { id: issue.rule_id, version: '1', description: '', checks: [], required_evidence: [], ai_prompt_template: 'Analyze' };
          const aiExp = await generateExplanations([issue], rule, { actual: 'detected issue' });
          return { ...issue, pageType: pageData.pageType, ai: aiExp[0] };
        });
        const enrichedIssues = await Promise.all(aiPromises);
        allIssues.push(...enrichedIssues);
      }
      await browser.close();
    }
    
    // browser closed above
    
    job.progress = 60;
    await redis.set(`job:${jobId}`, job);

    let comps = job.competitorUrls;
    if (!comps || comps.length === 0) {
      const discovered = await discoverCompetitors(job.clientUrl);
      comps = discovered.map(c => c.url);
    }
    const missingFeatures = await compareWithCompetitors(allIssues, {}, []);
    
    await redis.set(`job:${jobId}:analyze`, { allIssues, missingFeatures });
    
    job.progress = 80;
    await redis.set(`job:${jobId}`, job);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    if (process.env.QSTASH_TOKEN) {
      await qstashClient.publishJSON({ url: `${baseUrl}/api/worker/generate`, body: { jobId } });
    } else {
      fetch(`${baseUrl}/api/worker/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }) }).catch(console.error);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    job.status = 'failed';
    await redis.set(`job:${jobId}`, job);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
