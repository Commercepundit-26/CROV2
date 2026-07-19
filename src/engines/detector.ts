import { Page } from 'playwright';
import { DetectedPage, Section, Component } from '../types/detector';

export function buildDetectionScript(): string {
  return `(() => {
    function getCssPath(el) {
      if (!(el instanceof Element)) return;
      var path = [];
      while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id) {
          selector += '#' + el.id;
          path.unshift(selector);
          break;
        } else {
          var sib = el, nth = 1;
          while (sib = sib.previousElementSibling) {
            if (sib.nodeName.toLowerCase() == selector) nth++;
          }
          if (nth != 1) selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
      }
      return path.join(" > ");
    }

    const sections = [];
    const components = [];

    // Detect Sections
    const sectionEls = Array.from(document.querySelectorAll('header, main, footer, nav, section, [data-cro-section]'));
    sectionEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent || '';
      let type = 'section';
      const tag = el.tagName.toLowerCase();

      if (tag === 'header' || el.querySelector('nav')) {
        type = 'header';
      } else if (tag === 'footer' || el.closest('footer')) {
        type = 'footer';
      } else if (el.querySelector('h1') && el.querySelector('button, a.btn')) {
        type = 'hero';
      } else if (text.toLowerCase().includes('testimonial') || el.querySelectorAll('blockquote').length > 0) {
        type = 'testimonials';
      } else if (el.querySelectorAll('.product-card, [data-cro-product]').length >= 2) {
        type = 'product-grid';
      } else if (el.hasAttribute('data-cro-section')) {
        type = el.getAttribute('data-cro-section');
      }

      sections.push({
        type,
        bbox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        selector: getCssPath(el)
      });
    });

    // Detect Components
    const componentEls = Array.from(document.querySelectorAll('button, a, h1, h2, h3, img, [data-cro-cta], [data-cro-product]'));
    componentEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      let type = 'component';
      const tag = el.tagName.toLowerCase();

      if (tag === 'button' || el.hasAttribute('data-cro-cta') || (tag === 'a' && el.classList.contains('btn'))) {
        type = 'cta';
      } else if (['h1', 'h2', 'h3'].includes(tag)) {
        type = 'headline';
      } else if (tag === 'img') {
        type = 'image';
      } else if (el.hasAttribute('data-cro-product')) {
        type = 'product-card';
      }

      const styles = window.getComputedStyle(el);
      const attributes = {
        text: el.textContent?.trim().substring(0, 200) || '',
        href: el.getAttribute('href') || '',
        src: el.getAttribute('src') || '',
        alt: el.getAttribute('alt') || '',
        'background-color': styles.backgroundColor,
        color: styles.color,
        'font-size': styles.fontSize
      };

      components.push({
        type,
        bbox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        selector: getCssPath(el),
        attributes
      });
    });

    return { sections, components };
  })()`;
}

export async function detectPage(page: Page, url: string): Promise<DetectedPage> {
  const result = await page.evaluate(buildDetectionScript());
  return {
    url,
    sections: result.sections,
    components: result.components
  };
}
