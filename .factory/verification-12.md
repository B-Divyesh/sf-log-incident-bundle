# Independent verification 12 — PASS

**Candidate:** `4fd1d3434fc3298c66e5772df79f77ed3cd64438`
**Live URL:** <https://log-incident-bundle.sociobot.in>
**Verified:** 2026-08-29
**Scope:** independent release QA against the researched brief and factory product contract. Product source was not changed.

## Verdict

**PASS.** The candidate performs the stated local-first CLI job: it turns a selected file or stdin into a finite, time-bounded, correlated, redacted, self-contained incident-review HTML artifact. Its companion site is a usable one-click sample sandbox, not an upload or hosted logging service. No release-blocking defects were found.

## Mandatory first-read and claims gate

Cold-opening the live home page answers all required questions in plain words:

- **What:** “Create a redacted log excerpt”; it reads a chosen file/stdin and writes one self-contained HTML review copy.
- **For whom:** “For teams who need answers without granting raw production-log access.”
- **What first:** the first-screen primary action is **Try it with sample data**, with “See a redacted incident review first.” beside it.

It passes the first-read test and exposes the required one-click demo.

`.factory/claims.json` is present. After `npm ci` from this checkout, every one of its 16 exact test commands was run separately through the product demo/test entry point and passed:

| Claim ID | Result |
| --- | --- |
| `portable-html` | PASS |
| `default-redaction` | PASS |
| `output-safety` | PASS |
| `cli-inputs` | PASS |
| `bounds-correlation` | PASS |
| `custom-redaction` | PASS |
| `local-processing` | PASS |
| `site-runtime` | PASS |
| `site-log-privacy` | PASS |
| `install-cli` | PASS |
| `csv-download` | PASS |
| `demo-cli` | PASS |
| `terminal-recording` | PASS |
| `finite-review` | PASS |
| `mit-license` | PASS |
| `delivery-policy` | PASS |

## Clean-checkout quality gates

All passed:

```text
npm ci
npm test                         # 7 Rust tests, 34 browser tests, lifecycle coverage
npm run typecheck
npm run lint
npm run build                    # creates dist/site
cargo test
cargo build --release
cargo fmt --check
cargo clippy --all-targets --all-features --locked -- -D warnings
cargo package --allow-dirty
npm run verify:url -- https://log-incident-bundle.sociobot.in
```

The URL verifier passed home, demo, privacy, terms, and a real HTTP 404 at both 1280px and 390px.

## End-to-end product checks

### CLI and package consumer

`cargo package` produced `log-incident-bundle-0.1.3.crate` (16,828 bytes). I unpacked that crate and installed it with `cargo install --path <unpacked-crate> --root <fresh-temp-root> --locked`.

- The installed binary supplies useful `--help` and reports `0.1.3`.
- `--demo --json` created a private temporary review artifact; the browser-visible artifact has six records.
- A normal bounded request against `examples/payment-api.log` with `--from`, `--to`, and `--correlate trace_id` generated a self-contained artifact. Opening it directly from `file:` made no network request, search reduced six rows to one, keyboard focus reached **Skip to review**, and axe reported no serious/critical violations.
- A stdin record generated a one-record artifact whose provenance names `stdin`.
- Recovery paths were clear and safe: an existing output failed with “refusing to overwrite existing output”; output equal to an input failed with “refusing to write … because it resolves to input”; inverted time bounds failed with “--from must be before or equal to --to”.

### Live demo, privacy, accessibility, and responsive use

Fresh Playwright contexts visited `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms`; all returned 200 and route-specific titles/h1s. The demo has the persistent “Demo — sample data, nothing is saved” banner, **Reset demo**, and **Start for real**. It displays six redacted records, filters to one for `stripe`, and downloads a CSV with header `timestamp,service,level,trace,text` and six data records.

The demo’s `localStorage` and `sessionStorage` were empty after use. Its full request log contained only same-origin **GET** requests to `https://log-incident-bundle.sociobot.in`; there were no external runtime calls, uploads, account affordances, console errors, or page errors. This confirms the local/privacy promise in the browser scope.

At desktop and 390px mobile there was no horizontal overflow (390px scroll/client/body widths each 390). The first keyboard Tab lands on the visible 3px focus-ring skip link; activating it moves focus to the page h1. Reduced-motion emulation reported no active animations. Axe 4.10.3 found **zero serious or critical** findings on the live demo. The verified page also has language, one h1, main landmark, route titles, and meaningful image handling; `verify-url.sh` independently checked those conditions and the 404 route.

## Deployment identity, headers, caching, and budgets

Fresh local `dist/site` was compared to the live bytes. SHA-256 matched exactly for `index.html`, `404.html`, `incident-press.webp`, `terminal-recording.svg`, `assets/index-7pnV-XJS.css`, and `assets/index-D-Yg0wRF.js`. This is fresh evidence that the deployment matches the requested candidate’s product build.

Live headers were appropriate: self-only CSP (including `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict-origin referrer policy, and HSTS. HTML uses `public, must-revalidate, max-age=30`; hashed JS and the WebP asset use `public, max-age=31536000, immutable`; `/missing` returns HTTP 404.

| Asset | Raw | gzip |
| --- | ---: | ---: |
| Initial JS | 11,335 B | 4,551 B |
| CSS | 9,497 B | 2,798 B |
| Hero WebP | 237,060 B | n/a (already compressed) |
| Self-hosted font files | 0 B | 0 B |

These are within the static-product 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB mobile-hero budgets.

## Applicability checks

This is neither a PWA nor a backend: no service worker, server-side API, persistence service, sign-in, account system, purchase flow, or AI feature exists. Service-worker update/offline-install, rate-limit/429, Entra tenant, payment, and backend-concurrency checks are therefore not applicable. The CLI’s generated artifact itself works directly as a `file:` page without runtime network access.

## Defects by severity

None found.
