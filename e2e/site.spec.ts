import { expect, test } from '@playwright/test';
import axe from 'axe-core';
import { execFileSync, spawnSync } from 'node:child_process';
import { link, lstat, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

function contrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

async function makeBundle(input: string, options: string[] = []) {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-e2e-'));
  const source = join(directory, 'incident.log');
  const output = join(directory, 'review.html');
  await writeFile(source, input);
  execFileSync('cargo', ['run', '--quiet', '--', source, '--output', output, ...options], { cwd: root, stdio: 'pipe' });
  return { output, url: pathToFileURL(output).href };
}

test('@claim:local-processing demo stays in memory and sends requests only to this origin', async ({ page, baseURL }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await expect(page.getByRole('status')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.getByRole('heading', { name: 'Did the retry cause duplicate charges?' })).toBeVisible();
  await page.getByLabel('Search records').fill('timeout');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#records tr')).toHaveCount(6);
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({});
  expect(await page.evaluate(() => ({ ...sessionStorage }))).toEqual({});
  expect(await page.evaluate(async () => (await indexedDB.databases()).map(database => database.name))).toEqual([]);
  expect(await page.evaluate(async () => {
    const root = await navigator.storage.getDirectory();
    const names: string[] = [];
    for await (const [name] of root.entries()) names.push(name);
    return names;
  })).toEqual([]);
  expect([...origins]).toEqual([new URL(baseURL!).origin]);
});

test('@claim:site-runtime site pages load runtime files only from this website', async ({ page, baseURL }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  for (const path of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
  expect([...origins]).toEqual([new URL(baseURL!).origin]);
});

test('@claim:site-log-privacy website has no log upload or account feature', async ({ page }) => {
  const methods: string[] = [];
  page.on('request', request => methods.push(request.method()));
  await page.goto('/');
  expect(await page.locator('input[type="file"], form').count()).toBe(0);
  await page.goto('/privacy');
  await expect(page.getByText('The website has no log upload or account feature.')).toBeVisible();
  expect(methods.every(method => method === 'GET')).toBe(true);
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

  const formulas = ['=1+1', '+1+1', '-1+1', '@SUM(A1)'];
  const adversarial = await makeBundle(formulas.join('\n'));
  await page.goto(adversarial.url);
  const adversarialDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  const formulaCsv = await readFile((await (await adversarialDownload).path())!, 'utf8');
  for (const formula of formulas) expect(formulaCsv).toContain(`,"'${formula}"`);
});

test('@claim:default-redaction generated bundles redact every named default category', async ({ page }) => {
  const input = '2026-08-22T14:01:01Z credential=ASIA1234567890ABCDEF authorization=Bearer short123 token="two word secret" password="correct horse battery staple" api_key=abc access_token=xy client_secret=clientSecretValue refresh_token=refreshTokenValue id_token=idTokenValue private_key=privateKeyValue authorization="Basic basicCredentialValue" session=sessionValue cookie=cookieValue oauth_client_secret=oauthSecretValue password_hash=passwordHashValue {"apiKey":"json-key-value","password":"json-password-value","access_token":"json-token-value","refreshToken":"jsonRefreshValue","email":"dev@example.com","aws":"AKIA1234567890ABCDEF"}';
  const bundle = await makeBundle(input);
  await page.goto(bundle.url);
  const body = await page.locator('body').innerText();
  const html = await readFile(bundle.output, 'utf8');
  for (const secret of ['ASIA1234567890ABCDEF', 'short123', 'two word secret', 'correct horse battery staple', 'abc', 'xy', 'clientSecretValue', 'refreshTokenValue', 'idTokenValue', 'privateKeyValue', 'basicCredentialValue', 'sessionValue', 'cookieValue', 'oauthSecretValue', 'passwordHashValue', 'json-key-value', 'json-password-value', 'json-token-value', 'jsonRefreshValue', 'dev@example.com', 'AKIA1234567890ABCDEF']) {
    expect(body).not.toContain(secret);
    expect(html).not.toContain(secret);
  }
  await expect(page.locator('#rows')).toContainText('[REDACTED:AWS ACCESS KEY ID]');
  await expect(page.locator('#rows')).toContainText('token=[REDACTED:SECRET FIELD]');
  await expect(page.locator('#rows tr')).toHaveCount(1);
});

test('@claim:output-safety CLI refuses output aliases and existing files without changing them', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-output-safety-'));
  const source = join(directory, 'incident.log');
  const original = '2026-08-22T14:01:01Z trace_id=safe status=ok\n';
  await writeFile(source, original);

  const direct = spawnSync('cargo', ['run', '--quiet', '--', source, '--output', source, '--json'], { cwd: root, encoding: 'utf8' });
  expect(direct.status).not.toBe(0);
  expect(direct.stderr).toContain('resolves to input');
  expect(await readFile(source, 'utf8')).toBe(original);

  const hardAlias = join(directory, 'hard-link.log');
  await link(source, hardAlias);
  const hardLinked = spawnSync('cargo', ['run', '--quiet', '--', source, '--output', hardAlias, '--json'], { cwd: root, encoding: 'utf8' });
  expect(hardLinked.status).not.toBe(0);
  expect(hardLinked.stderr).toContain('resolves to input');
  expect(await readFile(source, 'utf8')).toBe(original);

  const symbolicAlias = join(directory, 'symbolic-link.log');
  await symlink(source, symbolicAlias);
  const symbolic = spawnSync('cargo', ['run', '--quiet', '--', source, '--output', symbolicAlias, '--json'], { cwd: root, encoding: 'utf8' });
  expect(symbolic.status).not.toBe(0);
  expect(symbolic.stderr).toContain('resolves to input');
  expect(await readFile(source, 'utf8')).toBe(original);

  const existing = join(directory, 'existing.html');
  await writeFile(existing, 'keep this output');
  const overwrite = spawnSync('cargo', ['run', '--quiet', '--', source, '--output', existing, '--json'], { cwd: root, encoding: 'utf8' });
  expect(overwrite.status).not.toBe(0);
  expect(overwrite.stderr).toContain('refusing to overwrite existing output');
  expect(await readFile(existing, 'utf8')).toBe('keep this output');
});

test('@claim:cli-inputs CLI reads a chosen file or standard input', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-inputs-'));
  const source = join(directory, 'chosen.log');
  const fileOutput = join(directory, 'file-review.html');
  const stdinOutput = join(directory, 'stdin-review.html');
  const record = '2026-08-22T14:01:01Z trace_id=chosen status=ok\n';
  await writeFile(source, record);
  const fromFile = spawnSync('cargo', ['run', '--quiet', '--', source, '--output', fileOutput, '--json'], { cwd: root, encoding: 'utf8' });
  const fromStdin = spawnSync('cargo', ['run', '--quiet', '--', '--output', stdinOutput, '--json'], { cwd: root, encoding: 'utf8', input: record });
  expect(fromFile.status).toBe(0);
  expect(fromStdin.status).toBe(0);
  expect(JSON.parse(fromFile.stdout).records).toBe(1);
  expect(JSON.parse(fromStdin.stdout).records).toBe(1);
  expect(await readFile(fileOutput, 'utf8')).toContain('chosen.log');
  expect(await readFile(stdinOutput, 'utf8')).toContain('stdin');
});

test('@claim:bounds-correlation CLI applies time bounds and follows matching trace records', async () => {
  const sample = await readFile(join(root, 'examples/payment-api.log'), 'utf8');
  const bundle = await makeBundle(sample, ['--from', '2026-08-22T14:01:34Z', '--to', '2026-08-22T14:01:35Z', '--correlate', 'trace_id']);
  const html = await readFile(bundle.output, 'utf8');
  expect(JSON.parse(html.match(/<script id="bundle-data" type="application\/json">(.*?)<\/script>/s)![1]).records).toHaveLength(6);
  expect(html).not.toContain('healthcheck=ok');
});

test('@claim:custom-redaction CLI applies reviewable local regex rules', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-rules-'));
  const rules = join(directory, 'rules.txt');
  await writeFile(rules, 'customer id=customer_id=([A-Za-z0-9_-]+)\n');
  const bundle = await makeBundle('2026-08-22T14:01:01Z customer_id=cust_private_73 status=ok', ['--redact-file', rules]);
  const html = await readFile(bundle.output, 'utf8');
  expect(html).not.toContain('customer_id=cust_private_73');
  expect(html).not.toContain('cust_private_73');
  expect(html).toContain('[REDACTED:CUSTOMER ID]');
});

test('@claim:delivery-policy build config defines framing, caching, and real 404 policy', async () => {
  const config = JSON.parse(await readFile(join(root, 'public/staticwebapp.config.json'), 'utf8')) as {
    routes: Array<{ route: string; headers?: Record<string, string> }>;
    responseOverrides: Record<string, { rewrite: string }>;
    globalHeaders: Record<string, string>;
  };
  expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(config.globalHeaders['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  expect(config.routes.find(route => route.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
  expect(config.routes.filter(route => ['/demo', '/privacy', '/terms'].includes(route.route))).toHaveLength(3);
  expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
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
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'log-incident-bundle-demo-safety-'));
  const victim = join(temporaryRoot, 'victim.html');
  const legacySharedPath = join(temporaryRoot, 'log-incident-bundle-demo.html');
  await writeFile(victim, 'do not overwrite');
  await symlink(victim, legacySharedPath);
  const environment = { ...process.env, TMPDIR: temporaryRoot };
  const result = execFileSync('cargo', ['run', '--quiet', '--', '--demo', '--json'], { cwd: root, encoding: 'utf8', env: environment });
  const secondResult = execFileSync('cargo', ['run', '--quiet', '--', '--demo', '--json'], { cwd: root, encoding: 'utf8', env: environment });
  const demo = JSON.parse(result) as { output: string; records: number };
  const secondDemo = JSON.parse(secondResult) as { output: string; records: number };
  expect(demo.records).toBe(6);
  expect(demo.output).not.toBe(legacySharedPath);
  expect(secondDemo.output).not.toBe(demo.output);
  expect(await readFile(victim, 'utf8')).toBe('do not overwrite');
  expect((await lstat(dirname(demo.output))).mode & 0o777).toBe(0o700);
  await page.goto(pathToFileURL(demo.output).href);
  await expect(page.locator('#rows tr')).toHaveCount(6);
  await expect(page.locator('#rows')).not.toContainText('healthcheck=ok');
});

test('@claim:finite-review CLI creates a finite review copy, not a live service', async () => {
  const result = spawnSync('cargo', ['run', '--quiet', '--', '--demo', '--json'], { cwd: root, encoding: 'utf8', timeout: 30_000 });
  expect(result.status).toBe(0);
  expect(JSON.parse(result.stdout).records).toBe(6);
  const help = execFileSync('cargo', ['run', '--quiet', '--', '--help'], { cwd: root, encoding: 'utf8' });
  expect(help).not.toMatch(/--(?:listen|serve|tail|watch)\b/);
});

test('@claim:mit-license project is MIT licensed with no purchase flow', async ({ page }) => {
  expect(await readFile(join(root, 'LICENSE'), 'utf8')).toContain('MIT License');
  await page.goto('/');
  await expect(page.getByText('MIT licensed. No account or purchase.')).toBeVisible();
  expect(await page.locator('a[href*="checkout"]').count()).toBe(0);
  await page.goto('/terms');
  await expect(page.getByText('There is no paid tier or purchase flow.')).toBeVisible();
});

test('keyboard path reaches demo and filters records', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).press('Enter');
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByRole('status')).toContainText('Demo — sample data, nothing is saved');
  await page.getByLabel('Search records').fill('timeout');
  await expect(page.locator('#records tr')).toHaveCount(1);
});

test('fresh loads start keyboard navigation at the skip link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});

test('legal routes set page titles', async ({ page, baseURL }) => {
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Log Incident Bundle');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${new URL(baseURL!).origin}/privacy`);
  await expect(page.locator('main h1')).toHaveCount(1);
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Log Incident Bundle');
});

test('demo route sets its canonical URL', async ({ page, baseURL }) => {
  await page.goto('/demo');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${new URL(baseURL!).origin}/demo`);
});

test('query demo entry is isolated and uses demo metadata', async ({ page, baseURL }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Log Incident Bundle');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${new URL(baseURL!).origin}/demo`);
  await expect(page.getByRole('status')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('#records tr')).toHaveCount(6);
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({});
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

test('How it works keeps its hash and scrolls to the section', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect(page).toHaveURL(/\/#how$/);
  await expect.poll(() => page.locator('#how').evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(250);
});

test('zero-record CLI reviews explain how to recover', async ({ page }) => {
  const sample = await readFile(join(root, 'examples/payment-api.log'), 'utf8');
  const bundle = await makeBundle(sample, ['--from', '2099-01-01T00:00:00Z']);
  await page.goto(bundle.url);
  await expect(page.locator('#rows tr')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Widen or remove --from or --to, then generate a new review.');
});

test('route navigation moves focus to the new page heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
});

test('standalone 404 has the standard shell, metadata, and legal links', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Log Incident Bundle');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCount(1);
  await expect(page.getByRole('banner')).toContainText('LOG / INCIDENT');
  await expect(page.getByRole('contentinfo')).toContainText('Built by Param Factory');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Return to the Log Incident Bundle/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://log-incident-bundle.sociobot.in/404.html');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /incident-press-og\.webp$/);
  await expect(page.getByRole('link', { name: 'Privacy' }).last()).toHaveAttribute('href', '/privacy');
  await expect(page.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
});

test('demo has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(axe.source);
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

test('390px landing links and skip link meet touch size', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const sample = await page.getByRole('link', { name: 'Open the working sample review →' }).boundingBox();
  expect(sample!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Tab');
  const skip = await page.getByRole('link', { name: 'Skip to content' }).boundingBox();
  expect(skip!.height).toBeGreaterThanOrEqual(44);
});

test('demo banner keyboard focus has at least 3:1 adjacent contrast', async ({ page }) => {
  await page.goto('/demo');
  const reset = page.getByRole('button', { name: 'Reset demo' });
  await reset.focus();
  const colors = await reset.evaluate(element => ({
    outline: getComputedStyle(element).outlineColor,
    adjacent: getComputedStyle(element.closest('.demo-banner')!).backgroundColor
  }));
  expect(contrastRatio(colors.outline, colors.adjacent)).toBeGreaterThanOrEqual(3);
});

test('390px generated CLI artifact has no page-level overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const sample = await readFile(join(root, 'examples/payment-api.log'), 'utf8');
  const bundle = await makeBundle(sample, ['--from', '2026-08-22T14:01:00Z', '--to', '2026-08-22T14:02:00Z', '--correlate', 'trace_id']);
  await page.goto(bundle.url);
  await expect(page.locator('#sources code').last()).toHaveText(/^[a-f0-9]{64}$/);
  expect(await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))).toEqual({ viewport: 390, document: 390 });
});

test('demo loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
