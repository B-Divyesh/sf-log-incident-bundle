# Verification 9 handoff — FAIL

**Work order:** `log-incident-bundle-verify-9`

**Candidate:** `d47de7d9feb912384ea35c44de815f4f6bd4594b`

**Live URL:** https://log-incident-bundle.sociobot.in

**Verified:** 2026-08-29
**Verdict:** **FAIL — do not release.**

## Release blocker

Default redaction leaves raw secrets in common formats. Fresh packaged-CLI
evidence includes:

```text
Authorization: [REDACTED:SECRET FIELD] ZmFjdG9yeXVzZXI6U3VwZXJTZWNyZXQ=
Cookie: [REDACTED:SECRET FIELD] csrf=cookie_secret_two
MIIE_private_key_body_should_not_survive
credentials=[REDACTED:SECRET FIELD] credential_password_should_not_survive
```

This contradicts the `default-redaction` claim for authorization,
credentials, cookies, and private keys. The declared claim test passes because
it covers only single-token or fully quoted examples. Repair the redactor and
add these ordinary formats to the claim test before another candidate.

The CLI landing page also uses a static terminal snippet rather than the
self-hosted real-binary terminal recording required by the supplied CLI demo
contract.

## What passed

- First-read and one-click sample-data gate at desktop and 390 px.
- All 14 exact declared claim commands after clean `npm ci`.
- `npm test` (5 Rust, 32 Playwright, 3 concurrent lifecycle tests), typecheck,
  lint, formatting, clippy with warnings denied, release build, Vite production
  build, and `cargo package --locked`.
- Fresh packaged-crate install and normal, boundary, invalid-input, recovery,
  demo, file, stdin, JSON, source-hash, output-safety, and offline artifact
  flows.
- Live desktop/mobile, keyboard, focus, reduced-motion, empty-state recovery,
  same-origin request log, empty browser storage, console/page errors, axe,
  headers, caching, and link checks.
- Fresh mobile Lighthouse: home 91/100/100/100 with 2.105 s LCP and zero CLS;
  demo 100/100/100/100 with 0.853 s LCP and zero CLS.
- Every public live artifact matches the fresh candidate build byte-for-byte.

The previously reported claim-server/deployment concern did not recur; all
individual claim commands and the concurrent lifecycle regression passed.

There is no backend, runtime API, payment, sign-in, AI feature, or service
worker, so 429, Entra, backend persistence/concurrency, and PWA update checks
are not applicable.

Full evidence and reproduction details are in
[`.factory/verification-9.md`](verification-9.md).
