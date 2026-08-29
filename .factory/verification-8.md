# Independent verification 8 — FAIL

**Candidate:** `3bf6275361109bdeeaf2442d4899d52df0467590` (`main`)
**Verified:** 2026-08-29
**Live URL:** https://log-incident-bundle.sociobot.in
**Verdict:** **FAIL — release-blocking claim-test instability.**

## First read

Cold-loading the live home page at 1280px answered the required questions in
plain words. It says it will “Create a redacted log excerpt”, identifies “teams
who need answers without granting raw production-log access”, and offers a
visible one-click **Try it with sample data** action with the outcome “See a
redacted incident review first.” The action opens the six-record demo. This
first-read gate passes.

## Release blocker

All 14 commands in `.factory/claims.json` were run individually after `npm ci`
from this clean checkout, through their configured demo entry point. Three
required commands failed with `net::ERR_CONNECTION_REFUSED` while navigating to
the configured Playwright preview origin `http://127.0.0.1:4173`:

| Severity | Finding | Evidence |
| --- | --- | --- |
| High / release blocker | The exact required claim commands are not reliable when run individually. `@claim:local-processing`, `@claim:site-runtime`, and `@claim:csv-download` each failed before exercising their assertion because the local preview server refused the browser connection. The Playwright config uses a fixed preview URL with `reuseExistingServer: true`; repeated independent commands can therefore attach to an unavailable/stopping process. The claims contract explicitly makes any failing claim test a release blocker. | `npm test -- --grep @claim:local-processing` (failed at `e2e/site.spec.ts:33`); `...@claim:site-runtime` (failed at `site.spec.ts:55`); `...@claim:csv-download` (failed at `site.spec.ts:72`). |

This is a verification-harness/reliability defect, not evidence that the live
demo is broken: the full browser suite passed both locally and against the live
deployment. It is nevertheless a FAIL under the supplied acceptance contract
until each exact command is dependable from a clean clone.

## Claims execution

| Claim | Exact command result |
| --- | --- |
| `portable-html` | PASS |
| `default-redaction` | PASS |
| `output-safety` | PASS |
| `cli-inputs` | PASS |
| `bounds-correlation` | PASS |
| `custom-redaction` | PASS |
| `local-processing` | **FAIL** — connection refused |
| `site-runtime` | **FAIL** — connection refused |
| `site-log-privacy` | PASS |
| `csv-download` | **FAIL** — connection refused |
| `demo-cli` | PASS |
| `finite-review` | PASS |
| `mit-license` | PASS |
| `delivery-policy` | PASS |

The passing commands each ran the five Rust tests plus their one tagged browser
test. A full `npm test` then passed (5 Rust tests, 32 Playwright tests), as did
`PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test` (same 5
Rust tests and 32 live-browser tests). Those broader passes do not erase the
three exact-command failures above.

## Local build and CLI checks

- `npm ci`: PASS (22 packages; 0 vulnerabilities).
- `npm run typecheck`, `npm run lint`, `npm run build`: PASS. Production output
  is `dist/site`; JavaScript is 9,798 B (4.02 KB gzip) and CSS is 7,781 B
  (2.51 KB gzip), well below the static budgets.
- `cargo test`, `cargo fmt --check`, `cargo clippy --all-targets --all-features
  -- -D warnings`, `cargo build --release`, and `cargo package --allow-dirty`:
  PASS. The crate is 15 KB at `target/package/log-incident-bundle-0.1.2.crate`.
- Clean-consumer check: unpacked the crate, ran `cargo install --path …
  --root … --locked`, and exercised the installed `log-incident-bundle 0.1.2`.
  A bounded/correlated shipped-log workflow produced redacted HTML; stdin also
  produced a one-record redacted artifact. Invalid RFC 3339 input and inverted
  bounds correctly exited non-zero with actionable errors. No raw tested email
  or bearer secret appeared in the normal artifact.

## Live product QA

- Deployment identity: locally rebuilt `index.html`, JS, and CSS match the live
  files byte-for-byte. SHA-256: index
  `df4755f115e2910510f2945d5bbb1db3edaf8e87784eb9e07e3d631e744cc8a0`; JS
  `c25e07f1f364b9ee10badc9082e3d8d934b79fb09aba6ac1a41c5ab9f294e40b`; CSS
  `217b39d8b05c8ad1d73d25eb911a49a6d49203a87c597ed97898c2d6d689d08d`.
- `./verify-url.sh https://log-incident-bundle.sociobot.in`: PASS for `/`,
  `/demo`, `/privacy`, `/terms`, and a real `/missing` 404 at desktop and 390px.
- Browser QA at desktop and 390px, with reduced motion: one h1 per route, no
  horizontal overflow, no page errors or console errors on normal routes, and
  axe found zero serious or critical WCAG 2 A/AA violations. The expected HTTP
  404 document produces Chromium’s normal failed-resource console line.
- Keyboard-only smoke: the skip link is first and has a visible 3px focus ring;
  the primary action is operable with Enter; demo search, reset, and CSV
  download work. The demo began with six rows, showed the no-results recovery
  copy, Reset restored six rows, and CSV downloaded as
  `checkout-timeout-sample.csv` (513 B). With reduced motion the observed
  animation was `none`.
- Privacy: fresh contexts across home, demo, privacy, and terms made only
  same-origin **GET** requests. The demo’s localStorage and sessionStorage were
  empty after search/reset/download. No upload, sign-in, billing, AI, backend,
  service worker, or rate-limited endpoint exists, so account, 429, persistence,
  health, and PWA-update checks are not applicable.
- Headers/caching: HTML has 30-second revalidation; hashed JS/CSS have
  `public, max-age=31536000, immutable`. Live responses include HSTS,
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict-origin
  referrer policy, and self-only CSP with `frame-ancestors 'none'`.

## Required next step

Make the Playwright web-server lifecycle deterministic for independently run
claim commands, then rerun every exact `.factory/claims.json` command from a
fresh clone and replace this report only when all 14 pass.
