import './site.css';

type Record = { timestamp: string; service: string; level: string; text: string; trace: string };
const sample: Record[] = [
  { timestamp: '14:01:02', service: 'payments', level: 'INFO', trace: 'tr_48f1', text: 'checkout started customer=[REDACTED:EMAIL]' },
  { timestamp: '14:01:04', service: 'payments', level: 'INFO', trace: 'tr_48f1', text: 'authorization=Bearer [REDACTED:BEARER TOKEN]' },
  { timestamp: '14:01:34', service: 'payments', level: 'WARN', trace: 'tr_48f1', text: 'gateway timeout after_ms=30000' },
  { timestamp: '14:01:35', service: 'payments', level: 'INFO', trace: 'tr_48f1', text: 'retry=1 idempotency_key=ik_8YqP2Lk' },
  { timestamp: '14:01:38', service: 'ledger', level: 'INFO', trace: 'tr_48f1', text: 'charge_id=ch_019 confirmed amount_cents=4900' },
  { timestamp: '14:01:39', service: 'payments', level: 'INFO', trace: 'tr_48f1', text: 'response=200 duplicate_charge=false' }
];
const app = document.querySelector<HTMLDivElement>('#app')!;
const isDemo = () => location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
function setMetadata(title: string, description: string, canonicalPath: string) {
  document.title = title;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = `${location.origin}${canonicalPath}`;
  const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (descriptionTag) descriptionTag.content = description;
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = title;
  const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  if (ogDescription) ogDescription.content = description;
}

function shell(content: string) {
  return `<a class="skip" href="#main">Skip to content</a><header class="top"><a class="wordmark" href="/" data-route>LOG / INCIDENT<br><strong>BUNDLE</strong></a><nav aria-label="Primary"><a href="/?demo=1" data-route>Demo</a><a href="/#install" data-route>Install</a><a href="/#how" data-route>How it works</a><a href="/privacy" data-route>Privacy</a></nav></header><div class="route-status" aria-live="polite"></div>${content}<footer><p>Bounded log excerpts for incident review.</p><p><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><span>Built by Param Factory · v0.1.3</span></p></footer>`;
}
function landing() {
  setMetadata('Log Incident Bundle — Create a redacted log excerpt', 'Create a bounded, redacted incident log review copy for a teammate.', '/');
  app.innerHTML = shell(`<main id="main" tabindex="-1"><section class="hero"><div class="hero-copy"><p class="eyebrow">A LOCAL CLI FOR INCIDENT REVIEW</p><h1>Create a redacted log excerpt</h1><p class="lede">For teams who need answers without granting raw production-log access.</p><p class="hero-actions"><a class="button" href="/?demo=1" data-route>Try it with sample data</a><a class="button secondary" href="/#install" data-route>Install the CLI</a> <span class="after-action">See a redacted incident review first.</span></p><ul class="facts"><li>Reads a file or standard input you choose.</li><li>Writes one self-contained HTML review copy.</li><li>MIT licensed. No account or purchase.</li></ul></div><figure><img src="/incident-press.webp" width="1200" height="800" fetchpriority="high" alt="A halftone server rack behind a clipped incident sheet." /><figcaption>A print-style view of the generated review copy.</figcaption></figure></section><section id="install" class="install" aria-labelledby="install-heading"><p class="eyebrow">GET THE CLI</p><h2 id="install-heading">Install the CLI</h2><p>Install from the source repository with stable Rust and Cargo.</p><div class="install-command"><code id="install-command">cargo install --git https://github.com/B-Divyesh/sf-log-incident-bundle.git --locked log-incident-bundle</code><button id="copy-install" type="button">Copy install command</button></div><output id="install-status" aria-live="polite"></output><p><a class="install-link" href="https://github.com/B-Divyesh/sf-log-incident-bundle" target="_blank" rel="noreferrer">Read the source on GitHub (opens in a new tab) ↗</a></p></section><section class="live-sheet" aria-labelledby="preview-heading"><div class="sheet-label">RECIPIENT VIEW · SAMPLE</div><h2 id="preview-heading">Search and export the review copy</h2>${terminalRecording()}<p><a class="sample-review-link" href="/?demo=1" data-route>Open the working sample review →</a></p></section><section id="how" class="process" aria-labelledby="how-heading"><p class="eyebrow">THREE STEPS</p><h2 id="how-heading">Make an incident review copy</h2><ol><li><strong>Choose the time window.</strong><span>Read a file or standard input.</span></li><li><strong>Follow a request or trace.</strong><span>Pull matching records into the excerpt.</span></li><li><strong>Check redactions and share.</strong><span>Send one searchable HTML file.</span></li></ol></section><section class="limits" aria-labelledby="limits-heading"><h2 id="limits-heading">Use it for a finite review</h2><p>The CLI creates a review copy. It is not a live log service.</p><p>Redaction is pattern-based. Review the final file before sharing it.</p></section></main>`);
  document.querySelector('#copy-install')?.addEventListener('click', copyInstallCommand);
}
async function copyInstallCommand() {
  const command = document.querySelector<HTMLElement>('#install-command')?.innerText ?? '';
  const status = document.querySelector<HTMLOutputElement>('#install-status');
  try {
    await navigator.clipboard.writeText(command);
    if (status) status.value = 'Install command copied.';
  } catch {
    const selection = window.getSelection();
    const commandElement = document.querySelector<HTMLElement>('#install-command');
    if (selection && commandElement) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(commandElement);
      selection.addRange(range);
    }
    if (status) status.value = 'Install command selected. Copy it with your browser command.';
  }
}
function terminalRecording() { return `<figure class="terminal-recording"><img src="/terminal-recording.svg" width="1120" height="250" alt="Terminal recording of the packaged Log Incident Bundle demo creating a six-record review in a private temporary folder."><figcaption>Recorded from the packaged <code>log-incident-bundle --demo</code> command.</figcaption><details><summary>Read the terminal transcript</summary><pre><code>$ log-incident-bundle --demo
Demo bundle written to $TMPDIR/log-incident-bundle-demo-&lt;unique&gt;/review.html</code></pre></details></figure>`; }
function demo() {
  setMetadata('Demo — Log Incident Bundle', 'Search a six-record redacted checkout incident review sample.', '/demo');
  app.innerHTML = shell(`<div class="demo-banner" role="status">Demo — sample data, nothing is saved <span><button id="reset">Reset demo</button><a href="/#install" data-route>Start for real</a></span></div><main id="main" tabindex="-1" class="demo-main"><p class="eyebrow">CHECKOUT TIMEOUT · 22 AUG 2026 · SAMPLE</p><h1>Did the retry cause duplicate charges?</h1><p class="lede">Search the redacted excerpt. The full trace is included.</p><div class="review-tools"><label for="search">Search records</label><input id="search" type="search" placeholder="timeout, ledger, charge" autofocus><button id="download">Download CSV</button></div><p class="review-note">Redactions shown: email and bearer token. Review rules are listed in the CLI output.</p><div class="table-wrap"><table><caption>Six correlated records from payment-api.log</caption><thead><tr><th>Time</th><th>Service</th><th>Level</th><th>Record</th></tr></thead><tbody id="records"></tbody></table></div><section class="finding"><h2>Review cue</h2><p>The ledger confirmed one charge after the retry.</p><p>The final payment response reports <code>duplicate_charge=false</code>.</p></section></main>`);
  renderRecords();
  document.querySelector('#search')?.addEventListener('input', renderRecords);
  document.querySelector('#download')?.addEventListener('click', downloadCsv);
  document.querySelector('#reset')?.addEventListener('click', () => {
    localStorage.removeItem('demo:log-incident-bundle:active');
    route();
  });
}
function renderRecords() { const query = (document.querySelector<HTMLInputElement>('#search')?.value ?? '').toLowerCase(); const output = sample.filter(row => Object.values(row).join(' ').toLowerCase().includes(query)); const body = document.querySelector('#records'); if (body) body.innerHTML = output.length ? output.map(row => `<tr><td>${row.timestamp}</td><td>${row.service}</td><td><span class="level ${row.level.toLowerCase()}">${row.level}</span></td><td>${row.text}</td></tr>`).join('') : '<tr><td colspan="4">No sample records match. Clear the search to see all six records.</td></tr>'; }
function downloadCsv() { const quote = (value: string | number) => { const cell = String(value); const safe = /^[=+\-@\t\r]/.test(cell) ? `'${cell}` : cell; return `"${safe.replaceAll('"', '""')}"`; }; const csv = ['timestamp,service,level,trace,text', ...sample.map(row => [row.timestamp, row.service, row.level, row.trace, row.text].map(quote).join(','))].join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'checkout-timeout-sample.csv'; link.click(); URL.revokeObjectURL(link.href); }
function legal(kind: 'privacy' | 'terms') { const isPrivacy = kind === 'privacy'; setMetadata(`${isPrivacy ? 'Privacy' : 'Terms'} — Log Incident Bundle`, isPrivacy ? 'Learn how the local CLI and browser demo handle incident log data.' : 'Read the terms for using Log Incident Bundle and sharing review copies.', `/${kind}`); app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal"><p class="eyebrow">${isPrivacy ? 'PRIVACY' : 'TERMS'}</p><h1>${isPrivacy ? 'No log upload or account' : 'Use the review copy carefully'}</h1>${isPrivacy ? '<p>The website has no log upload or account feature.</p><p>The demo uses six fixed sample records in memory. It writes no demo data to browser storage.</p><p>Site pages load runtime files only from this website.</p>' : '<p>This tool produces a review copy from material you choose. You are responsible for reviewing redactions before sharing it.</p><p>The software is available under the MIT License. There is no paid tier or purchase flow.</p><p>We provide the software as is. Do not use it to share data you cannot lawfully share.</p>'}</main>`); }
function notFound() { setMetadata('Page not found — Log Incident Bundle', 'Return to the Log Incident Bundle home page.', '/404.html'); app.innerHTML = shell('<main id="main" tabindex="-1" class="not-found"><p class="eyebrow">404 · MISFILED PAGE</p><h1>This review copy is not here</h1><p>Use the home page to create or view an incident excerpt.</p><p><a class="button" href="/" data-route>Go to the home page</a></p></main>'); }
function route(moveFocus = false) {
  const path = location.pathname;
  if (path === '/' && !isDemo()) landing(); else if (isDemo()) demo(); else if (path === '/privacy') legal('privacy'); else if (path === '/terms') legal('terms'); else notFound();
  if (moveFocus) requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  });
  document.querySelector('.route-status')!.textContent = `Loaded ${document.title}`;
  if (location.hash) requestAnimationFrame(() => document.querySelector<HTMLElement>(location.hash)?.scrollIntoView({ behavior: 'instant' }));
}
document.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLAnchorElement>('a[data-route]');
  if (!target || target.origin !== location.origin) return;
  event.preventDefault();
  const destination = new URL(target.href);
  if (destination.pathname === location.pathname && destination.search === location.search && destination.hash) {
    history.pushState({}, '', destination.pathname + destination.search + destination.hash);
    document.querySelector<HTMLElement>(destination.hash)?.scrollIntoView({ behavior: 'instant' });
    return;
  }
  if (isDemo() && !destination.searchParams.has('demo') && !destination.pathname.startsWith('/demo')) localStorage.removeItem('demo:log-incident-bundle:active');
  history.pushState({}, '', destination.pathname + destination.search + destination.hash);
  route(true);
  if (!destination.hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
});
window.addEventListener('popstate', () => route(true));
route();
