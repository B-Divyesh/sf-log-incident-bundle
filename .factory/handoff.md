# Handoff — Log Incident Bundle repair

## Status

Repaired the independent verifier findings against candidate
`9574bf674fe14f7838197925436a04b0b6b01fd7`. This is still the same product:
a Rust CLI and a static companion site. No infrastructure, DNS, billing, or
deployment configuration outside this repository was changed.

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

## Deploy and follow-up

Deploy class remains static. Push `main`; the factory deploys `dist/site` with
the checked-in Static Web Apps policy. After deployment, verify `/`, `/demo`,
`/privacy`, `/terms`, and a missing path; confirm hash identity, 404 status,
immutable asset caching, browser/axe checks, and the generated CLI artifact.

Known gap: live deployment evidence is not yet recorded in this commit; it
must be checked once the factory has deployed the pushed repair.
