import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { Issue } from '../lib/schemas';
import { AIOutput } from '../types/ai';
import { MissingFeature } from './competitorComparison';

export interface AIEnrichedIssue extends Issue {
  ai: AIOutput;
  pageType?: string;
}

export interface AuditResult {
  clientUrl: string;
  issues: AIEnrichedIssue[];
  missingFeatures: MissingFeature[];
  recommendations: string[];
}

export async function generatePresentation(audit: AuditResult, templatePath?: string): Promise<Buffer> {
  const pptx = new PptxGenJS();
  
  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'CRO-X Platform';
  pptx.company = 'Commerce Pundit';
  pptx.title = `CRO Audit for ${audit.clientUrl}`;

  // Define Master Slide
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: '0A66C2' } } },
      { text: { text: 'Commerce Pundit CRO Audit', options: { x: 0.5, y: 0.1, w: 5, h: 0.3, color: 'FFFFFF', fontSize: 14, fontFace: 'Arial' } } }
    ],
    slideNumber: { x: 9.5, y: 5.2, color: '000000', fontSize: 10 }
  });

  // Title Slide
  const titleSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  titleSlide.addText('Conversion Rate Optimization Audit', { x: 1, y: 2, w: 8, h: 1, fontSize: 36, bold: true, color: '0A66C2', align: 'center' });
  titleSlide.addText(`Prepared for: ${audit.clientUrl}`, { x: 1, y: 3.5, w: 8, h: 0.5, fontSize: 20, color: '333333', align: 'center' });
  titleSlide.addText(`Date: ${new Date().toLocaleDateString()}`, { x: 1, y: 4, w: 8, h: 0.5, fontSize: 16, color: '666666', align: 'center' });

  // Group issues by pageType
  const issuesByPage: Record<string, AIEnrichedIssue[]> = {};
  for (const issue of audit.issues) {
    const pType = issue.pageType || 'General';
    if (!issuesByPage[pType]) issuesByPage[pType] = [];
    issuesByPage[pType].push(issue);
  }

  // Generate slides for each group
  for (const [pageType, issues] of Object.entries(issuesByPage)) {
    // Divider Slide
    const dividerSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    dividerSlide.addText(`${pageType.toUpperCase()} ISSUES`, { x: 1, y: 2.5, w: 8, h: 1, fontSize: 32, bold: true, color: '0A66C2', align: 'center' });

    // Issue Slides
    for (const issue of issues) {
      const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      // Left side text
      slide.addText(issue.ai?.title || issue.title, { x: 0.5, y: 0.8, w: 4.5, h: 0.6, fontSize: 20, bold: true, color: '0A66C2' });
      slide.addText(`Severity: ${issue.severity.toUpperCase()}`, { x: 0.5, y: 1.4, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: issue.severity === 'high' ? 'FF0000' : 'FFA500' });
      
      slide.addText('Description:', { x: 0.5, y: 1.8, w: 4.5, h: 0.3, fontSize: 12, bold: true });
      slide.addText(issue.ai?.description || issue.description, { x: 0.5, y: 2.1, w: 4.5, h: 0.8, fontSize: 11, valign: 'top' });
      
      slide.addText('Business Impact:', { x: 0.5, y: 3.0, w: 4.5, h: 0.3, fontSize: 12, bold: true });
      slide.addText(issue.ai?.businessImpact || 'N/A', { x: 0.5, y: 3.3, w: 4.5, h: 0.6, fontSize: 11, valign: 'top' });
      
      slide.addText('Recommendation:', { x: 0.5, y: 4.0, w: 4.5, h: 0.3, fontSize: 12, bold: true });
      slide.addText(issue.ai?.recommendation || 'Fix the issue.', { x: 0.5, y: 4.3, w: 4.5, h: 0.8, fontSize: 11, valign: 'top', color: '006600' });

      // Right side image
      if (issue.evidence?.screenshot) {
        // Assume screenshot is base64
        slide.addImage({ data: issue.evidence.screenshot, x: 5.2, y: 1.2, w: 4.5, h: 3.375, sizing: { type: 'contain', w: 4.5, h: 3.375 } });
      } else {
        slide.addShape(pptx.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.5, h: 3.375, fill: { color: 'F0F0F0' } });
        slide.addText('No screenshot available', { x: 5.2, y: 1.2, w: 4.5, h: 3.375, align: 'center', color: '999999' });
      }
    }
  }

  // Missing Features from Competitors
  if (audit.missingFeatures && audit.missingFeatures.length > 0) {
    const compDivider = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    compDivider.addText('COMPETITOR ANALYSIS', { x: 1, y: 2.5, w: 8, h: 1, fontSize: 32, bold: true, color: '0A66C2', align: 'center' });

    for (const feat of audit.missingFeatures) {
      const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      slide.addText(`Missing Feature: ${feat.ruleId}`, { x: 0.5, y: 0.8, w: 4.5, h: 0.6, fontSize: 20, bold: true, color: '0A66C2' });
      slide.addText(`Competitor: ${feat.competitorUrl}`, { x: 0.5, y: 1.4, w: 4.5, h: 0.4, fontSize: 14, italic: true });
      
      slide.addText(feat.evidence?.note || 'Competitor successfully implements this rule, providing a better user experience.', { x: 0.5, y: 2.0, w: 4.5, h: 1.5, fontSize: 12, valign: 'top' });

      if (feat.evidence?.screenshot) {
        slide.addImage({ data: feat.evidence.screenshot, x: 5.2, y: 1.2, w: 4.5, h: 3.375, sizing: { type: 'contain', w: 4.5, h: 3.375 } });
      } else {
        slide.addShape(pptx.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.5, h: 3.375, fill: { color: 'F0F0F0' } });
        slide.addText('Competitor screenshot pending', { x: 5.2, y: 1.2, w: 4.5, h: 3.375, align: 'center', color: '999999' });
      }
    }
  }

  // Overall Recommendations Slide
  if (audit.recommendations && audit.recommendations.length > 0) {
    const recSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    recSlide.addText('Overall Recommendations', { x: 0.5, y: 0.8, w: 9, h: 0.6, fontSize: 24, bold: true, color: '0A66C2' });
    
    // Formatting as bullet points
    const bullets = audit.recommendations.map(r => ({ text: r, options: { bullet: true } }));
    recSlide.addText(bullets, { x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 14, valign: 'top', margin: 10 });
  }

  // Generate buffer
  const bufferArray = await pptx.write({ outputType: 'nodebuffer' });
  return Buffer.from(bufferArray as any);
}

// --- Test helper ---
export async function testPptGeneration() {
  const sampleAudit: AuditResult = {
    clientUrl: 'https://example.com',
    issues: [
      {
        id: '123',
        rule_id: 'hero.primary_cta',
        severity: 'high',
        title: 'CTA Contrast Too Low',
        description: 'The contrast of the primary CTA is below 4.5.',
        pageType: 'homepage',
        ai: {
          title: 'Improve CTA Contrast',
          description: 'The CTA button has a low contrast ratio which makes it hard to see.',
          businessImpact: 'Users might miss the main action, reducing conversion rates.',
          recommendation: 'Change the button background to a darker color.',
          confidence: 90
        }
      }
    ],
    missingFeatures: [
      {
        ruleId: 'trust.testimonial',
        competitorUrl: 'https://competitor.com',
        evidence: { note: 'Competitor displays customer testimonials near CTA.' }
      }
    ],
    recommendations: [
      'Focus on improving accessibility for core CTAs.',
      'Add trust signals based on competitor analysis.'
    ]
  };

  const buffer = await generatePresentation(sampleAudit);
  const outPath = path.join(process.cwd(), 'sample_audit.pptx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved test presentation to ${outPath}`);
}
