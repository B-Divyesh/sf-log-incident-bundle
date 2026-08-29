import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);

async function createBundle(args: string[] = []) {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-'));
  const input = join(directory, 'source-<script>.log');
  const output = join(directory, 'review.html');
  await writeFile(input, '2026-08-22T14:01:34Z trace_id=x payload=</script><script>window.__log_bundle_xss=1</script>\n2026-08-22T14:01:35Z trace_id=x gateway timeout\n');
  await run('cargo', ['run', '--quiet', '--', input, '--output', output, ...args], { cwd: process.cwd() });
  return { directory, output };
}

test('@claim:portable-html generated CLI bundle renders, searches, downloads CSV, and stays offline', async ({ page }) => {
  const bundle = await createBundle();
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(pathToFileURL(bundle.output).href);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#rows tr')).toHaveCount(2);
    await expect(page.locator('#sources')).toContainText('source-<script>.log');
    await page.getByLabel('Search evidence').fill('timeout');
    await expect(page.locator('#rows tr')).toHaveCount(1);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download CSV' }).click();
    const csvDownload = await download;
    const csv = await readFile((await csvDownload.path())!, 'utf8');
    expect(csv).toContain('gateway timeout');
    expect(requests).toEqual([pathToFileURL(bundle.output).href]);
    expect(errors).toEqual([]);
  } finally {
    await rm(bundle.directory, { recursive: true, force: true });
  }
});

test('generated CLI bundle keeps hostile title, question, source, and log text inert', async ({ page }) => {
  const payload = '</script><script>document.title="PWNED";window.__log_bundle_xss=1</script>';
  const bundle = await createBundle(['--title', payload, '--question', payload]);
  try {
    await page.goto(pathToFileURL(bundle.output).href);
    await expect(page.locator('#rows tr')).toHaveCount(2);
    await expect(page.locator('h1')).toContainText(payload);
    await expect(page.locator('header p').last()).toContainText(payload);
    await expect(page.locator('#rows')).toContainText('</script><script>window.__log_bundle_xss=1</script>');
    await expect(page.locator('#sources')).toContainText('source-<script>.log');
    await expect.poll(() => page.title()).not.toBe('PWNED');
    await expect(page.evaluate(() => (window as Window & { __log_bundle_xss?: number }).__log_bundle_xss)).resolves.toBeUndefined();
  } finally {
    await rm(bundle.directory, { recursive: true, force: true });
  }
});

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

test('demo reset and exit leave no demo storage marker and route focus reaches the heading', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:log-incident-bundle:active'))).toBeNull();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('demo:log-incident-bundle:active'))).toBeNull();
});

test('mobile navigation and demo controls meet the 44px touch target baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const name of ['Reset demo', 'Start for real']) {
    const box = await page.getByRole(name === 'Reset demo' ? 'button' : 'link', { name }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  for (const name of ['Demo', 'How it works', 'Privacy']) {
    const box = await page.getByRole('navigation').getByRole('link', { name }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
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

test('demo loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
