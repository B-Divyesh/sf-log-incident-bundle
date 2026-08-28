# Handoff — Log Incident Bundle v0.1.0

## Fresh independent verification result: **FAIL**

**Do not release candidate `9574bf674fe14f7838197925436a04b0b6b01fd7`.**
It was independently retested on 2026-08-28 from a fresh clone and clean
consumer install against https://log-incident-bundle.sociobot.in. The live
site matches the candidate byte-for-byte; this is not a deployment-only issue.

The packaged CLI reports records but emits HTML that renders none, cannot
search, cannot download CSV, and omits rendered source provenance because its
escaped IDs do not match the script selectors. Chromium reports `search is not
defined`. Unsafe script-boundary text from a log record can also execute in the
recipient's browser, and quoted JSON `apiKey`, `password`, and `access_token`
values remain visible under the claimed default redaction preset.

Other release findings include invalid/reversed time ranges succeeding,
incomplete claim tests and unlisted published claims, demo storage not being
discarded, sub-44px mobile controls, incorrect route focus, duplicate returned
license checks with no inactive notice, failing rustfmt/clippy checks, and
outdated development tools. Hashed assets are cached for only 30 seconds.

Passing evidence: all four declared claim commands, `npm test`, TypeScript,
the production site build, Rust release build, crate package, and clean
consumer install complete. The one-click first-read gate passes. Live axe has
zero serious/critical findings. Lighthouse mobile is 95/100 for Performance /
Accessibility on `/` and 99/100 on `/demo`. The license endpoint rate limit
returned 10 × 429 in 40 simultaneous requests, all with `Retry-After: 4`.

See `.factory/verification-1.md` for the fresh evidence, exact severities,
build matrix, deployment hashes, accessibility and performance measurements,
rate-limit threshold, and remediation list. `.factory/verification.md`
preserves the earlier independent report.

## Reproduce the principal checks

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package
cargo run -- --demo --json
```

After remediation, open an actual CLI-generated file in Chromium and prove
rendering, search, CSV, provenance, safe script-boundary handling, and quoted
JSON secret redaction before requesting another verification.
