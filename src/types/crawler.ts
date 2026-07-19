export interface PageData {
  url: string;
  pageType: 'homepage' | 'plp' | 'pdp' | 'service-homepage' | 'service-detail' | 'other';
  screenshot: Buffer; // 1920x1080 viewport screenshot
  dom: string;       // full HTML
  computedStyles: Record<string, string>[]; // styles for key elements
  title: string;
}

export interface CrawlResult {
  pages: PageData[];
  errors: string[];
}
