# Independent verification 3 — FAIL

**Candidate:** `90636649f8778982ec64219a8b838823401d2055`  
**Live URL:** https://log-incident-bundle.sociobot.in  
**Verified:** 2026-08-29 UTC from a clean checkout at that exact commit

## Decision

**FAIL — do not release.** The previous core rendering, script-boundary,
structured-JSON-redaction, bounds, demo-reset, touch-target, cache, and 404
defects are repaired. However, the CLI still makes a materially unsafe
redaction promise: default processing leaves a valid temporary AWS access-key
ID and a normal `token=` value in the review copy. The generated artifact also
causes document-level horizontal overflow at 390 px because its SHA-256
provenance value cannot wrap. This is the core CLI output, so the privacy and
mobile acceptance gates are not met.

The production files are byte-identical to the local candidate build. This is
not a deployment-only failure.

## Required first checks

`.factory/claims.json` exists and contains five claims. After normal clean
checkout installation (`npm ci`), every declared command was run before wider
QA and passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| `portable-html` | `npm test -- --grep @claim:portable-html` | Pass: actual `file:` artifact has six rows, search, CSV, and SHA-256 provenance. |
| `default-redaction` | `npm test -- --grep @claim:default-redaction` | Pass for its named JSON fixture. See the High finding below for missing AWS temporary-key coverage. |
| `local-processing` | `npm test -- --grep @claim:local-processing` | Pass: demo requests only its own origin. |
| `csv-download` | `npm test -- --grep @claim:csv-download` | Pass: download has header plus six sample records. |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | Pass: `--demo --json` produces the advertised six-record review. |

Cold live first read also passes. The first screen says what it does
(“Share a safe log excerpt”), for whom (teams avoiding raw production-log
access), and offers one-click **Try it with sample data**, explaining that it
opens a redacted incident review.

## Release-blocking defects

### High — published material claims remain unlisted and therefore unproved

The claims contract requires every visitor-relevant promise on the live page or
README to have a `.factory/claims.json` entry and a dedicated observable test.
The five entries leave several published claims unlisted, including:

- landing: “Runs on your computer,” “Free core CLI. $19 project license is
  optional,” and “It does not collect, retain, tail, or host your logs”;
- README: “It reads only the files or standard input you provide,” “The
  recipient can search records and download a CSV without needing the source
  logs,” “The static site has no analytics or third-party runtime scripts,”
  and “its sample state stays in memory and does not touch your saved data.”

Some overlap with the passing tests, but an overlap is not an entry with the
published claim and a dedicated test: `local-processing` is specifically only
“Demo log data stays on this device,” and `portable-html` does not assert the
CLI no-upload or licensing/price assertions. Under the supplied claims
contract, these are release-blocking until the copy is removed or each factual
promise is listed and tested from its appropriate demo/public surface.

### High — default redaction leaks AWS temporary access-key IDs and `token=` secrets

The landing/README claim that the default rules replace “AWS-style access
keys,” while the brief requires conservative reviewable redaction. A clean
consumer installation was given this one stdin record:

```text
2026-08-22T14:01:01Z credential=ASIA1234567890ABCDEF token=plain-secret-value authorization: Bearer abcdefghijklmnop
```

The produced `redaction-check.html` still contains both
`ASIA1234567890ABCDEF` and `plain-secret-value`; the Bearer value is redacted.
`ASIA` is the standard prefix for AWS STS temporary access-key IDs, so it is a
normal AWS access key, not an invented malformed boundary. The implementation
only matches `AKIA[0-9A-Z]{16}` and its common-secret-field list omits `token`.

This violates the published default-redaction claim in real use. It is
particularly serious for a product intended to let users share a supposedly
redacted production-log excerpt. The warning that redaction is not a guarantee
does not make an incomplete rule meet its explicit named coverage. Expand the
preset (at least `ASIA` alongside `AKIA`, and a deliberately chosen token-field
policy), then add these values to the `@claim:default-redaction` browser-visible
fixture.

### Medium — the generated CLI artifact overflows a 390 px viewport

The installed package's `--demo --json` artifact works functionally, but at a
390 px viewport Chromium reports `document.documentElement.scrollWidth = 669`
for `innerWidth = 390`. The offending element is the unbroken provenance
SHA-256 `<code>` value (617 px wide, right edge 669 px). The review table itself
fits; the source hash causes a page-level horizontal scroll. This fails the
mobile requirement for the real, shareable output artifact. Make the hash
break/wrap or put it in an intentional locally scrolling area without widening
the page, then add a 390 px CLI-artifact regression.

## Additional findings

### Medium — framing protection header is absent

Live `/`, `/demo`, `/privacy`, `/terms`, and `/missing` send a restrictive CSP,
but it has no `frame-ancestors` directive and the response sends no
`X-Frame-Options`. The site-structure contract requires `frame-ancestors` as a
response header. Add `frame-ancestors 'self'` (or a stricter documented policy)
to `staticwebapp.config.json` and verify it is deployed.

### Low — no `verify-url.sh` is in the repository

The accessibility work order asks for the worker's `verify-url.sh`; no such
file exists in this checkout. Equivalent live Playwright checks covered title,
language, main landmark, image alts, console/page errors, and axe. Supply the
script or document its replacement so the required QA command is reproducible.

## Passing local, package, and artifact checks

- `npm ci`: pass; 0 npm vulnerabilities reported.
- `npm test`: pass — 4 Rust unit tests and 15 Playwright tests.
- `npm run typecheck`, `npm run lint`, and exact `npm run build`: pass.
  Production output: JS 12,288 B / 4.91 kB gzip; CSS 7,534 B / 2.46 kB gzip.
- `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`,
  `cargo build --release`, and `cargo package`: pass.
- A fresh `cargo install --path target/package/log-incident-bundle-0.1.0`
  consumer reports version `0.1.0`; `--help`, `--demo --json`, stdin input,
  correlation, and missing-file failure all work. The missing-file case exits
  1 and does not create an output file.
- Correlation boundary: a one-record time window plus `--correlate trace_id`
  includes the linked later record, as designed.
- Generated `file:` artifact: six rows initially, one `timeout` search result,
  seven-line CSV, source SHA-256, no console/page errors, only its local
  `file:` request, and 0 serious/critical axe findings. The mobile-overflow
  exception above remains.
- Script-boundary and quoted-JSON redaction regressions in the suite pass.

## Live behavior, privacy, accessibility, delivery

- Local and live SHA-256 match for `index.html`, JS
  `faf10d13e1de700697ab3fbae947737334c143467f03af16c473aa4eb70cfd99`, CSS
  `4baa4e30b520360eb4cd439d6e2748f095d832d80cee1dc808f5ac4c856f0700`, and
  `incident-press.webp`
  (`adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180`).
- Live `/demo` has six records; search produces one `timeout` row, an explicit
  no-match recovery message, reset/exit clear the documented demo marker, and
  CSV contains the six sample records. `?demo=1` also enters the demo.
- Desktop and 390 px live demo have no horizontal overflow. The primary
  controls meet the 44 px target test. Keyboard Enter activates the focused
  sample-data link; focus is a visible `rgb(41, 101, 76) solid 3px` outline.
  SPA navigation focuses the new `<h1>`.
- On `/`, `/demo`, `/privacy`, `/terms`, and `/missing`, live pages have the
  expected title, `lang=en`, exactly one `<h1>`, and one `<main>`. Axe found
  **0 serious/critical** violations on each. There are no application
  console/page errors; the browser's expected resource-status message on the
  deliberate HTTP 404 is excluded.
- `prefers-reduced-motion: reduce` yields `animationName: none`.
- Playwright request logging throughout a fresh demo flow observed only
  `https://log-incident-bundle.sociobot.in`; no demo log data is sent to an
  external origin. The normal artifact requested only `file:`. No analytics or
  third-party runtime script was observed. The optional license verification is
  explicit and sends its token to `api.sociobot.in`, as documented.
- Live response headers provide HSTS, `nosniff`, strict-origin referrer policy,
  and CSP. HTML is `max-age=30`; hashed JS is
  `public, max-age=31536000, immutable`. `/missing` returns real HTTP 404.
  See the separate absent-framing finding above.
- Lighthouse 12.8.2 mobile, live `/demo`: Performance **99**,
  Accessibility **99**, LCP **0.9 s**, CLS **0**, TBT **100 ms**, and total
  transfer **9 KiB**.
- The Sociobot license endpoint returned 200 invalid for a bogus token.
  Sequential requests from one client hit HTTP 429 on the 31st request in the
  observed window (30 allowed); the 429 response included `Retry-After: 3` and
  `x-ratelimit-after: 3`. Rate-limit enforcement therefore passes. No sign-in
  flow exists, so Entra validation is not applicable.
- This is a static companion site plus CLI, not a PWA or backend. Service
  worker/offline-reload, server persistence/concurrency, and health endpoint
  checks do not apply. The portable generated artifact is the offline review
  path and was tested from `file:`.

## Required remediation before another verification

1. Fix the default redaction preset for AWS temporary IDs and decide/test a
   conservative `token` field policy. Extend the declared claim fixture so the
   browser-visible output proves every named category.
2. Fix 390 px page-level overflow in the generated HTML artifact and add a
   mobile artifact test.
3. Add `frame-ancestors` to live CSP response headers.
4. Provide the requested `verify-url.sh` or formally replace it with a
   repository script that reproduces the equivalent checks.
