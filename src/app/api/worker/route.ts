import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis';
import { AuditJob } from '../../../types/job';
import { crawlSite } from '../../../engines/crawler';
import { detectPage } from '../../../engines/detector';
import { RuleEngine } from '../../../engines/ruleEngine';
import { generateExplanations } from '../../../engines/aiEngine';
import { discoverCompetitors } from '../../../engines/competitorDiscovery';
import { compareWithCompetitors } from '../../../engines/competitorComparison';
import { generatePresentation, AuditResult, AIEnrichedIssue } from '../../../engines/pptEngine';
import { supabase } from '../../../lib/supabase';
import { chromium } from 'playwright';

export const maxDuration = 60; // Max allowed for Vercel hobby

async function handler(req: Request) {
  const body = await req.json();
  const { jobId } = body;
  
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

  const jobStr = await redis.get(`job:${jobId}`);
  if (!jobStr) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  const job = (typeof jobStr === 'string' ? JSON.parse(jobStr) : jobStr) as AuditJob;

  try {
    job.status = 'running';
    job.progress = 10;
    await redis.set(`job:${jobId}`, job);

    // 1. Crawl
    const crawlResult = await crawlSite(job.clientUrl, { maxPages: 1 });
    job.progress = 30;
    await redis.set(`job:${jobId}`, job);

    // 2. Detect & Rules
    const ruleEngine = new RuleEngine();
    const browser = process.env.BROWSERLESS_API_KEY
      ? await chromium.connect({ wsEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` })
      : await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    let allIssues: AIEnrichedIssue[] = [];
    
    for (const pageData of crawlResult.pages) {
      await page.goto(pageData.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const detectedPage = await detectPage(page, pageData.url);
      const evidenceMap = new Map<string, any>(); 
      const issues = await ruleEngine.evaluateAllRulesForPage(detectedPage, evidenceMap);
      
      const aiPromises = issues.map(async (issue) => {
        const rule = { id: issue.rule_id, version: '1', description: '', checks: [], required_evidence: [], ai_prompt_template: 'Analyze' };
        const aiExp = await generateExplanations([issue], rule, { actual: 'detected issue' });
        return {
          ...issue,
          pageType: pageData.pageType,
          ai: aiExp[0]
        };
      });
      const enrichedIssues = await Promise.all(aiPromises);
      allIssues.push(...enrichedIssues);
    }
    await browser.close();
    
    job.progress = 60;
    await redis.set(`job:${jobId}`, job);

    // 3. Competitors
    let comps = job.competitorUrls;
    if (!comps || comps.length === 0) {
      const discovered = await discoverCompetitors(job.clientUrl);
      comps = discovered.map(c => c.url);
    }
    const missingFeatures = await compareWithCompetitors(allIssues, {}, []);
    
    job.progress = 80;
    await redis.set(`job:${jobId}`, job);

    // 4. Generate PPT
    const auditData: AuditResult = {
      clientUrl: job.clientUrl,
      issues: allIssues,
      missingFeatures,
      recommendations: ['Improve contrast on primary CTAs', 'Add trust badges to the footer']
    };
    
    const pptBuffer = await generatePresentation(auditData);
    
    // Upload to Supabase
    const fileName = `audit-${jobId}.pptx`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audits')
      .upload(fileName, pptBuffer, { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', upsert: true });
      
    let downloadUrl = '';
    if (!uploadError) {
      const { data } = supabase.storage.from('audits').getPublicUrl(fileName);
      downloadUrl = data.publicUrl;
    }

    // 5. Complete
    job.status = 'completed';
    job.progress = 100;
    job.result = { downloadUrl, issues: allIssues };
    await redis.set(`job:${jobId}`, job);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Worker error:', error);
    job.status = 'failed';
    job.result = { downloadUrl: '', issues: [] } as any; // Adding error to result type would be better
    await redis.set(`job:${jobId}`, job);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = handler;
