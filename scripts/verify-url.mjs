import { chromium } from '@playwright/test';
import axe from 'axe-core';

const baseUrl = (process.argv[2] ?? 'http://127.0.0.1:4173').replace(/\/$/, '');
const routes = ['/', '/demo', '/privacy', '/terms', '/missing'];
const isLocal = ['127.0.0.1', 'localhost'].includes(new URL(baseUrl).hostname);
const browser = await chromium.launch();

try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    for (const route of routes) {
      const page = await context.newPage();
      const errors = [];
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      if (!response) throw new Error(`${route}: no document response`);
      const expectedStatuses = route === '/missing' && !isLocal ? [404] : route === '/missing' ? [200, 404] : [200];
      if (!expectedStatuses.includes(response.status())) throw new Error(`${route}: expected HTTP ${expectedStatuses.join(' or ')}, received ${response.status()}`);
      const facts = await page.evaluate(() => ({
        title: document.title,
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        main: document.querySelectorAll('main').length,
        missingAlt: [...document.querySelectorAll('img')].filter(image => !image.hasAttribute('alt')).length,
        overflow: document.documentElement.scrollWidth - window.innerWidth
      }));
      if (!facts.title || facts.title.length > 60) throw new Error(`${route}: title is missing or over 60 characters`);
      if (facts.lang !== 'en' || facts.h1 !== 1 || facts.main !== 1 || facts.missingAlt !== 0 || facts.overflow > 0) {
        throw new Error(`${route}: structural check failed ${JSON.stringify(facts)}`);
      }
      await page.evaluate(axe.source);
      const violations = await page.evaluate(async () => {
        const results = await globalThis.axe.run();
        return results.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical');
      });
      if (violations.length) throw new Error(`${route}: axe violations ${JSON.stringify(violations.map(issue => issue.id))}`);
      const unexpectedErrors = route === '/missing'
        ? errors.filter(error => !error.includes('server responded with a status of 404'))
        : errors;
      if (unexpectedErrors.length) throw new Error(`${route}: browser errors ${JSON.stringify(unexpectedErrors)}`);
      console.log(`PASS ${viewport.width}px ${route} HTTP ${response.status()} — ${facts.title}`);
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}
