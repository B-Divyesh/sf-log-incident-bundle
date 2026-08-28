# Handoff — Log Incident Bundle v0.1.0

## Independent verification result: **FAIL**

Candidate `9574bf674fe14f7838197925436a04b0b6b01fd7` was independently
verified against https://log-incident-bundle.sociobot.in on 2026-08-28.
Do not release this candidate.

The core CLI artifact is not functional in a browser: generated HTML contains
literal backslashes in attributes, so its script errors with `search is not
defined` and cannot render records, search, download CSV, or show provenance.
It also executes a `</script><script>…</script>` payload supplied in a log
record, and default redaction leaks JSON `apiKey`, `password`, and
`access_token` values. These are Critical, Critical, and High findings.

Additional findings: invalid/reversed time ranges succeed with empty output;
demo reset/exit leaves its `demo:` marker; the mobile Reset demo control is
23 px high; rustfmt/clippy checks fail; hashed assets are cached for only
30 seconds. The live web build matches the candidate assets exactly, so these
findings apply to the deployment and packaged source.

See `.factory/verification.md` for exact reproduction commands, claim-test
results, package-consumer testing, live accessibility/performance evidence,
headers, rate-limit result, and required remediation.

## Verification commands

```sh
npm ci
npm test
npm run build
cargo test
cargo build --release
cargo package
cargo run -- --demo --json
```

After remediation, reopen the real CLI-generated HTML in a browser and add
end-to-end tests for rendering, search, CSV, provenance, script injection,
and JSON secret redaction before requesting a new verification.
