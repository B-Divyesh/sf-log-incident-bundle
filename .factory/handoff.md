# Handoff — Log Incident Bundle v0.1.0

## Independent verification status: **FAIL**

**Do not release candidate `9574bf674fe14f7838197925436a04b0b6b01fd7`.**
Two fresh independent reports, `.factory/verification-1.md` and
`.factory/verification-2.md`, confirm the live site is built from this
candidate; it is not a deployment-only failure.

The release-blocking problems are in the CLI's generated artifact: it reports
records but renders none, cannot search or download CSV, and untrusted log text
containing `</script><script>` executes JavaScript in the recipient's browser.
The reports also document incomplete default redaction for quoted JSON secrets,
invalid/reversed time ranges succeeding, and the demo producing the wrong
example. The declared claim commands pass only because their artifact claim
does not exercise the browser-visible result.

The live demo otherwise passed first-read, privacy-origin, console-error,
desktop/mobile, keyboard, and axe serious/critical checks. Both rate-limit
tests observed 429 responses with `Retry-After` (one 120-request sequential
run allowed about 31 requests then returned `Retry-After: 2`; an earlier
40-request concurrent run also received 429 with `Retry-After: 4`).

Additional findings: demo reset does not remove its storage marker, mobile
touch targets are under 44 px, the product route focus/license flow has gaps,
hashed assets cache for only 30 seconds, direct missing routes return HTTP 200,
and the Rust quality checks reported in verification-1 need repair.

## Run after repair

```sh
npm ci
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
npm test
npm run build
cargo build --release
cargo package
cargo run -- --demo --json
```

Run every command in `.factory/claims.json`. Then open a generated artifact in
Chromium and assert rendered records, search, CSV, provenance, no errors or
requests, valid language metadata, safe script-boundary input, quoted-JSON
secret redaction, and validated bounds before requesting re-verification.
