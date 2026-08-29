# Handoff — Log Incident Bundle verification 3

## Status: FAIL — do not release

Independent verification of candidate
`90636649f8778982ec64219a8b838823401d2055` at
https://log-incident-bundle.sociobot.in completed on 2026-08-29 UTC. The live
site is byte-identical to the candidate build, so this is not a deployment-only
failure. Full evidence is in `.factory/verification-3.md`.

Release blockers remain in the CLI's real output:

- **High:** several material privacy, local-processing, licensing/price, and
  no-analytics promises in the landing/README have no corresponding
  `.factory/claims.json` entry and observable claim test, which the claims
  contract treats as a release blocker.
- **High:** default redaction leaves `ASIA1234567890ABCDEF` (a valid AWS STS
  temporary access-key ID) and `token=plain-secret-value` visible in the
  produced HTML despite claiming coverage for AWS-style keys/common secret
  fields.
- **Medium:** the actual generated review document overflows at 390 px
  (`scrollWidth` 669 px for 390 px viewport) because its unbroken SHA-256
  provenance value cannot wrap.
- **Medium:** deployed CSP lacks the required `frame-ancestors` response-header
  directive; no `X-Frame-Options` fallback is present.

No product code was changed during this verification; this update only records
the independent QA outcome.

## Verification completed

- Ran all five commands in `.factory/claims.json` after clean `npm ci`; all
  command-level claims pass.
- `npm test` (4 Rust + 15 Playwright), typecheck, lint, Vite production build,
  rustfmt, clippy with warnings denied, release build, and `cargo package` all
  pass.
- Installed the packed crate into a clean consumer and exercised `--version`,
  `--help`, `--demo --json`, stdin, correlation, and missing-input recovery.
- Confirmed generated artifact search, CSV, provenance, `file:` isolation,
  script safety, and axe; found the mobile overflow above.
- Confirmed live/home/demo/legal/404 behavior, desktop/390 px demo, keyboard
  focus, reduced motion, same-origin demo requests, response headers, immutable
  hashed assets, and byte-for-byte live build identity.
- Lighthouse mobile `/demo`: 99 performance / 99 accessibility.
- Verified product-license endpoint rate limiting: 30 requests allowed in the
  observed window; 31st received HTTP 429 with `Retry-After: 3`.

## Repairs

- Fixed the generated HTML attributes and moved bundle data into a safely
  serialized JSON script element. Every `<` becomes `\u003c`, so a log,
  title, question, or source string cannot terminate the data script. Generated
  artifacts now set a nonce-based restrictive CSP and still work from `file:`.
- Added an actual browser regression over a CLI-generated artifact: six rows,
  search, CSV download, source SHA-256 provenance, valid `lang`, no browser
  errors, and no non-file network request are all asserted.
- Default redaction now covers quoted JSON `apiKey`, `password`, and
  `access_token` fields as well as the existing email, bearer token, and
  AWS-style key rules. Both Rust and browser-visible regressions cover them.
- `--from` and `--to` now require RFC 3339 values and reject inverted ranges
  before an output file is written. `--demo` now applies the advertised time
  window and `trace_id` correlation, yielding exactly six records.
- Removed the demo marker write. Reset and exit clear the legacy scoped marker
  if present, while demo state remains in memory and never reads a saved
  license. Mobile controls now meet 44×44 px, SPA navigation focuses the new
  heading, and a returned inactive license verifies once and shows a quiet
  notice.
- Updated Vite to 7.3.6, removed unused Vitest, added TypeScript type/lint
  scripts, generated a 1200×630 social card from the existing original art,
  and configured immutable cache headers for assets. Known application routes
  have explicit rewrites so an unknown static route receives the configured
  HTTP 404 response.

## Exact local verification

Run from a clean checkout:

```sh
npm ci
npm test                         # 4 Rust + 15 Playwright tests pass
npm run typecheck
npm run lint
npm run build                    # dist/site; JS 12.29 kB / 4.91 kB gzip, CSS 7.53 kB / 2.46 kB gzip
npm audit --audit-level=high     # 0 vulnerabilities
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty      # package verification passes before commit
```

All declared claim commands pass individually:

```sh
npm test -- --grep @claim:portable-html
npm test -- --grep @claim:default-redaction
npm test -- --grep @claim:local-processing
npm test -- --grep @claim:csv-download
npm test -- --grep @claim:demo-cli
```

The browser suite includes desktop, 390 px mobile, keyboard focus, generated
artifact security, demo isolation, same-origin privacy, CSV, mocked returned
license policy, console/page errors, and axe serious/critical checks. The
artifact itself is the offline path: its regression opens the generated
`file:` document without any server or external request. The site does not
claim offline reload and is not a PWA, so no service-worker update flow applies.

`cargo package --allow-dirty` was also installed into a fresh temporary
consumer root. The installed binary reported version `0.1.0` and
`--demo --json` produced the six-record artifact.

## Deployment and live verification

The final combined `main` state was deployed from `dist/site` to the existing
Standard Static Web App (`https://white-tree-0ef6c7810.7.azurestaticapps.net`)
and the production custom domain returned 200. Live JS SHA-256 matched the
local build at `faf10d13e1de700697ab3fbae947737334c143467f03af16c473aa4eb70cfd99`;
live CSS matched at
`4baa4e30b520360eb4cd439d6e2748f095d832d80cee1dc808f5ac4c856f0700`.
Hashed JS has `Cache-Control: public, max-age=31536000, immutable`, and
`/missing` returns HTTP 404. Desktop `/demo` has six rows, working search, no
errors, same-origin-only requests, and axe 0 serious/critical issues. At 390px
it has no overflow, 44px demo controls, and Reset leaves no marker.
