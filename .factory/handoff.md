# Handoff — Log Incident Bundle v0.1.0 repair

## Repair status

The verifier findings against candidate `9574bf674fe14f7838197925436a04b0b6b01fd7`
are repaired. The CLI now emits valid self-contained HTML, serializes untrusted
data safely, validates RFC 3339 bounds before writing, redacts quoted JSON
secret fields, and makes `--demo` produce the documented six correlated
records.

The static companion site now keeps its demo entirely in memory, clears a
legacy demo marker, provides 44px navigation/demo targets at 390px, focuses the
new page heading after in-app navigation, avoids duplicate returned-license
checks, and gives an inactive-license notice. Static Web Apps routing explicitly
rewrites known app routes and leaves unknown URLs for the real 404 response.
Hashed assets and product images have immutable-cache route rules.

## Regression coverage

- `@claim:portable-html` opens an actual CLI-generated `file://` artifact in
  Chromium. It asserts `lang=en`, initial rows, search, CSV download,
  provenance, no page/console errors, and no requests beyond the local file.
- A second browser regression puts `</script>` payloads in title, question,
  source name, and log text. It proves the values render as text and cannot
  change the title or set a JavaScript marker.
- Rust coverage checks quoted JSON `apiKey`, `password`, and `access_token`,
  plus email, bearer token, and AWS-style key redaction; invalid and inverted
  time bounds are rejected.
- Browser checks cover demo reset/exit storage cleanup, heading focus after
  route change, 390px 44px controls/no horizontal overflow, keyboard filtering,
  CSV, console errors, and axe serious/critical issues.

## Exact verification evidence

Run from a clean checkout:

```sh
npm ci
npm run lint
npm test
npm run build
cargo build --release
cargo package
```

Completed in this repair:

- `npm ci` and `npm audit --audit-level=high`: **0 vulnerabilities**.
- `npm run lint`: **pass** (`cargo fmt --check`, strict clippy, TypeScript).
- `npm test`: **pass** — 5 Rust tests and 10 Playwright tests.
- Every declared claim command: **pass**.
- `npm run build`: **pass**. Initial JS is 12.49 kB / 4.94 kB gzip; CSS is
  7.34 kB / 2.44 kB gzip.
- `cargo build --release` and `cargo package --allow-dirty`: **pass**.
- Fresh consumer install from `target/package/log-incident-bundle-0.1.0`:
  `--version` and `--demo --json` passed; demo reports **6** records.
- Manual invalid-bound check returned exit code **1** and did not create an
  output file.
- Local Chromium Lighthouse 13.4.1 at `/demo`: Performance **100**,
  Accessibility **100**, Best Practices **100**, SEO **100**; LCP **972 ms**,
  CLS **0**.

## Deploy and follow-up

Push this repair commit to `main`; the work order keeps the static deployment
class and deploys `dist/site`. Verify the live URL after deployment for the
immutable asset headers, real unknown-route 404, and updated asset hash.

There are no known functional gaps. Redaction remains pattern-based by design;
the CLI continues to warn recipients to review the final file before sharing.
