import { crawlSite } from '../engines/crawler';
import { detectPage } from '../engines/detector';
import { RuleEngine } from '../engines/ruleEngine';
import { generateExplanations } from '../engines/aiEngine';
import { discoverCompetitors } from '../engines/competitorDiscovery';
import { compareWithCompetitors } from '../engines/competitorComparison';
import { generatePresentation, AuditResult, AIEnrichedIssue } from '../engines/pptEngine';
import { supabase } from './supabase';
import { chromium } from 'playwright';

export async function runAuditPipeline(jobId: string, clientUrl: string, competitorUrls: string[], customInstructions: string) {
  try {
    // 1. Update status to crawling
    await supabase.from('audit_jobs').update({ status: 'crawling' }).eq('id', jobId);

    // 2. Crawl Site
    const crawlResult = await crawlSite(clientUrl, { maxPages: 3 });
    
    // 3. Analyze / Detect Sections & Components
    await supabase.from('audit_jobs').update({ status: 'analyzing' }).eq('id', jobId);
    const ruleEngine = new RuleEngine();
    
    // For standalone detection, we'll need a browser instance to run evaluate
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    let allIssues: AIEnrichedIssue[] = [];
    
    for (const pageData of crawlResult.pages) {
      await page.goto(pageData.url);
      const detectedPage = await detectPage(page, pageData.url);
      
      const evidenceMap = new Map<string, any>(); // Empty evidence map for now
      const issues = await ruleEngine.evaluateAllRulesForPage(detectedPage, evidenceMap);
      
      // Save issues to DB (optional, simplified here)
      // Enhance with AI
      for (const issue of issues) {
        // Find dummy rule for now, in real app fetch actual Rule object
        const rule = { id: issue.rule_id, version: '1', description: '', checks: [], required_evidence: [], ai_prompt_template: 'Analyze {{actual}}' };
        const aiExp = await generateExplanations([issue], rule, { actual: 'dummy' });
        
        allIssues.push({
          ...issue,
          pageType: pageData.pageType,
          ai: aiExp[0]
        });
      }
    }
    
    await browser.close();

    // 4. Competitor Analysis
    let comps = competitorUrls;
    if (!comps || comps.length === 0) {
      const discovered = await discoverCompetitors(clientUrl);
      comps = discovered.map(c => c.url);
    }
    
    // Simulate competitor crawl and issues
    const compIssuesMap: Record<string, any[]> = {};
    for (const comp of comps) {
      compIssuesMap[comp] = []; // Empty for MVP
    }
    
    const missingFeatures = await compareWithCompetitors(allIssues, compIssuesMap, []);

    // 5. Generate PPT
    await supabase.from('audit_jobs').update({ status: 'generating' }).eq('id', jobId);
    
    const auditData: AuditResult = {
      clientUrl,
      issues: allIssues,
      missingFeatures,
      recommendations: ['Improve contrast on primary CTAs', 'Add trust badges to the footer']
    };
    
    const pptBuffer = await generatePresentation(auditData);
    
    // Upload PPT to Supabase Storage
    const fileName = `audit-${jobId}.pptx`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audits')
      .upload(fileName, pptBuffer, { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      
    let downloadUrl = '';
    if (!uploadError) {
      const { data } = supabase.storage.from('audits').getPublicUrl(fileName);
      downloadUrl = data.publicUrl;
    }

    // 6. Complete Job
    const resultJson = { downloadUrl, issuesCount: allIssues.length, missingFeaturesCount: missingFeatures.length };
    await supabase.from('audit_jobs').update({ status: 'completed', result_json: resultJson }).eq('id', jobId);
    
  } catch (error: any) {
    console.error('Audit pipeline failed:', error);
    await supabase.from('audit_jobs').update({ status: 'failed', result_json: { error: error.message } }).eq('id', jobId);
  }
}
