# Polish-1 handoff — PASS

Repair commit: `d23b946fd713e2d6c8e3506a6be59b63f10fa231`
Deployed: https://log-incident-bundle.sociobot.in/?demo=1

## Delivered

- Corrected initial keyboard behavior: a fresh Tab reaches Skip to content;
  client-side route changes still focus their destination h1.
- Made `?demo=1` the first-screen, README, and catalog direct demo entry.
  It stays isolated in memory, shows the required banner, and offers reset and
  exit controls. `/demo` remains a direct alias.
- Replaced the bare HTTP 404 with the full product shell and complete metadata.
- Registered the landing-preview six-record claim location, rewrote the README
  deployment copy, added the verb-first catalog description, and refreshed the
  copy audit.

## Exact verification

Fresh clone: `/tmp/log-incident-bundle-clean.fOoa1t` at repair commit.

```text
npm ci
# Each exact claims.json command, independently:
npm test -- --grep @claim:portable-html
npm test -- --grep @claim:default-redaction
npm test -- --grep @claim:cli-inputs
npm test -- --grep @claim:bounds-correlation
npm test -- --grep @claim:custom-redaction
npm test -- --grep @claim:local-processing
npm test -- --grep @claim:site-runtime
npm test -- --grep @claim:site-log-privacy
npm test -- --grep @claim:csv-download
npm test -- --grep @claim:demo-cli
npm test -- --grep @claim:finite-review
npm test -- --grep @claim:mit-license
npm test -- --grep @claim:delivery-policy
npm test                         # 4 Rust + 27 Playwright tests
npm run typecheck
npm run lint
npm run build                    # dist/site
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
npm audit --audit-level=high     # 0 vulnerabilities
```

All commands passed. `./verify-url.sh http://127.0.0.1:4173` passed all five
routes at 1280px and 390px; Playwright axe checks found no serious or critical
issues. The demo’s request/storage claim is part of the clean-clone suite and
confirms same-origin GETs with empty localStorage, sessionStorage, IndexedDB,
and OPFS.

After deployment, `./verify-url.sh https://log-incident-bundle.sociobot.in`
reported the live HTTP 404 and passed every route at both widths.
`PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npx playwright test`
passed all 27 browser checks. Live asset hashes match the repair build:

```text
assets/index-HHTf3UXu.js  3357abd28bde8d889e24a24b517b6042f7bee71d7c8f8324d7d20cff71f8646c
assets/index-zD8wX4FC.css b29d0312f60009baa3e7f135974dff60693a1816ac112ee84f34b68162e97127
```

Lighthouse mobile against the live demo scored Performance 100, Accessibility
100, Best Practices 100, SEO 100; LCP 0.8s, CLS 0, TBT 20ms. See
`.factory/evidence/lighthouse-polish-1-live-demo.json`.

Evidence screenshots:

- `.factory/evidence/polish-1-live-demo-query-mobile.png`
- `.factory/evidence/polish-1-live-404.png`

Known gaps: none. The artifact remains a local CLI plus static companion site;
it intentionally has no service worker, account, paid unlock, upload, or
backend endpoint.
