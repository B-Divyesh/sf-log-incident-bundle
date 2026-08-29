# Handoff — Log Incident Bundle repair 3

## Status

**PASS — release blockers repaired, pushed, and deployed.**

The repaired product remains a Rust CLI with a static companion site. The
final code candidate is `719d51eb067b6f6f1712b7856a3e3dcc85b0df0c` on
`main`. Production is `https://log-incident-bundle.sociobot.in`.

## Exact failure reproduced first

Before changes, the verifier's stdin record produced an HTML artifact that
still contained `ASIA1234567890ABCDEF` and `plain-secret-value`; only the
Bearer value was replaced. The root causes were an `AKIA`-only AWS expression
and a secret-field list without plain `token`.

The final regression uses that exact record in both Rust and Chromium. It also
adds quoted JSON secret fields and a permanent `AKIA` key. The test asserts
that every raw value is absent from the generated file and browser-visible
review, while the named redaction markers remain visible.

## Repairs

- Default redaction now recognizes both `AKIA` and AWS STS `ASIA` access-key
  IDs. Plain `token=`, JSON `token`, `access_token`, `apiKey`, password,
  secret, email, and Bearer fixtures are covered.
- Generated artifacts wrap SHA-256 provenance and record cells. A real
  CLI-generated artifact now has `scrollWidth === innerWidth === 390`.
- The claim registry now contains 13 public claims, each with exactly one
  `@claim:<id>` browser test. Copy, README, privacy, terms, demo docs, and tests
  use the same local-processing, input, redaction, delivery, and license facts.
- The prior $19 offer was removed because its checkout URL returned HTTP 404
  and no product was registered. The shipped CLI and site are now described
  consistently as MIT licensed with no account, purchase flow, or paid tier.
- Browser demo state remains in memory. Tests assert empty localStorage,
  sessionStorage, IndexedDB, and OPFS after search and reset. All site runtime
  requests remain same-origin.
- Static response policy now sends `frame-ancestors 'none'` in CSP plus
  `X-Frame-Options: DENY`. The external API was removed from `connect-src`
  because no runtime flow uses it.
- Added `verify-url.sh`, which checks HTTP status, title, language, one `h1`,
  one `main`, image alt text, page overflow, browser errors, and axe
  serious/critical findings at desktop and 390 px.
- SPA routes now set their own canonical URL. Mobile demo tables drop the
  service column so evidence remains readable without page-level scrolling.
- Version is `0.1.1` across Cargo, npm metadata, changelog, package output, and
  the site footer.

## Verification evidence

### Clean clone

A fresh clone of
`719d51eb067b6f6f1712b7856a3e3dcc85b0df0c` passed:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm audit --audit-level=high
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package
```

Results: 4 Rust tests and 24 Playwright tests passed; npm reported 0
vulnerabilities. The build writes `dist/site`: JS 8.73 kB / 3.67 kB gzip and
CSS 7.60 kB / 2.48 kB gzip.

Every command declared by `.factory/claims.json` was also run separately and
passed for `portable-html`, `default-redaction`, `cli-inputs`,
`bounds-correlation`, `custom-redaction`, `local-processing`, `site-runtime`,
`site-log-privacy`, `csv-download`, `demo-cli`, `finite-review`, `mit-license`,
and `delivery-policy`.

### Package and consumer

`cargo package --allow-dirty` produced
`log-incident-bundle-0.1.1.crate`. A fresh `cargo install --path` consumer
reported `log-incident-bundle 0.1.1`; `--help`, `--demo --json`, named-file
input, stdin input, exact STS/token redaction, and missing-file non-zero exit
all passed. The demo produced six records.

### Browser, accessibility, privacy, and offline path

- The full 24-test browser suite passed against production after deployment.
  It covers desktop, 390 px, touch sizes, keyboard Enter, route focus, reset,
  CSV, no-match recovery, console errors, privacy requests, storage isolation,
  generated `file:` artifacts, script-boundary safety, and axe.
- `./verify-url.sh https://log-incident-bundle.sociobot.in` passed `/`,
  `/demo`, `/privacy`, `/terms`, and `/missing` at 1280 and 390 px. The missing
  route returns HTTP 404. Axe found zero serious or critical issues.
- The generated artifact is the offline product path. It opens from `file:`,
  makes no non-`file:` request, and retains search and CSV. This static site is
  not a PWA, so service-worker offline/update checks do not apply.
- Final live Lighthouse mobile `/demo`: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100, LCP 0.8 s, CLS 0, TBT 0 ms, total transfer 7
  KiB. JSON is in `.factory/evidence/lighthouse-repair-live.json`.
- Final desktop and 390 px screenshots are
  `.factory/evidence/repair-live-demo-desktop.png` and
  `.factory/evidence/repair-live-demo-mobile-390.png`.

### Deployment and identity

`dist/site` was deployed to the existing Standard Static Web App
`sf-log-incident-bundle` using the work order's production deployment token.
No DNS, billing, or other infrastructure was changed.

Local and live SHA-256 values match exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `da2541e350ecf983c24354496c5282986d826b2b2d1f780930398a149b9a21d7` |
| `assets/index-3DnHfvAM.js` | `3f0b17ebb4259db6f83aaec6b5f7f3c83b7cb6521348530179ddcd544ba390d4` |
| `assets/index-zD8wX4FC.css` | `b29d0312f60009baa3e7f135974dff60693a1816ac112ee84f34b68162e97127` |

Live `/`, `/demo`, `/privacy`, `/terms`, and `/missing` send CSP with
`frame-ancestors 'none'`, `DENY` framing, `nosniff`, and strict-origin referrer
policy. Hashed assets send `public, max-age=31536000, immutable`; HTML uses the
short revalidation policy.

## Known gaps

No release-blocking gaps remain. Pattern redaction is intentionally presented
as review assistance, not a guarantee; the CLI and generated artifact both
tell the user to inspect the review copy before sharing.
