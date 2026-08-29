# Independent verification 14 — PASS

**Candidate:** `9e07793f00c1a4f8187b7b5981f0afd8ef0855a9`
**Live URL:** <https://log-incident-bundle.sociobot.in>
**Verified:** 2026-08-29

## Verdict

**PASS.** This candidate delivers the researched job: a local CLI creates a bounded, redacted, searchable self-contained incident review copy with source-hash provenance, and the companion site provides an isolated one-click sample. Every mandatory claim, local gate, clean-consumer check, live browser check, and deployment-identity comparison passed. No product source was changed for this verification.

The previously reported repeated-`--correlate` cross-field disclosure is fixed. A clean packaged-consumer reproduction of the four-row collision returned three records, retained both legitimate matches, and excluded `wrong-cross-field-match`.

## Required first-read and claims gate

A new browser context opened the live page cold:

- **What:** “Create a redacted log excerpt.”
- **For whom:** “For teams who need answers without granting raw production-log access.”
- **First action:** **Try it with sample data**, with “See a redacted incident review first” beside it.

One click opened `/?demo=1`, immediately rendered six sample records, and showed the persistent **“Demo — sample data, nothing is saved”** banner. The initial live load had no console/page errors and made only five same-origin GETs (document, JS, CSS, WebP, terminal SVG).

`.factory/claims.json` is present. After fresh `npm ci`, every listed command was run independently, then repeated under fail-fast logging. Each reported one pass:

| Claim | Result | Claim | Result |
| --- | --- | --- | --- |
| `portable-html` | PASS | `default-redaction` | PASS |
| `output-safety` | PASS | `cli-inputs` | PASS |
| `bounds-correlation` | PASS | `custom-redaction` | PASS |
| `redaction-rule-provenance` | PASS | `local-processing` | PASS |
| `site-runtime` | PASS | `site-log-privacy` | PASS |
| `install-cli` | PASS | `csv-download` | PASS |
| `demo-search` | PASS | `demo-redaction-preview` | PASS |
| `demo-conclusion` | PASS | `demo-cli` | PASS |
| `terminal-recording` | PASS | `finite-review` | PASS |
| `mit-license` | PASS | `delivery-policy` | PASS |

## Clean-checkout and consumer evidence

All passed at the candidate commit:

```text
npm ci
npm test                         # 8 Rust tests, 38 Playwright tests, lifecycle regression
npm run typecheck
npm run lint
npm run build                    # dist/site
cargo test --locked              # 8 passed
cargo fmt --check
cargo clippy --all-targets --all-features --locked -- -D warnings
cargo build --release --locked
cargo package --locked           # 9 files, 52.0 KiB unpacked / 16.8 KiB compressed
npm audit --audit-level=high     # 0 vulnerabilities
```

The packaged crate was unpacked and installed into a fresh consumer root with `cargo install --path … --root … --locked`. Its public binary reported version `0.1.3` and useful `--help`/`--json`. Independent checks passed:

- Two `--demo --json` runs created distinct mode-700 directories.
- A normal multi-field bounded correlation returned exactly three records.
- An exact equal time boundary included its one record.
- stdin redacted the supplied email and bearer secret.
- Existing and input-alias output paths failed nonzero without modifying bytes.
- malformed RFC 3339 and inverted bounds failed nonzero with useful recovery text.

The self-contained `file:` artifact at 390px had no page overflow, searched three records to one and back, downloaded a four-line CSV with the expected header, made no non-`file:` request, logged no error, and had zero serious/critical axe findings.

## Live QA, privacy, accessibility, and delivery

Both live commands passed:

```text
PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test -- --skip-rust --skip-lifecycle
# 38 passed

npm run verify:url -- https://log-incident-bundle.sociobot.in
# /, /demo, /privacy, /terms, and HTTP 404 pass at 1280px and 390px
```

These cover demo search/reset/CSV, keyboard operation, route focus, mobile touch targets, overflow, reduced motion, console/page errors, and axe. Fresh manual checks found:

- First Tab focuses a visible 44px skip link with a 3px moss outline.
- Reset demo is 44px high with a 3px pale focus ring.
- At 390px, demo page overflow is zero; with reduced motion, scroll behavior is `auto` and there are zero running animations.
- After demo use, localStorage, sessionStorage, IndexedDB, and OPFS are empty.
- Claims’ Playwright request logs for home, demo, privacy, and terms contained only the product origin. There is no upload form, account UI, analytics, third-party runtime asset, API call, or non-GET request.

Live HTML sends HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict-origin referrer policy, and self-only CSP including `frame-ancestors 'none'`. HTML caches for 30 seconds; hashed JS/CSS and immutable media cache for one year.

## Deployment identity and performance

`origin/main` resolves to the candidate. Fresh local-production and live SHA-256 values matched:

| File | SHA-256 |
| --- | --- |
| `index.html` | `57abac6d6f3c5990be66437cb3c72cd55cb4362b990f7eae2b4d8a2917c0b079` |
| `404.html` | `d81bc3ed7811775a961f041b460806a67b2005eb35f63454abbd468b68f1fe41` |
| `assets/index-TSchd1I1.js` | `29e94791a01782c66bd4f54bf518e6401e757db4d30e6c9100a8bd9c3c56d4c4` |
| `assets/index-Da6OpOqP.css` | `b87950f9e63e6f167cc33b2f50df666bfda88157d50945a05aed91b557cb6ed1` |
| `incident-press.webp` | `adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180` |
| `terminal-recording.svg` | `f1a022baf020fd81d20a49d501ffcb90f266ef2d6fae6b264daa10646d37b8b2` |

Initial JS is 11,424 B raw / 4,580 B gzip; CSS 9,633 B raw / 2,819 B gzip; hero WebP 237,060 B. Each is within budget.

Fresh Lighthouse 13.4.1 mobile results:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 91 | 100 | 100 | 100 | 2.05 s | 0 | 356 ms |
| Demo | 99 | 100 | 100 | 100 | 0.92 s | 0 | 139 ms |

Lighthouse did not provide a field INP in this lab run; TBT is its available lab responsiveness metric. Both pages meet the stated Lighthouse and LCP thresholds.

## Applicability and defects

This is a static companion site plus local CLI. It has no service worker/PWA, backend endpoint, persistence service, account/sign-in, Sociobot unlock/payment, or AI feature. Service-worker update/offline, backend concurrency/persistence/429 allowance, Entra authority, unlock, and AI-gateway checks are not applicable. Generated artifacts work from `file:` without a network dependency.

**Defects by severity:** none found.
