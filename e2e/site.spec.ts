import { expect, test } from '@playwright/test';
import axe from 'axe-core';

test('@claim:local-processing demo sends no data off this origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await expect(page.getByRole('status')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Did the retry cause duplicate charges?' })).toBeVisible();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('@claim:csv-download demo downloads every sample record as CSV', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  const file = await download;
  expect(await file.suggestedFilename()).toBe('checkout-timeout-sample.csv');
  const path = await file.path();
  const csv = await (await import('node:fs/promises')).readFile(path!, 'utf8');
  expect(csv.split('\n')).toHaveLength(7);
  expect(csv).toContain('duplicate_charge=false');
});

test('keyboard path reaches demo and filters records', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).press('Enter');
  await page.getByLabel('Search records').fill('timeout');
  await expect(page.locator('#records tr')).toHaveCount(1);
});

test('legal routes set page titles', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Log Incident Bundle');
  await expect(page.locator('main h1')).toHaveCount(1);
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Log Incident Bundle');
});

test('demo has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/demo');
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const results = await (window as unknown as { axe: typeof axe }).axe.run();
    return results.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical');
  });
  expect(violations).toEqual([]);
});
