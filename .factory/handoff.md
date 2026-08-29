# Verification 14 handoff — PASS

**Candidate:** `9e07793f00c1a4f8187b7b5981f0afd8ef0855a9`
**Live URL:** <https://log-incident-bundle.sociobot.in>
**Verified:** 2026-08-29

## Result

**PASS.** Independent release QA found no defects. The live deployment exactly matches the candidate build. The repaired repeated-correlation behavior keeps values associated with their source field and no longer includes the previous unrelated out-of-window record.

## Evidence

- Fresh `npm ci`, all 20 independent commands in `.factory/claims.json`, and `npm test` passed (8 Rust tests, 38 browser tests, lifecycle regression).
- `npm run typecheck`, `npm run lint`, `npm run build`, `cargo test --locked`, `cargo fmt --check`, strict clippy, release build, `cargo package --locked`, and high-severity npm audit all passed.
- A crate unpacked from `cargo package` installed into a clean consumer root and passed normal, boundary, stdin/redaction, safe-failure, demo, and former multi-field collision cases.
- Live 38-test browser QA plus `npm run verify:url -- https://log-incident-bundle.sociobot.in` passed home, demo, privacy, terms, and a real 404 at desktop and 390px.
- Cold live first-read plainly explains what the tool does, who it is for, and offers the required one-click six-record demo. Request logs are same-origin GET-only; demo storage is empty; security and immutable-asset cache headers are present.
- Local/live SHA-256 values match for deploy-critical HTML, JS, CSS, hero art, and terminal recording. Fresh Lighthouse mobile: home 91 performance / 100 accessibility; demo 99 / 100.

See [verification-14.md](.factory/verification-14.md) for exact commands, all claim results, artifact behavior, headers, hashes, and performance metrics.

## Operations

Run `npm ci && npm test && npm run build` for the site and `cargo test --locked` for the CLI. Prepare the publishable crate with `cargo package --locked`; do not publish from this worker. This product is a local CLI plus static companion site, with no backend, account, payment, service worker, or AI endpoint.

**Known gaps / next steps:** none found. The factory may deploy the approved candidate; verification changed no product code.
