import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

async function makeBundle(input: string, options: string[] = []) {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-e2e-'));
  const source = join(directory, 'incident.log');
  const output = join(directory, 'review.html');
  await writeFile(source, input);
  execFileSync('cargo', ['run', '--quiet', '--', source, '--output', output, ...options], { cwd: root, stdio: 'pipe' });
  return { output, url: pathToFileURL(output).href };
}

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

test('@claim:portable-html generated bundle renders, searches, exports, and shows provenance', async ({ page }) => {
  const sample = await readFile(join(root, 'examples/payment-api.log'), 'utf8');
  const bundle = await makeBundle(sample, ['--from', '2026-08-22T14:01:00Z', '--to', '2026-08-22T14:02:00Z', '--correlate', 'trace_id']);
  const errors: string[] = [];
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(bundle.url);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#rows tr')).toHaveCount(6);
  await expect(page.getByText('SHA-256')).toBeVisible();
  await page.getByLabel('Search evidence').fill('timeout');
  await expect(page.locator('#rows tr')).toHaveCount(1);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  const csvFile = await download;
  const csv = await readFile((await csvFile.path())!, 'utf8');
  expect(csv.split('\n')).toHaveLength(7);
  expect(csv).toContain('duplicate_charge=false');
  expect(errors).toEqual([]);
  expect(requests.filter(url => !url.startsWith('file:'))).toEqual([]);
});

test('@claim:default-redaction generated bundles redact quoted JSON secret fields', async ({ page }) => {
  const input = '2026-08-22T14:01:34Z {"apiKey":"json-key-value","password":"json-password-value","access_token":"json-token-value","email":"dev@example.com","aws":"AKIA1234567890ABCDEF"}';
  const bundle = await makeBundle(input);
  await page.goto(bundle.url);
  const body = await page.locator('body').innerText();
  for (const secret of ['json-key-value', 'json-password-value', 'json-token-value', 'dev@example.com', 'AKIA1234567890ABCDEF']) expect(body).not.toContain(secret);
  await expect(page.locator('#rows tr')).toHaveCount(1);
});

test('generated bundle keeps script-boundary content inert', async ({ page }) => {
  const payload = '</script><script>window.__qa_script_boundary=1</script>';
  const bundle = await makeBundle(`2026-08-22T14:01:34Z trace_id=x payload=${payload}`, ['--title', payload, '--question', payload]);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(bundle.url);
  await expect(page.locator('#rows tr')).toHaveCount(1);
  await expect(page.locator('#rows')).toContainText(payload);
  await expect(page).not.toHaveTitle('PWNED');
  expect(await page.evaluate(() => (window as unknown as { __qa_script_boundary?: number }).__qa_script_boundary)).toBeUndefined();
  expect(errors).toEqual([]);
});

test('CLI rejects invalid and inverted time bounds before creating output', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-bounds-'));
  const output = join(directory, 'should-not-exist.html');
  const invalid = spawnSync('cargo', ['run', '--quiet', '--', join(root, 'examples/payment-api.log'), '--from', 'not-a-timestamp', '--output', output], { cwd: root, encoding: 'utf8' });
  expect(invalid.status).not.toBe(0);
  expect(invalid.stderr).toContain('--from must be an RFC 3339 timestamp');
  const inverted = spawnSync('cargo', ['run', '--quiet', '--', join(root, 'examples/payment-api.log'), '--from', '2026-08-22T14:02:00Z', '--to', '2026-08-22T14:01:00Z', '--output', output], { cwd: root, encoding: 'utf8' });
  expect(inverted.status).not.toBe(0);
  expect(inverted.stderr).toContain('--from must be before or equal to --to');
  await expect(readFile(output, 'utf8')).rejects.toThrow();
});

test('@claim:demo-cli produces the advertised six-record correlated review', async ({ page }) => {
  const result = execFileSync('cargo', ['run', '--quiet', '--', '--demo', '--json'], { cwd: root, encoding: 'utf8' });
  const demo = JSON.parse(result) as { output: string; records: number };
  expect(demo.records).toBe(6);
  await page.goto(pathToFileURL(demo.output).href);
  await expect(page.locator('#rows tr')).toHaveCount(6);
  await expect(page.locator('#rows')).not.toContainText('healthcheck=ok');
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

test('demo reset and exit discard the demo namespace', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => localStorage.setItem('demo:log-incident-bundle:active', '1'));
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:log-incident-bundle:active'))).toBeNull();
  await page.evaluate(() => localStorage.setItem('demo:log-incident-bundle:active', '1'));
  await page.getByRole('link', { name: 'Start for real' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:log-incident-bundle:active'))).toBeNull();
});

test('route navigation moves focus to the new page heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('a returned inactive license verifies once and shows a notice', async ({ page }) => {
  let checks = 0;
  await page.route('https://api.sociobot.in/api/v1/products/log-incident-bundle/verify?license=inactive-token', async route => {
    checks += 1;
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await page.goto('/?license=inactive-token');
  await expect(page.locator('.license-notice')).toContainText('License no longer active');
  expect(checks).toBe(1);
  await expect(page).toHaveURL('/');
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

test('390px demo has no overflow and all primary controls meet touch size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const selector of ['.wordmark', 'nav a', '#reset', '.demo-banner a', '#download', 'footer a']) {
    const targets = page.locator(selector);
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box, `${selector} ${index} should be visible`).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('demo loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
