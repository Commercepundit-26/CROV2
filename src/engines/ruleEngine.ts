import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Rule } from '../types/rules';
import { Component, DetectedPage } from '../types/detector';
import { Issue } from '../lib/schemas';

// Simple mapping from component types to rule ids
const COMPONENT_RULE_MAP: Record<string, string> = {
  cta: 'hero.primary_cta',
  headline: 'hero.headline',
  image: 'hero.image',
  navigation: 'nav.structure',
  footer: 'nav.footer',
  'product-card': 'plp.product_card'
};

export class RuleEngine {
  private rules: Map<string, Rule> = new Map();

  constructor() {
    this.loadRules();
  }

  private loadRules() {
    const rulesDir = path.join(process.cwd(), 'knowledge', 'rules');
    if (!fs.existsSync(rulesDir)) return;

    const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(rulesDir, file), 'utf-8');
        const rule: Rule = yaml.parse(content);
        if (rule && rule.id) {
          this.rules.set(rule.id, rule);
        }
      } catch (err: any) {
        console.warn(`Failed to parse rule file ${file}: ${err.message}`);
      }
    }
  }

  public async evaluateComponent(component: Component, evidence: Record<string, any>): Promise<Issue[]> {
    const ruleId = COMPONENT_RULE_MAP[component.type];
    if (!ruleId) return [];

    const rule = this.rules.get(ruleId);
    if (!rule) return [];

    const issues: Issue[] = [];

    for (const check of rule.checks) {
      if (check.type === 'code') {
        try {
          // Safe(r) eval using new Function
          const contextKeys = Object.keys(evidence);
          const contextValues = Object.values(evidence);
          const evalFunc = new Function(...contextKeys, `return ${check.rule};`);
          const result = evalFunc(...contextValues);

          if (!result) {
            issues.push({
              id: crypto.randomUUID(),
              rule_id: rule.id,
              severity: check.severity,
              title: \`Check failed: \${check.id}\`,
              description: check.description,
              bounding_box: component.bbox
            });
          }
        } catch (err: any) {
          console.warn(\`Failed to evaluate rule \${check.id} for \${rule.id}: \${err.message}\`);
        }
      } else if (check.type === 'nlp') {
        // AI check handled elsewhere
        issues.push({
          id: crypto.randomUUID(),
          rule_id: rule.id,
          severity: check.severity,
          title: \`Needs AI analysis: \${check.id}\`,
          description: check.description,
          bounding_box: component.bbox
        });
      }
    }

    return issues;
  }

  public async evaluateAllRulesForPage(page: DetectedPage, evidenceMap: Map<string, any>): Promise<Issue[]> {
    const allIssues: Issue[] = [];
    
    for (const component of page.components) {
      const evidence = {
        component,
        // Mock properties matching what the rules might expect
        button: component,
        h1: component,
        img: component,
        card: component,
        getContrastRatio: (btn: any) => 5.0, // Mock for now
        ...evidenceMap.get(component.selector)
      };
      
      const componentIssues = await this.evaluateComponent(component, evidence);
      allIssues.push(...componentIssues);
    }
    
    return allIssues;
  }
}
