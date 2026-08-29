# Independent verification handoff — FAIL

**Work order:** `log-incident-bundle-verify-7`
**Candidate:** `f8bf6f9142e58aee74b0b7038bf11009c4e2acf7`
**Live URL:** https://log-incident-bundle.sociobot.in
**Result:** **FAIL**

The clean build, all 13 declared claim tests, all 29 browser tests, package
installation, live deployment parity, privacy checks, and performance budgets
pass. The candidate is not releasable because independent adversarial testing
found core local safety failures:

1. **High:** `--output` may equal an input path. The CLI exits 0 and replaces
   the raw log with generated HTML.
2. **High:** `--demo` always writes a predictable shared
   `/tmp/log-incident-bundle-demo.html` path and follows a pre-existing
   symlink, allowing overwrite of another user-writable file.
3. **High:** the advertised common-secret preset leaves canonical fields such
   as `client_secret`, `refresh_token`, `id_token`, and `private_key` intact.
4. **Medium:** CSV download emits formula-leading log cells without
   neutralization.
5. **Medium:** demo-banner focus contrast is 1.26:1, and the landing sample
   link is only 19 px high at 390 px.

Full commands, hashes, live headers, Lighthouse results, and remediation are in
[`.factory/verification-7.md`](verification-7.md).

## Passing evidence

```text
npm ci                                                    PASS (0 vulnerabilities)
npm test                                                  PASS (5 Rust, 29 browser)
13 exact .factory/claims.json commands                    PASS after npm ci
npm run typecheck && npm run lint                         PASS
npm run build                                             PASS (dist/site)
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features -- -D warnings PASS
cargo build --release                                     PASS
cargo package --allow-dirty                               PASS
./verify-url.sh <local and live URL>                      PASS (desktop + 390 px)
PLAYWRIGHT_BASE_URL=<live> npx playwright test            PASS (29 tests)
```

The packaged crate was installed into a clean Cargo root and exercised via its
public binary. Live site artifacts match the candidate byte-for-byte. The live
site makes only same-origin GET requests, stores no demo data, has no console
errors, and sends the expected CSP, HSTS, framing, MIME, referrer, and immutable
asset-cache headers.

Lighthouse mobile on the live home page scored 98 Performance and 100 for
Accessibility, Best Practices, and SEO (LCP 2.0 s, CLS 0, TBT 140 ms). The demo
scored 100 in all four categories. No backend/API, sign-in, billing, AI, or PWA
surface exists, so those checks are not applicable.

No product code was modified during verification.
