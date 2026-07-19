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

export const maxDuration = 300;
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
    
    if (false) { // MOCK DISABLED - NOW USING REAL ENGINE
      console.warn("Mock disabled.");
    } else {
      const browser = await chromium.connect({ 
        wsEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
        timeout: 10000 // Force throw after 10s instead of hanging infinitely
      });
      const context = await browser.newContext();
      const page = await context.newPage();
      
      for (const pageData of crawlResult.pages) {
        if (pageData.title === 'Mock Page') continue;
        await page.goto(pageData.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const detectedPage = await detectPage(page, pageData.url);
        const evidenceMap = new Map<string, any>(); 
        let issues = await ruleEngine.evaluateAllRulesForPage(detectedPage, evidenceMap);
        
        // Limit to 1 single issue for the MVP to strictly guarantee it stays under Vercel 60s limit
        issues = issues.slice(0, 1);
        
        // Enhance with AI and Capture Screenshots sequentially to avoid Playwright collisions
        const enrichedIssues = [];
        for (const issue of issues) {
          const rule = { id: issue.rule_id, version: '1', description: '', checks: [], required_evidence: [], ai_prompt_template: 'Analyze' };
          const aiExp = await generateExplanations([issue], rule, { actual: 'detected issue' });
          
          let screenshotUrl = '';
          try {
             if (issue.element) {
               // Inject a massive red bounding box around the element!
               await page.evaluate((selector) => {
                 const el = document.querySelector(selector);
                 if (el) {
                   el.style.border = '5px solid red';
                   el.style.boxShadow = '0 0 20px red';
                   el.scrollIntoView({ behavior: 'instant', block: 'center' });
                 }
               }, issue.element);
               
               // Brief wait to ensure scroll completes before screenshot
               await page.waitForTimeout(500);
               const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 60 });
               
               // Remove the border so it doesn't pollute the next screenshot
               await page.evaluate((selector) => {
                 const el = document.querySelector(selector);
                 if (el) {
                   el.style.border = 'none';
                   el.style.boxShadow = 'none';
                 }
               }, issue.element);
               
               // Upload screenshot to Supabase to prevent Redis Payload too large errors
               const { createClient } = await import('@supabase/supabase-js');
               const supabase = createClient(
                  process.env.NEXT_PUBLIC_SUPABASE_URL!,
                  process.env.SUPABASE_SERVICE_ROLE_KEY!
               );
               const fileName = `screenshots/audit-${jobId}-rule-${issue.rule_id}-${Date.now()}.jpg`;
               const { error: uploadErr } = await supabase.storage
                 .from('audits')
                 .upload(fileName, screenshotBuffer, { contentType: 'image/jpeg' });
                 
               if (!uploadErr) {
                 const { data } = supabase.storage.from('audits').getPublicUrl(fileName);
                 screenshotUrl = data.publicUrl;
               }
             }
          } catch (e) { console.error("Screenshot error", e); }

          enrichedIssues.push({ ...issue, pageType: pageData.pageType, ai: aiExp[0], evidence: { ...issue.evidence, screenshotUrl } });
        }
        
        allIssues.push(...enrichedIssues);
      }
      await browser.close();
    }
    
    // browser closed above
    
    job.progress = 60;
    await redis.set(`job:${jobId}`, job);

    let comps = job.competitorUrls;
    if (!comps || comps.length === 0) {
      // MVP: Skip real SERP discovery to save 20s of Serverless execution time
      console.warn("Skipping SERP competitor discovery to avoid Vercel timeout.");
      comps = [];
    }
    const missingFeatures = await compareWithCompetitors(allIssues, {}, []);
    
    await redis.set(`job:${jobId}:analyze`, { allIssues, missingFeatures });
    
    job.progress = 80;
    await redis.set(`job:${jobId}`, job);

    // Frontend orchestration drives the next step now
    return NextResponse.json({ success: true });
  } catch (error: any) {
    job.status = 'failed';
    await redis.set(`job:${jobId}`, job);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
