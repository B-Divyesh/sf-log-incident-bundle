# Repair 9 handoff — local release checks passed

**Work order:** `log-incident-bundle-repair-9`
**Base verifier report:** commit `05b6cf25ee876541930e45178c05915087e9bf2a`
**Failed candidate:** `e85a844e77dbb35e782230d9d672991985ab88fb`
**Repair commit:** `2125ddf7b1f4d378a70160665c412f079f9f43a7`

## Repair made

Repeated `--correlate` fields now keep their collected values keyed by the
field that supplied them. A `trace_id` is only compared with `trace_id` values,
and a `request_id` is only compared with `request_id` values. This prevents a
value collision between different fields from adding an unrelated out-of-window
record to a review copy.

The verifier's four-line reproduction was run before and after the repair.
Before the repair it reported `{"records":4,"sources":1}` and included
`event=wrong-cross-field-match`. The repaired CLI reports
`{"records":3,"sources":1}` and includes only the two legitimate correlated
records (`correct-trace-match` and `correct-request-match`).

Regression coverage was added in both layers:

- Rust unit test `correlation_values_do_not_cross_match_between_fields` asserts
  the exact collision fixture returns three records.
- Registered `@claim:bounds-correlation` browser/CLI test creates a real
  portable artifact from the same fixture and asserts the artifact excludes the
  unrelated row while retaining both legitimate field-specific matches.

## Local verification

Completed from a clean `npm ci` install:

- `npm test` — passed: 8 Rust tests, 38 Playwright tests, and the concurrent
  test-server lifecycle regression. This executes every registered claim,
  including privacy, local processing, file artifact search/CSV/provenance,
  redaction, keyboard, mobile, accessibility, and delivery-policy coverage.
- `npm run typecheck`, `npm run lint`, `npm run build`, and
  `npm audit --audit-level=high` — passed. Production output is `dist/site`:
  JavaScript 11.42 kB raw / 4.56 kB gzip and CSS 9.63 kB raw / 2.81 kB gzip.
- `cargo test --locked` — 8 passed; `cargo fmt --check` — passed;
  `cargo clippy --all-targets --all-features --locked -- -D warnings` — passed;
  `cargo build --release --locked` — passed.
- `cargo package --allow-dirty --locked` — passed; package contains 9 files,
  52.0 KiB unpacked / 16.8 KiB compressed. A fresh temporary consumer unpacked
  the crate, installed it with `cargo install --path ... --root ... --locked`,
  and successfully ran `--version`, `--help`, `--demo --json`, and the
  multi-field collision reproduction. Its generated file contained the two
  correct matches and no `wrong-cross-field-match` text.
- `npm run verify:url -- http://127.0.0.1:4173` — passed on `/`, `/demo`,
  `/privacy`, `/terms`, and the 404 route at both 1280 px and 390 px. It checks
  title, language, one h1/main, image alt text, console/page errors, overflow,
  and axe serious/critical violations.

The static companion site remains the original deployment class. It has no
backend, account, payment, AI, telemetry, service worker, or runtime network
dependency beyond its own static files. Backend rate-limit, authentication,
payment, AI-gateway, and service-worker update checks are not applicable.

## Deployment and remaining work

Push the repair and this handoff to `main`; the configured factory static
deployment consumes `dist/site`. Do not publish the Rust crate from this
worker: registry credentials remain with the factory. No known product gaps
remain from verifier report 13. Live deployment identity and live browser/header
checks will be recorded after the push.
