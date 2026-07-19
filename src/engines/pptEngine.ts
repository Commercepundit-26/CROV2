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

  const THEME = {
    primary: '1D9A78', // Teal
    secondary: '44546A', // Dark Blue/Gray
    accent: '8BC145', // Light Green
    bg: 'FFFFFF',
    text: '44546A',
    fontFace: 'Calibri Light',
    bodyFontFace: 'Calibri'
  };

  // Define Master Slide
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: THEME.bg },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: THEME.primary } } },
      { rect: { x: 0, y: 5.3, w: '100%', h: 0.3, fill: { color: THEME.secondary } } },
      { text: { text: 'UniformSport CRO Audit', options: { x: 0.5, y: 5.35, w: 3, h: 0.2, color: 'FFFFFF', fontSize: 10, fontFace: THEME.bodyFontFace } } },
      { text: { text: 'Generated dynamically by CRO-X', options: { x: 6.5, y: 5.35, w: 3, h: 0.2, color: 'FFFFFF', fontSize: 10, align: 'right', fontFace: THEME.bodyFontFace } } }
    ],
    slideNumber: { x: 9.5, y: 5.35, color: 'FFFFFF', fontSize: 10 }
  });

  // Title Slide
  const titleSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
  titleSlide.background = { color: THEME.primary };
  titleSlide.addText('CRO Audit & Optimization Strategy', { x: 1, y: 2, w: 8, h: 1, fontSize: 44, color: 'FFFFFF', bold: true, align: 'center', fontFace: THEME.fontFace });
  titleSlide.addText(audit.clientUrl, { x: 1, y: 3, w: 8, h: 0.5, fontSize: 24, color: 'E7E6E6', align: 'center', fontFace: THEME.bodyFontFace });
  titleSlide.addText(`Generated: ${new Date().toLocaleDateString()}`, { x: 1, y: 4, w: 8, h: 0.5, fontSize: 14, color: 'E7E6E6', align: 'center', fontFace: THEME.bodyFontFace });

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
    dividerSlide.addText(`${pageType.toUpperCase()} ISSUES`, { x: 1, y: 2.5, w: 8, h: 1, fontSize: 32, bold: true, color: THEME.primary, align: 'center', fontFace: THEME.fontFace });

    // Issue Slides
    for (let idx = 0; idx < issues.length; idx++) {
      const issue = issues[idx];
      const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      slide.addText(`Issue ${idx + 1}: ${issue.ai?.title || issue.title}`, { x: 0.5, y: 0.7, w: 9, h: 0.8, fontSize: 24, color: THEME.primary, bold: true, fontFace: THEME.fontFace });

      slide.addText('Observation', { x: 0.5, y: 1.6, w: 4.5, h: 0.3, fontSize: 16, color: THEME.secondary, bold: true, fontFace: THEME.fontFace });
      slide.addText(issue.ai?.description || 'Detected via automated heuristic check.', { x: 0.5, y: 2.0, w: 4.5, h: 1.2, fontSize: 14, color: THEME.text, fontFace: THEME.bodyFontFace, valign: 'top' });

      slide.addText('Recommendation', { x: 0.5, y: 3.4, w: 4.5, h: 0.3, fontSize: 16, color: THEME.accent, bold: true, fontFace: THEME.fontFace });
      slide.addText(issue.ai?.recommendation || 'Consider optimizing this element for better conversion.', { x: 0.5, y: 3.8, w: 4.5, h: 1.2, fontSize: 14, color: THEME.text, fontFace: THEME.bodyFontFace, valign: 'top' });

      // Right side image
      if (issue.evidence?.screenshot) {
        slide.addImage({ data: issue.evidence.screenshot, x: 5.2, y: 1.2, w: 4.5, h: 3.375, sizing: { type: 'contain', w: 4.5, h: 3.375 } });
      } else {
        slide.addShape(pptx.ShapeType.rect, { x: 5.2, y: 1.2, w: 4.5, h: 3.375, fill: { color: 'F0F0F0' } });
        slide.addText('No screenshot available', { x: 5.2, y: 1.2, w: 4.5, h: 3.375, align: 'center', color: '999999' });
      }
    }
  }

  // Missing Features from Competitors
  if (audit.missingFeatures && audit.missingFeatures.length > 0) {
    const compSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    compSlide.addText('Competitor Gap Analysis', { x: 0.5, y: 0.7, w: 9, h: 0.8, fontSize: 24, color: THEME.primary, bold: true, fontFace: THEME.fontFace });

    const tableData = [
      [{ text: 'Feature', options: { bold: true, color: 'FFFFFF', fill: THEME.secondary } },
       { text: 'Impact', options: { bold: true, color: 'FFFFFF', fill: THEME.secondary } },
       { text: 'Recommendation', options: { bold: true, color: 'FFFFFF', fill: THEME.secondary } }]
    ];
    
    for (const feat of audit.missingFeatures) {
      tableData.push([
        { text: feat.feature, options: { fontFace: THEME.bodyFontFace } },
        { text: feat.impact_score.toString(), options: { fontFace: THEME.bodyFontFace } },
        { text: feat.recommendation, options: { fontFace: THEME.bodyFontFace } }
      ] as any);
    }

    compSlide.addTable(tableData, {
      x: 0.5, y: 1.6, w: 9,
      color: THEME.text, border: { type: 'solid', pt: 1, color: 'E7E6E6' },
      fontSize: 12, rowH: 0.4
    });
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
