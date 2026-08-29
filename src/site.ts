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

function shell(content: string) {
  return `<a class="skip" href="#main">Skip to content</a><header class="top"><a class="wordmark" href="/" data-route>LOG / INCIDENT<br><strong>BUNDLE</strong></a><nav aria-label="Primary"><a href="/demo" data-route>Demo</a><a href="/#how" data-route>How it works</a><a href="/privacy" data-route>Privacy</a></nav></header><div class="route-status" aria-live="polite"></div>${content}<footer><p>Bounded log excerpts for incident review.</p><p><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><span>Built by Param Factory · v0.1.1</span></p></footer>`;
}
function landing() {
  document.title = 'Log Incident Bundle — Create a redacted log excerpt';
  app.innerHTML = shell(`<main id="main" tabindex="-1"><section class="hero"><div class="hero-copy"><p class="eyebrow">A LOCAL CLI FOR INCIDENT REVIEW</p><h1>Create a redacted log excerpt</h1><p class="lede">For teams who need answers without granting raw production-log access.</p><p><a class="button" href="/demo" data-route>Try it with sample data</a> <span class="after-action">See a redacted incident review first.</span></p><ul class="facts"><li>Reads a file or standard input you choose.</li><li>Writes one self-contained HTML review copy.</li><li>MIT licensed. No account or purchase.</li></ul></div><figure><img src="/incident-press.webp" width="1200" height="800" fetchpriority="high" alt="A halftone server rack behind a clipped incident sheet." /><figcaption>A print-style view of the generated review copy.</figcaption></figure></section><section class="live-sheet" aria-labelledby="preview-heading"><div class="sheet-label">RECIPIENT VIEW · SAMPLE</div><h2 id="preview-heading">Search and export the review copy</h2>${terminal()}<p><a href="/demo" data-route>Open the working sample review →</a></p></section><section id="how" class="process" aria-labelledby="how-heading"><p class="eyebrow">THREE STEPS</p><h2 id="how-heading">Make an incident review copy</h2><ol><li><strong>Choose the time window.</strong><span>Read a file or standard input.</span></li><li><strong>Follow a request or trace.</strong><span>Pull matching records into the excerpt.</span></li><li><strong>Check redactions and share.</strong><span>Send one searchable HTML file.</span></li></ol></section><section class="limits" aria-labelledby="limits-heading"><h2 id="limits-heading">Use it for a finite review</h2><p>The CLI creates a review copy. It is not a live log service.</p><p>Redaction is pattern-based. Review the final file before sharing it.</p></section></main>`);
}
function terminal() { return `<div class="terminal" aria-label="Example command and result"><p><span>$</span> log-incident-bundle examples/payment-api.log <b>\\</b></p><p>&nbsp;&nbsp;--from 2026-08-22T14:01:00Z --to 2026-08-22T14:02:00Z <b>\\</b></p><p>&nbsp;&nbsp;--correlate trace_id --output checkout-review.html</p><p class="terminal-result">Wrote checkout-review.html with 6 records from 1 source.</p></div>`; }
function demo() {
  document.title = 'Demo — Log Incident Bundle';
  app.innerHTML = shell(`<div class="demo-banner" role="status">Demo — sample data, nothing is saved <span><button id="reset">Reset demo</button><a href="/" data-route>Start for real</a></span></div><main id="main" tabindex="-1" class="demo-main"><p class="eyebrow">CHECKOUT TIMEOUT · 22 AUG 2026 · SAMPLE</p><h1>Did the retry cause duplicate charges?</h1><p class="lede">Search the redacted excerpt. The full trace is included.</p><div class="review-tools"><label for="search">Search records</label><input id="search" type="search" placeholder="timeout, ledger, charge" autofocus><button id="download">Download CSV</button></div><p class="review-note">Redactions shown: email and bearer token. Review rules are listed in the CLI output.</p><div class="table-wrap"><table><caption>Six correlated records from payment-api.log</caption><thead><tr><th>Time</th><th>Service</th><th>Level</th><th>Record</th></tr></thead><tbody id="records"></tbody></table></div><section class="finding"><h2>Review cue</h2><p>The ledger confirmed one charge after the retry.</p><p>The final payment response reports <code>duplicate_charge=false</code>.</p></section></main>`);
  renderRecords();
  document.querySelector('#search')?.addEventListener('input', renderRecords);
  document.querySelector('#download')?.addEventListener('click', downloadCsv);
  document.querySelector('#reset')?.addEventListener('click', () => {
    localStorage.removeItem('demo:log-incident-bundle:active');
    route();
  });
}
function renderRecords() { const query = (document.querySelector<HTMLInputElement>('#search')?.value ?? '').toLowerCase(); const output = sample.filter(row => Object.values(row).join(' ').toLowerCase().includes(query)); const body = document.querySelector('#records'); if (body) body.innerHTML = output.length ? output.map(row => `<tr><td>${row.timestamp}</td><td>${row.service}</td><td><span class="level ${row.level.toLowerCase()}">${row.level}</span></td><td>${row.text}</td></tr>`).join('') : '<tr><td colspan="4">No sample records match. Clear the search to see all six records.</td></tr>'; }
function downloadCsv() { const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`; const csv = ['timestamp,service,level,trace,text', ...sample.map(row => [row.timestamp, row.service, row.level, row.trace, row.text].map(quote).join(','))].join('\n'); const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'checkout-timeout-sample.csv'; link.click(); URL.revokeObjectURL(link.href); }
function legal(kind: 'privacy' | 'terms') { const isPrivacy = kind === 'privacy'; document.title = `${isPrivacy ? 'Privacy' : 'Terms'} — Log Incident Bundle`; app.innerHTML = shell(`<main id="main" tabindex="-1" class="legal"><p class="eyebrow">${isPrivacy ? 'PRIVACY' : 'TERMS'}</p><h1>${isPrivacy ? 'No log upload or account' : 'Use the review copy carefully'}</h1>${isPrivacy ? '<p>The website has no log upload or account feature.</p><p>The demo uses six fixed sample records in memory. It writes no demo data to browser storage.</p><p>Site pages load runtime files only from this website.</p>' : '<p>This tool produces a review copy from material you choose. You are responsible for reviewing redactions before sharing it.</p><p>The software is available under the MIT License. There is no paid tier or purchase flow.</p><p>We provide the software as is. Do not use it to share data you cannot lawfully share.</p>'}</main>`); }
function notFound() { document.title = 'Page not found — Log Incident Bundle'; app.innerHTML = shell('<main id="main" tabindex="-1" class="not-found"><p class="eyebrow">404 · MISFILED PAGE</p><h1>This review copy is not here</h1><p>Use the home page to create or view an incident excerpt.</p><p><a class="button" href="/" data-route>Go to the home page</a></p></main>'); }
function route() {
  const path = location.pathname;
  if (path === '/' && !isDemo()) landing(); else if (isDemo()) demo(); else if (path === '/privacy') legal('privacy'); else if (path === '/terms') legal('terms'); else notFound();
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  });
  document.querySelector('.route-status')!.textContent = `Loaded ${document.title}`;
}
document.addEventListener('click', event => { const target = (event.target as Element).closest<HTMLAnchorElement>('a[data-route]'); if (!target || target.origin !== location.origin) return; event.preventDefault(); if (isDemo() && !target.pathname.startsWith('/demo')) localStorage.removeItem('demo:log-incident-bundle:active'); history.pushState({}, '', target.pathname + target.search); route(); window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); });
window.addEventListener('popstate', route);
route();
