import { chromium, Page } from 'playwright';
import { PageData, CrawlResult } from '../types/crawler';

export async function crawlSite(url: string, options?: { maxPages?: number }): Promise<CrawlResult> {
  const maxPages = options?.maxPages || 5;
  const result: CrawlResult = { pages: [], errors: [] };
  const visited = new Set<string>();
  const queue: string[] = [url];
  const baseUrl = new URL(url).origin;

  if (!process.env.BROWSERLESS_API_KEY) {
    console.warn("BROWSERLESS_API_KEY is missing. Returning mock crawler data to prevent Vercel timeouts.");
    return {
      pages: [{
        url,
        pageType: 'homepage',
        screenshot: Buffer.from('mock_base64_image'),
        dom: '<html><body><h1>Mock DOM</h1><button style="color:white;background:white">Click Me</button></body></html>',
        computedStyles: [],
        title: 'Mock Page'
      }],
      errors: []
    };
  }

  const browser = await chromium.connect({ wsEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}` });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });
    
    while (queue.length > 0 && result.pages.length < maxPages) {
      const currentUrl = queue.shift();
      if (!currentUrl || visited.has(currentUrl)) continue;
      
      visited.add(currentUrl);
      
      const page = await context.newPage();
      try {
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const title = await page.title();
        const screenshot = await page.screenshot({ fullPage: false });
        const dom = await page.content();
        
        // Run classification logic inside the browser context
        const pageType = await page.evaluate((url) => {
          const lowerUrl = url.toLowerCase();
          const titleText = document.title.toLowerCase();
          const isDomainRoot = new URL(url).pathname === '/' || new URL(url).pathname === '/home';
          
          const hasProductBreadcrumb = Array.from(document.querySelectorAll('nav, .breadcrumb')).some(el => el.textContent?.toLowerCase().includes('product'));
          if (lowerUrl.includes('/product/') || hasProductBreadcrumb) return 'pdp';
          
          const hasProductGrid = document.querySelectorAll('.product-grid, [data-cro-product]').length > 0;
          if (lowerUrl.includes('/collection/') || lowerUrl.includes('/category/') || hasProductGrid) return 'plp';
          
          if (isDomainRoot) return 'homepage';
          
          const hasServicesList = document.querySelectorAll('.services-list, [data-cro-service-item]').length > 0;
          if (titleText.includes('services') || hasServicesList) return 'service-homepage';
          
          // Heuristic for service detail: long description with service keyword in title
          const mainText = document.querySelector('main')?.textContent || '';
          if (titleText.includes('service') && mainText.length > 500) return 'service-detail';
          
          return 'other';
        }, currentUrl);
        
        const pageData: PageData = {
          url: currentUrl,
          pageType: pageType as PageData['pageType'],
          screenshot,
          dom,
          computedStyles: [], // Empty for now as requested
          title
        };
        
        result.pages.push(pageData);
        
        // Find internal links
        const hrefs = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a'))
            .map(a => a.href)
            .filter(href => href && !href.startsWith('javascript:') && !href.startsWith('mailto:'));
        });
        
        for (const href of hrefs) {
          try {
            const parsedUrl = new URL(href);
            // Filter same domain, not anchor
            parsedUrl.hash = '';
            const normalizedHref = parsedUrl.toString();
            if (parsedUrl.origin === baseUrl && !visited.has(normalizedHref) && !queue.includes(normalizedHref)) {
              queue.push(normalizedHref);
            }
          } catch (e) {
            // Ignore invalid URLs
          }
        }
      } catch (err: any) {
        result.errors.push(`Failed to crawl ${currentUrl}: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } catch (err: any) {
    result.errors.push(`Browser error: ${err.message}`);
  } finally {
    await browser.close();
  }

  return result;
}

// To run manually:
// 1. Create a script e.g., run-crawler.ts
// 2. Import crawlSite and run it: crawlSite('https://example.com').then(console.log).catch(console.error)
// 3. Execute with ts-node: npx ts-node run-crawler.ts
